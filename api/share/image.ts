const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "[::1]",
  "metadata.google.internal",
  "metadata.google.internal.",
]);

const ALLOWED_EXTERNAL_IMAGE_HOSTS = new Set([
  "images.unsplash.com",
  "img.freepik.com",
  "img.magnific.com",
]);

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const PADDING = 36;
const MAX_IMAGE_REDIRECTS = 1;

function isPrivateIpv4(hostname: string): boolean {
  const parts = hostname.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part) || part < 0 || part > 255)) {
    return false;
  }
  if (parts[0] === 10) return true;
  if (parts[0] === 127) return true;
  if (parts[0] === 169 && parts[1] === 254) return true;
  if (parts[0] === 192 && parts[1] === 168) return true;
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return true;
  return false;
}

function isPrivateIpv6(hostname: string): boolean {
  const normalized = hostname.toLowerCase();
  if (normalized === "::1") return true;
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
  if (normalized.startsWith("fe80:")) return true;
  return false;
}

function normalizeHostname(hostname: string): string {
  return hostname.replace(/\.$/, "").toLowerCase();
}

function normalizeUrl(url: string): string {
  const parsed = new URL(url);
  parsed.hash = "";
  return parsed.toString();
}

function isAllowedProductImageUrl(url: string, supabaseUrl: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    if (parsed.username || parsed.password) return false;

    const hostname = normalizeHostname(parsed.hostname);
    if (BLOCKED_HOSTNAMES.has(hostname)) return false;
    if (isPrivateIpv4(hostname)) return false;
    if (hostname.includes(":") && isPrivateIpv6(hostname)) return false;

    const supabaseHost = normalizeHostname(new URL(supabaseUrl).hostname);
    if (hostname === supabaseHost) {
      return parsed.pathname.startsWith("/storage/v1/object/public/");
    }
    if (hostname.endsWith(".supabase.co")) {
      return parsed.pathname.startsWith("/storage/v1/object/public/");
    }
    return ALLOWED_EXTERNAL_IMAGE_HOSTS.has(hostname);
  } catch {
    return false;
  }
}

function resolveTrustedProductImageUrl(
  productImageUrl: string | null | undefined,
  requestedImageUrl: string | null | undefined,
  supabaseUrl: string,
): string | null {
  if (!productImageUrl || !isAllowedProductImageUrl(productImageUrl, supabaseUrl)) {
    return null;
  }
  if (!requestedImageUrl) {
    return productImageUrl;
  }
  if (!isAllowedProductImageUrl(requestedImageUrl, supabaseUrl)) {
    return productImageUrl;
  }
  return normalizeUrl(requestedImageUrl) === normalizeUrl(productImageUrl)
    ? productImageUrl
    : productImageUrl;
}

async function fetchAllowedProductImage(url: string, supabaseUrl: string): Promise<Response | null> {
  if (!isAllowedProductImageUrl(url, supabaseUrl)) {
    return null;
  }

  let currentUrl = url;
  for (let hop = 0; hop <= MAX_IMAGE_REDIRECTS; hop += 1) {
    const response = await fetch(currentUrl, {
      headers: { Accept: "image/*" },
      redirect: "manual",
    });

    if (response.status >= 300 && response.status < 400) {
      if (hop >= MAX_IMAGE_REDIRECTS) return null;
      const location = response.headers.get("location");
      if (!location) return null;
      const nextUrl = normalizeUrl(new URL(location, currentUrl).toString());
      if (!isAllowedProductImageUrl(nextUrl, supabaseUrl)) return null;
      currentUrl = nextUrl;
      continue;
    }

    if (!response.ok) return null;
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) return null;
    return response;
  }

  return null;
}

function getEnv(name: string, fallback = ""): string {
  return process.env[name] || fallback;
}

async function fetchProductImage(productId: string): Promise<string | null> {
  const supabaseUrl = getEnv("SUPABASE_URL", getEnv("VITE_SUPABASE_URL"));
  const supabaseAnonKey = getEnv("SUPABASE_ANON_KEY", getEnv("VITE_SUPABASE_ANON_KEY"));
  if (!supabaseUrl || !supabaseAnonKey) return null;

  const url = `${supabaseUrl}/rest/v1/products?id=eq.${encodeURIComponent(productId)}&select=main_image_url,available`;
  const response = await fetch(url, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) return null;
  const data = await response.json();
  const item = Array.isArray(data) ? data[0] : null;
  if (!item || item.available === false || !item.main_image_url) return null;
  return item.main_image_url as string;
}

async function buildOgImage(sourceBuffer: Buffer): Promise<Buffer | null> {
  try {
    const sharp = (await import("sharp")).default;
    const meta = await sharp(sourceBuffer).metadata();
    const srcW = meta.width || 800;
    const srcH = meta.height || 600;
    const maxW = OG_WIDTH - PADDING * 2;
    const maxH = OG_HEIGHT - PADDING * 2;
    const scale = Math.min(maxW / srcW, maxH / srcH);
    const resizedW = Math.max(1, Math.round(srcW * scale));
    const resizedH = Math.max(1, Math.round(srcH * scale));

    const resized = await sharp(sourceBuffer)
      .resize(resizedW, resizedH, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();

    const left = Math.round((OG_WIDTH - resizedW) / 2);
    const top = Math.round((OG_HEIGHT - resizedH) / 2);

    return sharp({
      create: {
        width: OG_WIDTH,
        height: OG_HEIGHT,
        channels: 3,
        background: { r: 250, g: 249, b: 247 },
      },
    })
      .composite([{ input: resized, left, top }])
      .jpeg({ quality: 85 })
      .toBuffer();
  } catch {
    return null;
  }
}

function sendImageResponse(res: ApiResponse, buffer: Buffer, contentType = "image/jpeg"): void {
  res.setHeader("Content-Type", contentType);
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800");
  res.status(200).send(buffer);
}

interface ApiRequest {
  query?: Record<string, string | string[] | undefined>;
}

interface ApiResponse {
  setHeader(name: string, value: string): void;
  status(code: number): { send(body: string | Buffer): void };
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  const productId = typeof req.query?.id === "string" ? req.query.id : "";
  const imageFromQuery = typeof req.query?.img === "string" ? req.query.img : "";

  if (!productId) {
    res.status(400).send("Missing product id");
    return;
  }

  const supabaseUrl = getEnv("SUPABASE_URL", getEnv("VITE_SUPABASE_URL"));
  if (!supabaseUrl) {
    res.status(500).send("Server misconfigured");
    return;
  }

  try {
    const productImageUrl = await fetchProductImage(productId);
    const imageUrl = resolveTrustedProductImageUrl(productImageUrl, imageFromQuery, supabaseUrl);
    if (!imageUrl) {
      res.status(404).send("Image not found");
      return;
    }

    const imageResponse = await fetchAllowedProductImage(imageUrl, supabaseUrl);
    if (!imageResponse) {
      res.status(404).send("Image not available");
      return;
    }

    const contentType = imageResponse.headers.get("content-type") ?? "image/jpeg";
    const sourceBuffer = Buffer.from(await imageResponse.arrayBuffer());
    const ogBuffer = await buildOgImage(sourceBuffer);
    if (ogBuffer) {
      sendImageResponse(res, ogBuffer);
      return;
    }

    sendImageResponse(
      res,
      sourceBuffer,
      contentType.startsWith("image/") ? contentType : "image/jpeg",
    );
  } catch {
    res.status(500).send("Unable to generate image");
  }
}

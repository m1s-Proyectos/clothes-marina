import {
  fetchAllowedProductImage,
  resolveTrustedProductImageUrl,
} from "./urlSafety";

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const PADDING = 36;

interface ApiRequest {
  query?: Record<string, string | string[] | undefined>;
}

interface ApiResponse {
  setHeader(name: string, value: string): void;
  status(code: number): { send(body: string | Buffer): void };
}

type SharpModule = typeof import("sharp");

function getEnv(name: string, fallback = ""): string {
  return process.env[name] || fallback;
}

async function loadSharp(): Promise<SharpModule["default"] | null> {
  try {
    const mod = await import("sharp");
    return mod.default;
  } catch {
    return null;
  }
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

async function buildOgImage(
  sharp: SharpModule["default"],
  sourceBuffer: Buffer,
): Promise<Buffer> {
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
}

function sendImageResponse(res: ApiResponse, buffer: Buffer, contentType = "image/jpeg"): void {
  res.setHeader("Content-Type", contentType);
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800");
  res.status(200).send(buffer);
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
    const arrayBuffer = await imageResponse.arrayBuffer();
    const sourceBuffer = Buffer.from(arrayBuffer);

    const sharp = await loadSharp();
    if (sharp) {
      try {
        const ogBuffer = await buildOgImage(sharp, sourceBuffer);
        sendImageResponse(res, ogBuffer);
        return;
      } catch {
        /* fall through to passthrough */
      }
    }

    sendImageResponse(res, sourceBuffer, contentType.startsWith("image/") ? contentType : "image/jpeg");
  } catch {
    res.status(500).send("Unable to generate image");
  }
}

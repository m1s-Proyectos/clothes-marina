const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "[::1]",
  "metadata.google.internal",
  "metadata.google.internal.",
]);

/** Explicit allowlist for catalog stock/CDN hosts used in product.main_image_url. */
export const ALLOWED_EXTERNAL_IMAGE_HOSTS = new Set([
  "images.unsplash.com",
  "img.freepik.com",
  "img.magnific.com",
]);

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

export function normalizeUrl(url: string): string {
  const parsed = new URL(url);
  parsed.hash = "";
  return parsed.toString();
}

export function isAllowedProductImageUrl(url: string, supabaseUrl: string): boolean {
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

export function resolveTrustedProductImageUrl(
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

export function isAllowedRemoteFetchUrl(url: string, supabaseUrl: string): boolean {
  return isAllowedProductImageUrl(url, supabaseUrl);
}

const MAX_IMAGE_REDIRECTS = 1;

/**
 * Fetches a product image from an allowlisted URL with at most one controlled redirect.
 * Both the initial URL and redirect target must pass isAllowedProductImageUrl.
 */
export async function fetchAllowedProductImage(
  url: string,
  supabaseUrl: string,
): Promise<Response | null> {
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
      if (hop >= MAX_IMAGE_REDIRECTS) {
        return null;
      }

      const location = response.headers.get("location");
      if (!location) {
        return null;
      }

      const nextUrl = normalizeUrl(new URL(location, currentUrl).toString());
      if (!isAllowedProductImageUrl(nextUrl, supabaseUrl)) {
        return null;
      }

      currentUrl = nextUrl;
      continue;
    }

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) {
      return null;
    }

    return response;
  }

  return null;
}

export const ALLOWED_IMAGE_HOSTS = [
  "'self'",
  "data:",
  "blob:",
  "https://*.supabase.co",
  "https://images.unsplash.com",
  "https://img.freepik.com",
  "https://img.magnific.com",
] as const;

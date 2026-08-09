const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "[::1]",
  "metadata.google.internal",
  "metadata.google.internal.",
]);

const ALLOWED_EXTERNAL_IMAGE_HOSTS = new Set(["images.unsplash.com"]);

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

export const ALLOWED_IMAGE_HOSTS = [
  "'self'",
  "data:",
  "blob:",
  "https://*.supabase.co",
  "https://images.unsplash.com",
] as const;

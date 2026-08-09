const ALLOWED_EXTERNAL_IMAGE_HOSTS = new Set(["images.unsplash.com"]);

function hostFromSupabaseUrl(supabaseUrl: string): string {
  try {
    return new URL(supabaseUrl).hostname.toLowerCase();
  } catch {
    return "";
  }
}

export function isAllowedCatalogImageUrl(url: string, supabaseUrl?: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return true;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:") return false;
    if (parsed.username || parsed.password) return false;

    const hostname = parsed.hostname.toLowerCase();
    if (ALLOWED_EXTERNAL_IMAGE_HOSTS.has(hostname)) return true;

    const configuredHost = supabaseUrl ? hostFromSupabaseUrl(supabaseUrl) : "";
    if (configuredHost && hostname === configuredHost && parsed.pathname.startsWith("/storage/v1/object/public/")) {
      return true;
    }

    if (hostname.endsWith(".supabase.co") && parsed.pathname.startsWith("/storage/v1/object/public/")) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

export function isAllowedCatalogImageUrlFromEnv(url: string): boolean {
  const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? "";
  return isAllowedCatalogImageUrl(url, supabaseUrl || undefined);
}

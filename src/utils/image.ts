export interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "origin" | "webp";
  resize?: "cover" | "contain" | "fill";
}

const PUBLIC_SEGMENT = "/storage/v1/object/public/";
const RENDER_SEGMENT = "/storage/v1/render/image/public/";

export function isSupabasePublicImage(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname.endsWith(".supabase.co") && parsed.pathname.includes(PUBLIC_SEGMENT);
  } catch {
    return false;
  }
}

export function getOptimizedImageUrl(url: string, options: ImageTransformOptions = {}): string {
  if (!isSupabasePublicImage(url)) return url;

  const parsed = new URL(url);
  const [basePath, objectPath] = parsed.pathname.split(PUBLIC_SEGMENT);
  if (!objectPath) return url;

  const optimized = new URL(`${parsed.origin}${basePath}${RENDER_SEGMENT}${objectPath}`);
  const params = new URLSearchParams(parsed.search);

  if (options.width) params.set("width", String(options.width));
  if (options.height) params.set("height", String(options.height));
  if (options.quality) params.set("quality", String(options.quality));
  if (options.format) params.set("format", options.format);
  if (options.resize) params.set("resize", options.resize);

  optimized.search = params.toString();
  return optimized.toString();
}

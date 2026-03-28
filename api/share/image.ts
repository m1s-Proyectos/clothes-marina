import sharp from "sharp";

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const PADDING = 36;

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

async function buildOgImage(sourceBuffer: Buffer): Promise<Buffer> {
  const meta = await sharp(sourceBuffer).metadata();
  const srcW = meta.width || 800;
  const srcH = meta.height || 600;

  const maxW = OG_WIDTH - PADDING * 2;
  const maxH = OG_HEIGHT - PADDING * 2;
  const scale = Math.min(maxW / srcW, maxH / srcH);

  const resizedW = Math.round(srcW * scale);
  const resizedH = Math.round(srcH * scale);

  const resized = await sharp(sourceBuffer)
    .resize(resizedW, resizedH, { fit: "inside" })
    .png()
    .toBuffer();

  const left = Math.round((OG_WIDTH - resizedW) / 2);
  const top = Math.round((OG_HEIGHT - resizedH) / 2);

  return sharp({
    create: {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      channels: 4,
      background: { r: 250, g: 249, b: 247, alpha: 1 },
    },
  })
    .composite([{ input: resized, left, top }])
    .jpeg({ quality: 85 })
    .toBuffer();
}

export default async function handler(req: any, res: any) {
  const productId = typeof req.query?.id === "string" ? req.query.id : "";
  const imageFromQuery = typeof req.query?.img === "string" ? req.query.img : "";

  if (!productId) {
    res.status(400).send("Missing product id");
    return;
  }

  try {
    const imageUrl = imageFromQuery || (await fetchProductImage(productId));
    if (!imageUrl) {
      res.status(404).send("Image not found");
      return;
    }

    const imageResponse = await fetch(imageUrl, { headers: { Accept: "image/*" } });
    if (!imageResponse.ok) {
      res.status(404).send("Image not available");
      return;
    }

    const arrayBuffer = await imageResponse.arrayBuffer();
    const sourceBuffer = Buffer.from(arrayBuffer);

    const ogBuffer = await buildOgImage(sourceBuffer);

    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800");
    res.status(200).send(ogBuffer);
  } catch {
    res.status(500).send("Unable to generate image");
  }
}

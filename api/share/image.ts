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
      Accept: "application/json"
    }
  });

  if (!response.ok) return null;
  const data = await response.json();
  const item = Array.isArray(data) ? data[0] : null;
  if (!item || item.available === false || !item.main_image_url) return null;
  return item.main_image_url as string;
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

    const imageResponse = await fetch(imageUrl, {
      headers: {
        Accept: "image/*"
      }
    });

    if (!imageResponse.ok) {
      res.status(404).send("Image not available");
      return;
    }

    const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800");
    res.status(200).send(buffer);
  } catch {
    res.status(500).send("Unable to load image");
  }
}

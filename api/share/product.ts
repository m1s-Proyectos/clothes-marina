function getEnv(name: string, fallback = ""): string {
  return process.env[name] || fallback;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(value: string): string {
  return value.replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function truncate(value: string, max = 220): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}

function buildProxyImageUrl(siteUrl: string, productId: string, imageUrl?: string): string {
  const base = siteUrl.replace(/\/$/, "");
  const params = new URLSearchParams({ id: productId });
  if (imageUrl) params.set("img", imageUrl);
  return `${base}/api/share/image?${params.toString()}`;
}

async function fetchProduct(productId: string) {
  const supabaseUrl = getEnv("SUPABASE_URL", getEnv("VITE_SUPABASE_URL"));
  const supabaseAnonKey = getEnv("SUPABASE_ANON_KEY", getEnv("VITE_SUPABASE_ANON_KEY"));
  if (!supabaseUrl || !supabaseAnonKey) return null;

  const url = `${supabaseUrl}/rest/v1/products?id=eq.${encodeURIComponent(productId)}&select=id,name,description,main_image_url,available`;
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
  if (!item || item.available === false) return null;
  return item;
}

function buildShareCanonical(siteUrl: string, productId: string): string {
  return `${siteUrl.replace(/\/$/, "")}/api/share/product?id=${encodeURIComponent(productId)}`;
}

function renderShareHtml({
  siteUrl,
  productId,
  productUrl,
  title,
  description,
  image
}: {
  siteUrl: string;
  productId: string;
  productUrl: string;
  title: string;
  description: string;
  image: string;
}): string {
  const ogUrl = buildShareCanonical(siteUrl, productId);
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)} | Marina's clothes</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Marina's clothes" />
    <meta property="og:title" content="${escapeHtml(title)} | Marina's clothes" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeAttr(ogUrl)}" />
    <meta property="og:image" content="${escapeAttr(image)}" />
    <meta property="og:image:secure_url" content="${escapeAttr(image)}" />
    <meta property="og:image:alt" content="${escapeHtml(title)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)} | Marina's clothes" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeAttr(image)}" />
    <link rel="canonical" href="${escapeAttr(ogUrl)}" />
  </head>
  <body>
    <p>${escapeHtml(title)} - ${escapeHtml(description)}</p>
    <p><a href="${escapeAttr(productUrl)}">Ver producto</a></p>
  </body>
</html>`;
}

function isSocialCrawler(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return (
    ua.includes("facebookexternalhit") ||
    ua.includes("facebot") ||
    ua.includes("twitterbot") ||
    ua.includes("linkedinbot") ||
    ua.includes("slackbot") ||
    ua.includes("whatsapp") ||
    ua.includes("discordbot") ||
    ua.includes("telegrambot")
  );
}

export default async function handler(req: any, res: any) {
  const productId = typeof req.query?.id === "string" ? req.query.id : "";
  const titleFromQuery = typeof req.query?.t === "string" ? req.query.t : "";
  const descriptionFromQuery = typeof req.query?.d === "string" ? req.query.d : "";
  const imageFromQuery = typeof req.query?.img === "string" ? req.query.img : "";
  const siteUrl = getEnv("SITE_URL", getEnv("VITE_APP_URL", "https://clothes-marina.vercel.app"));

  if (!productId) {
    res.status(400).send("Missing product id");
    return;
  }

  const productUrl = `${siteUrl.replace(/\/$/, "")}/product/${encodeURIComponent(productId)}`;
  const userAgent = typeof req.headers?.["user-agent"] === "string" ? req.headers["user-agent"] : "";
  const crawlerRequest = isSocialCrawler(userAgent);

  // Real users should never stay on the share endpoint.
  if (!crawlerRequest) {
    res.writeHead(302, { Location: productUrl });
    res.end();
    return;
  }

  try {
    if (titleFromQuery && imageFromQuery) {
      const title = titleFromQuery;
      const description = truncate(descriptionFromQuery || "Descubre este producto en Marina's clothes.");
      const image = buildProxyImageUrl(siteUrl, productId, imageFromQuery);
      const html = renderShareHtml({ siteUrl, productId, productUrl, title, description, image });

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.status(200).send(html);
      return;
    }

    const product = await fetchProduct(productId);
    if (!product) {
      res.writeHead(302, { Location: productUrl });
      res.end();
      return;
    }

    const title = product.name || "Producto";
    const description = truncate(product.description || "Descubre este producto en Marina's clothes.");
    const image = buildProxyImageUrl(siteUrl, productId, product.main_image_url);
    const html = renderShareHtml({ siteUrl, productId, productUrl, title, description, image });

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=60, stale-while-revalidate=600");
    res.status(200).send(html);
  } catch {
    res.writeHead(302, { Location: productUrl });
    res.end();
  }
}

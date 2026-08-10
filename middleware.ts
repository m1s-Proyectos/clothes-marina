const SOCIAL_CRAWLERS = [
  "facebookexternalhit",
  "facebot",
  "twitterbot",
  "linkedinbot",
  "slackbot",
  "whatsapp",
  "discordbot",
  "telegrambot",
];

function isSocialCrawler(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return SOCIAL_CRAWLERS.some((bot) => ua.includes(bot));
}

function extractProductId(pathname: string): string | null {
  const match = pathname.match(/^\/product\/([^/?#]+)/);
  if (!match?.[1]) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

export const config = {
  matcher: ["/product/:path*"],
};

export default async function middleware(request: Request): Promise<Response | undefined> {
  const userAgent = request.headers.get("user-agent") || "";
  if (!isSocialCrawler(userAgent)) {
    return undefined;
  }

  const url = new URL(request.url);
  const productId = extractProductId(url.pathname);
  if (!productId) {
    return undefined;
  }

  const apiUrl = new URL("/api/share/product", url.origin);
  apiUrl.searchParams.set("id", productId);

  return fetch(apiUrl.toString(), {
    headers: {
      "User-Agent": userAgent,
      Accept: "text/html",
    },
  });
}

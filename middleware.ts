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

export const config = {
  matcher: ["/product/:path*"],
};

export default async function middleware(request: Request) {
  const userAgent = request.headers.get("user-agent") || "";

  if (!isSocialCrawler(userAgent)) return;

  const url = new URL(request.url);
  const segments = url.pathname.split("/product/");
  const productId = segments[1];
  if (!productId) return;

  const apiUrl = new URL("/api/share/product", url.origin);
  apiUrl.searchParams.set("id", productId);

  return fetch(apiUrl.toString());
}

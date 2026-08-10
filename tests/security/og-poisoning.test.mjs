import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const productHandlerSource = readFileSync("api/share/product.ts", "utf8");
const imageHandlerSource = readFileSync("api/share/image.ts", "utf8");
const vercelConfig = JSON.parse(readFileSync("vercel.json", "utf8"));

test("share product handler does not trust t/d/img query params for crawlers", () => {
  assert.doesNotMatch(productHandlerSource, /titleFromQuery/);
  assert.doesNotMatch(productHandlerSource, /descriptionFromQuery/);
  assert.doesNotMatch(productHandlerSource, /imageFromQuery/);
  assert.match(productHandlerSource, /fetchProduct\(productId\)/);
});

test("share product canonical points to product page", () => {
  assert.match(productHandlerSource, /buildProductCanonical/);
  assert.match(productHandlerSource, /\/product\//);
  assert.doesNotMatch(productHandlerSource, /buildShareCanonical/);
});

test("og:image uses id-only share image proxy", () => {
  assert.match(productHandlerSource, /buildProxyImageUrl\(siteUrl, productId\)/);
  assert.match(productHandlerSource, /\/api\/share\/image\?id=/);
  assert.doesNotMatch(productHandlerSource, /params\.set\("img"/);
});

test("share image handler uses controlled fetch helper", () => {
  assert.match(imageHandlerSource, /fetchAllowedProductImage/);
  assert.doesNotMatch(imageHandlerSource, /redirect blocked/);
});

test("vercel rewrites social crawlers on product pages to share API", () => {
  const crawlerRewrite = vercelConfig.rewrites?.find(
    (entry) => entry.source === "/product/:id" && entry.destination?.includes("/api/share/product"),
  );
  assert.ok(crawlerRewrite);
  assert.match(crawlerRewrite.has?.[0]?.value ?? "", /facebookexternalhit/);
});

test("vercel sets cross-origin CORP only on share image endpoint", () => {
  const imageHeaders = vercelConfig.headers?.find((entry) => entry.source === "/api/share/image");
  assert.ok(imageHeaders);
  const corp = imageHeaders.headers?.find((entry) => entry.key === "Cross-Origin-Resource-Policy");
  assert.equal(corp?.value, "cross-origin");
});

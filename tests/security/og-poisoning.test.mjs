import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const productHandlerSource = readFileSync("api/share/product.ts", "utf8");

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

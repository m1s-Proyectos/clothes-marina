import assert from "node:assert/strict";
import test from "node:test";
import { isAllowedCatalogImageUrl } from "../../src/utils/imageUrlValidation.ts";

test("allows same-origin static assets", () => {
  assert.equal(isAllowedCatalogImageUrl("/hombre.jpg"), true);
  assert.equal(isAllowedCatalogImageUrl("//evil.example/a.jpg"), false);
});

test("allows supabase storage and unsplash only", () => {
  assert.equal(
    isAllowedCatalogImageUrl("https://abc.supabase.co/storage/v1/object/public/product-images/a.webp"),
    true,
  );
  assert.equal(
    isAllowedCatalogImageUrl("https://images.unsplash.com/photo-123"),
    true,
  );
  assert.equal(isAllowedCatalogImageUrl("https://evil.example/a.jpg"), false);
});

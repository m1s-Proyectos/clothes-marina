import assert from "node:assert/strict";
import test from "node:test";
import {
  isAllowedProductImageUrl,
  normalizeUrl,
  resolveTrustedProductImageUrl,
} from "../../api/_lib/urlSafety.ts";

const supabaseUrl = "https://example.supabase.co";

test("blocks IPv6 localhost and metadata targets", () => {
  assert.equal(isAllowedProductImageUrl("https://[::1]/storage/v1/object/public/product-images/a.webp", supabaseUrl), false);
  assert.equal(isAllowedProductImageUrl("https://metadata.google.internal/", supabaseUrl), false);
});

test("blocks credentials in URL", () => {
  const allowed = `${supabaseUrl}/storage/v1/object/public/product-images/a.webp`;
  assert.equal(isAllowedProductImageUrl(`https://user:pass@example.supabase.co/storage/v1/object/public/product-images/a.webp`, supabaseUrl), false);
  assert.equal(isAllowedProductImageUrl(allowed, supabaseUrl), true);
});

test("blocks non-https protocols", () => {
  assert.equal(isAllowedProductImageUrl("http://example.supabase.co/storage/v1/object/public/product-images/a.webp", supabaseUrl), false);
  assert.equal(isAllowedProductImageUrl("file:///etc/passwd", supabaseUrl), false);
});

test("allows any supabase.co project storage path", () => {
  const url = "https://abc123.supabase.co/storage/v1/object/public/product-images/a.webp";
  assert.equal(isAllowedProductImageUrl(url, supabaseUrl), true);
});

test("rejects mismatched requested image even when encoded", () => {
  const trusted = `${supabaseUrl}/storage/v1/object/public/product-images/real.webp`;
  const attacker = `${supabaseUrl}/storage/v1/object/public/product-images/other.webp`;
  assert.equal(normalizeUrl(resolveTrustedProductImageUrl(trusted, attacker, supabaseUrl) ?? ""), normalizeUrl(trusted));
});

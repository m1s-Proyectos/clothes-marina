/* global Response */
import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import test from "node:test";
import {
  ALLOWED_EXTERNAL_IMAGE_HOSTS,
  fetchAllowedProductImage,
  isAllowedProductImageUrl,
  normalizeUrl,
  resolveTrustedProductImageUrl,
} from "../../api/share/urlSafety.ts";

const supabaseUrl = "https://example.supabase.co";

test("blocks IPv6 localhost and metadata targets", () => {
  assert.equal(isAllowedProductImageUrl("https://[::1]/storage/v1/object/public/product-images/a.webp", supabaseUrl), false);
  assert.equal(isAllowedProductImageUrl("https://metadata.google.internal/", supabaseUrl), false);
  assert.equal(isAllowedProductImageUrl("https://169.254.169.254/latest/meta-data/", supabaseUrl), false);
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

test("allows explicit external catalog image hosts only", () => {
  assert.equal(isAllowedProductImageUrl("https://images.unsplash.com/photo-123", supabaseUrl), true);
  assert.equal(isAllowedProductImageUrl("https://img.freepik.com/free-photo/sample.jpg", supabaseUrl), true);
  assert.equal(isAllowedProductImageUrl("https://img.magnific.com/free-photo/sample.jpg", supabaseUrl), true);
  assert.equal(isAllowedProductImageUrl("https://evil.example/a.jpg", supabaseUrl), false);
  assert.equal(ALLOWED_EXTERNAL_IMAGE_HOSTS.has("img.freepik.com"), true);
  assert.equal(ALLOWED_EXTERNAL_IMAGE_HOSTS.has("img.magnific.com"), true);
});

test("rejects mismatched requested image even when encoded", () => {
  const trusted = `${supabaseUrl}/storage/v1/object/public/product-images/real.webp`;
  const attacker = `${supabaseUrl}/storage/v1/object/public/product-images/other.webp`;
  assert.equal(normalizeUrl(resolveTrustedProductImageUrl(trusted, attacker, supabaseUrl) ?? ""), normalizeUrl(trusted));
});

test("fetchAllowedProductImage blocks redirect to disallowed host", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    const url = String(input);
    if (url.startsWith("https://img.freepik.com/")) {
      return new Response(null, {
        status: 302,
        headers: { location: "https://evil.example/steal.jpg" },
      });
    }
    throw new Error(`unexpected fetch: ${url}`);
  };

  try {
    const result = await fetchAllowedProductImage("https://img.freepik.com/free-photo/x.jpg", supabaseUrl);
    assert.equal(result, null);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("fetchAllowedProductImage allows one hop from freepik to magnific", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    const url = String(input);
    if (url.startsWith("https://img.freepik.com/")) {
      return new Response(null, {
        status: 301,
        headers: { location: "https://img.magnific.com/free-photo/x.jpg" },
      });
    }
    if (url.startsWith("https://img.magnific.com/")) {
      return new Response(Buffer.from("fake-image"), {
        status: 200,
        headers: { "content-type": "image/jpeg" },
      });
    }
    throw new Error(`unexpected fetch: ${url}`);
  };

  try {
    const result = await fetchAllowedProductImage("https://img.freepik.com/free-photo/x.jpg", supabaseUrl);
    assert.ok(result);
    assert.equal(result.status, 200);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

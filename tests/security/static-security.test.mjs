import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const vercel = JSON.parse(readFileSync("vercel.json", "utf8"));
const headers = vercel.headers?.[0]?.headers ?? [];
const csp = headers.find((entry) => entry.key === "Content-Security-Policy")?.value ?? "";
const reportOnly = headers.find((entry) => entry.key === "Content-Security-Policy-Report-Only")?.value ?? "";

test("CSP blocks object embedding and external framing", () => {
  assert.match(csp, /object-src 'none'/);
  assert.match(csp, /frame-ancestors 'none'/);
  assert.match(csp, /base-uri 'self'/);
});

test("CSP does not allow wildcard script loading", () => {
  assert.doesNotMatch(csp, /script-src[^;]*\*/);
  assert.doesNotMatch(csp, /script-src-elem[^;]*\*/);
});

test("CSP avoids unsafe-eval", () => {
  assert.doesNotMatch(csp, /unsafe-eval/);
});

test("CSP does not load Google Fonts externally", () => {
  assert.doesNotMatch(csp, /fonts\.googleapis\.com/);
  assert.doesNotMatch(csp, /fonts\.gstatic\.com/);
});

test("CSP img-src uses explicit hosts", () => {
  assert.match(csp, /img-src[^;]*https:\/\/\*\.supabase\.co/);
  assert.match(csp, /img-src[^;]*https:\/\/images\.unsplash\.com/);
  assert.match(csp, /img-src[^;]*https:\/\/img\.freepik\.com/);
  assert.match(csp, /img-src[^;]*https:\/\/img\.magnific\.com/);
});

test("Report-Only CSP exists for future tightening", () => {
  assert.ok(reportOnly.length > 0);
  assert.match(reportOnly, /script-src 'self'/);
});

test("Repository ignores environment files", () => {
  const gitignore = readFileSync(".gitignore", "utf8");
  assert.match(gitignore, /^\.env$/m);
  assert.match(gitignore, /^\.env\.\*$/m);
});

test("Production build disables source maps", () => {
  const viteConfig = readFileSync("vite.config.ts", "utf8");
  assert.match(viteConfig, /sourcemap:\s*false/);
});

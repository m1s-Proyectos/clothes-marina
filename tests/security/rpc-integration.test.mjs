import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const contactService = readFileSync("src/services/contactService.ts", "utf8");
const whatsAppLeadService = readFileSync("src/services/whatsAppLeadService.ts", "utf8");
const rpcMigration = readFileSync("supabase/migrations/add_public_write_rpcs.sql", "utf8");

test("contact service uses RPC instead of direct insert", () => {
  assert.match(contactService, /supabase\.rpc\("submit_contact_request"/);
  assert.doesNotMatch(contactService, /\.from\("contact_requests"\)\.insert/);
});

test("whatsapp lead service uses RPC instead of direct insert", () => {
  assert.match(whatsAppLeadService, /supabase\.rpc\("track_whatsapp_lead"/);
  assert.doesNotMatch(whatsAppLeadService, /\.from\("whatsapp_leads"\)\.insert/);
});

test("RPC migration blocks direct public inserts", () => {
  assert.match(rpcMigration, /with check \(false\)/);
  assert.match(rpcMigration, /submit_contact_request/);
  assert.match(rpcMigration, /track_whatsapp_lead/);
});

test("RPC migration defines rate limit guards", () => {
  assert.match(rpcMigration, /rate limit exceeded/);
  assert.match(rpcMigration, /p_honeypot/);
});

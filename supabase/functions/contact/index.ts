// Optional Edge Function example for contact requests.
// Deploy with: supabase functions deploy contact

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  const body = await req.json();
  // Integrate provider here (Twilio, email, Slack webhook, CRM).
  // Keep this function side-effect free in template mode.
  return new Response(JSON.stringify({ ok: true, payload: body }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
});

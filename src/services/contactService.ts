import { http } from "@/lib/http";
import { supabase } from "@/lib/supabase";

export interface ContactPayload {
  name: string;
  phone: string;
  message: string;
}

export async function sendContact(payload: ContactPayload): Promise<void> {
  const { error } = await supabase.from("contact_requests").insert({
    name: payload.name,
    phone: payload.phone,
    message: payload.message
  });
  if (error) throw error;

  // Optional integration if an external endpoint is configured.
  if (http.defaults.baseURL) {
    await http.post("/contact", payload);
  }
}

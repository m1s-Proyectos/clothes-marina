import { supabase } from "@/lib/supabase";
import { sanitizePlainText, validateContactPayload } from "@/utils/inputValidation";

export interface ContactPayload {
  name: string;
  phone: string;
  message: string;
  honeypot?: string;
}

export async function sendContact(payload: ContactPayload): Promise<void> {
  const validation = validateContactPayload(payload);
  if (!validation.ok) {
    throw new Error(validation.message ?? "Datos de contacto invalidos.");
  }

  const { error } = await supabase.rpc("submit_contact_request", {
    p_name: sanitizePlainText(payload.name, 120),
    p_phone: sanitizePlainText(payload.phone, 30),
    p_message: sanitizePlainText(payload.message, 2000),
    p_honeypot: payload.honeypot ?? "",
  });
  if (error) throw error;
}

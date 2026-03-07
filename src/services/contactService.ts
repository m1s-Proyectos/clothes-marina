import { http } from "@/lib/http";

export interface ContactPayload {
  name: string;
  phone: string;
  message: string;
}

export async function sendContact(payload: ContactPayload): Promise<void> {
  if (!http.defaults.baseURL) return;
  await http.post("/contact", payload);
}

import { supabase } from "@/lib/supabase";
import type { ContactRequest, WhatsAppLead } from "@/types";

export const adminInboxService = {
  async listContactRequests(): Promise<ContactRequest[]> {
    const { data, error } = await supabase
      .from("contact_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as ContactRequest[];
  },

  async markContactResolved(id: string): Promise<void> {
    const { error } = await supabase.from("contact_requests").update({ status: "resolved" }).eq("id", id);
    if (error) throw error;
  },

  async listWhatsAppLeads(): Promise<WhatsAppLead[]> {
    const { data, error } = await supabase
      .from("whatsapp_leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as WhatsAppLead[];
  }
};

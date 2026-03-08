import { supabase } from "@/lib/supabase";

interface WhatsAppLeadPayload {
  productId: string;
  productName: string;
}

export const whatsAppLeadService = {
  async trackProductInquiry(payload: WhatsAppLeadPayload): Promise<void> {
    const { error } = await supabase.from("whatsapp_leads").insert({
      product_id: payload.productId,
      product_name: payload.productName,
      source: "product"
    });

    if (error) {
      // Tracking should never block customer navigation.
      // eslint-disable-next-line no-console
      console.warn("Unable to register WhatsApp lead.", error.message);
    }
  }
};

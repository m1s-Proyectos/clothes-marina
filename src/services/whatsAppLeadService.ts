import env from "@/config/env";
import { supabase } from "@/lib/supabase";
import type { CustomerLovedCarouselRow } from "@/types/whatsappLead";

interface WhatsAppLeadPayload {
  productId: string;
  productName: string;
}

export const whatsAppLeadService = {
  async trackProductInquiry(payload: WhatsAppLeadPayload): Promise<void> {
    const { error } = await supabase.from("whatsapp_leads").insert({
      product_id: payload.productId,
      product_name: payload.productName,
      source: "product",
    });

    if (error) {
      // Tracking should never block customer navigation.
      console.warn("Unable to register WhatsApp lead.", error.message);
    }
  },

  /** Productos más solicitados vía WhatsApp (carrusel catálogo). */
  async getCustomerLovedProducts(limit = 5): Promise<CustomerLovedCarouselRow[]> {
    if (!env.isSupabaseConfigured) return [];

    const { data, error } = await supabase.rpc("get_customer_loved_products", { p_limit: limit });
    if (error) throw error;

    return (data ?? []).map((row: Record<string, unknown>) => {
      const num = (key: string) => {
        const value = row[key];
        return typeof value === "number" ? value : Number(value ?? 0);
      };
      return {
        product_id: String(row.product_id),
        product_name: String(row.product_name ?? ""),
        main_image_url: String(row.main_image_url ?? ""),
        request_count: num("request_count"),
        category_name: row.category_name != null ? String(row.category_name) : null,
      };
    });
  },
};

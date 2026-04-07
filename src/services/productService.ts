import { supabase } from "@/lib/supabase";
import type { Product, ProductSort } from "@/types";
import { improveSpanishText, normalizeProductText } from "@/utils/spanishTextNormalize";

function normalizeProductPayload(
  payload: Partial<Omit<Product, "id" | "created_at" | "categories" | "product_images">>,
): typeof payload {
  const next = { ...payload };
  if (typeof next.name === "string") next.name = improveSpanishText(next.name);
  if (typeof next.description === "string") next.description = improveSpanishText(next.description);
  if (typeof next.brand === "string") next.brand = improveSpanishText(next.brand);
  if (typeof next.color === "string") next.color = improveSpanishText(next.color);
  if (typeof next.size === "string") next.size = improveSpanishText(next.size);
  return next;
}

interface ProductQueryOptions {
  categorySlug?: string;
  search?: string;
  sort?: ProductSort;
  onlyAvailable?: boolean;
}

function applySorting(query: any, sort: ProductSort = "newest") {
  if (sort === "alphabetical") return query.order("name", { ascending: true });
  if (sort === "availability") return query.order("available", { ascending: false });
  if (sort === "featured") return query.order("featured", { ascending: false }).order("created_at", { ascending: false });
  return query.order("created_at", { ascending: false });
}

export const productService = {
  async list(options: ProductQueryOptions = {}): Promise<Product[]> {
    let query = supabase.from("products").select(`
      *,
      categories:category_id!inner (id, name, slug),
      product_images (id, product_id, image_url)
    `);

    if (options.onlyAvailable) query = query.eq("available", true);
    if (options.categorySlug && options.categorySlug !== "offers") {
      query = query.eq("categories.slug", options.categorySlug);
    }
    if (options.categorySlug === "offers") {
      query = query.eq("offer_active", true);
    }
    // Search filtering is handled client-side for accent-insensitive matching

    query = applySorting(query, options.sort);

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((row) => normalizeProductText(row as Product));
  },

  async getById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from("products")
      .select("*, categories:category_id (id, name, slug), product_images (*)")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? normalizeProductText(data as Product) : null;
  },

  async getFeatured(limit = 6): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*, categories:category_id (id, name, slug)")
      .eq("featured", true)
      .eq("available", true)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map((row) => normalizeProductText(row as Product));
  },

  async create(payload: Omit<Product, "id" | "created_at" | "categories" | "product_images">): Promise<void> {
    const { error } = await supabase.from("products").insert(normalizeProductPayload(payload) as typeof payload);
    if (error) throw error;
  },

  async update(id: string, payload: Partial<Omit<Product, "id" | "created_at" | "categories" | "product_images">>): Promise<void> {
    const { error } = await supabase.from("products").update(normalizeProductPayload(payload)).eq("id", id);
    if (error) throw error;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
  }
};

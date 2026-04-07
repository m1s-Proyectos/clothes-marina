import { supabase } from "@/lib/supabase";
import type { Category } from "@/types";
import { improveSpanishText } from "@/utils/spanishTextNormalize";

function normalizeCategoryRow(category: Category): Category {
  return { ...category, name: improveSpanishText(category.name) };
}

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(normalizeCategoryRow);
  },

  async create(payload: Pick<Category, "name" | "slug" | "image_url">): Promise<void> {
    const { error } = await supabase.from("categories").insert({
      ...payload,
      name: improveSpanishText(payload.name),
    });
    if (error) throw error;
  },

  async update(id: string, payload: Partial<Pick<Category, "name" | "slug" | "image_url">>): Promise<void> {
    const next =
      typeof payload.name === "string" ? { ...payload, name: improveSpanishText(payload.name) } : payload;
    const { error } = await supabase.from("categories").update(next).eq("id", id);
    if (error) throw error;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw error;
  }
};

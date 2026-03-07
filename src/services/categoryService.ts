import { supabase } from "@/lib/supabase";
import type { Category } from "@/types";

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async create(payload: Pick<Category, "name" | "slug" | "image_url">): Promise<void> {
    const { error } = await supabase.from("categories").insert(payload);
    if (error) throw error;
  },

  async update(id: string, payload: Partial<Pick<Category, "name" | "slug" | "image_url">>): Promise<void> {
    const { error } = await supabase.from("categories").update(payload).eq("id", id);
    if (error) throw error;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw error;
  }
};

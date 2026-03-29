import { supabase } from "@/lib/supabase";
import { optimizeImage } from "@/utils/imageOptimizer";

const BUCKET = "product-images";

export const storageService = {
  async upload(file: File, folder = "products"): Promise<string> {
    const optimized = await optimizeImage(file);
    const ext = optimized.name.split(".").pop() ?? "webp";
    const path = `${folder}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, optimized, {
      cacheControl: "31536000",
      contentType: optimized.type,
      upsert: false,
    });
    if (error) throw error;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  },
};

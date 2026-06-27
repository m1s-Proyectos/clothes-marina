import env from "@/config/env";
import { supabase } from "@/lib/supabase";
import type {
  ProductRatingAdminOverview,
  ProductRatingRankedRow,
  ProductRatingSummary,
  SeasonFavoriteCarouselRow,
} from "@/types/productRating";

const SUMMARY_CACHE_MS = 45_000;
const summaryCache = new Map<string, { expires: number; data: ProductRatingSummary }>();

function emptySummary(productId: string): ProductRatingSummary {
  return {
    product_id: productId,
    vote_count: 0,
    average_rating: null,
    rating_1: 0,
    rating_2: 0,
    rating_3: 0,
    rating_4: 0,
    rating_5: 0,
    your_rating: null,
  };
}

function parseSummary(payload: unknown, productId: string): ProductRatingSummary {
  if (!payload || typeof payload !== "object") return emptySummary(productId);
  const row = payload as Record<string, unknown>;

  const num = (key: string): number => {
    const value = row[key];
    return typeof value === "number" ? value : Number(value ?? 0);
  };

  const nullableNum = (key: string): number | null => {
    const value = row[key];
    if (value === null || value === undefined) return null;
    const parsed = typeof value === "number" ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  return {
    product_id: String(row.product_id ?? productId),
    vote_count: num("vote_count"),
    average_rating: nullableNum("average_rating"),
    rating_1: num("rating_1"),
    rating_2: num("rating_2"),
    rating_3: num("rating_3"),
    rating_4: num("rating_4"),
    rating_5: num("rating_5"),
    your_rating: nullableNum("your_rating"),
  };
}

function invalidateSummaryCache(productId: string): void {
  summaryCache.delete(productId);
}

export const productRatingService = {
  async getSummary(productId: string, sessionId?: string): Promise<ProductRatingSummary> {
    if (!env.isSupabaseConfigured) return emptySummary(productId);

    const cacheKey = `${productId}:${sessionId ?? ""}`;
    const cached = summaryCache.get(cacheKey);
    if (cached && cached.expires > Date.now()) return cached.data;

    const { data, error } = await supabase.rpc("get_product_rating_summary", {
      p_product_id: productId,
      p_session_id: sessionId ?? null,
    });

    if (error) throw error;

    const summary = parseSummary(data, productId);
    summaryCache.set(cacheKey, { data: summary, expires: Date.now() + SUMMARY_CACHE_MS });
    return summary;
  },

  async submitRating(productId: string, rating: number, sessionId: string): Promise<ProductRatingSummary> {
    if (!env.isSupabaseConfigured) {
      return { ...emptySummary(productId), your_rating: rating, vote_count: 1, average_rating: rating };
    }

    invalidateSummaryCache(productId);

    const { data, error } = await supabase.rpc("submit_product_rating", {
      p_product_id: productId,
      p_rating: rating,
      p_session_id: sessionId,
      p_ip_hash: null,
    });

    if (error) throw error;

    const summary = parseSummary(data, productId);
    summaryCache.clear();
    return summary;
  },

  /** Panel admin (futuro): métricas globales de calificaciones. */
  async getAdminOverview(): Promise<ProductRatingAdminOverview | null> {
    if (!env.isSupabaseConfigured) return null;

    const { data, error } = await supabase.rpc("get_product_rating_admin_overview");
    if (error) throw error;
    if (!data || typeof data !== "object") return null;

    const row = data as Record<string, unknown>;
    const num = (key: string) => {
      const value = row[key];
      return typeof value === "number" ? value : Number(value ?? 0);
    };
    const nullableNum = (key: string) => {
      const value = row[key];
      if (value === null || value === undefined) return null;
      const parsed = typeof value === "number" ? value : Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    };

    return {
      total_ratings: num("total_ratings"),
      global_average: nullableNum("global_average"),
      rating_1: num("rating_1"),
      rating_2: num("rating_2"),
      rating_3: num("rating_3"),
      rating_4: num("rating_4"),
      rating_5: num("rating_5"),
    };
  },

  /** Panel admin (futuro): productos mejor valorados. */
  async getTopRated(limit = 10): Promise<ProductRatingRankedRow[]> {
    if (!env.isSupabaseConfigured) return [];

    const { data, error } = await supabase.rpc("get_top_rated_products", { p_limit: limit });
    if (error) throw error;
    return (data ?? []) as ProductRatingRankedRow[];
  },

  /** Panel admin (futuro): productos peor valorados. */
  async getLowestRated(limit = 10): Promise<ProductRatingRankedRow[]> {
    if (!env.isSupabaseConfigured) return [];

    const { data, error } = await supabase.rpc("get_lowest_rated_products", { p_limit: limit });
    if (error) throw error;
    return (data ?? []) as ProductRatingRankedRow[];
  },

  /** Top productos calificados en los últimos 7 días (carrusel catálogo). */
  async getSeasonFavorites(limit = 5): Promise<SeasonFavoriteCarouselRow[]> {
    if (!env.isSupabaseConfigured) return [];

    const { data, error } = await supabase.rpc("get_season_favorite_products", { p_limit: limit });
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
        vote_count: num("vote_count"),
        average_rating: num("average_rating"),
        category_name: row.category_name != null ? String(row.category_name) : null,
      };
    });
  },
};

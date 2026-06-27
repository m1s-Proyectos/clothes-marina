export interface ProductRatingDistribution {
  rating_1: number;
  rating_2: number;
  rating_3: number;
  rating_4: number;
  rating_5: number;
}

export interface ProductRatingSummary extends ProductRatingDistribution {
  product_id: string;
  vote_count: number;
  average_rating: number | null;
  your_rating: number | null;
}

export interface ProductRatingAdminOverview extends ProductRatingDistribution {
  total_ratings: number;
  global_average: number | null;
}

export interface ProductRatingRankedRow extends ProductRatingDistribution {
  product_id: string;
  product_name: string;
  vote_count: number;
  average_rating: number;
}

/** Producto destacado en carrusel por calificaciones de la última semana. */
export interface SeasonFavoriteCarouselRow {
  product_id: string;
  product_name: string;
  main_image_url: string;
  vote_count: number;
  average_rating: number;
  category_name: string | null;
}

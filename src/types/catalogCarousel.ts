/** Tipos de carrusel editorial del catálogo (futuro: tabla `catalog_carousels` en Supabase). */
export type CatalogCarouselType =
  | "find-your-style"
  | "new-arrivals"
  | "recommended"
  | "season-favorites"
  | "customer-loved"
  | "world-cup-2026";

export interface CatalogCarouselSlide {
  id: string;
  imageUrl: string;
  title?: string;
  subtitle?: string;
  description?: string;
  href?: string;
}

export interface CatalogCarouselBlock {
  id: string;
  type: CatalogCarouselType;
  sectionTitle: string;
  sectionMessage?: string;
  slides: CatalogCarouselSlide[];
  active: boolean;
  sortOrder: number;
}

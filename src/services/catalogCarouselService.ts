import env from "@/config/env";
import type { CatalogCarouselBlock } from "@/types/catalogCarousel";

/**
 * Bloques editoriales del catálogo. Sustituir por Supabase cuando exista admin + DB.
 * Campos esperados: id, type, section_title, section_message, slides (jsonb), active, sort_order.
 */
const PLACEHOLDER_BLOCKS: CatalogCarouselBlock[] = [
  {
    id: "carousel-find-your-style",
    type: "find-your-style",
    sectionTitle: "✨ Encuentra tu estilo",
    sectionMessage: "No solo vendemos ropa, te ayudamos a encontrar tu estilo.",
    active: true,
    sortOrder: 1,
    slides: [
      {
        id: "style-nino-lacoste",
        imageUrl: "/carousel-estilo/estilo-nino-lacoste.jpg",
        title: "Look infantil",
        subtitle: "Comodidad para los más pequeños",
        href: "/catalog",
      },
      {
        id: "style-unisex",
        imageUrl: "/carousel-estilo/estilo-unisex.jpg",
        title: "Estilo unisex",
        subtitle: "Colores y prendas para todos",
        href: "/catalog",
      },
      {
        id: "style-hombre-cargo",
        imageUrl: "/carousel-estilo/estilo-hombre-cargo.jpg",
        title: "Estilo hombre",
        subtitle: "Looks pensados para él",
        href: "/catalog",
      },
    ],
  },
  {
    id: "carousel-new-arrivals",
    type: "new-arrivals",
    sectionTitle: "🌸 Nuevas llegadas",
    sectionMessage: "Los últimos productos agregados al catálogo.",
    active: true,
    sortOrder: 2,
    slides: [],
  },
  {
    id: "carousel-recommended",
    type: "recommended",
    sectionTitle: "🛍️ Recomendado para ti",
    sectionMessage: "Las últimas ofertas activas del catálogo.",
    active: true,
    sortOrder: 3,
    slides: [],
  },
  {
    id: "carousel-season-favorites",
    type: "season-favorites",
    sectionTitle: "⭐ Favoritos de la temporada",
    sectionMessage: "Productos mejor valorados por clientes en la última semana.",
    active: true,
    sortOrder: 4,
    slides: [],
  },
  {
    id: "carousel-customer-loved",
    type: "customer-loved",
    sectionTitle: "💖 Lo que más aman nuestros clientes",
    sectionMessage: "Productos que más clientes han solicitado por WhatsApp.",
    active: true,
    sortOrder: 5,
    slides: [],
  },
  {
    id: "carousel-world-cup-2026",
    type: "world-cup-2026",
    sectionTitle: "⚽ Camino al Mundial 2026",
    sectionMessage: "Datos curiosos del fútbol mundial — contenido para disfrutar mientras exploras.",
    active: true,
    sortOrder: 6,
    slides: [
      {
        id: "wc-48",
        imageUrl:
          "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80",
        title: "48 selecciones",
        description: "¿Sabías que el Mundial 2026 será el primero con 48 selecciones?",
      },
      {
        id: "wc-hosts",
        imageUrl:
          "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&auto=format&fit=crop&q=80",
        title: "Tres países anfitriones",
        description: "¿Sabías que será organizado por Estados Unidos, México y Canadá?",
      },
      {
        id: "wc-records",
        imageUrl:
          "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&auto=format&fit=crop&q=80",
        title: "Récords históricos",
        description: "Brasil es el país con más Copas del Mundo: cinco títulos.",
      },
      {
        id: "wc-legends",
        imageUrl:
          "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=80",
        title: "Momentos legendarios",
        description: "El Mundial 1950 en Brasil dejó una de las finales más recordadas de la historia.",
      },
      {
        id: "wc-dates",
        imageUrl:
          "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&auto=format&fit=crop&q=80",
        title: "Junio – Julio 2026",
        description: "La fiesta del fútbol regresa con sedes en ciudades de toda Norteamérica.",
      },
    ],
  },
];

function sortActiveBlocks(blocks: CatalogCarouselBlock[]): CatalogCarouselBlock[] {
  return blocks.filter((b) => b.active).sort((a, b) => a.sortOrder - b.sortOrder);
}

export const catalogCarouselService = {
  async listActiveBlocks(): Promise<CatalogCarouselBlock[]> {
    if (!env.isSupabaseConfigured) {
      return sortActiveBlocks(PLACEHOLDER_BLOCKS);
    }

    // Futuro: supabase.from("catalog_carousels").select(...).eq("active", true).order("sort_order")
    return sortActiveBlocks(PLACEHOLDER_BLOCKS);
  },

  /** Rota bloques para que cada separador del catálogo muestre un carrusel distinto. */
  resolveBlockForSlot(blocks: CatalogCarouselBlock[], slotIndex: number): CatalogCarouselBlock | null {
    const active = sortActiveBlocks(blocks);
    if (active.length === 0) return null;
    return active[slotIndex % active.length];
  },
};

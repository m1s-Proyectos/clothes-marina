import type { Product } from "@/types";
import type { SeasonFavoriteCarouselRow } from "@/types/productRating";
import type { CustomerLovedCarouselRow } from "@/types/whatsappLead";
import type { CatalogCarouselBlock, CatalogCarouselSlide } from "@/types/catalogCarousel";
import { formatCurrency } from "@/utils/format";

export const NEW_ARRIVALS_PRODUCT_LIMIT = 4;
export const RECOMMENDED_OFFERS_PRODUCT_LIMIT = 8;
export const SEASON_FAVORITES_PRODUCT_LIMIT = 5;
export const CUSTOMER_LOVED_PRODUCT_LIMIT = 5;
export function productCarouselImageUrl(product: Product): string {
  return product.main_image_url || product.product_images?.[0]?.image_url || "";
}

export function productToCarouselSlide(product: Product): CatalogCarouselSlide | null {
  const imageUrl = productCarouselImageUrl(product);
  if (!imageUrl) return null;

  const categoryName = product.categories?.name;
  return {
    id: `latest-product-${product.id}`,
    imageUrl,
    title: product.name,
    subtitle: categoryName ? `Nuevo · ${categoryName}` : "Recién agregado al catálogo",
    href: `/product/${product.id}`,
  };
}

export function seasonFavoriteToCarouselSlide(row: SeasonFavoriteCarouselRow): CatalogCarouselSlide | null {
  const imageUrl = row.main_image_url?.trim();
  if (!imageUrl) return null;

  const voteLabel =
    row.vote_count === 1 ? "1 calificación esta semana" : `${row.vote_count} calificaciones esta semana`;

  return {
    id: `season-favorite-${row.product_id}`,
    imageUrl,
    title: row.product_name,
    subtitle: `⭐ ${row.average_rating.toFixed(1)} · ${voteLabel}`,
    href: `/product/${row.product_id}`,
  };
}

export function offerProductToCarouselSlide(product: Product): CatalogCarouselSlide | null {
  const imageUrl = productCarouselImageUrl(product);
  if (!imageUrl) return null;

  let subtitle = "Promoción activa";
  if (product.offer_active && product.offer_quantity && product.offer_price != null) {
    subtitle = `🏷️ ${product.offer_quantity} x ${formatCurrency(product.offer_price)}`;
  }

  return {
    id: `offer-product-${product.id}`,
    imageUrl,
    title: product.name,
    subtitle,
    href: `/product/${product.id}`,
  };
}

export function buildRecommendedOfferSlides(products: Product[]): CatalogCarouselSlide[] {
  return products
    .slice(0, RECOMMENDED_OFFERS_PRODUCT_LIMIT)
    .map(offerProductToCarouselSlide)
    .filter((slide): slide is CatalogCarouselSlide => slide !== null);
}

export function buildLatestProductSlides(products: Product[]): CatalogCarouselSlide[] {
  return products
    .slice(0, NEW_ARRIVALS_PRODUCT_LIMIT)
    .map(productToCarouselSlide)
    .filter((slide): slide is CatalogCarouselSlide => slide !== null);
}

export function customerLovedToCarouselSlide(row: CustomerLovedCarouselRow): CatalogCarouselSlide | null {
  const imageUrl = row.main_image_url?.trim();
  if (!imageUrl) return null;

  const requestLabel =
    row.request_count === 1
      ? "1 cliente lo solicitó por WhatsApp"
      : `${row.request_count} clientes lo han solicitado`;

  return {
    id: `customer-loved-${row.product_id}`,
    imageUrl,
    title: row.product_name,
    subtitle: `💬 ${requestLabel}`,
    href: `/product/${row.product_id}`,
  };
}

export function buildCustomerLovedSlides(rows: CustomerLovedCarouselRow[]): CatalogCarouselSlide[] {
  return rows
    .slice(0, CUSTOMER_LOVED_PRODUCT_LIMIT)
    .map(customerLovedToCarouselSlide)
    .filter((slide): slide is CatalogCarouselSlide => slide !== null);
}

export function buildSeasonFavoriteSlides(rows: SeasonFavoriteCarouselRow[]): CatalogCarouselSlide[] {
  return rows
    .slice(0, SEASON_FAVORITES_PRODUCT_LIMIT)
    .map(seasonFavoriteToCarouselSlide)
    .filter((slide): slide is CatalogCarouselSlide => slide !== null);
}

/** Sustituye slides dinámicos del catálogo. */
export function hydrateCarouselBlocks(
  blocks: CatalogCarouselBlock[],
  latestProducts: Product[],
  recommendedOffers: Product[] = [],
  seasonFavorites: SeasonFavoriteCarouselRow[] = [],
  customerLoved: CustomerLovedCarouselRow[] = [],
): CatalogCarouselBlock[] {
  const latestSlides = buildLatestProductSlides(latestProducts);
  const recommendedSlides = buildRecommendedOfferSlides(recommendedOffers);
  const seasonSlides = buildSeasonFavoriteSlides(seasonFavorites);
  const lovedSlides = buildCustomerLovedSlides(customerLoved);

  return blocks.map((block) => {
    if (block.type === "new-arrivals") return { ...block, slides: latestSlides };
    if (block.type === "recommended") return { ...block, slides: recommendedSlides };
    if (block.type === "season-favorites") return { ...block, slides: seasonSlides };
    if (block.type === "customer-loved") return { ...block, slides: lovedSlides };
    return block;
  });
}

/** @deprecated Usar hydrateCarouselBlocks */
export function hydrateCarouselBlocksWithLatestProducts(
  blocks: CatalogCarouselBlock[],
  latestProducts: Product[],
): CatalogCarouselBlock[] {
  return hydrateCarouselBlocks(blocks, latestProducts, [], [], []);
}

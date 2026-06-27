import type { Product } from "@/types";

export type CatalogGridItem =
  | { kind: "product"; product: Product }
  | { kind: "promo-carousel"; key: string; slotIndex: number };

/**
 * Intercala carruseles editoriales entre bloques de productos.
 * @param interval Productos antes de cada carrusel (4 móvil, 6 tablet/desktop).
 */
export function buildCatalogGridItems(products: Product[], interval: number): CatalogGridItem[] {
  if (interval <= 0) {
    return products.map((product) => ({ kind: "product", product }));
  }

  const items: CatalogGridItem[] = [];
  let carouselSlot = 0;

  products.forEach((product, index) => {
    items.push({ kind: "product", product });
    const count = index + 1;
    if (count % interval === 0 && count < products.length) {
      items.push({ kind: "promo-carousel", key: `promo-after-${count}`, slotIndex: carouselSlot });
      carouselSlot += 1;
    }
  });

  return items;
}

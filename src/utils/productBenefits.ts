import type { Product } from "@/types";

/** Beneficios genéricos (futuro: tabla `product_benefits` en Supabase). */
const DEFAULT_BENEFITS = [
  "Buena calidad",
  "Ideal para uso diario",
  "Diseño moderno",
  "Fácil de combinar",
  "Prenda versátil",
  "Material cómodo",
  "Confort garantizado",
  "Muy solicitado",
] as const;

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Selecciona beneficios priorizados según atributos del producto.
 * Devuelve hasta 6 entradas; el UI muestra 2–5 según espacio disponible.
 */
export function getProductBenefits(product: Product): string[] {
  const picked: string[] = [];
  const categoryName = normalize(product.categories?.name ?? "");
  const description = normalize(product.description ?? "");
  const name = normalize(product.name ?? "");

  const add = (label: string) => {
    if (!picked.includes(label)) picked.push(label);
  };

  if (product.featured) add("Selección de la tienda");
  if (product.offer_active) add("Excelente relación calidad-precio");
  if (product.available) add("Producto nuevo");

  if (categoryName.includes("nino") || categoryName.includes("nina") || categoryName.includes("infantil")) {
    add("Ideal para toda la familia");
  }

  if (product.color?.trim()) add("Disponible en varios colores");
  if (product.size?.trim()) add("Disponible en varias tallas");

  if (name.includes("unisex") || description.includes("unisex")) add("Prenda versátil");
  if (product.featured) add("Producto recomendado");

  for (const label of DEFAULT_BENEFITS) {
    if (picked.length >= 6) break;
    add(label);
  }

  return picked;
}

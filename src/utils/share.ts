import env from "@/config/env";

const DEFAULT_WHATSAPP_PHONE = "50379128469";

export function buildProductUrl(productId: string): string {
  return `${env.appUrl}/product/${productId}`;
}

function trimForQuery(value: string, maxLength: number): string {
  const clean = value.trim();
  return clean.length > maxLength ? `${clean.slice(0, maxLength - 1)}…` : clean;
}

export function buildProductShareUrl(productId: string, productName?: string, productImageUrl?: string, productDescription?: string): string {
  const params = new URLSearchParams({ id: productId });
  if (productName) params.set("t", trimForQuery(productName, 120));
  if (productImageUrl) params.set("img", productImageUrl);
  if (productDescription) params.set("d", trimForQuery(productDescription, 220));
  return `${env.appUrl}/api/share/product?${params.toString()}`;
}

function normalizePhone(rawPhone: string): string {
  return rawPhone.replace(/[^\d]/g, "");
}

function getSafeWhatsAppPhone(): string {
  const normalized = normalizePhone(env.whatsappPhone);
  if (normalized.length >= 8) return normalized;
  return DEFAULT_WHATSAPP_PHONE;
}

export function getFacebookShareUrl(productId: string, productName?: string, productImageUrl?: string, productDescription?: string): string {
  const productUrl = buildProductShareUrl(productId, productName, productImageUrl, productDescription);
  const quote = productName ? `Mira este producto: ${productName}` : "Mira este producto";
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}&quote=${encodeURIComponent(quote)}`;
}

export function getTwitterShareUrl(productId: string, productName?: string, productImageUrl?: string, productDescription?: string): string {
  return `https://twitter.com/intent/tweet?url=${encodeURIComponent(
    buildProductShareUrl(productId, productName, productImageUrl, productDescription)
  )}`;
}

export function getInstagramUrl(): string {
  return "https://www.instagram.com/";
}

export function getWhatsAppProductUrl(productId: string, _productName: string, productImageUrl?: string): string {
  const productLink = buildProductUrl(productId);
  const lines = [
    `Link: ${productLink}`,
    productImageUrl ? `Imagen: ${productImageUrl}` : ""
  ].filter(Boolean);
  return `https://wa.me/?text=${encodeURIComponent(lines.join("\n"))}`;
}

export function getWhatsAppOrderUrl(productId: string, productName: string): string {
  const productLink = buildProductUrl(productId);
  const text = [
    `Hola, quiero solicitar el producto: ${productName}.`,
    "Quiero coordinar la entrega.",
    `Link: ${productLink}`
  ].join("\n");
  return `https://wa.me/${getSafeWhatsAppPhone()}?text=${encodeURIComponent(text)}`;
}

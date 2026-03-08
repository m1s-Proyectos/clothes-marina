import env from "@/config/env";

const DEFAULT_WHATSAPP_PHONE = "50379128469";

export function buildProductUrl(productId: string): string {
  return `${env.appUrl}/product/${productId}`;
}

function normalizePhone(rawPhone: string): string {
  return rawPhone.replace(/[^\d]/g, "");
}

function getSafeWhatsAppPhone(): string {
  const normalized = normalizePhone(env.whatsappPhone);
  if (normalized.length >= 8) return normalized;
  return DEFAULT_WHATSAPP_PHONE;
}

export function getFacebookShareUrl(productId: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(buildProductUrl(productId))}`;
}

export function getTwitterShareUrl(productId: string): string {
  return `https://twitter.com/intent/tweet?url=${encodeURIComponent(buildProductUrl(productId))}`;
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

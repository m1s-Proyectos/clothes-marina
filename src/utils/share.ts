import env from "@/config/env";

export function buildProductUrl(productId: string): string {
  return `${env.appUrl}/product/${productId}`;
}

export function getFacebookShareUrl(productId: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(buildProductUrl(productId))}`;
}

export function getTwitterShareUrl(productId: string): string {
  return `https://twitter.com/intent/tweet?url=${encodeURIComponent(buildProductUrl(productId))}`;
}

export function getWhatsAppProductUrl(productName: string): string {
  const text = `Hello I want information about ${productName}`;
  return `https://wa.me/${env.whatsappPhone}?text=${encodeURIComponent(text)}`;
}

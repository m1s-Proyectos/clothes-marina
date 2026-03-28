import env from "@/config/env";

const DEFAULT_WHATSAPP_PHONE = "50379128469";

export interface ShareParams {
  productId: string;
  productName: string;
  productImageUrl?: string;
  productDescription?: string;
}

export function buildProductUrl(productId: string): string {
  return `${env.appUrl}/product/${productId}`;
}

function trimForQuery(value: string, maxLength: number): string {
  const clean = value.trim();
  return clean.length > maxLength ? `${clean.slice(0, maxLength - 1)}…` : clean;
}

export function buildProductShareUrl(p: ShareParams): string {
  const params = new URLSearchParams({ id: p.productId });
  params.set("v", Date.now().toString());
  if (p.productName) params.set("t", trimForQuery(p.productName, 120));
  if (p.productImageUrl) params.set("img", p.productImageUrl);
  if (p.productDescription) params.set("d", trimForQuery(p.productDescription, 220));
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

export function getFacebookShareUrl(p: ShareParams): string {
  const shareUrl = buildProductShareUrl(p);
  const quote = p.productName ? `Mira este producto: ${p.productName}` : "Mira este producto";
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(quote)}`;
}

export function getTwitterShareUrl(p: ShareParams): string {
  return `https://twitter.com/intent/tweet?url=${encodeURIComponent(buildProductShareUrl(p))}`;
}

export function getMessengerShareUrl(p: ShareParams): string {
  const shareUrl = buildProductShareUrl(p);
  return `fb-messenger://share/?link=${encodeURIComponent(shareUrl)}`;
}

export function getInstagramShareUrl(p: ShareParams): string {
  return buildProductShareUrl(p);
}

export function getWhatsAppProductUrl(p: ShareParams): string {
  const shareUrl = buildProductShareUrl(p);
  const text = `Mira este producto: ${p.productName}\n${shareUrl}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function getWhatsAppOrderUrl(p: ShareParams): string {
  const shareUrl = buildProductShareUrl(p);
  const text = [
    `Hola, quiero solicitar el producto: ${p.productName}.`,
    "Quiero coordinar la entrega.",
    shareUrl,
  ].join("\n");
  return `https://wa.me/${getSafeWhatsAppPhone()}?text=${encodeURIComponent(text)}`;
}

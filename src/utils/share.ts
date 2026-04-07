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

/**
 * Misma lógica que en la ficha de producto: Web Share API con imagen OG para historias, o copiar enlace + abrir Instagram.
 */
export async function runInstagramShareFlow(p: ShareParams): Promise<string> {
  const shareUrl = getInstagramShareUrl(p);

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      const shareData: ShareData = {
        title: p.productName,
        text: `Mira este producto: ${p.productName}`,
        url: shareUrl,
      };

      if (navigator.canShare) {
        try {
          const proxyUrl = `${env.appUrl}/api/share/image?id=${p.productId}&img=${encodeURIComponent(p.productImageUrl ?? "")}`;
          const imgRes = await fetch(proxyUrl);
          if (imgRes.ok) {
            const blob = await imgRes.blob();
            const file = new File([blob], `${p.productName}.jpg`, { type: "image/jpeg" });
            if (navigator.canShare({ files: [file] })) {
              shareData.files = [file];
            }
          }
        } catch {
          /* compartir sin imagen */
        }
      }

      await navigator.share(shareData);
      return "";
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return "";
    }
  }

  try {
    await navigator.clipboard.writeText(shareUrl);
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
    return "Enlace copiado. Pegalo en tu historia de Instagram.";
  } catch {
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
    return "No se pudo copiar. Copia el enlace desde la barra del navegador.";
  }
}

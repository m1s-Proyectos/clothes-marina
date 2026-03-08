import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "@/types";
import { formatCurrency } from "@/utils/format";
import { buildProductUrl, getFacebookShareUrl, getTwitterShareUrl, getWhatsAppOrderUrl, getWhatsAppProductUrl } from "@/utils/share";
import { whatsAppLeadService } from "@/services/whatsAppLeadService";
import OptimizedImage from "@/components/common/OptimizedImage";

interface ProductCardProps {
  product: Product;
}

type SharePlatform = "facebook" | "twitter";

export default function ProductCard({ product }: ProductCardProps) {
  const productUrl = `/product/${product.id}`;
  const [shareModal, setShareModal] = useState<SharePlatform | null>(null);
  const [shareNote, setShareNote] = useState("");

  useEffect(() => {
    if (!shareModal) return;

    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        setShareModal(null);
        setShareNote("");
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [shareModal]);

  async function copyProductLinkToClipboard(): Promise<void> {
    const link = buildProductUrl(product.id);
    try {
      await navigator.clipboard.writeText(link);
      setShareNote("Enlace copiado, ahora puedes pegarlo en el chat.");
    } catch {
      setShareNote("No se pudo copiar automaticamente. Puedes copiar el enlace desde la barra del navegador.");
    }
  }

  function openShareModal(platform: SharePlatform): void {
    setShareModal(platform);
    setShareNote("");
  }

  function closeShareModal(): void {
    setShareModal(null);
    setShareNote("");
  }

  function shareAsPost(): void {
    if (!shareModal) return;

    if (shareModal === "facebook") {
      window.open(getFacebookShareUrl(product.id), "_blank", "noopener,noreferrer");
    } else {
      window.open(getTwitterShareUrl(product.id), "_blank", "noopener,noreferrer");
    }

    closeShareModal();
  }

  function shareAsMessage(): void {
    if (!shareModal) return;

    void copyProductLinkToClipboard();
    if (shareModal === "facebook") {
      window.open("https://www.facebook.com/messages/", "_blank", "noopener,noreferrer");
    } else {
      window.open("https://x.com/messages", "_blank", "noopener,noreferrer");
    }
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900"
    >
      <Link to={productUrl} aria-label={`Ver detalles de ${product.name}`}>
        <OptimizedImage
          src={product.main_image_url}
          alt={product.name}
          loading="lazy"
          decoding="async"
          transform={{ width: 640, quality: 70, format: "webp", resize: "cover" }}
          responsiveWidths={[320, 480, 640]}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="h-72 w-full object-cover transition hover:opacity-90"
        />
      </Link>
      <div className="space-y-3 p-4">
        <h3 className="text-lg font-semibold">
          <Link to={productUrl} className="transition hover:text-luxury-100">
            {product.name}
          </Link>
        </h3>
        <p className="text-sm text-neutral-300">{formatCurrency(product.reference_price)}</p>
        <div className="flex flex-wrap gap-2 text-xs">
          <Link to={productUrl} className="rounded bg-luxury-500 px-3 py-2 font-semibold text-neutral-950 hover:bg-luxury-400">
            Ver detalles
          </Link>
          <button type="button" className="rounded bg-neutral-800 px-3 py-2 hover:bg-neutral-700" onClick={() => openShareModal("facebook")}>
            Facebook
          </button>
          <button type="button" className="rounded bg-neutral-800 px-3 py-2 hover:bg-neutral-700" onClick={() => openShareModal("twitter")}>
            Twitter
          </button>
          <a
            className="rounded bg-green-600 px-3 py-2 hover:bg-green-700"
            target="_blank"
            rel="noreferrer"
            href={getWhatsAppProductUrl(product.id, product.name, product.main_image_url)}
          >
            Compartir por WhatsApp
          </a>
          <a
            className="rounded bg-emerald-700 px-3 py-2 font-semibold hover:bg-emerald-800"
            target="_blank"
            rel="noreferrer"
            href={getWhatsAppOrderUrl(product.id, product.name)}
            onClick={() => void whatsAppLeadService.trackProductInquiry({ productId: product.id, productName: product.name })}
          >
            Solicitar producto
          </a>
        </div>
      </div>

      {shareModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          onClick={closeShareModal}
        >
          <div
            className="w-full max-w-md rounded-xl border border-neutral-700 bg-neutral-900 p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h4 className="text-lg font-semibold text-white">Compartir en {shareModal === "facebook" ? "Facebook" : "X (Twitter)"}</h4>
            <p className="mt-2 text-sm text-neutral-300">Elige como quieres compartir este producto.</p>

            <div className="mt-4 grid gap-2">
              <button type="button" onClick={shareAsMessage} className="rounded bg-neutral-800 px-4 py-2 text-sm hover:bg-neutral-700">
                Mensaje privado
              </button>
              <button type="button" onClick={shareAsPost} className="rounded bg-luxury-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-luxury-400">
                Publicacion
              </button>
              <button type="button" onClick={closeShareModal} className="rounded border border-neutral-700 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-800">
                Cancelar
              </button>
            </div>

            {shareNote && <p className="mt-3 text-xs text-neutral-400">{shareNote}</p>}
          </div>
        </div>
      )}
    </motion.article>
  );
}

import { motion } from "framer-motion";
import { useState, type SyntheticEvent } from "react";
import { Link } from "react-router-dom";
import type { Product } from "@/types";
import { formatCurrency } from "@/utils/format";
import { getWhatsAppOrderUrl } from "@/utils/share";
import { whatsAppLeadService } from "@/services/whatsAppLeadService";
import OptimizedImage from "@/components/common/OptimizedImage";
import ReturnToSiteBar from "@/components/common/ReturnToSiteBar";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const productUrl = `/product/${product.id}`;
  const [showReturnButton, setShowReturnButton] = useState(false);
  const [isLandscapeImage, setIsLandscapeImage] = useState(false);

  function handleImageLoad(event: SyntheticEvent<HTMLImageElement>): void {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    if (!naturalWidth || !naturalHeight) return;
    setIsLandscapeImage(naturalWidth > naturalHeight);
  }

  const shareParams = { productId: product.id, productName: product.name, productImageUrl: product.main_image_url, productDescription: product.description };

  function openWhatsAppOrder(): void {
    void whatsAppLeadService.trackProductInquiry({ productId: product.id, productName: product.name });
    window.open(getWhatsAppOrderUrl(shareParams), "_blank", "noopener,noreferrer");
    setShowReturnButton(true);
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group overflow-hidden rounded-xl border border-luxury-500/10 bg-surface-card transition-all duration-200 hover:border-luxury-400/25 hover:shadow-lg hover:shadow-luxury-900/15"
    >
      {/* ── Image — edge-to-edge, no inner padding ── */}
      <Link to={productUrl} aria-label={`Ver detalles de ${product.name}`} className="block overflow-hidden">
        <div className="aspect-[3/4] w-full overflow-hidden bg-surface-hover">
          <OptimizedImage
            src={product.main_image_url}
            alt={product.name}
            loading="lazy"
            decoding="async"
            onLoad={handleImageLoad}
            transform={{ width: 480, quality: 78, format: "webp", resize: "contain" }}
            responsiveWidths={[240, 360, 480]}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.04] ${
              isLandscapeImage ? "scale-[1.15]" : ""
            }`}
          />
        </div>
      </Link>

      {/* ── Meta + actions ── */}
      <div className="px-2.5 pb-2.5 pt-2">
        {/* Name */}
        <h3 className="line-clamp-2 text-[12.5px] font-medium leading-snug tracking-[0.01em] text-neutral-200">
          <Link to={productUrl} className="transition hover:text-luxury-200">
            {product.name}
          </Link>
        </h3>

        {/* Price — typographic, no background badge */}
        <div className="mt-1">
          {product.offer_active && product.offer_quantity && product.offer_price != null ? (
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-[13px] font-semibold text-luxury-300">
                {formatCurrency(product.reference_price)}
              </span>
              <span className="text-[11px] text-neutral-500">/ ud.</span>
              <span className="w-full text-[12px] font-semibold text-red-400">
                {product.offer_quantity} x {formatCurrency(product.offer_price)}
                <span className="ml-1.5 rounded bg-red-500/15 px-1 py-px text-[10px] font-semibold uppercase tracking-wider text-red-300">
                  Oferta
                </span>
              </span>
            </div>
          ) : (
            <div className="flex items-baseline gap-1.5">
              <span className="text-[13px] font-semibold text-luxury-300">
                {formatCurrency(product.reference_price)}
              </span>
              <span className="text-[11px] text-neutral-500">/ ud.</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-2 space-y-1.5">
          <Link
            to={productUrl}
            className="block w-full rounded-lg bg-luxury-400 px-3 py-1.5 text-center text-[11.5px] font-semibold tracking-wide text-surface-base transition hover:bg-luxury-300"
          >
            Ver Detalles
          </Link>
          <button
            type="button"
            onClick={openWhatsAppOrder}
            className="w-full rounded-lg border border-luxury-500/35 bg-transparent px-3 py-1.5 text-[11.5px] font-medium tracking-wide text-luxury-300 transition hover:border-luxury-400/60 hover:text-luxury-200"
          >
            Solicitar por WhatsApp
          </button>
        </div>
      </div>

      {showReturnButton && <ReturnToSiteBar onClose={() => setShowReturnButton(false)} />}
    </motion.article>
  );
}

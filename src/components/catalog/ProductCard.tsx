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
  const [isLandscape, setIsLandscape] = useState(false);

  function handleImageLoad(e: SyntheticEvent<HTMLImageElement>) {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalWidth && naturalHeight) {
      setIsLandscape(naturalWidth > naturalHeight);
    }
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
      className="group relative rounded-lg bg-surface-card shadow-sm shadow-black/6 ring-1 ring-black/5 transition-shadow duration-300 hover:shadow-md hover:shadow-black/10"
    >
      {/* ── Image block ── */}
      <Link to={productUrl} aria-label={`Ver detalles de ${product.name}`} className="block overflow-hidden rounded-t-lg">
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface-hover">
          <OptimizedImage
            src={product.main_image_url}
            alt={product.name}
            loading="lazy"
            decoding="async"
            onLoad={handleImageLoad}
            transform={{ width: 480, quality: 78, format: "webp", resize: "cover" }}
            responsiveWidths={[240, 360, 480]}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={[
              "h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]",
              // Portrait: anchor 15% from top — preserves faces/necklines, crops feet first
              // Landscape: center anchor + slight scale-down — prevents over-cropping wide shots
              isLandscape
                ? "object-center scale-[0.92]"
                : "object-[center_15%]",
            ].join(" ")}
          />

          {/* Persistent CTA bar — always visible, works on touch and pointer */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/40 to-transparent pb-2.5 pt-6">
            <span className="flex items-center justify-center gap-1 font-sans text-[10.5px] font-medium uppercase tracking-[0.16em] text-white">
              Ver producto
              <svg className="h-3 w-3 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </Link>

      {/* ── Caption ── */}
      <div className="px-3 pb-3 pt-2.5">
        {/* Name — sans-serif, always visible up to 2 lines, clearly readable */}
        <h3 className="line-clamp-2 font-sans text-[14px] font-medium leading-normal tracking-[0.005em] text-neutral-900 sm:text-[15px]">
          <Link to={productUrl} className="transition-colors hover:text-luxury-700">
            {product.name}
          </Link>
        </h3>

        {/* Price — slightly larger than name, distinct gold-brown, clearly secondary to image */}
        <div className="mt-2">
          {product.offer_active && product.offer_quantity && product.offer_price != null ? (
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="font-sans text-[15px] font-semibold text-luxury-700 sm:text-[16px]">
                {product.offer_quantity} x {formatCurrency(product.offer_price)}
              </span>
              <span className="font-sans text-[12px] font-normal text-neutral-400 line-through">
                {formatCurrency(product.reference_price)}
              </span>
            </div>
          ) : (
            <span className="font-sans text-[15px] font-semibold text-luxury-700 sm:text-[16px]">
              {formatCurrency(product.reference_price)}
            </span>
          )}
        </div>

        {/* WhatsApp CTA — full-width, always-visible label, 44px min height */}
        <button
          type="button"
          onClick={openWhatsAppOrder}
          aria-label="Consultar disponibilidad por WhatsApp"
          className="mt-2.5 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 px-3 font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-white transition-colors hover:bg-neutral-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/60"
        >
          <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Consultar
        </button>
      </div>

      {showReturnButton && <ReturnToSiteBar onClose={() => setShowReturnButton(false)} />}
    </motion.article>
  );
}

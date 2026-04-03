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
      className="group overflow-hidden rounded-2xl border border-luxury-500/10 bg-surface-card transition-all duration-200 hover:border-luxury-400/25 hover:shadow-xl hover:shadow-luxury-900/10"
    >
      <Link to={productUrl} aria-label={`Ver detalles de ${product.name}`}>
        <div className="flex aspect-[4/5] items-center justify-center bg-luxury-50 p-3">
          <OptimizedImage
            src={product.main_image_url}
            alt={product.name}
            loading="lazy"
            decoding="async"
            onLoad={handleImageLoad}
            transform={{ width: 640, quality: 70, format: "webp", resize: "contain" }}
            responsiveWidths={[320, 480, 640]}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`h-full w-full rounded-xl object-contain transition-transform duration-300 group-hover:scale-[1.03] ${
              isLandscapeImage ? "scale-[1.22]" : ""
            }`}
          />
        </div>
      </Link>
      <div className="space-y-3 p-5">
        <h3 className="text-lg font-semibold leading-snug text-neutral-100">
          <Link to={productUrl} className="transition hover:text-luxury-200">
            {product.name}
          </Link>
        </h3>
        {product.offer_active && product.offer_quantity && product.offer_price != null ? (
          <div className="space-y-1.5">
            <p className="inline-flex items-baseline rounded-lg bg-luxury-500/15 px-3 py-2 text-xl font-extrabold tracking-wide text-luxury-200">
              {formatCurrency(product.reference_price)} <span className="ml-1.5 text-sm font-normal text-luxury-300">x unidad</span>
            </p>
            <p className="inline-flex items-center gap-2 rounded-lg bg-red-500/15 px-3 py-2 text-xl font-extrabold tracking-wide text-red-400">
              {product.offer_quantity} x {formatCurrency(product.offer_price)}
              <span className="text-xs font-semibold uppercase tracking-wider text-red-300">¡Aprovecha nuestra oferta!</span>
            </p>
          </div>
        ) : (
          <p className="inline-flex items-baseline rounded-lg bg-luxury-500/15 px-3 py-2 text-xl font-extrabold tracking-wide text-luxury-200">
            {formatCurrency(product.reference_price)} <span className="ml-1.5 text-sm font-normal text-luxury-300">x unidad</span>
          </p>
        )}
        <div className="space-y-2 pt-1">
          <Link
            to={productUrl}
            className="block w-full rounded-xl bg-luxury-400 px-4 py-2.5 text-center text-sm font-bold text-surface-base shadow-md shadow-luxury-900/15 transition hover:bg-luxury-300 hover:shadow-lg"
          >
            Ver Detalles Producto
          </Link>
          <button
            type="button"
            className="w-full rounded-xl bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
            onClick={openWhatsAppOrder}
          >
            Solicitar producto
          </button>
        </div>
      </div>

      {showReturnButton && <ReturnToSiteBar onClose={() => setShowReturnButton(false)} />}
    </motion.article>
  );
}

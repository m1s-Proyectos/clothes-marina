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
      className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900"
    >
      <Link to={productUrl} aria-label={`Ver detalles de ${product.name}`}>
        <div className="flex aspect-[4/5] items-center justify-center rounded-2xl bg-luxury-50 p-3">
          <OptimizedImage
            src={product.main_image_url}
            alt={product.name}
            loading="lazy"
            decoding="async"
            onLoad={handleImageLoad}
            transform={{ width: 640, quality: 70, format: "webp", resize: "contain" }}
            responsiveWidths={[320, 480, 640]}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`h-full w-full rounded-xl object-contain transition hover:scale-[1.02] ${
              isLandscapeImage ? "scale-[1.22]" : ""
            }`}
          />
        </div>
      </Link>
      <div className="space-y-3 p-4">
        <h3 className="text-lg font-semibold">
          <Link to={productUrl} className="transition hover:text-luxury-100">
            {product.name}
          </Link>
        </h3>
        <p className="inline-flex rounded-lg bg-luxury-500/20 px-3 py-2 text-xl font-extrabold tracking-wide text-luxury-100">
          {formatCurrency(product.reference_price)} <span className="ml-1 text-sm font-normal text-luxury-200">x unidad</span>
        </p>
        <div className="space-y-2">
          <Link
            to={productUrl}
            className="block w-full rounded-lg bg-luxury-500 px-4 py-2 text-center text-sm font-bold text-neutral-950 shadow-lg shadow-luxury-900/20 transition hover:bg-luxury-400"
          >
            Ver Detalles Producto
          </Link>
          <button type="button" className="w-full rounded bg-emerald-700 px-3 py-2 font-semibold hover:bg-emerald-800" onClick={openWhatsAppOrder}>
            Solicitar producto
          </button>
        </div>
      </div>

      {showReturnButton && <ReturnToSiteBar onClose={() => setShowReturnButton(false)} />}
    </motion.article>
  );
}

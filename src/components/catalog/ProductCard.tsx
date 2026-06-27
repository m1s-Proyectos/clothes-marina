import { motion } from "framer-motion";
import { useMemo, useState, type SyntheticEvent } from "react";
import { Link } from "react-router-dom";
import type { Product } from "@/types";
import { formatCurrency } from "@/utils/format";
import { getWhatsAppOrderUrl } from "@/utils/share";
import { whatsAppLeadService } from "@/services/whatsAppLeadService";
import OptimizedImage from "@/components/common/OptimizedImage";
import CatalogProductCardMedia from "@/components/catalog/CatalogProductCardMedia";
import BenefitsSection from "@/components/catalog/BenefitsSection";
import ReturnToSiteBar from "@/components/common/ReturnToSiteBar";
import { getProductBenefits } from "@/utils/productBenefits";

interface ProductCardProps {
  product: Product;
  /** Vista de catálogo: 2 columnas en móvil con imagen adaptativa. */
  variant?: "default" | "catalog";
}

export default function ProductCard({ product, variant = "default" }: ProductCardProps) {
  const isCatalog = variant === "catalog";
  const productUrl = `/product/${product.id}`;
  const productBenefits = useMemo(() => (isCatalog ? getProductBenefits(product) : []), [isCatalog, product]);
  const [showReturnButton, setShowReturnButton] = useState(false);
  const [isLandscapeImage, setIsLandscapeImage] = useState(false);

  function handleImageLoad(event: SyntheticEvent<HTMLImageElement>): void {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    if (!naturalWidth || !naturalHeight) return;
    setIsLandscapeImage(naturalWidth > naturalHeight);
  }

  const shareParams = {
    productId: product.id,
    productName: product.name,
    productImageUrl: product.main_image_url,
    productDescription: product.description,
  };

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
      className={`group flex h-full flex-col overflow-hidden border border-luxury-200/70 bg-white transition-all duration-200 hover:border-luxury-400/45 hover:shadow-xl hover:shadow-luxury-900/10 ${
        isCatalog ? "catalog-product-card rounded-lg md:rounded-2xl" : "rounded-2xl"
      }`}
    >
      {isCatalog ? (
        <CatalogProductCardMedia src={product.main_image_url} alt={product.name} productUrl={productUrl} />
      ) : (
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
      )}

      <div
        className={
          isCatalog
            ? "catalog-product-card__body flex min-h-0 flex-1 flex-col space-y-1 p-2 md:space-y-3 md:p-5"
            : "space-y-3 p-5"
        }
      >
        <h3
          className={
            isCatalog
              ? "text-[0.8125rem] font-bold leading-tight text-slate-950 line-clamp-2 md:text-[1.3125rem] md:leading-snug md:line-clamp-none"
              : "text-[1.3125rem] font-bold leading-snug text-slate-950"
          }
        >
          <Link to={productUrl} className="transition hover:text-luxury-800">
            {product.name}
          </Link>
        </h3>

        {product.offer_active && product.offer_quantity && product.offer_price != null ? (
          <div className={isCatalog ? "space-y-0.5 md:space-y-1.5" : "space-y-1.5"}>
            <p
              className={
                isCatalog
                  ? "inline-flex max-w-full items-baseline rounded-md bg-luxury-100 px-1.5 py-0.5 text-xs font-bold tracking-wide text-luxury-900 md:rounded-lg md:px-3 md:py-2 md:text-xl md:font-extrabold"
                  : "inline-flex items-baseline rounded-lg bg-luxury-100 px-3 py-2 text-xl font-extrabold tracking-wide text-luxury-900"
              }
            >
              {formatCurrency(product.reference_price)}
              <span className="ml-1 text-[10px] font-normal text-luxury-700 md:ml-1.5 md:text-sm">x unidad</span>
            </p>
            <p
              className={
                isCatalog
                  ? "inline-flex max-w-full flex-wrap items-center gap-1 rounded-md bg-red-50 px-1.5 py-0.5 text-xs font-bold tracking-wide text-red-700 md:gap-2 md:rounded-lg md:px-3 md:py-2 md:text-xl md:font-extrabold"
                  : "inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xl font-extrabold tracking-wide text-red-700"
              }
            >
              {product.offer_quantity} x {formatCurrency(product.offer_price)}
              <span
                className={
                  isCatalog
                    ? "hidden text-xs font-semibold uppercase tracking-wider text-red-600 md:inline"
                    : "text-xs font-semibold uppercase tracking-wider text-red-600"
                }
              >
                ¡Aprovecha nuestra oferta!
              </span>
            </p>
          </div>
        ) : (
          <p
            className={
              isCatalog
                ? "inline-flex max-w-full items-baseline rounded-md bg-luxury-100 px-1.5 py-0.5 text-xs font-bold tracking-wide text-luxury-900 md:rounded-lg md:px-3 md:py-2 md:text-xl md:font-extrabold"
                : "inline-flex items-baseline rounded-lg bg-luxury-100 px-3 py-2 text-xl font-extrabold tracking-wide text-luxury-900"
            }
          >
            {formatCurrency(product.reference_price)}
            <span className="ml-1 text-[10px] font-normal text-luxury-700 md:ml-1.5 md:text-sm">x unidad</span>
          </p>
        )}

        {isCatalog ? <BenefitsSection benefits={productBenefits} /> : null}

        <div className={isCatalog ? "shrink-0 space-y-1 md:space-y-2" : "space-y-2 pt-1"}>
          <Link
            to={productUrl}
            className={
              isCatalog
                ? "block w-full rounded-md bg-luxury-600 px-2 py-1.5 text-center text-[10px] font-bold leading-tight text-white shadow-sm shadow-luxury-900/15 transition hover:bg-luxury-700 md:rounded-xl md:px-4 md:py-2.5 md:text-sm md:shadow-md"
                : "block w-full rounded-xl bg-luxury-600 px-4 py-2.5 text-center text-sm font-bold text-white shadow-md shadow-luxury-900/15 transition hover:bg-luxury-700 hover:shadow-lg"
            }
          >
            <span className="md:hidden">Ver detalles</span>
            <span className="hidden md:inline">Ver Detalles Producto</span>
          </Link>
          <button
            type="button"
            className={
              isCatalog
                ? "w-full rounded-md bg-emerald-600 px-2 py-1.5 text-[10px] font-semibold leading-tight text-white transition hover:bg-emerald-500 md:rounded-xl md:px-3 md:py-2.5 md:text-sm"
                : "w-full rounded-xl bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
            }
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

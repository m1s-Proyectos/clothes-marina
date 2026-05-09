import { useEffect, useState, type SyntheticEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Seo from "@/components/common/Seo";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ProductShareModal from "@/components/product/ProductShareModal";
import type { Product } from "@/types";
import { productService } from "@/services/productService";
import { formatCurrency } from "@/utils/format";
import { parseEmbeddedSpecsFromDescription, stripRedundantSpecsFromDescription } from "@/utils/productDescription";
import { getWhatsAppOrderUrl, type ShareParams } from "@/utils/share";
import { whatsAppLeadService } from "@/services/whatsAppLeadService";
import OptimizedImage from "@/components/common/OptimizedImage";
import ReturnToSiteBar from "@/components/common/ReturnToSiteBar";

type ImageOrientation = "loading" | "portrait" | "landscape" | "square";

export default function ProductDetailPage() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReturnButton, setShowReturnButton] = useState(false);
  const [shareNote, setShareNote] = useState("");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [orientation, setOrientation] = useState<ImageOrientation>("loading");

  function handleImageLoad(event: SyntheticEvent<HTMLImageElement>): void {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    if (!naturalWidth || !naturalHeight) return;
    const ratio = naturalWidth / naturalHeight;
    if (ratio > 1.15) setOrientation("landscape");
    else if (ratio < 0.85) setOrientation("portrait");
    else setOrientation("square");
  }

  useEffect(() => {
    if (!productId) return;
    setOrientation("loading");
    productService
      .getById(productId)
      .then(setProduct)
      .finally(() => setLoading(false));
  }, [productId]);

  const shareParams: ShareParams | null = product
    ? { productId: product.id, productName: product.name, productImageUrl: product.main_image_url, productDescription: product.description }
    : null;

  if (loading) return <LoadingSpinner />;
  if (!product || !shareParams) return <div className="container-shell py-20 text-neutral-500">Producto no encontrado.</div>;

  function detailLine(value: string | null | undefined): string {
    const t = value != null ? String(value).trim() : "";
    return t.length > 0 ? t : "—";
  }

  const embedded = parseEmbeddedSpecsFromDescription(product.description ?? "");
  const displayBrand = (product.brand ?? "").trim() || embedded.brand;
  const displayColor = (product.color ?? "").trim() || embedded.color;
  const displaySize = (product.size ?? "").trim() || embedded.size;

  const descriptionForDisplay = stripRedundantSpecsFromDescription(product.description ?? "", {
    brand: displayBrand,
    color: displayColor,
    size: displaySize,
  });

  return (
    <div className="container-shell py-10">
      <Seo
        title={product.name}
        description={product.description}
        path={`/product/${product.id}`}
        image={product.main_image_url}
        type="article"
      />
      <div className={`grid gap-8 ${orientation === "landscape" ? "lg:grid-cols-1" : "lg:grid-cols-2"}`}>
        <div
          className={`flex items-center justify-center rounded-2xl bg-surface-hover p-4 ${
            orientation === "landscape" ? "min-h-0" : "min-h-[420px]"
          }`}
        >
          <OptimizedImage
            src={product.main_image_url}
            alt={product.name}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            onLoad={handleImageLoad}
            transform={{ width: 1200, quality: 75, format: "webp", resize: "contain" }}
            responsiveWidths={[640, 960, 1200]}
            sizes={orientation === "landscape" ? "100vw" : "(max-width: 1024px) 100vw, 50vw"}
            className={`w-full rounded-xl object-contain ${orientation === "landscape" ? "max-h-[75vh]" : "max-h-[70vh]"}`}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-5">
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) navigate(-1);
              else navigate("/catalog");
            }}
            className="group inline-flex w-fit items-center gap-2 rounded-lg border border-black/12 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition hover:border-black/20 hover:bg-surface-hover hover:text-neutral-900"
          >
            <svg
              className="h-4 w-4 transition group-hover:-translate-x-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Regresar al catálogo
          </button>

          <section
            className="overflow-hidden rounded-2xl border border-black/8 bg-white p-6 shadow-sm shadow-black/5 md:p-8"
            aria-labelledby="product-detail-title"
          >
            {/* Product name — primary, high contrast */}
            <h1 id="product-detail-title" className="text-3xl font-semibold leading-tight text-neutral-900">
              {product.name}
            </h1>

            {/* Price — clearly readable, distinct from name */}
            <div className="mt-5 border-b border-black/8 pb-5">
              {product.offer_active && product.offer_quantity && product.offer_price != null ? (
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-2xl font-semibold text-luxury-700">
                    {product.offer_quantity} x {formatCurrency(product.offer_price)}
                  </span>
                  <span className="text-base font-normal text-neutral-400 line-through">
                    {formatCurrency(product.reference_price)}
                  </span>
                  <span className="rounded bg-red-50 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-red-600">
                    Oferta
                  </span>
                </div>
              ) : (
                <span className="text-2xl font-semibold text-luxury-700">
                  {formatCurrency(product.reference_price)}
                  <span className="ml-2 text-sm font-normal text-neutral-400">por unidad</span>
                </span>
              )}
            </div>

            {/* Product details — secondary text on neutral surface */}
            <div className="mt-5 rounded-xl border border-black/6 bg-surface-base p-4 sm:p-5">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Detalles del producto</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                <div>
                  <span className="text-xs uppercase tracking-wider text-neutral-400">Marca</span>
                  <p className="mt-1 font-medium text-neutral-800">{detailLine(displayBrand)}</p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-neutral-400">Color</span>
                  <p className="mt-1 font-medium text-neutral-800">{detailLine(displayColor)}</p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-neutral-400">Talla</span>
                  <p className="mt-1 font-medium text-neutral-800">{detailLine(displaySize)}</p>
                </div>
              </div>
            </div>

            {/* Description — secondary text, good line-height */}
            {descriptionForDisplay ? (
              <div className="mt-5 border-t border-black/6 pt-5">
                <h2 className="text-base font-semibold text-neutral-800">Descripción</h2>
                <p className="mt-2 leading-relaxed text-neutral-500">{descriptionForDisplay}</p>
              </div>
            ) : null}
          </section>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                void whatsAppLeadService.trackProductInquiry({ productId: product.id, productName: product.name });
                window.open(getWhatsAppOrderUrl(shareParams), "_blank", "noopener,noreferrer");
                setShowReturnButton(true);
              }}
              className="flex min-h-[44px] items-center rounded-lg bg-neutral-900 px-7 text-sm font-semibold uppercase tracking-[0.1em] text-white shadow-sm transition hover:bg-neutral-700 active:scale-[0.98]"
            >
              Solicitar producto
            </button>
            <button
              type="button"
              onClick={() => {
                setShareNote("");
                setShareModalOpen(true);
              }}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-black/12 bg-white px-7 text-sm font-medium text-neutral-700 transition hover:border-black/20 hover:bg-surface-hover"
            >
              <svg
                className="h-5 w-5 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
              </svg>
              Compartir con amigos
            </button>
          </div>

          {shareNote ? <p className="text-sm text-neutral-500">{shareNote}</p> : null}
          {showReturnButton && <ReturnToSiteBar onClose={() => setShowReturnButton(false)} />}

          <ProductShareModal
            isOpen={shareModalOpen}
            onClose={() => setShareModalOpen(false)}
            shareParams={shareParams}
            onAfterOpenShare={() => setShowReturnButton(true)}
            onInstagramNote={(message) => setShareNote(message)}
          />
        </div>
      </div>
    </div>
  );
}

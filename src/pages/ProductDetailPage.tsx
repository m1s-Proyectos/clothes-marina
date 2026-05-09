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
      .catch((error) => {
        console.warn("Unable to load product detail.", error);
        setProduct(null);
      })
      .finally(() => setLoading(false));
  }, [productId]);

  const shareParams: ShareParams | null = product
    ? { productId: product.id, productName: product.name, productImageUrl: product.main_image_url, productDescription: product.description }
    : null;

  if (loading) return <LoadingSpinner />;
  if (!product || !shareParams) return <div className="container-shell py-20 text-slate-500">Producto no encontrado.</div>;

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
          className={`flex items-center justify-center rounded-2xl bg-luxury-50 p-4 ${
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
            className="group inline-flex w-fit items-center gap-2 rounded-xl border border-luxury-300/70 bg-white px-5 py-2.5 text-sm font-semibold text-luxury-800 shadow-sm shadow-luxury-900/5 ring-1 ring-luxury-100 transition hover:border-luxury-500 hover:bg-surface-hover hover:text-luxury-900"
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
            className="relative overflow-hidden rounded-2xl border border-luxury-200/70 bg-white p-6 shadow-xl shadow-luxury-900/10 ring-1 ring-luxury-100 md:p-8"
            aria-labelledby="product-detail-title"
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-luxury-400/50 to-transparent"
              aria-hidden
            />
            <h1 id="product-detail-title" className="text-[2.0625rem] font-bold leading-tight tracking-tight text-slate-950 md:text-[2.1875rem]">
              {product.name}
            </h1>

            <div className="mt-6 border-b border-luxury-500/15 pb-6">
              {product.offer_active && product.offer_quantity && product.offer_price != null ? (
                <div className="space-y-3">
                  <p className="inline-flex items-baseline rounded-xl bg-luxury-100 px-4 py-2.5 text-2xl font-extrabold tracking-wide text-luxury-900">
                    {formatCurrency(product.reference_price)} <span className="ml-1.5 text-base font-normal text-luxury-700">x unidad</span>
                  </p>
                  <p className="inline-flex flex-wrap items-center gap-3 rounded-xl bg-red-50 px-4 py-2.5 text-2xl font-extrabold tracking-wide text-red-700">
                    {product.offer_quantity} x {formatCurrency(product.offer_price)}
                    <span className="text-sm font-semibold uppercase tracking-wider text-red-600">¡Aprovecha nuestra oferta!</span>
                  </p>
                </div>
              ) : (
                <p className="inline-flex items-baseline rounded-xl bg-luxury-100 px-4 py-2.5 text-2xl font-extrabold tracking-wide text-luxury-900">
                  {formatCurrency(product.reference_price)} <span className="ml-1.5 text-base font-normal text-luxury-700">x unidad</span>
                </p>
              )}
            </div>

            <div
              className="relative mt-6 overflow-hidden rounded-2xl border border-sky-200/35 p-5 shadow-md shadow-sky-900/[0.05] sm:p-6 md:p-7"
              style={{
                background: "linear-gradient(180deg, #eef6ff 0%, #e4f0ff 45%, #dcecff 100%)"
              }}
              role="region"
              aria-label="Detalles del producto"
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-100"
                style={{
                  background:
                    "radial-gradient(ellipse 85% 55% at 50% -15%, rgba(120, 180, 255, 0.14), transparent 58%), radial-gradient(ellipse 70% 40% at 100% 100%, rgba(207, 231, 255, 0.35), transparent 55%)"
                }}
                aria-hidden
              />
              <div className="relative z-[1]">
                <p className="mb-4 font-sans text-[13px] font-semibold tracking-wide text-slate-700">Detalles del producto</p>
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    { label: "Marca", value: detailLine(displayBrand) },
                    { label: "Color", value: detailLine(displayColor) },
                    { label: "Talla", value: detailLine(displaySize) }
                  ].map((item) => (
                    <li
                      key={item.label}
                      className="rounded-xl border border-white/85 bg-white/75 px-4 py-3.5 shadow-sm shadow-sky-900/[0.04] backdrop-blur-[2px] transition duration-200 ease-out hover:border-sky-200/60 hover:bg-white/92 hover:shadow-md hover:shadow-sky-900/[0.06]"
                    >
                      <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">{item.label}</span>
                      <span className="mt-2 block text-base font-semibold leading-snug tracking-tight text-slate-950 md:text-[1.0625rem]">{item.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {descriptionForDisplay ? (
              <div className="mt-6 border-t border-luxury-500/15 pt-6">
                <h2 className="text-lg font-semibold text-luxury-800">Descripción</h2>
                <p className="mt-3 leading-relaxed text-slate-600">{descriptionForDisplay}</p>
              </div>
            ) : null}
          </section>

          <div className="flex flex-wrap gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                void whatsAppLeadService.trackProductInquiry({ productId: product.id, productName: product.name });
                window.open(getWhatsAppOrderUrl(shareParams), "_blank", "noopener,noreferrer");
                setShowReturnButton(true);
              }}
              className="rounded-xl bg-luxury-600 px-7 py-3 text-base font-extrabold text-white shadow-lg shadow-luxury-900/15 transition hover:bg-luxury-700 hover:shadow-xl"
            >
              Solicitar producto
            </button>
            <button
              type="button"
              onClick={() => {
                setShareNote("");
                setShareModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-luxury-300/70 bg-white px-7 py-3 text-base font-semibold text-luxury-800 transition hover:border-luxury-500 hover:bg-surface-hover"
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

          {shareNote ? <p className="text-sm text-slate-500">{shareNote}</p> : null}
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

import { useEffect, useState, type SyntheticEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Seo from "@/components/common/Seo";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import type { Product } from "@/types";
import { productService } from "@/services/productService";
import { formatCurrency } from "@/utils/format";
import env from "@/config/env";
import { getFacebookShareUrl, getInstagramShareUrl, getMessengerShareUrl, getTwitterShareUrl, getWhatsAppOrderUrl, getWhatsAppProductUrl, type ShareParams } from "@/utils/share";
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

  async function shareToInstagram(): Promise<void> {
    if (!shareParams || !product) return;

    const shareUrl = getInstagramShareUrl(shareParams);

    if (navigator.share) {
      try {
        const shareData: ShareData = {
          title: product.name,
          text: `Mira este producto: ${product.name}`,
          url: shareUrl,
        };

        if (navigator.canShare) {
          try {
            const proxyUrl = `${env.appUrl}/api/share/image?id=${product.id}&img=${encodeURIComponent(product.main_image_url)}`;
            const imgRes = await fetch(proxyUrl);
            if (imgRes.ok) {
              const blob = await imgRes.blob();
              const file = new File([blob], `${product.name}.jpg`, { type: "image/jpeg" });
              if (navigator.canShare({ files: [file] })) {
                shareData.files = [file];
              }
            }
          } catch {
            /* share without image */
          }
        }

        await navigator.share(shareData);
        return;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareNote("Enlace copiado. Pegalo en tu historia de Instagram.");
    } catch {
      setShareNote("No se pudo copiar. Copia el enlace desde la barra del navegador.");
    }
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  }

  if (loading) return <LoadingSpinner />;
  if (!product || !shareParams) return <div className="container-shell py-20 text-neutral-400">Producto no encontrado.</div>;

  const socialBtnBase = "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-colors";

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
        <div>
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) navigate(-1);
              else navigate("/catalog");
            }}
            className="mb-5 rounded-xl border border-luxury-500/15 bg-surface-card px-4 py-2 text-sm text-neutral-300 transition hover:border-luxury-400/30 hover:text-neutral-100"
          >
            &larr; Regresar
          </button>
          <h1 className="text-3xl font-semibold text-luxury-50">{product.name}</h1>

          {product.offer_active && product.offer_quantity && product.offer_price != null ? (
            <div className="mt-5 space-y-2">
              <p className="inline-flex items-baseline rounded-xl bg-luxury-500/15 px-4 py-2.5 text-2xl font-extrabold tracking-wide text-luxury-200">
                {formatCurrency(product.reference_price)} <span className="ml-1.5 text-base font-normal text-luxury-300">x unidad</span>
              </p>
              <p className="inline-flex items-center gap-3 rounded-xl bg-red-500/15 px-4 py-2.5 text-2xl font-extrabold tracking-wide text-red-400">
                {product.offer_quantity} x {formatCurrency(product.offer_price)}
                <span className="text-sm font-semibold uppercase tracking-wider text-red-300">¡Aprovecha nuestra oferta!</span>
              </p>
            </div>
          ) : (
            <p className="mt-5 inline-flex items-baseline rounded-xl bg-luxury-500/15 px-4 py-2.5 text-2xl font-extrabold tracking-wide text-luxury-200">
              {formatCurrency(product.reference_price)} <span className="ml-1.5 text-base font-normal text-luxury-300">x unidad</span>
            </p>
          )}

          {(product.brand || product.color || product.size) && (
            <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 rounded-xl border border-luxury-500/10 bg-surface-card p-4 text-sm sm:grid-cols-3">
              {product.brand && (
                <div>
                  <span className="text-xs uppercase tracking-wider text-neutral-500">Marca</span>
                  <p className="mt-0.5 font-semibold text-neutral-100">{product.brand}</p>
                </div>
              )}
              {product.color && (
                <div>
                  <span className="text-xs uppercase tracking-wider text-neutral-500">Color</span>
                  <p className="mt-0.5 font-semibold text-neutral-100">{product.color}</p>
                </div>
              )}
              {product.size && (
                <div>
                  <span className="text-xs uppercase tracking-wider text-neutral-500">Talla</span>
                  <p className="mt-0.5 font-semibold text-neutral-100">{product.size}</p>
                </div>
              )}
            </div>
          )}

          {product.description && (
            <div className="mt-5">
              <h2 className="text-lg font-semibold text-luxury-200">Descripcion</h2>
              <p className="mt-2 leading-relaxed text-neutral-400">{product.description}</p>
            </div>
          )}

          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                void whatsAppLeadService.trackProductInquiry({ productId: product.id, productName: product.name });
                window.open(getWhatsAppOrderUrl(shareParams), "_blank", "noopener,noreferrer");
                setShowReturnButton(true);
              }}
              className="rounded-xl bg-luxury-400 px-7 py-3 text-base font-extrabold text-surface-base shadow-lg shadow-luxury-900/25 transition hover:bg-luxury-300 hover:shadow-xl"
            >
              Solicitar producto
            </button>
            <button
              type="button"
              onClick={() => { window.open(getFacebookShareUrl(shareParams), "_blank", "noopener,noreferrer"); setShowReturnButton(true); }}
              className={`${socialBtnBase} bg-blue-600/90 text-white hover:bg-blue-500`}
            >
              Compartir Facebook
            </button>
            <button
              type="button"
              onClick={() => { window.open(getMessengerShareUrl(shareParams), "_blank", "noopener,noreferrer"); setShowReturnButton(true); }}
              className={`${socialBtnBase} bg-blue-500/90 text-white hover:bg-blue-400`}
            >
              Compartir Messenger
            </button>
            <button
              type="button"
              onClick={() => { window.open(getTwitterShareUrl(shareParams), "_blank", "noopener,noreferrer"); setShowReturnButton(true); }}
              className={`${socialBtnBase} bg-neutral-600/90 text-white hover:bg-neutral-500`}
            >
              Compartir X
            </button>
            <button
              type="button"
              onClick={() => { void shareToInstagram(); setShowReturnButton(true); }}
              className={`${socialBtnBase} bg-pink-600/90 text-white hover:bg-pink-500`}
            >
              Compartir Instagram
            </button>
            <button
              type="button"
              onClick={() => { window.open(getWhatsAppProductUrl(shareParams), "_blank", "noopener,noreferrer"); setShowReturnButton(true); }}
              className={`${socialBtnBase} bg-emerald-600/90 text-white hover:bg-emerald-500`}
            >
              Compartir WhatsApp
            </button>
          </div>
          {shareNote && <p className="mt-3 text-sm text-neutral-400">{shareNote}</p>}
          {showReturnButton && <ReturnToSiteBar onClose={() => setShowReturnButton(false)} />}
        </div>
      </div>
    </div>
  );
}

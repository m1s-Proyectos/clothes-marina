import { useEffect, useState } from "react";
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

export default function ProductDetailPage() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReturnButton, setShowReturnButton] = useState(false);
  const [shareNote, setShareNote] = useState("");

  useEffect(() => {
    if (!productId) return;
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
  if (!product || !shareParams) return <div className="container-shell py-20">Producto no encontrado.</div>;

  return (
    <div className="container-shell py-10">
      <Seo
        title={product.name}
        description={product.description}
        path={`/product/${product.id}`}
        image={product.main_image_url}
        type="article"
      />
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="flex min-h-[420px] items-center justify-center rounded-xl bg-white p-3">
          <OptimizedImage
            src={product.main_image_url}
            alt={product.name}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            transform={{ width: 1200, quality: 75, format: "webp", resize: "contain" }}
            responsiveWidths={[640, 960, 1200]}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="max-h-[70vh] w-full rounded-xl object-contain"
          />
        </div>
        <div>
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) navigate(-1);
              else navigate("/catalog");
            }}
            className="mb-4 rounded border border-neutral-700 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900"
          >
            Regresar
          </button>
          <h1 className="text-3xl font-semibold">{product.name}</h1>
          <h2 className="mt-4 text-lg font-semibold text-luxury-100">Caracteristicas del producto</h2>
          <p className="mt-2 text-neutral-300">{product.description}</p>
          <p className="mt-4 inline-flex rounded-lg bg-luxury-500/20 px-4 py-2 text-2xl font-extrabold tracking-wide text-luxury-100">
            {formatCurrency(product.reference_price)}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                void whatsAppLeadService.trackProductInquiry({ productId: product.id, productName: product.name });
                window.open(getWhatsAppOrderUrl(shareParams), "_blank", "noopener,noreferrer");
                setShowReturnButton(true);
              }}
              className="inline-block rounded-lg bg-luxury-500 px-6 py-3 text-base font-extrabold text-neutral-950 shadow-lg shadow-luxury-900/30 transition hover:bg-luxury-400"
            >
              Solicitar producto
            </button>
            <button
              type="button"
              onClick={() => {
                window.open(getFacebookShareUrl(shareParams), "_blank", "noopener,noreferrer");
                setShowReturnButton(true);
              }}
              className="inline-block rounded bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
            >
              Compartir Facebook
            </button>
            <button
              type="button"
              onClick={() => {
                window.open(getMessengerShareUrl(shareParams), "_blank", "noopener,noreferrer");
                setShowReturnButton(true);
              }}
              className="inline-block rounded bg-blue-500 px-5 py-3 text-white hover:bg-blue-600"
            >
              Compartir Messenger
            </button>
            <button
              type="button"
              onClick={() => {
                window.open(getTwitterShareUrl(shareParams), "_blank", "noopener,noreferrer");
                setShowReturnButton(true);
              }}
              className="inline-block rounded bg-gray-600 px-5 py-3 text-white hover:bg-gray-700"
            >
              Compartir X
            </button>
            <button
              type="button"
              onClick={() => {
                void shareToInstagram();
                setShowReturnButton(true);
              }}
              className="inline-block rounded bg-pink-600 px-5 py-3 text-white hover:bg-pink-700"
            >
              Compartir Instagram
            </button>
            <button
              type="button"
              onClick={() => {
                window.open(getWhatsAppProductUrl(shareParams), "_blank", "noopener,noreferrer");
                setShowReturnButton(true);
              }}
              className="inline-block rounded bg-green-600 px-5 py-3"
            >
              Compartir WhatsApp
            </button>
          </div>
          {shareNote && <p className="mt-3 text-sm text-neutral-300">{shareNote}</p>}
          {showReturnButton && <ReturnToSiteBar onClose={() => setShowReturnButton(false)} />}
        </div>
      </div>
    </div>
  );
}

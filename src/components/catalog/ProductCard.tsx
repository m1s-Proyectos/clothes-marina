import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { Product } from "@/types";
import { formatCurrency } from "@/utils/format";
import { getFacebookShareUrl, getTwitterShareUrl, getWhatsAppOrderUrl, getWhatsAppProductUrl } from "@/utils/share";
import { whatsAppLeadService } from "@/services/whatsAppLeadService";
import OptimizedImage from "@/components/common/OptimizedImage";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const productUrl = `/product/${product.id}`;

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
          <a className="rounded bg-neutral-800 px-3 py-2 hover:bg-neutral-700" target="_blank" rel="noreferrer" href={getFacebookShareUrl(product.id)}>
            Facebook
          </a>
          <a className="rounded bg-neutral-800 px-3 py-2 hover:bg-neutral-700" target="_blank" rel="noreferrer" href={getTwitterShareUrl(product.id)}>
            Twitter
          </a>
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
    </motion.article>
  );
}

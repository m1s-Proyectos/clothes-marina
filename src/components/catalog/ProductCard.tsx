import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { Product } from "@/types";
import { formatCurrency } from "@/utils/format";
import { getFacebookShareUrl, getTwitterShareUrl, getWhatsAppProductUrl } from "@/utils/share";

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
      <Link to={productUrl} aria-label={`View details of ${product.name}`}>
        <img src={product.main_image_url} alt={product.name} loading="lazy" className="h-72 w-full object-cover transition hover:opacity-90" />
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
            View details
          </Link>
          <a className="rounded bg-neutral-800 px-3 py-2 hover:bg-neutral-700" target="_blank" rel="noreferrer" href={getFacebookShareUrl(product.id)}>
            Facebook
          </a>
          <a className="rounded bg-neutral-800 px-3 py-2 hover:bg-neutral-700" target="_blank" rel="noreferrer" href={getTwitterShareUrl(product.id)}>
            Twitter
          </a>
          <a className="rounded bg-green-600 px-3 py-2 hover:bg-green-700" target="_blank" rel="noreferrer" href={getWhatsAppProductUrl(product.name)}>
            WhatsApp
          </a>
        </div>
      </div>
    </motion.article>
  );
}

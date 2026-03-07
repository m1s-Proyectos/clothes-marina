import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Seo from "@/components/common/Seo";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import type { Product } from "@/types";
import { productService } from "@/services/productService";
import { formatCurrency } from "@/utils/format";
import { getWhatsAppProductUrl } from "@/utils/share";

export default function ProductDetailPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;
    productService
      .getById(productId)
      .then(setProduct)
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) return <LoadingSpinner />;
  if (!product) return <div className="container-shell py-20">Product not found.</div>;

  return (
    <div className="container-shell py-10">
      <Seo title={product.name} description={product.description} />
      <div className="grid gap-8 lg:grid-cols-2">
        <img src={product.main_image_url} alt={product.name} className="h-[500px] w-full rounded-xl object-cover" />
        <div>
          <h1 className="text-3xl font-semibold">{product.name}</h1>
          <h2 className="mt-4 text-lg font-semibold text-luxury-100">Product features</h2>
          <p className="mt-2 text-neutral-300">{product.description}</p>
          <p className="mt-4 text-xl text-luxury-100">{formatCurrency(product.reference_price)}</p>
          <a href={getWhatsAppProductUrl(product.name)} target="_blank" rel="noreferrer" className="mt-6 inline-block rounded bg-green-600 px-5 py-3">
            Ask on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

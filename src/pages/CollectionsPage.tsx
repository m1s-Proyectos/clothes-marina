import { useEffect, useState } from "react";
import Seo from "@/components/common/Seo";
import ProductCard from "@/components/catalog/ProductCard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import type { Product } from "@/types";
import { productService } from "@/services/productService";

export default function CollectionsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService
      .list({
        sort: "newest",
        onlyAvailable: true
      })
      .then((items) => setProducts(items.slice(0, 10)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container-shell py-16">
      <Seo title="Agregados Reciente" description="Explora los articulos mas recientes del catalogo." />
      <h1 className="text-3xl font-semibold">Agregados Reciente</h1>
      <p className="mt-4 text-neutral-300">Aqui puedes ver los ultimos 10 articulos agregados, sin importar la categoria.</p>

      <div className="mt-8">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

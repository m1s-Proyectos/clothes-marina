import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Seo from "@/components/common/Seo";
import ProductCard from "@/components/catalog/ProductCard";
import type { Product } from "@/types";
import { productService } from "@/services/productService";

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService
      .getFeatured()
      .then(setFeatured)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Seo title="Home" description="Discover premium clothing collections at Clothes Marina." />
      <section className="relative h-[70vh] min-h-[420px]">
        <img
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1920&auto=format&fit=crop"
          alt="New Collection 2026"
          className="h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 flex items-center">
          <div className="container-shell">
            <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-bold md:text-6xl">
              New Collection 2026
            </motion.h1>
            <Link to="/catalog" className="mt-6 inline-block rounded bg-luxury-500 px-6 py-3 font-semibold text-neutral-950">
              View Catalog
            </Link>
          </div>
        </div>
      </section>

      <section className="container-shell py-16">
        <h2 className="mb-6 text-2xl font-semibold">Featured Products</h2>
        {loading ? (
          <p>Loading featured products...</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="container-shell pb-16">
        <h2 className="mb-6 text-2xl font-semibold">Categories</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { name: "Women", slug: "women" },
            { name: "Men", slug: "men" },
            { name: "Kids", slug: "kids" }
          ].map((item) => (
            <Link key={item.slug} to={`/catalog/${item.slug}`} className="rounded-xl border border-neutral-800 bg-neutral-900 p-8 text-xl">
              {item.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="container-shell pb-24">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-8">
          <h3 className="text-xl font-semibold">Social Showcase</h3>
          <p className="mt-2 text-neutral-300">Prepared for future Instagram integration and shoppable social content.</p>
        </div>
      </section>
    </>
  );
}

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/types";
import { productService } from "@/services/productService";

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    productService.list({ sort: "newest" }).then(setProducts);
    const channel = supabase
      .channel("admin-products")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
        productService.list({ sort: "newest" }).then(setProducts);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section>
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      <p className="mt-2 text-neutral-300">Real-time product monitoring enabled.</p>
      <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {products.slice(0, 6).map((product) => (
          <article key={product.id} className="rounded border border-neutral-800 bg-neutral-900 p-4">
            <h3 className="font-semibold">{product.name}</h3>
            <p className="text-xs text-neutral-400">{product.available ? "Available" : "Unavailable"}</p>
            <p className="text-xs text-neutral-400">{product.featured ? "Featured" : "Standard"}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

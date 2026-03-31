import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Seo from "@/components/common/Seo";
import ProductCard from "@/components/catalog/ProductCard";
import type { Category, Product } from "@/types";
import { productService } from "@/services/productService";
import OptimizedImage from "@/components/common/OptimizedImage";
import { categoryService } from "@/services/categoryService";

interface HomeCategoryCard {
  title: string;
  slug: string;
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function pickHomeCategories(categories: Category[]): HomeCategoryCard[] {
  const targets = [
    { title: "Mujer", keywords: ["women", "mujer"] },
    { title: "Hombre", keywords: ["men", "hombre"] },
    { title: "Ninos", keywords: ["kids", "ninos", "ninas", "infantil"] },
    { title: "Prendas para el hogar", keywords: ["hogar", "home", "casa", "household"] }
  ];

  return targets
    .map((target) => {
      const match = categories.find((category) => {
        const slug = normalizeText(category.slug);
        const name = normalizeText(category.name);
        return target.keywords.some((keyword) => slug.includes(keyword) || name.includes(keyword));
      });

      if (!match) return null;
      return { title: target.title, slug: match.slug };
    })
    .filter((item): item is HomeCategoryCard => item !== null);
}

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [homeCategories, setHomeCategories] = useState<HomeCategoryCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([productService.getFeatured(), categoryService.getAll()])
      .then(([featuredProducts, categories]) => {
        setFeatured(featuredProducts);
        setHomeCategories(pickHomeCategories(categories));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Seo title="Inicio" description="Descubre colecciones de ropa premium en Marina's Clothes." />
      <section className="relative h-[70vh] min-h-[420px]">
        <OptimizedImage
          src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1920&auto=format&fit=crop"
          alt="Ropa nueva y con estilo a buen precio para cada ocasión"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 flex items-center">
          <div className="container-shell">
            <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-bold md:text-6xl">
              Ropa nueva y con estilo a buen precio para cada ocasión
            </motion.h1>
            <Link to="/catalog" className="mt-6 inline-block rounded bg-luxury-500 px-6 py-3 font-semibold text-neutral-950">
              Ver Catalogo Completo
            </Link>
          </div>
        </div>
      </section>

      <section className="container-shell py-16">
        <h2 className="mb-6 text-2xl font-semibold">Productos Destacados</h2>
        {loading ? (
          <p>Cargando productos destacados...</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="container-shell pb-16">
        <h2 className="mb-6 text-2xl font-semibold">Categorias</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {homeCategories.map((item) => (
            <Link key={item.slug} to={`/catalog/${item.slug}`} className="rounded-xl border border-neutral-800 bg-neutral-900 p-8 text-xl">
              {item.title}
            </Link>
          ))}
        </div>
      </section>

    </>
  );
}

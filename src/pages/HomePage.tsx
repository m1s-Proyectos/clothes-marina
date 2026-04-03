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

      {/* ── Hero ── */}
      <section className="relative h-[72vh] min-h-[420px] overflow-hidden">
        <OptimizedImage
          src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1920&auto=format&fit=crop"
          alt="Ropa nueva y con estilo a buen precio para cada ocasión"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-surface-base/90 via-surface-base/65 to-surface-base/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-base/60 via-transparent to-transparent" />

        <div className="absolute inset-0 flex items-center">
          <div className="container-shell">
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-4 inline-block rounded-full border border-luxury-400/40 bg-surface-raised/70 px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] text-luxury-200 backdrop-blur-sm"
            >
              Marina&apos;s Clothes
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65 }}
              className="max-w-2xl text-3xl leading-tight sm:text-4xl md:text-5xl lg:text-6xl"
            >
              Ropa nueva con estilo, al mejor precio para cada ocasión.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mt-4 max-w-lg text-sm leading-relaxed text-neutral-300 sm:text-base"
            >
              Colecciones para mujer, hombre, ninos y hogar con enfoque en calidad, combinacion y presencia.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.95 }}>
              <Link
                to="/catalog"
                className="mt-7 inline-block rounded-full bg-luxury-400 px-7 py-3 text-sm font-semibold uppercase tracking-wide text-surface-base shadow-lg shadow-luxury-900/30 transition hover:-translate-y-0.5 hover:bg-luxury-300 hover:shadow-xl hover:shadow-luxury-900/40"
              >
                Ver Catalogo Completo
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Featured ── */}
      <section className="container-shell py-16">
        <div className="mb-8 flex items-end justify-between gap-3">
          <div>
            <h2 className="section-title text-luxury-50">Productos destacados</h2>
            <p className="text-sm text-neutral-400">Selecciones pensadas para destacar tu estilo diario.</p>
          </div>
          <Link
            to="/catalog"
            className="hidden rounded-full border border-luxury-500/50 px-5 py-2 text-xs uppercase tracking-[0.12em] text-luxury-200 transition hover:border-luxury-300 hover:text-luxury-100 md:inline-block"
          >
            Ver todos
          </Link>
        </div>
        {loading ? (
          <p className="text-neutral-400">Cargando productos destacados...</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* ── Categories ── */}
      <section className="container-shell pb-20">
        <h2 className="section-title text-luxury-50">Categorias</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {homeCategories.map((item) => (
            <Link
              key={item.slug}
              to={`/catalog/${item.slug}`}
              className="group rounded-2xl border border-luxury-500/15 bg-surface-card/80 p-8 transition-all duration-200 hover:-translate-y-1 hover:border-luxury-400/35 hover:bg-surface-hover hover:shadow-lg hover:shadow-luxury-900/10"
            >
              <div className="mb-2 text-[11px] uppercase tracking-[0.2em] text-luxury-400">Explorar</div>
              <div className="text-3xl leading-tight text-neutral-100 transition group-hover:text-white">{item.title}</div>
              <div className="mt-4 text-sm leading-relaxed text-neutral-400">Encuentra piezas recomendadas para esta categoria.</div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

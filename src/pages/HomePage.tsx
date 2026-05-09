import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Seo from "@/components/common/Seo";
import ProductCard from "@/components/catalog/ProductCard";
import CategoryMarqueePanel from "@/components/home/CategoryMarqueePanel";
import type { Category, Product } from "@/types";
import { productService } from "@/services/productService";
import OptimizedImage from "@/components/common/OptimizedImage";
import { categoryService } from "@/services/categoryService";

interface HomeCategoryCard {
  title: string;
  slug: string;
  imageUrl: string;
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
    { title: "Niñas", keywords: ["ninas", "girls", "girl"] },
    { title: "Niños", keywords: ["ninos", "kids", "infantil", "boys", "boy"] },
    { title: "Prendas para el hogar", keywords: ["hogar", "home", "casa", "household"] },
  ];

  const usedIds = new Set<string>();

  return targets
    .map((target) => {
      const match = categories.find((category) => {
        if (usedIds.has(category.id)) return false;
        const slug = normalizeText(category.slug);
        const name = normalizeText(category.name);
        return target.keywords.some((keyword) => slug.includes(keyword) || name.includes(keyword));
      });

      if (!match) return null;
      usedIds.add(match.id);
      return { title: target.title, slug: match.slug, imageUrl: match.image_url ?? "" };
    })
    .filter((item): item is HomeCategoryCard => item !== null);
}

const TRUST_STATS = [
  "500+ productos disponibles",
  "Envío local",
  "Atención personalizada",
  "Nueva llegada cada semana",
];

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
      <section className="relative h-[85vh] min-h-[480px] overflow-hidden">
        <OptimizedImage
          src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1920&auto=format&fit=crop"
          alt="Ropa nueva y con estilo a buen precio para cada ocasión"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="h-full w-full object-cover brightness-[1.06] saturate-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-surface-base/65 via-surface-base/30 to-surface-base/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-base/60 via-transparent to-transparent" />

        {/* Hero copy */}
        <div className="absolute inset-0 flex items-center pb-20">
          <div className="container-shell">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-4 inline-block rounded-full border border-luxury-400/40 bg-surface-raised/70 px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] text-luxury-200 backdrop-blur-sm"
            >
              Marina&apos;s Clothes
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.12 }}
              className="max-w-2xl text-balance text-3xl leading-tight drop-shadow-[0_2px_24px_rgba(0,0,0,0.5)] sm:text-4xl md:text-5xl lg:text-6xl"
            >
              Ropa nueva con estilo, al mejor precio para cada ocasión.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.26 }}
              className="mt-4 max-w-lg text-sm leading-relaxed text-neutral-200 drop-shadow-sm sm:text-base"
            >
              Colecciones para mujer, hombre, niños, niñas y hogar con enfoque en calidad, combinación y presencia.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.4 }}
            >
              <Link
                to="/collections"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-luxury-400 px-7 py-3 text-sm font-semibold uppercase tracking-wide text-surface-base shadow-lg shadow-luxury-900/30 transition hover:-translate-y-0.5 hover:bg-luxury-300 hover:shadow-xl hover:shadow-luxury-900/40"
              >
                Explorar Colecciones
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Trust stat bar anchored to bottom of hero */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="absolute inset-x-0 bottom-0"
        >
          <div className="border-t border-luxury-500/15 bg-surface-base/80 backdrop-blur-md">
            <div className="container-shell flex flex-wrap items-center justify-center gap-x-8 gap-y-2 py-3 sm:justify-start">
              {TRUST_STATS.map((label) => (
                <span key={label} className="flex items-center gap-1.5 text-xs text-neutral-400">
                  <span className="h-1 w-1 rounded-full bg-luxury-400" aria-hidden />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Categorías (carrusel compacto) ── */}
      <section className="container-shell pt-12 pb-6">
        <CategoryMarqueePanel items={homeCategories} />
      </section>

      {/* ── Featured ── */}
      <section className="container-shell pb-16 pt-2">
        <div className="mb-8 flex items-end justify-between gap-3">
          <div>
            <h2 className="section-title text-luxury-50">Productos Destacados</h2>
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
          <p className="text-neutral-400">Cargando productos Destacados...</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

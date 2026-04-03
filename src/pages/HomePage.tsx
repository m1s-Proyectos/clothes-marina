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
      <section className="relative h-[76vh] min-h-[460px] overflow-hidden">
        <OptimizedImage
          src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1920&auto=format&fit=crop"
          alt="Ropa nueva y con estilo a buen precio para cada ocasión"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d1422]/95 via-[#0d1422]/70 to-[#0d1422]/30" />
        <div className="absolute inset-0 flex items-center">
          <div className="container-shell">
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-4 inline-block rounded-full border border-luxury-500/50 bg-[#111a2a]/70 px-4 py-1 text-xs uppercase tracking-[0.2em] text-luxury-100"
            >
              Marina&apos;s Clothes
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65 }}
              className="max-w-3xl text-5xl md:text-7xl"
            >
              Ropa nueva con estilo, al mejor precio para cada ocasión.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mt-5 max-w-xl text-sm leading-relaxed text-slate-200 md:text-base"
            >
              Colecciones para mujer, hombre, ninos y hogar con enfoque en calidad, combinacion y presencia.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.95 }}>
              <Link
                to="/catalog"
                className="mt-7 inline-block rounded-full bg-luxury-500 px-7 py-3 text-sm font-semibold uppercase tracking-wide text-neutral-950 shadow-[0_12px_40px_rgba(200,166,108,0.28)] transition hover:translate-y-[-2px] hover:bg-luxury-100"
              >
                Ver catalogo completo
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="container-shell py-16">
        <div className="mb-7 flex items-end justify-between gap-3">
          <div>
            <h2 className="section-title">Productos destacados</h2>
            <p className="text-sm text-slate-300">Selecciones pensadas para destacar tu estilo diario.</p>
          </div>
          <Link
            to="/catalog"
            className="hidden rounded-full border border-luxury-500/60 px-4 py-2 text-xs uppercase tracking-[0.12em] text-luxury-100 transition hover:border-luxury-100 hover:text-luxury-50 md:inline-block"
          >
            Ver todos
          </Link>
        </div>
        {loading ? (
          <p className="text-slate-300">Cargando productos destacados...</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="container-shell pb-16">
        <h2 className="section-title">Categorias</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {homeCategories.map((item) => (
            <Link
              key={item.slug}
              to={`/catalog/${item.slug}`}
              className="glass-panel group rounded-2xl p-8 transition hover:translate-y-[-3px] hover:border-luxury-300/60"
            >
              <div className="mb-2 text-xs uppercase tracking-[0.18em] text-luxury-100">Explorar</div>
              <div className="text-3xl leading-tight text-slate-100 transition group-hover:text-white">{item.title}</div>
              <div className="mt-5 text-sm text-slate-300">Encuentra piezas recomendadas para esta categoria.</div>
            </Link>
          ))}
        </div>
      </section>

    </>
  );
}

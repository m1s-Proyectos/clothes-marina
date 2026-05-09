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
  /** Orden importa: Niñas antes que Niños para no mezclar slugs (ninas vs ninos). Cada categoría solo se usa una vez. */
  const targets = [
    { title: "Mujer", keywords: ["women", "mujer"] },
    { title: "Hombre", keywords: ["men", "hombre"] },
    { title: "Niñas", keywords: ["ninas", "girls", "girl"] },
    { title: "Niños", keywords: ["ninos", "kids", "infantil", "boys", "boy"] },
    { title: "Prendas para el hogar", keywords: ["hogar", "home", "casa", "household"] }
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
      .catch((error) => {
        console.warn("Unable to load home catalog data.", error);
        setFeatured([]);
        setHomeCategories([]);
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
          className="h-full w-full object-cover brightness-[1.06] saturate-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/82 via-luxury-50/45 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-base/55 via-transparent to-white/10" />

        <div className="absolute inset-0 flex items-center">
          <div className="container-shell">
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-4 inline-block rounded-full border border-luxury-300/70 bg-white/80 px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] text-luxury-800 backdrop-blur-sm"
            >
              Marina&apos;s Clothes
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65 }}
              className="max-w-2xl text-3xl leading-tight text-slate-950 drop-shadow-[0_2px_18px_rgba(255,255,255,0.65)] sm:text-4xl md:text-5xl lg:text-6xl"
            >
              Ropa nueva con estilo, al mejor precio para cada ocasión.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mt-4 max-w-lg text-sm leading-relaxed text-slate-700 drop-shadow-sm sm:text-base"
            >
              Colecciones para mujer, hombre, niños, niñas y hogar con enfoque en calidad, combinación y presencia.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.95 }}>
              <Link
                to="/catalog"
                className="mt-7 inline-block rounded-full bg-luxury-600 px-7 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-luxury-900/15 transition hover:-translate-y-0.5 hover:bg-luxury-700 hover:shadow-xl hover:shadow-luxury-900/20"
              >
                Ver Catalogo Completo
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Categorías (carrusel compacto) ── */}
      <section className="container-shell pt-12 pb-6">
        <CategoryMarqueePanel items={homeCategories} />
      </section>

      {/* ── Featured ── */}
      <section className="container-shell pb-16 pt-2">
        <div className="mb-8 flex items-end justify-between gap-3">
          <div>
            <h2 className="section-title text-slate-950">Productos Destacados</h2>
            <p className="text-sm text-slate-600">Selecciones pensadas para destacar tu estilo diario.</p>
          </div>
          <Link
            to="/catalog"
            className="hidden rounded-full border border-luxury-300/70 bg-white px-5 py-2 text-xs uppercase tracking-[0.12em] text-luxury-800 transition hover:border-luxury-500 hover:text-luxury-900 md:inline-block"
          >
            Ver todos
          </Link>
        </div>
        {loading ? (
          <p className="text-slate-500">Cargando productos Destacados...</p>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <motion.div
              className="mt-10 sm:mt-12 lg:hidden"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35, margin: "-24px" }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <Link
                to="/catalog"
                aria-label="Ver catálogo completo — descubre toda la colección"
                className="group relative flex min-h-[4.75rem] items-center gap-4 overflow-hidden rounded-2xl border border-sky-200/45 bg-gradient-to-br from-[#f4f4f2] via-[#eef4f8] to-[#dff2ff] px-5 py-5 shadow-[0_10px_36px_rgba(47,95,136,0.09)] ring-1 ring-white/70 transition-[transform,box-shadow,opacity] duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] active:opacity-[0.96] sm:px-6 sm:py-6"
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-70"
                  style={{
                    background:
                      "radial-gradient(ellipse 70% 80% at 0% 100%, rgba(120, 180, 255, 0.12), transparent 60%), radial-gradient(ellipse 55% 70% at 100% 0%, rgba(232, 232, 228, 0.55), transparent 50%)"
                  }}
                  aria-hidden
                />
                <div
                  className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-sky-200/35 bg-white/75 text-[#2f5f88] shadow-sm shadow-sky-900/5 transition duration-300 group-hover:border-sky-300/50 group-hover:bg-white group-hover:shadow-md"
                  aria-hidden
                >
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 7h16M6 7l1-3h10l1 3M6 7v12a1 1 0 001 1h10a1 1 0 001-1V7" />
                    <path d="M10 11v4M14 11v4" />
                  </svg>
                </div>
                <div className="relative min-w-0 flex-1 text-left">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#2f5f88]">Catálogo completo</p>
                  <h3 className="mt-1.5 text-xl font-semibold leading-snug tracking-tight text-slate-900">
                    Descubre la colección entera
                  </h3>
                  <p className="mt-1 max-w-[20rem] text-sm leading-relaxed text-slate-600">
                    Sigue explorando todas nuestras piezas en un solo lugar.
                  </p>
                </div>
                <div className="relative flex shrink-0 flex-col items-center gap-0.5 text-[#2f5f88]">
                  <span className="text-xs font-semibold uppercase tracking-wider">Ver</span>
                  <svg
                    className="h-5 w-5 transition duration-300 group-hover:translate-x-0.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </motion.div>
          </>
        )}
      </section>
    </>
  );
}

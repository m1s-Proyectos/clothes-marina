import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/utils/format";
import { improveSpanishText } from "@/utils/spanishTextNormalize";
import OptimizedImage from "@/components/common/OptimizedImage";
import { categoryService } from "@/services/categoryService";
import type { Category } from "@/types";

interface DashboardProduct {
  id: string;
  name: string;
  main_image_url: string;
  reference_price: number | null;
  available: boolean;
  featured: boolean;
  created_at: string;
}

const PAGE_SIZE = 10;

/** Conteo exacto por categoría (evita el límite de filas al agregar en memoria). */
async function fetchProductCountsByCategory(categoryIds: string[]): Promise<Record<string, number>> {
  if (categoryIds.length === 0) return {};
  const pairs = await Promise.all(
    categoryIds.map(async (id) => {
      const { count, error } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("category_id", id);
      return [id, error ? 0 : (count ?? 0)] as const;
    }),
  );
  return Object.fromEntries(pairs);
}

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<DashboardProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryProductCounts, setCategoryProductCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const loadProducts = useCallback(async (pageNumber: number): Promise<void> => {
    const start = (pageNumber - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;

    const { data, error } = await supabase
      .from("products")
      .select("id, name, main_image_url, reference_price, available, featured, created_at")
      .order("created_at", { ascending: false })
      .range(start, end);

    if (error) throw error;

    const rows = (data ?? []) as DashboardProduct[];
    const withText = rows.map((p) => ({ ...p, name: improveSpanishText(p.name) }));
    setProducts(withText.slice(0, PAGE_SIZE));
    setHasNextPage(rows.length > PAGE_SIZE);
  }, []);

  const loadCategories = useCallback(async (options?: { silent?: boolean }): Promise<void> => {
    const silent = options?.silent === true;
    if (!silent) {
      setCategoriesError(null);
      setCategoriesLoading(true);
    }
    try {
      const data = await categoryService.getAll();
      const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }));
      setCategories(sorted);
      const counts = await fetchProductCountsByCategory(sorted.map((c) => c.id));
      setCategoryProductCounts(counts);
    } catch {
      setCategoriesError("No se pudieron cargar las categorías. Revisa la consola o tu conexión.");
      setCategories([]);
      setCategoryProductCounts({});
    } finally {
      if (!silent) setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();

    const channelCategories = supabase
      .channel("admin-dashboard-categories")
      .on("postgres_changes", { event: "*", schema: "public", table: "categories" }, () => {
        void loadCategories({ silent: true });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channelCategories);
    };
  }, [loadCategories]);

  useEffect(() => {
    setLoading(true);
    loadProducts(page)
      .catch(() => undefined)
      .finally(() => setLoading(false));

    const channelProducts = supabase
      .channel("admin-products")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
        void loadProducts(page);
        void loadCategories({ silent: true });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channelProducts);
    };
  }, [page, loadProducts, loadCategories]);

  return (
    <section className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-luxury-50">Panel de administración</h1>
        <p className="mt-2 text-sm text-neutral-400">
          Resumen de categorías (con número de productos por categoría) y productos recientes (10 por página).
        </p>
      </div>

      <div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-luxury-200">
              Todas las categorías
              {!categoriesLoading && categories.length > 0 ? (
                <span className="ml-2 text-sm font-normal text-neutral-500">({categories.length})</span>
              ) : null}
            </h2>
            <p className="mt-1 max-w-2xl text-xs text-neutral-500">
              Lista completa según la tabla <span className="text-neutral-400">categories</span> en Supabase. Si ves
              &quot;Niños&quot; y &quot;Niñas&quot; con slugs distintos, ambas deben aparecer; el número indica cuántos
              productos tienen asignado ese <span className="text-neutral-400">category_id</span>.
            </p>
          </div>
          <Link
            to="/admin/categories"
            className="text-sm text-luxury-300 underline-offset-2 transition hover:text-luxury-200 hover:underline"
          >
            Gestionar categorías
          </Link>
        </div>

        {categoriesError ? (
          <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{categoriesError}</p>
        ) : null}

        {categoriesLoading ? (
          <p className="mt-4 text-sm text-neutral-400">Cargando categorías...</p>
        ) : categories.length === 0 ? (
          <p className="mt-4 rounded-xl border border-luxury-500/10 bg-surface-card px-4 py-6 text-sm text-neutral-400">
            No hay categorías aún.{" "}
            <Link to="/admin/categories" className="text-luxury-300 underline hover:text-luxury-200">
              Crear en Categorías
            </Link>
          </p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((cat) => (
              <li
                key={cat.id}
                className="flex gap-3 overflow-hidden rounded-xl border border-luxury-500/10 bg-surface-card p-3 transition hover:border-luxury-400/25"
              >
                {cat.image_url ? (
                  <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-luxury-50">
                    <img src={cat.image_url} alt="" className="h-full w-full object-cover" loading="lazy" />
                  </div>
                ) : (
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg border border-dashed border-luxury-500/20 bg-surface-raised text-[10px] text-neutral-500">
                    Sin img
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-neutral-100">{cat.name}</p>
                  <p className="truncate font-mono text-xs text-neutral-500">{cat.slug}</p>
                  <p className="mt-1 text-xs text-luxury-300/90">
                    {categoryProductCounts[cat.id] ?? 0} producto
                    {(categoryProductCounts[cat.id] ?? 0) === 1 ? "" : "s"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-luxury-200">Productos recientes</h2>

        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
            className="rounded-lg border border-luxury-500/15 bg-surface-card px-3 py-1.5 text-sm text-neutral-300 transition hover:border-luxury-400/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Anterior
          </button>
          <span className="text-sm text-neutral-400">Página {page}</span>
          <button
            type="button"
            onClick={() => setPage((prev) => prev + 1)}
            disabled={!hasNextPage}
            className="rounded-lg border border-luxury-500/15 bg-surface-card px-3 py-1.5 text-sm text-neutral-300 transition hover:border-luxury-400/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Siguiente
          </button>
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-neutral-400">Cargando productos...</p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <article
                key={product.id}
                className="overflow-hidden rounded-xl border border-luxury-500/10 bg-surface-card transition hover:border-luxury-400/20"
              >
                <OptimizedImage
                  src={product.main_image_url}
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                  transform={{ width: 520, quality: 65, format: "webp", resize: "cover" }}
                  responsiveWidths={[260, 360, 520]}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="h-44 w-full object-cover"
                />
                <div className="space-y-1 p-3">
                  <h3 className="font-semibold text-neutral-100">{product.name}</h3>
                  <p className="text-sm text-luxury-200">{formatCurrency(product.reference_price)}</p>
                  <p className="text-xs text-neutral-500">{product.available ? "Disponible" : "No disponible"}</p>
                  <p className="text-xs text-neutral-500">{product.featured ? "Destacado" : "Estándar"}</p>
                  <Link
                    to="/admin/products"
                    state={{ editProductId: product.id }}
                    className="mt-2 inline-block rounded-lg bg-luxury-400 px-3 py-1.5 text-xs font-semibold text-surface-base transition hover:bg-luxury-300"
                  >
                    Editar producto
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

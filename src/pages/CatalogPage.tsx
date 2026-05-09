import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Seo from "@/components/common/Seo";
import ProductCard from "@/components/catalog/ProductCard";
import CatalogFilters from "@/components/catalog/CatalogFilters";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useDebounce } from "@/hooks/useDebounce";
import type { Category, Product, ProductSort } from "@/types";
import { categoryService } from "@/services/categoryService";
import { productService } from "@/services/productService";

const PRODUCTS_PER_PAGE = 26;

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export default function CatalogPage() {
  const params = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<ProductSort>("newest");
  const [category, setCategory] = useState(params.categorySlug ?? "");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);
  const gridAnchorRef = useRef<HTMLDivElement>(null);
  const skipScrollRef = useRef(true);

  useEffect(() => {
    setCategory(params.categorySlug ?? "");
  }, [params.categorySlug]);

  useEffect(() => {
    categoryService.getAll().then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    productService
      .list({
        categorySlug: category || undefined,
        sort,
        onlyAvailable: true,
      })
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [category, sort]);

  useEffect(() => {
    setPage(1);
  }, [category, sort, debouncedSearch]);

  const filterCategories = useMemo(
    () => categories.map((item) => ({ slug: item.slug, name: item.name })),
    [categories],
  );

  const visibleProducts = useMemo(() => {
    if (!debouncedSearch) return products;
    const term = normalize(debouncedSearch);
    return products.filter((p) => {
      const fields = [p.name, p.description, p.brand, p.color, p.size].map((v) => normalize(v ?? ""));
      return fields.some((f) => f.includes(term));
    });
  }, [products, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / PRODUCTS_PER_PAGE));

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  useEffect(() => {
    if (skipScrollRef.current) {
      skipScrollRef.current = false;
      return;
    }
    gridAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [page]);

  const safePage = Math.min(Math.max(1, page), totalPages);

  const paginatedProducts = useMemo(() => {
    const start = (safePage - 1) * PRODUCTS_PER_PAGE;
    return visibleProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [visibleProducts, safePage]);

  const rangeStart = visibleProducts.length === 0 ? 0 : (safePage - 1) * PRODUCTS_PER_PAGE + 1;
  const rangeEnd = Math.min(safePage * PRODUCTS_PER_PAGE, visibleProducts.length);

  return (
    <div className="container-shell py-10">
      <Seo title="Catalogo" description="Explora productos de mujer, hombre, ninos y ofertas." />
      <h1 className="mb-5 text-3xl font-semibold text-luxury-50">Catalogo</h1>
      <CatalogFilters
        search={search}
        onSearchChange={setSearch}
        sort={sort}
        onSortChange={setSort}
        category={category}
        categories={filterCategories}
        onCategoryChange={setCategory}
      />

      {loading ? (
        <LoadingSpinner />
      ) : visibleProducts.length === 0 ? (
        <p className="mt-10 text-center text-neutral-400">No se encontraron productos para tu busqueda.</p>
      ) : (
        <>
          <div ref={gridAnchorRef} className="scroll-mt-24" />
          <AnimatePresence>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </AnimatePresence>

          {totalPages > 1 ? (
            <div className="mt-10 flex flex-col items-center gap-4 border-t border-luxury-500/15 pt-8">
              <p className="text-center text-sm text-neutral-400">
                Mostrando {rangeStart}–{rangeEnd} de {visibleProducts.length} productos · Página {safePage} de{" "}
                {totalPages}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {safePage > 1 ? (
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="rounded-xl border border-luxury-500/25 bg-surface-card px-5 py-2.5 text-sm font-medium text-luxury-100 transition hover:border-luxury-400/40 hover:bg-surface-hover"
                  >
                    Ver página anterior
                  </button>
                ) : null}
                {safePage < totalPages ? (
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="rounded-xl bg-luxury-400 px-6 py-2.5 text-sm font-semibold text-surface-base shadow-lg shadow-luxury-900/20 transition hover:bg-luxury-300"
                  >
                    {safePage === 1
                      ? "Seguir viendo página 2"
                      : `Seguir viendo productos en página ${safePage + 1}`}
                  </button>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="mt-8 text-center text-sm text-neutral-500">
              {visibleProducts.length} producto{visibleProducts.length === 1 ? "" : "s"} en esta vista
            </p>
          )}
        </>
      )}
    </div>
  );
}

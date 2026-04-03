import { useEffect, useMemo, useState } from "react";
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
  const debouncedSearch = useDebounce(search);

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
        <AnimatePresence>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}

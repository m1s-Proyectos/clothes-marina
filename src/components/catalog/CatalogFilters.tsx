import type { ProductSort } from "@/types";

interface CatalogFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  sort: ProductSort;
  onSortChange: (value: ProductSort) => void;
  category: string;
  categories: { slug: string; name: string }[];
  onCategoryChange: (value: string) => void;
}

export default function CatalogFilters({
  search,
  onSearchChange,
  sort,
  onSortChange,
  category,
  categories,
  onCategoryChange
}: CatalogFiltersProps) {
  const fieldClass =
    "w-full rounded-xl border border-luxury-500/15 bg-surface-card px-4 py-2.5 text-sm text-neutral-200 placeholder-neutral-500 outline-none transition focus:border-luxury-400/40 focus:ring-1 focus:ring-luxury-500/20";

  return (
    <section className="mb-8 grid gap-3 rounded-2xl border border-luxury-500/10 bg-surface-raised/80 p-5 md:grid-cols-3">
      <input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Buscar productos..."
        className={fieldClass}
      />
      <select value={sort} onChange={(event) => onSortChange(event.target.value as ProductSort)} className={fieldClass}>
        <option value="newest">Mas recientes</option>
        <option value="featured">Destacados</option>
        <option value="alphabetical">Alfabetico</option>
        <option value="availability">Disponibilidad</option>
      </select>
      <select value={category} onChange={(event) => onCategoryChange(event.target.value)} className={fieldClass}>
        <option value="">Todas las categorias</option>
        <option value="offers">Ofertas</option>
        {categories.map((item) => (
          <option key={item.slug} value={item.slug}>
            {item.name}
          </option>
        ))}
      </select>
    </section>
  );
}

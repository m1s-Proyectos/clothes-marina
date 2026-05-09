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

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "Más recientes" },
  { value: "featured", label: "Destacados" },
  { value: "alphabetical", label: "Alfabético" },
  { value: "availability", label: "Disponibilidad" },
];

export default function CatalogFilters({
  search,
  onSearchChange,
  sort,
  onSortChange,
  category,
  categories,
  onCategoryChange,
}: CatalogFiltersProps) {
  const allCategories = [
    { slug: "", name: "Todas" },
    { slug: "offers", name: "Ofertas" },
    ...categories,
  ];

  return (
    <section className="mb-8 space-y-4 rounded-2xl border border-luxury-500/10 bg-surface-raised/80 p-5">
      {/* Search + Sort row */}
      <div className="flex flex-col gap-3 sm:flex-row">
        {/* Search */}
        <div className="relative flex-1">
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full rounded-xl border border-luxury-500/15 bg-surface-card py-2.5 pl-10 pr-4 text-sm text-neutral-200 placeholder-neutral-500 outline-none transition focus:border-luxury-400/40 focus:ring-1 focus:ring-luxury-500/20"
          />
        </div>

        {/* Sort */}
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M3 6h18M7 12h10M11 18h2" />
          </svg>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as ProductSort)}
            className="appearance-none rounded-xl border border-luxury-500/15 bg-surface-card py-2.5 pl-10 pr-8 text-sm text-neutral-200 outline-none transition focus:border-luxury-400/40 focus:ring-1 focus:ring-luxury-500/20"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category pills */}
      <div
        role="group"
        aria-label="Filtrar por categoría"
        className="flex flex-wrap gap-2"
      >
        {allCategories.map((cat) => {
          const isActive = category === cat.slug;
          return (
            <button
              key={cat.slug}
              type="button"
              onClick={() => onCategoryChange(cat.slug)}
              aria-pressed={isActive}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium uppercase tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-luxury-400/60 ${
                isActive
                  ? "border-luxury-400/60 bg-luxury-400/15 text-luxury-200"
                  : "border-luxury-500/20 bg-surface-card text-neutral-400 hover:border-luxury-400/35 hover:text-neutral-200"
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </section>
  );
}

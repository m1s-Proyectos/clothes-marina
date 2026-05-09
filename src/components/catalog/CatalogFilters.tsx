import type { ProductSort } from "@/types";

interface CatalogFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  sort: ProductSort;
  onSortChange: (value: ProductSort) => void;
  category: string;
  categories: { slug: string; name: string }[];
  onCategoryChange: (value: string) => void;
  /** Viene de la home con ?discover=1: mensaje contextual opcional */
  discoverMode?: boolean;
}

const chipActive =
  "border-sky-300/55 bg-gradient-to-b from-[#dff2ff] to-[#cfe9ff] font-semibold text-[#2f5f88] shadow-sm shadow-sky-900/10 ring-1 ring-sky-200/45";
const chipInactive =
  "border-slate-200/90 bg-white font-medium text-slate-700 hover:border-sky-200/70 hover:bg-[#f8fbff]";

const offersChipInactive =
  "border-sky-300/50 bg-gradient-to-b from-[#eef6ff] to-[#e2f2ff] font-semibold text-[#2f5f88] shadow-sm shadow-sky-900/[0.07] ring-1 ring-sky-200/50 hover:border-sky-400/50 hover:from-[#e5f2ff] hover:to-[#dff2ff]";
const offersChipActive =
  "border-sky-400/60 bg-gradient-to-b from-[#cfe9ff] to-[#b8dfff] font-semibold text-[#1e4a6e] shadow-md shadow-sky-900/12 ring-2 ring-sky-300/45";

export default function CatalogFilters({
  search,
  onSearchChange,
  sort,
  onSortChange,
  category,
  categories,
  onCategoryChange,
  discoverMode = false
}: CatalogFiltersProps) {
  const inputClass =
    "w-full rounded-xl border border-slate-200/90 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 shadow-sm shadow-slate-900/[0.03] outline-none transition focus:border-sky-400/70 focus:ring-2 focus:ring-sky-200/55";

  const selectClass =
    "w-full rounded-xl border border-slate-200/90 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm shadow-slate-900/[0.03] outline-none transition focus:border-sky-400/70 focus:ring-2 focus:ring-sky-200/55";

  const chipBtn = (active: boolean, variant: "default" | "offers") => {
    const base = "rounded-full px-3.5 py-2 text-sm transition-[transform,box-shadow,border-color] duration-200 ease-out active:scale-[0.98]";
    if (variant === "offers") {
      return `${base} border ${active ? offersChipActive : offersChipInactive}`;
    }
    return `${base} border ${active ? chipActive : chipInactive}`;
  };

  return (
    <section
      className="relative mb-8 overflow-hidden rounded-2xl border border-sky-200/35 bg-gradient-to-b from-[#eef6ff] via-white to-[#f3f4f2] p-5 shadow-[0_14px_44px_rgba(47,95,136,0.09)] ring-1 ring-white/90 md:p-6"
      aria-label="Filtros del catálogo"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.65]"
        style={{
          background:
            "radial-gradient(ellipse 55% 70% at 0% 0%, rgba(120, 180, 255, 0.11), transparent 55%), radial-gradient(ellipse 45% 60% at 100% 100%, rgba(207, 231, 255, 0.35), transparent 50%)"
        }}
        aria-hidden
      />

      <div className="relative z-[1] space-y-5">
        <header className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight text-slate-950 md:text-xl">Explorar y filtrar</h2>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
            Busca por nombre, ordena el catálogo y elige categoría u{" "}
            <span className="font-semibold text-[#2f5f88]">ofertas</span> en un solo panel.
          </p>
          {discoverMode && sort === "newest" ? (
            <p className="rounded-lg border border-sky-200/40 bg-white/70 px-3 py-2 text-xs font-medium text-[#2f5f88] shadow-sm">
              Modo descubrimiento: primero verás piezas fuera de destacados para ampliar el inventario visible.
            </p>
          ) : null}
        </header>

        <div>
          <label htmlFor="catalog-search" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
            Buscar producto
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
            </span>
            <input
              id="catalog-search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Nombre, descripción, marca, color, talla..."
              className={`${inputClass} pl-11`}
            />
          </div>
        </div>

        <div>
          <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
            Categoría y promociones
          </span>
          <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 pt-0.5 md:flex-wrap md:overflow-visible">
            <button
              type="button"
              onClick={() => onCategoryChange("")}
              className={`shrink-0 ${chipBtn(category === "", "default")}`}
              aria-pressed={category === ""}
            >
              Todas
            </button>
            <button
              type="button"
              onClick={() => onCategoryChange("offers")}
              className={`inline-flex shrink-0 items-center gap-1.5 ${chipBtn(category === "offers", "offers")}`}
              aria-pressed={category === "offers"}
            >
              <span
                className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-md bg-white/70 px-1 text-[10px] font-bold uppercase tracking-wide text-[#2f5f88] ring-1 ring-sky-200/60"
                aria-hidden
              >
                %
              </span>
              Ofertas
            </button>
            {categories.map((item) => (
              <button
                key={item.slug}
                type="button"
                onClick={() => onCategoryChange(item.slug)}
                className={`shrink-0 ${chipBtn(category === item.slug, "default")}`}
                aria-pressed={category === item.slug}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 border-t border-sky-200/30 pt-4 md:grid-cols-2 md:items-end">
          <div>
            <label htmlFor="catalog-sort" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
              Ordenar por
            </label>
            <select id="catalog-sort" value={sort} onChange={(event) => onSortChange(event.target.value as ProductSort)} className={selectClass}>
              <option value="newest">Más recientes</option>
              <option value="featured">Destacados primero</option>
              <option value="alphabetical">Alfabético</option>
              <option value="availability">Disponibilidad</option>
            </select>
          </div>
          <p className="text-xs leading-relaxed text-slate-600 md:text-right">
            Toca <span className="font-medium text-[#2f5f88]">Ofertas</span> para ver solo promociones activas.
          </p>
        </div>
      </div>
    </section>
  );
}

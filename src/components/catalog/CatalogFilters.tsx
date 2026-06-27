import type { ProductSort } from "@/types";
import OptimizedImage from "@/components/common/OptimizedImage";

interface CatalogFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  sort: ProductSort;
  onSortChange: (value: ProductSort) => void;
  category: string;
  categories: { slug: string; name: string; imageUrl: string }[];
  onCategoryChange: (value: string) => void;
}

const chipActive =
  "border-amber-400 bg-amber-50 font-semibold text-amber-900 ring-1 ring-amber-300";
const chipInactive =
  "border-slate-200 bg-white font-medium text-slate-700 hover:border-amber-300 hover:bg-amber-50/50";

const offersChipInactive =
  "border-amber-300 bg-amber-50/60 font-semibold text-amber-900 hover:border-amber-400 hover:bg-amber-50";
const offersChipActive =
  "border-amber-500 bg-amber-100 font-semibold text-amber-900 ring-1 ring-amber-400";

export default function CatalogFilters({
  search,
  onSearchChange,
  sort,
  onSortChange,
  category,
  categories,
  onCategoryChange
}: CatalogFiltersProps) {
  const inputClass =
    "w-full rounded-lg border border-slate-200/90 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 shadow-sm shadow-slate-900/[0.03] outline-none transition focus:border-sky-400/70 focus:ring-2 focus:ring-sky-200/55 md:rounded-xl md:px-4 md:py-3";

  const selectClass =
    "w-full rounded-lg border border-slate-200/90 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm shadow-slate-900/[0.03] outline-none transition focus:border-sky-400/70 focus:ring-2 focus:ring-sky-200/55 md:rounded-xl md:px-4 md:py-3";

  const chipBtn = (active: boolean, variant: "default" | "offers") => {
    const base =
      "flex items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-xs transition-colors duration-200 active:scale-[0.98] md:gap-1.5 md:rounded-xl md:px-3 md:py-2.5 md:text-sm";
    if (variant === "offers") {
      return `${base} ${active ? offersChipActive : offersChipInactive}`;
    }
    return `${base} ${active ? chipActive : chipInactive}`;
  };

  const categoryChipBtn = (active: boolean) =>
    `${chipBtn(active, "default")} !justify-start min-w-0`;

  return (
    <section
      className="relative mb-4 overflow-hidden rounded-xl border border-sky-200/35 bg-gradient-to-b from-[#eef6ff] via-white to-[#f3f4f2] p-3 shadow-[0_8px_28px_rgba(47,95,136,0.07)] ring-1 ring-white/90 md:mb-8 md:rounded-2xl md:p-6 md:shadow-[0_14px_44px_rgba(47,95,136,0.09)]"
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

      <div className="relative z-[1] space-y-3 md:space-y-5">
        <div>
          <label htmlFor="catalog-search" className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600 md:mb-1.5 md:text-xs">
            Buscar producto
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 md:left-3.5" aria-hidden>
              <svg className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
            </span>
            <input
              id="catalog-search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Nombre, descripción, marca, color, talla..."
              className={`${inputClass} pl-9 md:pl-11`}
            />
          </div>
        </div>

        <div className="rounded-lg border border-amber-200/60 bg-amber-50/20 px-2.5 py-2.5 sm:px-4 md:rounded-xl md:py-4">
          <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-800 md:mb-1 md:text-xs">
            Categoría y promociones
          </span>
          <p className="mb-2 hidden text-[10px] font-medium text-amber-900/80 sm:block md:mb-4 md:text-sm">
            Selecciona una categoría para filtrar el catálogo.
          </p>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 sm:gap-2.5 lg:grid-cols-4">
            <button
              type="button"
              onClick={() => onCategoryChange("")}
              className={chipBtn(category === "", "default")}
              aria-pressed={category === ""}
            >
              Todas
            </button>
            <button
              type="button"
              onClick={() => onCategoryChange("offers")}
              className={chipBtn(category === "offers", "offers")}
              aria-pressed={category === "offers"}
            >
              <span
                className="inline-flex h-4 min-w-[1rem] items-center justify-center rounded-md bg-amber-100 px-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-950 ring-1 ring-amber-400/60 md:h-5 md:min-w-[1.25rem] md:px-1 md:text-[10px]"
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
                className={categoryChipBtn(category === item.slug)}
                aria-pressed={category === item.slug}
              >
                {item.imageUrl ? (
                  <span
                    className="relative h-4 w-4 shrink-0 overflow-hidden rounded-full ring-1 ring-slate-200/80 md:h-5 md:w-5"
                    aria-hidden
                  >
                    <OptimizedImage
                      src={item.imageUrl}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      transform={{ width: 64, height: 64, resize: "cover" }}
                      className="h-full w-full object-cover"
                    />
                  </span>
                ) : null}
                <span className="truncate leading-tight">{item.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-2 border-t border-sky-200/30 pt-2.5 md:gap-4 md:pt-4 md:grid-cols-2 md:items-end">
          <div>
            <label htmlFor="catalog-sort" className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600 md:mb-1.5 md:text-xs">
              Ordenar por
            </label>
            <select id="catalog-sort" value={sort} onChange={(event) => onSortChange(event.target.value as ProductSort)} className={selectClass}>
              <option value="newest">Más recientes</option>
              <option value="featured">Destacados primero</option>
              <option value="alphabetical">Alfabético</option>
              <option value="availability">Disponibilidad</option>
            </select>
          </div>
          <p className="hidden text-xs leading-relaxed text-slate-600 md:block md:text-right">
            Toca <span className="font-medium text-[#2f5f88]">Ofertas</span> para ver solo promociones activas.
          </p>
        </div>
      </div>
    </section>
  );
}

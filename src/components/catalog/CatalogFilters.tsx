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
  return (
    <section className="mb-6 grid gap-3 rounded-xl border border-neutral-800 bg-neutral-900 p-4 md:grid-cols-3">
      <input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search products..."
        className="rounded bg-neutral-800 px-3 py-2 text-sm"
      />
      <select value={sort} onChange={(event) => onSortChange(event.target.value as ProductSort)} className="rounded bg-neutral-800 px-3 py-2 text-sm">
        <option value="newest">Newest</option>
        <option value="featured">Featured</option>
        <option value="alphabetical">Alphabetical</option>
        <option value="availability">Availability</option>
      </select>
      <select value={category} onChange={(event) => onCategoryChange(event.target.value)} className="rounded bg-neutral-800 px-3 py-2 text-sm">
        <option value="">All categories</option>
        <option value="offers">Offers</option>
        {categories.map((item) => (
          <option key={item.slug} value={item.slug}>
            {item.name}
          </option>
        ))}
      </select>
    </section>
  );
}

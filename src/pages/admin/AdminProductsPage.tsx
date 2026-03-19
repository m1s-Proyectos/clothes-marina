import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import type { Category, Product } from "@/types";
import { categoryService } from "@/services/categoryService";
import { productService } from "@/services/productService";
import { storageService } from "@/services/storageService";
import { formatCurrency } from "@/utils/format";

interface ProductForm {
  name: string;
  description: string;
  reference_price: string;
  category_id: string;
  main_image_url: string;
  available: boolean;
  featured: boolean;
}

const initialForm: ProductForm = {
  name: "",
  description: "",
  reference_price: "",
  category_id: "",
  main_image_url: "",
  available: true,
  featured: false
};

export default function AdminProductsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductForm>(initialForm);
  const [uploading, setUploading] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => productService.list({ sort: "newest" }).then(setProducts);

  useEffect(() => {
    categoryService.getAll().then(setCategories);
    void load();
  }, []);

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await storageService.upload(file);
      setForm((prev) => ({ ...prev, main_image_url: url }));
    } finally {
      setUploading(false);
    }
  }

  function resetForm() {
    setForm(initialForm);
    setEditingProductId(null);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const referencePrice = form.reference_price.trim() ? Number(form.reference_price) : null;
    if (referencePrice !== null && (Number.isNaN(referencePrice) || referencePrice < 0)) return;

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      reference_price: referencePrice,
      category_id: form.category_id,
      main_image_url: form.main_image_url.trim(),
      available: form.available,
      featured: form.featured
    };

    setSaving(true);
    try {
      if (editingProductId) {
        await productService.update(editingProductId, payload);
      } else {
        await productService.create(payload);
      }
      resetForm();
      await load();
    } finally {
      setSaving(false);
    }
  }

  function startEditingProduct(product: Product) {
    setEditingProductId(product.id);
    setForm({
      name: product.name,
      description: product.description ?? "",
      reference_price: product.reference_price === null ? "" : String(product.reference_price),
      category_id: product.category_id,
      main_image_url: product.main_image_url ?? "",
      available: product.available,
      featured: product.featured
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const byName = product.name.toLowerCase().includes(searchTerm.trim().toLowerCase());
      const byCategory = !categoryFilter || product.category_id === categoryFilter;
      return byName && byCategory;
    });
  }, [products, searchTerm, categoryFilter]);

  return (
    <section>
      <h1 className="text-2xl font-semibold">Manage Products</h1>
      <p className="mt-1 text-sm text-neutral-400">
        {editingProductId ? "Editing selected product in this same form." : "Create a new product."}
      </p>
      <form onSubmit={onSubmit} className="mt-4 grid gap-3 rounded border border-neutral-800 bg-neutral-900 p-4 md:grid-cols-2">
        <input required value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Name" className="rounded bg-neutral-800 px-3 py-2" />
        <select required value={form.category_id} onChange={(event) => setForm((prev) => ({ ...prev, category_id: event.target.value }))} className="rounded bg-neutral-800 px-3 py-2">
          <option value="">Select category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          min="0"
          step="0.01"
          value={form.reference_price}
          onChange={(event) => setForm((prev) => ({ ...prev, reference_price: event.target.value }))}
          placeholder="Reference price"
          className="rounded bg-neutral-800 px-3 py-2"
        />
        <input required value={form.main_image_url} onChange={(event) => setForm((prev) => ({ ...prev, main_image_url: event.target.value }))} placeholder="Main image URL" className="rounded bg-neutral-800 px-3 py-2" />
        <div className="md:col-span-2">
          <input type="file" accept="image/*" onChange={handleUpload} />
          {uploading && <p className="text-xs text-neutral-300">Uploading image...</p>}
        </div>
        <textarea required value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} placeholder="Description" className="h-24 rounded bg-neutral-800 px-3 py-2 md:col-span-2" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.available} onChange={(event) => setForm((prev) => ({ ...prev, available: event.target.checked }))} />
          Available
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.featured} onChange={(event) => setForm((prev) => ({ ...prev, featured: event.target.checked }))} />
          Featured
        </label>
        <div className="flex gap-2 md:col-span-2">
          <button disabled={saving} className="rounded bg-luxury-500 px-3 py-2 font-semibold text-neutral-950 disabled:opacity-60">
            {saving ? "Saving..." : editingProductId ? "Guardar producto" : "Create Product"}
          </button>
          {editingProductId && (
            <button type="button" onClick={resetForm} disabled={saving} className="rounded bg-neutral-800 px-3 py-2">
              Cancel edit
            </button>
          )}
        </div>
      </form>

      <div className="mt-6 grid gap-3 rounded border border-neutral-800 bg-neutral-900 p-4 md:grid-cols-2">
        <input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search by product name..."
          className="rounded bg-neutral-800 px-3 py-2"
        />
        <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="rounded bg-neutral-800 px-3 py-2">
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 space-y-2">
        {filteredProducts.map((product) => (
          <div key={product.id} className="rounded border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold">{product.name}</p>
                <p className="mt-1 line-clamp-2 text-xs text-neutral-300">{product.description}</p>
                <p className="text-xs text-luxury-100">{formatCurrency(product.reference_price)}</p>
                <p className="text-xs text-neutral-400">
                  {product.categories?.name ?? "No category"} · {product.available ? "Available" : "Unavailable"} · {product.featured ? "Featured" : "Standard"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link target="_blank" to={`/product/${product.id}`} className="rounded bg-neutral-800 px-2 py-1">
                  Preview
                </Link>
                <button onClick={() => startEditingProduct(product)} className="rounded bg-luxury-500 px-2 py-1 font-semibold text-neutral-950">
                  Edit product
                </button>
                <button onClick={() => void productService.update(product.id, { available: !product.available }).then(load)} className="rounded bg-neutral-800 px-2 py-1">
                  Toggle availability
                </button>
                <button onClick={() => void productService.update(product.id, { featured: !product.featured }).then(load)} className="rounded bg-neutral-800 px-2 py-1">
                  Feature
                </button>
                <button onClick={() => void productService.remove(product.id).then(load)} className="rounded bg-red-700 px-2 py-1">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <p className="rounded border border-neutral-800 bg-neutral-900 px-4 py-6 text-sm text-neutral-400">
            No products match this search/filter.
          </p>
        )}
      </div>
    </section>
  );
}

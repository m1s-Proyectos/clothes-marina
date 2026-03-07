import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
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
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [priceDraft, setPriceDraft] = useState("");
  const [imageDraft, setImageDraft] = useState("");
  const [availableDraft, setAvailableDraft] = useState(true);
  const [savingProductEdits, setSavingProductEdits] = useState(false);
  const [uploadingEditImage, setUploadingEditImage] = useState(false);

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

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    await productService.create({
      name: form.name,
      description: form.description,
      reference_price: Number(form.reference_price),
      category_id: form.category_id,
      main_image_url: form.main_image_url,
      available: form.available,
      featured: form.featured
    });
    setForm(initialForm);
    await load();
  }

  function startEditingProduct(product: Product) {
    setEditingProductId(product.id);
    setDescriptionDraft(product.description ?? "");
    setPriceDraft(product.reference_price === null ? "" : String(product.reference_price));
    setImageDraft(product.main_image_url ?? "");
    setAvailableDraft(product.available);
  }

  function cancelEditingProduct() {
    setEditingProductId(null);
    setDescriptionDraft("");
    setPriceDraft("");
    setImageDraft("");
    setAvailableDraft(true);
  }

  async function saveProductEdits(productId: string) {
    const nextDescription = descriptionDraft.trim();
    const nextPrice = Number(priceDraft);
    const nextImage = imageDraft.trim();
    if (!nextDescription || Number.isNaN(nextPrice) || nextPrice < 0 || !nextImage) return;

    setSavingProductEdits(true);
    try {
      await productService.update(productId, {
        description: nextDescription,
        reference_price: nextPrice,
        main_image_url: nextImage,
        available: availableDraft
      });
      await load();
      cancelEditingProduct();
    } finally {
      setSavingProductEdits(false);
    }
  }

  async function handleEditImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingEditImage(true);
    try {
      const url = await storageService.upload(file);
      setImageDraft(url);
    } finally {
      setUploadingEditImage(false);
    }
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold">Manage Products</h1>
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
          required
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
        <button className="rounded bg-luxury-500 px-3 py-2 font-semibold text-neutral-950 md:col-span-2">Create Product</button>
      </form>

      <div className="mt-6 space-y-2">
        {products.map((product) => (
          <div key={product.id} className="rounded border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold">{product.name}</p>
                <p className="mt-1 line-clamp-2 text-xs text-neutral-300">{product.description}</p>
                <p className="text-xs text-luxury-100">{formatCurrency(product.reference_price)}</p>
                <p className="text-xs text-neutral-400">
                  {product.available ? "Available" : "Unavailable"} · {product.featured ? "Featured" : "Standard"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link target="_blank" to={`/product/${product.id}`} className="rounded bg-neutral-800 px-2 py-1">
                  Preview
                </Link>
                <button onClick={() => startEditingProduct(product)} className="rounded bg-luxury-500 px-2 py-1 font-semibold text-neutral-950">
                  Edit product
                </button>
                <button onClick={() => void productService.update(product.id, { featured: !product.featured }).then(load)} className="rounded bg-neutral-800 px-2 py-1">
                  Feature
                </button>
                <button onClick={() => void productService.remove(product.id).then(load)} className="rounded bg-red-700 px-2 py-1">
                  Delete
                </button>
              </div>
            </div>

            {editingProductId === product.id && (
              <div className="mt-3 space-y-2 border-t border-neutral-800 pt-3">
                <label className="block text-xs text-neutral-400">Product features / Description</label>
                <textarea
                  value={descriptionDraft}
                  onChange={(event) => setDescriptionDraft(event.target.value)}
                  className="h-24 w-full rounded bg-neutral-800 px-3 py-2"
                />
                <label className="block text-xs text-neutral-400">Price</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={priceDraft}
                  onChange={(event) => setPriceDraft(event.target.value)}
                  className="w-full rounded bg-neutral-800 px-3 py-2"
                />
                <label className="block text-xs text-neutral-400">Main image URL</label>
                <input
                  type="url"
                  value={imageDraft}
                  onChange={(event) => setImageDraft(event.target.value)}
                  className="w-full rounded bg-neutral-800 px-3 py-2"
                />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={availableDraft} onChange={(event) => setAvailableDraft(event.target.checked)} />
                  Available
                </label>
                <input type="file" accept="image/*" onChange={handleEditImageUpload} />
                {uploadingEditImage && <p className="text-xs text-neutral-300">Uploading image...</p>}
                <div className="flex gap-2">
                  <button
                    onClick={() => void saveProductEdits(product.id)}
                    disabled={savingProductEdits || !descriptionDraft.trim() || !imageDraft.trim() || Number.isNaN(Number(priceDraft)) || Number(priceDraft) < 0}
                    className="rounded bg-luxury-500 px-3 py-2 font-semibold text-neutral-950 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingProductEdits ? "Saving..." : "Save changes"}
                  </button>
                  <button onClick={cancelEditingProduct} disabled={savingProductEdits} className="rounded bg-neutral-800 px-3 py-2">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

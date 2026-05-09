import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
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
  brand: string;
  color: string;
  size: string;
  offer_active: boolean;
  offer_quantity: string;
  offer_price: string;
}

const initialForm: ProductForm = {
  name: "",
  description: "",
  reference_price: "",
  category_id: "",
  main_image_url: "",
  available: true,
  featured: false,
  brand: "",
  color: "",
  size: "",
  offer_active: false,
  offer_quantity: "",
  offer_price: "",
};

function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

const txt = {
  primary: "text-[#1f1f1d]",
  secondary: "text-[#4f4f4b]",
  muted: "text-[#6a6a66]"
} as const;

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-[#1f1f1d] placeholder:text-[#6a6a66] outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-200/50";
const cardClass = "rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm shadow-slate-900/[0.04] md:p-5";
const btnSecondary =
  "inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-[#1f1f1d] transition hover:border-slate-300 hover:bg-slate-50";
const btnPrimary =
  "inline-flex items-center justify-center rounded-lg bg-luxury-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-luxury-700 disabled:opacity-60";

export default function AdminProductsPage() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilterId = searchParams.get("category") ?? "";

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductForm>(initialForm);
  const [uploading, setUploading] = useState(false);
  const [uploadInfo, setUploadInfo] = useState("");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [saving, setSaving] = useState(false);

  const setCategoryFilterId = useCallback(
    (id: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (id) next.set("category", id);
          else next.delete("category");
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const load = useCallback(
    () =>
      productService
        .list({ sort: "newest", ...(categoryFilterId ? { categoryId: categoryFilterId } : {}) })
        .then(setProducts),
    [categoryFilterId]
  );

  useEffect(() => {
    categoryService.getAll().then(setCategories);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const editId = (location.state as { editProductId?: string } | null)?.editProductId;
    if (!editId) return;
    const target = products.find((p) => p.id === editId);
    if (target) {
      startEditingProduct(target);
      window.history.replaceState({}, "");
      return;
    }
    let cancelled = false;
    void productService.getById(editId).then((p) => {
      if (cancelled || !p) return;
      setCategoryFilterId(p.category_id);
      startEditingProduct(p);
      window.history.replaceState({}, "");
    });
    return () => {
      cancelled = true;
    };
  }, [location.state, products, setCategoryFilterId]);

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadInfo("");
    const originalKB = (file.size / 1024).toFixed(0);
    try {
      const url = await storageService.upload(file);
      setForm((prev) => ({ ...prev, main_image_url: url }));
      setUploadInfo(`Original: ${originalKB} KB → Optimizada y subida como WebP.`);
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

    const offerQty = form.offer_quantity.trim() ? Number(form.offer_quantity) : null;
    const offerPrc = form.offer_price.trim() ? Number(form.offer_price) : null;

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      reference_price: referencePrice,
      category_id: form.category_id,
      main_image_url: form.main_image_url.trim(),
      available: form.available,
      featured: form.featured,
      brand: form.brand.trim(),
      color: form.color.trim(),
      size: form.size.trim(),
      offer_active: form.offer_active && offerQty !== null && offerPrc !== null,
      offer_quantity: offerQty,
      offer_price: offerPrc,
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
      featured: product.featured,
      brand: product.brand ?? "",
      color: product.color ?? "",
      size: product.size ?? "",
      offer_active: product.offer_active ?? false,
      offer_quantity: product.offer_quantity === null ? "" : String(product.offer_quantity),
      offer_price: product.offer_price === null ? "" : String(product.offer_price),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const filteredProducts = useMemo(() => {
    const normalizedSearch = normalizeSearchText(searchTerm);
    return products.filter((product) => {
      const normalizedName = normalizeSearchText(product.name);
      return !normalizedSearch || normalizedName.includes(normalizedSearch);
    });
  }, [products, searchTerm]);

  const activeCategoryName = useMemo(
    () => (categoryFilterId ? categories.find((c) => c.id === categoryFilterId)?.name : null),
    [categories, categoryFilterId]
  );

  return (
    <section className="space-y-6">
      <div>
        <h1 className={`text-2xl font-semibold ${txt.primary}`}>Gestionar productos</h1>
        <p className={`mt-1.5 text-sm ${txt.secondary}`}>
          {editingProductId ? "Editando el producto seleccionado en este formulario." : "Crear o editar productos del catálogo."}
        </p>
      </div>

      <form onSubmit={onSubmit} className={`grid gap-4 md:grid-cols-2 ${cardClass}`}>
        <div className="md:col-span-2">
          <label className={`mb-1 block text-xs font-semibold uppercase tracking-wide ${txt.muted}`}>Nombre</label>
          <input required value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Nombre del producto" className={inputClass} />
        </div>
        <div>
          <label className={`mb-1 block text-xs font-semibold uppercase tracking-wide ${txt.muted}`}>Categoría</label>
          <select required value={form.category_id} onChange={(event) => setForm((prev) => ({ ...prev, category_id: event.target.value }))} className={inputClass}>
            <option value="">Seleccionar categoría</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={`mb-1 block text-xs font-semibold uppercase tracking-wide ${txt.muted}`}>Precio de referencia</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.reference_price}
            onChange={(event) => setForm((prev) => ({ ...prev, reference_price: event.target.value }))}
            placeholder="0.00"
            className={inputClass}
          />
        </div>
        <div>
          <label className={`mb-1 block text-xs font-semibold uppercase tracking-wide ${txt.muted}`}>Marca</label>
          <input value={form.brand} onChange={(event) => setForm((prev) => ({ ...prev, brand: event.target.value }))} placeholder="Ej: Nike, Adidas" className={inputClass} />
        </div>
        <div>
          <label className={`mb-1 block text-xs font-semibold uppercase tracking-wide ${txt.muted}`}>Color</label>
          <input value={form.color} onChange={(event) => setForm((prev) => ({ ...prev, color: event.target.value }))} placeholder="Ej: Rojo, Azul" className={inputClass} />
        </div>
        <div>
          <label className={`mb-1 block text-xs font-semibold uppercase tracking-wide ${txt.muted}`}>Talla</label>
          <input value={form.size} onChange={(event) => setForm((prev) => ({ ...prev, size: event.target.value }))} placeholder="Ej: S, M, L, XL" className={inputClass} />
        </div>
        <div className="md:col-span-2">
          <label className={`mb-1 block text-xs font-semibold uppercase tracking-wide ${txt.muted}`}>URL imagen principal</label>
          <input required value={form.main_image_url} onChange={(event) => setForm((prev) => ({ ...prev, main_image_url: event.target.value }))} placeholder="https://..." className={inputClass} />
        </div>
        <div className="md:col-span-2">
          <label className={`mb-1 block text-xs font-semibold uppercase tracking-wide ${txt.muted}`}>Subir imagen</label>
          <input type="file" accept="image/*" onChange={handleUpload} className={`mt-1 text-sm ${txt.secondary}`} />
          {uploading && <p className={`mt-2 text-xs ${txt.muted}`}>Optimizando y subiendo imagen...</p>}
          {uploadInfo && <p className="mt-2 text-xs font-medium text-emerald-700">{uploadInfo}</p>}
        </div>
        <div className="md:col-span-2">
          <label className={`mb-1 block text-xs font-semibold uppercase tracking-wide ${txt.muted}`}>Descripción</label>
          <textarea required value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} placeholder="Descripción" className={`h-28 ${inputClass}`} />
        </div>
        <label className={`flex items-center gap-2 text-sm ${txt.primary}`}>
          <input type="checkbox" checked={form.available} onChange={(event) => setForm((prev) => ({ ...prev, available: event.target.checked }))} className="rounded border-slate-300 text-luxury-600 focus:ring-sky-300" />
          Disponible
        </label>
        <label className={`flex items-center gap-2 text-sm ${txt.primary}`}>
          <input type="checkbox" checked={form.featured} onChange={(event) => setForm((prev) => ({ ...prev, featured: event.target.checked }))} className="rounded border-slate-300 text-luxury-600 focus:ring-sky-300" />
          Destacado
        </label>
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 md:col-span-2">
          <label className={`flex items-center gap-2 text-sm font-semibold ${txt.primary}`}>
            <input type="checkbox" checked={form.offer_active} onChange={(event) => setForm((prev) => ({ ...prev, offer_active: event.target.checked }))} className="rounded border-slate-300 text-luxury-600 focus:ring-sky-300" />
            Activar oferta
          </label>
          {form.offer_active && (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <input
                type="number"
                min="2"
                step="1"
                value={form.offer_quantity}
                onChange={(event) => setForm((prev) => ({ ...prev, offer_quantity: event.target.value }))}
                placeholder="Cantidad (ej: 3)"
                className={`w-40 ${inputClass}`}
              />
              <span className={`text-sm ${txt.secondary}`}>×</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.offer_price}
                onChange={(event) => setForm((prev) => ({ ...prev, offer_price: event.target.value }))}
                placeholder="Precio oferta"
                className={`w-48 ${inputClass}`}
              />
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 md:col-span-2">
          <button disabled={saving} type="submit" className={btnPrimary}>
            {saving ? "Guardando..." : editingProductId ? "Guardar producto" : "Crear producto"}
          </button>
          {editingProductId && (
            <button type="button" onClick={resetForm} disabled={saving} className={btnSecondary}>
              Cancelar edición
            </button>
          )}
        </div>
      </form>

      <div className={cardClass}>
        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h2 className={`text-sm font-semibold ${txt.primary}`}>Filtrar por categoría</h2>
          {activeCategoryName ? (
            <p className={`text-sm ${txt.secondary}`}>
              Activa: <span className="font-semibold text-[#2f5f88]">{activeCategoryName}</span>
            </p>
          ) : (
            <p className={`text-sm ${txt.muted}`}>Mostrando todas las categorías</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategoryFilterId("")}
            className={
              !categoryFilterId
                ? "rounded-full border border-sky-300/55 bg-gradient-to-b from-[#dff2ff] to-[#cfe9ff] px-3.5 py-1.5 text-sm font-semibold text-[#2f5f88] shadow-sm shadow-sky-900/10 ring-1 ring-sky-200/45"
                : "rounded-full border border-slate-200 bg-slate-50/90 px-3.5 py-1.5 text-sm font-medium text-[#4f4f4b] transition hover:border-sky-200/70 hover:bg-white"
            }
          >
            Todas
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setCategoryFilterId(category.id)}
              className={
                categoryFilterId === category.id
                  ? "rounded-full border border-sky-300/55 bg-gradient-to-b from-[#dff2ff] to-[#cfe9ff] px-3.5 py-1.5 text-sm font-semibold text-[#2f5f88] shadow-sm shadow-sky-900/10 ring-1 ring-sky-200/45"
                  : "rounded-full border border-slate-200 bg-slate-50/90 px-3.5 py-1.5 text-sm font-medium text-[#4f4f4b] transition hover:border-sky-200/70 hover:bg-white"
              }
            >
              {category.name}
            </button>
          ))}
        </div>
        <div className="mt-4">
          <label className={`mb-1 block text-xs font-semibold uppercase tracking-wide ${txt.muted}`}>Buscar por nombre</label>
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Nombre del producto..."
            className={inputClass}
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredProducts.map((product) => (
          <div key={product.id} className={`${cardClass} !py-4`}>
            <div className="flex items-start gap-3">
              {product.main_image_url && (
                <img
                  src={product.main_image_url}
                  alt={product.name}
                  loading="lazy"
                  className="h-16 w-16 flex-shrink-0 rounded-lg border border-slate-200 object-cover"
                />
              )}
              <div className="flex min-w-0 flex-1 flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className={`font-semibold ${txt.primary}`}>{product.name}</p>
                  <p className={`mt-1 line-clamp-2 text-xs leading-relaxed ${txt.secondary}`}>{product.description}</p>
                  <p className="mt-1 text-sm font-semibold text-[#2f5f88]">
                    {formatCurrency(product.reference_price)}
                    {product.offer_active && product.offer_quantity && product.offer_price != null && (
                      <span className="ml-2 rounded-md bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700 ring-1 ring-red-200/60">
                        Oferta: {product.offer_quantity} × {formatCurrency(product.offer_price)}
                      </span>
                    )}
                  </p>
                  {(product.brand || product.color || product.size) && (
                    <p className={`mt-1 text-xs ${txt.secondary}`}>
                      {[product.brand && `Marca: ${product.brand}`, product.color && `Color: ${product.color}`, product.size && `Talla: ${product.size}`].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <p className={`mt-1 text-xs ${txt.muted}`}>
                    {product.categories?.name ?? "Sin categoría"} · {product.available ? "Disponible" : "No disponible"} · {product.featured ? "Destacado" : "Estándar"}
                  </p>
                </div>
                <div className="flex flex-shrink-0 flex-wrap gap-2">
                  <Link target="_blank" to={`/product/${product.id}`} className={btnSecondary}>
                    Vista previa
                  </Link>
                  <button type="button" onClick={() => startEditingProduct(product)} className={btnPrimary}>
                    Editar
                  </button>
                  <button type="button" onClick={() => void productService.update(product.id, { available: !product.available }).then(load)} className={btnSecondary}>
                    Alternar stock
                  </button>
                  <button type="button" onClick={() => void productService.update(product.id, { featured: !product.featured }).then(load)} className={btnSecondary}>
                    Destacar
                  </button>
                  <button type="button" onClick={() => void productService.remove(product.id).then(load)} className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-red-700">
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <p className={`rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm ${txt.secondary}`}>
            No hay productos con este criterio. Prueba otra categoría o limpia el buscador.
          </p>
        )}
      </div>
    </section>
  );
}

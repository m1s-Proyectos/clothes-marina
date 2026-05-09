import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import type { Category } from "@/types";
import { categoryService } from "@/services/categoryService";

const txt = {
  primary: "text-[#1f1f1d]",
  secondary: "text-[#4f4f4b]",
  muted: "text-[#6a6a66]"
} as const;

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-[#1f1f1d] placeholder:text-[#6a6a66] outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-200/50";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const load = () => categoryService.getAll().then(setCategories);

  useEffect(() => {
    void load();
  }, []);

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    await categoryService.create({ name, slug, image_url: imageUrl });
    setName("");
    setSlug("");
    setImageUrl("");
    await load();
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className={`text-2xl font-semibold ${txt.primary}`}>Gestionar categorías</h1>
        <p className={`mt-1.5 text-sm ${txt.secondary}`}>Crea categorías y revisa los productos asociados desde Productos.</p>
      </div>

      <form onSubmit={onCreate} className="grid gap-4 rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm md:grid-cols-4 md:p-5">
        <div>
          <label className={`mb-1 block text-xs font-semibold uppercase tracking-wide ${txt.muted}`}>Nombre</label>
          <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Nombre" className={inputClass} />
        </div>
        <div>
          <label className={`mb-1 block text-xs font-semibold uppercase tracking-wide ${txt.muted}`}>Slug</label>
          <input required value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="slug-url" className={inputClass} />
        </div>
        <div>
          <label className={`mb-1 block text-xs font-semibold uppercase tracking-wide ${txt.muted}`}>URL imagen</label>
          <input required value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://..." className={inputClass} />
        </div>
        <div className="flex items-end">
          <button type="submit" className="w-full rounded-lg bg-luxury-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-luxury-700 md:w-auto">
            Crear categoría
          </button>
        </div>
      </form>

      <div className="space-y-2">
        <h2 className={`text-sm font-semibold ${txt.primary}`}>Categorías existentes</h2>
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/90 bg-white px-4 py-3 shadow-sm"
          >
            <span className={`font-medium ${txt.primary}`}>{category.name}</span>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to={`/admin/products?category=${category.id}`}
                className="rounded-full border border-sky-300/50 bg-gradient-to-b from-[#eef6ff] to-[#dff2ff] px-3 py-1.5 text-xs font-semibold text-[#2f5f88] shadow-sm ring-1 ring-sky-200/40 transition hover:border-sky-400/60"
              >
                Ver productos
              </Link>
              <button
                type="button"
                onClick={() => void categoryService.remove(category.id).then(load)}
                className="text-xs font-semibold text-red-700 underline-offset-2 transition hover:underline"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

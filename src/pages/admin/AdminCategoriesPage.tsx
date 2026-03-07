import { useEffect, useState, type FormEvent } from "react";
import type { Category } from "@/types";
import { categoryService } from "@/services/categoryService";

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
    <section>
      <h1 className="text-2xl font-semibold">Manage Categories</h1>
      <form onSubmit={onCreate} className="mt-4 grid gap-3 rounded border border-neutral-800 bg-neutral-900 p-4 md:grid-cols-4">
        <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" className="rounded bg-neutral-800 px-3 py-2" />
        <input required value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="Slug" className="rounded bg-neutral-800 px-3 py-2" />
        <input required value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="Image URL" className="rounded bg-neutral-800 px-3 py-2" />
        <button className="rounded bg-luxury-500 px-3 py-2 font-semibold text-neutral-950">Create</button>
      </form>
      <div className="mt-5 space-y-2">
        {categories.map((category) => (
          <div key={category.id} className="flex items-center justify-between rounded border border-neutral-800 bg-neutral-900 px-4 py-2">
            <span>{category.name}</span>
            <button onClick={() => void categoryService.remove(category.id).then(load)} className="text-xs text-red-400">
              Delete
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

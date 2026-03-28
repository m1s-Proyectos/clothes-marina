import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/utils/format";
import OptimizedImage from "@/components/common/OptimizedImage";

interface DashboardProduct {
  id: string;
  name: string;
  main_image_url: string;
  reference_price: number | null;
  available: boolean;
  featured: boolean;
  created_at: string;
}

const PAGE_SIZE = 10;

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<DashboardProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  async function loadProducts(pageNumber: number): Promise<void> {
    const start = (pageNumber - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;

    const { data, error } = await supabase
      .from("products")
      .select("id, name, main_image_url, reference_price, available, featured, created_at")
      .order("created_at", { ascending: false })
      .range(start, end);

    if (error) throw error;

    const rows = (data ?? []) as DashboardProduct[];
    setProducts(rows.slice(0, PAGE_SIZE));
    setHasNextPage(rows.length > PAGE_SIZE);
  }

  useEffect(() => {
    loadProducts(page).finally(() => setLoading(false));

    const channel = supabase
      .channel("admin-products")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
        void loadProducts(page);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [page]);

  return (
    <section>
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      <p className="mt-2 text-neutral-300">Vista optimizada: 10 productos por pagina e imagenes en carga diferida.</p>

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={page === 1}
          className="rounded bg-neutral-800 px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          Anterior
        </button>
        <span className="text-sm text-neutral-300">Pagina {page}</span>
        <button
          onClick={() => setPage((prev) => prev + 1)}
          disabled={!hasNextPage}
          className="rounded bg-neutral-800 px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          Siguiente
        </button>
      </div>

      {loading ? (
        <p className="mt-6 text-neutral-300">Cargando productos...</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <article key={product.id} className="overflow-hidden rounded border border-neutral-800 bg-neutral-900">
              <OptimizedImage
                src={product.main_image_url}
                alt={product.name}
                loading="lazy"
                decoding="async"
                transform={{ width: 520, quality: 65, format: "webp", resize: "cover" }}
                responsiveWidths={[260, 360, 520]}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="h-44 w-full object-cover"
              />
              <div className="space-y-1 p-3">
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-luxury-100">{formatCurrency(product.reference_price)}</p>
                <p className="text-xs text-neutral-400">{product.available ? "Disponible" : "No disponible"}</p>
                <p className="text-xs text-neutral-400">{product.featured ? "Destacado" : "Estandar"}</p>
                <Link
                  to="/admin/products"
                  state={{ editProductId: product.id }}
                  className="mt-2 inline-block rounded bg-luxury-500 px-3 py-1 text-xs font-semibold text-neutral-950 hover:bg-luxury-400"
                >
                  Editar producto
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

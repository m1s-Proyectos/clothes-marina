import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const adminLinks = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/categories", label: "Categorias" },
  { to: "/admin/products", label: "Productos" },
  { to: "/admin/inbox", label: "Inbox" },
  { to: "/admin/access-requests", label: "Accesos" },
];

export default function AdminLayout() {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-surface-base">
      <header className="border-b border-luxury-500/10 bg-surface-raised/60 backdrop-blur-lg">
        <div className="container-shell flex h-14 items-center justify-between">
          <Link to="/" className="text-sm text-luxury-800 transition hover:text-luxury-900">
            &larr; Volver al sitio
          </Link>
          <button onClick={() => void logout()} className="rounded-lg border border-luxury-200/70 bg-surface-card px-3 py-1.5 text-xs text-slate-600 transition hover:text-slate-950">
            Cerrar sesion
          </button>
        </div>
      </header>
      <div className="container-shell py-8">
        <nav className="mb-8 flex flex-wrap gap-2 text-sm">
          {adminLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={"end" in link}
              className={({ isActive }) =>
                `rounded-lg px-3 py-1.5 transition-colors ${isActive ? "bg-luxury-100 text-luxury-900 font-medium" : "text-slate-600 hover:bg-surface-card hover:text-slate-950"}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <Outlet />
      </div>
    </div>
  );
}

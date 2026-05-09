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
          <Link to="/" className="text-sm font-medium text-[#2f5f88] transition hover:text-[#1f4a6e]">
            &larr; Volver al sitio
          </Link>
          <button
            onClick={() => void logout()}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-[#1f1f1d] transition hover:border-slate-300 hover:bg-slate-50"
          >
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
                `rounded-full px-3.5 py-2 text-sm font-medium transition-[color,background-color,box-shadow] duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
                  isActive
                    ? "border border-sky-300/55 bg-gradient-to-b from-[#dff2ff] to-[#cfe9ff] font-semibold text-[#2f5f88] shadow-sm shadow-sky-900/10 ring-1 ring-sky-200/45"
                    : "border border-transparent text-[#4f4f4b] hover:border-slate-200 hover:bg-white hover:text-[#1f1f1d]"
                }`
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

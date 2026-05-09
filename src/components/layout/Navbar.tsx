import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const links = [
  { to: "/", label: "Inicio" },
  { to: "/catalog", label: "Catalogo" },
  { to: "/collections", label: "Agregados Reciente" },
  { to: "/nuestra-informacion", label: "Nuestra información" },
  { to: "/contact", label: "Contacto" }
];

export default function Navbar() {
  const { session, loading, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const showAdminEntry = Boolean(!loading && session?.user && isAdmin);

  const desktopLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-[13px] uppercase tracking-[0.1em] transition-colors duration-200 ${isActive ? "text-luxury-800 font-semibold" : "text-slate-600 hover:text-slate-950"}`;
  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block rounded-lg px-4 py-2.5 text-sm transition-colors ${isActive ? "bg-surface-hover text-luxury-800 font-medium" : "text-slate-600 hover:bg-surface-hover hover:text-slate-950"}`;

  return (
    <header className="sticky top-0 z-40 border-b border-luxury-300/30 bg-white/90 backdrop-blur-xl">
      <div className="container-shell flex h-16 items-center justify-between">
        <NavLink to="/" className="text-2xl text-slate-950 transition hover:text-luxury-800">
          Marina&apos;s Clothes
        </NavLink>
        <button
          type="button"
          aria-label="Abrir menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((prev) => !prev)}
          className="rounded-lg border border-luxury-300/40 px-3 py-1.5 text-sm text-slate-700 transition hover:border-luxury-500/50 hover:text-slate-950 md:hidden"
        >
          {mobileOpen ? "Cerrar" : "Menu"}
        </button>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={desktopLinkClass}>
              {link.label}
            </NavLink>
          ))}
          {showAdminEntry && (
            <NavLink to="/admin" className={desktopLinkClass}>
              Dashboard
            </NavLink>
          )}
        </nav>
      </div>

      {mobileOpen && (
        <nav className="container-shell space-y-1 border-t border-luxury-300/30 bg-white/95 py-3 md:hidden">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} onClick={() => setMobileOpen(false)} className={mobileLinkClass}>
              {link.label}
            </NavLink>
          ))}
          {showAdminEntry && (
            <NavLink to="/admin" onClick={() => setMobileOpen(false)} className={mobileLinkClass}>
              Dashboard
            </NavLink>
          )}
        </nav>
      )}
    </header>
  );
}

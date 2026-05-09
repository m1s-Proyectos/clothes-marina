import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const links = [
  { to: "/", label: "Inicio", end: true },
  { to: "/catalog", label: "Catalogo" },
  { to: "/collections", label: "Agregados Reciente" },
  { to: "/nuestra-informacion", label: "Nuestra información" },
  { to: "/contact", label: "Contacto" }
] as const;

export default function Navbar() {
  const { session, loading, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const showAdminEntry = Boolean(!loading && session?.user && isAdmin);

  const navTransition =
    "transition-[color,background-color,box-shadow] duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]";

  const desktopLinkClass = ({ isActive }: { isActive: boolean }) => {
    const base = `inline-flex items-center text-[13px] uppercase tracking-[0.1em] ${navTransition} rounded-full px-3.5 py-2`;
    if (isActive) {
      return `${base} font-semibold text-[#2f5f88] bg-gradient-to-b from-[#dff2ff] via-[#d7efff] to-[#cfe9ff] shadow-[0_2px_14px_rgba(120,180,255,0.18)] ring-1 ring-sky-300/35`;
    }
    return `${base} font-medium text-slate-600 hover:text-[#2f5f88] hover:bg-[rgba(120,180,255,0.14)] hover:shadow-[0_1px_8px_rgba(120,180,255,0.12)]`;
  };

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) => {
    const base = `block rounded-xl px-4 py-2.5 text-sm ${navTransition}`;
    if (isActive) {
      return `${base} font-semibold text-[#2f5f88] bg-gradient-to-b from-[#eaf6ff] via-[#e2f2ff] to-[#dff2ff] shadow-[0_2px_12px_rgba(120,180,255,0.16)] ring-1 ring-sky-300/40`;
    }
    return `${base} font-medium text-slate-600 hover:bg-[rgba(120,180,255,0.12)] hover:text-[#2f5f88]`;
  };

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

        <nav className="hidden items-center gap-1.5 md:flex md:flex-wrap md:justify-end">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={"end" in link && link.end} className={desktopLinkClass}>
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
            <NavLink
              key={link.to}
              to={link.to}
              end={"end" in link && link.end}
              onClick={() => setMobileOpen(false)}
              className={mobileLinkClass}
            >
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

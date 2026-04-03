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
  const { isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const desktopLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-[13px] uppercase tracking-[0.1em] transition-colors duration-200 ${isActive ? "text-luxury-200 font-semibold" : "text-neutral-400 hover:text-neutral-100"}`;
  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block rounded-lg px-4 py-2.5 text-sm transition-colors ${isActive ? "bg-surface-hover text-luxury-200 font-medium" : "text-neutral-300 hover:bg-surface-hover hover:text-neutral-100"}`;

  return (
    <header className="sticky top-0 z-40 border-b border-luxury-500/10 bg-surface-base/90 backdrop-blur-xl">
      <div className="container-shell flex h-16 items-center justify-between">
        <NavLink to="/" className="text-2xl text-luxury-200 transition hover:text-luxury-100">
          Marina&apos;s Clothes
        </NavLink>
        <button
          type="button"
          aria-label="Abrir menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((prev) => !prev)}
          className="rounded-lg border border-luxury-500/20 px-3 py-1.5 text-sm text-neutral-300 transition hover:border-luxury-400/40 hover:text-neutral-100 md:hidden"
        >
          {mobileOpen ? "Cerrar" : "Menu"}
        </button>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={desktopLinkClass}>
              {link.label}
            </NavLink>
          ))}
          <NavLink
            to={isAdmin ? "/admin" : "/admin/login"}
            className="rounded-full border border-luxury-600/50 px-4 py-1.5 text-xs uppercase tracking-[0.12em] text-luxury-300 transition hover:border-luxury-400 hover:text-luxury-200"
          >
            Admin
          </NavLink>
        </nav>
      </div>

      {mobileOpen && (
        <nav className="container-shell space-y-1 border-t border-luxury-500/10 py-3 md:hidden">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} onClick={() => setMobileOpen(false)} className={mobileLinkClass}>
              {link.label}
            </NavLink>
          ))}
          <NavLink
            to={isAdmin ? "/admin" : "/admin/login"}
            onClick={() => setMobileOpen(false)}
            className="block rounded-lg border border-luxury-600/40 px-4 py-2 text-sm text-neutral-300 transition hover:border-luxury-400"
          >
            Admin
          </NavLink>
        </nav>
      )}
    </header>
  );
}

import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const links = [
  { to: "/", label: "Inicio" },
  { to: "/catalog", label: "Catalogo" },
  { to: "/collections", label: "Agregados Reciente" },
  { to: "/nuestra-informacion", label: "Nuestra Informacion" },
  { to: "/contact", label: "Contacto" }
];

export default function Navbar() {
  const { isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const desktopLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm transition ${isActive ? "text-luxury-100" : "text-neutral-300 hover:text-white"}`;
  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block rounded px-3 py-2 text-sm transition ${isActive ? "bg-neutral-800 text-luxury-100" : "text-neutral-200 hover:bg-neutral-800"}`;

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur">
      <div className="container-shell flex h-16 items-center justify-between">
        <NavLink to="/" className="text-lg font-semibold text-luxury-100">
          Marina's clothes
        </NavLink>
        <button
          type="button"
          aria-label="Abrir menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((prev) => !prev)}
          className="rounded border border-neutral-700 px-3 py-1 text-sm text-neutral-200 md:hidden"
        >
          Menu
        </button>

        <nav className="hidden items-center gap-5 md:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={desktopLinkClass}>
              {link.label}
            </NavLink>
          ))}
          <NavLink to={isAdmin ? "/admin" : "/admin/login"} className="rounded border border-luxury-700 px-3 py-1 text-sm">
            Admin
          </NavLink>
        </nav>
      </div>

      {mobileOpen && (
        <nav className="container-shell space-y-2 border-t border-neutral-800 py-3 md:hidden">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} onClick={() => setMobileOpen(false)} className={mobileLinkClass}>
              {link.label}
            </NavLink>
          ))}
          <NavLink
            to={isAdmin ? "/admin" : "/admin/login"}
            onClick={() => setMobileOpen(false)}
            className="block rounded border border-luxury-700 px-3 py-1 text-sm text-neutral-200"
          >
            Admin
          </NavLink>
        </nav>
      )}
    </header>
  );
}

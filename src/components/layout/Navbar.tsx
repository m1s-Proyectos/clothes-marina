import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const links = [
  { to: "/", label: "Home" },
  { to: "/catalog", label: "Catalog" },
  { to: "/collections", label: "New Collections" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" }
];

export default function Navbar() {
  const { isAdmin } = useAuth();
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur">
      <div className="container-shell flex h-16 items-center justify-between">
        <NavLink to="/" className="text-lg font-semibold text-luxury-100">
          Clothes Marina
        </NavLink>
        <nav className="hidden items-center gap-5 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm transition ${isActive ? "text-luxury-100" : "text-neutral-300 hover:text-white"}`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <NavLink to={isAdmin ? "/admin" : "/admin/login"} className="rounded border border-luxury-700 px-3 py-1 text-sm">
            Admin
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

import { Link, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminLayout() {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-neutral-950">
      <header className="border-b border-neutral-800">
        <div className="container-shell flex h-16 items-center justify-between">
          <Link to="/" className="text-luxury-100">
            Back to site
          </Link>
          <button onClick={() => void logout()} className="rounded bg-neutral-800 px-3 py-1 text-sm">
            Logout
          </button>
        </div>
      </header>
      <div className="container-shell py-8">
        <nav className="mb-6 flex gap-3 text-sm">
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/categories">Categories</Link>
          <Link to="/admin/products">Products</Link>
        </nav>
        <Outlet />
      </div>
    </div>
  );
}

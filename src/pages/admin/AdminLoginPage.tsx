import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Seo from "@/components/common/Seo";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";
import { adminAccessService } from "@/services/adminAccessService";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { session, login, logout, isAdmin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [requestingAccess, setRequestingAccess] = useState(false);

  useEffect(() => {
    if (isAdmin) navigate("/admin");
  }, [isAdmin, navigate]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await login(email, password);
      const adminAccess = await authService.isAdmin();
      if (!adminAccess) {
        setError("Este usuario no tiene permisos de admin. Puedes solicitar acceso abajo.");
      } else {
        navigate("/admin");
      }
    } catch {
      setError("Credenciales invalidas.");
    }
  }

  async function requestAdminAccess() {
    if (!session?.user) return;

    setRequestingAccess(true);
    setRequestMessage("");
    try {
      await adminAccessService.requestAccess({
        userId: session.user.id,
        email: session.user.email ?? "no-email",
        fullName: (session.user.user_metadata?.full_name as string | undefined) ?? (session.user.user_metadata?.name as string | undefined)
      });
      setRequestMessage("Solicitud enviada. Un admin existente la revisara.");
    } catch {
      setRequestMessage("No se pudo enviar la solicitud en este momento.");
    } finally {
      setRequestingAccess(false);
    }
  }

  const fieldClass =
    "w-full rounded-xl border border-luxury-200/70 bg-surface-card px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-luxury-500/50 focus:ring-2 focus:ring-luxury-200/60";

  const passwordFieldClass =
    "w-full rounded-xl border border-slate-200 px-4 py-3 text-base font-normal leading-normal text-slate-950 caret-slate-950 shadow-[inset_0_1px_3px_rgba(15,23,42,0.08)] placeholder:text-slate-400 outline-none transition focus:border-luxury-500 focus:ring-2 focus:ring-luxury-200/70 " +
    (password.length > 0 ? "bg-white" : "bg-slate-50 focus:bg-white");

  return (
    <div className="relative flex min-h-[80vh] items-center justify-center px-4">
      <Seo title="Admin Login" description="Admin login for Marina's Clothes." path="/admin/login" noindex />
      <div className="relative z-10 mx-auto w-full max-w-md rounded-2xl border border-luxury-500/10 bg-surface-raised p-8 shadow-sm shadow-luxury-900/5">
        <Link to="/" className="mb-6 inline-block rounded-lg border border-luxury-200/70 px-3 py-1.5 text-xs text-slate-600 transition hover:text-slate-950">
          &larr; Regresar a inicio
        </Link>
        <h1 className="text-2xl font-semibold text-slate-950">Admin Login</h1>
        <p className="mt-1 text-sm text-neutral-500">Inicia sesion para gestionar tu catalogo.</p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit} autoComplete="on">
          <div className="space-y-1.5">
            <label htmlFor="admin-login-email" className="block text-xs font-medium text-slate-700">
              Email
            </label>
            <input
              id="admin-login-email"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tu@email.com"
              className={fieldClass}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="admin-login-password" className="block text-xs font-medium text-slate-700">
              Contraseña
            </label>
            <input
              id="admin-login-password"
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="********"
              spellCheck={false}
              className={passwordFieldClass}
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-luxury-600 py-2.5 text-sm font-semibold text-white transition hover:bg-luxury-700"
          >
            Iniciar sesion
          </button>
        </form>
        {session && !isAdmin && (
          <div className="mt-5 rounded-xl border border-luxury-500/10 bg-surface-card p-4">
            <p className="text-sm text-neutral-400">Autenticado pero sin permisos de admin.</p>
            <button
              type="button"
              onClick={() => void requestAdminAccess()}
              disabled={requestingAccess}
              className="mt-3 rounded-lg bg-surface-hover px-4 py-2 text-sm text-slate-700 transition hover:text-slate-950 disabled:opacity-60"
            >
              {requestingAccess ? "Enviando..." : "Solicitar acceso admin"}
            </button>
            {requestMessage && <p className="mt-2 text-xs text-neutral-400">{requestMessage}</p>}
            <button type="button" onClick={() => void logout()} className="mt-3 block text-xs text-neutral-500 underline transition hover:text-neutral-300">
              Cerrar sesion
            </button>
          </div>
        )}
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </div>
    </div>
  );
}

import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Seo from "@/components/common/Seo";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";
import { adminAccessService } from "@/services/adminAccessService";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { session, login, loginWithGitHub, logout, isAdmin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingGithub, setLoadingGithub] = useState(false);
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

  async function onGitHubLogin() {
    setError("");
    setLoadingGithub(true);
    try {
      await loginWithGitHub();
    } catch {
      setError("No se pudo iniciar sesion con GitHub.");
      setLoadingGithub(false);
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
    "w-full rounded-xl border border-luxury-500/15 bg-surface-card px-4 py-3 text-sm text-neutral-200 placeholder-neutral-500 outline-none transition focus:border-luxury-400/40 focus:ring-1 focus:ring-luxury-500/20";

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Seo title="Admin Login" description="Admin login for Marina's Clothes." path="/admin/login" noindex />
      <div className="mx-auto w-full max-w-md rounded-2xl border border-luxury-500/10 bg-surface-raised p-8">
        <Link to="/" className="mb-6 inline-block rounded-lg border border-luxury-500/15 px-3 py-1.5 text-xs text-neutral-400 transition hover:text-neutral-200">
          &larr; Regresar a inicio
        </Link>
        <h1 className="text-2xl font-semibold text-luxury-100">Admin Login</h1>
        <p className="mt-1 text-sm text-neutral-500">Inicia sesion para gestionar tu catalogo.</p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" className={fieldClass} />
          <input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" className={fieldClass} />
          <button className="w-full rounded-xl bg-luxury-400 py-2.5 text-sm font-semibold text-surface-base transition hover:bg-luxury-300">Iniciar sesion</button>
        </form>
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-luxury-500/10" />
          <span className="text-xs text-neutral-500">o</span>
          <div className="h-px flex-1 bg-luxury-500/10" />
        </div>
        <button
          type="button"
          onClick={() => void onGitHubLogin()}
          disabled={loadingGithub}
          className="w-full rounded-xl border border-luxury-500/15 bg-surface-card py-2.5 text-sm font-medium text-neutral-300 transition hover:border-luxury-400/30 hover:text-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loadingGithub ? "Redirigiendo a GitHub..." : "Continuar con GitHub"}
        </button>
        {session && !isAdmin && (
          <div className="mt-5 rounded-xl border border-luxury-500/10 bg-surface-card p-4">
            <p className="text-sm text-neutral-400">Autenticado pero sin permisos de admin.</p>
            <button
              type="button"
              onClick={() => void requestAdminAccess()}
              disabled={requestingAccess}
              className="mt-3 rounded-lg bg-surface-hover px-4 py-2 text-sm text-neutral-300 transition hover:text-neutral-100 disabled:opacity-60"
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

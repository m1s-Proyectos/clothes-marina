import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Seo from "@/components/common/Seo";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { session, login, loginWithGitHub, logout, isAdmin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingGithub, setLoadingGithub] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAdmin) navigate("/admin");
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (!session || isAdmin) return;
    setError("Your account is authenticated but does not have admin access.");
    void logout();
  }, [session, isAdmin, logout]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await login(email, password);
      const adminAccess = await authService.isAdmin();
      if (!adminAccess) {
        setError("This user does not have admin permissions.");
        await logout();
      } else {
        navigate("/admin");
      }
    } catch {
      setError("Invalid admin credentials.");
    }
  }

  async function onGitHubLogin() {
    setError("");
    setLoadingGithub(true);
    try {
      await loginWithGitHub();
    } catch {
      setError("Unable to start GitHub login.");
      setLoadingGithub(false);
    }
  }

  return (
    <div className="container-shell py-20">
      <Seo title="Admin Login" description="Admin login for Clothes Marina." />
      <div className="mx-auto max-w-md rounded-xl border border-neutral-800 bg-neutral-900 p-6">
        <h1 className="text-2xl font-semibold">Admin Login</h1>
        <form className="mt-4 space-y-3" onSubmit={onSubmit}>
          <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" className="w-full rounded bg-neutral-800 px-3 py-2" />
          <input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" className="w-full rounded bg-neutral-800 px-3 py-2" />
          <button className="w-full rounded bg-luxury-500 px-5 py-2 font-semibold text-neutral-950">Sign in</button>
        </form>
        <div className="my-4 h-px bg-neutral-700" />
        <button
          type="button"
          onClick={() => void onGitHubLogin()}
          disabled={loadingGithub}
          className="w-full rounded border border-neutral-700 bg-neutral-800 px-5 py-2 font-semibold transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loadingGithub ? "Redirecting to GitHub..." : "Continue with GitHub"}
        </button>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </div>
    </div>
  );
}

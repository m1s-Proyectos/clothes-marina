import { useEffect, useState, type FormEvent } from "react";
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
        setError("This user does not have admin permissions. You can request access below.");
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
      setRequestMessage("Access request submitted. An existing admin will review it.");
    } catch {
      setRequestMessage("Unable to submit request right now.");
    } finally {
      setRequestingAccess(false);
    }
  }

  return (
    <div className="container-shell py-20">
      <Seo title="Admin Login" description="Admin login for Marina's Clothes." />
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
        {session && !isAdmin && (
          <div className="mt-4 rounded border border-neutral-700 p-3">
            <p className="text-sm text-neutral-300">Authenticated but not admin yet.</p>
            <button
              type="button"
              onClick={() => void requestAdminAccess()}
              disabled={requestingAccess}
              className="mt-3 rounded bg-neutral-800 px-4 py-2 text-sm disabled:opacity-60"
            >
              {requestingAccess ? "Submitting..." : "Request admin access"}
            </button>
            {requestMessage && <p className="mt-2 text-xs text-neutral-300">{requestMessage}</p>}
            <button type="button" onClick={() => void logout()} className="mt-3 block text-xs text-neutral-400 underline">
              Logout
            </button>
          </div>
        )}
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </div>
    </div>
  );
}

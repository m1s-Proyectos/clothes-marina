import { supabase } from "@/lib/supabase";
import env from "@/config/env";

const ADMIN_ROLE = "admin";

function getRoleFromSession(session: Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]): string {
  return (session?.user?.app_metadata?.role as string | undefined) ?? "";
}

export const authService = {
  async login(email: string, password: string): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },

  async loginWithGitHub(): Promise<void> {
    const currentOrigin = typeof window !== "undefined" && window.location?.origin ? window.location.origin : "";
    const isLocalHost =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
    const redirectBase = isLocalHost && currentOrigin ? currentOrigin : env.appUrl;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${redirectBase}/admin/login`
      }
    });
    if (error) throw error;
  },

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async isAdmin(): Promise<boolean> {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return getRoleFromSession(data.session) === ADMIN_ROLE;
  }
};

import { supabase } from "@/lib/supabase";

const ADMIN_ROLE = "admin";

function getRoleFromSession(session: Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]): string {
  return (session?.user?.app_metadata?.role as string | undefined) ?? "";
}

export const authService = {
  async login(email: string, password: string): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
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

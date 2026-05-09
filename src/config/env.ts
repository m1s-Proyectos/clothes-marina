const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const env = {
  supabaseUrl: supabaseUrl || "https://example.supabase.co",
  supabaseAnonKey: supabaseAnonKey || "local-dev-placeholder-key",
  appUrl: (import.meta.env.VITE_APP_URL as string) || "http://localhost:5173",
  whatsappPhone: (import.meta.env.VITE_WHATSAPP_PHONE as string) || "50379128469",
  edgeContactUrl: (import.meta.env.VITE_EDGE_CONTACT_URL as string) || "",
  isSupabaseConfigured
};

if (!env.isSupabaseConfigured) {
  console.warn("Missing Supabase environment variables.");
}

export default env;

const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
  appUrl: (import.meta.env.VITE_APP_URL as string) || "http://localhost:5173",
  whatsappPhone: (import.meta.env.VITE_WHATSAPP_PHONE as string) || "50379128469",
  edgeContactUrl: (import.meta.env.VITE_EDGE_CONTACT_URL as string) || ""
};

if (!env.supabaseUrl || !env.supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn("Missing Supabase environment variables.");
}

export default env;

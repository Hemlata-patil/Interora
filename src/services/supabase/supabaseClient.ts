// Minimal Supabase client placeholder structure
// Real keys and authorization will be added during the Supabase phase.

export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || '',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
};

export const isSupabaseConfigured = () => {
  return Boolean(supabaseConfig.url && supabaseConfig.anonKey);
};

import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

const isValidUrl = (url: string) => {
  try {
    return Boolean(url && url.startsWith('http') && !url.includes('YOUR_SUPABASE'));
  } catch {
    return false;
  }
};

export const isSupabaseConfigured = () => {
  return isValidUrl(rawUrl) && Boolean(rawAnonKey && !rawAnonKey.includes('YOUR_SUPABASE'));
};

const validUrl = isValidUrl(rawUrl) ? rawUrl : 'https://placeholder.supabase.co';
const validKey = rawAnonKey || 'placeholder-anon-key';

export const supabase = createClient(validUrl, validKey);

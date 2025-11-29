import { createClient } from '@supabase/supabase-js';

// DIRECT ACCESS: This is required for Netlify/Vite to perform string replacement during build.
// We cast to 'any' to avoid TypeScript complaining about import.meta.env if types aren't set up.
const getEnv = (key: string) => {
  try {
    return (import.meta as any).env[key] || '';
  } catch (e) {
    return '';
  }
};

// Access variables directly so the bundler sees them
const envUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const envKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

// Fallback logic
const fallbackUrl = 'https://placeholder.supabase.co';
const fallbackKey = 'placeholder';

// Check if configured (preventing the "YOUR_SUPABASE_URL" placeholder)
export const isSupabaseConfigured = 
  !!envUrl && 
  !!envKey && 
  envUrl !== 'YOUR_SUPABASE_URL';

const url = isSupabaseConfigured ? envUrl : fallbackUrl;
const key = isSupabaseConfigured ? envKey : fallbackKey;

export const supabase = createClient(url, key);
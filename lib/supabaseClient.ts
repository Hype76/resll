import { createClient } from '@supabase/supabase-js';

// @ts-ignore
const env = import.meta.env || {};

// Access variables directly so the bundler sees them
// We use safe access patterns to prevent white-screen crashes if env is undefined
// @ts-ignore
const envUrl = env.VITE_SUPABASE_URL;
// @ts-ignore
const envKey = env.VITE_SUPABASE_ANON_KEY;

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
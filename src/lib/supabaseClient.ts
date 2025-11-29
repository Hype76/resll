import { createClient } from '@supabase/supabase-js';

// Access variables via import.meta.env for Vite
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fallback logic for safety, though Vite build will use env vars
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
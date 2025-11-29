import { createClient } from '@supabase/supabase-js';

// Helper to safely get environment variables in Vite/Netlify
const getEnvVar = (key: string) => {
  // Try Vite standard (import.meta.env)
  if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[key]) {
    return (import.meta as any).env[key];
  }
  // Try Legacy/Process (if polyfilled)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return '';
};

const envUrl = getEnvVar('VITE_SUPABASE_URL');
const envKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

// We use a fallback URL that is syntactically valid to prevent the createClient function
// from throwing an error during the initial render phase if env vars are missing.
const fallbackUrl = 'https://placeholder.supabase.co';
const fallbackKey = 'placeholder';

// Check if we have real values or if they are still the default placeholders
export const isSupabaseConfigured = 
  !!envUrl && 
  !!envKey && 
  envUrl !== 'YOUR_SUPABASE_URL';

const url = isSupabaseConfigured ? envUrl : fallbackUrl;
const key = isSupabaseConfigured ? envKey : fallbackKey;

export const supabase = createClient(url, key);
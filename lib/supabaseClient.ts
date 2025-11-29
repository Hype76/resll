
import { createClient } from '@supabase/supabase-js';

// NOTE: In a real production build, these should be in .env files.
// For this environment, we are using placeholders that the user must replace.
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


import { createClient } from '@supabase/supabase-js';

// These environment variables will need to be set in a .env file
// VITE_SUPABASE_URL=https://your-project.supabase.co
// VITE_SUPABASE_ANON_KEY=your-anon-key

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or Key is missing! Check your .env file.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

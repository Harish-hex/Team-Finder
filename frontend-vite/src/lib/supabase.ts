import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Debug logging
console.log('🔍 Debug - Supabase URL:', supabaseUrl);
console.log('🔍 Debug - Anon Key (first 30 chars):', supabaseAnonKey.substring(0, 30));

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder',
    {
        auth: {
            storage: window.localStorage,
            storageKey: 'teamfinder-auth',
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    }
);

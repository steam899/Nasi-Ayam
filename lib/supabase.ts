import { createClient } from '@supabase/supabase-js';

// Ambil URL & Key, jika tiada letak string kosong
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Buat client. Jika URL salah, ia tidak akan 'crash' kan sistem semasa build
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

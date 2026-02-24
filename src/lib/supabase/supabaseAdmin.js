/**
 * supabaseAdmin.js
 *
 * Admin Supabase client using service role key.
 * Only use in server-side / Vercel function contexts — never expose to the browser.
 * In the Vite SPA build, falls back gracefully to the anon key.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 'https://qtrypzzcjebvfcihiynt.supabase.co';
const supabaseServiceKey =
  import.meta.env?.VITE_SUPABASE_SERVICE_ROLE_KEY ||
  import.meta.env?.VITE_SUPABASE_ANON_KEY ||
  '';

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

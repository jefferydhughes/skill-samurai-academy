/**
 * server.js
 *
 * Browser-safe Supabase client. The former Next.js server client
 * (which imported next/headers) has been replaced with the standard
 * browser client for compatibility with this Vite/React SPA.
 */
export { supabase as supabaseServer, supabase as default } from './supabaseClient';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://omgtqczbzmgvtwptdbxm.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tZ3RxY3piem1ndnR3cHRkYnhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NDAxMjEsImV4cCI6MjA3OTIxNjEyMX0.lI7N_CfwXuAVPZHDc4EU4Wq_pfxF9mOTiuEzmAU9wTM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

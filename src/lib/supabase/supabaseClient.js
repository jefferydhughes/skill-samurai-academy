import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qtrypzzcjebvfcihiynt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0cnlwenpjamVidmZjaGl5bnQiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcxMjg4NzA1MiwiZXhwIjoxOTQ2NDc3MDUyfQ.VGJ8dGz2oYPVwWQ2kVh3hPZQmJQA2WzO3e3D8K-hQNc9-A';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

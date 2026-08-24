import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://oqujdxnkzkwqfmvcepvl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xdWpkeG5remt3cWZtdmNlcHZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1Nzk5MzUsImV4cCI6MjEwMzE1NTkzNX0.J3xex9XS1FPHS6mC-f-jjm-zqrKTrTaZngvuUUUZEiw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
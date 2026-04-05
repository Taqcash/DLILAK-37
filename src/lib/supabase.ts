import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || "https://fknoxzdzchlgvwxcfsqh.supabase.co";
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrbm94emR6Y2hsZ3Z3eGNmc3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzOTk0MjMsImV4cCI6MjA4OTk3NTQyM30.6RLc84yTP3Wc0rG7XwchXTz1qYp5jKJY_tNvk4oeLpM";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

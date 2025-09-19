import { supabase } from './lib/supabase.js';

// Use Supabase client instead of direct database connection
export const db = supabase;
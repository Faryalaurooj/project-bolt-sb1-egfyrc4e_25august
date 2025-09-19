import { createClient } from '@supabase/supabase-js';

// Direct Supabase configuration to avoid DNS issues
const supabaseUrl = 'https://zdcjwzvzfvlumipbbjzp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkY2p3enZ6ZnZsdW1pcGJianpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMDAyNzIsImV4cCI6MjA2NDY3NjI3Mn0.bUBuPWRHjgyZouC4Xf3krgewQwdHi7rtOFsrWAi29VQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
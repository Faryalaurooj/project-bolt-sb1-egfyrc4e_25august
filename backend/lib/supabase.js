import { createClient } from '@supabase/supabase-js';

// Backend Supabase configuration with service role key for full access
const supabaseUrl = 'https://zdcjwzvzfvlumipbbjzp.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkY2p3enZ6ZnZsdW1pcGJianpwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTEwMDI3MiwiZXhwIjoyMDY0Njc2MjcyfQ.-btnCmdRjYBziQ327XLni2RkgW1_U9d1IePxxXATMTU';

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
  'https://kckjoseznwiadmcvxdbw.supabase.co';

const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtja2pvc2V6bndpYWRtY3Z4ZGJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4MTkwMTUsImV4cCI6MjEwMDM5NTAxNX0.5iQkrrERnZo5xu2lzDxjNYc_WbiMwEElNcqcFa6sYD4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

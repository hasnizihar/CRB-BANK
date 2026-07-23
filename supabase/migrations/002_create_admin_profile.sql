-- Run this in your Supabase Dashboard SQL Editor
-- This links your newly created login email to an 'administrator' profile
-- so that you have permission to insert/edit members and other records.

INSERT INTO public.profiles (id, name, username, role, status)
SELECT id, 'Master Admin', 'admin_kattankudy', 'administrator', 'active'
FROM auth.users
WHERE email = 'admin@kattankudympcs.lk'
ON CONFLICT (id) DO NOTHING;

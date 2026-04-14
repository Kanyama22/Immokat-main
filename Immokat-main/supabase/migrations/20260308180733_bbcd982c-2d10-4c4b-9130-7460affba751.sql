
-- Fix overly permissive insert policy - the trigger uses SECURITY DEFINER so it bypasses RLS
DROP POLICY "Allow insert for auth trigger" ON public.profiles;

-- Only allow authenticated users to insert their own profile (fallback)
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

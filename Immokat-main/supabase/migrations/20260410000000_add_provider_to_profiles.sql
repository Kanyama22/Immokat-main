-- Add provider column to track how users authenticated
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'email';

-- Update existing Google users by joining with auth.users metadata
-- (only runs once; safe to re-run due to coalesce)
UPDATE public.profiles p
SET provider = COALESCE(
  (SELECT au.raw_app_meta_data->>'provider'
   FROM auth.users au
   WHERE au.id = p.id),
  'email'
);

-- Update the trigger to capture the provider on every new signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, provider)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email')
  )
  ON CONFLICT (id) DO UPDATE
    SET provider = EXCLUDED.provider;
  RETURN NEW;
END;
$$;

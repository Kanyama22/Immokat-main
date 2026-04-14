-- Fix & harden the reviews system (idempotent)
-- Creates the table if absent, refreshes all policies, adds missing user_roles policy.

-- 0. Allow each user to see their own role (fixes checkAdmin for non-admins)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'user_roles'
      AND policyname = 'Users can view own role'
  ) THEN
    CREATE POLICY "Users can view own role"
      ON public.user_roles FOR SELECT TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- 1. Reviews table (idempotent)
CREATE TABLE IF NOT EXISTS public.reviews (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id   UUID        NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  user_id      UUID        NOT NULL REFERENCES auth.users(id)      ON DELETE CASCADE,
  author_name  TEXT        NOT NULL,
  content      TEXT        NOT NULL,
  rating       INTEGER     NOT NULL CHECK (rating BETWEEN 1 AND 5),
  status       TEXT        NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Enable RLS (safe if already enabled)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 3. Grants
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.reviews TO authenticated;

-- 4. Drop & re-create policies to ensure consistency
DO $$ BEGIN
  DROP POLICY IF EXISTS "View approved reviews"         ON public.reviews;
  DROP POLICY IF EXISTS "Users can view own reviews"    ON public.reviews;
  DROP POLICY IF EXISTS "Admins can view all reviews"   ON public.reviews;
  DROP POLICY IF EXISTS "Users can insert reviews"      ON public.reviews;
  DROP POLICY IF EXISTS "Admins can update reviews"     ON public.reviews;
  DROP POLICY IF EXISTS "Admins can delete reviews"     ON public.reviews;
  DROP POLICY IF EXISTS "Users can delete own reviews"  ON public.reviews;
END $$;

-- Anyone (including anonymous) can read approved reviews
CREATE POLICY "View approved reviews"
  ON public.reviews FOR SELECT
  USING (status = 'approved');

-- Logged-in users can always read their own reviews (any status)
CREATE POLICY "Users can view own reviews"
  ON public.reviews FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Admins can read every review
CREATE POLICY "Admins can view all reviews"
  ON public.reviews FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Logged-in users can submit one new review; status must be 'pending'
CREATE POLICY "Users can insert reviews"
  ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Admins can approve / reject
CREATE POLICY "Admins can update reviews"
  ON public.reviews FOR UPDATE TO authenticated
  USING  (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can delete any review
CREATE POLICY "Admins can delete reviews"
  ON public.reviews FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Users can delete their own review (e.g. retract a pending review)
CREATE POLICY "Users can delete own reviews"
  ON public.reviews FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

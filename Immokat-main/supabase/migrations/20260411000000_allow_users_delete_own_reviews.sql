-- Allow authenticated users to delete their own reviews (e.g. retract a pending review)
-- Idempotent: drop & re-create

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can delete own reviews" ON public.reviews;
  CREATE POLICY "Users can delete own reviews"
    ON public.reviews FOR DELETE TO authenticated
    USING (auth.uid() = user_id);
END $$;

-- Reviews / comments table
CREATE TABLE public.reviews (
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

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Everyone can read approved reviews
CREATE POLICY "View approved reviews"
  ON public.reviews FOR SELECT
  USING (status = 'approved');

-- Authenticated users can read their own reviews (any status)
CREATE POLICY "Users can view own reviews"
  ON public.reviews FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Admins can read all reviews
CREATE POLICY "Admins can view all reviews"
  ON public.reviews FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Authenticated users can submit a review linked to themselves
CREATE POLICY "Users can insert reviews"
  ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admins can update (approve / reject)
CREATE POLICY "Admins can update reviews"
  ON public.reviews FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete reviews
CREATE POLICY "Admins can delete reviews"
  ON public.reviews FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

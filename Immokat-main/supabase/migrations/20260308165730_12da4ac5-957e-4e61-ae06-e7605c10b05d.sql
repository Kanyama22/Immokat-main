-- 1. Roles enum & user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 2. Listings table
CREATE TABLE public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price BIGINT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('vente', 'location')),
  property_type TEXT NOT NULL CHECK (property_type IN ('maison', 'terrain', 'appartement')),
  commune TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Lubumbashi',
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  area INTEGER NOT NULL,
  address TEXT,
  featured BOOLEAN DEFAULT false,
  images TEXT[] DEFAULT '{}',
  contact_phone TEXT,
  contact_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view listings"
  ON public.listings FOR SELECT USING (true);

CREATE POLICY "Admins can insert listings"
  ON public.listings FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update listings"
  ON public.listings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete listings"
  ON public.listings FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-images', 'listing-images', true);

CREATE POLICY "Listing images are publicly accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'listing-images');

CREATE POLICY "Admins can upload listing images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'listing-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update listing images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'listing-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete listing images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'listing-images' AND public.has_role(auth.uid(), 'admin'));

-- 5. Favorites table
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, listing_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON public.favorites FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
  ON public.favorites FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove favorites"
  ON public.favorites FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
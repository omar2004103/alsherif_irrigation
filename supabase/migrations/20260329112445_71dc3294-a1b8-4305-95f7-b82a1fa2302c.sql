-- Create profiles table for storing user info (name, phone)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Everyone can read profiles (admin needs this)
CREATE POLICY "Admins can read all profiles" ON public.profiles
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR id = auth.uid());

-- Users can update own profile
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE TO authenticated
USING (id = auth.uid());

-- Anyone authenticated can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

-- Admins can delete profiles
CREATE POLICY "Admins can delete profiles" ON public.profiles
FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  -- Auto-assign customer role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Allow users to read their own roles
DROP POLICY IF EXISTS "Admins can read roles" ON public.user_roles;
CREATE POLICY "Users can read own roles" ON public.user_roles
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));
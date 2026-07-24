
-- Extend products with the fields the Products Module needs
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS brand text,
  ADD COLUMN IF NOT EXISTS product_code text,
  ADD COLUMN IF NOT EXISTS availability text NOT NULL DEFAULT 'available',
  ADD COLUMN IF NOT EXISTS long_description text,
  ADD COLUMN IF NOT EXISTS specs jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS applications jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS features jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS downloads jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS sizes text[] NOT NULL DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS compatible_product_ids uuid[] NOT NULL DEFAULT ARRAY[]::uuid[],
  ADD COLUMN IF NOT EXISTS meta_title text,
  ADD COLUMN IF NOT EXISTS meta_description text;

-- Validate availability values via trigger (immutable-safe, unlike CHECK)
CREATE OR REPLACE FUNCTION public.validate_product_availability()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.availability NOT IN ('available', 'on_request', 'contact_us', 'out_of_stock') THEN
    RAISE EXCEPTION 'Invalid availability value: %', NEW.availability;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_product_availability ON public.products;
CREATE TRIGGER trg_validate_product_availability
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.validate_product_availability();

-- Helpful indexes for search and filtering
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand);
CREATE INDEX IF NOT EXISTS idx_products_availability ON public.products(availability);
CREATE INDEX IF NOT EXISTS idx_products_product_code ON public.products(product_code);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);

-- Extend categories with cover image + short description
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS description text;

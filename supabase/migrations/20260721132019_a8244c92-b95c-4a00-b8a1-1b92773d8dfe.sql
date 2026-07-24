
-- Batch 3: Add new roles to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'sales';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'content';

-- Batch 1: Product view tracking + richer inquiry fields
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS customer_type TEXT;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS governorate TEXT;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Batch 2: Brands table
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  description TEXT,
  website TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.brands TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.brands TO authenticated;
GRANT ALL ON public.brands TO service_role;

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brands are publicly readable" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Admins can manage brands" ON public.brands FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON public.brands
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Link products to brands (keep legacy 'brand' text column for now)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON public.products(brand_id);

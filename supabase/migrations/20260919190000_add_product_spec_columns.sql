-- Migration: 20260919190000_add_product_spec_columns.sql
-- Description: Add technical_specs and sizes_matrix columns to products table if needed,
--              while keeping full backward-compatibility with the existing specs JSONB column.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS technical_specs jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS sizes_matrix jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.products.technical_specs IS 'Dynamic key-value technical specifications (e.g. coil length, dripper discharge, spacing)';
COMMENT ON COLUMN public.products.sizes_matrix IS 'Optional engineering dimensions matrix (size, outer diameter, inner diameter, wall, radius, pressure)';

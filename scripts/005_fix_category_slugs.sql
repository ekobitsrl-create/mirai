-- Fix any malformed category slugs (remove spaces, lowercase)
-- This fixes categories that may have been inserted with incorrect slugs

-- First, fix any slugs with spaces or uppercase letters
UPDATE public.categories
SET slug = LOWER(TRIM(REPLACE(slug, ' ', '-')))
WHERE slug != LOWER(TRIM(REPLACE(slug, ' ', '-')));

-- Ensure Abbigliamento category exists with correct slug
INSERT INTO public.categories (name, slug, description, image_url, sort_order, parent_id)
VALUES (
  'Abbigliamento',
  'abbigliamento',
  'Abbigliamento streetwear: t-shirt, felpe, camicie, pantaloni e altro.',
  '/images/collection-apparel.jpg',
  1,
  NULL
)
ON CONFLICT (slug) DO UPDATE SET
  name = 'Abbigliamento',
  description = 'Abbigliamento streetwear: t-shirt, felpe, camicie, pantaloni e altro.',
  image_url = '/images/collection-apparel.jpg',
  sort_order = 1,
  parent_id = NULL;

-- Delete any duplicate categories with malformed slugs
DELETE FROM public.categories 
WHERE slug LIKE '% %' 
   OR slug LIKE '%Abbigliamento%'
   OR slug != LOWER(slug);

-- Set up subcategories for Abbigliamento
DO $$
DECLARE
  abbigliamento_id uuid;
BEGIN
  SELECT id INTO abbigliamento_id FROM public.categories WHERE slug = 'abbigliamento';
  
  IF abbigliamento_id IS NOT NULL THEN
    -- Ensure T-Shirt subcategory exists
    INSERT INTO public.categories (name, slug, description, parent_id, sort_order, image_url)
    VALUES ('T-Shirt', 't-shirt', 'T-shirt streetwear e casual', abbigliamento_id, 1, '/images/collection-tshirt.jpg')
    ON CONFLICT (slug) DO UPDATE SET 
      parent_id = abbigliamento_id,
      image_url = '/images/collection-tshirt.jpg';
    
    -- Ensure Felpe subcategory exists
    INSERT INTO public.categories (name, slug, description, parent_id, sort_order, image_url)
    VALUES ('Felpe', 'felpe', 'Felpe e hoodies', abbigliamento_id, 2, '/images/collection-apparel.jpg')
    ON CONFLICT (slug) DO UPDATE SET 
      parent_id = abbigliamento_id,
      image_url = '/images/collection-apparel.jpg';
    
    -- Ensure Pantaloni subcategory exists
    INSERT INTO public.categories (name, slug, description, parent_id, sort_order, image_url)
    VALUES ('Pantaloni', 'pantaloni', 'Pantaloni e jeans', abbigliamento_id, 3, '/images/collection-apparel.jpg')
    ON CONFLICT (slug) DO UPDATE SET 
      parent_id = abbigliamento_id,
      image_url = '/images/collection-apparel.jpg';
  END IF;
END $$;

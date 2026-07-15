-- Simple fix for Abbigliamento category

-- First delete any malformed category entries
DELETE FROM public.categories WHERE slug LIKE 'Abbigliamento%' OR slug LIKE 'abbigliamento %' OR slug = 'Abbigliamento ';

-- Update any existing abbigliamento entry to have correct data
UPDATE public.categories 
SET 
  name = 'Abbigliamento',
  description = 'Abbigliamento streetwear: t-shirt, felpe, camicie, pantaloni e altro.',
  image_url = '/images/collection-apparel.jpg',
  sort_order = 1,
  parent_id = NULL
WHERE slug = 'abbigliamento';

-- If no rows were updated, insert the category
INSERT INTO public.categories (name, slug, description, image_url, sort_order, parent_id)
SELECT 'Abbigliamento', 'abbigliamento', 'Abbigliamento streetwear: t-shirt, felpe, camicie, pantaloni e altro.', '/images/collection-apparel.jpg', 1, NULL
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'abbigliamento');

-- Add parent_id column to categories table for hierarchical categories
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.categories(id) ON DELETE SET NULL;

-- Create index for better query performance on parent_id
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);

-- Insert Abbigliamento as a parent category (if not exists)
INSERT INTO public.categories (name, slug, description, image_url, sort_order, parent_id)
VALUES (
  'Abbigliamento',
  'abbigliamento',
  'Abbigliamento streetwear: t-shirt, felpe, camicie, pantaloni e altro.',
  NULL,
  1,
  NULL
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  parent_id = NULL;

-- Get the Abbigliamento category id and set it as parent for related subcategories
DO $$
DECLARE
  abbigliamento_id uuid;
BEGIN
  -- Get Abbigliamento ID
  SELECT id INTO abbigliamento_id FROM public.categories WHERE slug = 'abbigliamento';
  
  -- Update existing clothing-related categories to be subcategories of Abbigliamento
  UPDATE public.categories
  SET parent_id = abbigliamento_id
  WHERE slug IN ('t-shirt', 'tshirt', 'magliette', 'felpe', 'hoodies', 'pantaloni', 'pants', 'jeans', 'camicie', 'shirts')
    AND id != abbigliamento_id;
    
  -- Insert subcategories if they don't exist
  INSERT INTO public.categories (name, slug, description, parent_id, sort_order)
  VALUES 
    ('T-Shirt', 't-shirt', 'T-shirt streetwear e casual', abbigliamento_id, 1),
    ('Felpe', 'felpe', 'Felpe e hoodies', abbigliamento_id, 2),
    ('Pantaloni', 'pantaloni', 'Pantaloni e jeans', abbigliamento_id, 3)
  ON CONFLICT (slug) DO UPDATE SET
    parent_id = EXCLUDED.parent_id;
    
END $$;

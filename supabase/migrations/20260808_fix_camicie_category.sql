-- The legacy Tee&Shorts category actually contains shirts. Align its public
-- identity, cover image and product assignments with the catalogue content.

update public.categories
set
  name = 'Camicie',
  slug = 'camicie',
  description = 'Camicie oversize e denim streetwear MIRAI.',
  image_url = 'https://xbendkxwuaqrxsyrmgye.supabase.co/storage/v1/object/public/product-images/minimal/8d73cad5-9430-4fcf-be71-be9f6afeffe5/01-shirt-denim-pearl.webp'
where slug in ('teeshorts', 'tee-e-short', 'tee-e-shorts', 'tee-short', 'tee-shorts');

update public.products
set category = 'camicie', updated_at = now()
where category in ('teeshorts', 'tee-e-short', 'tee-e-shorts', 'tee-short', 'tee-shorts');

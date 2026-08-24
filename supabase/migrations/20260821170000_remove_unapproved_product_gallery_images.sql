-- Remove the additional gallery photos rejected after review.
-- Keep each product's original primary image unchanged.

update public.products
set image_gallery = jsonb_build_array(
  jsonb_build_object(
    'src', image_url,
    'alt', 'Vale Forever Reeses Jorts - Dirt/Cream, vista fronte e retro',
    'fit', 'contain',
    'position', 'center'
  )
)
where id = 'aebb57bd-de1a-474c-affc-9660b19a1c8b';

update public.products
set image_gallery = jsonb_build_array(
  jsonb_build_object(
    'src', image_url,
    'alt', 'Vale Forever Skittles Jorts - Dirt/Green, vista fronte e retro',
    'fit', 'contain',
    'position', 'center'
  )
)
where id = 'f9df7c95-2e48-404d-b11b-d0ee7128214f';

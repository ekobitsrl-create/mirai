-- Add only externally verified, exact-match product photos.
-- The existing primary image remains first and unchanged for every product.

update public.products
set image_gallery = jsonb_build_array(
  jsonb_build_object(
    'src', image_url,
    'alt', 'Vale Forever Reeses Jorts - Dirt/Cream, vista fronte e retro',
    'fit', 'contain',
    'position', 'center'
  ),
  jsonb_build_object(
    'src', '/products/verified-gallery/aebb57bd-de1a-474c-affc-9660b19a1c8b/02.webp',
    'alt', 'Vale Forever Reeses Jorts - Dirt/Cream, vista frontale',
    'fit', 'contain',
    'position', 'center'
  ),
  jsonb_build_object(
    'src', '/products/verified-gallery/aebb57bd-de1a-474c-affc-9660b19a1c8b/03.webp',
    'alt', 'Vale Forever Reeses Jorts - Dirt/Cream, vista posteriore',
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
  ),
  jsonb_build_object(
    'src', '/products/verified-gallery/f9df7c95-2e48-404d-b11b-d0ee7128214f/02.webp',
    'alt', 'Vale Forever Skittles Jorts - Dirt/Green, vista frontale',
    'fit', 'contain',
    'position', 'center'
  ),
  jsonb_build_object(
    'src', '/products/verified-gallery/f9df7c95-2e48-404d-b11b-d0ee7128214f/03.webp',
    'alt', 'Vale Forever Skittles Jorts - Dirt/Green, vista posteriore',
    'fit', 'contain',
    'position', 'center'
  )
)
where id = 'f9df7c95-2e48-404d-b11b-d0ee7128214f';

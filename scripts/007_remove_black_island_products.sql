-- Remove the temporary Black Island products from the live catalog.
-- Matching both names and image URLs makes the cleanup resilient to renamed variants.
delete from public.products
where name ~* 'black[[:space:]_-]*island'
   or coalesce(image_url, '') ~* 'black[[:space:]_-]*island';

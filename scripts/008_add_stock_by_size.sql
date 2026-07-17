-- Preparazione completa del catalogo gestito dal pannello admin.
-- Eseguire una volta nel Supabase SQL Editor.
begin;

-- Rimuove definitivamente i vecchi prodotti fittizi Black Island.
delete from public.products
where name ~* 'black[[:space:]_-]*island'
   or coalesce(image_url, '') ~* 'black[[:space:]_-]*island';

-- Quantita disponibili per ogni taglia, gestibili dal pannello admin.
alter table public.products
add column if not exists stock_by_size jsonb not null default '{}'::jsonb;

-- I prodotti gia presenti partono con un pezzo per ogni taglia.
-- Le quantita possono poi essere corrette dal pannello admin.
update public.products as product
set stock_by_size = coalesce(
  (
    select jsonb_object_agg(size_name, 1)
    from unnest(coalesce(product.sizes, array[]::text[])) as size_name
  ),
  '{}'::jsonb
)
where product.stock_by_size = '{}'::jsonb;

commit;

-- MIRAI One of One Tee e scarico automatico delle quantita ordinate.
-- Eseguire una volta nel Supabase SQL Editor prima di pubblicare questa versione.
begin;

alter table public.products add column if not exists sizes text[] not null default array[]::text[];
alter table public.products add column if not exists in_stock boolean not null default true;
alter table public.products add column if not exists stock_by_size jsonb not null default '{}'::jsonb;
alter table public.products add column if not exists brand text;
alter table public.products add column if not exists supplier_sku text;
alter table public.products add column if not exists color_name text;
alter table public.products add column if not exists color_hex text;
alter table public.products add column if not exists fit_note text;
alter table public.products add column if not exists composition text;
alter table public.products add column if not exists care text;

-- Le righe gia esistenti non devono essere scaricate retroattivamente.
alter table public.orders add column if not exists inventory_adjusted boolean;
update public.orders set inventory_adjusted = true where inventory_adjusted is null;
alter table public.orders alter column inventory_adjusted set default false;
alter table public.orders alter column inventory_adjusted set not null;

insert into public.products (
  id,
  name,
  description,
  price,
  category,
  image_url,
  sizes,
  stock_by_size,
  in_stock,
  is_new,
  brand,
  supplier_sku,
  color_name,
  color_hex,
  fit_note,
  composition,
  care
) values (
  'a0000000-0000-4000-8000-000000000018',
  'MIRAI One of One Tee',
  'T-shirt MIRAI heavyweight nera con simbolo Lambda viola sul petto. Un solo esemplare disponibile.',
  2.00,
  't-shirt',
  '/products/mirai-one-of-one-tee.webp',
  array['M'],
  '{"M": 1}'::jsonb,
  true,
  true,
  'MIRAI',
  'MIRAI-ONE-001',
  'Nero',
  '#0b0b0d',
  'Vestibilita oversize. Pezzo unico disponibile in taglia M.',
  '100% cotone',
  'Lavare a 30 gradi al rovescio. Non asciugare in asciugatrice.'
)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  image_url = excluded.image_url,
  sizes = excluded.sizes,
  is_new = excluded.is_new,
  brand = excluded.brand,
  supplier_sku = excluded.supplier_sku,
  color_name = excluded.color_name,
  color_hex = excluded.color_hex,
  fit_note = excluded.fit_note,
  composition = excluded.composition,
  care = excluded.care,
  updated_at = now();

create or replace function public.apply_order_inventory(p_order_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  order_was_adjusted boolean;
  order_item record;
  product_stock jsonb;
  next_stock jsonb;
  current_quantity integer;
begin
  select inventory_adjusted
  into order_was_adjusted
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Ordine % non trovato', p_order_id;
  end if;

  if order_was_adjusted then
    return false;
  end if;

  for order_item in
    select product_id, size, sum(quantity)::integer as quantity
    from public.order_items
    where order_id = p_order_id
      and product_id is not null
      and size is not null
      and product_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    group by product_id, size
  loop
    select stock_by_size
    into product_stock
    from public.products
    where id = order_item.product_id::uuid
    for update;

    if found then
      product_stock := coalesce(product_stock, '{}'::jsonb);
      current_quantity := greatest(coalesce((product_stock ->> order_item.size)::integer, 0), 0);
      next_stock := jsonb_set(
        product_stock,
        array[order_item.size],
        to_jsonb(greatest(current_quantity - order_item.quantity, 0)),
        true
      );

      update public.products
      set stock_by_size = next_stock,
          in_stock = exists (
            select 1
            from jsonb_each_text(next_stock) as stock_entry
            where stock_entry.value::integer > 0
          ),
          updated_at = now()
      where id = order_item.product_id::uuid;
    end if;
  end loop;

  update public.orders
  set inventory_adjusted = true,
      updated_at = now()
  where id = p_order_id;

  return true;
end;
$$;

revoke all on function public.apply_order_inventory(uuid) from public, anon, authenticated;
grant execute on function public.apply_order_inventory(uuid) to service_role;

commit;

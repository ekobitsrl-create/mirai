-- Profili fornitore per brand, identificatori Merchant e tempi di consegna.
-- Eseguire dopo 010_one_of_one_tee_and_inventory.sql nel Supabase SQL Editor.
begin;

alter table public.products add column if not exists supplier_profile text not null default 'minimal';
alter table public.products add column if not exists gtin text;
alter table public.products add column if not exists shipping_min_days integer;
alter table public.products add column if not exists shipping_max_days integer;

-- I prodotti Minimal mantengono brand e tempi attuali. Tutti gli altri usano il profilo MIRAI.
update public.products
set supplier_profile = case
      when lower(trim(coalesce(brand, ''))) like 'minimal%' then 'minimal'
      else 'mirai'
    end;

update public.products
set brand = 'MIRAI',
    gtin = null,
    shipping_min_days = coalesce(shipping_min_days, 7),
    shipping_max_days = coalesce(shipping_max_days, 12)
where supplier_profile = 'mirai';

update public.products
set shipping_min_days = null,
    shipping_max_days = null
where supplier_profile = 'minimal';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_supplier_profile_check'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
      add constraint products_supplier_profile_check
      check (supplier_profile in ('minimal', 'mirai'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_shipping_days_check'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
      add constraint products_shipping_days_check
      check (
        (shipping_min_days is null and shipping_max_days is null)
        or (
          shipping_min_days >= 0
          and shipping_max_days >= shipping_min_days
        )
      );
  end if;
end
$$;

comment on column public.products.supplier_profile is
  'minimal mantiene le impostazioni correnti; mirai forza brand MIRAI, nessun GTIN e consegna configurabile.';
comment on column public.products.gtin is
  'GTIN/EAN assegnato dal produttore. Deve restare NULL per il profilo mirai.';
comment on column public.products.shipping_min_days is
  'Tempo minimo stimato di consegna in giorni lavorativi per i profili con spedizione dedicata.';
comment on column public.products.shipping_max_days is
  'Tempo massimo stimato di consegna in giorni lavorativi per i profili con spedizione dedicata.';

create or replace function public.normalize_product_supplier_profile()
returns trigger
language plpgsql
set search_path = public
as $
begin
  if new.supplier_profile = 'mirai' then
    new.brand := 'MIRAI';
    new.gtin := null;
    new.shipping_min_days := coalesce(new.shipping_min_days, 7);
    new.shipping_max_days := greatest(coalesce(new.shipping_max_days, 12), new.shipping_min_days);
  else
    new.shipping_min_days := null;
    new.shipping_max_days := null;
  end if;

  return new;
end;
$;

drop trigger if exists products_normalize_supplier_profile on public.products;
create trigger products_normalize_supplier_profile
before insert or update of supplier_profile, brand, gtin, shipping_min_days, shipping_max_days
on public.products
for each row
execute function public.normalize_product_supplier_profile();

-- Prodotto prova: lo stesso One of One usato per i test inventario, ora con profilo MIRAI.
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
  supplier_profile,
  supplier_sku,
  gtin,
  shipping_min_days,
  shipping_max_days,
  color_name,
  color_hex,
  fit_note,
  composition,
  care
) values (
  'a0000000-0000-4000-8000-000000000018',
  'MIRAI One of One Tee',
  'T-shirt MIRAI heavyweight nera con simbolo Lambda viola sul petto. Prodotto prova per il profilo fornitore MIRAI.',
  2.00,
  't-shirt',
  '/products/mirai-one-of-one-tee.webp',
  array['M'],
  '{"M": 1}'::jsonb,
  true,
  true,
  'MIRAI',
  'mirai',
  'MIRAI-ONE-001',
  null,
  7,
  12,
  'Nero',
  '#0b0b0d',
  'Vestibilita oversize. Prodotto prova disponibile in taglia M.',
  '100% cotone',
  'Lavare a 30 gradi al rovescio. Non asciugare in asciugatrice.'
)
on conflict (id) do update set
  supplier_profile = excluded.supplier_profile,
  brand = excluded.brand,
  supplier_sku = coalesce(nullif(trim(public.products.supplier_sku), ''), excluded.supplier_sku),
  gtin = excluded.gtin,
  shipping_min_days = excluded.shipping_min_days,
  shipping_max_days = excluded.shipping_max_days,
  updated_at = now();

commit;

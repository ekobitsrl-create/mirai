with parent_category as (
  select id, image_url
  from public.categories
  where slug = 't-shirt'
  limit 1
)
insert into public.categories (name, slug, description, image_url, sort_order, parent_id)
select
  'MIRAI',
  't-shirt-mirai',
  'T-shirt oversize streetwear MIRAI con grafiche decise, lavaggi vintage e fit rilassato.',
  parent_category.image_url,
  0,
  parent_category.id
from parent_category
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  image_url = excluded.image_url,
  sort_order = excluded.sort_order,
  parent_id = excluded.parent_id;

with parent_category as (
  select id, image_url
  from public.categories
  where slug = 't-shirt'
  limit 1
)
insert into public.categories (name, slug, description, image_url, sort_order, parent_id)
select
  'God Speed',
  't-shirt-god-speed',
  'T-shirt God Speed selezionate da MIRAI.',
  parent_category.image_url,
  10,
  parent_category.id
from parent_category
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  image_url = excluded.image_url,
  sort_order = excluded.sort_order,
  parent_id = excluded.parent_id;

update public.products
set category = 't-shirt-mirai'
where lower(category) in ('t-shirt', 'tshirt', 'magliette');

with parent_category as (
  select id, image_url
  from public.categories
  where slug = 't-shirt'
  limit 1
)
insert into public.categories (name, slug, description, image_url, sort_order, parent_id)
select
  'T-shirt Valley',
  't-shirt-valley',
  'T-shirt oversize Valley selezionate da MIRAI.',
  parent_category.image_url,
  20,
  parent_category.id
from parent_category
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  image_url = excluded.image_url,
  sort_order = excluded.sort_order,
  parent_id = excluded.parent_id;

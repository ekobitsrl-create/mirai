alter table public.products
  add column if not exists community_only boolean not null default false;

comment on column public.products.community_only is
  'If true, the product is visible and purchasable only by authenticated MIRAI community members and is listed in the Drop collection.';

drop policy if exists products_public_read on public.products;
drop policy if exists products_member_read on public.products;

create policy products_public_read
on public.products
for select
to anon
using (is_published = true and community_only = false);

create policy products_member_read
on public.products
for select
to authenticated
using (is_published = true);

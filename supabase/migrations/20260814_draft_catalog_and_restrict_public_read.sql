-- The whole existing catalogue is intentionally put in draft. Administrators
-- keep full access through the existing admin policy/service role, while public
-- and ordinary authenticated clients can only read published products.

update public.products
set
  is_published = false,
  updated_at = now()
where is_published is distinct from false;

drop policy if exists products_public_read on public.products;

create policy products_public_read
  on public.products
  for select
  to anon, authenticated
  using (is_published = true);

notify pgrst, 'reload schema';

-- Adds an explicit draft/published state without changing the visibility of
-- products that already exist when this migration is first applied.

do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'products'
      and column_name = 'is_published'
  ) then
    alter table public.products
      add column is_published boolean not null default false;

    -- Preserve the current catalogue until the application understands the
    -- new flag. A separate migration intentionally drafts it after deploy.
    update public.products
    set is_published = true;
  end if;
end
$$;

comment on column public.products.is_published is
  'Controls whether the product is visible on the storefront and in advertising feeds.';

create index if not exists products_published_created_at_idx
  on public.products (created_at desc)
  where is_published = true;

notify pgrst, 'reload schema';

alter table public.products
  add column if not exists is_preorder boolean not null default false,
  add column if not exists preorder_release_at timestamptz,
  add column if not exists drop_name text;

comment on column public.products.is_preorder is
  'True when the product can be ordered before its public release date.';
comment on column public.products.preorder_release_at is
  'Date and time from which a preorder product is expected to become available.';
comment on column public.products.drop_name is
  'Commercial drop or capsule name used to group preorder products.';

alter table public.order_items
  add column if not exists is_preorder boolean not null default false,
  add column if not exists preorder_release_at timestamptz;

comment on column public.order_items.is_preorder is
  'Snapshot of the preorder state at the time the order was placed.';
comment on column public.order_items.preorder_release_at is
  'Snapshot of the expected product release date at the time of purchase.';

create index if not exists products_published_preorder_idx
  on public.products (is_published, is_preorder, preorder_release_at);

create index if not exists products_drop_name_idx
  on public.products (drop_name)
  where drop_name is not null;

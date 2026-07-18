-- Ordini collegati ai MIRAI PASS e popolati dal webhook Stripe.
-- Eseguire una volta nel Supabase SQL Editor prima di attivare il webhook.

create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  status text not null default 'pending',
  total numeric(10,2) not null default 0,
  shipping_name text,
  shipping_address text,
  shipping_city text,
  shipping_zip text,
  shipping_country text,
  stripe_session_id text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.orders add column if not exists stripe_session_id text;
alter table public.orders add column if not exists notes text;
alter table public.orders add column if not exists updated_at timestamptz not null default now();

create unique index if not exists orders_stripe_session_id_key
  on public.orders (stripe_session_id)
  where stripe_session_id is not null;

create index if not exists orders_user_id_created_at_idx
  on public.orders (user_id, created_at desc);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text,
  product_name text not null,
  product_image text,
  size text,
  quantity integer not null check (quantity > 0),
  price numeric(10,2) not null,
  created_at timestamptz not null default now()
);

alter table public.order_items add column if not exists product_id text;
alter table public.order_items add column if not exists product_image text;
alter table public.order_items add column if not exists size text;
alter table public.order_items add column if not exists created_at timestamptz not null default now();

create index if not exists order_items_order_id_idx on public.order_items (order_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'orders' and policyname = 'Customers can read their own orders'
  ) then
    create policy "Customers can read their own orders"
      on public.orders for select using (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'order_items' and policyname = 'Customers can read their own order items'
  ) then
    create policy "Customers can read their own order items"
      on public.order_items for select using (
        exists (
          select 1 from public.orders
          where orders.id = order_items.order_id and orders.user_id = auth.uid()
        )
      );
  end if;
end $$;

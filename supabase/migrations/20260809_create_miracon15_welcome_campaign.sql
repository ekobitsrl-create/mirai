create table if not exists public.email_unsubscribes (
  email text primary key,
  created_at timestamptz not null default now(),
  check (email = lower(trim(email)))
);

alter table public.email_unsubscribes enable row level security;
revoke all on table public.email_unsubscribes from public, anon, authenticated;
grant select, insert, update, delete on table public.email_unsubscribes to service_role;

insert into public.discount_codes (
  code,
  discount_type,
  value,
  active,
  first_order_only,
  minimum_subtotal
)
values (
  'MIRACON15',
  'percentage',
  15,
  true,
  true,
  0
)
on conflict (code) do update
set
  discount_type = excluded.discount_type,
  value = excluded.value,
  active = excluded.active,
  first_order_only = excluded.first_order_only,
  minimum_subtotal = excluded.minimum_subtotal,
  updated_at = now();

notify pgrst, 'reload schema';

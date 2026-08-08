create extension if not exists pgcrypto;

create table if not exists public.discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null default 'percentage'
    check (discount_type in ('percentage', 'fixed')),
  value numeric(10,2) not null check (value > 0),
  active boolean not null default true,
  first_order_only boolean not null default false,
  minimum_subtotal numeric(10,2) not null default 0
    check (minimum_subtotal >= 0),
  starts_at timestamptz,
  ends_at timestamptz,
  max_uses integer check (max_uses is null or max_uses > 0),
  times_used integer not null default 0 check (times_used >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (discount_type <> 'percentage' or value <= 100),
  check (ends_at is null or starts_at is null or ends_at > starts_at),
  check (code = upper(trim(code)))
);

create index if not exists discount_codes_active_code_idx
  on public.discount_codes (active, code);

alter table public.orders add column if not exists subtotal numeric(10,2);
alter table public.orders add column if not exists discount_code text;
alter table public.orders add column if not exists discount_type text;
alter table public.orders add column if not exists discount_value numeric(10,2);
alter table public.orders add column if not exists discount_amount numeric(10,2) not null default 0;

create index if not exists orders_lower_email_status_idx
  on public.orders (lower(email), status);

insert into public.discount_codes (
  code,
  discount_type,
  value,
  active,
  first_order_only,
  minimum_subtotal
)
values (
  'MIRAI10',
  'percentage',
  10,
  true,
  true,
  0
)
on conflict (code) do nothing;

create or replace function public.increment_discount_code_usage(p_code text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.discount_codes
  set
    times_used = times_used + 1,
    updated_at = now()
  where code = upper(trim(p_code));
end;
$$;

revoke all on function public.increment_discount_code_usage(text) from public;
grant execute on function public.increment_discount_code_usage(text) to service_role;

alter table public.discount_codes enable row level security;
grant select, insert, update, delete on public.discount_codes to authenticated;

drop policy if exists "discount_codes_admin_manage" on public.discount_codes;
create policy "discount_codes_admin_manage"
  on public.discount_codes
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

notify pgrst, 'reload schema';

create table if not exists public.cookie_consent_daily_counts (
  day date primary key,
  necessary_only_count bigint not null default 0 check (necessary_only_count >= 0),
  updated_at timestamptz not null default now()
);

alter table public.cookie_consent_daily_counts enable row level security;

revoke all on table public.cookie_consent_daily_counts from public, anon, authenticated;
grant select, insert, update on table public.cookie_consent_daily_counts to service_role;

create or replace function public.increment_cookie_consent_necessary_count()
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.cookie_consent_daily_counts (day, necessary_only_count, updated_at)
  values ((now() at time zone 'Europe/Rome')::date, 1, now())
  on conflict (day) do update
  set necessary_only_count = cookie_consent_daily_counts.necessary_only_count + 1,
      updated_at = now();
$$;

revoke all on function public.increment_cookie_consent_necessary_count() from public, anon, authenticated;
grant execute on function public.increment_cookie_consent_necessary_count() to service_role;

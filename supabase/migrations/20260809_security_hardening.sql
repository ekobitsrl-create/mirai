-- Security hardening: prevent self-assigned admin roles, block direct order
-- creation from the public API, and provide a service-only durable rate limiter.

alter table public.profiles enable row level security;

drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

revoke insert, delete on table public.profiles from anon, authenticated;
revoke update on table public.profiles from anon, authenticated;
grant update (email, first_name, last_name, updated_at)
  on table public.profiles to authenticated;

drop policy if exists "Anyone can insert orders" on public.orders;
drop policy if exists "Anyone can insert order items" on public.order_items;
revoke insert, update, delete on table public.orders from anon, authenticated;
revoke insert, update, delete on table public.order_items from anon, authenticated;

-- Discount codes are validated and administered only by authenticated server
-- actions. They must never be enumerable from the browser.
drop policy if exists "discount_codes_admin_manage" on public.discount_codes;
revoke all on table public.discount_codes from anon, authenticated;

create table if not exists public.api_rate_limits (
  bucket text not null,
  identifier_hash text not null,
  window_start timestamptz not null default now(),
  request_count integer not null default 0 check (request_count >= 0),
  primary key (bucket, identifier_hash)
);

alter table public.api_rate_limits enable row level security;
revoke all on table public.api_rate_limits from public, anon, authenticated;
grant select, insert, update, delete on table public.api_rate_limits to service_role;

create or replace function public.consume_api_rate_limit(
  p_bucket text,
  p_identifier_hash text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
  v_now timestamptz := clock_timestamp();
  v_window interval;
begin
  if coalesce(trim(p_bucket), '') = ''
    or coalesce(trim(p_identifier_hash), '') = ''
    or p_limit < 1
    or p_window_seconds < 1
  then
    return false;
  end if;

  v_window := make_interval(secs => p_window_seconds);

  insert into public.api_rate_limits (
    bucket,
    identifier_hash,
    window_start,
    request_count
  )
  values (p_bucket, p_identifier_hash, v_now, 1)
  on conflict (bucket, identifier_hash) do update
  set
    window_start = case
      when api_rate_limits.window_start <= v_now - v_window then v_now
      else api_rate_limits.window_start
    end,
    request_count = case
      when api_rate_limits.window_start <= v_now - v_window then 1
      else api_rate_limits.request_count + 1
    end
  returning request_count into v_count;

  if random() < 0.01 then
    delete from public.api_rate_limits
    where window_start < v_now - interval '2 days';
  end if;

  return v_count <= p_limit;
end;
$$;

revoke all on function public.consume_api_rate_limit(text, text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_api_rate_limit(text, text, integer, integer)
  to service_role;

notify pgrst, 'reload schema';

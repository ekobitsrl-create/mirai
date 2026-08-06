create table if not exists public.cart_sessions (
  id uuid primary key,
  user_id uuid null references auth.users(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'cleared', 'converted')),
  items jsonb not null default '[]'::jsonb,
  item_count integer not null default 0 check (item_count >= 0),
  total numeric(12,2) not null default 0 check (total >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cart_sessions_updated_at_idx
  on public.cart_sessions (updated_at desc);

create index if not exists cart_sessions_status_idx
  on public.cart_sessions (status, updated_at desc);

create index if not exists cart_sessions_user_id_idx
  on public.cart_sessions (user_id)
  where user_id is not null;

alter table public.cart_sessions enable row level security;

-- No public policies are intentionally created. All reads/writes go through
-- authenticated server routes using SUPABASE_SECRET_KEY/service-role.
revoke all on table public.cart_sessions from anon, authenticated;

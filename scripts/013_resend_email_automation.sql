-- Infrastruttura email MIRAI per Resend.
-- Eseguire una volta nel Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.email_deliveries (
  event_key text primary key,
  email text not null,
  category text not null check (category in ('transactional', 'marketing')),
  status text not null check (status in ('sent', 'failed')),
  provider_id text,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.abandoned_checkouts (
  id uuid primary key default gen_random_uuid(),
  checkout_session_id text not null unique,
  email text not null,
  items jsonb not null default '[]'::jsonb,
  status text not null default 'active'
    check (status in ('active', 'reminded', 'recovered', 'unsubscribed')),
  consent_at timestamptz not null,
  reminder_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists abandoned_checkouts_reminder_idx
  on public.abandoned_checkouts (status, created_at)
  where reminder_sent_at is null;

create index if not exists abandoned_checkouts_email_idx
  on public.abandoned_checkouts (email);

alter table public.email_deliveries enable row level security;
alter table public.abandoned_checkouts enable row level security;

-- Nessuna policy pubblica: queste tabelle sono accessibili solo tramite service role.

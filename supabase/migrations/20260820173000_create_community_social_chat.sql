create or replace function public.is_community_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
  );
$$;

revoke all on function public.is_community_member() from public;
grant execute on function public.is_community_member() to authenticated;

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  author_name text not null check (char_length(author_name) between 1 and 120),
  author_role text not null default 'user' check (author_role in ('user', 'admin')),
  content text,
  media_path text,
  media_type text check (media_type is null or media_type in ('image', 'audio', 'video')),
  media_mime text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint community_posts_content_or_media check (
    nullif(btrim(coalesce(content, '')), '') is not null
    or nullif(btrim(coalesce(media_path, '')), '') is not null
  ),
  constraint community_posts_content_length check (char_length(coalesce(content, '')) <= 1200)
);

create index if not exists community_posts_created_at_idx
  on public.community_posts (created_at desc);
create index if not exists community_posts_author_id_idx
  on public.community_posts (author_id);

create table if not exists public.community_messages (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  author_name text not null check (char_length(author_name) between 1 and 120),
  author_role text not null default 'user' check (author_role in ('user', 'admin')),
  body text not null check (char_length(btrim(body)) between 1 and 500),
  created_at timestamptz not null default now()
);

create index if not exists community_messages_created_at_idx
  on public.community_messages (created_at desc);
create index if not exists community_messages_author_id_idx
  on public.community_messages (author_id);

alter table public.community_posts enable row level security;
alter table public.community_messages enable row level security;

drop policy if exists "community members read posts" on public.community_posts;
create policy "community members read posts"
on public.community_posts
for select
to authenticated
using ((select public.is_community_member()));

drop policy if exists "community members read messages" on public.community_messages;
create policy "community members read messages"
on public.community_messages
for select
to authenticated
using ((select public.is_community_member()));

revoke all on public.community_posts from anon, authenticated;
revoke all on public.community_messages from anon, authenticated;
grant select on public.community_posts to authenticated;
grant select on public.community_messages to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'community-media',
  'community-media',
  false,
  52428800,
  array[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4',
    'video/mp4', 'video/webm', 'video/quicktime'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "community members read media" on storage.objects;
create policy "community members read media"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'community-media'
  and (select public.is_community_member())
);

drop policy if exists "community members upload own media" on storage.objects;
create policy "community members upload own media"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'community-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (select public.is_community_member())
);

drop policy if exists "community members delete own media" on storage.objects;
create policy "community members delete own media"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'community-media'
  and owner_id = (select auth.uid())::text
  and (select public.is_community_member())
);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'community_posts'
  ) then
    alter publication supabase_realtime add table public.community_posts;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'community_messages'
  ) then
    alter publication supabase_realtime add table public.community_messages;
  end if;
end
$$;

comment on table public.community_posts is
  'Member-only MIRAI Society social posts. Writes are performed by authenticated server actions.';
comment on table public.community_messages is
  'Member-only MIRAI Society live chat messages. Writes are performed by authenticated server actions.';

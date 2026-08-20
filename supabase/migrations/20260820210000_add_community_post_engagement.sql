create table if not exists public.community_post_likes (
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create index if not exists community_post_likes_user_id_idx
  on public.community_post_likes (user_id);

create table if not exists public.community_post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  author_name text not null check (char_length(author_name) between 1 and 120),
  author_role text not null default 'user' check (author_role in ('user', 'admin')),
  body text not null check (char_length(btrim(body)) between 1 and 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists community_post_comments_post_created_at_idx
  on public.community_post_comments (post_id, created_at);
create index if not exists community_post_comments_author_id_idx
  on public.community_post_comments (author_id);

alter table public.community_post_likes enable row level security;
alter table public.community_post_comments enable row level security;

drop policy if exists "community members read post likes" on public.community_post_likes;
create policy "community members read post likes"
on public.community_post_likes
for select
to authenticated
using ((select public.is_community_member()));

drop policy if exists "community members add own post likes" on public.community_post_likes;
create policy "community members add own post likes"
on public.community_post_likes
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and (select public.is_community_member())
);

drop policy if exists "community members remove own post likes" on public.community_post_likes;
create policy "community members remove own post likes"
on public.community_post_likes
for delete
to authenticated
using (
  user_id = (select auth.uid())
  and (select public.is_community_member())
);

drop policy if exists "community members read post comments" on public.community_post_comments;
create policy "community members read post comments"
on public.community_post_comments
for select
to authenticated
using ((select public.is_community_member()));

drop policy if exists "community members add own post comments" on public.community_post_comments;
create policy "community members add own post comments"
on public.community_post_comments
for insert
to authenticated
with check (
  author_id = (select auth.uid())
  and (select public.is_community_member())
);

drop policy if exists "community members update own post comments" on public.community_post_comments;
create policy "community members update own post comments"
on public.community_post_comments
for update
to authenticated
using (
  author_id = (select auth.uid())
  and (select public.is_community_member())
)
with check (
  author_id = (select auth.uid())
  and (select public.is_community_member())
);

drop policy if exists "community members remove own post comments" on public.community_post_comments;
create policy "community members remove own post comments"
on public.community_post_comments
for delete
to authenticated
using (
  author_id = (select auth.uid())
  and (select public.is_community_member())
);

revoke all on public.community_post_likes from anon, authenticated;
revoke all on public.community_post_comments from anon, authenticated;
grant select, insert, delete on public.community_post_likes to authenticated;
grant select, insert, update, delete on public.community_post_comments to authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'community_post_likes'
  ) then
    alter publication supabase_realtime add table public.community_post_likes;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'community_post_comments'
  ) then
    alter publication supabase_realtime add table public.community_post_comments;
  end if;
end
$$;

comment on table public.community_post_likes is
  'One member like per MIRAI Society post.';
comment on table public.community_post_comments is
  'Member-only comments on MIRAI Society posts.';

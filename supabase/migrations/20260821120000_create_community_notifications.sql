create table if not exists public.community_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid not null references public.profiles(id) on delete cascade,
  actor_name text not null check (char_length(actor_name) between 1 and 120),
  notification_type text not null check (notification_type in ('post_like', 'post_comment')),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  comment_id uuid references public.community_post_comments(id) on delete cascade,
  excerpt text check (excerpt is null or char_length(excerpt) <= 180),
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint community_notifications_not_self check (recipient_id <> actor_id),
  constraint community_notifications_comment_reference check (
    (notification_type = 'post_comment' and comment_id is not null)
    or (notification_type = 'post_like' and comment_id is null)
  )
);

create index if not exists community_notifications_recipient_created_idx
  on public.community_notifications (recipient_id, created_at desc);
create index if not exists community_notifications_unread_idx
  on public.community_notifications (recipient_id, created_at desc)
  where read_at is null;
create index if not exists community_notifications_actor_id_idx
  on public.community_notifications (actor_id);
create index if not exists community_notifications_post_id_idx
  on public.community_notifications (post_id);
create unique index if not exists community_notifications_like_unique_idx
  on public.community_notifications (recipient_id, actor_id, post_id)
  where notification_type = 'post_like';
create unique index if not exists community_notifications_comment_unique_idx
  on public.community_notifications (comment_id)
  where notification_type = 'post_comment';

alter table public.community_notifications enable row level security;

drop policy if exists "community members read own notifications" on public.community_notifications;
create policy "community members read own notifications"
on public.community_notifications
for select
to authenticated
using (
  recipient_id = (select auth.uid())
  and (select public.is_community_member())
);

drop policy if exists "community members update own notifications" on public.community_notifications;
create policy "community members update own notifications"
on public.community_notifications
for update
to authenticated
using (
  recipient_id = (select auth.uid())
  and (select public.is_community_member())
)
with check (
  recipient_id = (select auth.uid())
  and (select public.is_community_member())
);

drop policy if exists "community members delete own notifications" on public.community_notifications;
create policy "community members delete own notifications"
on public.community_notifications
for delete
to authenticated
using (
  recipient_id = (select auth.uid())
  and (select public.is_community_member())
);

revoke all on public.community_notifications from anon, authenticated;
grant select, update, delete on public.community_notifications to authenticated;

comment on table public.community_notifications is
  'Private activity notifications for MIRAI Society members.';

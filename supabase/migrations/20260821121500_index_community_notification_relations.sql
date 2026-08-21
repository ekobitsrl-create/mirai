create index if not exists community_notifications_actor_id_idx
  on public.community_notifications (actor_id);

create index if not exists community_notifications_post_id_idx
  on public.community_notifications (post_id);

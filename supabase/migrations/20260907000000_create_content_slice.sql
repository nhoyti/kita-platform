create table public.posts (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creator_profiles (id) on delete cascade,
  title text,
  body text not null,
  status text not null default 'draft',
  visibility text not null default 'public',
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint posts_title_length check (title is null or char_length(title) <= 160),
  constraint posts_body_length check (char_length(body) between 1 and 20000),
  constraint posts_status check (status in ('draft', 'processing', 'pending_review', 'published', 'restricted', 'removed')),
  constraint posts_visibility check (visibility in ('public', 'followers', 'subscribers', 'tier', 'paid')),
  constraint posts_published_at check (status <> 'published' or published_at is not null)
);

create table public.post_access (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null unique references public.posts (id) on delete cascade,
  tier_id uuid references public.creator_plans (id) on delete restrict,
  price numeric(10, 2),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint post_access_price_nonnegative check (price is null or price >= 0)
);

create table public.post_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  creator_id uuid not null references public.creator_profiles (id) on delete cascade,
  media_type text not null,
  provider text not null default 'supabase_storage',
  storage_path text not null,
  mime_type text not null,
  file_size bigint not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  constraint post_media_type check (media_type in ('image', 'video')),
  constraint post_media_provider check (provider in ('supabase_storage', 'video_provider')),
  constraint post_media_path_not_url check (storage_path !~* '^https?://'),
  constraint post_media_file_size_positive check (file_size > 0),
  constraint post_media_sort_order_nonnegative check (sort_order >= 0)
);

create index posts_creator_idx on public.posts (creator_id, created_at desc);
create index posts_published_idx on public.posts (creator_id, published_at desc) where status = 'published';
create index post_media_post_idx on public.post_media (post_id, sort_order);

create trigger posts_set_updated_at before update on public.posts for each row execute function public.set_updated_at();
create trigger post_access_set_updated_at before update on public.post_access for each row execute function public.set_updated_at();

alter table public.posts enable row level security;
alter table public.post_access enable row level security;
alter table public.post_media enable row level security;

create policy "Creators can view their own posts" on public.posts for select to authenticated
using (creator_id = (select auth.uid()));
create policy "Anyone can view public published posts" on public.posts for select to anon, authenticated
using (status = 'published' and visibility = 'public');
create policy "Creators can create their own posts" on public.posts for insert to authenticated
with check (creator_id = (select auth.uid()));
create policy "Creators can update their own posts" on public.posts for update to authenticated
using (creator_id = (select auth.uid())) with check (creator_id = (select auth.uid()));
create policy "Creators can delete their own posts" on public.posts for delete to authenticated
using (creator_id = (select auth.uid()));

create policy "Creators can manage their post access" on public.post_access for all to authenticated
using (exists (select 1 from public.posts where posts.id = post_id and posts.creator_id = (select auth.uid())))
with check (exists (select 1 from public.posts where posts.id = post_id and posts.creator_id = (select auth.uid())));
create policy "Creators can manage their post media" on public.post_media for all to authenticated
using (creator_id = (select auth.uid()))
with check (creator_id = (select auth.uid()) and exists (select 1 from public.posts where posts.id = post_id and posts.creator_id = (select auth.uid())));

insert into storage.buckets (id, name, public) values ('post-media', 'post-media', false)
on conflict (id) do update set public = excluded.public;
create policy "Creators can upload post media" on storage.objects for insert to authenticated
with check (bucket_id = 'post-media' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Creators can read their post media" on storage.objects for select to authenticated
using (bucket_id = 'post-media' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Creators can update their post media" on storage.objects for update to authenticated
using (bucket_id = 'post-media' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'post-media' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Creators can delete their post media" on storage.objects for delete to authenticated
using (bucket_id = 'post-media' and (storage.foldername(name))[1] = (select auth.uid())::text);

grant select, insert, update, delete on public.posts, public.post_access, public.post_media to authenticated;
grant select on public.posts to anon;
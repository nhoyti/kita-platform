-- Creator-facing data is intentionally separate from profiles so public reads never expose
-- account status, email metadata, or future verification records.
create table public.creator_profiles (
  id uuid primary key references public.profiles (id) on delete cascade,
  username text not null unique,
  display_name text not null,
  bio text,
  profile_image_url text,
  cover_image_url text,
  category text,
  social_links jsonb not null default '{}'::jsonb,
  subscriber_count integer not null default 0,
  is_public boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint creator_profiles_username_format check (username ~ '^[a-z0-9_]{3,30}$'),
  constraint creator_profiles_display_name_length check (char_length(display_name) between 1 and 120),
  constraint creator_profiles_bio_length check (bio is null or char_length(bio) <= 2000),
  constraint creator_profiles_category_length check (category is null or char_length(category) <= 80),
  constraint creator_profiles_subscriber_count_nonnegative check (subscriber_count >= 0),
  constraint creator_profiles_social_links_object check (jsonb_typeof(social_links) = 'object')
);

create index creator_profiles_category_idx on public.creator_profiles (category);

create table public.creator_plans (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creator_profiles (id) on delete cascade,
  name text not null,
  description text,
  monthly_price numeric(10, 2) not null default 0,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint creator_plans_name_length check (char_length(name) between 1 and 80),
  constraint creator_plans_description_length check (description is null or char_length(description) <= 500),
  constraint creator_plans_price_nonnegative check (monthly_price >= 0),
  constraint creator_plans_sort_order_nonnegative check (sort_order >= 0),
  constraint creator_plans_creator_name_unique unique (creator_id, name)
);

create table public.creator_posts (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creator_profiles (id) on delete cascade,
  title text,
  body text not null,
  status text not null default 'draft',
  visibility text not null default 'public',
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint creator_posts_title_length check (title is null or char_length(title) <= 160),
  constraint creator_posts_body_length check (char_length(body) between 1 and 20000),
  constraint creator_posts_status check (status in ('draft', 'published', 'removed')),
  constraint creator_posts_visibility check (visibility in ('public', 'followers', 'subscribers')),
  constraint creator_posts_published_at check (status <> 'published' or published_at is not null)
);

create index creator_posts_public_idx on public.creator_posts (creator_id, published_at desc)
where status = 'published' and visibility = 'public';

create table public.creator_follows (
  fan_id uuid not null references public.profiles (id) on delete cascade,
  creator_id uuid not null references public.creator_profiles (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (fan_id, creator_id),
  constraint creator_follows_not_self check (fan_id <> creator_id)
);

create index creator_follows_creator_idx on public.creator_follows (creator_id);

create trigger creator_profiles_set_updated_at
before update on public.creator_profiles
for each row execute function public.set_updated_at();

create trigger creator_plans_set_updated_at
before update on public.creator_plans
for each row execute function public.set_updated_at();

create trigger creator_posts_set_updated_at
before update on public.creator_posts
for each row execute function public.set_updated_at();

alter table public.creator_profiles enable row level security;
alter table public.creator_plans enable row level security;
alter table public.creator_posts enable row level security;
alter table public.creator_follows enable row level security;

create policy "Anyone can view public creator profiles"
on public.creator_profiles for select
to anon, authenticated
using (is_public = true or id = (select auth.uid()));

create policy "Creators can create their own profile"
on public.creator_profiles for insert
to authenticated
with check (id = (select auth.uid()) and exists (
  select 1 from public.profiles where id = (select auth.uid()) and role = 'creator'
));

create policy "Creators can update their own profile"
on public.creator_profiles for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy "Anyone can view active creator plans"
on public.creator_plans for select
to anon, authenticated
using (is_active = true or creator_id = (select auth.uid()));

create policy "Creators can manage their own plans"
on public.creator_plans for insert
to authenticated
with check (creator_id = (select auth.uid()));

create policy "Creators can update their own plans"
on public.creator_plans for update
to authenticated
using (creator_id = (select auth.uid()))
with check (creator_id = (select auth.uid()));

create policy "Creators can delete their own plans"
on public.creator_plans for delete
to authenticated
using (creator_id = (select auth.uid()));

create policy "Anyone can view public published posts"
on public.creator_posts for select
to anon, authenticated
using ((status = 'published' and visibility = 'public') or creator_id = (select auth.uid()));

create policy "Creators can create their own posts"
on public.creator_posts for insert
to authenticated
with check (creator_id = (select auth.uid()));

create policy "Creators can update their own posts"
on public.creator_posts for update
to authenticated
using (creator_id = (select auth.uid()))
with check (creator_id = (select auth.uid()));

create policy "Creators can delete their own posts"
on public.creator_posts for delete
to authenticated
using (creator_id = (select auth.uid()));

create policy "Fans can view their follows"
on public.creator_follows for select
to authenticated
using (fan_id = (select auth.uid()) or creator_id = (select auth.uid()));

create policy "Fans can follow creators"
on public.creator_follows for insert
to authenticated
with check (fan_id = (select auth.uid()));

create policy "Fans can unfollow creators"
on public.creator_follows for delete
to authenticated
using (fan_id = (select auth.uid()));

grant select on public.creator_profiles, public.creator_plans, public.creator_posts to anon, authenticated;
grant insert (
  id, username, display_name, bio, profile_image_url, cover_image_url, category, social_links
) on public.creator_profiles to authenticated;
grant update (
  username, display_name, bio, profile_image_url, cover_image_url, category, social_links
) on public.creator_profiles to authenticated;
grant insert, update, delete on public.creator_plans, public.creator_posts to authenticated;
grant select, insert, delete on public.creator_follows to authenticated;

-- Registration already offers a creator choice; persist it as the initial account role.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    left(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), 120),
    case when new.raw_user_meta_data ->> 'registration_type' = 'creator' then 'creator'::public.app_role else 'fan'::public.app_role end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;
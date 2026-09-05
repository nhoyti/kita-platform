create type public.app_role as enum (
  'fan',
  'creator',
  'moderator',
  'admin',
  'super_admin'
);

create type public.account_status as enum (
  'pending_verification',
  'active',
  'suspended',
  'banned'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  bio text,
  role public.app_role not null default 'fan',
  account_status public.account_status not null default 'pending_verification',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profiles_username_format check (
    username is null
    or username ~ '^[a-z0-9_]{3,30}$'
  ),
  constraint profiles_display_name_length check (
    display_name is null
    or char_length(display_name) between 1 and 120
  ),
  constraint profiles_bio_length check (
    bio is null
    or char_length(bio) <= 2000
  )
);

create index profiles_role_idx on public.profiles (role);
create index profiles_account_status_idx on public.profiles (account_status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    left(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), 120)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
on public.profiles
for select
to authenticated
using (id = (select auth.uid()));

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

revoke insert, delete on public.profiles from anon, authenticated;
revoke update on public.profiles from anon, authenticated;
grant update (username, display_name, avatar_url, bio)
on public.profiles
to authenticated;

revoke all on function public.handle_new_user() from public;
revoke all on function public.set_updated_at() from public;
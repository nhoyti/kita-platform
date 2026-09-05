create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  fan_id uuid not null references public.profiles (id) on delete cascade,
  creator_id uuid not null references public.creator_profiles (id) on delete cascade,
  plan_id uuid not null references public.creator_plans (id) on delete restrict,
  status text not null default 'pending',
  payment_provider text not null default 'mock',
  payment_reference text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  canceled_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint subscriptions_status check (status in ('pending', 'active', 'canceled', 'payment_failed')),
  constraint subscriptions_provider check (payment_provider in ('mock')),
  constraint subscriptions_period check (
    current_period_end is null or current_period_start is not null and current_period_end > current_period_start
  ),
  constraint subscriptions_canceled_at check (status <> 'canceled' or canceled_at is not null),
  constraint subscriptions_payment_reference check (
    status not in ('active', 'payment_failed') or payment_reference is not null
  ),
  constraint subscriptions_fan_not_creator check (fan_id <> creator_id)
);

create unique index subscriptions_active_fan_plan_idx
on public.subscriptions (fan_id, plan_id)
where status in ('pending', 'active');

create index subscriptions_fan_status_idx on public.subscriptions (fan_id, status, created_at desc);
create index subscriptions_creator_status_idx on public.subscriptions (creator_id, status, created_at desc);
create index subscriptions_plan_idx on public.subscriptions (plan_id);

create trigger subscriptions_set_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

alter table public.subscriptions enable row level security;

create policy "Fans can view their subscriptions"
on public.subscriptions for select
to authenticated
using (fan_id = (select auth.uid()));

create policy "Creators can view subscriptions to their plans"
on public.subscriptions for select
to authenticated
using (creator_id = (select auth.uid()));

grant select on public.subscriptions to authenticated;

drop policy "Creators can manage their own plans" on public.creator_plans;
drop policy "Creators can update their own plans" on public.creator_plans;
drop policy "Creators can delete their own plans" on public.creator_plans;

create policy "Creators can manage their own plans"
on public.creator_plans for insert
to authenticated
with check (creator_id = (select auth.uid()) and exists (
  select 1 from public.profiles where id = (select auth.uid()) and role = 'creator'
));

create policy "Creators can update their own plans"
on public.creator_plans for update
to authenticated
using (creator_id = (select auth.uid()) and exists (
  select 1 from public.profiles where id = (select auth.uid()) and role = 'creator'
))
with check (creator_id = (select auth.uid()) and exists (
  select 1 from public.profiles where id = (select auth.uid()) and role = 'creator'
));

create policy "Creators can delete their own plans"
on public.creator_plans for delete
to authenticated
using (creator_id = (select auth.uid()) and exists (
  select 1 from public.profiles where id = (select auth.uid()) and role = 'creator'
));

create or replace function public.subscribe_to_plan(p_plan_id uuid)
returns public.subscriptions
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  selected_plan public.creator_plans;
  new_subscription public.subscriptions;
  period_start timestamptz := timezone('utc', now());
begin
  if current_user_id is null then
    raise exception 'Authentication is required to subscribe.' using errcode = '42501';
  end if;

  select * into selected_plan
  from public.creator_plans
  where id = p_plan_id and is_active = true;

  if not found then
    raise exception 'This subscription plan is no longer available.' using errcode = 'P0002';
  end if;

  if selected_plan.creator_id = current_user_id then
    raise exception 'Creators cannot subscribe to their own plans.' using errcode = '42501';
  end if;

  insert into public.subscriptions (
    fan_id, creator_id, plan_id, status, payment_provider, payment_reference,
    current_period_start, current_period_end
  ) values (
    current_user_id,
    selected_plan.creator_id,
    selected_plan.id,
    'active',
    'mock',
    'mock_' || gen_random_uuid()::text,
    period_start,
    period_start + interval '1 month'
  ) returning * into new_subscription;

  update public.creator_profiles
  set subscriber_count = subscriber_count + 1
  where id = selected_plan.creator_id;

  return new_subscription;
exception
  when unique_violation then
    raise exception 'You already have an active subscription to this plan.' using errcode = '23505';
end;
$$;

create or replace function public.cancel_subscription(p_subscription_id uuid)
returns public.subscriptions
language plpgsql
security definer
set search_path = public
as $$
declare
  canceled_subscription public.subscriptions;
begin
  update public.subscriptions
  set status = 'canceled', canceled_at = timezone('utc', now())
  where id = p_subscription_id
    and fan_id = auth.uid()
    and status in ('pending', 'active')
  returning * into canceled_subscription;

  if not found then
    raise exception 'Subscription not found or already canceled.' using errcode = 'P0002';
  end if;

  if canceled_subscription.status = 'canceled' then
    update public.creator_profiles
    set subscriber_count = greatest(subscriber_count - 1, 0)
    where id = canceled_subscription.creator_id;
  end if;

  return canceled_subscription;
end;
$$;

revoke all on function public.subscribe_to_plan(uuid) from public;
revoke all on function public.cancel_subscription(uuid) from public;
grant execute on function public.subscribe_to_plan(uuid) to authenticated;
grant execute on function public.cancel_subscription(uuid) to authenticated;
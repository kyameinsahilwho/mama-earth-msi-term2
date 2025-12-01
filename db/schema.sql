-- Supabase schema for MamaEarth gamified features
-- Author: generated
-- Notes: Run this in the Supabase SQL editor or with the Supabase CLI using a service_role key.

-- 1) Profiles table (links to auth.users if you use Supabase Auth)
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid, -- optionally reference auth.users (manage manually in Supabase)
  username text unique,
  display_name text,
  avatar_url text,
  points integer default 0 not null,
  badges jsonb default '[]'::jsonb,
  last_login_date date,
  last_routine_date date,
  routine_count_today integer default 0,
  streak integer default 0,
  quiz_taken boolean default false,
  referrals integer default 0,
  feedback_given integer default 0,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Trigger to update updated_at
create or replace function set_updated_at()
returns trigger language plpgsql stable as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
before update on profiles
for each row
execute function set_updated_at();

-- 2) Badges master list
create table if not exists badges (
  id serial primary key,
  name text not null unique,
  points integer default 0,
  description text,
  icon text,
  created_at timestamptz default now()
);

-- 3) User badges (unlocked badges)
create table if not exists user_badges (
  id serial primary key,
  profile_id uuid references profiles(id) on delete cascade,
  badge_id integer references badges(id) on delete cascade,
  unlocked boolean default false,
  unlocked_at timestamptz,
  constraint uq_user_badge unique (profile_id, badge_id)
);

-- 4) Rewards catalogue
create table if not exists rewards (
  id serial primary key,
  name text not null unique,
  points_required integer not null,
  description text,
  image_url text,
  created_at timestamptz default now()
);

-- Ensure unique constraint exists if table was already created without it
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'rewards_name_key') then
    alter table rewards add constraint rewards_name_key unique (name);
  end if;
end $$;

-- 5) Redemptions (user redeeming rewards)
create table if not exists redemptions (
  id serial primary key,
  profile_id uuid references profiles(id) on delete set null,
  reward_id integer references rewards(id) on delete set null,
  redeemed_at timestamptz default now(),
  status text default 'pending', -- pending / completed / cancelled
  metadata jsonb default '{}'::jsonb
);

-- 6) Spin results (daily spin wheel)
create table if not exists spins (
  id serial primary key,
  profile_id uuid references profiles(id) on delete set null,
  result jsonb,
  points_awarded integer default 0,
  discount integer default 0,
  created_at timestamptz default now()
);

-- 7) Points transactions ledger
create table if not exists points_transactions (
  id serial primary key,
  profile_id uuid references profiles(id) on delete set null,
  amount integer not null,
  reason text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- 8) Simple leaderboard view
create or replace view leaderboard as
  select p.id as profile_id, p.username, p.display_name, p.points
  from profiles p
  order by p.points desc;

-- 9) Example seed data for badges and rewards (useful defaults for the UI)
insert into badges (name, points, description) values
  ('Seedling', 50, 'Welcome to your journey'),
  ('Sapling', 150, 'Nice progress'),
  ('Growing Tree', 400, 'Strong engagement'),
  ('Ancient Banyan', 1200, 'Top supporter')
on conflict (name) do nothing;

insert into rewards (name, points_required, description) values
  ('Travel Size Product', 500, 'Free travel-sized version of best-sellers'),
  ('Next Order Discount', 800, '15% off your next purchase'),
  ('VIP Access Bundle', 1500, 'A curated box of our latest products')
on conflict (name) do nothing;

-- End of schema

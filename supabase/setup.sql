-- ================================================================
-- Skill Samurai Academy – Supabase Database Setup
-- ================================================================
-- Run this entire file in the Supabase SQL Editor:
--   supabase.com → your project → SQL Editor → New query
-- ================================================================


-- ----------------------------------------------------------------
-- 1. public.profiles table
--    One row per auth user. Created automatically on signup via
--    the handle_new_user trigger below.
-- ----------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid        references auth.users(id) on delete cascade primary key,
  full_name   text,
  email       text,
  role        text        not null default 'parent',  -- parent | student | teacher | admin
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------
-- 2. Row Level Security
-- ----------------------------------------------------------------
alter table public.profiles enable row level security;

-- Drop existing policies before re-creating (idempotent)
drop policy if exists "Users can view own profile"    on public.profiles;
drop policy if exists "Users can update own profile"  on public.profiles;
drop policy if exists "Service role full access"      on public.profiles;

-- Each user can read their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Each user can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Service role (used by Vercel backend functions) has full access
create policy "Service role full access"
  on public.profiles
  using (auth.jwt() ->> 'role' = 'service_role');

-- ----------------------------------------------------------------
-- 3. Trigger: auto-create a profile row when a new user signs up
--    This is what prevents "Database error trying to save new user"
-- ----------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email
  )
  on conflict (id) do nothing;  -- safe to re-run; skips if row already exists
  return new;
end;
$$;

-- Drop and recreate the trigger (idempotent)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ----------------------------------------------------------------
-- 4. Backfill: create profile rows for any auth users that
--    already exist but don't have a profile yet
-- ----------------------------------------------------------------
insert into public.profiles (id, full_name, email)
select
  id,
  coalesce(raw_user_meta_data ->> 'full_name', ''),
  email
from auth.users
on conflict (id) do nothing;

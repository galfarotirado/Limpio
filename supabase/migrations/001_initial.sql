-- =============================================
-- LIMPIO - Initial Database Schema
-- =============================================

-- User profiles (extends Supabase auth.users)
create table if not exists public.user_profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  quit_date timestamptz not null,
  daily_cost numeric(10, 2) not null default 5.00,
  currency text not null default 'EUR',
  language text not null default 'es',
  reasons text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Diary entries
create table if not exists public.diary_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  mood smallint check (mood between 1 and 5),
  tags text[] default '{}',
  created_at timestamptz default now()
);

-- Craving logs
create table if not exists public.cravings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  intensity smallint check (intensity between 1 and 5) not null default 3,
  trigger_text text,
  location text,
  resisted boolean not null default true,
  created_at timestamptz default now()
);

-- Relapse log
create table if not exists public.relapses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  notes text,
  previous_quit_date timestamptz,
  created_at timestamptz default now()
);

-- =============================================
-- Row Level Security
-- =============================================

alter table public.user_profiles enable row level security;
alter table public.diary_entries enable row level security;
alter table public.cravings enable row level security;
alter table public.relapses enable row level security;

-- user_profiles policies
create policy "Users can view own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.user_profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = id);

-- diary_entries policies
create policy "Users can manage own diary entries"
  on public.diary_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- cravings policies
create policy "Users can manage own cravings"
  on public.cravings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- relapses policies
create policy "Users can manage own relapses"
  on public.relapses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =============================================
-- Indexes for performance
-- =============================================

create index if not exists diary_entries_user_id_created_at_idx
  on public.diary_entries(user_id, created_at desc);

create index if not exists cravings_user_id_created_at_idx
  on public.cravings(user_id, created_at desc);

create index if not exists relapses_user_id_created_at_idx
  on public.relapses(user_id, created_at desc);

-- =============================================
-- Auto-update updated_at
-- =============================================

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_user_profiles_updated
  before update on public.user_profiles
  for each row execute procedure public.handle_updated_at();

-- =============================================
-- Create profile on user signup (optional trigger)
-- The app also handles this manually on onboarding
-- =============================================

-- =============================================
-- Migration 002: Add porros_per_day & savings_goal to user_profiles
-- =============================================

alter table public.user_profiles
  add column if not exists porros_per_day numeric(5, 1),
  add column if not exists savings_goal numeric(10, 2);

-- Update the delete policy for user_profiles to allow self-deletion
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'user_profiles'
      and policyname = 'Users can delete own profile'
  ) then
    execute 'create policy "Users can delete own profile"
      on public.user_profiles for delete
      using (auth.uid() = id)';
  end if;
end $$;

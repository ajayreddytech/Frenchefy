create table if not exists public.study_entries (
  user_id uuid not null references auth.users (id) on delete cascade,
  study_date date not null,
  hours numeric not null check (hours > 0),
  created_at timestamptz not null default now(),
  primary key (user_id, study_date)
);

alter table public.study_entries enable row level security;

create policy "Users can read their own study entries"
  on public.study_entries for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own study entries"
  on public.study_entries for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own study entries"
  on public.study_entries for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own study entries"
  on public.study_entries for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create index if not exists study_entries_user_date_idx
  on public.study_entries (user_id, study_date desc);

create table if not exists public.account_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  daily_goal_hours numeric not null default 3
    check (daily_goal_hours > 0 and daily_goal_hours <= 24),
  theme text not null default 'dark'
    check (theme in ('dark', 'light'))
);

alter table public.account_preferences enable row level security;

create policy "Users can read their own account preferences"
  on public.account_preferences for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own account preferences"
  on public.account_preferences for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own account preferences"
  on public.account_preferences for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

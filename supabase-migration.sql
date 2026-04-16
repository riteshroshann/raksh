-- ============================================================
-- Raksh — Schema migration (run in Supabase SQL Editor)
-- ============================================================

-- 1. Add missing columns to profiles
alter table public.profiles
  add column if not exists dob date,
  add column if not exists sex text check (sex in ('male', 'female')),
  add column if not exists photo_url text;

-- 2. Add missing columns to family_members
alter table public.family_members
  add column if not exists dob date,
  add column if not exists sex text check (sex in ('male', 'female'));

-- 3. Add missing columns to medicines
alter table public.medicines
  add column if not exists times text[] default '{}',
  add column if not exists food_instruction text,
  add column if not exists condition_tag text,
  add column if not exists quantity_total integer,
  add column if not exists start_date date default current_date,
  add column if not exists refill_threshold integer default 7,
  add column if not exists doctor text,
  add column if not exists notes text,
  add column if not exists is_active boolean default true;

-- 4. Create medicine_logs table (daily dose tracking)
create table if not exists public.medicine_logs (
  id          uuid default uuid_generate_v4() primary key,
  medicine_id uuid references public.medicines on delete cascade not null,
  user_id     uuid references auth.users on delete cascade not null,
  taken_at    timestamptz default now() not null,
  was_taken   boolean default true not null
);

alter table public.medicine_logs enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'medicine_logs'
    and policyname = 'Users manage own medicine logs'
  ) then
    execute 'create policy "Users manage own medicine logs" on public.medicine_logs for all using (auth.uid() = user_id)';
  end if;
end;
$$;

-- 5. Create vault_records table (uploaded reports)
create table if not exists public.vault_records (
  id           uuid default uuid_generate_v4() primary key,
  user_id      uuid references auth.users on delete cascade not null,
  title        text not null,
  category     text not null,
  condition    text,
  file_url     text,
  is_hidden    boolean default false,
  notes        text,
  record_date  date,
  created_at   timestamptz default now()
);

alter table public.vault_records enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'vault_records'
    and policyname = 'Users manage own vault records'
  ) then
    execute 'create policy "Users manage own vault records" on public.vault_records for all using (auth.uid() = user_id)';
  end if;
end;
$$;

-- 6. Create symptoms table
create table if not exists public.symptoms (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references auth.users on delete cascade not null,
  description text not null,
  severity    text check (severity in ('mild', 'moderate', 'severe')),
  conditions  text[] default '{}',
  logged_at   timestamptz default now()
);

alter table public.symptoms enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'symptoms'
    and policyname = 'Users manage own symptoms'
  ) then
    execute 'create policy "Users manage own symptoms" on public.symptoms for all using (auth.uid() = user_id)';
  end if;
end;
$$;

-- =============================================================
-- Tradeversity Journal — Supabase database setup
-- Paste this whole file into Supabase → SQL Editor → Run.
-- =============================================================

-- 1) Student profiles (one per account)
create table if not exists public.profiles (
  id         uuid primary key references auth.users on delete cascade,
  email      text,
  full_name  text,
  telegram   text,
  role       text not null default 'student' check (role in ('student','admin')),
  created_at timestamptz not null default now()
);

-- Create the profile automatically when someone signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, telegram)
  values (new.id, new.email,
          new.raw_user_meta_data->>'full_name',
          new.raw_user_meta_data->>'telegram');
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Is the logged-in user the admin?
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- 2) Trades
create table if not exists public.trades (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users on delete cascade,
  trade_date date not null,
  symbol     text,
  account    text,
  pnl        numeric,
  data       jsonb not null default '{}'::jsonb,   -- all trade fields, emotions, notes, remark
  shots      jsonb not null default '[]'::jsonb,   -- compressed screenshots
  created_at timestamptz not null default now()
);
create index if not exists trades_user_date on public.trades (user_id, trade_date);

-- 3) Daily trading plans
create table if not exists public.plans (
  user_id    uuid not null default auth.uid() references auth.users on delete cascade,
  plan_date  date not null,
  data       jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  primary key (user_id, plan_date)
);

-- 4) Security: each student sees only their own data, the admin sees everyone
alter table public.profiles enable row level security;
alter table public.trades   enable row level security;
alter table public.plans    enable row level security;

drop policy if exists "profiles read"   on public.profiles;
drop policy if exists "profiles update" on public.profiles;
create policy "profiles read"   on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
-- students can edit their name/Telegram but never their role
revoke update on public.profiles from authenticated, anon;
grant update (full_name, telegram) on public.profiles to authenticated;

drop policy if exists "trades read"   on public.trades;
drop policy if exists "trades insert" on public.trades;
drop policy if exists "trades update" on public.trades;
drop policy if exists "trades delete" on public.trades;
create policy "trades read"   on public.trades for select using (user_id = auth.uid() or public.is_admin());
create policy "trades insert" on public.trades for insert with check (user_id = auth.uid());
create policy "trades update" on public.trades for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "trades delete" on public.trades for delete using (user_id = auth.uid());

drop policy if exists "plans read"   on public.plans;
drop policy if exists "plans insert" on public.plans;
drop policy if exists "plans update" on public.plans;
drop policy if exists "plans delete" on public.plans;
create policy "plans read"   on public.plans for select using (user_id = auth.uid() or public.is_admin());
create policy "plans insert" on public.plans for insert with check (user_id = auth.uid());
create policy "plans update" on public.plans for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "plans delete" on public.plans for delete using (user_id = auth.uid());

-- =============================================================
-- 5) MAKE YOURSELF ADMIN — run this AFTER you sign up on the site
--    (replace the email with the one you signed up with)
-- =============================================================
-- update public.profiles set role = 'admin' where email = 'YOUR_EMAIL_HERE';

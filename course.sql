-- =====================================================================
-- TRADEVERSITY · Mentorship course: access, one-device lock, logs, lessons, progress
-- Paste the whole file in Supabase → SQL editor → Run. Safe to run again.
--
-- Security model:
--   * course_members / course_log are written ONLY by the Edge Function "course" (service key, on the server).
--     Students cannot read or change them directly; the admin can read them.
--   * Each member has ONE device: a public key whose private half never leaves that browser
--     (WebCrypto, non-extractable). Every lesson request must be signed by that device.
--   * course_lessons: the admin manages them; students only get them through the function (after the device check).
--   * course_progress: each student reads and writes only their own rows.
-- =====================================================================

create table if not exists public.course_members (
  user_id      uuid primary key references auth.users on delete cascade,
  status       text not null default 'active' check (status in ('active','blocked')),
  granted_at   timestamptz not null default now(),
  granted_by   uuid,
  note         text,
  -- the one course device
  device_pub   jsonb,
  device_label text,
  device_at    timestamptz,
  accepted_at  timestamptz,          -- when the member accepted "this is my only course device"
  last_ts      bigint not null default 0,   -- last signed request time (blocks replays)
  -- device change waiting 24 hours
  pend_pub     jsonb,
  pend_label   text,
  pend_at      timestamptz,
  -- Telegram code for a device change
  code_hash    text,
  code_exp     timestamptz,
  code_tries   int not null default 0,
  resets       timestamptz[] not null default '{}'   -- self-service device changes (limits: 1 per 90 days, 2 per year)
);

create table if not exists public.course_log (
  id      bigserial primary key,
  user_id uuid references auth.users on delete cascade,
  at      timestamptz not null default now(),
  action  text not null,
  ok      boolean not null default true,
  reason  text,
  device  text,
  ip      text,
  country text,
  ua      text
);
create index if not exists course_log_user_at on public.course_log (user_id, at desc);

create table if not exists public.course_lessons (
  id         uuid primary key default gen_random_uuid(),
  position   int  not null default 0,
  module     text,
  title      text not null,
  summary    text,
  minutes    int,
  video_id   text,                    -- VdoCipher video ID
  published  boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.course_progress (
  user_id    uuid not null default auth.uid() references auth.users on delete cascade,
  lesson_id  uuid not null references public.course_lessons on delete cascade,
  pct        int  not null default 0 check (pct between 0 and 100),
  done       boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

alter table public.course_members  enable row level security;
alter table public.course_log      enable row level security;
alter table public.course_lessons  enable row level security;
alter table public.course_progress enable row level security;

-- members and log: the admin reads; nobody writes from the website (the function uses the service key)
drop policy if exists "course members admin read" on public.course_members;
create policy "course members admin read" on public.course_members for select using (public.is_admin());
drop policy if exists "course log admin read" on public.course_log;
create policy "course log admin read" on public.course_log for select using (public.is_admin());

-- lessons: the admin manages them (students get them through the function only)
drop policy if exists "course lessons admin" on public.course_lessons;
create policy "course lessons admin" on public.course_lessons for all using (public.is_admin()) with check (public.is_admin());

-- progress: own rows only (the admin can read)
drop policy if exists "course progress read" on public.course_progress;
create policy "course progress read" on public.course_progress for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists "course progress write" on public.course_progress;
create policy "course progress write" on public.course_progress for insert with check (user_id = auth.uid());
drop policy if exists "course progress update" on public.course_progress;
create policy "course progress update" on public.course_progress for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- deleting a user for good also removes their course rows (cascade above)

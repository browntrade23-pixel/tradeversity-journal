-- TRADEVERSITY · Mentorship course, step 2: weekly unlock + assignments reviewed by the mentor.
-- Paste in Supabase → SQL editor → Run. Safe to run again.

-- each lesson opens N days after the member got access (0 = right away, 7 = one week later, ...)
alter table public.course_lessons add column if not exists unlock_days int not null default 0;
-- what the member must do after the lesson (uses their journal), reviewed by the mentor
alter table public.course_lessons add column if not exists assignment text;

create table if not exists public.course_submissions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users on delete cascade,
  lesson_id   uuid not null references public.course_lessons on delete cascade,
  answer      text not null check (char_length(answer) between 1 and 4000),
  status      text not null default 'pending' check (status in ('pending','approved','redo')),
  feedback    text,
  created_at  timestamptz not null default now(),
  reviewed_at timestamptz
);
create index if not exists course_sub_user on public.course_submissions (user_id, lesson_id, created_at desc);
alter table public.course_submissions enable row level security;

-- members read their own, the admin reads all
drop policy if exists "course sub read" on public.course_submissions;
create policy "course sub read" on public.course_submissions for select using (user_id = auth.uid() or public.is_admin());
-- only active course members can send an answer, for themselves, as "pending"
drop policy if exists "course sub insert" on public.course_submissions;
create policy "course sub insert" on public.course_submissions for insert with check (
  user_id = auth.uid() and status = 'pending' and feedback is null
  and exists (select 1 from public.course_members m where m.user_id = auth.uid() and m.status = 'active'));
-- only the admin reviews (status + feedback)
drop policy if exists "course sub review" on public.course_submissions;
create policy "course sub review" on public.course_submissions for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "course sub delete" on public.course_submissions;
create policy "course sub delete" on public.course_submissions for delete using (public.is_admin());

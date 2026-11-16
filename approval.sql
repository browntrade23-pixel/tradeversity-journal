-- =============================================================
-- Tradeversity Journal — admin approval for new students
-- New sign-ups start as 'pending'. They can't see or save anything
-- until the admin approves them in the Admin dashboard.
-- Run AFTER schema.sql and notifications.sql.
-- =============================================================

alter table public.profiles
  add column if not exists status text not null default 'pending'
  check (status in ('pending','approved','rejected'));

-- The admin is always approved
update public.profiles set status = 'approved' where role = 'admin';

-- Is the logged-in user approved (or the admin)?
create or replace function public.is_approved()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles
                 where id = auth.uid() and (status = 'approved' or role = 'admin'));
$$;

-- Only the admin can approve / reject (students can never change their own status:
-- they are only allowed to update full_name and telegram)
create or replace function public.set_student_status(target uuid, new_status text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Only the admin can do this'; end if;
  if new_status not in ('pending','approved','rejected') then raise exception 'Invalid status'; end if;
  update public.profiles set status = new_status where id = target and role <> 'admin';
end; $$;
revoke execute on function public.set_student_status(uuid, text) from public, anon;
grant execute on function public.set_student_status(uuid, text) to authenticated;

-- Trades and plans: only approved students (admin still reads everything)
drop policy if exists "trades read"   on public.trades;
drop policy if exists "trades insert" on public.trades;
drop policy if exists "trades update" on public.trades;
drop policy if exists "trades delete" on public.trades;
create policy "trades read"   on public.trades for select using ((user_id = auth.uid() and public.is_approved()) or public.is_admin());
create policy "trades insert" on public.trades for insert with check (user_id = auth.uid() and public.is_approved());
create policy "trades update" on public.trades for update using (user_id = auth.uid() and public.is_approved()) with check (user_id = auth.uid() and public.is_approved());
create policy "trades delete" on public.trades for delete using (user_id = auth.uid() and public.is_approved());

drop policy if exists "plans read"   on public.plans;
drop policy if exists "plans insert" on public.plans;
drop policy if exists "plans update" on public.plans;
drop policy if exists "plans delete" on public.plans;
create policy "plans read"   on public.plans for select using ((user_id = auth.uid() and public.is_approved()) or public.is_admin());
create policy "plans insert" on public.plans for insert with check (user_id = auth.uid() and public.is_approved());
create policy "plans update" on public.plans for update using (user_id = auth.uid() and public.is_approved()) with check (user_id = auth.uid() and public.is_approved());
create policy "plans delete" on public.plans for delete using (user_id = auth.uid() and public.is_approved());

-- Telegram alert on sign-up now says it is waiting for approval
create or replace function public.on_profile_created_notify()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.notify_telegram(
    chr(127381) || ' New student request' || chr(10) ||
    'Name: '     || coalesce(new.full_name, '-') || chr(10) ||
    'Telegram: ' || coalesce(new.telegram, '-')  || chr(10) ||
    'Email: '    || coalesce(new.email, '-')     || chr(10) || chr(10) ||
    'Waiting for your approval in the Admin dashboard.');
  return new;
end; $$;

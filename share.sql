-- =============================================================
-- The Effective Journal — public share links for the P&L calendar
-- A student creates a link (and QR code). Anyone with the link sees ONLY
-- daily P&L totals for that account: no trade details, notes, screenshots,
-- email or Telegram. The student can stop sharing at any time.
-- Run AFTER schema.sql and approval.sql.
-- =============================================================

create table if not exists public.shares (
  token      text primary key default replace(gen_random_uuid()::text, '-', ''),
  user_id    uuid not null default auth.uid() references auth.users on delete cascade,
  account    text,                       -- null = all accounts
  title      text,
  show_name  boolean not null default true,
  revoked    boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.shares enable row level security;

drop policy if exists "shares read"   on public.shares;
drop policy if exists "shares insert" on public.shares;
drop policy if exists "shares update" on public.shares;
create policy "shares read"   on public.shares for select using (user_id = auth.uid() or public.is_admin());
create policy "shares insert" on public.shares for insert with check (user_id = auth.uid() and public.is_approved());
create policy "shares update" on public.shares for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Public read: returns only aggregated daily P&L for a valid, active link
create or replace function public.get_share(t text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare s public.shares; nm text; d jsonb;
begin
  select * into s from public.shares where token = t and not revoked;
  if not found then return null; end if;
  if s.show_name then select full_name into nm from public.profiles where id = s.user_id; end if;
  select coalesce(jsonb_agg(jsonb_build_object('date', x.trade_date, 'pnl', round(x.pnl::numeric, 2), 'n', x.n) order by x.trade_date), '[]'::jsonb)
    into d
  from (select trade_date, sum(coalesce(pnl, 0)) as pnl, count(*) as n
        from public.trades
        where user_id = s.user_id and (s.account is null or account = s.account)
        group by trade_date) x;
  return jsonb_build_object('title', s.title, 'name', nm, 'account', s.account, 'created', s.created_at, 'days', d);
end; $$;
revoke execute on function public.get_share(text) from public;
grant execute on function public.get_share(text) to anon, authenticated;

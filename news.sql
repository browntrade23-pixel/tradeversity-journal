-- =============================================================
-- The Effective Journal — USD economic news (Forex Factory calendar)
-- Every 3 hours the database downloads the Forex Factory weekly calendar
-- and keeps USD red-folder (High) and orange-folder (Medium) events.
-- Also: Telegram username is required for every student.
-- Run AFTER schema.sql, notifications.sql and approval.sql.
-- =============================================================

create extension if not exists pg_cron;

create table if not exists public.econ_news (
  id         text primary key,
  title      text not null,
  impact     text not null,          -- 'High' = red folder, 'Medium' = orange folder
  starts_at  timestamptz not null,
  forecast   text,
  previous   text,
  updated_at timestamptz not null default now()
);
alter table public.econ_news enable row level security;
drop policy if exists "news read" on public.econ_news;
create policy "news read" on public.econ_news for select to authenticated using (true);

create table if not exists public.econ_news_fetch (id int primary key default 1, req_id bigint, at timestamptz default now());
alter table public.econ_news_fetch enable row level security;

-- ask for the calendar (the answer arrives a few seconds later)
create or replace function public.news_request() returns void
language plpgsql security definer set search_path = public as $$
declare rid bigint;
begin
  rid := net.http_get('https://nfs.faireconomy.media/ff_calendar_thisweek.json',
                      headers := '{"User-Agent":"Mozilla/5.0 (journal calendar)"}'::jsonb);
  insert into public.econ_news_fetch(id, req_id, at) values (1, rid, now())
  on conflict (id) do update set req_id = excluded.req_id, at = now();
end; $$;

-- store the USD red/orange events from the last answer
create or replace function public.news_ingest() returns int
language plpgsql security definer set search_path = public as $$
declare body jsonb; n int := 0;
begin
  select r.content::jsonb into body
  from net._http_response r join public.econ_news_fetch f on f.req_id = r.id
  where r.status_code = 200 limit 1;
  if body is null or jsonb_typeof(body) <> 'array' then return 0; end if;
  insert into public.econ_news (id, title, impact, starts_at, forecast, previous, updated_at)
  select md5((e->>'title') || (e->>'date')), e->>'title', e->>'impact', (e->>'date')::timestamptz,
         nullif(e->>'forecast', ''), nullif(e->>'previous', ''), now()
  from jsonb_array_elements(body) e
  where e->>'country' = 'USD' and e->>'impact' in ('High', 'Medium')
  on conflict (id) do update set forecast = excluded.forecast, previous = excluded.previous,
                                 impact = excluded.impact, updated_at = now();
  get diagnostics n = row_count;
  return n;
exception when others then return -1;
end; $$;

revoke execute on function public.news_request() from public, anon, authenticated;
revoke execute on function public.news_ingest() from public, anon, authenticated;

-- every 3 hours: store the previous answer, then ask again
select cron.unschedule('econ-news') where exists (select 1 from cron.job where jobname = 'econ-news');
select cron.schedule('econ-news', '7 */3 * * *', 'select public.news_ingest(); select public.news_request();');
select public.news_request();

-- Telegram username is required for every student (format @name, 5-32 letters/numbers/_)
alter table public.profiles drop constraint if exists telegram_required;
alter table public.profiles add constraint telegram_required
  check (role = 'admin' or telegram ~ '^@[A-Za-z0-9_]{5,32}$') not valid;

-- Load now (run this line again ~10 seconds later if it returns 0):
-- select public.news_ingest();

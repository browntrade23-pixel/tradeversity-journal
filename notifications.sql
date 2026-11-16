-- =============================================================
-- Tradeversity Journal — Telegram notifications for the admin
-- Sends you a Telegram message when a student signs up or logs a trade.
-- Run AFTER schema.sql. Then add two secrets in Supabase → Vault:
--   telegram_bot_token  = the token @BotFather gave you
--   telegram_chat_id    = your own Telegram chat id (from @userinfobot)
-- =============================================================

create extension if not exists pg_net;

-- Send one Telegram message. Never blocks or breaks a sign-up / trade save.
create or replace function public.notify_telegram(msg text)
returns void language plpgsql security definer set search_path = public as $$
declare
  tok  text;
  chat text;
begin
  select decrypted_secret into tok  from vault.decrypted_secrets where name = 'telegram_bot_token';
  select decrypted_secret into chat from vault.decrypted_secrets where name = 'telegram_chat_id';
  if tok is null or chat is null then return; end if;
  perform net.http_post(
    url     := 'https://api.telegram.org/bot' || tok || '/sendMessage',
    body    := jsonb_build_object('chat_id', chat, 'text', msg, 'disable_web_page_preview', true),
    headers := '{"Content-Type":"application/json"}'::jsonb
  );
exception when others then
  return;
end; $$;

-- Only the database itself may call it (not students through the API)
revoke execute on function public.notify_telegram(text) from public, anon, authenticated;

-- New student signed up
create or replace function public.on_profile_created_notify()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.notify_telegram(
    chr(127381) || ' New student signed up' || chr(10) ||
    'Name: '     || coalesce(new.full_name, '-') || chr(10) ||
    'Telegram: ' || coalesce(new.telegram, '-')  || chr(10) ||
    'Email: '    || coalesce(new.email, '-'));
  return new;
end; $$;

drop trigger if exists profile_created_notify on public.profiles;
create trigger profile_created_notify
  after insert on public.profiles
  for each row execute function public.on_profile_created_notify();

-- New trade logged
create or replace function public.on_trade_created_notify()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  who text;
begin
  select coalesce(full_name, email) into who from public.profiles where id = new.user_id;
  perform public.notify_telegram(
    case when coalesce(new.pnl, 0) >= 0 then chr(128994) else chr(128308) end || ' New trade' || chr(10) ||
    'Student: ' || coalesce(who, '-') || chr(10) ||
    'Symbol: '  || coalesce(new.symbol, '-') || '  ' || new.trade_date || chr(10) ||
    'P&L: '     || coalesce(new.pnl::text, '-'));
  return new;
end; $$;

drop trigger if exists trade_created_notify on public.trades;
create trigger trade_created_notify
  after insert on public.trades
  for each row execute function public.on_trade_created_notify();

-- Test it (after adding the Vault secrets):
-- select public.notify_telegram(chr(9989) || ' Tradeversity notifications are working');

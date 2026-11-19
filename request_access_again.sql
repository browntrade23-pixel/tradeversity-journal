-- A rejected or removed student can start again: their Telegram must be verified again,
-- then they wait in Pending requests for the admin's approval. Only works on their own account,
-- only from "rejected", never for an admin.
create or replace function public.request_access_again()
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.profiles
     set status = 'pending', telegram_verified = false
   where id = auth.uid() and status = 'rejected' and role <> 'admin';
end; $$;
revoke execute on function public.request_access_again() from public, anon;
grant execute on function public.request_access_again() to authenticated;

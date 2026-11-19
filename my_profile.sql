-- "My profile": username, first/last name, birth date, country, city, zip, phone, photo.
-- public.profiles is already private (RLS: own row or admin only), so these stay between the student and the admin.
alter table public.profiles
  add column if not exists username   text,
  add column if not exists first_name text,
  add column if not exists last_name  text,
  add column if not exists birth_date date,
  add column if not exists country    text,
  add column if not exists city       text,
  add column if not exists zip        text,
  add column if not exists phone      text,
  add column if not exists avatar     text;
-- one username per person (not case sensitive)
create unique index if not exists profiles_username_unique on public.profiles (lower(username)) where coalesce(username,'') <> '';
-- keep rows small: the photo is a resized image (about 20-40 KB)
do $$ begin
  alter table public.profiles add constraint profiles_avatar_size check (avatar is null or length(avatar) < 200000);
exception when duplicate_object then null; end $$;

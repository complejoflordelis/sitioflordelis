-- ============================================================
-- Flor de Lis — nombre de usuario para login (alternativa al email)
-- ============================================================
alter table public.profiles add column if not exists username text;
-- Único, case-insensitive, permitiendo nulos.
create unique index if not exists profiles_username_uidx on public.profiles (lower(username)) where username is not null;

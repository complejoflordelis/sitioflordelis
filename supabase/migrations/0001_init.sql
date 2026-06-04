-- ============================================================
-- Flor de Lis — esquema inicial (cabañas, reservas, perfiles)
-- Ejecutar en Supabase → SQL Editor (o con la CLI: supabase db push)
-- ============================================================

-- ---------- Tabla: profiles (usuarios del sistema) ----------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  nombre      text,
  rol         text not null default 'operador' check (rol in ('admin','operador')),
  activo      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---------- Tabla: cabañas ----------
create table if not exists public.cabanas (
  id           text primary key,
  nombre       text not null,
  max_personas integer not null default 4,
  color        text not null default 'azul',
  orden        integer not null default 0,
  created_at   timestamptz not null default now()
);

-- ---------- Tabla: reservas ----------
create table if not exists public.reservas (
  id                  uuid primary key default gen_random_uuid(),
  fecha_venta         date,
  cabana_id           text references public.cabanas(id) on delete set null,
  inicio_estadia      date,
  fin_estadia         date,
  hora_inicio         text default '14:00',
  hora_fin            text default '10:00',
  modo_importe        text not null default 'total' check (modo_importe in ('total','noche')),
  importe_ingresado   numeric,
  importe_total       numeric not null default 0,
  nombre              text,
  ciudad_origen       text,
  celular             text,
  adultos             integer not null default 0,
  menores             integer not null default 0,
  anticipo            numeric,
  pagado_deposito_a   text,
  fecha_deposito      date,
  pagado_saldo_a      text,
  fecha_pago_cliente  date,
  comision            numeric,
  notas               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists reservas_cabana_idx on public.reservas (cabana_id);
create index if not exists reservas_inicio_idx on public.reservas (inicio_estadia);

-- ---------- Helpers (SECURITY DEFINER para no recursionar en RLS) ----------
create or replace function public.is_admin(uid uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles where id = uid and rol = 'admin' and activo);
$$;

create or replace function public.is_active(uid uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select coalesce((select activo from public.profiles where id = uid), false);
$$;

-- ---------- Alta automática de perfil al crear un usuario ----------
-- El admin principal queda con rol 'admin'. El resto, 'operador'.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, nombre, rol, activo)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nombre', new.email),
    case when lower(new.email) = 'complejo.flordelis.admin@gmail.com' then 'admin' else 'operador' end,
    true
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- updated_at automático en reservas ----------
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists reservas_touch on public.reservas;
create trigger reservas_touch before update on public.reservas
  for each row execute function public.touch_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles enable row level security;
alter table public.cabanas  enable row level security;
alter table public.reservas enable row level security;

-- profiles: cada uno ve su perfil; el admin ve y edita todos.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- cabañas: cualquier usuario activo puede ver y administrar.
drop policy if exists cabanas_all on public.cabanas;
create policy cabanas_all on public.cabanas for all to authenticated
  using (public.is_active(auth.uid())) with check (public.is_active(auth.uid()));

-- reservas: cualquier usuario activo puede ver y administrar.
drop policy if exists reservas_all on public.reservas;
create policy reservas_all on public.reservas for all to authenticated
  using (public.is_active(auth.uid())) with check (public.is_active(auth.uid()));

-- ============================================================
-- Endurecimiento: las funciones de trigger no se exponen por la API REST,
-- y los helpers de RLS no son llamables por el rol anónimo.
-- ============================================================
revoke execute on function public.handle_new_user() from anon, authenticated;
revoke execute on function public.touch_updated_at() from anon, authenticated;
revoke execute on function public.is_admin(uuid) from anon;
revoke execute on function public.is_active(uuid) from anon;

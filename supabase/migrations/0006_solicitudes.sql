-- ============================================================
-- Flor de Lis — solicitudes de reserva desde la página pública (/reservar)
-- ============================================================
create table if not exists public.solicitudes (
  id            uuid primary key default gen_random_uuid(),
  nombre        text,
  apellido      text,
  telefono      text,
  email         text,
  fecha_inicio  date,
  fecha_fin     date,
  late_checkin  boolean not null default false,
  comentario    text,
  estado        text not null default 'pendiente',  -- pendiente | atendida
  created_at    timestamptz not null default now()
);
create index if not exists solicitudes_estado_idx on public.solicitudes (estado, created_at desc);

alter table public.solicitudes enable row level security;

-- Cualquiera (anónimo) puede CREAR una solicitud desde la web pública.
drop policy if exists solicitudes_insert on public.solicitudes;
create policy solicitudes_insert on public.solicitudes for insert to anon, authenticated with check (true);

-- Solo usuarios activos (admin/operador) pueden ver/administrar.
drop policy if exists solicitudes_select on public.solicitudes;
create policy solicitudes_select on public.solicitudes for select to authenticated using (public.is_active(auth.uid()));
drop policy if exists solicitudes_update on public.solicitudes;
create policy solicitudes_update on public.solicitudes for update to authenticated using (public.is_active(auth.uid())) with check (public.is_active(auth.uid()));
drop policy if exists solicitudes_delete on public.solicitudes;
create policy solicitudes_delete on public.solicitudes for delete to authenticated using (public.is_active(auth.uid()));

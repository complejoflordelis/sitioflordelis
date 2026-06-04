-- ============================================================
-- Flor de Lis — pagos/distribución de reservas, gastos y storage
-- ============================================================

-- Reservas: email del solicitante, distribución y settlement del saldo
alter table public.reservas add column if not exists email            text;
alter table public.reservas add column if not exists comision_pct     numeric not null default 30;  -- % Administración
alter table public.reservas add column if not exists anticipo_destino text;   -- Administración | Propietario
alter table public.reservas add column if not exists saldo_destino    text;   -- Administración | Propietario
alter table public.reservas add column if not exists saldo_pagado     boolean not null default false;

-- Gastos de administración (rendición)
create table if not exists public.gastos (
  id            uuid primary key default gen_random_uuid(),
  fecha         date not null default (now()::date),
  tipo          text not null default 'otros',   -- mantenimiento | arreglo | limpieza | servicios | impuestos | insumos | otros
  detalle       text,
  monto         numeric not null default 0,
  cabana_id     text references public.cabanas(id) on delete set null,  -- null = gasto común
  factura_path  text,                              -- ruta en Storage (bucket facturas)
  created_by    uuid default auth.uid(),
  created_at    timestamptz not null default now()
);
create index if not exists gastos_fecha_idx on public.gastos (fecha);

alter table public.gastos enable row level security;
drop policy if exists gastos_all on public.gastos;
create policy gastos_all on public.gastos for all to authenticated
  using (public.is_active(auth.uid())) with check (public.is_active(auth.uid()));

-- Storage: bucket privado para fotos de facturas
insert into storage.buckets (id, name, public)
values ('facturas', 'facturas', false)
on conflict (id) do nothing;

drop policy if exists facturas_select on storage.objects;
create policy facturas_select on storage.objects for select to authenticated
  using (bucket_id = 'facturas' and public.is_active(auth.uid()));

drop policy if exists facturas_insert on storage.objects;
create policy facturas_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'facturas' and public.is_active(auth.uid()));

drop policy if exists facturas_delete on storage.objects;
create policy facturas_delete on storage.objects for delete to authenticated
  using (bucket_id = 'facturas' and public.is_active(auth.uid()));

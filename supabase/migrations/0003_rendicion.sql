-- ============================================================
-- Flor de Lis — rendición de comisión a Administración
-- ============================================================
-- Fecha en que la comisión de Administración de la reserva fue rendida
-- (transferida). NULL = todavía pendiente de rendir. Al rendir, el monto
-- de Administración de esa reserva deja de acumularse como pendiente.
alter table public.reservas add column if not exists fecha_rendicion date;
create index if not exists reservas_rendicion_idx on public.reservas (fecha_rendicion);

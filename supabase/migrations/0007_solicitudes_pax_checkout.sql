-- ============================================================
-- Flor de Lis — solicitudes: adultos/menores + late check-out
-- ============================================================
alter table public.solicitudes add column if not exists adultos int not null default 0;
alter table public.solicitudes add column if not exists menores int not null default 0;

-- Renombrar late_checkin -> late_checkout (idempotente)
do $$ begin
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'solicitudes' and column_name = 'late_checkin') then
    alter table public.solicitudes rename column late_checkin to late_checkout;
  end if;
end $$;

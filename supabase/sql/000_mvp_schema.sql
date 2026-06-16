-- =============================================================
-- MVP Agenda de Entregas - Esquema y objetos de base de datos
-- Ejecutar UNA VEZ en Supabase Studio > SQL Editor.
-- Idempotente: se puede volver a correr sin romper nada.
-- =============================================================

-- 1) Columnas nuevas en public.entregas
alter table public.entregas
  add column if not exists tipo_cliente varchar not null default 'particular',
  add column if not exists hora_esperada time,
  add column if not exists reprogramaciones integer not null default 0;

-- 2) Restricciones de dominio (CHECK)
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'entregas_tipo_cliente_valido') then
    alter table public.entregas
      add constraint entregas_tipo_cliente_valido
      check (tipo_cliente in ('particular', 'renting'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'entregas_estado_valido') then
    alter table public.entregas
      add constraint entregas_estado_valido
      check (estado in ('en taller', 'listo', 'entregado', 'cancelado'));
  end if;
end $$;

-- 3) RPC: reprogramacion atomica (suma +1 a reprogramaciones en el servidor)
create or replace function public.reprogramar_entrega(
  p_id uuid,
  p_fecha date,
  p_hora time
)
returns public.entregas
language sql
as $$
  update public.entregas
     set fecha_esperada    = p_fecha,
         hora_esperada     = p_hora,
         reprogramaciones  = reprogramaciones + 1
   where id = p_id
  returning *;
$$;

-- 4) Realtime: asegurar que entregas este publicada
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'entregas'
  ) then
    alter publication supabase_realtime add table public.entregas;
  end if;
end $$;

-- =============================================================
-- 5) Storage: bucket publico fotos_vehiculos + politicas
--    (MVP interno: acceso con anon key, RLS de tablas OFF)
-- =============================================================
insert into storage.buckets (id, name, public)
values ('fotos_vehiculos', 'fotos_vehiculos', true)
on conflict (id) do nothing;

drop policy if exists "fotos_vehiculos lectura publica" on storage.objects;
create policy "fotos_vehiculos lectura publica"
  on storage.objects for select
  to public
  using (bucket_id = 'fotos_vehiculos');

drop policy if exists "fotos_vehiculos insert anon" on storage.objects;
create policy "fotos_vehiculos insert anon"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'fotos_vehiculos');

-- update + select juntos son necesarios para upsert de archivos
drop policy if exists "fotos_vehiculos update anon" on storage.objects;
create policy "fotos_vehiculos update anon"
  on storage.objects for update
  to anon, authenticated
  using (bucket_id = 'fotos_vehiculos')
  with check (bucket_id = 'fotos_vehiculos');

drop policy if exists "fotos_vehiculos delete anon" on storage.objects;
create policy "fotos_vehiculos delete anon"
  on storage.objects for delete
  to anon, authenticated
  using (bucket_id = 'fotos_vehiculos');

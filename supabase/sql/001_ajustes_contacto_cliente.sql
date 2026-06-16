-- =============================================================
-- Ajustes MVP: limpieza de contacto + CHECK de 9 digitos.
-- Ejecutar UNA VEZ en Supabase Studio > SQL Editor, EN ESTE ORDEN.
--
-- NOTA: el nombre del cliente NO se hace NULLABLE. La app guarda
-- "Sin nombre" cuando el campo queda vacio, asi que la columna
-- nombre_cliente puede seguir siendo NOT NULL.
-- =============================================================

-- 1) Vaciar (no borrar la entrega) los telefonos viejos que no
--    tengan exactamente 9 digitos. Las entregas se conservan.
update public.entregas
set contacto = null
where contacto is not null
  and contacto !~ '^[0-9]{9}$';

-- 2) Contacto: exactamente 9 digitos (o nulo) de aqui en adelante.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'entregas_contacto_valido'
  ) then
    alter table public.entregas
      add constraint entregas_contacto_valido
      check (contacto is null or contacto ~ '^[0-9]{9}$');
  end if;
end $$;

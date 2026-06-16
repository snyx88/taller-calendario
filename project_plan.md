# Plan Tecnico: MVP Agenda de Entregas (Mobile-First)

Reemplazo digital de la agenda fisica de una asesora para gestionar entregas de vehiculos. Single-tenant, sin Auth, RLS desactivado a proposito (uso interno con `anon key` en entorno controlado). Interfaz 100% movil. Sin correos ni push.

Stack: Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, `@supabase/supabase-js`, `date-fns`, `lucide-react`. Primitivas de UI propias y ligeras (sin dependencias nuevas).

## Paso 0 - Base de datos (one-time)

Ejecutar [supabase/sql/000_mvp_schema.sql](supabase/sql/000_mvp_schema.sql) en Supabase Studio > SQL Editor. Incluye:

- Columnas nuevas en `public.entregas`: `tipo_cliente` (`particular` | `renting`), `hora_esperada` (TIME), `reprogramaciones` (INT default 0).
- CHECKs de `tipo_cliente` y `estado`.
- RPC `reprogramar_entrega(p_id, p_fecha, p_hora)`: actualiza fecha/hora y suma `+1` a `reprogramaciones` de forma atomica.
- Publicacion Realtime de `entregas`.
- Bucket publico `fotos_vehiculos` + politicas de Storage.

Esquema final de `entregas`: `id, placa, tipo_cliente, nombre_cliente, contacto, marca, modelo, color, foto_url, fecha_esperada, hora_esperada, fecha_final, observaciones, evaluacion_taller (1-5), estado, reprogramaciones, created_at`.

## Estructura de archivos

```
src/
  types/entrega.ts                         Tipos + uniones (TipoCliente, EstadoEntrega)
  lib/
    utils.ts                               cn() helper
    supabase/client.ts                     Cliente navegador tipado (Database + Functions)
    supabase/storage.ts                    subirFotoVehiculo()
    constants/estados.ts                   Config visual de estados
    constants/horarios.ts                  Slots de 30 min + formato 12h
    entregas/queries.ts                    Lecturas (rango, metricas)
    entregas/mutations.ts                  crear/editar/eliminar/cambiarEstado/reprogramar
  components/
    ui/                                    Drawer, Button, Input, Textarea, Label, Badge
    layout/bottom-nav.tsx                  Navegacion inferior (Agenda / Metricas)
    calendario/use-entregas-realtime.ts    Hook: fetch por rango + postgres_changes
    calendario/calendario-entregas.tsx     Vista principal mobile
    entregas/entrega-card.tsx              Tarjeta (hora grande, renting en rojo)
    entregas/entrega-form.tsx              Formulario
    entregas/entrega-modal.tsx             Drawer crear/editar
    entregas/reprogramar-modal.tsx         Drawer reprogramar (RPC +1)
    entregas/estado-selector.tsx           Cambio de estado
    entregas/calidad-modal.tsx             Estrellas obligatorias al pasar a "listo"
    entregas/estado-badge.tsx              Badge por estado
    entregas/rating-stars.tsx              Estrellas (lectura/edicion)
    entregas/time-picker-30.tsx            Selector de hora amigable
    entregas/foto-uploader.tsx             Captura/subida de foto
    dashboard/resumen-manana.tsx           Banner HOY+1
    dashboard/metrica-card.tsx             KPI
    dashboard/estrellas-chart.tsx          Distribucion de calificaciones
  app/
    layout.tsx                             Contenedor movil + bottom-nav
    page.tsx                               Resumen de manana + calendario
    metricas/page.tsx                      Dashboard del mes
```

## Pasos de implementacion

1. Interfaz core: calendario mobile + `entrega-card` con `hora_esperada` en grande; `renting` resaltado en rojo.
2. Gestion agil: modal crear/editar; boton "Reprogramar" que llama al RPC (suma +1 automatico).
3. Flujo de calidad: al pasar a "listo", modal obligatorio con estrellas (1-5).
4. Resumen de manana: banner superior con entregas de `fecha_esperada = HOY + 1`.
5. Dashboard `/metricas`: total entregadas del mes, distribucion de estrellas, reprogramados (`reprogramaciones > 0`).
6. Tiempo real (`postgres_changes`) y fotos (Storage `fotos_vehiculos`).

## UX para usuario no tecnico

- Hora en bloques de 30 min (chips), con opcion "Otra hora" para ajuste fino.
- Drawers inferiores (alcanzables con el pulgar), targets grandes, pocos campos por pantalla, espanol claro.
- Navegacion inferior de 2 pestanas y boton flotante "Nueva entrega".

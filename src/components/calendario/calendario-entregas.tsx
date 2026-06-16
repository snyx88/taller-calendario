"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  CalendarDays,
  Car,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Radio,
  User,
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Entrega } from "@/types/entrega";

const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function formatFecha(fecha: string) {
  return format(parseISO(fecha), "d MMM yyyy", { locale: es });
}

function entregaEnMes(entrega: Entrega, mes: Date) {
  const fecha = parseISO(entrega.fecha_esperada);
  return isSameMonth(fecha, mes);
}

function estadoClasses(estado: string | null) {
  switch (estado?.toLowerCase()) {
    case "entregado":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300";
    case "en taller":
      return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300";
    case "cancelado":
      return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300";
    default:
      return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
  }
}

export function CalendarioEntregas() {
  const [mesActual, setMesActual] = useState(() => new Date());
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [diaSeleccionado, setDiaSeleccionado] = useState<Date | null>(() => new Date());
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tiempoRealActivo, setTiempoRealActivo] = useState(false);

  const supabase = getSupabaseBrowserClient();

  const cargarMes = useCallback(
    async (mes: Date) => {
      setCargando(true);
      setError(null);

      const inicio = format(startOfMonth(mes), "yyyy-MM-dd");
      const fin = format(endOfMonth(mes), "yyyy-MM-dd");

      const { data, error: queryError } = await supabase
        .from("entregas")
        .select("*")
        .gte("fecha_esperada", inicio)
        .lte("fecha_esperada", fin)
        .order("fecha_esperada", { ascending: true });

      if (queryError) {
        setError(queryError.message);
        setEntregas([]);
      } else {
        setEntregas(data ?? []);
      }

      setCargando(false);
    },
    [supabase],
  );

  useEffect(() => {
    void cargarMes(mesActual);
  }, [mesActual, cargarMes]);

  useEffect(() => {
    const canal = supabase
      .channel("entregas-calendario")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "entregas" },
        (payload) => {
          setEntregas((prev) => {
            if (payload.eventType === "INSERT") {
              const nueva = payload.new as Entrega;
              if (!entregaEnMes(nueva, mesActual)) return prev;
              if (prev.some((e) => e.id === nueva.id)) return prev;
              return [...prev, nueva].sort((a, b) =>
                a.fecha_esperada.localeCompare(b.fecha_esperada),
              );
            }

            if (payload.eventType === "UPDATE") {
              const actualizada = payload.new as Entrega;
              const sinActual = prev.filter((e) => e.id !== actualizada.id);
              if (!entregaEnMes(actualizada, mesActual)) return sinActual;
              return [...sinActual, actualizada].sort((a, b) =>
                a.fecha_esperada.localeCompare(b.fecha_esperada),
              );
            }

            if (payload.eventType === "DELETE") {
              const eliminada = payload.old as { id?: string };
              if (!eliminada.id) return prev;
              return prev.filter((e) => e.id !== eliminada.id);
            }

            return prev;
          });
        },
      )
      .subscribe((status) => {
        setTiempoRealActivo(status === "SUBSCRIBED");
      });

    return () => {
      void supabase.removeChannel(canal);
    };
  }, [supabase, mesActual]);

  const diasCalendario = useMemo(() => {
    const inicio = startOfWeek(startOfMonth(mesActual), { locale: es });
    const fin = endOfWeek(endOfMonth(mesActual), { locale: es });
    return eachDayOfInterval({ start: inicio, end: fin });
  }, [mesActual]);

  const entregasPorDia = useMemo(() => {
    const mapa = new Map<string, Entrega[]>();

    for (const entrega of entregas) {
      const clave = entrega.fecha_esperada;
      const lista = mapa.get(clave) ?? [];
      lista.push(entrega);
      mapa.set(clave, lista);
    }

    return mapa;
  }, [entregas]);

  const entregasDiaSeleccionado = useMemo(() => {
    if (!diaSeleccionado) return [];
    const clave = format(diaSeleccionado, "yyyy-MM-dd");
    return entregasPorDia.get(clave) ?? [];
  }, [diaSeleccionado, entregasPorDia]);

  const tituloMes = format(mesActual, "MMMM yyyy", { locale: es });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <CalendarDays className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-wide">
              Calendario de entregas
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-semibold capitalize text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            {tituloMes}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
              tiempoRealActivo
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            }`}
          >
            <Radio
              className={`h-3.5 w-3.5 ${tiempoRealActivo ? "animate-pulse" : ""}`}
            />
            {tiempoRealActivo ? "Tiempo real activo" : "Conectando…"}
          </span>

          <div className="flex items-center rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
            <button
              type="button"
              onClick={() => setMesActual((m) => subMonths(m, 1))}
              className="rounded-l-lg p-2 text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              aria-label="Mes anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => {
                const hoy = new Date();
                setMesActual(hoy);
                setDiaSeleccionado(hoy);
              }}
              className="border-x border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => setMesActual((m) => addMonths(m, 1))}
              className="rounded-r-lg p-2 text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              aria-label="Mes siguiente"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          Error al cargar entregas: {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="grid grid-cols-7 border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
            {DIAS_SEMANA.map((dia) => (
              <div
                key={dia}
                className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
              >
                {dia}
              </div>
            ))}
          </div>

          <div className="relative grid grid-cols-7">
            {cargando && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 dark:bg-zinc-900/70">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              </div>
            )}

            {diasCalendario.map((dia) => {
              const clave = format(dia, "yyyy-MM-dd");
              const entregasDia = entregasPorDia.get(clave) ?? [];
              const fueraDeMes = !isSameMonth(dia, mesActual);
              const seleccionado =
                diaSeleccionado !== null && isSameDay(dia, diaSeleccionado);
              const hoy = isToday(dia);

              return (
                <button
                  key={clave}
                  type="button"
                  onClick={() => setDiaSeleccionado(dia)}
                  className={`min-h-28 border-b border-r border-zinc-100 p-2 text-left transition hover:bg-emerald-50/60 dark:border-zinc-800 dark:hover:bg-emerald-950/30 ${
                    fueraDeMes ? "bg-zinc-50/80 dark:bg-zinc-950/50" : ""
                  } ${seleccionado ? "ring-2 ring-inset ring-emerald-500" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${
                        hoy
                          ? "bg-emerald-600 text-white"
                          : fueraDeMes
                            ? "text-zinc-400 dark:text-zinc-600"
                            : "text-zinc-800 dark:text-zinc-200"
                      }`}
                    >
                      {format(dia, "d")}
                    </span>
                    {entregasDia.length > 0 && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {entregasDia.length}
                      </span>
                    )}
                  </div>

                  <ul className="mt-2 space-y-1">
                    {entregasDia.slice(0, 2).map((entrega) => (
                      <li
                        key={entrega.id}
                        className="truncate rounded bg-emerald-100/80 px-1.5 py-0.5 text-[11px] font-medium text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-200"
                      >
                        {entrega.placa}
                      </li>
                    ))}
                    {entregasDia.length > 2 && (
                      <li className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        +{entregasDia.length - 2} más
                      </li>
                    )}
                  </ul>
                </button>
              );
            })}
          </div>
        </section>

        <aside className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {diaSeleccionado
              ? format(diaSeleccionado, "EEEE d 'de' MMMM", { locale: es })
              : "Selecciona un día"}
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {entregasDiaSeleccionado.length === 0
              ? "Sin entregas programadas"
              : `${entregasDiaSeleccionado.length} entrega${entregasDiaSeleccionado.length === 1 ? "" : "s"}`}
          </p>

          <ul className="mt-4 space-y-3">
            {entregasDiaSeleccionado.map((entrega) => (
              <li
                key={entrega.id}
                className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100">
                    <Car className="h-4 w-4 shrink-0 text-emerald-600" />
                    {entrega.placa}
                  </div>
                  {entrega.estado && (
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${estadoClasses(entrega.estado)}`}
                    >
                      {entrega.estado}
                    </span>
                  )}
                </div>

                <p className="mt-2 flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                  <User className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                  {entrega.nombre_cliente}
                </p>

                {(entrega.marca || entrega.modelo) && (
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {[entrega.marca, entrega.modelo, entrega.color]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}

                {entrega.fecha_final && (
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                    Entregado: {formatFecha(entrega.fecha_final)}
                  </p>
                )}

                {entrega.observaciones && (
                  <p className="mt-2 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
                    {entrega.observaciones}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}

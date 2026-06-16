"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Loader2, Plus, Radio } from "lucide-react";
import { useEntregasRealtime } from "@/components/calendario/use-entregas-realtime";
import { EntregaCard } from "@/components/entregas/entrega-card";
import { EntregaModal } from "@/components/entregas/entrega-modal";
import { rangoMes } from "@/lib/entregas/queries";
import { cn } from "@/lib/utils";
import type { Entrega } from "@/types/entrega";

const DIAS_SEMANA = ["L", "M", "X", "J", "V", "S", "D"];

export function CalendarioEntregas() {
  const [mesActual, setMesActual] = useState(() => new Date());
  const [diaSeleccionado, setDiaSeleccionado] = useState(() => new Date());
  const [modalAbierto, setModalAbierto] = useState(false);
  const [entregaEditar, setEntregaEditar] = useState<Entrega | null>(null);

  const { desde, hasta } = useMemo(() => rangoMes(mesActual), [mesActual]);
  const { entregas, cargando, error, tiempoRealActivo } = useEntregasRealtime(
    desde,
    hasta,
  );

  const entregasPorDia = useMemo(() => {
    const mapa = new Map<string, Entrega[]>();
    for (const entrega of entregas) {
      const lista = mapa.get(entrega.fecha_esperada) ?? [];
      lista.push(entrega);
      mapa.set(entrega.fecha_esperada, lista);
    }
    return mapa;
  }, [entregas]);

  const diasCalendario = useMemo(() => {
    const inicio = startOfWeek(startOfMonth(mesActual), { locale: es });
    const fin = endOfWeek(endOfMonth(mesActual), { locale: es });
    return eachDayOfInterval({ start: inicio, end: fin });
  }, [mesActual]);

  const entregasDia = entregasPorDia.get(format(diaSeleccionado, "yyyy-MM-dd")) ?? [];

  function abrirNueva() {
    setEntregaEditar(null);
    setModalAbierto(true);
  }

  function abrirEditar(entrega: Entrega) {
    setEntregaEditar(entrega);
    setModalAbierto(true);
  }

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold capitalize text-zinc-900">
            {format(mesActual, "MMMM yyyy", { locale: es })}
          </h1>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
              tiempoRealActivo
                ? "bg-emerald-100 text-emerald-700"
                : "bg-zinc-100 text-zinc-500",
            )}
          >
            <Radio
              className={cn("h-3 w-3", tiempoRealActivo && "animate-pulse")}
            />
            {tiempoRealActivo ? "En vivo" : "..."}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setMesActual((m) => subMonths(m, 1))}
            className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100"
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
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => setMesActual((m) => addMonths(m, 1))}
            className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="px-3 pt-3">
        <div className="grid grid-cols-7 gap-1 pb-1">
          {DIAS_SEMANA.map((d, i) => (
            <div
              key={`${d}-${i}`}
              className="text-center text-[11px] font-semibold uppercase text-zinc-400"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="relative grid grid-cols-7 gap-1">
          {cargando && (
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
          )}
          {diasCalendario.map((dia) => {
            const clave = format(dia, "yyyy-MM-dd");
            const cantidad = entregasPorDia.get(clave)?.length ?? 0;
            const fueraDeMes = !isSameMonth(dia, mesActual);
            const seleccionado = isSameDay(dia, diaSeleccionado);
            const hoy = isToday(dia);
            return (
              <button
                key={clave}
                type="button"
                onClick={() => setDiaSeleccionado(dia)}
                className={cn(
                  "flex aspect-square flex-col items-center justify-center rounded-lg text-sm",
                  fueraDeMes ? "text-zinc-300" : "text-zinc-800",
                  seleccionado && "bg-emerald-600 text-white",
                  !seleccionado && hoy && "ring-1 ring-emerald-400",
                )}
              >
                <span className={cn(hoy && !seleccionado && "font-bold")}>
                  {format(dia, "d")}
                </span>
                {cantidad > 0 && (
                  <span
                    className={cn(
                      "mt-0.5 h-1.5 w-1.5 rounded-full",
                      seleccionado ? "bg-white" : "bg-emerald-500",
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 pb-4 pt-5">
        <h2 className="text-sm font-semibold capitalize text-zinc-500">
          {format(diaSeleccionado, "EEEE d 'de' MMMM", { locale: es })}
        </h2>

        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {!error && entregasDia.length === 0 && !cargando && (
          <p className="mt-6 text-center text-sm text-zinc-400">
            Sin entregas este dia.
          </p>
        )}

        <div className="mt-3 space-y-3">
          {entregasDia.map((entrega) => (
            <EntregaCard
              key={entrega.id}
              entrega={entrega}
              onEditar={abrirEditar}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={abrirNueva}
        className="fixed bottom-24 left-1/2 z-30 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 active:scale-95 sm:left-auto sm:right-[max(1rem,calc(50%-13rem))] sm:translate-x-0"
        aria-label="Nueva entrega"
      >
        <Plus className="h-7 w-7" />
      </button>

      <EntregaModal
        open={modalAbierto}
        onOpenChange={setModalAbierto}
        entrega={entregaEditar}
      />
    </div>
  );
}

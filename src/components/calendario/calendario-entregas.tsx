"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  eachDayOfInterval,
  endOfWeek,
  format,
  getDay,
  isSameDay,
  isToday,
  parseISO,
  startOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  Car,
  CarFront,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Radio,
  Search,
} from "lucide-react";
import { useEntregasRealtime } from "@/components/calendario/use-entregas-realtime";
import { BuscadorPlaca } from "@/components/calendario/buscador-placa";
import { EntregaCard } from "@/components/entregas/entrega-card";
import { EntregaModal } from "@/components/entregas/entrega-modal";
import { cn } from "@/lib/utils";
import type { Entrega } from "@/types/entrega";

// Convencion ES: miercoles = X (evita choque con martes = M).
const LETRA_DIA: Record<number, string> = {
  1: "L",
  2: "M",
  3: "X",
  4: "J",
  5: "V",
  6: "S",
  0: "D",
};

export function CalendarioEntregas() {
  const [diaSeleccionado, setDiaSeleccionado] = useState(() => new Date());
  const [modalAbierto, setModalAbierto] = useState(false);
  const [entregaEditar, setEntregaEditar] = useState<Entrega | null>(null);
  const [buscadorAbierto, setBuscadorAbierto] = useState(false);

  // La semana visible se deriva del dia seleccionado (lunes a domingo).
  const semana = useMemo(() => {
    const inicio = startOfWeek(diaSeleccionado, { locale: es });
    const fin = endOfWeek(diaSeleccionado, { locale: es });
    return {
      desde: format(inicio, "yyyy-MM-dd"),
      hasta: format(fin, "yyyy-MM-dd"),
      dias: eachDayOfInterval({ start: inicio, end: fin }),
    };
  }, [diaSeleccionado]);

  const { entregas, cargando, error, tiempoRealActivo } = useEntregasRealtime(
    semana.desde,
    semana.hasta,
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

  // Las canceladas se muestran al final del dia.
  const entregasDia = [
    ...(entregasPorDia.get(format(diaSeleccionado, "yyyy-MM-dd")) ?? []),
  ].sort((a, b) => {
    const ca = a.estado === "cancelado" ? 1 : 0;
    const cb = b.estado === "cancelado" ? 1 : 0;
    if (ca !== cb) return ca - cb;
    return (a.hora_esperada ?? "").localeCompare(b.hora_esperada ?? "");
  });

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
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-1.5">
            <CarFront className="h-5 w-5 shrink-0 text-emerald-600" />
            <button
              type="button"
              onClick={() => setDiaSeleccionado((d) => addDays(d, -7))}
              className="rounded-lg p-1.5 text-zinc-600 hover:bg-zinc-100"
              aria-label="Semana anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-bold capitalize text-zinc-900">
              {format(diaSeleccionado, "MMMM yyyy", { locale: es })}
            </h1>
            <button
              type="button"
              onClick={() => setDiaSeleccionado((d) => addDays(d, 7))}
              className="rounded-lg p-1.5 text-zinc-600 hover:bg-zinc-100"
              aria-label="Semana siguiente"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
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
            <button
              type="button"
              onClick={() => setBuscadorAbierto(true)}
              className="rounded-lg p-1.5 text-zinc-600 hover:bg-zinc-100"
              aria-label="Buscar por placa"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Weekly Strip Calendar: tira horizontal deslizable */}
        <div className="flex snap-x gap-2 overflow-x-auto px-3 pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {semana.dias.map((dia) => {
            const clave = format(dia, "yyyy-MM-dd");
            const cantidad = entregasPorDia.get(clave)?.length ?? 0;
            const seleccionado = isSameDay(dia, diaSeleccionado);
            const hoy = isToday(dia);
            return (
              <button
                key={clave}
                type="button"
                onClick={() => setDiaSeleccionado(dia)}
                className={cn(
                  "flex min-w-[3.25rem] shrink-0 snap-start flex-col items-center gap-1 rounded-2xl border px-1 py-2 transition-colors",
                  seleccionado
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : hoy
                      ? "border-emerald-400 bg-white text-zinc-700 ring-1 ring-emerald-300"
                      : "border-zinc-200 bg-white text-zinc-700",
                )}
              >
                <span
                  className={cn(
                    "text-[11px] font-semibold uppercase",
                    seleccionado ? "text-emerald-100" : "text-zinc-400",
                  )}
                >
                  {LETRA_DIA[getDay(dia)]}
                </span>
                <span className="text-lg font-bold leading-none">
                  {format(dia, "d")}
                </span>
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    cantidad > 0
                      ? seleccionado
                        ? "bg-white"
                        : "bg-emerald-500"
                      : "bg-transparent",
                  )}
                />
                {hoy && (
                  <span
                    className={cn(
                      "text-[9px] font-bold uppercase leading-none",
                      seleccionado ? "text-emerald-100" : "text-emerald-600",
                    )}
                  >
                    Hoy
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      <div className="flex items-center justify-between px-4 pt-4">
        <h2 className="text-sm font-semibold capitalize text-zinc-500">
          {format(diaSeleccionado, "EEEE d 'de' MMMM", { locale: es })}
        </h2>
        <button
          type="button"
          onClick={() => setDiaSeleccionado(new Date())}
          className="rounded-lg px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
        >
          Hoy
        </button>
      </div>

      <div className="px-4 pb-28 pt-3">
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {cargando && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          </div>
        )}

        {!error && !cargando && entregasDia.length === 0 && (
          <p className="py-10 text-center text-sm text-zinc-400">
            Sin entregas este día.
          </p>
        )}

        <div className="space-y-3">
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
        className="fixed bottom-28 left-1/2 z-30 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 active:scale-95 sm:left-auto sm:right-[max(1rem,calc(50%-13rem))] sm:translate-x-0"
        aria-label="Nueva entrega"
      >
        <Car className="h-7 w-7" />
        <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-emerald-600 shadow">
          <Plus className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
      </button>

      <BuscadorPlaca
        open={buscadorAbierto}
        onOpenChange={setBuscadorAbierto}
        onSeleccionar={(fecha) => setDiaSeleccionado(parseISO(fecha))}
      />

      <EntregaModal
        open={modalAbierto}
        onOpenChange={setModalAbierto}
        entrega={entregaEditar}
        fechaInicial={format(diaSeleccionado, "yyyy-MM-dd")}
      />
    </div>
  );
}

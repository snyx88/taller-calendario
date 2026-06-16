"use client";

import { useMemo } from "react";
import { addDays, format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarClock, Sunrise } from "lucide-react";
import { useEntregasRealtime } from "@/components/calendario/use-entregas-realtime";
import { fechaManana } from "@/lib/entregas/queries";
import { formatHora12 } from "@/lib/constants/horarios";
import { cn } from "@/lib/utils";

export function ResumenManana() {
  // Fecha local del dispositivo (no UTC) para evitar desfases nocturnos.
  const manana = useMemo(() => fechaManana(), []);
  const { entregas } = useEntregasRealtime(manana, manana);

  const etiquetaFecha = format(addDays(new Date(), 1), "EEEE d 'de' MMMM", {
    locale: es,
  });

  return (
    <section className="mx-4 mt-4 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white">
          <Sunrise className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-sm font-bold text-emerald-900">
            Entregas de mañana
          </h2>
          <p className="text-xs capitalize text-emerald-700">{etiquetaFecha}</p>
        </div>
        <span className="ml-auto rounded-full bg-emerald-600 px-2.5 py-0.5 text-sm font-bold text-white">
          {entregas.length}
        </span>
      </div>

      {entregas.length === 0 ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-emerald-700/80">
          <CalendarClock className="h-4 w-4" />
          Sin entregas programadas para mañana.
        </p>
      ) : (
        <ul className="mt-3 space-y-1.5">
          {entregas.map((entrega) => {
            const esRenting = entrega.tipo_cliente === "renting";
            return (
              <li
                key={entrega.id}
                className={cn(
                  "flex items-center gap-3 rounded-xl bg-white/80 px-3 py-2",
                  esRenting && "ring-1 ring-red-200",
                )}
              >
                <span
                  className={cn(
                    "min-w-16 text-sm font-bold",
                    esRenting ? "text-red-600" : "text-emerald-700",
                  )}
                >
                  {formatHora12(entrega.hora_esperada) || "--:--"}
                </span>
                <span className="truncate text-sm font-semibold text-zinc-800">
                  {entrega.placa}
                </span>
                <span className="truncate text-sm text-zinc-500">
                  {entrega.nombre_cliente}
                </span>
                {esRenting && (
                  <span className="ml-auto shrink-0 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    RENTING
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

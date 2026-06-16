"use client";

import { useRef, useState } from "react";
import {
  CalendarClock,
  History,
  MessageCircle,
  Pencil,
  Phone,
  User,
} from "lucide-react";
import { EstadoSelector } from "@/components/entregas/estado-selector";
import { ReprogramarModal } from "@/components/entregas/reprogramar-modal";
import { RatingStars } from "@/components/entregas/rating-stars";
import { getEstadoConfig } from "@/lib/constants/estados";
import { formatHora12 } from "@/lib/constants/horarios";
import { cn } from "@/lib/utils";
import type { Entrega } from "@/types/entrega";

type Props = {
  entrega: Entrega;
  onEditar: (entrega: Entrega) => void;
};

// Telefono local de Peru: 9 digitos -> anteponer 51 para WhatsApp.
function linkWhatsApp(contacto: string): string {
  const digitos = contacto.replace(/\D/g, "");
  const numero = digitos.length === 9 ? `51${digitos}` : digitos;
  return `https://wa.me/${numero}`;
}

export function EntregaCard({ entrega, onEditar }: Props) {
  const [reprogramar, setReprogramar] = useState(false);
  const [estadoAbierto, setEstadoAbierto] = useState(false);
  const esRenting = entrega.tipo_cliente === "renting";
  const cancelado = entrega.estado === "cancelado";
  const hora = formatHora12(entrega.hora_esperada);
  const estadoConfig = getEstadoConfig(entrega.estado);

  // Mantener pulsado el cuerpo de la ficha abre "Cambiar estado".
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const iniciarPulsacion = () => {
    timerRef.current = setTimeout(() => setEstadoAbierto(true), 500);
  };
  const cancelarPulsacion = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-white p-4 pl-5 shadow-sm",
        esRenting ? "border-2 border-red-400" : "border border-zinc-200",
        cancelado && "opacity-60",
      )}
    >
      {/* Franja lateral con el color del estado */}
      <span
        className={cn(
          "absolute left-0 top-0 h-full w-1.5",
          estadoConfig.punto,
        )}
      />
      <div
        className="flex items-start gap-4 select-none"
        onPointerDown={iniciarPulsacion}
        onPointerUp={cancelarPulsacion}
        onPointerLeave={cancelarPulsacion}
        onPointerCancel={cancelarPulsacion}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div
          className={cn(
            "flex min-w-20 flex-col items-center justify-center rounded-xl px-3 py-2",
            esRenting
              ? "bg-red-50 text-red-700"
              : "bg-emerald-50 text-emerald-700",
          )}
        >
          <span className="text-2xl font-bold leading-tight">
            {hora ? hora.replace(/ (AM|PM)/, "") : "--:--"}
          </span>
          <span className="text-xs font-semibold uppercase">
            {hora ? hora.slice(-2) : "hora"}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-lg font-bold tracking-wide text-zinc-900">
              {entrega.placa}
            </span>
            {esRenting && (
              <span className="shrink-0 rounded-md bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                RENTING
              </span>
            )}
          </div>

          {entrega.nombre_cliente && (
            <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-zinc-600">
              <User className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
              {entrega.nombre_cliente}
            </p>
          )}

          {(entrega.marca || entrega.modelo || entrega.color) && (
            <p className="truncate text-sm text-zinc-500">
              {[entrega.marca, entrega.modelo, entrega.color]
                .filter(Boolean)
                .join(" - ")}
            </p>
          )}

          {entrega.evaluacion_taller != null && (
            <RatingStars
              value={entrega.evaluacion_taller}
              size="sm"
              className="mt-1"
            />
          )}

          {entrega.reprogramaciones > 0 && (
            <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-amber-600">
              <History className="h-3.5 w-3.5" />
              Reprogramado x{entrega.reprogramaciones}
            </p>
          )}
        </div>
      </div>

      {entrega.contacto && (
        <div className="mt-3 flex gap-2">
          <a
            href={`tel:${entrega.contacto}`}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-zinc-100 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200"
          >
            <Phone className="h-4 w-4" />
            Llamar
          </a>
          <a
            href={linkWhatsApp(entrega.contacto)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-100 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-200"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-zinc-100 pt-3">
        <EstadoSelector
          entrega={entrega}
          open={estadoAbierto}
          onOpenChange={setEstadoAbierto}
        />
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setReprogramar(true)}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
          >
            <CalendarClock className="h-4 w-4" />
            Reprogramar
          </button>
          <button
            type="button"
            onClick={() => onEditar(entrega)}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
            aria-label="Editar"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
      </div>

      <ReprogramarModal
        open={reprogramar}
        onOpenChange={setReprogramar}
        entrega={entrega}
      />
    </div>
  );
}

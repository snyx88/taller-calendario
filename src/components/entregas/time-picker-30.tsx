"use client";

import { useState } from "react";
import { Clock, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  formatHora12,
  generarSlots30,
  normalizarHora,
} from "@/lib/constants/horarios";
import { cn } from "@/lib/utils";

type Props = {
  value: string | null;
  onChange: (value: string | null) => void;
};

export function TimePicker30({ value, onChange }: Props) {
  const slots = generarSlots30();
  const seleccionado = normalizarHora(value);
  const esSlot = !seleccionado || slots.includes(seleccionado);
  const [modoLibre, setModoLibre] = useState(!esSlot);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {slots.map((slot) => {
          const activo = !modoLibre && slot === seleccionado;
          return (
            <button
              key={slot}
              type="button"
              onClick={() => {
                setModoLibre(false);
                onChange(slot);
              }}
              className={cn(
                "rounded-xl border py-3 text-center text-sm font-medium transition-colors",
                activo
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
              )}
            >
              {formatHora12(slot)}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3 rounded-xl bg-zinc-50 p-3">
        <div className="flex items-center gap-2 text-sm text-zinc-600">
          <Clock className="h-4 w-4" />
          {seleccionado ? (
            <span className="font-medium text-zinc-900">
              {formatHora12(seleccionado)}
            </span>
          ) : (
            <span>Sin hora definida</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setModoLibre((v) => !v)}
        >
          <Pencil className="h-4 w-4" />
          Otra hora
        </Button>
      </div>

      {modoLibre && (
        <div>
          <Input
            type="time"
            step={900}
            value={seleccionado}
            onChange={(e) => onChange(e.target.value || null)}
          />
          <p className="mt-1 text-xs text-zinc-500">
            Elige la hora exacta solo si lo necesitas.
          </p>
        </div>
      )}
    </div>
  );
}

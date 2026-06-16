"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { EstadoBadge } from "@/components/entregas/estado-badge";
import { CalidadModal } from "@/components/entregas/calidad-modal";
import { ESTADOS_ORDEN, getEstadoConfig } from "@/lib/constants/estados";
import { cambiarEstado } from "@/lib/entregas/mutations";
import { cn } from "@/lib/utils";
import type { Entrega, EstadoEntrega } from "@/types/entrega";

type EstadoSelectorProps = {
  entrega: Entrega;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function EstadoSelector({
  entrega,
  open,
  onOpenChange,
}: EstadoSelectorProps) {
  const [abiertoInterno, setAbiertoInterno] = useState(false);
  const abierto = open ?? abiertoInterno;
  const setAbierto = onOpenChange ?? setAbiertoInterno;
  const [calidadAbierto, setCalidadAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function aplicar(estado: EstadoEntrega, evaluacion?: number) {
    setGuardando(true);
    setError(null);
    try {
      await cambiarEstado(entrega.id, estado, evaluacion);
      setAbierto(false);
      setCalidadAbierto(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cambiar el estado");
    } finally {
      setGuardando(false);
    }
  }

  function seleccionar(estado: EstadoEntrega) {
    if (estado === entrega.estado) {
      setAbierto(false);
      return;
    }
    if (estado === "listo") {
      setAbierto(false);
      setCalidadAbierto(true);
      return;
    }
    void aplicar(estado);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        aria-label="Cambiar estado"
      >
        <EstadoBadge estado={entrega.estado} />
      </button>

      <Drawer
        open={abierto}
        onOpenChange={setAbierto}
        title="Cambiar estado"
        description={
          entrega.nombre_cliente
            ? `${entrega.placa} - ${entrega.nombre_cliente}`
            : entrega.placa
        }
      >
        <div className="space-y-2">
          {ESTADOS_ORDEN.map((estado) => {
            const config = getEstadoConfig(estado);
            const Icono = config.icono;
            const actual = estado === entrega.estado;
            return (
              <button
                key={estado}
                type="button"
                disabled={guardando}
                onClick={() => seleccionar(estado)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors",
                  actual
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-zinc-200 bg-white hover:bg-zinc-50",
                )}
              >
                <span className="flex items-center gap-3">
                  <span className={cn("rounded-lg p-2", config.badge)}>
                    <Icono className="h-5 w-5" />
                  </span>
                  <span className="font-medium text-zinc-900">
                    {config.label}
                  </span>
                </span>
                {actual && <Check className="h-5 w-5 text-emerald-600" />}
                {guardando && !actual && (
                  <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
                )}
              </button>
            );
          })}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </Drawer>

      <CalidadModal
        open={calidadAbierto}
        onOpenChange={setCalidadAbierto}
        valorInicial={entrega.evaluacion_taller}
        guardando={guardando}
        onConfirmar={(estrellas) => aplicar("listo", estrellas)}
      />
    </>
  );
}

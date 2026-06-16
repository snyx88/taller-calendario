"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { CalendarClock, Loader2 } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TimePicker30 } from "@/components/entregas/time-picker-30";
import { useToast } from "@/components/ui/toast";
import { reprogramar } from "@/lib/entregas/mutations";
import { fechaHoy, getHorasOcupadas } from "@/lib/entregas/queries";
import { normalizarHora } from "@/lib/constants/horarios";
import type { Entrega } from "@/types/entrega";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entrega: Entrega;
};

export function ReprogramarModal({ open, onOpenChange, entrega }: Props) {
  const toast = useToast();
  const [fecha, setFecha] = useState(entrega.fecha_esperada);
  const [hora, setHora] = useState<string | null>(
    normalizarHora(entrega.hora_esperada) || null,
  );
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [horasOcupadas, setHorasOcupadas] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setFecha(entrega.fecha_esperada);
      setHora(normalizarHora(entrega.hora_esperada) || null);
      setError(null);
    }
  }, [open, entrega]);

  // Horas ocupadas por otros autos en la fecha destino (excluye la actual).
  useEffect(() => {
    if (!open || !fecha) {
      setHorasOcupadas([]);
      return;
    }
    let activo = true;
    getHorasOcupadas(fecha, entrega.id)
      .then((horas) => {
        if (activo) setHorasOcupadas(horas);
      })
      .catch(() => {
        if (activo) setHorasOcupadas([]);
      });
    return () => {
      activo = false;
    };
  }, [open, fecha, entrega.id]);

  async function confirmar() {
    if (!fecha) {
      setError("Elige una fecha");
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      await reprogramar(entrega.id, fecha, hora);
      toast("Entrega reprogramada, Flor", "exito");
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo reprogramar");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title="Reprogramar entrega"
      description={
        entrega.nombre_cliente
          ? `${entrega.placa} - ${entrega.nombre_cliente}`
          : entrega.placa
      }
      footer={
        <Button
          size="lg"
          className="w-full"
          disabled={guardando}
          onClick={confirmar}
        >
          {guardando ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <CalendarClock className="h-5 w-5" />
          )}
          Reprogramar
        </Button>
      }
    >
      <div className="space-y-4">
        {entrega.reprogramaciones > 0 && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Ya se reprogramó {entrega.reprogramaciones}{" "}
            {entrega.reprogramaciones === 1 ? "vez" : "veces"}.
          </p>
        )}
        <div>
          <Label htmlFor="reprog-fecha">Nueva fecha</Label>
          <Input
            id="reprog-fecha"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
          {fecha && (
            <p className="mt-1 text-xs text-zinc-500">
              {format(parseISO(fecha), "dd/MM/yy")}
            </p>
          )}
          {fecha && fecha < fechaHoy() && (
            <p className="mt-1 text-xs text-amber-600">
              Esta fecha ya pasó. Revisa antes de reprogramar.
            </p>
          )}
        </div>
        <div>
          <Label>Nueva hora</Label>
          <TimePicker30
            value={hora}
            onChange={setHora}
            horasOcupadas={horasOcupadas}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </Drawer>
  );
}

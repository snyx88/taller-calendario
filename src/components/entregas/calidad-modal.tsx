"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/entregas/rating-stars";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmar: (estrellas: number) => Promise<void> | void;
  valorInicial?: number | null;
  guardando?: boolean;
};

export function CalidadModal({
  open,
  onOpenChange,
  onConfirmar,
  valorInicial,
  guardando = false,
}: Props) {
  const [estrellas, setEstrellas] = useState(valorInicial ?? 0);

  useEffect(() => {
    if (open) setEstrellas(valorInicial ?? 0);
  }, [open, valorInicial]);

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title="Marcar como listo"
      description="Califica el trabajo del taller para continuar."
      footer={
        <Button
          size="lg"
          className="w-full"
          disabled={estrellas < 1 || guardando}
          onClick={() => onConfirmar(estrellas)}
        >
          {guardando && <Loader2 className="h-5 w-5 animate-spin" />}
          Confirmar listo
        </Button>
      }
    >
      <div className="flex flex-col items-center gap-3 py-4">
        <p className="text-sm text-zinc-600">Calidad de la entrega</p>
        <RatingStars value={estrellas} onChange={setEstrellas} size="lg" />
        <p className="h-5 text-sm font-medium text-zinc-500">
          {estrellas > 0
            ? `${estrellas} de 5 estrellas`
            : "Toca las estrellas"}
        </p>
      </div>
    </Drawer>
  );
}

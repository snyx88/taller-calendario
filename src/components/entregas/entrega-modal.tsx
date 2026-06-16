"use client";

import { useState } from "react";
import { Drawer } from "@/components/ui/drawer";
import { EntregaForm } from "@/components/entregas/entrega-form";
import { actualizarEntrega, crearEntrega } from "@/lib/entregas/mutations";
import type { Entrega, EntregaInsert } from "@/types/entrega";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entrega?: Entrega | null;
};

export function EntregaModal({ open, onOpenChange, entrega }: Props) {
  const [guardando, setGuardando] = useState(false);
  const editando = Boolean(entrega);

  async function manejarSubmit(payload: EntregaInsert) {
    setGuardando(true);
    try {
      if (entrega) {
        await actualizarEntrega(entrega.id, payload);
      } else {
        await crearEntrega(payload);
      }
      onOpenChange(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : "No se pudo guardar la entrega");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title={editando ? "Editar entrega" : "Nueva entrega"}
    >
      {open && (
        <EntregaForm
          entrega={entrega}
          guardando={guardando}
          onSubmit={manejarSubmit}
          onCancel={() => onOpenChange(false)}
        />
      )}
    </Drawer>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { EntregaForm } from "@/components/entregas/entrega-form";
import { useToast } from "@/components/ui/toast";
import {
  actualizarEntrega,
  crearEntrega,
  eliminarEntrega,
} from "@/lib/entregas/mutations";
import type { Entrega, EntregaInsert } from "@/types/entrega";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entrega?: Entrega | null;
  fechaInicial?: string;
};

export function EntregaModal({
  open,
  onOpenChange,
  entrega,
  fechaInicial,
}: Props) {
  const toast = useToast();
  const [guardando, setGuardando] = useState(false);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const editando = Boolean(entrega);

  useEffect(() => {
    if (open) setConfirmarEliminar(false);
  }, [open]);

  async function manejarSubmit(payload: EntregaInsert) {
    setGuardando(true);
    try {
      if (entrega) {
        await actualizarEntrega(entrega.id, payload);
        toast("Entrega actualizada", "exito");
      } else {
        await crearEntrega(payload);
        toast("Entrega creada", "exito");
      }
      onOpenChange(false);
    } catch (e) {
      toast(
        e instanceof Error ? e.message : "No se pudo guardar la entrega",
        "error",
      );
    } finally {
      setGuardando(false);
    }
  }

  async function manejarEliminar() {
    if (!entrega) return;
    setEliminando(true);
    try {
      await eliminarEntrega(entrega.id);
      toast("Entrega eliminada", "exito");
      onOpenChange(false);
    } catch (e) {
      toast(
        e instanceof Error ? e.message : "No se pudo eliminar",
        "error",
      );
    } finally {
      setEliminando(false);
    }
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title={editando ? "Editar entrega" : "Nueva entrega"}
    >
      {open && (
        <>
          <EntregaForm
            entrega={entrega}
            fechaInicial={fechaInicial}
            guardando={guardando}
            onSubmit={manejarSubmit}
            onCancel={() => onOpenChange(false)}
          />

          {editando &&
            (confirmarEliminar ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3">
                <p className="text-sm font-medium text-red-800">
                  ¿Eliminar esta entrega? No se puede deshacer.
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="subtle"
                    className="flex-1"
                    onClick={() => setConfirmarEliminar(false)}
                    disabled={eliminando}
                  >
                    No
                  </Button>
                  <Button
                    variant="danger"
                    className="flex-1"
                    onClick={manejarEliminar}
                    disabled={eliminando}
                  >
                    {eliminando && <Loader2 className="h-5 w-5 animate-spin" />}
                    Sí, eliminar
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmarEliminar(true)}
                className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar entrega
              </button>
            ))}
        </>
      )}
    </Drawer>
  );
}

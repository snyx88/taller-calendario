"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Loader2, Search } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { EstadoBadge } from "@/components/entregas/estado-badge";
import { buscarPorPlaca } from "@/lib/entregas/queries";
import type { Entrega } from "@/types/entrega";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSeleccionar: (fecha: string) => void;
};

export function BuscadorPlaca({ open, onOpenChange, onSeleccionar }: Props) {
  const [term, setTerm] = useState("");
  const [resultados, setResultados] = useState<Entrega[]>([]);
  const [buscando, setBuscando] = useState(false);

  useEffect(() => {
    if (!open) {
      setTerm("");
      setResultados([]);
    }
  }, [open]);

  useEffect(() => {
    const limpio = term.trim();
    if (!limpio) {
      setResultados([]);
      return;
    }
    let activo = true;
    setBuscando(true);
    const id = setTimeout(() => {
      buscarPorPlaca(limpio)
        .then((data) => {
          if (activo) setResultados(data);
        })
        .catch(() => {
          if (activo) setResultados([]);
        })
        .finally(() => {
          if (activo) setBuscando(false);
        });
    }, 300);
    return () => {
      activo = false;
      clearTimeout(id);
    };
  }, [term]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} title="Buscar por placa">
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={term}
            onChange={(e) => setTerm(e.target.value.toUpperCase())}
            placeholder="ABC123"
            autoFocus
            className="pl-9 uppercase"
          />
        </div>

        {buscando && (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
          </div>
        )}

        {!buscando && term.trim() && resultados.length === 0 && (
          <p className="py-6 text-center text-sm text-zinc-400">
            Sin resultados para “{term.trim()}”.
          </p>
        )}

        <ul className="space-y-2">
          {resultados.map((entrega) => (
            <li key={entrega.id}>
              <button
                type="button"
                onClick={() => {
                  onSeleccionar(entrega.fecha_esperada);
                  onOpenChange(false);
                }}
                className="flex w-full items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-white p-3 text-left hover:bg-zinc-50"
              >
                <div className="min-w-0">
                  <p className="font-bold text-zinc-900">{entrega.placa}</p>
                  <p className="truncate text-sm text-zinc-500">
                    {entrega.nombre_cliente}
                  </p>
                  <p className="text-xs capitalize text-zinc-400">
                    {format(parseISO(entrega.fecha_esperada), "d 'de' MMM yyyy", {
                      locale: es,
                    })}
                  </p>
                </div>
                <EstadoBadge estado={entrega.estado} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Drawer>
  );
}

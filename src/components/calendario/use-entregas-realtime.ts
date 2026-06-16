"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getEntregasPorRango } from "@/lib/entregas/queries";
import type { Entrega } from "@/types/entrega";

function ordenar(a: Entrega, b: Entrega): number {
  if (a.fecha_esperada !== b.fecha_esperada) {
    return a.fecha_esperada.localeCompare(b.fecha_esperada);
  }
  return (a.hora_esperada ?? "").localeCompare(b.hora_esperada ?? "");
}

export type UseEntregasRealtime = {
  entregas: Entrega[];
  cargando: boolean;
  error: string | null;
  tiempoRealActivo: boolean;
};

export function useEntregasRealtime(
  desde: string,
  hasta: string,
): UseEntregasRealtime {
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tiempoRealActivo, setTiempoRealActivo] = useState(false);

  useEffect(() => {
    let activo = true;
    setCargando(true);

    getEntregasPorRango(desde, hasta)
      .then((data) => {
        if (!activo) return;
        setEntregas(data);
        setError(null);
      })
      .catch((e: unknown) => {
        if (!activo) return;
        setError(e instanceof Error ? e.message : "Error al cargar entregas");
        setEntregas([]);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [desde, hasta]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const canal = supabase
      .channel(`entregas-${desde}-${hasta}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "entregas" },
        (payload) => {
          setEntregas((prev) => {
            if (payload.eventType === "DELETE") {
              const anterior = payload.old as { id?: string };
              return anterior.id
                ? prev.filter((e) => e.id !== anterior.id)
                : prev;
            }

            const fila = payload.new as Entrega;
            const dentroDeRango =
              fila.fecha_esperada >= desde && fila.fecha_esperada <= hasta;
            const sinActual = prev.filter((e) => e.id !== fila.id);

            if (!dentroDeRango) return sinActual;
            return [...sinActual, fila].sort(ordenar);
          });
        },
      )
      .subscribe((status) => {
        setTiempoRealActivo(status === "SUBSCRIBED");
      });

    return () => {
      void supabase.removeChannel(canal);
    };
  }, [desde, hasta]);

  return { entregas, cargando, error, tiempoRealActivo };
}

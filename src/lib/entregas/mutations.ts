import { format } from "date-fns";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  Entrega,
  EntregaInsert,
  EntregaUpdate,
  EstadoEntrega,
} from "@/types/entrega";

function limpiar<T extends Record<string, unknown>>(payload: T): T {
  const out = { ...payload };
  for (const clave of Object.keys(out)) {
    const valor = out[clave];
    if (valor === "") {
      (out as Record<string, unknown>)[clave] = null;
    }
  }
  return out;
}

export async function crearEntrega(payload: EntregaInsert): Promise<Entrega> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("entregas")
    .insert(limpiar(payload))
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function actualizarEntrega(
  id: string,
  payload: EntregaUpdate,
): Promise<Entrega> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("entregas")
    .update(limpiar(payload))
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function eliminarEntrega(id: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("entregas").delete().eq("id", id);
  if (error) throw error;
}

export async function cambiarEstado(
  id: string,
  estado: EstadoEntrega,
  evaluacion?: number,
): Promise<Entrega> {
  const update: EntregaUpdate = { estado };
  if (estado === "listo" && evaluacion != null) {
    update.evaluacion_taller = evaluacion;
  }
  if (estado === "entregado") {
    update.fecha_final = format(new Date(), "yyyy-MM-dd");
  }
  return actualizarEntrega(id, update);
}

export async function reprogramar(
  id: string,
  fecha: string,
  hora: string | null,
): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.rpc("reprogramar_entrega", {
    p_id: id,
    p_fecha: fecha,
    p_hora: hora,
  });
  if (error) throw error;
}

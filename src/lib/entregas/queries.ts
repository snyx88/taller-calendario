import { addDays, endOfMonth, format, startOfMonth } from "date-fns";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { normalizarHora } from "@/lib/constants/horarios";
import type { Entrega } from "@/types/entrega";

export function rangoMes(mes: Date): { desde: string; hasta: string } {
  return {
    desde: format(startOfMonth(mes), "yyyy-MM-dd"),
    hasta: format(endOfMonth(mes), "yyyy-MM-dd"),
  };
}

// "Manana" calculada con la fecha LOCAL del dispositivo (zona Peru/Lima),
// no en UTC. `new Date()` es hora local y `format` no convierte zona, asi
// que a partir de las 19:00 (UTC-5) no hay desfase al dia siguiente.
export function fechaManana(): string {
  return format(addDays(new Date(), 1), "yyyy-MM-dd");
}

export function fechaHoy(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export async function getEntregasPorRango(
  desde: string,
  hasta: string,
): Promise<Entrega[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("entregas")
    .select("*")
    .gte("fecha_esperada", desde)
    .lte("fecha_esperada", hasta)
    .order("fecha_esperada", { ascending: true })
    .order("hora_esperada", { ascending: true, nullsFirst: true });

  if (error) throw error;
  return data ?? [];
}

// Horas (HH:mm) ya usadas por otros autos en una fecha dada.
// `excluirId` evita marcar la propia entrega al editar/reprogramar.
export async function getHorasOcupadas(
  fecha: string,
  excluirId?: string,
): Promise<string[]> {
  const supabase = getSupabaseBrowserClient();
  let query = supabase
    .from("entregas")
    .select("id, hora_esperada")
    .eq("fecha_esperada", fecha)
    .not("hora_esperada", "is", null);

  if (excluirId) query = query.neq("id", excluirId);

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? [])
    .map((fila) => normalizarHora(fila.hora_esperada))
    .filter((h): h is string => Boolean(h));
}

// Valores ya usados para autocompletar marca y modelo.
export async function getValoresUnicos(): Promise<{
  marcas: string[];
  modelos: string[];
}> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("entregas")
    .select("marca, modelo")
    .limit(1000);
  if (error) throw error;

  const marcas = new Set<string>();
  const modelos = new Set<string>();
  for (const fila of data ?? []) {
    if (fila.marca) marcas.add(fila.marca);
    if (fila.modelo) modelos.add(fila.modelo);
  }
  return {
    marcas: [...marcas].sort(),
    modelos: [...modelos].sort(),
  };
}

export async function buscarPorPlaca(term: string): Promise<Entrega[]> {
  const limpio = term.trim();
  if (!limpio) return [];
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("entregas")
    .select("*")
    .ilike("placa", `%${limpio}%`)
    .order("fecha_esperada", { ascending: false })
    .limit(20);
  if (error) throw error;
  return data ?? [];
}

export type DistribucionEstrellas = Record<1 | 2 | 3 | 4 | 5, number>;

export type MetricasMes = {
  totalEntregadas: number;
  totalReprogramados: number;
  distribucionEstrellas: DistribucionEstrellas;
  promedioEstrellas: number;
};

export async function getMetricasMes(mes: Date): Promise<MetricasMes> {
  const { desde, hasta } = rangoMes(mes);
  return getMetricasRango(desde, hasta);
}

export async function getMetricasRango(
  desde: string,
  hasta: string,
): Promise<MetricasMes> {
  const supabase = getSupabaseBrowserClient();

  // Entregadas: se cuentan por fecha_final (cuando realmente se entregaron).
  const entregadas = await supabase
    .from("entregas")
    .select("id", { count: "exact", head: true })
    .eq("estado", "entregado")
    .not("fecha_final", "is", null)
    .gte("fecha_final", desde)
    .lte("fecha_final", hasta);
  if (entregadas.error) throw entregadas.error;

  const reprogramados = await supabase
    .from("entregas")
    .select("id", { count: "exact", head: true })
    .gt("reprogramaciones", 0)
    .gte("fecha_esperada", desde)
    .lte("fecha_esperada", hasta);
  if (reprogramados.error) throw reprogramados.error;

  const calificaciones = await supabase
    .from("entregas")
    .select("evaluacion_taller")
    .not("evaluacion_taller", "is", null)
    .gte("fecha_esperada", desde)
    .lte("fecha_esperada", hasta);
  if (calificaciones.error) throw calificaciones.error;

  const distribucionEstrellas: DistribucionEstrellas = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  let suma = 0;
  let n = 0;
  for (const fila of calificaciones.data ?? []) {
    const valor = fila.evaluacion_taller;
    if (valor && valor >= 1 && valor <= 5) {
      distribucionEstrellas[valor as 1 | 2 | 3 | 4 | 5] += 1;
      suma += valor;
      n += 1;
    }
  }

  return {
    totalEntregadas: entregadas.count ?? 0,
    totalReprogramados: reprogramados.count ?? 0,
    distribucionEstrellas,
    promedioEstrellas: n > 0 ? suma / n : 0,
  };
}

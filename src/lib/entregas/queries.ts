import { endOfMonth, format, startOfMonth } from "date-fns";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Entrega } from "@/types/entrega";

export function rangoMes(mes: Date): { desde: string; hasta: string } {
  return {
    desde: format(startOfMonth(mes), "yyyy-MM-dd"),
    hasta: format(endOfMonth(mes), "yyyy-MM-dd"),
  };
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

export type DistribucionEstrellas = Record<1 | 2 | 3 | 4 | 5, number>;

export type MetricasMes = {
  totalEntregadas: number;
  totalReprogramados: number;
  distribucionEstrellas: DistribucionEstrellas;
  promedioEstrellas: number;
};

export async function getMetricasMes(mes: Date): Promise<MetricasMes> {
  const supabase = getSupabaseBrowserClient();
  const { desde, hasta } = rangoMes(mes);

  const entregadas = await supabase
    .from("entregas")
    .select("id", { count: "exact", head: true })
    .eq("estado", "entregado")
    .gte("fecha_esperada", desde)
    .lte("fecha_esperada", hasta);
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

"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarCheck2, History, Loader2, Star } from "lucide-react";
import { MetricaCard } from "@/components/dashboard/metrica-card";
import { EstrellasChart } from "@/components/dashboard/estrellas-chart";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getMetricasRango,
  rangoMes,
  type MetricasMes,
} from "@/lib/entregas/queries";

export default function MetricasPage() {
  const rangoInicial = useMemo(() => rangoMes(new Date()), []);
  const [desde, setDesde] = useState(rangoInicial.desde);
  const [hasta, setHasta] = useState(rangoInicial.hasta);

  const [metricas, setMetricas] = useState<MetricasMes | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const rangoInvalido = Boolean(desde && hasta && desde > hasta);

  useEffect(() => {
    if (!desde || !hasta || desde > hasta) return;
    let activo = true;
    setCargando(true);
    getMetricasRango(desde, hasta)
      .then((data) => {
        if (activo) {
          setMetricas(data);
          setError(null);
        }
      })
      .catch((e: unknown) => {
        if (activo) {
          setError(e instanceof Error ? e.message : "Error al cargar metricas");
        }
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, [desde, hasta]);

  return (
    <main className="flex flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur">
        <h1 className="text-xl font-bold text-zinc-900">Métricas</h1>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="desde">Desde</Label>
            <Input
              id="desde"
              type="date"
              value={desde}
              max={hasta || undefined}
              onChange={(e) => setDesde(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="hasta">Hasta</Label>
            <Input
              id="hasta"
              type="date"
              value={hasta}
              min={desde || undefined}
              onChange={(e) => setHasta(e.target.value)}
            />
          </div>
        </div>
        {rangoInvalido && (
          <p className="mt-1 text-xs text-amber-600">
            La fecha &quot;Desde&quot; no puede ser mayor que &quot;Hasta&quot;.
          </p>
        )}
      </header>

      <div className="space-y-4 px-4 py-4">
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {cargando || !metricas ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-7 w-7 animate-spin text-emerald-600" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <MetricaCard
                titulo="Entregadas"
                valor={metricas.totalEntregadas}
                detalle="en el rango"
                icono={CalendarCheck2}
                acento="emerald"
              />
              <MetricaCard
                titulo="Reprogramadas"
                valor={metricas.totalReprogramados}
                detalle="al menos 1 vez"
                icono={History}
                acento="amber"
              />
              <MetricaCard
                titulo="Calidad media"
                valor={
                  metricas.promedioEstrellas > 0
                    ? metricas.promedioEstrellas.toFixed(1)
                    : "-"
                }
                detalle="de 5 estrellas"
                icono={Star}
                acento="blue"
              />
            </div>

            <EstrellasChart distribucion={metricas.distribucionEstrellas} />
          </>
        )}
      </div>
    </main>
  );
}

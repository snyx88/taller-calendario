import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DistribucionEstrellas } from "@/lib/entregas/queries";

export function EstrellasChart({
  distribucion,
}: {
  distribucion: DistribucionEstrellas;
}) {
  const niveles = [5, 4, 3, 2, 1] as const;
  const total = niveles.reduce((acc, n) => acc + distribucion[n], 0);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-zinc-700">
        Distribución de calidad
      </h3>

      {total === 0 ? (
        <p className="mt-3 text-sm text-zinc-400">
          Aún no hay entregas calificadas en el rango.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {niveles.map((n) => {
            const cantidad = distribucion[n];
            const porcentaje = total > 0 ? (cantidad / total) * 100 : 0;
            return (
              <li key={n} className="flex items-center gap-2">
                <span className="flex w-10 shrink-0 items-center gap-0.5 text-sm font-medium text-zinc-600">
                  {n}
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                </span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-zinc-100">
                  <div
                    className={cn("h-full rounded-full bg-amber-400")}
                    style={{ width: `${porcentaje}%` }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right text-sm font-medium text-zinc-700">
                  {cantidad}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

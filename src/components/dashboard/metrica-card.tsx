import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  titulo: string;
  valor: string | number;
  detalle?: string;
  icono: LucideIcon;
  acento?: "emerald" | "amber" | "blue";
};

const acentos = {
  emerald: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  blue: "bg-blue-100 text-blue-700",
};

export function MetricaCard({
  titulo,
  valor,
  detalle,
  icono: Icono,
  acento = "emerald",
}: Props) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-500">{titulo}</span>
        <span className={cn("rounded-lg p-1.5", acentos[acento])}>
          <Icono className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-2 text-3xl font-bold text-zinc-900">{valor}</p>
      {detalle && <p className="mt-1 text-xs text-zinc-400">{detalle}</p>}
    </div>
  );
}

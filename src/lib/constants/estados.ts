import {
  CheckCircle2,
  Clock,
  PackageCheck,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { ESTADOS, type EstadoEntrega } from "@/types/entrega";

export type EstadoConfig = {
  valor: EstadoEntrega;
  label: string;
  badge: string;
  punto: string;
  icono: LucideIcon;
};

export const ESTADOS_CONFIG: Record<EstadoEntrega, EstadoConfig> = {
  "en taller": {
    valor: "en taller",
    label: "En taller",
    badge: "bg-amber-100 text-amber-800",
    punto: "bg-amber-500",
    icono: Clock,
  },
  listo: {
    valor: "listo",
    label: "Listo",
    badge: "bg-blue-100 text-blue-800",
    punto: "bg-blue-500",
    icono: PackageCheck,
  },
  entregado: {
    valor: "entregado",
    label: "Entregado",
    badge: "bg-emerald-100 text-emerald-800",
    punto: "bg-emerald-500",
    icono: CheckCircle2,
  },
  cancelado: {
    valor: "cancelado",
    label: "Cancelado",
    badge: "bg-zinc-200 text-zinc-700",
    punto: "bg-zinc-400",
    icono: XCircle,
  },
};

export const ESTADOS_ORDEN: EstadoEntrega[] = [...ESTADOS];

export function getEstadoConfig(estado: EstadoEntrega | null | undefined): EstadoConfig {
  return ESTADOS_CONFIG[estado ?? "en taller"] ?? ESTADOS_CONFIG["en taller"];
}

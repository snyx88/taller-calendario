import { Badge } from "@/components/ui/badge";
import { getEstadoConfig } from "@/lib/constants/estados";
import { cn } from "@/lib/utils";
import type { EstadoEntrega } from "@/types/entrega";

export function EstadoBadge({
  estado,
  className,
}: {
  estado: EstadoEntrega | null;
  className?: string;
}) {
  const config = getEstadoConfig(estado);
  const Icono = config.icono;
  return (
    <Badge className={cn(config.badge, className)}>
      <Icono className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
}

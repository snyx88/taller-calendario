import { ResumenManana } from "@/components/dashboard/resumen-manana";
import { CalendarioEntregas } from "@/components/calendario/calendario-entregas";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <ResumenManana />
      <CalendarioEntregas />
    </main>
  );
}

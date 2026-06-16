import { CalendarioEntregas } from "@/components/calendario/calendario-entregas";

export default function Home() {
  return (
    <main className="min-h-full flex-1 bg-zinc-50 py-6 dark:bg-zinc-950">
      <CalendarioEntregas />
    </main>
  );
}

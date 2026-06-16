// Rango horario del taller (ajustable). Genera bloques de 30 minutos.
const HORA_INICIO = 7; // 07:00
const HORA_FIN = 19; // 19:00

export function generarSlots30(): string[] {
  const slots: string[] = [];
  for (let h = HORA_INICIO; h <= HORA_FIN; h++) {
    const hh = String(h).padStart(2, "0");
    slots.push(`${hh}:00`);
    if (h !== HORA_FIN) slots.push(`${hh}:30`);
  }
  return slots;
}

// Normaliza valores de Postgres ("07:30:00") o input ("7:30") a "HH:mm".
export function normalizarHora(hora: string | null | undefined): string {
  if (!hora) return "";
  const [h, m = "00"] = hora.split(":");
  return `${String(Number(h)).padStart(2, "0")}:${m.padStart(2, "0").slice(0, 2)}`;
}

export function formatHora12(hora: string | null | undefined): string {
  const normal = normalizarHora(hora);
  if (!normal) return "";
  const [hStr, mStr] = normal.split(":");
  const h = Number(hStr);
  const periodo = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mStr} ${periodo}`;
}

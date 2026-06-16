export const TIPOS_CLIENTE = ["particular", "renting"] as const;
export type TipoCliente = (typeof TIPOS_CLIENTE)[number];

export const ESTADOS = [
  "en taller",
  "listo",
  "entregado",
  "cancelado",
] as const;
export type EstadoEntrega = (typeof ESTADOS)[number];

export type Entrega = {
  id: string;
  placa: string;
  tipo_cliente: TipoCliente;
  nombre_cliente: string;
  contacto: string | null;
  marca: string | null;
  modelo: string | null;
  color: string | null;
  foto_url: string | null;
  fecha_esperada: string;
  hora_esperada: string | null;
  fecha_final: string | null;
  observaciones: string | null;
  evaluacion_taller: number | null;
  estado: EstadoEntrega;
  reprogramaciones: number;
  created_at: string | null;
};

export type EntregaInsert = {
  placa: string;
  fecha_esperada: string;
  nombre_cliente?: string;
  tipo_cliente?: TipoCliente;
  contacto?: string | null;
  marca?: string | null;
  modelo?: string | null;
  color?: string | null;
  foto_url?: string | null;
  hora_esperada?: string | null;
  fecha_final?: string | null;
  observaciones?: string | null;
  evaluacion_taller?: number | null;
  estado?: EstadoEntrega;
};

export type EntregaUpdate = Partial<EntregaInsert>;

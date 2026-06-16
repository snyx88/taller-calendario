"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TimePicker30 } from "@/components/entregas/time-picker-30";
import { FotoUploader } from "@/components/entregas/foto-uploader";
import { normalizarHora } from "@/lib/constants/horarios";
import { cn } from "@/lib/utils";
import type { Entrega, EntregaInsert, TipoCliente } from "@/types/entrega";

type Props = {
  entrega?: Entrega | null;
  guardando: boolean;
  onSubmit: (payload: EntregaInsert) => void;
  onCancel: () => void;
};

export function EntregaForm({ entrega, guardando, onSubmit, onCancel }: Props) {
  const [placa, setPlaca] = useState(entrega?.placa ?? "");
  const [tipoCliente, setTipoCliente] = useState<TipoCliente>(
    entrega?.tipo_cliente ?? "particular",
  );
  const [nombreCliente, setNombreCliente] = useState(
    entrega?.nombre_cliente ?? "",
  );
  const [contacto, setContacto] = useState(entrega?.contacto ?? "");
  const [marca, setMarca] = useState(entrega?.marca ?? "");
  const [modelo, setModelo] = useState(entrega?.modelo ?? "");
  const [color, setColor] = useState(entrega?.color ?? "");
  const [fechaEsperada, setFechaEsperada] = useState(
    entrega?.fecha_esperada ?? "",
  );
  const [horaEsperada, setHoraEsperada] = useState<string | null>(
    normalizarHora(entrega?.hora_esperada) || null,
  );
  const [observaciones, setObservaciones] = useState(
    entrega?.observaciones ?? "",
  );
  const [fotoUrl, setFotoUrl] = useState<string | null>(
    entrega?.foto_url ?? null,
  );
  const [error, setError] = useState<string | null>(null);

  function manejarEnvio(e: React.FormEvent) {
    e.preventDefault();
    if (!placa.trim() || !nombreCliente.trim() || !fechaEsperada) {
      setError("Placa, cliente y fecha son obligatorios.");
      return;
    }
    setError(null);
    onSubmit({
      placa: placa.trim().toUpperCase(),
      tipo_cliente: tipoCliente,
      nombre_cliente: nombreCliente.trim(),
      contacto: contacto.trim() || null,
      marca: marca.trim() || null,
      modelo: modelo.trim() || null,
      color: color.trim() || null,
      fecha_esperada: fechaEsperada,
      hora_esperada: horaEsperada,
      observaciones: observaciones.trim() || null,
      foto_url: fotoUrl,
    });
  }

  return (
    <form onSubmit={manejarEnvio} className="space-y-5">
      <div>
        <Label>Tipo de cliente</Label>
        <div className="grid grid-cols-2 gap-2">
          {(["particular", "renting"] as TipoCliente[]).map((tipo) => {
            const activo = tipoCliente === tipo;
            const esRenting = tipo === "renting";
            return (
              <button
                key={tipo}
                type="button"
                onClick={() => setTipoCliente(tipo)}
                className={cn(
                  "h-12 rounded-xl border text-sm font-semibold capitalize transition-colors",
                  activo && esRenting && "border-red-600 bg-red-600 text-white",
                  activo &&
                    !esRenting &&
                    "border-emerald-600 bg-emerald-600 text-white",
                  !activo && "border-zinc-200 bg-white text-zinc-700",
                )}
              >
                {tipo}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Label htmlFor="placa">Placa</Label>
        <Input
          id="placa"
          value={placa}
          onChange={(e) => setPlaca(e.target.value)}
          placeholder="ABC123"
          autoCapitalize="characters"
        />
      </div>

      <div>
        <Label htmlFor="cliente">Nombre del cliente</Label>
        <Input
          id="cliente"
          value={nombreCliente}
          onChange={(e) => setNombreCliente(e.target.value)}
          placeholder="Nombre y apellido"
        />
      </div>

      <div>
        <Label htmlFor="contacto">Contacto</Label>
        <Input
          id="contacto"
          value={contacto}
          onChange={(e) => setContacto(e.target.value)}
          placeholder="Telefono"
          inputMode="tel"
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label htmlFor="marca">Marca</Label>
          <Input
            id="marca"
            value={marca}
            onChange={(e) => setMarca(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="modelo">Modelo</Label>
          <Input
            id="modelo"
            value={modelo}
            onChange={(e) => setModelo(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="fecha">Fecha esperada</Label>
        <Input
          id="fecha"
          type="date"
          value={fechaEsperada}
          onChange={(e) => setFechaEsperada(e.target.value)}
        />
      </div>

      <div>
        <Label>Hora esperada</Label>
        <TimePicker30 value={horaEsperada} onChange={setHoraEsperada} />
      </div>

      <div>
        <Label htmlFor="observaciones">Observaciones</Label>
        <Textarea
          id="observaciones"
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          placeholder="Detalles del trabajo, daños, etc."
        />
      </div>

      <div>
        <Label>Foto del vehiculo</Label>
        <FotoUploader value={fotoUrl} onChange={setFotoUrl} placa={placa} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2 pt-1">
        <Button
          type="button"
          variant="subtle"
          size="lg"
          className="flex-1"
          onClick={onCancel}
          disabled={guardando}
        >
          Cancelar
        </Button>
        <Button type="submit" size="lg" className="flex-1" disabled={guardando}>
          {guardando && <Loader2 className="h-5 w-5 animate-spin" />}
          Guardar
        </Button>
      </div>
    </form>
  );
}

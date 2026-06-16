"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { BookUser, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TimePicker30 } from "@/components/entregas/time-picker-30";
import { FotoUploader } from "@/components/entregas/foto-uploader";
import {
  fechaHoy,
  getHorasOcupadas,
  getValoresUnicos,
} from "@/lib/entregas/queries";
import { normalizarHora } from "@/lib/constants/horarios";
import { cn } from "@/lib/utils";
import type { Entrega, EntregaInsert, TipoCliente } from "@/types/entrega";

type Props = {
  entrega?: Entrega | null;
  fechaInicial?: string;
  guardando: boolean;
  onSubmit: (payload: EntregaInsert) => void;
  onCancel: () => void;
};

export function EntregaForm({
  entrega,
  fechaInicial,
  guardando,
  onSubmit,
  onCancel,
}: Props) {
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
    entrega?.fecha_esperada ?? fechaInicial ?? "",
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

  const [horasOcupadas, setHorasOcupadas] = useState<string[]>([]);
  const [marcas, setMarcas] = useState<string[]>([]);
  const [modelos, setModelos] = useState<string[]>([]);
  const [soportaContactos, setSoportaContactos] = useState(false);

  // La API de Contactos solo existe en Android/Chrome sobre HTTPS.
  useEffect(() => {
    setSoportaContactos(
      typeof navigator !== "undefined" &&
        "contacts" in navigator &&
        "ContactsManager" in window,
    );
  }, []);

  async function elegirDeContactos() {
    try {
      const nav = navigator as Navigator & {
        contacts?: {
          select: (
            props: string[],
            opts?: { multiple?: boolean },
          ) => Promise<Array<{ tel?: string[] }>>;
        };
      };
      const seleccion = await nav.contacts?.select(["tel"], {
        multiple: false,
      });
      const tel = seleccion?.[0]?.tel?.[0];
      if (tel) setContacto(tel.replace(/\D/g, "").slice(-9));
    } catch {
      // El usuario cancelo el selector: no hacemos nada.
    }
  }

  // Autocompletado: valores ya usados de marca y modelo.
  useEffect(() => {
    let activo = true;
    getValoresUnicos()
      .then(({ marcas, modelos }) => {
        if (!activo) return;
        setMarcas(marcas);
        setModelos(modelos);
      })
      .catch(() => {});
    return () => {
      activo = false;
    };
  }, []);

  // Horas ya ocupadas por otros autos en la fecha elegida.
  useEffect(() => {
    if (!fechaEsperada) {
      setHorasOcupadas([]);
      return;
    }
    let activo = true;
    getHorasOcupadas(fechaEsperada, entrega?.id)
      .then((horas) => {
        if (activo) setHorasOcupadas(horas);
      })
      .catch(() => {
        if (activo) setHorasOcupadas([]);
      });
    return () => {
      activo = false;
    };
  }, [fechaEsperada, entrega?.id]);

  // Todos los datos de texto se guardan en MAYUSCULAS.
  const mayus =
    (set: (v: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      set(e.target.value.toUpperCase());

  const fechaEnPasado = Boolean(fechaEsperada && fechaEsperada < fechaHoy());

  function manejarEnvio(e: React.FormEvent) {
    e.preventDefault();
    if (!placa.trim() || !fechaEsperada) {
      setError("La placa y la fecha son obligatorias.");
      return;
    }
    if (contacto && contacto.length !== 9) {
      setError("El contacto debe tener 9 dígitos.");
      return;
    }
    setError(null);
    onSubmit({
      placa: placa.trim(),
      tipo_cliente: tipoCliente,
      nombre_cliente: nombreCliente.trim() || "Sin nombre",
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
                  "h-12 rounded-xl border text-sm font-semibold uppercase transition-colors",
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
          onChange={(e) =>
            setPlaca(e.target.value.toUpperCase().replace(/\s/g, ""))
          }
          placeholder="ABC123"
          autoCapitalize="characters"
          className="uppercase"
        />
      </div>

      <div>
        <Label htmlFor="cliente">Nombre del cliente (opcional)</Label>
        <Input
          id="cliente"
          value={nombreCliente}
          onChange={mayus(setNombreCliente)}
          placeholder="NOMBRE Y APELLIDO"
          className="uppercase"
        />
      </div>

      <div>
        <Label htmlFor="contacto">Contacto</Label>
        <div className="flex gap-2">
          <Input
            id="contacto"
            value={contacto}
            onChange={(e) =>
              setContacto(e.target.value.replace(/\D/g, "").slice(0, 9))
            }
            placeholder="987654321"
            inputMode="numeric"
            maxLength={9}
            className="flex-1"
          />
          {soportaContactos && (
            <button
              type="button"
              onClick={elegirDeContactos}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-zinc-200 px-3 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
              aria-label="Elegir de la agenda"
            >
              <BookUser className="h-5 w-5" />
            </button>
          )}
        </div>
        {contacto && contacto.length !== 9 && (
          <p className="mt-1 text-xs text-amber-600">
            El teléfono debe tener 9 dígitos.
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label htmlFor="marca">Marca</Label>
          <Input
            id="marca"
            list="lista-marcas"
            value={marca}
            onChange={mayus(setMarca)}
            className="uppercase"
          />
          <datalist id="lista-marcas">
            {marcas.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </div>
        <div>
          <Label htmlFor="modelo">Modelo</Label>
          <Input
            id="modelo"
            list="lista-modelos"
            value={modelo}
            onChange={mayus(setModelo)}
            className="uppercase"
          />
          <datalist id="lista-modelos">
            {modelos.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </div>
        <div>
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            value={color}
            onChange={mayus(setColor)}
            className="uppercase"
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
        {fechaEsperada && (
          <p className="mt-1 text-xs text-zinc-500">
            {format(parseISO(fechaEsperada), "dd/MM/yy")}
          </p>
        )}
        {fechaEnPasado && (
          <p className="mt-1 text-xs text-amber-600">
            Esta fecha ya pasó. Revisa antes de guardar.
          </p>
        )}
      </div>

      <div>
        <Label>Hora esperada</Label>
        <TimePicker30
          value={horaEsperada}
          onChange={setHoraEsperada}
          horasOcupadas={horasOcupadas}
        />
      </div>

      <div>
        <Label htmlFor="observaciones">Observaciones</Label>
        <Textarea
          id="observaciones"
          value={observaciones}
          onChange={mayus(setObservaciones)}
          placeholder="DETALLES DEL TRABAJO, DAÑOS, ETC."
          className="uppercase"
        />
      </div>

      <div>
        <Label>Foto del vehículo</Label>
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

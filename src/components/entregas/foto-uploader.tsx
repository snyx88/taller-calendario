"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { subirFotoVehiculo } from "@/lib/supabase/storage";

type Props = {
  value: string | null;
  onChange: (url: string | null) => void;
  placa: string;
};

export function FotoUploader({ value, onChange, placa }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function manejarArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendo(true);
    setError(null);
    try {
      const url = await subirFotoVehiculo(file, placa);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir la foto");
    } finally {
      setSubiendo(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={manejarArchivo}
      />

      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-zinc-200">
          <Image
            src={value}
            alt="Foto del vehículo"
            width={400}
            height={300}
            className="h-44 w-full object-cover"
            unoptimized
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute right-2 top-2 rounded-full bg-black/60 p-2 text-white"
            aria-label="Quitar foto"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="lg"
          className="w-full"
          disabled={subiendo}
          onClick={() => inputRef.current?.click()}
        >
          {subiendo ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Camera className="h-5 w-5" />
          )}
          {subiendo ? "Subiendo..." : "Tomar o subir foto"}
        </Button>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

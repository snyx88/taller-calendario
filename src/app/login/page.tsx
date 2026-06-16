"use client";

import { useState } from "react";
import { Loader2, LockKeyhole } from "lucide-react";

const COOKIE_AUTH = "taller_auth";
const SEIS_MESES_SEG = 60 * 60 * 24 * 180;

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [verificando, setVerificando] = useState(false);

  function ingresar(e: React.FormEvent) {
    e.preventDefault();
    const correcto = process.env.NEXT_PUBLIC_PIN_ACCESO;

    if (pin.length > 0 && correcto && pin === correcto) {
      setVerificando(true);
      document.cookie = `${COOKIE_AUTH}=1; path=/; max-age=${SEIS_MESES_SEG}; SameSite=Lax`;
      // Navegación completa para que el proxy lea la cookie recién creada.
      window.location.assign("/");
      return;
    }

    setError(true);
    setPin("");
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 px-6 text-white">
      <div className="flex w-full max-w-xs flex-col items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600/15 text-emerald-400 ring-1 ring-emerald-500/30">
          <LockKeyhole className="h-8 w-8" />
        </div>

        <h1 className="mt-6 text-xl font-bold">Taller de Flor</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Acceso Autorizado — ingresa el código del taller
        </p>

        <form onSubmit={ingresar} className="mt-8 w-full space-y-4">
          <input
            type="password"
            inputMode="numeric"
            autoFocus
            autoComplete="off"
            value={pin}
            onChange={(e) => {
              setError(false);
              setPin(e.target.value.replace(/\D/g, "").slice(0, 12));
            }}
            placeholder="••••"
            aria-label="PIN de acceso"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-center text-2xl tracking-[0.5em] text-white outline-none transition-colors placeholder:tracking-normal placeholder:text-zinc-600 focus:border-emerald-500"
          />

          {error && (
            <p className="text-center text-sm text-red-400">PIN incorrecto.</p>
          )}

          <button
            type="submit"
            disabled={verificando || pin.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-semibold text-white transition-colors hover:bg-emerald-500 active:scale-[0.99] disabled:opacity-50"
          >
            {verificando && <Loader2 className="h-5 w-5 animate-spin" />}
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}

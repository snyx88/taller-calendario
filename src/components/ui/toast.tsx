"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type TipoToast = "exito" | "error" | "info";
type Toast = { id: number; mensaje: string; tipo: TipoToast };
type MostrarToast = (mensaje: string, tipo?: TipoToast) => void;

const ToastContext = createContext<MostrarToast>(() => {});

export function useToast(): MostrarToast {
  return useContext(ToastContext);
}

const estilos: Record<TipoToast, string> = {
  exito: "bg-emerald-600 text-white",
  error: "bg-red-600 text-white",
  info: "bg-zinc-800 text-white",
};

const iconos = {
  exito: CheckCircle2,
  error: XCircle,
  info: Info,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const mostrar = useCallback<MostrarToast>((mensaje, tipo = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, mensaje, tipo }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={mostrar}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-3 z-[60] mx-auto flex max-w-md flex-col items-center gap-2 px-4">
        {toasts.map((toast) => {
          const Icono = iconos[toast.tipo];
          return (
            <div
              key={toast.id}
              className={cn(
                "flex w-full items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg animate-[slideUp_200ms_ease-out]",
                estilos[toast.tipo],
              )}
            >
              <Icono className="h-5 w-5 shrink-0" />
              {toast.mensaje}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type DrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function Drawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: DrawerProps) {
  const [montado, setMontado] = React.useState(false);

  React.useEffect(() => {
    setMontado(true);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = anterior;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onOpenChange]);

  if (!montado || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/40 animate-[fadeIn_150ms_ease-out]"
        onClick={() => onOpenChange(false)}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative z-10 flex max-h-[92vh] w-full max-w-md flex-col rounded-t-2xl bg-white shadow-2xl",
          "animate-[slideUp_200ms_ease-out]",
        )}
      >
        <div className="pt-3">
          <div className="mx-auto h-1.5 w-10 rounded-full bg-zinc-200" />
        </div>
        {(title || description) && (
          <div className="flex items-start justify-between gap-3 border-b border-zinc-100 px-5 pb-3 pt-2">
            <div>
              {title && (
                <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
              )}
              {description && (
                <p className="mt-0.5 text-sm text-zinc-500">{description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="-mr-1 rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <div className="border-t border-zinc-100 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

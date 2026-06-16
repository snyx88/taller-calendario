"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-7 w-7",
  lg: "h-10 w-10",
};

export function RatingStars({ value, onChange, size = "md", className }: Props) {
  const editable = typeof onChange === "function";
  const estrellas = [1, 2, 3, 4, 5];

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {estrellas.map((n) => {
        const activa = n <= value;
        const estrella = (
          <Star
            className={cn(
              sizeMap[size],
              activa ? "fill-amber-400 text-amber-400" : "text-zinc-300",
            )}
          />
        );

        if (!editable) {
          return <span key={n}>{estrella}</span>;
        }

        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange?.(n)}
            className="rounded-full p-1 transition-transform active:scale-90"
            aria-label={`${n} estrella${n === 1 ? "" : "s"}`}
          >
            {estrella}
          </button>
        );
      })}
    </div>
  );
}

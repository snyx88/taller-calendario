import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "outline" | "ghost" | "danger" | "subtle";
type Size = "default" | "lg" | "sm" | "icon";

const variantClasses: Record<Variant, string> = {
  default: "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800",
  outline:
    "border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50 active:bg-zinc-100",
  ghost: "text-zinc-700 hover:bg-zinc-100 active:bg-zinc-200",
  danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
  subtle: "bg-zinc-100 text-zinc-800 hover:bg-zinc-200 active:bg-zinc-300",
};

const sizeClasses: Record<Size, string> = {
  default: "h-11 px-4 text-sm",
  lg: "h-14 px-6 text-base",
  sm: "h-9 px-3 text-sm",
  icon: "h-11 w-11",
};

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", type, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type ?? "button"}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:pointer-events-none disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

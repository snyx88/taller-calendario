"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: "Agenda", icon: CalendarDays },
  { href: "/metricas", label: "Métricas", icon: BarChart3 },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t border-zinc-200 bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <ul className="grid grid-cols-2">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const activo =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors",
                  activo ? "text-emerald-600" : "text-zinc-500",
                )}
              >
                <Icon className="h-6 w-6" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

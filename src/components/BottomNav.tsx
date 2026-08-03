"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  CalendarDays,
  TrendingUp,
  ListOrdered,
  Users,
  FlaskConical,
  BookOpen,
} from "lucide-react";

const items = [
  { href: "/", label: "Overblik", icon: LayoutGrid },
  { href: "/naeste-runde", label: "Næste runde", icon: CalendarDays },
  { href: "/prognose", label: "Prognose", icon: TrendingUp },
  { href: "/program", label: "Program", icon: ListOrdered },
  { href: "/hold", label: "Hold", icon: Users },
  { href: "/simulator", label: "Simulator", icon: FlaskConical },
  { href: "/metoden", label: "Metoden", icon: BookOpen },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Hovedmenu"
      className="fixed bottom-0 left-0 right-0 z-40 bg-elp-surface border-t border-white/10 overflow-x-auto"
    >
      <ul className="flex min-w-max sm:min-w-0 sm:justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`focus-ring flex flex-col items-center justify-center gap-1 min-h-touch min-w-touch px-3 py-2 text-xs whitespace-nowrap ${
                  active ? "text-elp-green" : "text-elp-muted"
                }`}
              >
                <Icon size={20} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

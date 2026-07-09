"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { href: string; label: string; soon?: boolean };

export default function Sidebar({
  role,
  items,
}: {
  role: string;
  items: NavItem[];
}) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-surface md:block">
      <Link
        href="/"
        className="flex items-center gap-2 border-b-2 border-accent px-4 py-3.5"
      >
        <span className="inline-block h-5 w-1.5 bg-accent" aria-hidden />
        <span className="flex flex-col leading-tight">
          <span className="text-sm font-semibold">UT Manager</span>
          <span className="text-xs text-muted">{role}</span>
        </span>
      </Link>

      <nav className="p-2">
        {items.map((it) => {
          const active =
            pathname === it.href ||
            (it.href !== "/" && pathname.startsWith(it.href + "/"));
          if (it.soon) {
            return (
              <span
                key={it.href}
                className="flex items-center justify-between border-l-2 border-transparent px-3 py-2 text-sm text-muted/60"
              >
                {it.label}
                <span className="border border-border px-1 text-[10px]">近日</span>
              </span>
            );
          }
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`block border-l-2 px-3 py-2 text-sm transition-colors ${
                active
                  ? "border-accent bg-accent/10 font-medium text-accent"
                  : "border-transparent text-foreground hover:bg-background"
              }`}
            >
              {it.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export type NavItem = { href: string; label: string; soon?: boolean };

export default function Sidebar({
  role,
  items,
  userLabel,
}: {
  role: string;
  items: NavItem[];
  userLabel?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/session", { method: "DELETE" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <aside className="hidden w-60 shrink-0 flex-col bg-sidebar-bg text-sidebar-fg md:flex">
      <Link
        href="/"
        className="flex items-center gap-2 border-b border-white/15 px-4 py-3.5"
      >
        <span className="inline-block h-5 w-1.5 bg-white" aria-hidden />
        <span className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-sidebar-fg-strong">
            UT Manager
          </span>
          <span className="text-xs text-sidebar-fg/70">{role}</span>
        </span>
      </Link>

      <nav className="flex-1 p-2">
        {items.map((it) => {
          const active =
            pathname === it.href ||
            (it.href !== "/" && pathname.startsWith(it.href + "/"));
          if (it.soon) {
            return (
              <span
                key={it.href}
                className="flex items-center justify-between border-l-2 border-transparent px-3 py-2 text-sm text-sidebar-fg/40"
              >
                {it.label}
                <span className="border border-white/20 px-1 text-[10px]">近日</span>
              </span>
            );
          }
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`block border-l-2 px-3 py-2 text-sm transition-colors ${
                active
                  ? "border-white bg-white/15 font-medium text-sidebar-fg-strong"
                  : "border-transparent hover:bg-white/10 hover:text-sidebar-fg-strong"
              }`}
            >
              {it.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/15 p-3">
        {userLabel && (
          <p className="truncate px-1 pb-2 text-xs text-sidebar-fg/70">
            {userLabel}
          </p>
        )}
        <button
          type="button"
          onClick={logout}
          className="w-full border border-white/25 px-3 py-2 text-left text-sm transition-colors hover:bg-white/10"
        >
          ログアウト
        </button>
      </div>
    </aside>
  );
}

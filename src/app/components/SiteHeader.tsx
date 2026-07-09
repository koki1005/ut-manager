import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-block h-4 w-1.5 rounded-sm bg-accent" aria-hidden />
          <span>UT Manager</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/manager"
            className="rounded-md px-3 py-1.5 text-muted hover:bg-background hover:text-foreground"
          >
            マネージャー
          </Link>
          <Link
            href="/member"
            className="rounded-md px-3 py-1.5 text-muted hover:bg-background hover:text-foreground"
          >
            メンバー
          </Link>
        </nav>
      </div>
    </header>
  );
}

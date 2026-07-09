import Link from "next/link";

export default function Topbar({
  title,
  switchHref,
  switchLabel,
}: {
  title: string;
  switchHref: string;
  switchLabel: string;
}) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-background px-6 py-3">
      <h1 className="text-sm font-semibold">{title}</h1>
      <nav className="flex items-center gap-2 text-sm">
        <Link
          href={switchHref}
          className="border border-border px-3 py-1.5 text-muted hover:border-accent hover:text-accent"
        >
          {switchLabel}
        </Link>
      </nav>
    </header>
  );
}

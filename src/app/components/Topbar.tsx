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
    <header className="flex items-center justify-between bg-accent px-6 py-3 text-accent-fg">
      <h1 className="flex items-center gap-2 text-sm font-semibold">
        <span className="inline-block h-4 w-1 bg-white/80" aria-hidden />
        {title}
      </h1>
      <nav className="flex items-center gap-2 text-sm">
        <Link
          href={switchHref}
          className="border border-white/40 px-3 py-1.5 text-accent-fg transition-colors hover:bg-white/15"
        >
          {switchLabel}
        </Link>
      </nav>
    </header>
  );
}

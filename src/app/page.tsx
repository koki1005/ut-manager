import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="flex items-center gap-2 border-b-2 border-accent px-6 py-3.5">
        <span className="inline-block h-5 w-1.5 bg-accent" aria-hidden />
        <span className="text-sm font-semibold">UT Manager</span>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-sm font-medium text-accent">
          DevOps × AI Agent Hackathon 2026
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">
          コードを書く<span className="text-accent">プロセス</span>から、
          <br className="hidden sm:block" />
          エンジニアの本当の実力を見抜く。
        </h1>
        <p className="mt-4 max-w-2xl text-muted">
          成果物は嘘をつける。プロセスは嘘をつけない。書く過程と「なぜこうした?」への回答から、
          理解度・効率・信頼性を測り、実力調査から継続的なプロジェクト運用までを回す。
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link
            href="/manager"
            className="border border-border bg-surface p-6 transition-colors hover:border-accent"
          >
            <h2 className="font-semibold text-accent">マネージャー →</h2>
            <p className="mt-1 text-sm text-muted">
              評価一覧・実力調査・プロジェクトマネジメントの3画面。
            </p>
          </Link>
          <Link
            href="/member"
            className="border border-border bg-surface p-6 transition-colors hover:border-accent"
          >
            <h2 className="font-semibold text-accent">メンバー →</h2>
            <p className="mt-1 text-sm text-muted">
              テストを受け、AIメンターと壁打ちし、割り振られた仕事を進める。
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

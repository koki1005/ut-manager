import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <p className="text-sm font-medium text-accent">DevOps × AI Agent Hackathon 2026</p>
      <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">
        コードを書く<span className="text-accent">プロセス</span>から、
        <br className="hidden sm:block" />
        エンジニアの本当の実力を見抜く。
      </h1>
      <p className="mt-4 max-w-2xl text-muted">
        成果物は嘘をつける。プロセスは嘘をつけない。打鍵・ペースト・手戻り・停止と「なぜこうした?」への回答から、
        実力を2軸（自力度×習熟度）で測り、Dreyfus 5段階で提示。マネージャーの人員配置を支えます。
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link
          href="/manager"
          className="rounded-lg border border-border bg-surface p-6 transition-colors hover:border-accent"
        >
          <h2 className="font-semibold">マネージャー画面 →</h2>
          <p className="mt-1 text-sm text-muted">
            お題を設定し、メンバーの実力・自力度・割り当て提案を見る。
          </p>
        </Link>
        <Link
          href="/member"
          className="rounded-lg border border-border bg-surface p-6 transition-colors hover:border-accent"
        >
          <h2 className="font-semibold">メンバー画面 →</h2>
          <p className="mt-1 text-sm text-muted">
            エディタでお題を解く。書くプロセスがそのまま実力の証拠になる。
          </p>
        </Link>
      </div>
    </div>
  );
}

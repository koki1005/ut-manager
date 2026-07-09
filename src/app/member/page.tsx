import Link from "next/link";
import Topbar from "../components/Topbar";

const MENU = [
  {
    href: "/member/test",
    title: "テストを受ける",
    desc: "発表されたお題をエディタで解く。テストモードではプロセスは表示されない。",
  },
  {
    href: "/member/mentor",
    title: "AIメンター",
    desc: "テスト後の壁打ち・深掘り。理解度と手を動かす効率のスコアが返る。",
  },
  {
    href: "/member/project",
    title: "プロジェクト",
    desc: "割り振られた仕事を進めて提出する。（フェーズ2）",
  },
];

export default function MemberTopPage() {
  return (
    <>
      <Topbar title="メンバー トップ" switchHref="/manager" switchLabel="マネージャー画面へ" />
      <div className="p-6">
        <div className="mb-4 border-l-2 border-accent pl-3">
          <h2 className="font-semibold">こんにちは</h2>
          <p className="text-sm text-muted">今日やることを選ぶ。</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {MENU.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="border border-border bg-surface p-5 transition-colors hover:border-accent"
            >
              <h3 className="font-semibold text-accent">{m.title} →</h3>
              <p className="mt-1 text-sm text-muted">{m.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

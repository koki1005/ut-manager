import Topbar from "../components/Topbar";

type Member = {
  name: string;
  comprehension: number; // 理解度（地力度）
  efficiency: number; // 手を動かす効率（素早さ）
  trust: number; // 信頼性（自力度）
};

// モックデータ（実データは #7 スコア算出 / #21 出し分けで接続）
const MEMBERS: Member[] = [
  { name: "佐藤", comprehension: 88, efficiency: 72, trust: 91 },
  { name: "田中", comprehension: 63, efficiency: 84, trust: 42 },
  { name: "鈴木", comprehension: 45, efficiency: 55, trust: 76 },
];

function rank(score: number): string {
  if (score >= 85) return "S";
  if (score >= 70) return "A";
  if (score >= 50) return "B";
  return "C";
}

function Bar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 bg-border">
        <div className="h-full bg-accent" style={{ width: `${value}%` }} />
      </div>
      <span className="font-mono text-xs">{value}</span>
    </div>
  );
}

export default function ManagerEvaluationPage() {
  return (
    <>
      <Topbar title="メンバー一覧の評価" switchHref="/member" switchLabel="メンバー画面へ" />
      <div className="p-6">
        <div className="mb-4 border-l-2 border-accent pl-3">
          <h2 className="font-semibold">評価一覧</h2>
          <p className="text-sm text-muted">
            実力調査の結果。行をクリックでメンバー詳細（近日）。
          </p>
        </div>

        <div className="border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface text-left text-muted">
              <tr>
                <th className="px-4 py-2.5 font-medium">メンバー</th>
                <th className="px-4 py-2.5 font-medium">総合</th>
                <th className="px-4 py-2.5 font-medium">理解度</th>
                <th className="px-4 py-2.5 font-medium">効率</th>
                <th className="px-4 py-2.5 font-medium">信頼性</th>
                <th className="px-4 py-2.5" aria-label="詳細" />
              </tr>
            </thead>
            <tbody>
              {MEMBERS.map((m) => (
                <tr
                  key={m.name}
                  title="詳細ページは近日"
                  className="cursor-pointer border-b border-border last:border-b-0 hover:bg-surface"
                >
                  <td className="px-4 py-3 font-medium">{m.name}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block border border-accent bg-accent/10 px-2 py-0.5 font-mono text-xs font-semibold text-accent">
                      {rank(m.comprehension)}
                    </span>
                  </td>
                  <td className="px-4 py-3"><Bar value={m.comprehension} /></td>
                  <td className="px-4 py-3"><Bar value={m.efficiency} /></td>
                  <td className="px-4 py-3"><Bar value={m.trust} /></td>
                  <td className="px-4 py-3 text-right text-muted">→</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-muted">
          総合ランクは理解度（地力度）を基準に算出。信頼性が低い列は「スコアは出たが鵜呑み注意」の目印。
        </p>
      </div>
    </>
  );
}

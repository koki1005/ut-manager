import Topbar from "../../components/Topbar";

const ASSIGN = [
  { name: "佐藤", rank: "S", task: "コア設計・難所の実装", load: "40%" },
  { name: "田中", rank: "A", task: "機能実装（レビュー必須）", load: "35%" },
  { name: "鈴木", rank: "B", task: "テスト・ドキュメント", load: "25%" },
];

export default function ProjectPage() {
  return (
    <>
      <Topbar title="プロジェクトマネジメント" switchHref="/member" switchLabel="メンバー画面へ" />
      <div className="p-6">
        <div className="mb-4 flex items-center gap-2 border-l-2 border-accent pl-3">
          <div>
            <h2 className="font-semibold">プロジェクト遂行</h2>
            <p className="text-sm text-muted">
              プロジェクトを投げると、AIがスコアを基に作業を割り当てて壁打ちする。
            </p>
          </div>
          <span className="ml-auto border border-accent px-2 py-0.5 text-xs text-accent">
            フェーズ2
          </span>
        </div>

        <div className="border border-border bg-surface p-5">
          <label className="block">
            <span className="text-sm font-medium">プロジェクト要件（要件定義済みでも可）</span>
            <textarea
              rows={3}
              placeholder="例：ログ監視ダッシュボードを2週間で。認証・可視化・アラートの3機能。"
              className="mt-1 w-full border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
          <div className="mt-3">
            <button className="bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:opacity-90">
              AIに割り当てさせる
            </button>
          </div>
        </div>

        <div className="mt-5 border border-border">
          <div className="border-b-2 border-accent px-4 py-2 text-sm font-semibold">
            割り振り提案
          </div>
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface text-left text-muted">
              <tr>
                <th className="px-4 py-2 font-medium">メンバー</th>
                <th className="px-4 py-2 font-medium">総合</th>
                <th className="px-4 py-2 font-medium">担当</th>
                <th className="px-4 py-2 font-medium">作業量</th>
              </tr>
            </thead>
            <tbody>
              {ASSIGN.map((a) => (
                <tr key={a.name} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3 font-medium">{a.name}</td>
                  <td className="px-4 py-3">
                    <span className="border border-accent bg-accent/10 px-2 py-0.5 font-mono text-xs text-accent">
                      {a.rank}
                    </span>
                  </td>
                  <td className="px-4 py-3">{a.task}</td>
                  <td className="px-4 py-3 font-mono">{a.load}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-muted">
          遂行中はAIが制作過程を常時監視し、バグ・行き詰まりを早期発見。手直し申請や余った作業の再分配で完成へ。（#22 #24）
        </p>
      </div>
    </>
  );
}

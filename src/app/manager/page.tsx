type Member = {
  name: string;
  level: string;
  authorship: number; // 自力度 %
  note: string;
  caution?: boolean;
};

// モックデータ（実データは issue #7 スコア算出 / #9 で接続）
const MEMBERS: Member[] = [
  { name: "佐藤", level: "中堅", authorship: 88, note: "信頼できる" },
  { name: "田中", level: "一人前", authorship: 42, note: "貼り多い", caution: true },
  { name: "鈴木", level: "上級初心者", authorship: 75, note: "検索依存" },
];

export default function ManagerPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3">
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold" htmlFor="task">
            お題設定
          </label>
          <select
            id="task"
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
            defaultValue="error-rate"
          >
            <option value="error-rate">直近N分のエラー率を返す関数</option>
            <option value="word-count">最頻出の単語を返す関数</option>
          </select>
        </div>
        <button className="rounded-md border border-border px-3 py-1.5 text-sm hover:border-accent">
          編集
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-muted">
            <tr>
              <th className="px-4 py-2 font-medium">メンバー</th>
              <th className="px-4 py-2 font-medium">実力（Dreyfus）</th>
              <th className="px-4 py-2 font-medium">自力度</th>
              <th className="px-4 py-2 font-medium">ひとこと</th>
            </tr>
          </thead>
          <tbody>
            {MEMBERS.map((m) => (
              <tr key={m.name} className="border-t border-border">
                <td className="px-4 py-2.5 font-medium">{m.name}</td>
                <td className="px-4 py-2.5">
                  {m.level}
                  {m.caution && (
                    <span className="ml-2 rounded bg-accent/10 px-1.5 py-0.5 text-xs text-accent">
                      要確認
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5 font-mono">{m.authorship}%</td>
                <td className="px-4 py-2.5 text-muted">{m.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-lg border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold">割り当て提案</h2>
        <p className="mt-1 text-sm text-muted">
          佐藤に難タスク、田中は自力度が低く要面談、鈴木は検索依存の傾向。（ロジックは issue #10）
        </p>
      </div>
    </div>
  );
}

import Topbar from "../components/Topbar";
import { dreyfus, reliabilityNote } from "@/lib/score";
import { listScoredAssessments } from "@/lib/assessments";

type Member = {
  name: string;
  comprehension: number; // 理解度（地力度）
  efficiency: number; // 手を動かす効率（素早さ）
  trust: number; // 信頼性（自力度）
  comment: string; // ひとこと（傾向）
  real?: boolean; // 実測（テスト→メンターの結果）か、デモ用モックか
};

// デモ用モック（実測が無くても一覧の見た目を保つ土台）
const MOCK_MEMBERS: Member[] = [
  { name: "佐藤", comprehension: 88, efficiency: 72, trust: 91, comment: "自力で深く理解。難タスク向き。" },
  { name: "田中", comprehension: 63, efficiency: 84, trust: 42, comment: "速いが貼り多い。要面談。" },
  { name: "鈴木", comprehension: 45, efficiency: 55, trust: 76, comment: "検索依存ぎみ。基礎の補強を。" },
];

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

export default async function ManagerEvaluationPage() {
  // 採点済みの実測メンバーを全ユーザー分（Firestore）読み、モックの前に並べる。
  const scored = await listScoredAssessments();
  const real: Member[] = scored.map((a) => ({
    name: a.displayName,
    comprehension: a.score!.understanding,
    efficiency: a.score!.efficiency,
    trust: a.score!.reliability,
    comment: a.score!.comment,
    real: true,
  }));
  const members: Member[] = [...real, ...MOCK_MEMBERS];

  return (
    <>
      <Topbar title="メンバー一覧の評価" switchHref="/member" switchLabel="メンバー画面へ" />
      <div className="p-6">
        <div className="mb-4 border-l-2 border-accent pl-3">
          <h2 className="font-semibold">評価一覧</h2>
          <p className="text-sm text-muted">
            実力調査の結果。実測行はテスト→メンターの壁打ちから算出（他はデモ）。
          </p>
        </div>

        <div className="border border-border">
          <table className="w-full text-sm">
            <thead className="border-b-2 border-accent bg-header-tint text-left text-muted">
              <tr>
                <th className="px-4 py-2.5 font-medium">メンバー</th>
                <th className="px-4 py-2.5 font-medium">実力（Dreyfus）</th>
                <th className="px-4 py-2.5 font-medium">理解度</th>
                <th className="px-4 py-2.5 font-medium">効率</th>
                <th className="px-4 py-2.5 font-medium">信頼性</th>
                <th className="px-4 py-2.5 font-medium">ひとこと</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => {
                const note = reliabilityNote(m.trust);
                return (
                  <tr
                    key={`${m.name}-${i}`}
                    className="border-b border-border last:border-b-0 hover:bg-surface"
                  >
                    <td className="px-4 py-3 font-medium">
                      {m.name}
                      {m.real && (
                        <span className="ml-2 border border-accent px-1.5 py-0.5 text-[10px] font-normal text-accent">
                          実測
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block border border-accent bg-accent/10 px-2 py-0.5 font-mono text-xs font-semibold text-accent">
                        {dreyfus(m.comprehension)}
                        {note && `（${note}）`}
                      </span>
                    </td>
                    <td className="px-4 py-3"><Bar value={m.comprehension} /></td>
                    <td className="px-4 py-3"><Bar value={m.efficiency} /></td>
                    <td className="px-4 py-3"><Bar value={m.trust} /></td>
                    <td className="px-4 py-3 text-muted">{m.comment}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-muted">
          実力は理解度（地力度）を Dreyfus 5段階に変換。信頼性が低い行は「（要確認）＝スコアは出たが鵜呑み注意」。
        </p>
      </div>
    </>
  );
}

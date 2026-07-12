"use client";

import { useEffect, useState } from "react";
import Topbar from "../../components/Topbar";
import { dreyfus, type Score } from "@/lib/score";

type RosterMember = {
  name: string;
  understanding: number;
  efficiency: number;
  reliability: number;
};
type Assignment = { name: string; task: string; load: number; reason: string };

// 実力調査のデモ土台（実測があれば先頭に足す）
const MOCK_ROSTER: RosterMember[] = [
  { name: "佐藤", understanding: 88, efficiency: 72, reliability: 91 },
  { name: "田中", understanding: 63, efficiency: 84, reliability: 42 },
  { name: "鈴木", understanding: 45, efficiency: 55, reliability: 76 },
];

export default function ProjectPage() {
  const [project, setProject] = useState("");
  const [roster, setRoster] = useState<RosterMember[]>(MOCK_ROSTER);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [fallback, setFallback] = useState(false);

  // 直近の実力調査結果を実測メンバーとして先頭に加える
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("ut_score");
      if (!stored) return;
      const s = JSON.parse(stored) as Score;
      setRoster([
        {
          name: "テスト受験者",
          understanding: s.understanding,
          efficiency: s.efficiency,
          reliability: s.reliability,
        },
        ...MOCK_ROSTER,
      ]);
    } catch {
      /* モックのまま */
    }
  }, []);

  async function assign() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project, roster }),
      });
      const data = await res.json();
      const list: Assignment[] = data.assignments ?? [];
      setAssignments(list);
      setFallback(Boolean(data.fallback));
      try {
        sessionStorage.setItem("ut_assignment", JSON.stringify(list));
      } catch {
        /* 保存失敗は無視 */
      }
    } catch {
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Topbar title="プロジェクトマネジメント" switchHref="/member" switchLabel="メンバー画面へ" />
      <div className="p-6">
        <div className="mb-4 flex items-center gap-2 border-l-2 border-accent pl-3">
          <div>
            <h2 className="font-semibold">プロジェクト遂行</h2>
            <p className="text-sm text-muted">
              プロジェクトを投げると、AIが実力調査スコアを基に作業を割り当てて壁打ちする。
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
              value={project}
              onChange={(e) => setProject(e.target.value)}
              placeholder="例：ログ監視ダッシュボードを2週間で。認証・可視化・アラートの3機能。"
              className="mt-1 w-full border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
          <div className="mt-3">
            <button
              onClick={assign}
              disabled={loading}
              className="bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "AIが割り当て中…" : "AIに割り当てさせる"}
            </button>
          </div>
        </div>

        {assignments.length > 0 && (
          <div className="mt-5 border border-border">
            <div className="border-b-2 border-accent px-4 py-2 text-sm font-semibold">
              割り振り提案
              {fallback && (
                <span className="ml-2 font-normal text-muted">（暫定 / キー未設定）</span>
              )}
            </div>
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-header-tint text-left text-muted">
                <tr>
                  <th className="px-4 py-2 font-medium">メンバー</th>
                  <th className="px-4 py-2 font-medium">実力</th>
                  <th className="px-4 py-2 font-medium">担当</th>
                  <th className="px-4 py-2 font-medium">作業量</th>
                  <th className="px-4 py-2 font-medium">理由</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => {
                  const m = roster.find((r) => r.name === a.name);
                  return (
                    <tr key={a.name} className="border-b border-border last:border-b-0 align-top">
                      <td className="px-4 py-3 font-medium">{a.name}</td>
                      <td className="px-4 py-3">
                        <span className="border border-accent bg-accent/10 px-2 py-0.5 font-mono text-xs text-accent">
                          {m ? dreyfus(m.understanding) : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">{a.task}</td>
                      <td className="px-4 py-3 font-mono">{a.load}%</td>
                      <td className="px-4 py-3 text-muted">{a.reason}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-3 text-xs text-muted">
          遂行中はAIが制作過程を常時監視し、バグ・行き詰まりを早期発見。手直し申請や余った作業の再分配で完成へ。
        </p>
      </div>
    </>
  );
}

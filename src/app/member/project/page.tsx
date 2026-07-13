"use client";

import { useEffect, useState } from "react";
import Topbar from "../../components/Topbar";

type Assignment = { name: string; task: string; load: number; reason: string };

export default function MemberProjectPage() {
  const [mine, setMine] = useState<Assignment | null>(null);
  const [working, setWorking] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // マネージャーがAIに割り当てさせた結果（Firestore）から、自分の担当を読む
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/assignment");
        if (!r.ok) return;
        const d = await r.json();
        const list: Assignment[] = d.batch?.items ?? [];
        if (!list.length) return;
        const me =
          (d.me && list.find((a) => a.name === d.me)) ?? list[0] ?? null;
        setMine(me);
      } catch {
        /* 未割り当て */
      }
    })();
  }, []);

  return (
    <>
      <Topbar title="プロジェクト" switchHref="/manager" switchLabel="マネージャー画面へ" />
      <div className="p-6">
        <div className="mb-4 flex items-center gap-2 border-l-2 border-accent pl-3">
          <div>
            <h2 className="font-semibold">割り振られた仕事</h2>
            <p className="text-sm text-muted">
              進めて提出する。作業中はAIが過程を見守る。
            </p>
          </div>
          <span className="ml-auto border border-accent px-2 py-0.5 text-xs text-accent">
            フェーズ2
          </span>
        </div>

        {mine ? (
          <div className="border border-border bg-surface p-5">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted">担当タスク（作業量 {mine.load}%）</div>
              {working && !submitted && (
                <span className="flex items-center gap-1.5 border border-accent px-2 py-0.5 text-[11px] text-accent">
                  <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                  AIが監視中
                </span>
              )}
            </div>
            <div className="mt-1 font-semibold">{mine.task}</div>
            <p className="mt-2 text-sm text-muted">{mine.reason}</p>
            <p className="mt-2 text-sm text-muted">
              期限内でコード／資料／設計を進めて提出。まるまるAIに任せたか、自力でみっちりやったかも評価対象。
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setWorking(true)}
                disabled={working}
                className="border border-border px-4 py-2 text-sm hover:border-accent disabled:opacity-50"
              >
                {working ? "作業中…" : "作業を始める"}
              </button>
              <button
                onClick={() => setSubmitted(true)}
                disabled={!working || submitted}
                className="bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:opacity-90 disabled:opacity-50"
              >
                提出
              </button>
            </div>
            {submitted && (
              <p className="mt-3 border-t border-border pt-3 text-sm text-accent">
                提出完了。制作過程の評価とバグ・行き詰まりの所見をマネージャーへ送信した。
              </p>
            )}
          </div>
        ) : (
          <div className="border border-border bg-surface p-5 text-sm text-muted">
            まだ割り当てがない。マネージャーが「プロジェクトマネジメント」で AI に割り当てさせると、ここに担当が表示される。
          </div>
        )}

        <p className="mt-3 text-xs text-muted">
          遂行中はAIが制作過程を常時監視し、バグ・行き詰まりを早期発見。手直し申請・再分配で完成へ。
        </p>
      </div>
    </>
  );
}

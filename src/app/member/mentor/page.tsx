"use client";

import { useEffect, useRef, useState } from "react";
import Topbar from "../../components/Topbar";
import type { Score } from "@/lib/score";

type Msg = { role: "ai" | "me"; text: string };

const OPENING =
  "提出お疲れさま。なぜ配列を一度の走査で処理する形にした? 別の方法も考えた?";
// キー未設定時のモック追撃（フォールバック用）
const MOCK_FOLLOWUPS = [
  "なるほど。ではログが0件のとき、その実装はどう振る舞う?",
  "計算量とのトレードオフはどう考えた? 可読性を優先した場面は?",
  "その判断が崩れるとしたら、どんな入力のとき?",
];

// 直近テストの文脈（test画面から sessionStorage で引き継ぐ。無ければこのデモ値）
const DEMO_CONTEXT = {
  task: "時系列ログ配列から直近N分間のエラー率を返す関数 errorRate(logs, now, minutes) を実装せよ。",
  code: "function errorRate(logs, now, minutes){ const from = now - minutes*60000; const recent = logs.filter(l => l.time >= from); if(recent.length === 0) return 0; return recent.filter(l => l.level === 'error').length / recent.length; }",
  signals: { keystrokes: 0, pastes: 0, runs: 0 },
};

export default function MentorPage() {
  const [messages, setMessages] = useState<Msg[]>([{ role: "ai", text: OPENING }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [live, setLive] = useState(false); // Geminiの実応答が来ているか
  const [ctx, setCtx] = useState(DEMO_CONTEXT); // テストから引き継いだ提出（お題＋コード）
  const [scoring, setScoring] = useState(false); // 採点中
  const [score, setScore] = useState<Score | null>(null);
  const [scoreFallback, setScoreFallback] = useState(false); // 暫定値か
  const mockTurn = useRef(0);

  // テストで書いたコードを引き継ぎ、開始の質問を Gemini から取得
  useEffect(() => {
    let aborted = false;
    let context = DEMO_CONTEXT;
    try {
      const stored = sessionStorage.getItem("ut_submission");
      if (stored) context = JSON.parse(stored);
    } catch {
      /* フォールバック：デモ文脈 */
    }
    setCtx(context);
    (async () => {
      try {
        const res = await fetch("/api/mentor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...context, history: [] }),
        });
        const data = await res.json();
        if (!aborted && data.reply) {
          setMessages([{ role: "ai", text: data.reply }]);
          setLive(true);
        }
      } catch {
        /* フォールバック：モックのまま */
      }
    })();
    return () => {
      aborted = true;
    };
  }, []);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const history: Msg[] = [...messages, { role: "me", text }];
    setMessages(history);
    setInput("");

    // キーが無い/接続前はモック追撃で進める
    if (!live) {
      const follow = MOCK_FOLLOWUPS[mockTurn.current++];
      if (follow) setMessages([...history, { role: "ai", text: follow }]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...ctx, history }),
      });
      const data = await res.json();
      const reply =
        data.reply ??
        "（今アクセスが混み合っているみたい。もう一度送ってみて。）";
      setMessages([...history, { role: "ai", text: reply }]);
    } catch {
      setMessages([
        ...history,
        { role: "ai", text: "（通信に失敗した。もう一度送ってみて。）" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // 壁打ちを終えて3軸スコアを算出。理解度・効率はメンバーに表示、
  // 信頼性（自力度）＋講評はマネージャー用に sessionStorage へ渡す（評価一覧で利用予定）。
  async function finish() {
    if (scoring) return;
    setDone(true);
    setScoring(true);
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: ctx.task,
          code: ctx.code,
          signals: ctx.signals,
          history: messages,
        }),
      });
      const data = await res.json();
      const s: Score = {
        understanding: data.understanding,
        efficiency: data.efficiency,
        reliability: data.reliability,
        comment: data.comment,
      };
      setScore(s);
      setScoreFallback(Boolean(data.fallback));
      try {
        sessionStorage.setItem("ut_score", JSON.stringify(s));
      } catch {
        /* 保存失敗は無視 */
      }
    } catch {
      setScore(null);
    } finally {
      setScoring(false);
    }
  }

  return (
    <>
      <Topbar title="AIメンター" switchHref="/manager" switchLabel="マネージャー画面へ" />
      <div className="mx-auto max-w-3xl p-6">
        <div className="mb-4 border-l-2 border-accent pl-3">
          <h2 className="flex items-center gap-2 font-semibold">
            壁打ち・深掘り
            {live && (
              <span className="border border-accent px-1.5 py-0.5 text-[10px] font-normal text-accent">
                Gemini接続中
              </span>
            )}
          </h2>
          <p className="text-sm text-muted">
            「なぜこうした?」を掘って理解の深さを測る。
            {live ? "" : "（キー未設定のためモック応答）"}
          </p>
        </div>

        <div className="space-y-3 border border-border bg-surface p-4">
          {messages.map((m, i) => (
            <div key={i} className={m.role === "ai" ? "flex" : "flex justify-end"}>
              <div
                className={`max-w-[80%] border px-3 py-2 text-sm ${
                  m.role === "ai"
                    ? "border-accent bg-accent/5"
                    : "border-border bg-background"
                }`}
              >
                <span className="mb-0.5 block text-[10px] text-muted">
                  {m.role === "ai" ? "AIメンター" : "あなた"}
                </span>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex">
              <div className="border border-accent bg-accent/5 px-3 py-2 text-sm text-muted">
                AIメンターが考えています…
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="回答を入力…"
            disabled={loading}
            className="flex-1 border border-border bg-background px-3 py-2 text-sm disabled:opacity-50"
          />
          <button
            onClick={send}
            disabled={loading}
            className="border border-accent px-4 py-2 text-sm text-accent hover:bg-accent/10 disabled:opacity-50"
          >
            送信
          </button>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={finish}
            disabled={scoring}
            className="bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:opacity-90 disabled:opacity-50"
          >
            壁打ちを終える
          </button>
        </div>

        {done && (
          <div className="mt-5 border border-border">
            <div className="border-b-2 border-accent px-4 py-2 text-sm font-semibold">
              あなたのスコア
            </div>
            {scoring ? (
              <div className="p-4 text-sm text-muted">採点中…</div>
            ) : score ? (
              <>
                <div className="grid grid-cols-2 divide-x divide-border">
                  <div className="p-4">
                    <div className="text-xs text-muted">理解度</div>
                    <div className="font-mono text-2xl">{score.understanding}</div>
                  </div>
                  <div className="p-4">
                    <div className="text-xs text-muted">手を動かす効率</div>
                    <div className="font-mono text-2xl">{score.efficiency}</div>
                  </div>
                </div>
                <p className="border-t border-border px-4 py-2 text-xs text-muted">
                  分析と信頼性（自力度）はマネージャーへ送信済み。
                  {scoreFallback && "（キー未設定のため暫定値）"}
                </p>
              </>
            ) : (
              <div className="p-4 text-sm text-muted">
                採点に失敗した。もう一度試して。
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

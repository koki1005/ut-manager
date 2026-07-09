"use client";

import { useState } from "react";
import Topbar from "../../components/Topbar";

type Msg = { role: "ai" | "me"; text: string };

const OPENING =
  "提出お疲れさま。なぜ配列を一度の走査で処理する形にした? 別の方法も考えた?";
// 深掘りの追撃はモック。実際の生成は Gemini 接続（#20）。
const FOLLOWUPS = [
  "なるほど。ではログが0件のとき、その実装はどう振る舞う?",
  "計算量とのトレードオフはどう考えた? 可読性を優先した場面は?",
];

export default function MentorPage() {
  const [messages, setMessages] = useState<Msg[]>([{ role: "ai", text: OPENING }]);
  const [input, setInput] = useState("");
  const [turn, setTurn] = useState(0);
  const [done, setDone] = useState(false);

  function send() {
    if (!input.trim()) return;
    const next: Msg[] = [...messages, { role: "me", text: input.trim() }];
    const follow = FOLLOWUPS[turn];
    if (follow) next.push({ role: "ai", text: follow });
    setMessages(next);
    setInput("");
    setTurn((t) => t + 1);
  }

  return (
    <>
      <Topbar title="AIメンター" switchHref="/manager" switchLabel="マネージャー画面へ" />
      <div className="mx-auto max-w-3xl p-6">
        <div className="mb-4 border-l-2 border-accent pl-3">
          <h2 className="font-semibold">壁打ち・深掘り</h2>
          <p className="text-sm text-muted">
            「なぜこうした?」を掘って理解の深さを測る。（生成は #20 で Gemini 接続）
          </p>
        </div>

        <div className="space-y-3 border border-border bg-surface p-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={m.role === "ai" ? "flex" : "flex justify-end"}
            >
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
        </div>

        <div className="mt-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="回答を入力…"
            className="flex-1 border border-border bg-background px-3 py-2 text-sm"
          />
          <button
            onClick={send}
            className="border border-accent px-4 py-2 text-sm text-accent hover:bg-accent/10"
          >
            送信
          </button>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setDone(true)}
            className="bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:opacity-90"
          >
            壁打ちを終える
          </button>
        </div>

        {done && (
          <div className="mt-5 border border-border">
            <div className="border-b-2 border-accent px-4 py-2 text-sm font-semibold">
              あなたのスコア
            </div>
            <div className="grid grid-cols-2 divide-x divide-border">
              <div className="p-4">
                <div className="text-xs text-muted">理解度</div>
                <div className="font-mono text-2xl">72</div>
              </div>
              <div className="p-4">
                <div className="text-xs text-muted">手を動かす効率</div>
                <div className="font-mono text-2xl">85</div>
              </div>
            </div>
            <p className="border-t border-border px-4 py-2 text-xs text-muted">
              分析と信頼性はマネージャーへ送信済み。（値はモック / 算出は #7・#21）
            </p>
          </div>
        )}
      </div>
    </>
  );
}

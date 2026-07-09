"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Editor from "@monaco-editor/react";
import Topbar from "../../components/Topbar";

const DEMO_TASK = {
  title: "直近N分間のエラー率を返す関数",
  description:
    "時系列ログの配列と now, N を受け取り、直近N分間のエラー率（0〜1）を返す errorRate(logs, now, minutes) を実装してください。ログ0件のときの扱いも考えること。",
  starter: `// logs: { time: number(ms), level: "info" | "error" }[]
// now: number(ms), minutes: number
function errorRate(logs, now, minutes) {
  // TODO: 直近 minutes 分の error 率を返す
}
`,
};

export default function MemberTestPage() {
  const [code, setCode] = useState(DEMO_TASK.starter);
  const [output, setOutput] = useState("");
  const [dark, setDark] = useState(false);
  // プロセスは裏で記録（テストモードでは非表示）。スコア算出は #7。
  const signals = useRef({ keystrokes: 0, pastes: 0, runs: 0 });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setDark(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  function handleChange(value: string | undefined) {
    const next = value ?? "";
    const delta = next.length - code.length;
    if (delta > 12) signals.current.pastes += 1;
    else if (delta > 0) signals.current.keystrokes += delta;
    setCode(next);
  }

  function run() {
    signals.current.runs += 1;
    const logs: string[] = [];
    try {
      const fn = new Function(
        `${code}\nreturn typeof errorRate === "function" ? errorRate : undefined;`,
      );
      const errorRate = fn();
      if (typeof errorRate === "function") {
        const sample = [
          { time: 1000, level: "info" },
          { time: 2000, level: "error" },
          { time: 3000, level: "error" },
        ];
        const result = errorRate(sample, 4000, 1);
        logs.push(`errorRate(sample, now=4000, 1分) = ${JSON.stringify(result)}`);
      } else {
        logs.push("errorRate 関数が見つかりません。");
      }
    } catch (e) {
      logs.push(`エラー: ${e instanceof Error ? e.message : String(e)}`);
    }
    setOutput(logs.join("\n"));
  }

  return (
    <>
      <Topbar title="テスト" switchHref="/manager" switchLabel="マネージャー画面へ" />
      <div className="p-6">
        <div className="mb-4 border border-border bg-surface px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="border border-accent px-2 py-0.5 text-xs text-accent">
              テストモード
            </span>
            <h2 className="font-semibold">お題：{DEMO_TASK.title}</h2>
          </div>
          <p className="mt-1 text-sm text-muted">{DEMO_TASK.description}</p>
        </div>

        <div className="border border-border">
          <Editor
            height="440px"
            defaultLanguage="javascript"
            value={code}
            onChange={handleChange}
            theme={dark ? "vs-dark" : "light"}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              scrollBeyondLastLine: false,
            }}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={run}
            className="border border-accent px-4 py-2 text-sm font-medium text-accent hover:bg-accent/10"
          >
            実行
          </button>
          <Link
            href="/member/mentor"
            onClick={() => {
              try {
                sessionStorage.setItem(
                  "ut_submission",
                  JSON.stringify({
                    task: `${DEMO_TASK.title}— ${DEMO_TASK.description}`,
                    code,
                  }),
                );
              } catch {
                /* storage不可でもメンター側がフォールバックする */
              }
            }}
            className="bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:opacity-90"
          >
            提出してメンターへ →
          </Link>
          <span className="text-sm text-muted">サンプル入力で errorRate を試します</span>
        </div>

        {output && (
          <pre className="mt-3 overflow-x-auto border border-border bg-surface p-4 text-sm">
            {output}
          </pre>
        )}
      </div>
    </>
  );
}

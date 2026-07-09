"use client";

import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";

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

type ProcessSignals = {
  keystrokes: number;
  pastes: number;
  runs: number;
  startedAt: number | null;
};

export default function MemberPage() {
  const [code, setCode] = useState(DEMO_TASK.starter);
  const [output, setOutput] = useState<string>("");
  const [dark, setDark] = useState(false);
  const signals = useRef<ProcessSignals>({
    keystrokes: 0,
    pastes: 0,
    runs: 0,
    startedAt: null,
  });
  const [signalView, setSignalView] = useState<ProcessSignals>(signals.current);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setDark(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // プロセス監視の種（issue #5 の入口）：打鍵とペーストを数える
  function handleChange(value: string | undefined) {
    const next = value ?? "";
    if (signals.current.startedAt === null) {
      signals.current.startedAt = performance.now();
    }
    const prevLen = code.length;
    const delta = next.length - prevLen;
    if (delta > 12) {
      signals.current.pastes += 1;
    } else if (delta > 0) {
      signals.current.keystrokes += delta;
    }
    setCode(next);
    setSignalView({ ...signals.current });
  }

  function run() {
    signals.current.runs += 1;
    setSignalView({ ...signals.current });
    const logs: string[] = [];
    const sandboxConsole = {
      log: (...a: unknown[]) => logs.push(a.map(String).join(" ")),
    };
    try {
      // デモ用の簡易実行。将来はサンドボックス実行に置き換える。
      const fn = new Function("console", `${code}\nreturn typeof errorRate === "function" ? errorRate : undefined;`);
      const errorRate = fn(sandboxConsole);
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
    <div className="mx-auto max-w-6xl px-6 py-6">
      <div className="mb-4 rounded-lg border border-border bg-surface px-4 py-3">
        <h1 className="font-semibold">お題：{DEMO_TASK.title}</h1>
        <p className="mt-1 text-sm text-muted">{DEMO_TASK.description}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-lg border border-border">
          <Editor
            height="420px"
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

        <aside className="flex flex-col gap-4">
          <div className="rounded-lg border border-border bg-surface p-4">
            <h2 className="text-sm font-semibold">AIメンター</h2>
            <p className="mt-2 text-sm text-muted">
              解き終えたら「なぜこの実装にしたか」を聞きます。（Gemini接続は issue #6）
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-4 text-sm">
            <h2 className="font-semibold">プロセス（記録中）</h2>
            <dl className="mt-2 space-y-1 text-muted">
              <div className="flex justify-between"><dt>打鍵</dt><dd className="font-mono">{signalView.keystrokes}</dd></div>
              <div className="flex justify-between"><dt>ペースト</dt><dd className="font-mono">{signalView.pastes}</dd></div>
              <div className="flex justify-between"><dt>実行回数</dt><dd className="font-mono">{signalView.runs}</dd></div>
            </dl>
          </div>
        </aside>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={run}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:opacity-90"
        >
          実行
        </button>
        <span className="text-sm text-muted">サンプル入力で errorRate を試します</span>
      </div>

      {output && (
        <pre className="mt-3 overflow-x-auto rounded-lg border border-border bg-surface p-4 text-sm">
          {output}
        </pre>
      )}
    </div>
  );
}

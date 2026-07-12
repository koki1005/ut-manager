import { geminiAvailable, generateJson } from "@/lib/gemini";
import type { Score, Signals } from "@/lib/score";

export const runtime = "nodejs";

type Msg = { role: "ai" | "me"; text: string };

// キー未設定・エラー時の暫定値。UIは fallback:true で「暫定」と示す。
const MOCK: Score = {
  understanding: 72,
  efficiency: 85,
  reliability: 63,
  comment: "自力で書けているが、境界条件の言語化がやや浅い。要フォロー。",
};

const SCHEMA = {
  type: "OBJECT",
  properties: {
    understanding: { type: "INTEGER" },
    efficiency: { type: "INTEGER" },
    reliability: { type: "INTEGER" },
    comment: { type: "STRING" },
  },
  required: ["understanding", "efficiency", "reliability", "comment"],
} as const;

const clamp = (n: unknown) =>
  Math.max(0, Math.min(100, Math.round(Number(n) || 0)));

export async function POST(req: Request) {
  const { task, code, history, signals } = (await req
    .json()
    .catch(() => ({}))) as {
    task?: string;
    code?: string;
    history?: Msg[];
    signals?: Signals;
  };

  if (!geminiAvailable()) {
    return Response.json({ ...MOCK, fallback: true });
  }

  const convo = (history ?? [])
    .map((m) => `${m.role === "ai" ? "メンター" : "回答者"}: ${m.text}`)
    .join("\n");

  // 書くプロセスの信号（ペースト率＝自力度、実行回数＝手戻りの目安）。
  const sig = signals
    ? `打鍵で増えた文字数=${signals.keystrokes} / ペースト検知=${signals.pastes}回 / 実行=${signals.runs}回`
    : "(記録なし)";

  const prompt = [
    "あなたはエンジニアの実力を見抜く熟練評価者。提出コードと、メンターとの『なぜこうした?』の壁打ち、",
    "および書くプロセスの信号から、次の3軸を各0〜100の整数で採点する。理由は行動でなく回答の中身を主に置く。",
    "- understanding（理解度）: 回答の深さで測る。因果を言えるか／捨てた選択肢に触れるか／計算量・可読性のトレードオフを語れるか／崩れるケースを分かっているか。深いほど高い。回答が薄い・的外れなら低い。",
    "- efficiency（手を動かす効率）: 提出コードの簡潔さ・直截さ、無駄な手戻りの少なさ。実行回数が極端に多い＝試行錯誤過多はやや減点。冗長・遠回りなら低い。",
    "- reliability（信頼性＝自力度）: 説明の具体性・一貫性に加え、ペースト検知が多いほど自力度を下げる（丸写し兆候）。打鍵中心で説明も一貫していれば高い。曖昧・借り物なら低い。",
    "comment はマネージャー向けの一言講評（日本語1文、傾向と要注意点）。",
    "量は多いほど良いわけではない（簡潔さを評価する）。自己申告は信用しない。",
    `\n# お題\n${task ?? "(不明)"}`,
    `\n# 提出コード\n${code ?? "(なし)"}`,
    `\n# 書くプロセスの信号\n${sig}`,
    convo ? `\n# 壁打ちのやりとり\n${convo}` : "\n# 壁打ちのやりとり\n(なし)",
  ].join("\n");

  try {
    const raw = await generateJson<Score>(prompt, SCHEMA);
    const score: Score = {
      understanding: clamp(raw.understanding),
      efficiency: clamp(raw.efficiency),
      reliability: clamp(raw.reliability),
      comment: String(raw.comment ?? "").trim() || MOCK.comment,
    };
    return Response.json({ ...score, fallback: false });
  } catch (e) {
    return Response.json({
      ...MOCK,
      fallback: true,
      error: e instanceof Error ? e.message : String(e),
    });
  }
}

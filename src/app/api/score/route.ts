import { geminiAvailable, generateJson } from "@/lib/gemini";

export const runtime = "nodejs";

type Msg = { role: "ai" | "me"; text: string };

// 3軸スコア。メンバーには understanding / efficiency を、
// マネージャーには reliability（自力度）と comment を渡す想定（出し分け）。
export type Score = {
  understanding: number; // 理解度（回答の深さ）0-100
  efficiency: number; // 手を動かす効率 0-100
  reliability: number; // 信頼性＝自力度（スコアを鵜呑みにしてよいか）0-100
  comment: string; // マネージャー向け一言講評
};

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
  const { task, code, history } = (await req
    .json()
    .catch(() => ({}))) as { task?: string; code?: string; history?: Msg[] };

  if (!geminiAvailable()) {
    return Response.json({ ...MOCK, fallback: true });
  }

  const convo = (history ?? [])
    .map((m) => `${m.role === "ai" ? "メンター" : "回答者"}: ${m.text}`)
    .join("\n");

  const prompt = [
    "あなたはエンジニアの実力を見抜く熟練評価者。提出コードと、メンターとの『なぜこうした?』の壁打ちから、",
    "次の3軸を各0〜100の整数で採点する。値の根拠は行動でなく回答の中身に置くこと。",
    "- understanding（理解度）: 回答の深さで測る。因果を言えるか／捨てた選択肢に触れるか／計算量・可読性のトレードオフを語れるか／崩れるケースを分かっているか。深いほど高い。回答が薄い・的外れなら低い。",
    "- efficiency（手を動かす効率）: 提出コードの簡潔さ・直截さ、無駄な手戻りの少なさ。冗長・遠回りなら低い。※プロセス指標は将来補正、今はコードと会話から推定。",
    "- reliability（信頼性＝自力度）: 説明の具体性・一貫性から、AIコピペや丸投げでなく本人が考えて書いた度合い。説明が具体的で一貫していれば高い。曖昧・借り物なら低い。",
    "comment はマネージャー向けの一言講評（日本語1文、傾向と要注意点）。",
    "量は多いほど良いわけではない（簡潔さを評価する）。自己申告は信用しない。",
    `\n# お題\n${task ?? "(不明)"}`,
    `\n# 提出コード\n${code ?? "(なし)"}`,
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

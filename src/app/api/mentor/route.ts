import { geminiAvailable, generateText } from "@/lib/gemini";

export const runtime = "nodejs";

type Msg = { role: "ai" | "me"; text: string };

// テスト提出後の壁打ち。会話履歴を受け取り、次の「なぜこうした?」を1問返す。
// 履歴が空なら最初の質問。キー未設定・エラー時は fallback:true。
export async function POST(req: Request) {
  const { task, code, history } = (await req
    .json()
    .catch(() => ({}))) as {
    task?: string;
    code?: string;
    history?: Msg[];
  };

  if (!geminiAvailable()) {
    return Response.json({ reply: null, fallback: true });
  }

  const convo = (history ?? [])
    .map((m) => `${m.role === "ai" ? "メンター" : "回答者"}: ${m.text}`)
    .join("\n");

  const prompt = [
    "あなたはコードレビューの熟練メンター。提出コードについて、相手の理解の深さを",
    "『なぜこうした?』と一問ずつ短く掘り下げて測る。因果・代替案・トレードオフ・限界のどれかに毎回踏み込むこと。",
    "これまでのやりとりを踏まえ、次に問う質問を1つだけ、日本語で短く返す。前置き・解説・箇条書き・記号は不要、質問文のみ。",
    (history?.length ?? 0) === 0 ? "まだ会話は始まっていない。最初の一問を返す。" : "",
    `\n# お題\n${task ?? ""}`,
    `\n# 提出コード\n${code ?? ""}`,
    convo ? `\n# これまでのやりとり\n${convo}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const text = await generateText(prompt);
    return Response.json({ reply: text.trim(), fallback: false });
  } catch (e) {
    return Response.json({
      reply: null,
      fallback: true,
      error: e instanceof Error ? e.message : String(e),
    });
  }
}

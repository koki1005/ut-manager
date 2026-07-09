import { geminiAvailable, generateText } from "@/lib/gemini";

export const runtime = "nodejs";

// テスト提出後の「なぜこうした?」質問を生成する。
// キー未設定・エラー時は fallback:true を返し、クライアントはモック質問を使う。
export async function POST(req: Request) {
  const { task, code } = await req
    .json()
    .catch(() => ({ task: "", code: "" }));

  if (!geminiAvailable()) {
    return Response.json({ question: null, fallback: true });
  }

  const prompt = [
    "あなたはコードレビューの熟練メンター。提出されたコードから、",
    "書き手の理解の深さを測るための「なぜこうした?」を1問だけ、日本語で短く問うてください。",
    "因果・代替案・トレードオフ・限界のいずれかに踏み込む質問にすること。前置きや解説は不要、質問文だけ返す。",
    `\n# お題\n${task ?? ""}`,
    `\n# 提出コード\n${code ?? ""}`,
  ].join("\n");

  try {
    const text = await generateText(prompt);
    return Response.json({ question: text.trim(), fallback: false });
  } catch (e) {
    return Response.json({
      question: null,
      fallback: true,
      error: e instanceof Error ? e.message : String(e),
    });
  }
}

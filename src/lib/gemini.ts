import { GoogleGenAI } from "@google/genai";

// 既定は安定して応答する Flash-Lite。混雑に強い。
const PRIMARY = process.env.GEMINI_MODEL ?? "gemini-flash-lite-latest";
// 上位モデルが混雑(503/429)したときの退避先。
const FALLBACK = "gemini-flash-lite-latest";
const MODELS = PRIMARY === FALLBACK ? [PRIMARY] : [PRIMARY, FALLBACK];

/** APIキーが設定されているか（未設定ならモックにフォールバック） */
export function geminiAvailable(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

let client: GoogleGenAI | null = null;
function getClient(): GoogleGenAI {
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}

function isRetriable(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /"code":\s*(503|429)|UNAVAILABLE|RESOURCE_EXHAUSTED/.test(msg);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * 単発のテキスト生成（generateContent）。
 * 混雑(503/429)時は各モデルで軽くリトライし、上位が混んでいれば Lite へ退避する。
 */
export async function generateText(prompt: string): Promise<string> {
  const ai = getClient();
  let lastErr: unknown;
  for (const model of MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await ai.models.generateContent({ model, contents: prompt });
        return res.text ?? "";
      } catch (e) {
        lastErr = e;
        if (!isRetriable(e)) throw e;
        await sleep(400);
      }
    }
  }
  throw lastErr;
}

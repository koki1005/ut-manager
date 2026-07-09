import { GoogleGenAI } from "@google/genai";

const MODEL = process.env.GEMINI_MODEL ?? "gemini-flash-latest";

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

/** 単発のテキスト生成（generateContent）。まずはこれで接続する。 */
export async function generateText(prompt: string): Promise<string> {
  const ai = getClient();
  const res = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
  });
  return res.text ?? "";
}

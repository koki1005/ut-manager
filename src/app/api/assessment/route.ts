import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import {
  getAssessment,
  saveSubmission,
  saveScore,
} from "@/lib/assessments";
import type { Score, Signals } from "@/lib/score";

export const runtime = "nodejs";

/** 自分の最新の提出（お題・コード・信号）を返す。メンター画面の文脈引き継ぎに使う。 */
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const a = await getAssessment(user.uid);
  if (!a) return NextResponse.json({ submission: null });
  return NextResponse.json({
    submission: { task: a.task, code: a.code, signals: a.signals },
  });
}

/** テスト提出を保存（新規提出＝古いスコアは無効化）。 */
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { task?: string; code?: string; signals?: Signals };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  await saveSubmission(user.uid, user.displayName ?? user.email ?? "名無し", {
    task: body.task ?? "",
    code: body.code ?? "",
    signals: body.signals ?? { keystrokes: 0, pastes: 0, runs: 0 },
  });
  return NextResponse.json({ ok: true });
}

/** 壁打ち後の3軸スコアを保存。 */
export async function PUT(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let score: Score;
  try {
    score = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  await saveScore(user.uid, {
    understanding: Number(score.understanding) || 0,
    efficiency: Number(score.efficiency) || 0,
    reliability: Number(score.reliability) || 0,
    comment: String(score.comment ?? ""),
  });
  return NextResponse.json({ ok: true });
}

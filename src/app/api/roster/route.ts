import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { listScoredAssessments } from "@/lib/assessments";

export const runtime = "nodejs";

/** 採点済みメンバーの名簿（マネージャーの割り当て画面用）。 */
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (user.role !== "manager")
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const list = await listScoredAssessments();
  const roster = list.map((a) => ({
    name: a.displayName,
    understanding: a.score!.understanding,
    efficiency: a.score!.efficiency,
    reliability: a.score!.reliability,
  }));
  return NextResponse.json({ roster });
}

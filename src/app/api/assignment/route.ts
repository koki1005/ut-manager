import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import {
  getLatestAssignment,
  saveLatestAssignment,
  type AssignmentItem,
} from "@/lib/assignments";

export const runtime = "nodejs";

/** 直近の割り当てを返す（メンバー/マネージャー両方から参照）。 */
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const batch = await getLatestAssignment();
  return NextResponse.json({
    batch,
    me: user.displayName ?? user.email ?? null,
  });
}

/** 割り当て結果を保存（マネージャーのみ）。 */
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (user.role !== "manager")
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  let body: { project?: string; items?: AssignmentItem[]; fallback?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  await saveLatestAssignment(
    body.project ?? "",
    Array.isArray(body.items) ? body.items : [],
    Boolean(body.fallback),
  );
  return NextResponse.json({ ok: true });
}

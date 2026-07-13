import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { createSession, clearSession, type Role } from "@/lib/session";

// Node.js ランタイム（firebase-admin は Edge 不可）。
export const runtime = "nodejs";

type Body = { idToken?: string; role?: Role; displayName?: string };

/**
 * ログイン/サインアップ後にクライアントの ID トークンを受け取り、
 * users/{uid} を用意して httpOnly セッションクッキーを発行する。
 * role は初回作成時のみ採用（ログインで既存 role を上書きしない）。
 */
export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { idToken, role, displayName } = body;
  if (!idToken) {
    return NextResponse.json({ error: "missing_id_token" }, { status: 400 });
  }

  try {
    const decoded = await adminAuth().verifyIdToken(idToken);
    const userRef = adminDb().collection("users").doc(decoded.uid);
    const snap = await userRef.get();

    let effectiveRole: Role = "member";
    if (!snap.exists) {
      effectiveRole = role === "manager" ? "manager" : "member";
      await userRef.set({
        email: decoded.email ?? null,
        displayName: displayName ?? decoded.name ?? null,
        role: effectiveRole,
        createdAt: FieldValue.serverTimestamp(),
      });
    } else {
      const data = snap.data();
      effectiveRole = data?.role === "manager" ? "manager" : "member";
    }

    await createSession(idToken);
    return NextResponse.json({ ok: true, role: effectiveRole });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: "auth_failed", detail: msg }, { status: 401 });
  }
}

/** ログアウト。 */
export async function DELETE() {
  await clearSession();
  return NextResponse.json({ ok: true });
}

import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";
import { adminAuth, adminDb } from "./firebase-admin";
import { SESSION_COOKIE, type Role } from "./auth-constants";

export { SESSION_COOKIE, type Role };
// Firebase セッションクッキーの上限は14日。ここでは5日。
const SESSION_MS = 5 * 24 * 60 * 60 * 1000;

export type SessionUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: Role;
};

/** クライアントの ID トークンから httpOnly セッションクッキーを発行してセットする。 */
export async function createSession(idToken: string): Promise<void> {
  const sessionCookie = await adminAuth().createSessionCookie(idToken, {
    expiresIn: SESSION_MS,
  });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MS / 1000,
  });
}

/** ログアウト：クッキー削除。 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/**
 * セッションクッキーを検証し、ログイン中のユーザーを返す（未ログインは null）。
 * 同一レンダー内での重複検証を React cache で抑える。
 * role は Firestore users/{uid} から引く（無ければ member 扱い）。
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE)?.value;
  if (!cookie) return null;

  try {
    const decoded = await adminAuth().verifySessionCookie(cookie, true);
    const snap = await adminDb().collection("users").doc(decoded.uid).get();
    const data = snap.data();
    const role: Role = data?.role === "manager" ? "manager" : "member";
    return {
      uid: decoded.uid,
      email: decoded.email ?? null,
      displayName: (data?.displayName as string | undefined) ?? decoded.name ?? null,
      role,
    };
  } catch {
    // 期限切れ・改ざん・失効など。未ログイン扱い。
    return null;
  }
});

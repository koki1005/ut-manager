import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth-constants";

// 保護ルート（ログイン必須）。/manager /member 配下すべて。
const PROTECTED = ["/manager", "/member"];

/**
 * 楽観的な認証ゲート。クッキーの有無だけ見る（検証は各ページ/APIの DAL で行う）。
 * Proxy はプリフェッチ含め全ルートで走るため、ここで DB 検証はしない。
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = Boolean(req.cookies.get(SESSION_COOKIE)?.value);

  const isProtected = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );

  if (isProtected && !hasSession) {
    const url = new URL("/login", req.nextUrl);
    return NextResponse.redirect(url);
  }

  // ログイン済みが /login に来たらトップへ逃がす。
  if (pathname === "/login" && hasSession) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};

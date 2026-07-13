// proxy.ts と server 側の両方から使う軽量な定数。firebase-admin を巻き込まない。
export const SESSION_COOKIE = "ut_session";

export type Role = "manager" | "member";

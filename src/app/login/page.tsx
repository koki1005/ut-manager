"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import type { Role } from "@/lib/auth-constants";

type Mode = "login" | "signup";

// Firebase Auth のエラーコードを日本語の短文に寄せる。
function toMessage(code: string): string {
  if (code.includes("invalid-credential") || code.includes("wrong-password"))
    return "メールアドレスかパスワードが違う";
  if (code.includes("email-already-in-use")) return "そのメールはもう登録済み";
  if (code.includes("weak-password")) return "パスワードは6文字以上にして";
  if (code.includes("invalid-email")) return "メールアドレスの形式が不正";
  if (code.includes("too-many-requests")) return "試行が多すぎ。少し待って";
  return "うまくいかなかった。もう一度試して";
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("member");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const cred =
        mode === "signup"
          ? await createUserWithEmailAndPassword(auth, email, password)
          : await signInWithEmailAndPassword(auth, email, password);

      if (mode === "signup" && name.trim()) {
        await updateProfile(cred.user, { displayName: name.trim() });
      }

      const idToken = await cred.user.getIdToken();
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken,
          role: mode === "signup" ? role : undefined,
          displayName: mode === "signup" ? name.trim() || undefined : undefined,
        }),
      });
      if (!res.ok) throw new Error("session_failed");
      const data: { role: Role } = await res.json();

      router.replace(data.role === "manager" ? "/manager" : "/member");
      router.refresh();
    } catch (err) {
      const code =
        typeof err === "object" && err && "code" in err
          ? String((err as { code: unknown }).code)
          : String(err);
      setError(toMessage(code));
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="flex items-center gap-2 border-b-2 border-accent px-6 py-3.5">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-block h-5 w-1.5 bg-accent" aria-hidden />
          <span className="text-sm font-semibold">UT Manager</span>
        </Link>
      </header>

      <div className="mx-auto max-w-md px-6 py-16">
        <div className="mb-6 flex border border-border">
          {(["login", "signup"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setError(null);
              }}
              className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
                mode === m
                  ? "bg-accent text-accent-fg"
                  : "bg-surface text-muted hover:text-foreground"
              }`}
            >
              {m === "login" ? "ログイン" : "新規登録"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "signup" && (
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">名前</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border border-border bg-surface px-3 py-2 outline-none focus:border-accent"
                placeholder="佐野 皓紀"
                autoComplete="name"
              />
            </label>
          )}

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">メールアドレス</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-border bg-surface px-3 py-2 outline-none focus:border-accent"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">パスワード</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-border bg-surface px-3 py-2 outline-none focus:border-accent"
              placeholder="6文字以上"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
            />
          </label>

          {mode === "signup" && (
            <fieldset className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">役割</span>
              <div className="flex border border-border">
                {(["member", "manager"] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`flex-1 px-4 py-2 transition-colors ${
                      role === r
                        ? "bg-accent text-accent-fg"
                        : "bg-surface text-muted hover:text-foreground"
                    }`}
                  >
                    {r === "member" ? "メンバー" : "マネージャー"}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {error && (
            <p className="border-l-2 border-red-500 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-2 bg-accent px-4 py-2.5 text-sm font-semibold text-accent-fg transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "処理中…" : mode === "login" ? "ログイン" : "登録して開始"}
          </button>
        </form>
      </div>
    </div>
  );
}

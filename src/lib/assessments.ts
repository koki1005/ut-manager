import "server-only";

import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "./firebase-admin";
import type { Score, Signals } from "./score";

// 実力調査1件＝あるユーザーの直近の「提出＋採点」。uid をキーに1ユーザー1件（最新で上書き）。
export type Assessment = {
  uid: string;
  displayName: string;
  task: string;
  code: string;
  signals: Signals;
  score: Score | null;
  submittedAt: number | null; // epoch ms
  scoredAt: number | null; // epoch ms
};

const COL = "assessments";

function toMillis(v: unknown): number | null {
  return v instanceof Timestamp ? v.toMillis() : null;
}

function fromDoc(uid: string, data: FirebaseFirestore.DocumentData): Assessment {
  return {
    uid,
    displayName: (data.displayName as string) ?? "名無し",
    task: (data.task as string) ?? "",
    code: (data.code as string) ?? "",
    signals: (data.signals as Signals) ?? { keystrokes: 0, pastes: 0, runs: 0 },
    score: (data.score as Score) ?? null,
    submittedAt: toMillis(data.submittedAt),
    scoredAt: toMillis(data.scoredAt),
  };
}

/** 自分の最新の実力調査を取得（無ければ null）。 */
export async function getAssessment(uid: string): Promise<Assessment | null> {
  const snap = await adminDb().collection(COL).doc(uid).get();
  if (!snap.exists) return null;
  return fromDoc(uid, snap.data()!);
}

/** テスト提出を保存。新しい提出なので古いスコアは無効化する。 */
export async function saveSubmission(
  uid: string,
  displayName: string,
  input: { task: string; code: string; signals: Signals },
): Promise<void> {
  await adminDb()
    .collection(COL)
    .doc(uid)
    .set(
      {
        uid,
        displayName,
        task: input.task,
        code: input.code,
        signals: input.signals,
        score: null,
        scoredAt: null,
        submittedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
}

/** 壁打ち後の3軸スコアを保存。 */
export async function saveScore(uid: string, score: Score): Promise<void> {
  await adminDb()
    .collection(COL)
    .doc(uid)
    .set({ score, scoredAt: FieldValue.serverTimestamp() }, { merge: true });
}

/** 採点済みの実力調査を全ユーザー分（新しい順）。マネージャーの評価一覧・名簿に使う。 */
export async function listScoredAssessments(): Promise<Assessment[]> {
  const snap = await adminDb().collection(COL).get();
  return snap.docs
    .map((d) => fromDoc(d.id, d.data()))
    .filter((a) => a.score !== null)
    .sort((a, b) => (b.scoredAt ?? 0) - (a.scoredAt ?? 0));
}

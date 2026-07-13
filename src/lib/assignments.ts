import "server-only";

import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "./firebase-admin";

// AIが割り当てた1行。name は名簿上の表示名で紐づける（フェーズ2）。
export type AssignmentItem = {
  name: string;
  task: string;
  load: number;
  reason: string;
};

export type AssignmentBatch = {
  project: string;
  items: AssignmentItem[];
  fallback: boolean;
  createdAt: number | null;
};

// 直近の割り当ては単一ドキュメントに保持（MVP。プロジェクト複数管理は今後）。
const REF = () => adminDb().collection("assignments").doc("latest");

/** マネージャーの割り当て結果を保存。 */
export async function saveLatestAssignment(
  project: string,
  items: AssignmentItem[],
  fallback: boolean,
): Promise<void> {
  await REF().set({
    project,
    items,
    fallback,
    createdAt: FieldValue.serverTimestamp(),
  });
}

/** 直近の割り当てを取得（無ければ null）。 */
export async function getLatestAssignment(): Promise<AssignmentBatch | null> {
  const snap = await REF().get();
  if (!snap.exists) return null;
  const data = snap.data()!;
  return {
    project: (data.project as string) ?? "",
    items: (data.items as AssignmentItem[]) ?? [],
    fallback: Boolean(data.fallback),
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : null,
  };
}

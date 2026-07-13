import "server-only";

import { getApps, initializeApp, applicationDefault, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

// Cloud Run 上ではサービスアカウントの ADC で鍵レス初期化。
// ローカルは `gcloud auth application-default login` の資格情報を拾う。
// build 時に触られないよう遅延初期化する（tsc/next build は認証不要）。
let app: App | null = null;

function adminApp(): App {
  if (app) return app;
  app = getApps().length
    ? getApps()[0]
    : initializeApp({
        credential: applicationDefault(),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
  return app;
}

export function adminAuth(): Auth {
  return getAuth(adminApp());
}

export function adminDb(): Firestore {
  return getFirestore(adminApp());
}

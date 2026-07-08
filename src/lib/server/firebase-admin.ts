import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
  type App,
} from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

let adminApp: App | undefined;

function parseServiceAccount():
  | {
      projectId: string;
      clientEmail: string;
      privateKey: string;
    }
  | undefined {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) return undefined;

  const parsed = JSON.parse(raw) as {
    project_id?: string;
    projectId?: string;
    client_email?: string;
    clientEmail?: string;
    private_key?: string;
    privateKey?: string;
  };

  const projectId = parsed.project_id ?? parsed.projectId;
  const clientEmail = parsed.client_email ?? parsed.clientEmail;
  const privateKey = (parsed.private_key ?? parsed.privateKey)?.replace(
    /\\n/g,
    '\n',
  );

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is missing required fields');
  }

  return { projectId, clientEmail, privateKey };
}

export function getAdminApp(): App | undefined {
  if (adminApp) return adminApp;
  if (getApps().length > 0) {
    adminApp = getApps()[0];
    return adminApp;
  }

  const projectId =
    process.env.FIREBASE_PROJECT_ID ??
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const hasApplicationDefaultCredentials = Boolean(
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
  );

  try {
    const serviceAccount = parseServiceAccount();
    if (!serviceAccount && !hasApplicationDefaultCredentials) {
      if (process.env.REQUIRE_FIREBASE_ADMIN === 'true') {
        throw new Error(
          'Firebase Admin credentials are not configured. Set FIREBASE_SERVICE_ACCOUNT_KEY or GOOGLE_APPLICATION_CREDENTIALS.',
        );
      }
      return undefined;
    }

    adminApp = initializeApp(
      serviceAccount
        ? {
            credential: cert(serviceAccount),
            projectId: serviceAccount.projectId,
          }
        : { credential: applicationDefault(), projectId },
    );
    return adminApp;
  } catch (error) {
    if (process.env.REQUIRE_FIREBASE_ADMIN === 'true') {
      throw error;
    }
    return undefined;
  }
}

export function getAdminAuth(): Auth | undefined {
  const app = getAdminApp();
  return app ? getAuth(app) : undefined;
}

export function getAdminDb(): Firestore | undefined {
  const app = getAdminApp();
  return app ? getFirestore(app) : undefined;
}

export function isFirebaseAdminAvailable(): boolean {
  return Boolean(getAdminApp());
}

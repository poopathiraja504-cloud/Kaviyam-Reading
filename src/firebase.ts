import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import rawConfig from "../firebase-applet-config.json";

// Web app's Firebase configuration with VITE_ environment variable support and fallback to applet config
const isValidValue = (val: string | undefined): boolean => {
  if (!val || typeof val !== "string") return false;
  const trimmed = val.trim();
  if (trimmed === "") return false;
  const lower = trimmed.toLowerCase();
  if (
    lower.includes("your_") ||
    lower.includes("my_") ||
    lower.includes("placeholder") ||
    lower.includes("example") ||
    lower.startsWith("<") ||
    lower === "undefined" ||
    lower === "null"
  ) {
    return false;
  }
  return true;
};

const getValidConfigValue = (envVal: string | undefined, fallback: string): string => {
  if (isValidValue(envVal)) {
    return envVal!.trim();
  }
  return fallback;
};

// Validate that the Firebase API key is a genuine Firebase Web API key (starts with AIza and has appropriate length)
const getValidApiKey = (envVal: string | undefined, fallback: string): string => {
  if (isValidValue(envVal) && envVal!.trim().startsWith("AIza") && envVal!.trim().length >= 20) {
    return envVal!.trim();
  }
  return fallback;
};

export const firebaseConfig = {
  apiKey: getValidApiKey(import.meta.env.VITE_FIREBASE_API_KEY, rawConfig.apiKey),
  authDomain: getValidConfigValue(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, rawConfig.authDomain),
  databaseURL: getValidConfigValue(import.meta.env.VITE_FIREBASE_DATABASE_URL, (rawConfig as any).databaseURL || "https://kaviyam-reading-default-rtdb.asia-southeast1.firebasedatabase.app"),
  projectId: getValidConfigValue(import.meta.env.VITE_FIREBASE_PROJECT_ID, rawConfig.projectId),
  storageBucket: getValidConfigValue(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, rawConfig.storageBucket),
  messagingSenderId: getValidConfigValue(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, rawConfig.messagingSenderId),
  appId: getValidConfigValue(import.meta.env.VITE_FIREBASE_APP_ID, rawConfig.appId),
  measurementId: getValidConfigValue(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID, rawConfig.measurementId || "G-SYPERY4MH2"),
};

// Initialize Firebase App instance
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore Database with custom database ID
const customDbId = import.meta.env.VITE_FIREBASE_DATABASE_ID;
const databaseId = isValidValue(customDbId) && !/^\d{10}$/.test(customDbId!.trim()) 
  ? customDbId!.trim() 
  : rawConfig.firestoreDatabaseId;
export const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);

// Initialize Firebase Authentication
export const auth = getAuth(app);


export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection validation
async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    // Ignore test connection error on initial unauthenticated load
  }
}
testConnection();


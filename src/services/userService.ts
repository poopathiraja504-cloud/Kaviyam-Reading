import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocFromServer 
} from "firebase/firestore";
import { deleteUser, User as FirebaseUser } from "firebase/auth";
import { db, auth } from "../firebase";
import { User } from "../types";

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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
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
  console.warn("Firestore Error:", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test on boot
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("Firestore client is offline or connection pending.");
    }
    return false;
  }
}

export interface SyncUserInput {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  phoneNumber?: string | null;
  emailVerified?: boolean;
}

export interface ExtraUserFields {
  name?: string;
  photoFileName?: string;
  bio?: string;
  dob?: string;
  gender?: string;
  phone?: string;
}

const DEFAULT_AVATARS = [
  { fileName: "avatar_tamil_scholar.png", title: "தமிழ் புலவர் (Scholar)" },
  { fileName: "avatar_chola_royalty.png", title: "சோழ இளவரசர் (Royalty)" },
  { fileName: "avatar_valluvar_sage.png", title: "வள்ளுவர் (Sage)" },
  { fileName: "avatar_modern_reader.png", title: "நவீன வாசகர் (Modern Reader)" },
  { fileName: "avatar_kaviyam_lotus.png", title: "காவிய மலர் (Lotus)" },
];

export { DEFAULT_AVATARS };

/**
 * Ensures a user document exists in Firestore at `/users/${uid}`.
 * If user does not exist, creates it with:
 * - name, email, photoFileName, and other profile fields.
 * If user already exists, retrieves it and backfills any missing required fields.
 */
export async function syncUserToFirestore(
  fbUser: SyncUserInput,
  extraFields?: ExtraUserFields
): Promise<User> {
  const uid = fbUser.uid;
  const userDocPath = `users/${uid}`;
  const userDocRef = doc(db, "users", uid);
  const storageKey = `kaviyam_profile_${uid}`;

  try {
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const resolvedName = data.name || extraFields?.name || fbUser.displayName || (data.email ? data.email.split("@")[0] : "Tamil Reader");
      const resolvedEmail = data.email || fbUser.email || "";
      const resolvedPhoto = data.photoFileName || extraFields?.photoFileName || "avatar_tamil_scholar.png";

      // If document is missing any of the core requested fields, merge-backfill them
      const needsBackfill = !data.name || !data.email || !data.photoFileName || !data.uid;
      if (needsBackfill) {
        try {
          await setDoc(
            userDocRef,
            {
              uid,
              id: uid,
              name: resolvedName,
              email: resolvedEmail,
              photoFileName: resolvedPhoto,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch (e) {
          console.warn("Could not backfill user document:", e);
        }
      }

      const userObj: User = {
        id: uid,
        uid: uid,
        name: resolvedName,
        username: resolvedName,
        email: resolvedEmail,
        photoFileName: resolvedPhoto,
        avatarUrl: data.avatarUrl || fbUser.photoURL || undefined,
        phone: data.phone || fbUser.phoneNumber || undefined,
        bio: data.bio || "தமிழ் இலக்கிய ஆர்வலர் (Tamil Literature Enthusiast)",
        dob: data.dob || extraFields?.dob || undefined,
        gender: data.gender || extraFields?.gender || "Not Specified",
        role: data.role || "reader",
        isVerified: data.isVerified ?? fbUser.emailVerified ?? false,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
      };

      try {
        localStorage.setItem(storageKey, JSON.stringify(userObj));
      } catch {}

      return userObj;
    } else {
      // Document does NOT exist in Firestore: Create new document at /users/{uid}
      const newName = extraFields?.name?.trim() || fbUser.displayName || (fbUser.email ? fbUser.email.split("@")[0] : "Tamil Reader");
      const newEmail = fbUser.email || "";
      const newPhotoFileName = extraFields?.photoFileName || "avatar_tamil_scholar.png";
      const nowIso = new Date().toISOString();

      const newUserData: User = {
        id: uid,
        uid: uid,
        name: newName,
        username: newName,
        email: newEmail,
        photoFileName: newPhotoFileName,
        avatarUrl: fbUser.photoURL || undefined,
        phone: extraFields?.phone || fbUser.phoneNumber || undefined,
        bio: extraFields?.bio || "தமிழ் இலக்கிய ஆர்வலர் (Tamil Literature Enthusiast)",
        dob: extraFields?.dob || "",
        gender: extraFields?.gender || "Not Specified",
        role: "reader",
        isVerified: !!fbUser.emailVerified,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      try {
        await setDoc(userDocRef, newUserData);
      } catch (writeErr) {
        console.warn("Could not write initial user document in Firestore:", writeErr);
      }

      try {
        localStorage.setItem(storageKey, JSON.stringify(newUserData));
      } catch {}

      return newUserData;
    }
  } catch (error) {
    console.warn("Firestore sync fallback to local cache:", error);
    // Fallback: create from local or input
    const fallbackUser: User = {
      id: uid,
      uid: uid,
      name: extraFields?.name?.trim() || fbUser.displayName || (fbUser.email ? fbUser.email.split("@")[0] : "Tamil Reader"),
      username: extraFields?.name?.trim() || fbUser.displayName || (fbUser.email ? fbUser.email.split("@")[0] : "Tamil Reader"),
      email: fbUser.email || "",
      photoFileName: extraFields?.photoFileName || "avatar_tamil_scholar.png",
      avatarUrl: fbUser.photoURL || undefined,
      phone: extraFields?.phone || fbUser.phoneNumber || undefined,
      bio: extraFields?.bio || "தமிழ் இலக்கிய ஆர்வலர் (Tamil Literature Enthusiast)",
      dob: extraFields?.dob || "",
      gender: extraFields?.gender || "Not Specified",
      role: "reader",
      isVerified: !!fbUser.emailVerified,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(storageKey, JSON.stringify(fallbackUser));
    } catch {}
    return fallbackUser;
  }
}

/**
 * Retrieves the full profile document from Firestore for a given uid.
 */
export async function getUserProfile(uid: string): Promise<User | null> {
  const userDocPath = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) {
      const raw = localStorage.getItem(`kaviyam_profile_${uid}`);
      return raw ? JSON.parse(raw) : null;
    }
    const data = snap.data();
    return {
      id: uid,
      uid: uid,
      name: data.name || (data.email ? data.email.split("@")[0] : "Tamil Reader"),
      username: data.name || data.username || "Tamil Reader",
      email: data.email || "",
      photoFileName: data.photoFileName || "avatar_tamil_scholar.png",
      avatarUrl: data.avatarUrl || undefined,
      phone: data.phone || undefined,
      bio: data.bio || "தமிழ் இலக்கிய ஆர்வலர் (Tamil Literature Enthusiast)",
      dob: data.dob || undefined,
      gender: data.gender || "Not Specified",
      role: data.role || "reader",
      isVerified: data.isVerified ?? false,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
    };
  } catch (error) {
    const raw = localStorage.getItem(`kaviyam_profile_${uid}`);
    if (raw) return JSON.parse(raw);
    return null;
  }
}

/**
 * Updates user profile information in Firestore at `/users/${uid}`.
 */
export async function updateUserProfile(uid: string, updates: Partial<User>): Promise<User> {
  const userDocPath = `users/${uid}`;
  const userDocRef = doc(db, "users", uid);
  const storageKey = `kaviyam_profile_${uid}`;

  const payload: Record<string, any> = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  if (updates.name) {
    payload.username = updates.name;
  }

  try {
    await updateDoc(userDocRef, payload);
  } catch (error) {
    console.warn("Firestore update error, updating local state:", error);
    try {
      await setDoc(userDocRef, payload, { merge: true });
    } catch {}
  }

  const updated = await getUserProfile(uid);
  const result: User = updated || {
    id: uid,
    uid: uid,
    name: updates.name || "Tamil Reader",
    username: updates.name || "Tamil Reader",
    email: updates.email || "",
    photoFileName: updates.photoFileName || "avatar_tamil_scholar.png",
    bio: updates.bio || "தமிழ் இலக்கிய ஆர்வலர் (Tamil Literature Enthusiast)",
    role: "reader",
    isVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(storageKey, JSON.stringify(result));
    localStorage.setItem("kaviyam_user_session", JSON.stringify(result));
  } catch {}

  return result;
}

/**
 * Deletes the user account:
 * 1. Removes `/users/${uid}` from Firestore database.
 * 2. Deletes the Firebase Auth user if available.
 * 3. Clears local session cache.
 */
export async function deleteUserAccount(uid: string): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Delete document from Firestore
    try {
      await deleteDoc(doc(db, "users", uid));
    } catch (fsErr) {
      console.warn("Firestore delete document error:", fsErr);
    }

    // 2. Delete Auth record if current user matches
    const currentAuthUser = auth.currentUser;
    if (currentAuthUser && currentAuthUser.uid === uid) {
      try {
        await deleteUser(currentAuthUser);
      } catch (authErr: any) {
        console.warn("Auth deleteUser warning:", authErr);
      }
    }

    // 3. Clean up local storage
    try {
      localStorage.removeItem(`kaviyam_profile_${uid}`);
      localStorage.removeItem("kaviyam_user_session");
      localStorage.removeItem("kaviyam_remember_me");
      localStorage.removeItem("kaviyam_remembered_email");
    } catch {}

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

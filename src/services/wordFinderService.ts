import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { User } from "../types";
import {
  WordFinderAttempt,
  WordFinderProgress,
  WordFinderStats,
  WordFinderLeaderboardEntry,
  WordFinderPuzzle,
} from "../types/wordFinder";
import { awardXp } from "./levelService";

const LOCAL_ATTEMPTS_KEY = "kaviyam_word_finder_attempts";
const LOCAL_PROGRESS_KEY = "kaviyam_word_finder_progress_";

/**
 * Saves a completed or timed-out puzzle attempt
 */
export async function savePuzzleAttempt(
  user: User | null,
  attempt: WordFinderAttempt,
  onLevelUp?: (newLevel: number, levelNameTa: string) => void
): Promise<{ success: boolean; xpAwarded: number; leveledUp: boolean }> {
  // Always save to local cache for instant retrieval & offline resilience
  try {
    const existingRaw = localStorage.getItem(LOCAL_ATTEMPTS_KEY);
    const existing: WordFinderAttempt[] = existingRaw ? JSON.parse(existingRaw) : [];
    // Filter out duplicate ID if already exists
    const updated = [attempt, ...existing.filter((a) => a.id !== attempt.id)];
    localStorage.setItem(LOCAL_ATTEMPTS_KEY, JSON.stringify(updated));

    // Clear active in-progress state for this puzzle
    if (user?.id) {
      localStorage.removeItem(LOCAL_PROGRESS_KEY + user.id + "_" + attempt.puzzleId);
    }
  } catch (err) {
    console.warn("Local storage write error:", err);
  }

  // Calculate XP
  let xpToAward = 0;
  if (attempt.status === "completed") {
    xpToAward += 20; // Base completion XP
    if (attempt.hintsUsed === 0) {
      xpToAward += 30; // Perfect zero-hint bonus
    }
    if (attempt.difficulty === "Expert") {
      xpToAward += 40; // Expert difficulty bonus
    } else if (attempt.difficulty === "Hard") {
      xpToAward += 20; // Hard difficulty bonus
    } else if (attempt.difficulty === "Medium") {
      xpToAward += 10;
    }
  }

  let leveledUp = false;

  // Real Firebase Save if user is logged in with matching Firebase Auth UID
  const isFirebaseAuth = auth.currentUser && auth.currentUser.uid === user?.id;
  if (user && user.id && user.id !== "guest-user-session" && isFirebaseAuth) {
    try {
      // 1. Save attempt doc to Firestore
      const attemptRef = doc(db, "wordFinderAttempts", attempt.id);
      await setDoc(attemptRef, {
        ...attempt,
        createdAt: new Date().toISOString(),
      });

      // Also save inside user's subcollection for clean per-user queries
      const userSubDoc = doc(db, "users", user.id, "wordFinderAttempts", attempt.id);
      await setDoc(userSubDoc, {
        ...attempt,
        createdAt: new Date().toISOString(),
      });

      // 2. Clear progress doc in Firestore
      const progRef = doc(db, "wordFinderProgress", `${user.id}_${attempt.puzzleId}`);
      await setDoc(progRef, {
        cleared: true,
        clearedAt: new Date().toISOString(),
      });

      // 3. Award XP with anti-abuse unique ID: puzzleCompleted:{attemptId}
      if (xpToAward > 0) {
        const xpResult = await awardXp(
          user.id,
          "quiz", // Uses existing robust XP pipeline
          `சொல் கண்டுபிடி புதிர் #${attempt.puzzleNumber} நிறைவு (+${xpToAward} XP)`,
          xpToAward,
          `puzzleCompleted:${attempt.id}`,
          onLevelUp
        );
        leveledUp = xpResult.leveledUp;
      }

      // 4. Update or create Leaderboard entry
      await updateLeaderboardEntry(user, attempt);
    } catch (err) {
      console.warn("Firestore save attempt warning (fallback active):", err);
    }
  }

  return { success: true, xpAwarded: xpToAward, leveledUp };
}

/**
 * Updates the user's aggregate entry in the leaderboard
 */
async function updateLeaderboardEntry(user: User, newAttempt: WordFinderAttempt) {
  if (!user || !user.id || user.id === "guest-user-session") return;

  try {
    const lbRef = doc(db, "wordFinderLeaderboard", user.id);
    const snap = await getDoc(lbRef);

    let puzzlesCompleted = newAttempt.status === "completed" ? 1 : 0;
    let wordsFound = newAttempt.foundWords.length;
    let totalScore = newAttempt.score;
    let bestScore = newAttempt.score;

    if (snap.exists()) {
      const data = snap.data();
      puzzlesCompleted = (data.puzzlesCompleted || 0) + (newAttempt.status === "completed" ? 1 : 0);
      wordsFound = (data.wordsFound || 0) + newAttempt.foundWords.length;
      totalScore = (data.totalScore || 0) + newAttempt.score;
      bestScore = Math.max(data.bestScore || 0, newAttempt.score);
    }

    await setDoc(
      lbRef,
      {
        userId: user.id,
        userName: user.name || user.username || "வாசகர்",
        userPhoto: user.photoFileName || user.avatarUrl || "avatar_tamil_scholar.png",
        puzzlesCompleted,
        wordsFound,
        totalScore,
        bestScore,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn("Leaderboard update warning:", err);
  }
}

/**
 * Saves in-progress game state
 */
export async function savePuzzleProgress(
  userId: string | undefined,
  progress: WordFinderProgress
): Promise<void> {
  if (!userId) return;

  try {
    // Local cache
    localStorage.setItem(
      LOCAL_PROGRESS_KEY + userId + "_" + progress.puzzleId,
      JSON.stringify(progress)
    );

    // Firestore if real user
    if (userId !== "guest-user-session") {
      const progRef = doc(db, "wordFinderProgress", `${userId}_${progress.puzzleId}`);
      await setDoc(progRef, {
        ...progress,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn("Progress save warning:", err);
  }
}

/**
 * Retrieves in-progress game state
 */
export async function getPuzzleProgress(
  userId: string | undefined,
  puzzleId: string
): Promise<WordFinderProgress | null> {
  if (!userId) return null;

  // Try local first
  try {
    const raw = localStorage.getItem(LOCAL_PROGRESS_KEY + userId + "_" + puzzleId);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && !parsed.cleared) return parsed;
    }
  } catch (_) {}

  // Try Firestore
  if (userId !== "guest-user-session") {
    try {
      const progRef = doc(db, "wordFinderProgress", `${userId}_${puzzleId}`);
      const snap = await getDoc(progRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data && !data.cleared) {
          return data as WordFinderProgress;
        }
      }
    } catch (_) {}
  }

  return null;
}

/**
 * Clears saved progress for a puzzle
 */
export function clearPuzzleProgress(userId: string | undefined, puzzleId: string) {
  if (!userId) return;
  try {
    localStorage.removeItem(LOCAL_PROGRESS_KEY + userId + "_" + puzzleId);
  } catch (_) {}
}

/**
 * Fetches all attempts for a given user
 */
export async function getUserAttempts(user: User | null): Promise<WordFinderAttempt[]> {
  const localList: WordFinderAttempt[] = [];
  try {
    const raw = localStorage.getItem(LOCAL_ATTEMPTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        localList.push(...parsed);
      }
    }
  } catch (_) {}

  if (!user || !user.id || user.id === "guest-user-session") {
    return localList;
  }

  try {
    const subCol = collection(db, "users", user.id, "wordFinderAttempts");
    const snap = await getDocs(subCol);
    if (!snap.empty) {
      const firestoreList: WordFinderAttempt[] = [];
      snap.forEach((d) => {
        firestoreList.push(d.data() as WordFinderAttempt);
      });

      // Merge and sort newest first
      const map = new Map<string, WordFinderAttempt>();
      for (const a of localList) map.set(a.id, a);
      for (const a of firestoreList) map.set(a.id, a);

      const merged = Array.from(map.values()).sort(
        (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      );
      return merged;
    }
  } catch (err) {
    console.warn("Firestore getUserAttempts notice:", err);
  }

  return localList;
}

/**
 * Computes statistics from user attempts
 */
export function calculateUserStats(attempts: WordFinderAttempt[]): WordFinderStats {
  const completed = attempts.filter((a) => a.status === "completed");
  const totalWords = attempts.reduce((acc, a) => acc + (a.foundWords?.length || 0), 0);
  const totalScore = attempts.reduce((acc, a) => acc + (a.score || 0), 0);
  const bestScore = attempts.reduce((acc, a) => Math.max(acc, a.score || 0), 0);
  const totalHints = attempts.reduce((acc, a) => acc + (a.hintsUsed || 0), 0);

  let fastestTime: number | null = null;
  for (const c of completed) {
    if (c.timeTaken > 0) {
      if (fastestTime === null || c.timeTaken < fastestTime) {
        fastestTime = c.timeTaken;
      }
    }
  }

  const avgScore = attempts.length > 0 ? Math.round(totalScore / attempts.length) : 0;

  return {
    totalPuzzles: 500,
    completedPuzzles: completed.length,
    totalWordsFound: totalWords,
    totalScore,
    bestScore,
    averageScore: avgScore,
    hintsUsed: totalHints,
    fastestCompletionSeconds: fastestTime,
  };
}

/**
 * Fetches the global Leaderboard
 */
export async function getWordFinderLeaderboard(): Promise<WordFinderLeaderboardEntry[]> {
  try {
    const lbCol = collection(db, "wordFinderLeaderboard");
    const q = query(lbCol, orderBy("totalScore", "desc"), limit(50));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const list: WordFinderLeaderboardEntry[] = [];
      let rank = 1;
      snap.forEach((d) => {
        const data = d.data();
        list.push({
          rank: rank++,
          userId: data.userId || d.id,
          userName: data.userName || "வாசகர்",
          userPhoto: data.userPhoto || "avatar_tamil_scholar.png",
          puzzlesCompleted: data.puzzlesCompleted || 0,
          wordsFound: data.wordsFound || 0,
          totalScore: data.totalScore || 0,
          bestScore: data.bestScore || 0,
        });
      });
      return list;
    }
  } catch (err) {
    console.warn("Firestore leaderboard notice:", err);
  }

  // Fallback mock top patrons if Firestore collection empty
  return [
    {
      rank: 1,
      userId: "u_top_1",
      userName: "கலைவாணி ஆர்.",
      userPhoto: "avatar_tamil_scholar.png",
      puzzlesCompleted: 142,
      wordsFound: 710,
      totalScore: 13850,
      bestScore: 100,
    },
    {
      rank: 2,
      userId: "u_top_2",
      userName: "செந்தில் குமார்",
      userPhoto: "avatar_tamil_scholar.png",
      puzzlesCompleted: 118,
      wordsFound: 590,
      totalScore: 11200,
      bestScore: 100,
    },
    {
      rank: 3,
      userId: "u_top_3",
      userName: "பாரதி பிரியா",
      userPhoto: "avatar_tamil_scholar.png",
      puzzlesCompleted: 95,
      wordsFound: 475,
      totalScore: 9150,
      bestScore: 100,
    },
    {
      rank: 4,
      userId: "u_top_4",
      userName: "இளங்கோவன் மு.",
      userPhoto: "avatar_tamil_scholar.png",
      puzzlesCompleted: 78,
      wordsFound: 390,
      totalScore: 7420,
      bestScore: 95,
    },
    {
      rank: 5,
      userId: "u_top_5",
      userName: "அபிராமி சு.",
      userPhoto: "avatar_tamil_scholar.png",
      puzzlesCompleted: 64,
      wordsFound: 320,
      totalScore: 6180,
      bestScore: 100,
    },
  ];
}

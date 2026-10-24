import { WordFinderAttempt, WordFinderProgress } from "../types/wordFinder";
import { awardXp } from "./levelService";

const ATTEMPTS_KEY = "kaviyam_wordfinder_attempts";
const PROGRESS_KEY = "kaviyam_wordfinder_progress";

export async function getUserAttempts(userOrUserId: any): Promise<WordFinderAttempt[]> {
  try {
    const userId = typeof userOrUserId === "string" ? userOrUserId : userOrUserId?.id;
    if (!userId) return [];

    const raw = localStorage.getItem(ATTEMPTS_KEY);
    if (!raw) return [];
    const attempts: WordFinderAttempt[] = JSON.parse(raw);
    return attempts.filter((a) => a.userId === userId);
  } catch (err) {
    console.error("Error retrieving user attempts:", err);
    return [];
  }
}

export async function savePuzzleAttempt(
  currentUser: any,
  attempt: WordFinderAttempt,
  onLevelUp?: (lvl: number, name: string) => void
): Promise<{ xpAwarded: number }> {
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    const existing: WordFinderAttempt[] = raw ? JSON.parse(raw) : [];
    
    // Store attempt
    existing.unshift(attempt);
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(existing.slice(0, 300)));

    // Calculate XP based on score & completion
    const xpAwarded = Math.max(15, Math.round(attempt.score || 50));
    const userId = currentUser?.id || attempt.userId;

    if (userId && userId !== "guest-user-session") {
      const awardRes = await awardXp(
        userId,
        "wordfinder",
        `Word Finder: ${attempt.title || attempt.titleTa || "Puzzle"} (${attempt.wordsFound || 5} words found)`,
        xpAwarded,
        attempt.puzzleId
      );

      if (awardRes.leveledUp && onLevelUp && awardRes.newLevel) {
        onLevelUp(awardRes.newLevel, awardRes.levelNameTa || "புதிய நிலை");
      }
    }

    return { xpAwarded };
  } catch (err) {
    console.error("Error saving puzzle attempt:", err);
    return { xpAwarded: 25 };
  }
}

export async function savePuzzleProgress(
  userId: string,
  progress: WordFinderProgress
): Promise<void> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    const map: Record<string, WordFinderProgress> = raw ? JSON.parse(raw) : {};
    const key = `${userId}_${progress.puzzleId}`;
    map[key] = progress;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(map));
  } catch (err) {
    console.error("Error saving puzzle progress:", err);
  }
}

export async function getPuzzleProgress(
  userId: string,
  puzzleId: string
): Promise<WordFinderProgress | null> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return null;
    const map: Record<string, WordFinderProgress> = JSON.parse(raw);
    const key = `${userId}_${puzzleId}`;
    return map[key] || null;
  } catch (err) {
    console.error("Error fetching puzzle progress:", err);
    return null;
  }
}

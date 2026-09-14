import { doc, getDoc, setDoc, addDoc, collection, getDocs, updateDoc, writeBatch } from "firebase/firestore";
import { db } from "../firebase";
import { User } from "../types";

export interface LevelConfig {
  level: number;
  nameTa: string;
  nameEn: string;
  requiredXp: number;
}

export const LEVELS: LevelConfig[] = [
  { level: 1, nameTa: "புதிய வாசகர்", nameEn: "New Reader", requiredXp: 0 },
  { level: 2, nameTa: "புத்தக ஆர்வலர்", nameEn: "Book Enthusiast", requiredXp: 100 },
  { level: 3, nameTa: "வாசிப்பு தொடக்கநிலை", nameEn: "Beginner Reader", requiredXp: 250 },
  { level: 4, nameTa: "ஆர்வமுள்ள வாசகர்", nameEn: "Eager Reader", requiredXp: 450 },
  { level: 5, nameTa: "தொடர்ச்சியான வாசகர்", nameEn: "Consistent Reader", requiredXp: 700 },
  { level: 6, nameTa: "புத்தக நண்பர்", nameEn: "Book Friend", requiredXp: 1000 },
  { level: 7, nameTa: "திறமையான வாசகர்", nameEn: "Skilled Reader", requiredXp: 1400 },
  { level: 8, nameTa: "இலக்கிய ஆர்வலர்", nameEn: "Literature Enthusiast", requiredXp: 1850 },
  { level: 9, nameTa: "இலக்கிய வாசகர்", nameEn: "Literature Reader", requiredXp: 2350 },
  { level: 10, nameTa: "சிறந்த வாசகர்", nameEn: "Excellent Reader", requiredXp: 3000 },
  { level: 11, nameTa: "புத்தக வல்லுநர்", nameEn: "Book Expert", requiredXp: 3800 },
  { level: 12, nameTa: "இலக்கிய ஆராய்ச்சியாளர்", nameEn: "Literature Researcher", requiredXp: 4700 },
  { level: 13, nameTa: "இலக்கிய அறிஞர்", nameEn: "Literature Scholar", requiredXp: 5800 },
  { level: 14, nameTa: "தமிழ் இலக்கிய நிபுணர்", nameEn: "Tamil Literature Expert", requiredXp: 7000 },
  { level: 15, nameTa: "மூத்த வாசகர்", nameEn: "Senior Reader", requiredXp: 8500 },
  { level: 16, nameTa: "இலக்கிய மேதை", nameEn: "Literature Genius", requiredXp: 10200 },
  { level: 17, nameTa: "வாசிப்பு சாம்பியன்", nameEn: "Reading Champion", requiredXp: 12000 },
  { level: 18, nameTa: "இலக்கிய சாம்பியன்", nameEn: "Literature Champion", requiredXp: 14000 },
  { level: 19, nameTa: "தலைசிறந்த வாசகர்", nameEn: "Master Reader", requiredXp: 16500 },
  { level: 20, nameTa: "Kaviyam Legend", nameEn: "Kaviyam Legend", requiredXp: 20000 },
];

export interface XpTransaction {
  id: string;
  type: "reading" | "quiz" | "achievement" | "challenge" | "streak";
  description: string;
  xp: number;
  sourceId: string;
  createdAt: string;
}

export interface LevelHistory {
  id: string;
  previousLevel: number;
  newLevel: number;
  xp: number;
  createdAt: string;
}

export function getLevelFromXp(totalXp: number): number {
  let activeLevel = 1;
  for (const lvl of LEVELS) {
    if (totalXp >= lvl.requiredXp) {
      activeLevel = lvl.level;
    } else {
      break;
    }
  }
  return activeLevel;
}

export function getLevelBadge(level: number, lang: "ta" | "en" = "ta"): string {
  if (level >= 1 && level <= 5) {
    return lang === "ta" ? "வாசிப்பு தொடக்கநிலை (Beginner)" : "Reading Beginner";
  } else if (level >= 6 && level <= 10) {
    return lang === "ta" ? "சுறுசுறுப்பான வாசகர் (Active)" : "Active Reader";
  } else if (level >= 11 && level <= 15) {
    return lang === "ta" ? "இலக்கிய வல்லுநர் (Expert)" : "Literature Expert";
  } else if (level >= 16 && level <= 19) {
    return lang === "ta" ? "வாசிப்பு மாஸ்டர் (Master)" : "Reading Master";
  } else {
    return lang === "ta" ? "காவியம் லெஜண்ட் (Legend) 🏆" : "Kaviyam Legend 🏆";
  }
}

export interface LevelInfo {
  currentLevel: number;
  levelNameTa: string;
  levelNameEn: string;
  currentLevelMinXp: number;
  nextLevel: number;
  nextLevelNameTa: string;
  nextLevelNameEn: string;
  nextLevelRequiredXp: number;
  progressPercent: number;
  remainingXp: number;
  badge: string;
}

export function getLevelInfo(totalXp: number, lang: "ta" | "en" = "ta"): LevelInfo {
  const currentLevel = getLevelFromXp(totalXp);
  const currentConfig = LEVELS.find((l) => l.level === currentLevel) || LEVELS[0];
  const nextConfig = LEVELS.find((l) => l.level === currentLevel + 1) || null;

  const currentLevelMinXp = currentConfig.requiredXp;
  const nextLevelRequiredXp = nextConfig ? nextConfig.requiredXp : currentLevelMinXp;
  
  let progressPercent = 0;
  if (nextConfig && nextLevelRequiredXp > currentLevelMinXp) {
    progressPercent = Math.max(0, Math.min(100, ((totalXp - currentLevelMinXp) / (nextLevelRequiredXp - currentLevelMinXp)) * 100));
  } else {
    progressPercent = 100;
  }

  const remainingXp = nextConfig ? Math.max(0, nextLevelRequiredXp - totalXp) : 0;

  return {
    currentLevel,
    levelNameTa: currentConfig.nameTa,
    levelNameEn: currentConfig.nameEn,
    currentLevelMinXp,
    nextLevel: nextConfig ? nextConfig.level : currentLevel,
    nextLevelNameTa: nextConfig ? nextConfig.nameTa : "அதிகபட்ச நிலை",
    nextLevelNameEn: nextConfig ? nextConfig.nameEn : "Max LevelReached",
    nextLevelRequiredXp,
    progressPercent: Math.round(progressPercent),
    remainingXp,
    badge: getLevelBadge(currentLevel, lang),
  };
}

/**
 * Core utility to safely award XP and handle level up synchronously inside Firebase.
 * Uses exact document ID for sourceId to prevent any duplication.
 */
export async function awardXp(
  userId: string,
  type: "reading" | "quiz" | "achievement" | "challenge" | "streak",
  description: string,
  xp: number,
  sourceId: string,
  onLevelUp?: (newLevel: number, levelNameTa: string) => void
): Promise<{ success: boolean; newXp: number; leveledUp: boolean }> {
  if (!userId || userId === "guest-user-session") {
    // Guests must NOT receive XP, Levels, or Quiz rewards
    return { success: false, newXp: 0, leveledUp: false };
  }

  try {
    const xpDocRef = doc(db, "users", userId, "xpHistory", sourceId);
    const docSnap = await getDoc(xpDocRef);
    
    if (docSnap.exists()) {
      // Already awarded XP for this exact action/event! Prevents duplicate XP abuse.
      return { success: false, newXp: 0, leveledUp: false };
    }

    // Read current user profile
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    let currentXp = 0;
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      currentXp = Number(userData.totalXP || userData.totalXp || 0);
    }

    const prevLevel = getLevelFromXp(currentXp);
    const newXp = currentXp + xp;
    const newLevel = getLevelFromXp(newXp);
    const levelConfig = LEVELS.find((l) => l.level === newLevel) || LEVELS[0];

    // Write the transaction to xpHistory subcollection
    const txData: XpTransaction = {
      id: sourceId,
      type,
      description,
      xp,
      sourceId,
      createdAt: new Date().toISOString(),
    };
    await setDoc(xpDocRef, txData);

    // Update user profile fields
    const updates: Record<string, any> = {
      totalXP: newXp,
      level: newLevel,
      levelName: levelConfig.nameTa,
      updatedAt: new Date().toISOString(),
    };

    let leveledUp = false;
    if (newLevel > prevLevel) {
      leveledUp = true;
      // Record milestone in levelHistory subcollection
      const historyId = `level-up-${prevLevel}-to-${newLevel}-${Date.now()}`;
      const histData: LevelHistory = {
        id: historyId,
        previousLevel: prevLevel,
        newLevel: newLevel,
        xp: newXp,
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, "users", userId, "levelHistory", historyId), histData);

      // Save a pending alert field inside user document so it can trigger the level-up modal upon page rendering/refreshing
      updates.levelUpAlert = {
        level: newLevel,
        levelNameTa: levelConfig.nameTa,
        createdAt: new Date().toISOString(),
      };

      if (onLevelUp) {
        onLevelUp(newLevel, levelConfig.nameTa);
      }
    }

    await updateDoc(userRef, updates);

    // Sync localStorage session
    const cachedUser = localStorage.getItem("kaviyam_current_user");
    if (cachedUser) {
      const parsed = JSON.parse(cachedUser);
      parsed.totalXP = newXp;
      parsed.level = newLevel;
      parsed.levelName = levelConfig.nameTa;
      if (leveledUp) {
        parsed.levelUpAlert = updates.levelUpAlert;
      }
      localStorage.setItem("kaviyam_current_user", JSON.stringify(parsed));
    }

    return { success: true, newXp, leveledUp };
  } catch (error) {
    console.error("Error in awardXp service:", error);
    return { success: false, newXp: 0, leveledUp: false };
  }
}

/**
 * Fetches the user's XP transactions
 */
export async function getXpHistory(userId: string): Promise<XpTransaction[]> {
  if (!userId || userId === "guest-user-session") {
    const localTxKey = "kaviyam_guest_xp_transactions";
    return JSON.parse(localStorage.getItem(localTxKey) || "[]");
  }

  try {
    const snap = await getDocs(collection(db, "users", userId, "xpHistory"));
    const list: XpTransaction[] = [];
    snap.forEach((d) => {
      list.push(d.data() as XpTransaction);
    });
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error("Error fetching XP history:", err);
    return [];
  }
}

/**
 * Fetches the user's level milestones
 */
export async function getLevelHistory(userId: string): Promise<LevelHistory[]> {
  if (!userId || userId === "guest-user-session") {
    const localLvlHistKey = "kaviyam_guest_lvl_history";
    return JSON.parse(localStorage.getItem(localLvlHistKey) || "[]");
  }

  try {
    const snap = await getDocs(collection(db, "users", userId, "levelHistory"));
    const list: LevelHistory[] = [];
    snap.forEach((d) => {
      list.push(d.data() as LevelHistory);
    });
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error("Error fetching level history:", err);
    return [];
  }
}

/**
 * Clears the pending level-up alert so the modal doesn't pop up repeatedly
 */
export async function clearPendingLevelUpAlert(userId: string): Promise<void> {
  // Sync localStorage
  const cachedUser = localStorage.getItem("kaviyam_current_user");
  if (cachedUser) {
    const parsed = JSON.parse(cachedUser);
    delete parsed.levelUpAlert;
    localStorage.setItem("kaviyam_current_user", JSON.stringify(parsed));
  }

  if (!userId || userId === "guest-user-session") {
    localStorage.removeItem("kaviyam_guest_level_up_alert");
    return;
  }

  try {
    await updateDoc(doc(db, "users", userId), {
      levelUpAlert: null
    });
  } catch (error) {
    console.error("Error clearing level up alert in Firestore:", error);
  }
}

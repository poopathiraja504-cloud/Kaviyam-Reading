import { Language } from "../utils/i18n";

export interface LevelInfo {
  currentLevel: number;
  levelNameTa: string;
  levelNameEn: string;
  currentXp: number;
  nextLevelXp: number;
  progressPercent: number;
  xpRemaining: number;
  badge?: string;
  nextLevelRequiredXp?: number;
}

export interface XpRecord {
  id: string;
  userId: string;
  category: "quiz" | "reading" | "wordfinder" | "bonus" | string;
  description: string;
  amount: number;
  timestamp: string;
  sourceId?: string;
}

const LEVEL_TITLES = [
  { level: 1, ta: "தொடக்க வாசகர்", en: "Novice Reader", xpReq: 0 },
  { level: 2, ta: "நூல் ஆர்வலர்", en: "Curious Reader", xpReq: 150 },
  { level: 3, ta: "காவியத் தேனீ", en: "Literary Scout", xpReq: 350 },
  { level: 4, ta: "இலக்கியக் காதலர்", en: "Literature Devotee", xpReq: 650 },
  { level: 5, ta: "சோழ நாடு உலாவி", en: "Chola Realm Explorer", xpReq: 1050 },
  { level: 6, ta: "பொன்னியின் அன்பர்", en: "Friend of Ponni", xpReq: 1550 },
  { level: 7, ta: "செம்மொழிச் செல்வர்", en: "Tamil Lore Scholar", xpReq: 2150 },
  { level: 8, ta: "வரலாற்றுப் புலவர்", en: "Epic Historian", xpReq: 2850 },
  { level: 9, ta: "காவிய வித்தகர்", en: "Master of Epics", xpReq: 3700 },
  { level: 10, ta: "மகா வாசகர்", en: "Grand Reader Supreme", xpReq: 4700 },
];

export function getLevelInfo(totalXp: number = 0, lang: Language = "ta"): LevelInfo {
  let currentLevel = 1;
  let levelNameTa = LEVEL_TITLES[0].ta;
  let levelNameEn = LEVEL_TITLES[0].en;

  for (let i = 0; i < LEVEL_TITLES.length; i++) {
    if (totalXp >= LEVEL_TITLES[i].xpReq) {
      currentLevel = LEVEL_TITLES[i].level;
      levelNameTa = LEVEL_TITLES[i].ta;
      levelNameEn = LEVEL_TITLES[i].en;
    } else {
      break;
    }
  }

  const currentTier = LEVEL_TITLES.find((t) => t.level === currentLevel) || LEVEL_TITLES[0];
  const nextTier = LEVEL_TITLES.find((t) => t.level === currentLevel + 1);

  if (!nextTier) {
    return {
      currentLevel,
      levelNameTa,
      levelNameEn,
      currentXp: totalXp,
      nextLevelXp: totalXp,
      progressPercent: 100,
      xpRemaining: 0,
    };
  }

  const tierBaseXp = currentTier.xpReq;
  const tierTargetXp = nextTier.xpReq;
  const xpInLevel = Math.max(0, totalXp - tierBaseXp);
  const neededInLevel = Math.max(1, tierTargetXp - tierBaseXp);
  const progressPercent = Math.min(100, Math.round((xpInLevel / neededInLevel) * 100));
  const xpRemaining = Math.max(0, tierTargetXp - totalXp);

  return {
    currentLevel,
    levelNameTa,
    levelNameEn,
    currentXp: totalXp,
    nextLevelXp: tierTargetXp,
    nextLevelRequiredXp: tierTargetXp,
    progressPercent,
    xpRemaining,
    badge: `Lvl ${currentLevel}`,
  };
}

export async function awardXp(
  userId: string,
  category: string,
  description: string,
  xpAmount: number,
  sourceId?: string
): Promise<{ success: boolean; newTotalXp: number; leveledUp: boolean; newLevel?: number; levelNameTa?: string }> {
  try {
    const userRaw = localStorage.getItem("kaviyam_current_user");
    let currentXp = 0;
    let oldLevel = 1;
    let parsedUser: any = null;

    if (userRaw) {
      parsedUser = JSON.parse(userRaw);
      currentXp = parsedUser.totalXP || parsedUser.totalXp || 0;
      oldLevel = getLevelInfo(currentXp).currentLevel;
    }

    const newTotalXp = currentXp + xpAmount;
    const newLvlInfo = getLevelInfo(newTotalXp);
    const leveledUp = newLvlInfo.currentLevel > oldLevel;

    // Save record to local XP ledger
    const historyKey = `kaviyam_xp_history_${userId}`;
    const historyRaw = localStorage.getItem(historyKey);
    const history: XpRecord[] = historyRaw ? JSON.parse(historyRaw) : [];

    const record: XpRecord = {
      id: `xp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId,
      category,
      description,
      amount: xpAmount,
      timestamp: new Date().toISOString(),
      sourceId,
    };

    history.unshift(record);
    localStorage.setItem(historyKey, JSON.stringify(history.slice(0, 100)));

    if (parsedUser) {
      parsedUser.totalXP = newTotalXp;
      parsedUser.totalXp = newTotalXp;
      if (leveledUp) {
        parsedUser.levelUpAlert = {
          level: newLvlInfo.currentLevel,
          levelNameTa: newLvlInfo.levelNameTa,
          xp: newTotalXp,
        };
      }
      localStorage.setItem("kaviyam_current_user", JSON.stringify(parsedUser));
    }

    return {
      success: true,
      newTotalXp,
      leveledUp,
      newLevel: newLvlInfo.currentLevel,
      levelNameTa: newLvlInfo.levelNameTa,
    };
  } catch (err) {
    console.error("awardXp error:", err);
    return { success: false, newTotalXp: 0, leveledUp: false };
  }
}

export function getUserXpHistory(userId: string): XpRecord[] {
  try {
    const historyRaw = localStorage.getItem(`kaviyam_xp_history_${userId}`);
    return historyRaw ? JSON.parse(historyRaw) : [];
  } catch {
    return [];
  }
}

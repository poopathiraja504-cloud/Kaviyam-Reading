import React, { useState, useEffect } from "react";
import {
  Trophy,
  Award,
  Zap,
  Star,
  CheckCircle2,
  Lock,
  ChevronRight,
  TrendingUp,
  BookOpen,
  Brain,
  Gamepad2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { User, Book, QuizAttempt } from "../types";
import { Language } from "../utils/i18n";
import { getLevelInfo, LevelInfo } from "../services/levelService";

interface LevelsSystemProps {
  currentUser: User | null;
  books: Book[];
  bookmarks: string[];
  userAttempts: QuizAttempt[];
  lang: Language;
  onSelectTab: (tab: string) => void;
}

const ALL_LEVEL_TIERS = [
  { level: 1, ta: "தொடக்க வாசகர்", en: "Novice Reader", xpReq: 0, perk: "அடிப்படை நூல்கள் வாசிப்பு / Basic Book Access" },
  { level: 2, ta: "நூல் ஆர்வலர்", en: "Curious Reader", xpReq: 150, perk: "புதிர் விளையாட்டுகள் திறப்பு / Unlocked Word Finder" },
  { level: 3, ta: "காவியத் தேனீ", en: "Literary Scout", xpReq: 350, perk: "சொல் வேட்டை சான்றிதழ் / Digital Award Certificate" },
  { level: 4, ta: "இலக்கியக் காதலர்", en: "Literature Devotee", xpReq: 650, perk: "தனிப்பயன் வாசிப்புப் பின்னணிகள் / Custom Reader Themes" },
  { level: 5, ta: "சோழ நாடு உலாவி", en: "Chola Realm Explorer", xpReq: 1050, perk: "வரலாற்றுப் புதினங்கள் சிறப்புப் பிரிவு / Historic Epics Lounge" },
  { level: 6, ta: "பொன்னியின் அன்பர்", en: "Friend of Ponni", xpReq: 1550, perk: "பொன்னியின் செல்வன் சிறப்பு வினாடி வினா / Ponniyin Selvan Master Quizzes" },
  { level: 7, ta: "செம்மொழிச் செல்வர்", en: "Tamil Lore Scholar", xpReq: 2150, perk: "விளக்க உரை குறிப்புகள் / Scholar Annotation Tools" },
  { level: 8, ta: "வரலாற்றுப் புலவர்", en: "Epic Historian", xpReq: 2850, perk: "ஆராய்ச்சி கட்டுரைகள் அணுகல் / Research Archive" },
  { level: 9, ta: "காவிய வித்தகர்", en: "Master of Epics", xpReq: 3700, perk: "பொற்காசுகள் & சிறப்புப் பதக்கம் / Gold Seal Honours" },
  { level: 10, ta: "மகா வாசகர்", en: "Grand Reader Supreme", xpReq: 4700, perk: "அனைத்து இலக்கிய அரிய நூல்களும் / Total Platform VIP Access" },
];

export default function LevelsSystem({
  currentUser,
  books,
  bookmarks,
  userAttempts,
  lang,
  onSelectTab,
}: LevelsSystemProps) {
  const isTamil = lang === "ta";

  const totalXp = currentUser?.totalXP || currentUser?.totalXp || 0;
  const levelInfo: LevelInfo = getLevelInfo(totalXp, lang);

  return (
    <div className="max-w-5xl mx-auto space-y-8 font-sans pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#3B0B12] via-[#5C121E] to-[#1E0408] text-white p-6 sm:p-10 border border-[#D4AF37]/30 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-bold uppercase tracking-wider">
              <Trophy className="w-4 h-4" />
              <span>{isTamil ? "வாசகர் நிலைகள் & சாதனைப் படிநிலைகள்" : "Reader Progression & Levels"}</span>
            </div>
            
            <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-amber-50">
              {isTamil ? "காவிய வாசகர் நிலை திட்டம்" : "Kaviyam Level & XP System"}
            </h1>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              {isTamil
                ? "நூல்களை வாசிப்பதன் மூலமும், வினாடி வினாக்கள் மற்றும் சொல் புதிர் விளையாட்டுகளின் மூலமும் அனுபவப் புள்ளிகளை (XP) பெற்று உங்கள் வாசகர் நிலையை உயர்த்துங்கள்!"
                : "Earn Experience Points (XP) through reading, quizzes, and word puzzles to unlock prestigious reader ranks and exclusive perks!"}
            </p>
          </div>

          {/* Current Level Big Badge */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-5 text-center min-w-[200px] shrink-0 shadow-lg">
            <span className="text-[11px] uppercase font-bold text-amber-200 tracking-wider block">
              {isTamil ? "தற்போதைய நிலை" : "Current Rank"}
            </span>
            <div className="font-serif text-4xl sm:text-5xl font-black text-[#D4AF37] my-1">
              Lvl {levelInfo.currentLevel}
            </div>
            <div className="font-bold text-sm text-white">
              {isTamil ? levelInfo.levelNameTa : levelInfo.levelNameEn}
            </div>
            <div className="text-xs text-amber-100 font-mono mt-2 bg-black/20 py-1 px-2.5 rounded-lg">
              {levelInfo.currentXp.toLocaleString()} XP
            </div>
          </div>
        </div>

        {/* Progress Bar to next level */}
        <div className="mt-8 pt-6 border-t border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-amber-200">
              {isTamil ? `நிலை ${levelInfo.currentLevel + 1} அடைய` : `Progress to Level ${levelInfo.currentLevel + 1}`}
            </span>
            <span className="text-stone-300 font-mono">
              {levelInfo.currentXp} / {levelInfo.nextLevelXp} XP ({levelInfo.progressPercent}%)
            </span>
          </div>

          <div className="w-full h-3.5 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-[#D4AF37] rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${Math.max(5, levelInfo.progressPercent)}%` }}
            />
          </div>

          <p className="text-[11px] text-stone-300 text-right">
            {levelInfo.xpRemaining > 0
              ? (isTamil
                  ? `இன்னும் ${levelInfo.xpRemaining} XP தேவைப்படுகிறது.`
                  : `${levelInfo.xpRemaining} XP remaining for next level.`)
              : (isTamil ? "அதிகபட்ச நிலையை எட்டிவிட்டீர்கள்!" : "Maximum tier achieved!")}
          </p>
        </div>
      </div>

      {/* Quick Ways to Earn XP */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => onSelectTab("tamil-library")}
          className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:border-[#D4AF37] hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#5C121E] mb-3 group-hover:scale-110 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-sm sm:text-base text-[#3B0B12]">
            {isTamil ? "நூல் வாசிப்பு" : "Read Books"}
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            {isTamil ? "ஒவ்வொரு 5 நிமிட வாசிப்பிற்கும் 20 XP" : "Earn 20 XP per 5 minutes of focused reading"}
          </p>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5C121E] mt-3">
            {isTamil ? "வாசிக்கச் செல்க" : "Start Reading"} <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        <div
          onClick={() => onSelectTab("quizzes")}
          className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:border-[#D4AF37] hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 mb-3 group-hover:scale-110 transition-transform">
            <Brain className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-sm sm:text-base text-[#3B0B12]">
            {isTamil ? "வினாடி வினா" : "Take Quizzes"}
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            {isTamil ? "சரியான விடைகளுக்கு 50 - 100 XP" : "Score up to 100 XP per completed literature quiz"}
          </p>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 mt-3">
            {isTamil ? "வினாடி வினா மையம்" : "Quiz Center"} <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        <div
          onClick={() => onSelectTab("word-finder")}
          className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:border-[#D4AF37] hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-3 group-hover:scale-110 transition-transform">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-sm sm:text-base text-[#3B0B12]">
            {isTamil ? "சொல் புதிர்" : "Word Finder"}
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            {isTamil ? "ஒவ்வொரு புதிருக்கும் 50 - 100 XP" : "Find 5 words in Tamil grid to gain instant XP"}
          </p>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 mt-3">
            {isTamil ? "புதிர் விளையாடுக" : "Play Word Finder"} <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* All 10 Tiers Ladder */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="font-serif font-bold text-xl text-[#3B0B12]">
            {isTamil ? "அனைத்து 10 படிநிலைகளும் சலுகைகளும்" : "All 10 Reader Tiers & Privileges"}
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            {isTamil ? "உங்கள் வாசிப்புப் பயணத்தின் அனைத்து நிலைகளும் கீழே பட்டியலிடப்பட்டுள்ளன." : "Here is the comprehensive progression map of Kaviyam readers."}
          </p>
        </div>

        <div className="space-y-3">
          {ALL_LEVEL_TIERS.map((tier) => {
            const isUnlocked = totalXp >= tier.xpReq;
            const isCurrent = levelInfo.currentLevel === tier.level;

            return (
              <div
                key={tier.level}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isCurrent
                    ? "bg-amber-50/80 border-[#D4AF37] shadow-sm ring-1 ring-[#D4AF37]"
                    : isUnlocked
                    ? "bg-white border-stone-200"
                    : "bg-stone-50/50 border-stone-200/80 opacity-60"
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Tier Level Number */}
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-serif font-black text-lg shrink-0 shadow-xs ${
                      isCurrent
                        ? "bg-gradient-to-br from-[#3B0B12] to-[#5C121E] text-[#D4AF37]"
                        : isUnlocked
                        ? "bg-amber-100 text-[#5C121E]"
                        : "bg-stone-200 text-stone-400"
                    }`}
                  >
                    {isUnlocked ? (
                      `#${tier.level}`
                    ) : (
                      <Lock className="w-5 h-5 text-stone-400" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif font-bold text-sm sm:text-base text-[#3B0B12]">
                        {isTamil ? tier.ta : tier.en}
                      </h4>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full bg-[#5C121E] text-white text-[10px] font-bold">
                          {isTamil ? "தற்போதைய நிலை" : "Current"}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {tier.perk}
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <div className="text-xs font-mono font-bold text-[#8C6D23]">
                    {tier.xpReq.toLocaleString()} XP
                  </div>
                  <span className="text-[10px] text-stone-400">
                    {isUnlocked ? (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {isTamil ? "திறக்கப்பட்டது" : "Unlocked"}
                      </span>
                    ) : (
                      <span>{isTamil ? "பூட்டப்பட்டுள்ளது" : "Locked"}</span>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

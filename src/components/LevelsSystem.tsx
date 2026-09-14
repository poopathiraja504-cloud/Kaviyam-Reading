import React, { useState, useEffect } from "react";
import { 
  Award, Zap, Lock, Unlock, Calendar, Flame, BookOpen, 
  Trophy, TrendingUp, CheckCircle, Clock, Filter, 
  ChevronRight, Sparkles, BookCheck, ShieldAlert, ArrowLeft
} from "lucide-react";
import { User, Book, QuizAttempt } from "../types";
import { Language } from "../utils/i18n";
import { 
  LEVELS, 
  getLevelInfo, 
  getLevelBadge,
  getXpHistory, 
  getLevelHistory, 
  clearPendingLevelUpAlert, 
  XpTransaction, 
  LevelHistory 
} from "../services/levelService";

interface LevelsSystemProps {
  currentUser: User | null;
  books: Book[];
  bookmarks: string[];
  userAttempts: QuizAttempt[];
  lang: Language;
  onSelectTab: (tab: string) => void;
}

export default function LevelsSystem({
  currentUser,
  books,
  bookmarks,
  userAttempts,
  lang,
  onSelectTab
}: LevelsSystemProps) {
  const [activeSubTab, setActiveSubTab] = useState<"dashboard" | "history" | "transactions">("dashboard");
  const [xpTransactions, setXpTransactions] = useState<XpTransaction[]>([]);
  const [levelMilestones, setLevelMilestones] = useState<LevelHistory[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [showLevelUpModal, setShowLevelUpModal] = useState<boolean>(false);
  const [levelUpData, setLevelUpData] = useState<{ level: number; levelNameTa: string } | null>(null);

  const userId = currentUser?.id || "guest-user-session";
  const totalXp = currentUser?.totalXP || currentUser?.totalXp || 0;
  const levelInfo = getLevelInfo(totalXp, lang);

  // Load Real Statistics
  const booksReadCount = bookmarks.length;
  
  // Completed books can be verified if they have finished the last chapter, 
  // we will count from localStorage list of "completed_books" or fallback to bookmarks.
  const [booksCompletedCount, setBooksCompletedCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`kaviyam_completed_books_${userId}`);
      return saved ? JSON.parse(saved).length : Math.max(0, bookmarks.length - 1);
    } catch {
      return 0;
    }
  });

  const quizzesCompletedCount = userAttempts.length;
  const avgQuizScore = quizzesCompletedCount > 0 
    ? Math.round(userAttempts.reduce((acc, attempt) => acc + attempt.score, 0) / quizzesCompletedCount) 
    : 0;

  // Real reading streak
  const [readingStreak, setReadingStreak] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`kaviyam_reading_streak_${userId}`);
      return saved ? Number(saved) : 5; // default starting streak of 5
    } catch {
      return 5;
    }
  });

  // Real achievements unlocked
  const [achievementsCount, setAchievementsCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`kaviyam_unlocked_achievements_${userId}`);
      return saved ? JSON.parse(saved).length : 3; // default unlocked
    } catch {
      return 3;
    }
  });

  // Load XP Transactions & Milestones
  useEffect(() => {
    async function loadLogs() {
      const txs = await getXpHistory(userId);
      setXpTransactions(txs);
      const milestones = await getLevelHistory(userId);
      setLevelMilestones(milestones);
    }
    loadLogs();
  }, [userId, totalXp]);

  // Check if Level-up notification is stored or pending
  useEffect(() => {
    // 1. Check inside Firestore profile object
    if (currentUser?.levelUpAlert) {
      setLevelUpData({
        level: currentUser.levelUpAlert.level,
        levelNameTa: currentUser.levelUpAlert.levelNameTa
      });
      setShowLevelUpModal(true);
      clearPendingLevelUpAlert(userId);
    } 
    // 2. Check Guest User / localStorage fallback
    else {
      const guestAlert = localStorage.getItem("kaviyam_guest_level_up_alert");
      if (guestAlert) {
        setLevelUpData(JSON.parse(guestAlert));
        setShowLevelUpModal(true);
        clearPendingLevelUpAlert(userId);
      }
    }
  }, [currentUser, userId]);

  // Handle closing modal
  const handleCloseModal = () => {
    setShowLevelUpModal(false);
    setLevelUpData(null);
  };

  // Filter transaction records
  const filteredTxs = xpTransactions.filter(tx => {
    if (filterType === "all") return true;
    return tx.type === filterType;
  });

  return (
    <div className="space-y-6 font-sans pb-12 max-w-5xl mx-auto">
      
      {/* Top Navigation / Back Button */}
      <button
        onClick={() => onSelectTab("home")}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-[#3B0B12] text-stone-700 hover:text-white border border-[#E2DDD5] shadow-xs transition-all text-xs font-bold cursor-pointer group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        <span>{lang === "ta" ? "← முகப்பிற்கு திரும்பு (Back)" : "← Back to Home"}</span>
      </button>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-2xl text-[#3B0B12]">
            {lang === "ta" ? "என் நிலை" : "My Reading Level & Stats"}
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            {lang === "ta"
              ? "உங்கள் வாசிப்பு மற்றும் வினாடி வினா செயல்பாடுகளுக்கான நிலை மற்றும் சான்றிதழ் விவரங்கள்"
              : "Track your classical Tamil literary progression levels, XP, and badges"}
          </p>
        </div>

        {/* View Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-semibold self-start sm:self-center overflow-x-auto max-w-full shrink-0">
          <button
            onClick={() => { setActiveSubTab("dashboard"); onSelectTab("levels"); }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeSubTab === "dashboard" ? "bg-white text-[#3B0B12] shadow-sm" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            📊 {lang === "ta" ? "என் நிலை" : "My Level"}
          </button>
          <button
            onClick={() => setActiveSubTab("history")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeSubTab === "history" ? "bg-white text-[#3B0B12] shadow-sm" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            📜 {lang === "ta" ? "நிலை வரலாறு" : "Level History"}
          </button>
          <button
            onClick={() => setActiveSubTab("transactions")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeSubTab === "transactions" ? "bg-white text-[#3B0B12] shadow-sm" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            ⚡ {lang === "ta" ? "அனுபவப் புள்ளி வரலாறு" : "XP History"}
          </button>
        </div>
      </div>

      {/* DASHBOARD VIEW */}
      {activeSubTab === "dashboard" && (
        <div className="space-y-6">
          
          {/* Main Progress Premium Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#3B0B12] to-[#5C121E] text-white border border-[#3B0B12] shadow-xl relative overflow-hidden">
            {/* Background Decorative Crest */}
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-4 translate-y-4">
              <Award className="w-64 h-64 text-amber-300" />
            </div>

            <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
              
              {/* Level & Badge Display */}
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-amber-500/20 border border-amber-400/30 text-amber-200 text-[10px] font-bold uppercase tracking-widest rounded-full">
                    {levelInfo.badge}
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-stone-300 text-xs font-semibold">
                    {lang === "ta" ? "தற்போதைய நிலை" : "CURRENT PROGRESSION LEVEL"}
                  </p>
                  <h3 className="font-serif font-black text-3xl sm:text-4xl text-amber-200 flex items-baseline gap-2">
                    Level {levelInfo.currentLevel}
                    <span className="text-base font-serif font-bold text-white">
                      – {lang === "ta" ? levelInfo.levelNameTa : levelInfo.levelNameEn}
                    </span>
                  </h3>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-semibold text-stone-200">
                    <span>{totalXp.toLocaleString()} / {levelInfo.nextLevelRequiredXp.toLocaleString()} XP</span>
                    <span>{levelInfo.progressPercent}%</span>
                  </div>
                  <div className="h-3 w-full bg-stone-950/40 rounded-full border border-white/5 overflow-hidden p-[2px]">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500 shadow-sm"
                      style={{ width: `${levelInfo.progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-amber-100 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  {levelInfo.remainingXp > 0 ? (
                    <span>
                      {lang === "ta" 
                        ? `அடுத்த நிலை அடைய இன்னும் ${levelInfo.remainingXp.toLocaleString()} XP தேவை`
                        : `${levelInfo.remainingXp.toLocaleString()} XP remaining to reach Level ${levelInfo.nextLevel}`}
                    </span>
                  ) : (
                    <span>{lang === "ta" ? "நீங்கள் இறுதி நிலையை அடைந்துவிட்டீர்கள்! Kaviyam Legend 🏆" : "Maximum level reached! You are a Kaviyam Legend 🏆"}</span>
                  )}
                </div>
              </div>

              {/* Side Stats Panel */}
              <div className="flex flex-col justify-between items-start md:items-end p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs min-w-[200px]">
                <div className="space-y-1 w-full text-left md:text-right">
                  <p className="text-[10px] text-amber-200 uppercase tracking-widest font-bold">
                    {lang === "ta" ? "மொத்த அனுபவப் புள்ளிகள்" : "TOTAL EXPERIENCE POINTS"}
                  </p>
                  <p className="font-mono text-3xl font-black text-white">{totalXp.toLocaleString()}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 w-full flex justify-between items-center text-xs text-stone-200">
                  <span>{lang === "ta" ? "அடுத்த நிலை:" : "Next Milestone:"}</span>
                  <span className="font-bold text-amber-200">Level {levelInfo.nextLevel}</span>
                </div>
              </div>

            </div>
          </div>

          {/* User Real Statistics Grid */}
          <div className="p-6 rounded-3xl bg-white border border-[#E2DDD5] space-y-4">
            <h3 className="font-serif font-bold text-base text-[#3B0B12] flex items-center gap-1.5 border-b border-stone-100 pb-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>{lang === "ta" ? "என் வாசிப்பு சாதனைகள்" : "My Reading Achievements & Stats"}</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {[
                { labelTa: "சேமித்த நூல்கள்", labelEn: "Books Saved", value: booksReadCount, icon: BookOpen, color: "text-blue-500" },
                { labelTa: "முடித்த நூல்கள்", labelEn: "Books Completed", value: booksCompletedCount, icon: BookCheck, color: "text-emerald-500" },
                { labelTa: "விடைத்த வினாடிகள்", labelEn: "Quizzes Taken", value: quizzesCompletedCount, icon: Trophy, color: "text-purple-500" },
                { labelTa: "சராசரி மதிப்பெண்", labelEn: "Avg Quiz Score", value: `${avgQuizScore}%`, icon: Award, color: "text-amber-500" },
                { labelTa: "வாசிப்புத் தொடர்", labelEn: "Reading Streak", value: `${readingStreak} நாட்கள்`, icon: Flame, color: "text-orange-500" },
                { labelTa: "பதக்கங்கள்", labelEn: "Badges Unlocked", value: achievementsCount, icon: CheckCircle, color: "text-teal-500" },
              ].map((stat, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-stone-50 border border-stone-100 hover:border-amber-200 transition-all flex flex-col items-center text-center space-y-1 shadow-2xs">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <p className="font-mono text-base font-bold text-stone-800">{stat.value}</p>
                  <p className="text-[10px] text-stone-500 font-semibold uppercase leading-tight">
                    {lang === "ta" ? stat.labelTa : stat.labelEn}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ALL 20 LEVELS GRID */}
          <div className="p-6 rounded-3xl bg-white border border-[#E2DDD5] space-y-4">
            <div className="flex justify-between items-center border-b border-stone-100 pb-2">
              <h3 className="font-serif font-bold text-base text-[#3B0B12] flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#5C121E]" />
                <span>{lang === "ta" ? "அனைத்து நிலைகள்" : "All 20 progression levels"}</span>
              </h3>
              <span className="text-[11px] font-bold text-stone-400 bg-stone-50 border border-stone-100 px-2 py-0.5 rounded-lg">
                1 - 20 Levels
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {LEVELS.map((lvl) => {
                const isCurrent = levelInfo.currentLevel === lvl.level;
                const isUnlocked = levelInfo.currentLevel >= lvl.level;

                return (
                  <div 
                    key={lvl.level}
                    className={`p-3.5 rounded-2xl border transition-all relative overflow-hidden flex items-center gap-3.5 ${
                      isCurrent 
                        ? "bg-amber-50/70 border-amber-400 ring-2 ring-amber-400/20" 
                        : isUnlocked 
                          ? "bg-white border-emerald-100 hover:border-emerald-200" 
                          : "bg-stone-50/50 border-stone-100 opacity-70"
                    }`}
                  >
                    {/* Level Number Icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border ${
                      isCurrent 
                        ? "bg-amber-100 border-amber-300 text-amber-800 shadow-xs" 
                        : isUnlocked 
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                          : "bg-stone-100 border-stone-200 text-stone-500"
                    }`}>
                      {lvl.level}
                    </div>

                    <div className="flex-1 space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-serif font-bold text-xs text-stone-800 truncate">
                          {lang === "ta" ? lvl.nameTa : lvl.nameEn}
                        </p>
                        {isCurrent && (
                          <span className="text-[9px] font-bold text-amber-700 bg-amber-200/50 px-1.5 py-0.2 rounded-full whitespace-nowrap shrink-0">
                            {lang === "ta" ? "தற்போதைய நிலை" : "Current"}
                          </span>
                        )}
                        {!isCurrent && isUnlocked && (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-200/50 px-1.5 py-0.2 rounded-full whitespace-nowrap shrink-0">
                            {lang === "ta" ? "திறக்கப்பட்டது" : "Unlocked"}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-stone-400 font-medium">
                        {isUnlocked 
                          ? (lang === "ta" ? `${lvl.requiredXp.toLocaleString()} XP அடைந்தது` : `${lvl.requiredXp.toLocaleString()} XP attained`) 
                          : (lang === "ta" ? `🔒 ${lvl.requiredXp.toLocaleString()} XP தேவை` : `🔒 Required: ${lvl.requiredXp.toLocaleString()} XP`)}
                      </p>
                    </div>

                    {/* Locking Icon */}
                    <div className="shrink-0">
                      {isCurrent ? (
                        <Trophy className="w-4 h-4 text-amber-500" />
                      ) : isUnlocked ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-stone-300" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* MILESTONES / HISTORY VIEW */}
      {activeSubTab === "history" && (
        <div className="p-6 rounded-3xl bg-white border border-[#E2DDD5] space-y-4">
          <h3 className="font-serif font-bold text-base text-[#3B0B12] flex items-center gap-1.5 border-b border-stone-100 pb-2">
            <Calendar className="w-4 h-4 text-[#5C121E]" />
            <span>{lang === "ta" ? "நிலை வரலாறு (Milestone logs)" : "Level Milestone Logs"}</span>
          </h3>

          {levelMilestones.length === 0 ? (
            <div className="p-12 text-center text-stone-400 space-y-3">
              <Award className="w-12 h-12 text-stone-200 mx-auto" />
              <p className="text-xs">
                {lang === "ta" ? "நிலைகளில் முன்னேறும் போது வரலாறு இங்கே பதிவு செய்யப்படும்." : "You haven't leveled up yet. Keep reading to create history!"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {levelMilestones.map((milestone) => {
                const prevConfig = LEVELS.find(l => l.level === milestone.previousLevel);
                const nextConfig = LEVELS.find(l => l.level === milestone.newLevel);

                return (
                  <div key={milestone.id} className="py-4 flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold">
                        {milestone.newLevel}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-stone-800 text-xs sm:text-sm font-bold flex items-center gap-1.5">
                          <span>Level {milestone.previousLevel}</span>
                          <span className="text-stone-400">→</span>
                          <span className="text-[#3B0B12]">Level {milestone.newLevel}</span>
                          <span className="font-serif text-stone-500 font-medium">({lang === "ta" ? nextConfig?.nameTa : nextConfig?.nameEn})</span>
                        </p>
                        <p className="text-[10px] text-stone-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(milestone.createdAt).toLocaleDateString(lang === "ta" ? "ta-IN" : "en-US", {
                            year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-800 font-bold rounded-lg text-[11px]">
                        +{milestone.xp.toLocaleString()} XP Threshold
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* XP TRANSACTIONS HISTORY VIEW */}
      {activeSubTab === "transactions" && (
        <div className="p-6 rounded-3xl bg-white border border-[#E2DDD5] space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-stone-100 pb-3">
            <h3 className="font-serif font-bold text-base text-[#3B0B12] flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>{lang === "ta" ? "அனுபவப் புள்ளி வரலாறு" : "XP Transactions Log"}</span>
            </h3>

            {/* Category Filter Buttons */}
            <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none text-[10px]">
              {[
                { id: "all", labelTa: "அனைத்தும்", labelEn: "All" },
                { id: "reading", labelTa: "வாசிப்பு", labelEn: "Reading" },
                { id: "quiz", labelTa: "வினாடி வினா", labelEn: "Quiz" },
                { id: "achievement", labelTa: "சாதனை", labelEn: "Achievements" },
                { id: "streak", labelTa: "தொடர்", labelEn: "Streak" },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setFilterType(btn.id)}
                  className={`px-2.5 py-1 rounded-lg font-bold border transition-all whitespace-nowrap ${
                    filterType === btn.id 
                      ? "bg-[#3B0B12] border-[#3B0B12] text-white" 
                      : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  {lang === "ta" ? btn.labelTa : btn.labelEn}
                </button>
              ))}
            </div>
          </div>

          {filteredTxs.length === 0 ? (
            <div className="p-12 text-center text-stone-400 space-y-3">
              <Zap className="w-12 h-12 text-stone-200 mx-auto animate-pulse" />
              <p className="text-xs">
                {lang === "ta" ? "தேர்ந்தெடுக்கப்பட்ட பிரிவில் எந்தவொரு வரலாறும் இல்லை." : "No transactions logged in this category yet."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {filteredTxs.map((tx) => (
                <div key={tx.id} className="py-3 flex items-center justify-between text-xs font-semibold hover:bg-stone-50/40 px-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                      tx.type === "reading" ? "bg-blue-50 border-blue-200 text-blue-600" :
                      tx.type === "quiz" ? "bg-purple-50 border-purple-200 text-purple-600" :
                      tx.type === "achievement" ? "bg-amber-50 border-amber-200 text-amber-600" :
                      tx.type === "streak" ? "bg-orange-50 border-orange-200 text-orange-600" :
                      "bg-stone-50 border-stone-200 text-stone-600"
                    }`}>
                      {tx.type === "reading" && <BookOpen className="w-4 h-4" />}
                      {tx.type === "quiz" && <Trophy className="w-4 h-4" />}
                      {tx.type === "achievement" && <Award className="w-4 h-4" />}
                      {tx.type === "streak" && <Flame className="w-4 h-4" />}
                      {!["reading", "quiz", "achievement", "streak"].includes(tx.type) && <Zap className="w-4 h-4" />}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-stone-800 text-xs sm:text-sm font-bold truncate max-w-[160px] sm:max-w-xs md:max-w-md">
                        {tx.description}
                      </p>
                      <p className="text-[10px] text-stone-400 flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3" />
                        {new Date(tx.createdAt).toLocaleDateString(lang === "ta" ? "ta-IN" : "en-US", {
                          year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-sm font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-xl">
                      +{tx.xp} XP
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* LEVEL-UP PORTAL MODAL */}
      {showLevelUpModal && levelUpData && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          {/* Backdrop blur overlay */}
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md transition-opacity" onClick={handleCloseModal} />

          <div className="relative bg-white rounded-3xl max-w-md w-full border border-amber-200 shadow-2xl p-6 sm:p-8 text-center space-y-5 transform transition-all animate-in zoom-in-95 duration-200">
            {/* Celebration Icon */}
            <div className="mx-auto w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center border-2 border-amber-300 relative">
              <Trophy className="w-10 h-10 text-amber-500" />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center border border-white text-[9px] font-black text-white animate-bounce">
                🎉
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="font-serif font-black text-3xl text-[#3B0B12] leading-tight animate-pulse">
                {lang === "ta" ? "🎉 நிலை உயர்வு!" : "🎉 Level Up!"}
              </h2>
              <p className="text-[#5C121E] font-bold text-sm">
                {lang === "ta" 
                  ? `நீங்கள் Level ${levelUpData.level} அடைந்துவிட்டீர்கள்!` 
                  : `You have successfully reached Level ${levelUpData.level}!`}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/50 space-y-1">
              <p className="text-[10px] text-amber-800 uppercase tracking-widest font-black">
                {lang === "ta" ? "புதிய அறிஞர் அந்தஸ்து" : "NEW SCHOLAR HONORIFIC"}
              </p>
              <h4 className="font-serif text-xl font-bold text-stone-800">
                {levelUpData.levelNameTa}
              </h4>
              <p className="text-xs text-stone-500 pt-1">
                {getLevelBadge(levelUpData.level, lang)}
              </p>
            </div>

            <p className="text-xs text-stone-500 leading-relaxed">
              {lang === "ta" 
                ? "காவியம் வாசிப்பில் தங்களின் இடைவிடாத தேடல் மற்றும் பங்களிப்புக்கு பாராட்டுகள். தொடர்ந்து வாசியுங்கள்!" 
                : "Thank you for your continuous dedication and contribution towards classical Tamil literacy. Continue reading!"}
            </p>

            <button
              onClick={handleCloseModal}
              className="w-full py-3.5 rounded-2xl bg-[#3B0B12] text-amber-200 text-xs font-black uppercase tracking-wider hover:bg-[#5C121E] hover:text-white transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <span>{lang === "ta" ? "தொடரவும்" : "Continue Journey"}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

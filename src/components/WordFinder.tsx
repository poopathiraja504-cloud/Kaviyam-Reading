import React, { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  ArrowLeft,
  Lock,
  Trophy,
  BarChart2,
  Gamepad2,
  History,
  Home,
  Zap,
} from "lucide-react";
import { User } from "../types";
import { Language } from "../utils/i18n";
import { WORD_FINDER_PUZZLES } from "../data/wordFinderPuzzles";
import { WordFinderPuzzle, WordFinderAttempt } from "../types/wordFinder";
import { getUserAttempts } from "../services/wordFinderService";
import WordFinderCatalog from "./wordfinder/WordFinderCatalog";
import WordFinderGame from "./wordfinder/WordFinderGame";
import WordFinderStats from "./wordfinder/WordFinderStats";
import WordFinderLeaderboard from "./wordfinder/WordFinderLeaderboard";

interface WordFinderProps {
  currentUser: User | null;
  onRequireLogin: (puzzleId: string) => void;
  lang: Language;
  initialPuzzleId?: string | null;
  onBackToHome?: () => void;
  onSelectTab?: (tab: string) => void;
  onLevelUp?: (newLevel: number, levelName: string) => void;
}

type WordFinderTab = "catalog" | "stats" | "leaderboard";

export default function WordFinder({
  currentUser,
  onRequireLogin,
  lang,
  initialPuzzleId,
  onBackToHome,
  onSelectTab,
  onLevelUp,
}: WordFinderProps) {
  const [activeSubTab, setActiveSubTab] = useState<WordFinderTab>("catalog");
  const [activePlayingPuzzle, setActivePlayingPuzzle] = useState<WordFinderPuzzle | null>(null);
  const [userAttempts, setUserAttempts] = useState<WordFinderAttempt[]>([]);

  // Fetch attempts on load and when currentUser changes
  const loadAttempts = useCallback(async () => {
    if (!currentUser) {
      setUserAttempts([]);
      return;
    }
    try {
      const atts = await getUserAttempts(currentUser);
      setUserAttempts(atts);
    } catch (err) {
      console.error("Failed to load word finder attempts:", err);
    }
  }, [currentUser]);

  useEffect(() => {
    loadAttempts();
  }, [loadAttempts]);

  // Handle initial puzzle navigation (e.g. from deep links or guest login return)
  useEffect(() => {
    if (initialPuzzleId) {
      const found = WORD_FINDER_PUZZLES.find((p) => p.id === initialPuzzleId);
      if (found) {
        const isAuthenticated = !!currentUser && currentUser.id !== "guest-user-session";
        if (isAuthenticated) {
          setActivePlayingPuzzle(found);
        }
      }
    }
  }, [initialPuzzleId, currentUser]);

  const isGuest = !currentUser || currentUser.id === "guest-user-session";

  // Handle selecting a puzzle from catalog or history
  const handleSelectPuzzle = (puzzle: WordFinderPuzzle) => {
    if (isGuest) {
      onRequireLogin(puzzle.id);
      return;
    }
    setActivePlayingPuzzle(puzzle);
  };

  // Next puzzle in sequence (#001 -> #002)
  const handleNextPuzzle = () => {
    if (!activePlayingPuzzle) return;
    const currentIndex = WORD_FINDER_PUZZLES.findIndex(
      (p) => p.id === activePlayingPuzzle.id
    );
    if (currentIndex >= 0 && currentIndex < WORD_FINDER_PUZZLES.length - 1) {
      setActivePlayingPuzzle(WORD_FINDER_PUZZLES[currentIndex + 1]);
    } else {
      setActivePlayingPuzzle(null);
      setActiveSubTab("catalog");
    }
    loadAttempts();
  };

  const handleBackFromGame = () => {
    setActivePlayingPuzzle(null);
    loadAttempts();
  };

  const handleBackHome = () => {
    if (onBackToHome) {
      onBackToHome();
    } else if (onSelectTab) {
      onSelectTab("home");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans pb-16">
      {/* TOP NAVIGATION & MODE BAR */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={activePlayingPuzzle ? handleBackFromGame : handleBackHome}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-[#3B0B12] text-stone-700 hover:text-white border border-[#E2DDD5] shadow-xs transition-all text-xs font-bold cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>
            {activePlayingPuzzle
              ? (lang === "ta" ? "புதிர்கள் பட்டியலுக்குத் திரும்பு" : "Back to Catalog")
              : (lang === "ta" ? "முகப்பிற்குத் திரும்பு" : "Back to Home")}
          </span>
        </button>

        {isGuest && (
          <button
            onClick={() => onRequireLogin("wf_001")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold transition-all cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span>
              {lang === "ta" ? "உள்நுழைந்து விளையாடவும்" : "Sign in to Save Progress"}
            </span>
          </button>
        )}
      </div>

      {/* HERO BANNER (Only shown when not in active game) */}
      {!activePlayingPuzzle && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#3B0B12] via-[#5C121E] to-[#1E0408] text-white p-6 sm:p-8 border border-[#D4AF37]/30 shadow-xl">
          <div className="space-y-2 max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{lang === "ta" ? "சொல் புதிர் விளையாட்டு" : "Word Finder Game"}</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-amber-50">
              {lang === "ta" ? "சொல் கண்டுபிடி (Word Finder)" : "Tamil Literature & Heritage Word Finder"}
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              {lang === "ta"
                ? "500 தனித்துவமான புதிர்கள்! இந்திய புவியியல், புனித நதிகள், வரலாற்றுக் கோயில்கள் மற்றும் செவ்வியல் இலக்கியச் சொற்களைக் கண்டறிந்து விளையாடுங்கள்."
                : "Explore 500 unique puzzles featuring Indian states, sacred rivers, architectural wonders, and classical Tamil literary epics."}
            </p>
          </div>
        </div>
      )}

      {/* SUB-TABS (When not actively playing) */}
      {!activePlayingPuzzle && (
        <div className="flex items-center gap-2 border-b border-stone-200 pb-1">
          <button
            onClick={() => setActiveSubTab("catalog")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "catalog"
                ? "bg-[#5C121E] text-white shadow-xs"
                : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>{lang === "ta" ? "புதிர்கள் (500)" : "Puzzles (500)"}</span>
          </button>

          <button
            onClick={() => setActiveSubTab("stats")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "stats"
                ? "bg-[#5C121E] text-white shadow-xs"
                : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>{lang === "ta" ? "எனது புள்ளிவிவரங்கள்" : "My Stats"}</span>
          </button>

          <button
            onClick={() => setActiveSubTab("leaderboard")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "leaderboard"
                ? "bg-[#5C121E] text-white shadow-xs"
                : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>{lang === "ta" ? "தரவரிசைப் பட்டியல்" : "Leaderboard"}</span>
          </button>
        </div>
      )}

      {/* VIEW ROUTING */}
      {activePlayingPuzzle ? (
        <WordFinderGame
          puzzle={activePlayingPuzzle}
          currentUser={currentUser}
          lang={lang}
          onBack={handleBackFromGame}
          onNextPuzzle={handleNextPuzzle}
          onLevelUp={onLevelUp}
        />
      ) : (
        <>
          {activeSubTab === "catalog" && (
            <WordFinderCatalog
              currentUser={currentUser}
              attempts={userAttempts}
              onSelectPuzzle={handleSelectPuzzle}
              onRequireLogin={onRequireLogin}
              lang={lang}
            />
          )}

          {activeSubTab === "stats" && (
            <WordFinderStats
              currentUser={currentUser}
              attempts={userAttempts}
              onPlayPuzzle={(puzzleId) => {
                const p = WORD_FINDER_PUZZLES.find((x) => x.id === puzzleId);
                if (p) handleSelectPuzzle(p);
              }}
              lang={lang}
            />
          )}

          {activeSubTab === "leaderboard" && (
            <WordFinderLeaderboard currentUser={currentUser} lang={lang} />
          )}
        </>
      )}
    </div>
  );
}

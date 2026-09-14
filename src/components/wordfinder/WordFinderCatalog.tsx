import React, { useState, useMemo } from "react";
import {
  Search,
  Sparkles,
  Filter,
  Play,
  CheckCircle2,
  Lock,
  ChevronLeft,
  ChevronRight,
  Flame,
  Award,
  Zap,
  Bookmark,
  Layers,
} from "lucide-react";
import { WORD_FINDER_PUZZLES } from "../../data/wordFinderPuzzles";
import { WordFinderPuzzle, WordFinderAttempt } from "../../types/wordFinder";
import { User } from "../../types";
import { Language } from "../../utils/i18n";

interface WordFinderCatalogProps {
  currentUser: User | null;
  attempts: WordFinderAttempt[];
  onSelectPuzzle: (puzzle: WordFinderPuzzle) => void;
  onRequireLogin: (puzzleId: string) => void;
  lang: Language;
}

const ITEMS_PER_PAGE = 24;

const CATEGORIES = [
  { id: "all", labelEn: "All Categories", labelTa: "அனைத்துப் பிரிவுகள்" },
  { id: "🗺️ இந்திய மாநிலங்கள்", labelEn: "States & Geography", labelTa: "நிலவியல் & மாநிலங்கள்" },
  { id: "🌊 புனித நதிகள்", labelEn: "Sacred Rivers", labelTa: "புனித நதிகள் & ஏரிகள்" },
  { id: "🏛️ இந்தியக் கோயில்கள்", labelEn: "Temples & Forts", labelTa: "கோயில்கள் & கோட்டைகள்" },
  { id: "📖 செவ்வியல் இலக்கியம்", labelEn: "Classical Literature", labelTa: "இலக்கியம் & காப்பியங்கள்" },
  { id: "🎭 கலை & பண்பாடு", labelEn: "Arts & Culture", labelTa: "கலை, உணவு & பண்பாடு" },
  { id: "🇮🇳 விடுதலை வீரர்கள்", labelEn: "Leaders & Freedom", labelTa: "விடுதலை வீரர்கள் & ஆளுமைகள்" },
  { id: "🐅 இந்திய வனவிலங்குகள்", labelEn: "Nature & Wildlife", labelTa: "காடுகள் & வனவிலங்குகள்" },
];

const DIFFICULTIES = [
  { id: "all", labelEn: "All Difficulties", labelTa: "அனைத்து நிலைகள்" },
  { id: "Easy", labelEn: "Easy", labelTa: "எளிது", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { id: "Medium", labelEn: "Medium", labelTa: "நடுத்தரம்", color: "bg-amber-50 text-amber-800 border-amber-200" },
  { id: "Hard", labelEn: "Hard", labelTa: "கடினம்", color: "bg-rose-50 text-rose-700 border-rose-200" },
  { id: "Expert", labelEn: "Expert", labelTa: "நிபுணர்", color: "bg-purple-50 text-purple-700 border-purple-200" },
];

export default function WordFinderCatalog({
  currentUser,
  attempts,
  onSelectPuzzle,
  onRequireLogin,
  lang,
}: WordFinderCatalogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const isAuthenticated = !!currentUser && currentUser.id !== "guest-user-session";

  // Map completed puzzle attempts by puzzleId
  const completedMap = useMemo(() => {
    const map = new Map<string, WordFinderAttempt>();
    attempts.forEach((att) => {
      const existing = map.get(att.puzzleId);
      if (!existing || att.score > existing.score) {
        map.set(att.puzzleId, att);
      }
    });
    return map;
  }, [attempts]);

  // Filter puzzles
  const filteredPuzzles = useMemo(() => {
    return WORD_FINDER_PUZZLES.filter((p) => {
      // Category filter
      if (selectedCategory !== "all") {
        if (p.categoryTa !== selectedCategory && p.categoryEn !== selectedCategory) {
          return false;
        }
      }
      // Difficulty filter
      if (selectedDifficulty !== "all" && p.difficulty !== selectedDifficulty) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const numStr = String(p.number);
        const matchNum = numStr.includes(q.replace("#", ""));
        const matchTa = p.titleTa.toLowerCase().includes(q);
        const matchEn = p.titleEn.toLowerCase().includes(q);
        const matchWords = p.words.some((w) => w.includes(q)) ||
          p.wordsEn.some((w) => w.toLowerCase().includes(q));
        return matchNum || matchTa || matchEn || matchWords;
      }
      return true;
    });
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  // Total pages
  const totalPages = Math.ceil(filteredPuzzles.length / ITEMS_PER_PAGE) || 1;

  // Sliced items for current page
  const paginatedPuzzles = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPuzzles.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPuzzles, currentPage]);

  const handleCardClick = (puzzle: WordFinderPuzzle) => {
    if (!isAuthenticated) {
      onRequireLogin(puzzle.id);
      return;
    }
    onSelectPuzzle(puzzle);
  };

  const handleRandomPlay = () => {
    const randomPuzzle =
      WORD_FINDER_PUZZLES[Math.floor(Math.random() * WORD_FINDER_PUZZLES.length)];
    if (!isAuthenticated) {
      onRequireLogin(randomPuzzle.id);
      return;
    }
    onSelectPuzzle(randomPuzzle);
  };

  return (
    <div className="space-y-6">
      {/* HEADER & QUICK ACTIONS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-extrabold text-[#3B0B12] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
            <span>
              {lang === "ta" ? "500 சொல் கண்டுபிடி புதிர்கள்" : "500 Word Finder Puzzles"}
            </span>
          </h2>
          <p className="text-xs text-stone-600 mt-0.5">
            {lang === "ta"
              ? "இந்திய கலாச்சாரம், நதிகள், வரலாற்றுச் சின்னங்கள் மற்றும் செவ்வியல் இலக்கியப் புதிர்கள்"
              : "Puzzles spanning Indian geography, sacred rivers, monuments, and classical epics"}
          </p>
        </div>

        <button
          onClick={handleRandomPlay}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#5C121E] to-[#801B2B] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02]"
        >
          <Zap className="w-4 h-4 text-amber-300" />
          <span>{lang === "ta" ? "ஏதேனும் ஒரு புதிர் விளையாடு" : "Quick Random Puzzle"}</span>
        </button>
      </div>

      {/* SEARCH AND FILTERS BAR */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2DDD5] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={
                lang === "ta"
                  ? "புதிர் பெயர், எண் (#001), அல்லது சொற்களைத் தேடுங்கள்..."
                  : "Search by title, puzzle #, or word..."
              }
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#5C121E]/20 focus:border-[#5C121E]"
            />
          </div>

          {/* Difficulty Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-500 shrink-0">
              {lang === "ta" ? "நிலை:" : "Level:"}
            </span>
            <select
              value={selectedDifficulty}
              onChange={(e) => {
                setSelectedDifficulty(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-700 focus:outline-hidden focus:border-[#5C121E]"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d.id} value={d.id}>
                  {lang === "ta" ? d.labelTa : d.labelEn}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills (Horizontal scrolling) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-[#5C121E] text-white shadow-xs"
                  : "bg-stone-100 hover:bg-stone-200 text-stone-600"
              }`}
            >
              {lang === "ta" ? cat.labelTa : cat.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* RESULTS COUNT & PAGINATION TOP */}
      <div className="flex items-center justify-between text-xs text-stone-500 font-medium px-1">
        <span>
          {lang === "ta"
            ? `மொத்தம் ${filteredPuzzles.length} புதிர்கள் (${currentPage}/${totalPages} பக்கம்)`
            : `Showing ${filteredPuzzles.length} puzzles (Page ${currentPage} of ${totalPages})`}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="px-2 font-mono font-bold text-stone-800">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* PUZZLES GRID (24 per page) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {paginatedPuzzles.map((puzzle) => {
          const attempt = completedMap.get(puzzle.id);
          const isCompleted = !!attempt;
          const diffConfig =
            DIFFICULTIES.find((d) => d.id === puzzle.difficulty) || DIFFICULTIES[1];

          return (
            <div
              key={puzzle.id}
              onClick={() => handleCardClick(puzzle)}
              className="bg-white rounded-2xl border border-[#E2DDD5] p-4 shadow-xs hover:shadow-md hover:border-[#5C121E]/40 transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Top Meta */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
                    #{String(puzzle.number).padStart(3, "0")}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${diffConfig.color}`}
                  >
                    {lang === "ta" ? diffConfig.labelTa : puzzle.difficulty}
                  </span>
                </div>

                <h3 className="font-serif font-extrabold text-sm text-[#3B0B12] group-hover:text-[#5C121E] transition-colors line-clamp-1">
                  {lang === "ta" ? puzzle.titleTa : puzzle.titleEn}
                </h3>
                <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                  {lang === "ta" ? puzzle.categoryTa : puzzle.categoryEn}
                </p>

                {/* Target words pill previews */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {puzzle.words.slice(0, 3).map((w, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-stone-50 border border-stone-200 text-stone-700 px-1.5 py-0.5 rounded font-serif"
                    >
                      {w}
                    </span>
                  ))}
                  {puzzle.words.length > 3 && (
                    <span className="text-[10px] text-stone-400 px-1 py-0.5 font-bold">
                      +{puzzle.words.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer: Status & Play */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                {isCompleted ? (
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{attempt.score} XP</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[11px] text-stone-400 font-medium">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>100 XP</span>
                  </div>
                )}

                <div className="flex items-center gap-1 text-xs font-bold text-[#5C121E] group-hover:translate-x-0.5 transition-transform">
                  {!isAuthenticated ? (
                    <span className="flex items-center gap-1 text-amber-800 text-[11px]">
                      <Lock className="w-3 h-3" />
                      {lang === "ta" ? "உள்நுழை" : "Login"}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Play className="w-3 h-3 fill-current" />
                      {lang === "ta" ? "விளையாடு" : "Play"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* BOTTOM PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold cursor-pointer"
          >
            {lang === "ta" ? "முந்தையது" : "Previous"}
          </button>
          <span className="text-xs font-mono font-bold text-stone-700 px-3">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold cursor-pointer"
          >
            {lang === "ta" ? "அடுத்தது" : "Next"}
          </button>
        </div>
      )}
    </div>
  );
}

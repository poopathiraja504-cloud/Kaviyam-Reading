import React, { useState, useMemo } from "react";
import { Search, Gamepad2, CheckCircle2, Star, Sparkles, Filter, Lock } from "lucide-react";
import { WordFinderPuzzle, WordFinderAttempt } from "../../types/wordFinder";
import { User } from "../../types";
import { Language } from "../../utils/i18n";
import { WORD_FINDER_PUZZLES } from "../../data/wordFinderPuzzles";

interface WordFinderCatalogProps {
  currentUser: User | null;
  attempts: WordFinderAttempt[];
  onSelectPuzzle: (puzzle: WordFinderPuzzle) => void;
  onRequireLogin: (puzzleId: string) => void;
  lang: Language;
}

export default function WordFinderCatalog({
  currentUser,
  attempts,
  onSelectPuzzle,
  onRequireLogin,
  lang,
}: WordFinderCatalogProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [page, setPage] = useState(1);
  const pageSize = 24;

  const isTamil = lang === "ta";

  // Derive categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    WORD_FINDER_PUZZLES.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["All", ...Array.from(set)];
  }, []);

  // Map completed puzzle ids
  const completedMap = useMemo(() => {
    const map = new Map<string, WordFinderAttempt>();
    attempts.forEach((a) => {
      if (a.status === "completed") {
        map.set(a.puzzleId, a);
      }
    });
    return map;
  }, [attempts]);

  // Filtered puzzles
  const filteredPuzzles = useMemo(() => {
    return WORD_FINDER_PUZZLES.filter((p) => {
      const matchCat =
        selectedCategory === "All" || p.category === selectedCategory;
      const matchDiff =
        selectedDifficulty === "All" || p.difficulty === selectedDifficulty;
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.titleTa && p.titleTa.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        p.words.some((w) => w.toLowerCase().includes(q));

      return matchCat && matchDiff && matchSearch;
    });
  }, [search, selectedCategory, selectedDifficulty]);

  const totalPages = Math.ceil(filteredPuzzles.length / pageSize) || 1;
  const paginatedPuzzles = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredPuzzles.slice(start, start + pageSize);
  }, [filteredPuzzles, page]);

  const handlePuzzleClick = (puzzle: WordFinderPuzzle) => {
    // If guest mode is allowed or user is signed in
    if (!currentUser) {
      onRequireLogin(puzzle.id);
      return;
    }
    onSelectPuzzle(puzzle);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={
              isTamil
                ? "புதிர் அல்லது சொல் தேடுக..."
                : "Search puzzle title, topic, or words..."
            }
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-[#5C121E] focus:bg-white transition-colors"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-700 focus:outline-hidden focus:border-[#5C121E]"
          >
            <option value="All">{isTamil ? "அனைத்து வகைகள்" : "All Categories"}</option>
            {categories.filter((c) => c !== "All").map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => {
              setSelectedDifficulty(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-700 focus:outline-hidden focus:border-[#5C121E]"
          >
            <option value="All">{isTamil ? "அனைத்து நிலைகள்" : "All Levels"}</option>
            <option value="Easy">Easy / எளிது</option>
            <option value="Medium">Medium / நடுத்தரம்</option>
            <option value="Hard">Hard / கடினம்</option>
            <option value="Expert">Expert / நிபுணர்</option>
          </select>
        </div>
      </div>

      {/* Grid of Puzzles */}
      {paginatedPuzzles.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 text-stone-500">
          <p className="text-sm font-medium">
            {isTamil ? "புதிர்கள் ஏதும் கிடைக்கவில்லை." : "No puzzles matched your search."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {paginatedPuzzles.map((puzzle) => {
            const completed = completedMap.get(puzzle.id);
            return (
              <div
                key={puzzle.id}
                onClick={() => handlePuzzleClick(puzzle)}
                className="group bg-white rounded-2xl border border-stone-200 hover:border-[#D4AF37] hover:shadow-lg transition-all duration-200 p-4 flex flex-col justify-between cursor-pointer relative overflow-hidden"
              >
                {/* Completed Badge */}
                {completed && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{isTamil ? "முடிந்தது" : "Done"}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
                      #{puzzle.number || puzzle.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        puzzle.difficulty === "Easy"
                          ? "bg-green-50 text-green-700"
                          : puzzle.difficulty === "Medium"
                          ? "bg-amber-50 text-amber-700"
                          : puzzle.difficulty === "Hard"
                          ? "bg-rose-50 text-rose-700"
                          : "bg-purple-50 text-purple-700"
                      }`}
                    >
                      {puzzle.difficulty}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-sm sm:text-base text-[#3B0B12] group-hover:text-[#5C121E] transition-colors line-clamp-1">
                    {isTamil && puzzle.titleTa ? puzzle.titleTa : puzzle.title}
                  </h3>

                  <p className="text-[11px] text-stone-500 line-clamp-1">
                    {puzzle.category} • {puzzle.words.length} {isTamil ? "சொற்கள்" : "words"}
                  </p>
                </div>

                <div className="pt-4 mt-2 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[10px] text-stone-400">
                    {puzzle.gridSize}x{puzzle.gridSize} Grid
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePuzzleClick(puzzle);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#3B0B12] to-[#5C121E] text-white text-xs font-bold shadow-xs group-hover:scale-105 transition-transform"
                  >
                    <Gamepad2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{completed ? (isTamil ? "மீண்டும் ஆடுக" : "Replay") : (isTamil ? "தொடங்கு" : "Play")}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-bold text-stone-600 disabled:opacity-40"
          >
            {isTamil ? "முந்தையது" : "Previous"}
          </button>
          <span className="text-xs font-semibold text-stone-500">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-bold text-stone-600 disabled:opacity-40"
          >
            {isTamil ? "அடுத்தது" : "Next"}
          </button>
        </div>
      )}
    </div>
  );
}

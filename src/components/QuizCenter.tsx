import React, { useState, useMemo } from "react";
import { Search, Brain, Trophy, History, Play, CheckCircle2, Clock, Sparkles, Filter, ArrowUpDown, ChevronRight, BookOpen, Star, AlertCircle, Lock, ArrowLeft } from "lucide-react";
import { QuizSet, QuizAttempt, User } from "../types";
import { Language } from "../utils/i18n";

interface QuizCenterProps {
  quizzes: QuizSet[];
  userAttempts: QuizAttempt[];
  currentUser: User | null;
  onSelectQuiz: (quizId: string) => void;
  onViewHistory: () => void;
  onViewLeaderboard: () => void;
  onStartQuiz: (quizId: string) => void;
  onBack?: () => void;
  onGoogleLogin?: () => void;
  lang: Language;
}

export default function QuizCenter({
  quizzes,
  userAttempts,
  currentUser,
  onSelectQuiz,
  onViewHistory,
  onViewLeaderboard,
  onStartQuiz,
  onBack,
  onGoogleLogin,
  lang,
}: QuizCenterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [sortBy, setSortBy] = useState<"Newest" | "Popular" | "Highest Score" | "Easiest" | "Hardest">("Newest");

  // Derive unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    quizzes.forEach((q) => set.add(q.category));
    return ["All", ...Array.from(set)];
  }, [quizzes]);

  // Compute best scores map: quizId -> best score
  const bestScoresMap = useMemo(() => {
    const map: Record<string, number> = {};
    userAttempts.forEach((att) => {
      if (att.status === "Completed") {
        if (map[att.quizId] === undefined || att.score > map[att.quizId]) {
          map[att.quizId] = att.score;
        }
      }
    });
    return map;
  }, [userAttempts]);

  // Filter & Sort Quizzes
  const filteredQuizzes = useMemo(() => {
    return quizzes
      .filter((q) => {
        const matchesSearch =
          q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || q.category === selectedCategory;
        const matchesDifficulty = selectedDifficulty === "All" || q.difficulty === selectedDifficulty;
        return matchesSearch && matchesCategory && matchesDifficulty;
      })
      .sort((a, b) => {
        if (sortBy === "Easiest") {
          const rank = { Easy: 1, Medium: 2, Hard: 3 };
          return rank[a.difficulty] - rank[b.difficulty];
        }
        if (sortBy === "Hardest") {
          const rank = { Easy: 3, Medium: 2, Hard: 1 };
          return rank[a.difficulty] - rank[b.difficulty];
        }
        if (sortBy === "Highest Score") {
          const scoreA = bestScoresMap[a.quizId] || 0;
          const scoreB = bestScoresMap[b.quizId] || 0;
          return scoreB - scoreA;
        }
        if (sortBy === "Popular") {
          return b.quizId.localeCompare(a.quizId);
        }
        // Default: Newest
        return b.quizId.localeCompare(a.quizId);
      });
  }, [quizzes, searchQuery, selectedCategory, selectedDifficulty, sortBy, bestScoresMap]);

  return (
    <div className="space-y-6 sm:space-y-8 font-sans">
      {/* Top Back Navigation */}
      {onBack && (
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            id="quiz-center-back-btn"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-700 hover:text-[#5C121E] border border-stone-200 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#5C121E]" />
            <span>{lang === "ta" ? "← முகப்பிற்குத் திரும்பு" : "← Back to Home"}</span>
          </button>
        </div>
      )}

      {/* Google Sign-in Requirement Banner for Unauthenticated/Guest Users */}
      {(!currentUser || currentUser.id === "guest-user-session") && (
        <div className="bg-gradient-to-r from-amber-50 via-orange-50/50 to-amber-50 border-2 border-amber-300/80 rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-left">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 text-2xl shadow-inner">
              🔐
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-900 text-[10px] font-bold uppercase tracking-wider mb-1">
                <span>Google Sign-In Required</span>
              </div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-[#3B0B12]">
                {lang === "ta"
                  ? "அனைத்து வினாடி வினாக்களையும் அணுகவும் எழுதவும் Google உள்நுழைவு அவசியம்"
                  : "Google sign-in is required to access and attend all quizzes."}
              </h3>
              <p className="text-xs text-stone-600 mt-0.5 max-w-xl leading-relaxed">
                {lang === "ta"
                  ? "வினாடி வினாவில் பங்கேற்க, உங்கள் முன்னேற்றத்தைச் சேமிக்க மற்றும் புள்ளிகளைப் பெற உங்கள் Google கணக்கில் உள்நுழையவும்."
                  : "Sign in with Google to participate in all quizzes, save your answers, track score records, and climb the leaderboard."}
              </p>
            </div>
          </div>

          {onGoogleLogin && (
            <button
              onClick={onGoogleLogin}
              id="quiz-banner-google-btn"
              className="w-full md:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-stone-50 text-stone-800 border-2 border-amber-300 hover:border-amber-400 font-sans font-bold text-xs tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 shrink-0 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{lang === "ta" ? "Google மூலம் உள்நுழைக" : "Sign in with Google"}</span>
            </button>
          )}
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#3B0B12] via-[#5C121E] to-[#1E0408] text-white p-6 sm:p-10 border border-[#D4AF37]/30 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-bold uppercase tracking-widest">
            <Brain className="w-3.5 h-3.5" />
            <span>Kaviyam Knowledge Hub</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl font-extrabold tracking-tight text-amber-50 leading-tight">
            {lang === "ta" ? "காவியம் வினாடி வினா மையம்" : "Kaviyam Quiz Center"}
          </h1>
          <p className="text-xs sm:text-base text-stone-300 leading-relaxed">
            {lang === "ta"
              ? "உங்கள் அறிவைச் சோதித்து, வாசிப்புத் திறனை மேம்படுத்தி, சான்றிதழ்கள் மற்றும் XP புள்ளிகளைப் பெறுங்கள்."
              : "Test your knowledge, improve your reading comprehension, and earn rewards across 50 complete quiz sets."}
          </p>

          {/* Action Quick Links */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onViewHistory}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <History className="w-4 h-4 text-amber-300" />
              <span>{lang === "ta" ? "என் வினாடி வினா வரலாறு" : "My Quiz History"}</span>
            </button>
            <button
              onClick={onViewLeaderboard}
              className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-[#3B0B12] text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-[#3B0B12]" />
              <span>{lang === "ta" ? "தரவரிசை பட்டியல்" : "Leaderboard"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Controls Section: Search & Filters */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E2DDD5] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === "ta" ? "வினாடி வினாவைத் தேடுக..." : "Search quizzes by title or category..."}
              className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#5C121E] transition-all"
            />
          </div>

          {/* Difficulty & Sorting Controls */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Difficulty Filter */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-semibold overflow-x-auto max-w-full no-scrollbar whitespace-nowrap shrink-0">
              {["All", "Easy", "Medium", "Hard"].map((diff) => {
                const diffLabels: Record<string, string> = {
                  All: "அனைத்தும்",
                  Easy: "எளிது",
                  Medium: "நடுத்தரம்",
                  Hard: "கடினம்"
                };
                return (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      selectedDifficulty === diff
                        ? "bg-[#5C121E] text-white shadow-xs"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    {diffLabels[diff] || diff}
                  </button>
                );
              })}
            </div>

            {/* Sort Selector */}
            <div className="relative flex items-center gap-1 bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700">
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent focus:outline-none cursor-pointer text-stone-800"
              >
                <option value="Newest">புதியவை</option>
                <option value="Popular">பிரபலமானவை</option>
                <option value="Highest Score">அதிக மதிப்பெண்</option>
                <option value="Easiest">மிக எளிதானவை</option>
                <option value="Hardest">மிகக் கடினமானவை</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Scroll Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar max-w-full">
          <span className="text-xs font-bold text-stone-500 shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> {lang === "ta" ? "வகை:" : "Category:"}
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#5C121E] text-white font-bold"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {cat === "All" ? "அனைத்தும்" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Quiz Grid */}
      {filteredQuizzes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredQuizzes.map((quiz) => {
            const bestScore = bestScoresMap[quiz.quizId];
            const isCompleted = bestScore !== undefined;

            return (
              <div
                key={quiz.quizId}
                onClick={() => onSelectQuiz(quiz.quizId)}
                className="group bg-white rounded-2xl border border-[#E2DDD5] hover:border-[#5C121E] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer relative overflow-hidden"
              >
                {/* Top Badge Row */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                    {lang === "ta" ? `வினாடி வினா ${quiz.quizId.replace("quiz_", "")}` : quiz.quizId.replace("quiz_", "Quiz ")}
                  </span>
                  
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      quiz.difficulty === "Easy"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : quiz.difficulty === "Medium"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}
                  >
                    {lang === "ta"
                      ? quiz.difficulty === "Easy"
                        ? "எளிது"
                        : quiz.difficulty === "Medium"
                        ? "நடுத்தரம்"
                        : "கடினம்"
                      : quiz.difficulty}
                  </span>
                </div>

                {/* Title & Description */}
                <div className="space-y-2 mb-4">
                  <h3 className="font-serif text-base font-bold text-[#3B0B12] group-hover:text-[#5C121E] transition-colors line-clamp-2">
                    {quiz.title}
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                    {quiz.description}
                  </p>
                </div>

                {/* Meta details (Questions, Marks, Time) */}
                <div className="pt-3 border-t border-stone-100 space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-[11px] font-semibold text-stone-600 bg-stone-50 p-2.5 rounded-xl text-center">
                    <div>
                      <span className="block text-stone-400 text-[9px] uppercase">{lang === "ta" ? "கேள்விகள்" : "Questions"}</span>
                      <span className="text-stone-800">{quiz.totalQuestions}</span>
                    </div>
                    <div className="border-x border-stone-200">
                      <span className="block text-stone-400 text-[9px] uppercase">{lang === "ta" ? "மதிப்பெண்கள்" : "Marks"}</span>
                      <span className="text-stone-800">{quiz.totalMarks}</span>
                    </div>
                    <div>
                      <span className="block text-stone-400 text-[9px] uppercase">{lang === "ta" ? "நேரம்" : "Time"}</span>
                      <span className="text-stone-800">
                        {Math.floor(quiz.timeLimit / 60)} {lang === "ta" ? "நிமி" : "mins"}
                      </span>
                    </div>
                  </div>

                  {/* Completion Status vs Start Button */}
                  <div className="flex items-center justify-between pt-1">
                    {(!currentUser || currentUser.id === "guest-user-session") ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Lock className="w-3 h-3 text-amber-600" />
                        <span>{lang === "ta" ? "உள்நுழைவு தேவை" : "Login Required"}</span>
                      </span>
                    ) : isCompleted ? (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>
                          {lang === "ta" ? "சிறந்த மதிப்பெண்:" : "Best:"} {bestScore}/{quiz.totalMarks}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] font-medium text-stone-400">
                        {lang === "ta" ? "இன்னும் முயற்சிக்கவில்லை" : "Not attempted yet"}
                      </span>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartQuiz(quiz.quizId);
                      }}
                      id={`quiz-card-start-${quiz.quizId}`}
                      className="px-3 py-1.5 rounded-xl bg-[#5C121E] hover:bg-[#3B0B12] text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all cursor-pointer group-hover:scale-105"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>
                        {isCompleted
                          ? lang === "ta"
                            ? "மீண்டும்"
                            : "Retake"
                          : lang === "ta"
                          ? "தொடங்குக"
                          : "Start"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 bg-white rounded-3xl border border-[#E2DDD5] space-y-3 p-6">
          <AlertCircle className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-stone-700">
            {lang === "ta" ? "வினாடி வினாக்கள் எதுவும் காணப்படவில்லை" : "No Quizzes Found"}
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            {lang === "ta"
              ? "உங்கள் தேடல் அல்லது வடிகட்டிகளுக்குப் பொருந்தக்கூடிய எந்த வினாடி வினாக்களையும் எங்களால் கண்டுபிடிக்க முடியவில்லை. தயவுசெய்து உங்கள் பிரிவு அல்லது சிரம நிலையை மாற்றியமைத்து முயற்சிக்கவும்."
              : "We couldn't find any quizzes matching your search or filters. Try adjusting your category or difficulty selections."}
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
              setSelectedDifficulty("All");
            }}
            className="px-4 py-2 rounded-xl bg-[#5C121E] text-white text-xs font-bold cursor-pointer"
          >
            {lang === "ta" ? "அனைத்து வடிப்பான்களையும் மீட்டமை" : "Reset All Filters"}
          </button>
        </div>
      )}
    </div>
  );
}

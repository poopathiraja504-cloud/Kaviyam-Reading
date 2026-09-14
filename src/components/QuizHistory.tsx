import React, { useState, useMemo } from "react";
import { History, Search, ArrowLeft, Trophy, CheckCircle2, Clock, Calendar, ChevronRight, Filter, ArrowUpDown, Lock, LogIn } from "lucide-react";
import { QuizAttempt, User } from "../types";
import { Language } from "../utils/i18n";

interface QuizHistoryProps {
  attempts: QuizAttempt[];
  currentUser?: User | null;
  onRequireLogin?: () => void;
  onSelectAttempt: (attempt: QuizAttempt) => void;
  onBackToCenter: () => void;
  lang: Language;
}

export default function QuizHistory({
  attempts,
  currentUser,
  onRequireLogin,
  onSelectAttempt,
  onBackToCenter,
  lang,
}: QuizHistoryProps) {
  const isGuest = !currentUser || currentUser.id === "guest-user-session";

  // If user is not authenticated, show strictly the Login Required UI
  if (isGuest) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 font-sans">
        <button
          onClick={onBackToCenter}
          className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-[#5C121E] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === "ta" ? "வினாடி வினா மையத்திற்கு திரும்பு" : "Back to Quiz Center"}</span>
        </button>

        <div className="p-8 sm:p-12 bg-white rounded-3xl border border-[#D4AF37]/40 shadow-xl text-center space-y-6">
          <div className="mx-auto w-20 h-20 rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center shadow-inner">
            <span className="text-4xl" role="img" aria-label="Lock">🔐</span>
          </div>

          <div className="space-y-2">
            <h2 className="font-serif font-black text-2xl text-[#3B0B12]">
              {lang === "ta" ? "உள்நுழைவு தேவை" : "Login Required"}
            </h2>
            <p className="text-sm font-medium text-stone-600 max-w-md mx-auto leading-relaxed">
              {lang === "ta"
                ? "உங்கள் Quiz வரலாற்றைப் பார்க்க உள்நுழைய வேண்டும்."
                : "Please log in to your account to view your quiz history."}
            </p>
          </div>

          <div className="pt-2 flex justify-center">
            <button
              onClick={onRequireLogin}
              id="quiz-history-login-btn"
              className="px-8 py-3 rounded-2xl bg-[#5C121E] hover:bg-[#3B0B12] text-white font-serif font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
            >
              <LogIn className="w-4 h-4 text-amber-300" />
              <span>{lang === "ta" ? "உள்நுழைக" : "Login"}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | "Completed" | "Highest Score" | "Lowest Score">("All");
  const [sortBy, setSortBy] = useState<"Newest" | "Oldest" | "Highest Score">("Newest");

  const filteredAttempts = useMemo(() => {
    return attempts
      .filter((att) => {
        const matchesSearch = att.quizTitle.toLowerCase().includes(searchQuery.toLowerCase());
        if (filterStatus === "Completed") return matchesSearch && att.status === "Completed";
        if (filterStatus === "Highest Score") return matchesSearch && att.score >= 80;
        if (filterStatus === "Lowest Score") return matchesSearch && att.score < 50;
        return matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "Oldest") {
          return new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime();
        }
        if (sortBy === "Highest Score") {
          return b.score - a.score;
        }
        return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
      });
  }, [attempts, searchQuery, filterStatus, sortBy]);

  const totalQuizzes = attempts.length;
  const totalScore = attempts.reduce((acc, curr) => acc + curr.score, 0);
  const avgScore = totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0;
  const highestScore = attempts.reduce((max, curr) => Math.max(max, curr.score), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 font-sans">
      {/* Back Button */}
      <button
        onClick={onBackToCenter}
        className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-[#5C121E] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{lang === "ta" ? "வினாடி வினா மையத்திற்கு திரும்பு" : "Back to Quiz Center"}</span>
      </button>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#3B0B12] to-[#5C121E] text-white p-6 sm:p-8 rounded-3xl border border-[#D4AF37]/30 shadow-lg space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-amber-300">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-amber-50">
              {lang === "ta" ? "என் வினாடி வினா வரலாறு" : "My Quiz History"}
            </h1>
            <p className="text-xs sm:text-sm text-stone-300">
              {lang === "ta"
                ? "உங்கள் கடந்தகால வினாடி வினா செயல்திறன், மதிப்பெண் பதிவுகள் மற்றும் முன்னேற்ற வரலாற்றைக் கண்காணிக்கவும்."
                : "Track your past quiz performances, score logs, and improvement history."}
            </p>
          </div>
        </div>

        {/* Quick Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-white/10 p-3 rounded-xl border border-white/20 text-center">
            <span className="block text-[10px] text-stone-300 font-bold uppercase">
              {lang === "ta" ? "மொத்த வினாடி வினாக்கள்" : "Total Quizzes"}
            </span>
            <span className="text-lg font-serif font-bold text-amber-200">{totalQuizzes}</span>
          </div>
          <div className="bg-white/10 p-3 rounded-xl border border-white/20 text-center">
            <span className="block text-[10px] text-stone-300 font-bold uppercase">
              {lang === "ta" ? "சராசரி மதிப்பெண்" : "Average Score"}
            </span>
            <span className="text-lg font-serif font-bold text-amber-200">{avgScore} / 100</span>
          </div>
          <div className="bg-white/10 p-3 rounded-xl border border-white/20 text-center">
            <span className="block text-[10px] text-stone-300 font-bold uppercase">
              {lang === "ta" ? "அதிகபட்ச மதிப்பெண்" : "Highest Score"}
            </span>
            <span className="text-lg font-serif font-bold text-amber-200">{highestScore} / 100</span>
          </div>
          <div className="bg-white/10 p-3 rounded-xl border border-white/20 text-center">
            <span className="block text-[10px] text-stone-300 font-bold uppercase">
              {lang === "ta" ? "மொத்த எக்ஸ்பி (XP)" : "Total XP"}
            </span>
            <span className="text-lg font-serif font-bold text-amber-200">{totalScore} XP</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2DDD5] shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === "ta" ? "விடை வரலாற்றைத் தேடுக..." : "Search attempt history..."}
            className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#5C121E]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Status filter */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-semibold">
            {(["All", "Completed", "Highest Score", "Lowest Score"] as const).map((st) => {
              const filterLabels: Record<string, string> = {
                All: "அனைத்தும்",
                Completed: "முடிக்கப்பட்டவை",
                "Highest Score": "அதிக மதிப்பெண்",
                "Lowest Score": "குறைந்த மதிப்பெண்"
              };
              return (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    filterStatus === st
                      ? "bg-[#5C121E] text-white shadow-xs"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  {lang === "ta" ? filterLabels[st] : st}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* History Items List */}
      {filteredAttempts.length > 0 ? (
        <div className="space-y-3">
          {filteredAttempts.map((att) => {
            const dateStr = new Date(att.completedAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={att.attemptId}
                onClick={() => onSelectAttempt(att)}
                className="group bg-white rounded-2xl border border-[#E2DDD5] hover:border-[#5C121E] p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {lang === "ta" ? `வினாடி வினா ${att.quizId.replace("quiz_", "")}` : att.quizId.replace("quiz_", "Quiz ")}
                    </span>
                    <span className="text-xs text-stone-400 font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {dateStr}
                    </span>
                  </div>
                  <h3 className="font-serif text-base font-bold text-[#3B0B12] group-hover:text-[#5C121E] transition-colors">
                    {att.quizTitle}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-stone-500 font-medium">
                    <span>
                      {lang === "ta" ? `சரியானவை: ${att.correctAnswers}/10` : `Correct: ${att.correctAnswers}/10`}
                    </span>
                    <span>•</span>
                    <span>
                      {lang === "ta"
                        ? `நேரம்: ${Math.floor(att.timeUsed / 60)}நிமி ${att.timeUsed % 60}விநா`
                        : `Time: ${Math.floor(att.timeUsed / 60)}m ${att.timeUsed % 60}s`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100">
                  <div className="text-right">
                    <span className="block font-serif text-lg font-extrabold text-[#5C121E]">
                      {att.score} / 100
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {att.percentage}%
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-stone-100 group-hover:bg-[#5C121E] group-hover:text-white transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-3xl border border-[#E2DDD5] p-6 space-y-2">
          <History className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="font-serif text-base font-bold text-stone-700">
            {lang === "ta" ? "வினாடி வினா முயற்சிகள் எதுவும் இல்லை" : "No Quiz Attempts Recorded"}
          </h3>
          <p className="text-xs text-stone-500">
            {lang === "ta"
              ? "உங்கள் தற்போதைய வடிகட்டிகளுடன் பொருந்தும் வினாடி வினா முயற்சிகள் எதுவும் இன்னும் இல்லை. உங்கள் வரலாற்றை உருவாக்க ஒரு வினாடி வினாவைத் தொடங்கவும்!"
              : "You haven't completed any quizzes yet matching your current filters. Start a quiz to build your history!"}
          </p>
        </div>
      )}
    </div>
  );
}

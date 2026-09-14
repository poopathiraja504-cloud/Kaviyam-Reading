import React, { useMemo } from "react";
import {
  Trophy,
  Award,
  Clock,
  CheckCircle2,
  Sparkles,
  Zap,
  RotateCcw,
  BarChart2,
  Calendar,
  Lock,
} from "lucide-react";
import { calculateUserStats } from "../../services/wordFinderService";
import { WordFinderAttempt } from "../../types/wordFinder";
import { User } from "../../types";
import { Language } from "../../utils/i18n";

interface WordFinderStatsProps {
  currentUser: User | null;
  attempts: WordFinderAttempt[];
  onPlayPuzzle?: (puzzleId: string) => void;
  lang: Language;
}

export default function WordFinderStats({
  currentUser,
  attempts,
  onPlayPuzzle,
  lang,
}: WordFinderStatsProps) {
  const stats = useMemo(() => {
    return calculateUserStats(attempts);
  }, [attempts]);

  const isGuest = !currentUser || currentUser.id === "guest-user-session";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl sm:text-2xl font-extrabold text-[#3B0B12] flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-amber-600" />
          <span>
            {lang === "ta" ? "எனது சொல் கண்டுபிடி புள்ளிவிவரங்கள்" : "My Word Finder Statistics"}
          </span>
        </h2>
        <p className="text-xs text-stone-600 mt-0.5">
          {lang === "ta"
            ? "உங்கள் விளையாட்டு முடிவுகள், திறமை மற்றும் முன்னேற்றக் கண்ணோட்டம்"
            : "Detailed breakdown of your completed puzzles, speed, and accuracy"}
        </p>
      </div>

      {isGuest && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3 shadow-xs">
          <Lock className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <span className="font-bold block">
              {lang === "ta" ? "விருந்தினர் பயன்முறை" : "Guest Mode"}
            </span>
            <span>
              {lang === "ta"
                ? "உங்கள் மதிப்பெண்கள் மற்றும் புள்ளிவிவரங்களை நிரந்தரமாகச் சேமிக்க உள்நுழையவும்."
                : "Log in to permanently save your puzzle progress, stats, and climb the leaderboard."}
            </span>
          </div>
        </div>
      )}

      {/* METRICS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E2DDD5] shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {lang === "ta" ? "முடிந்த புதிர்கள்" : "Puzzles Completed"}
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-black text-[#3B0B12]">
            {stats.completedPuzzles}
            <span className="text-xs text-stone-400 font-sans font-normal ml-1">/ 500</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E2DDD5] shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {lang === "ta" ? "கண்டுபிடித்த சொற்கள்" : "Words Found"}
            </span>
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-black text-[#3B0B12]">
            {stats.totalWordsFound}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E2DDD5] shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {lang === "ta" ? "ஈட்டிய XP" : "Total XP"}
            </span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-black text-amber-700">
            {stats.totalScore}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E2DDD5] shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {lang === "ta" ? "வேகமான நேரம்" : "Fastest Time"}
            </span>
            <Clock className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-black text-[#3B0B12]">
            {stats.fastestCompletionSeconds && stats.fastestCompletionSeconds > 0
              ? `${stats.fastestCompletionSeconds}s`
              : "—"}
          </div>
        </div>
      </div>

      {/* RECENT ATTEMPTS TABLE */}
      <div className="bg-white rounded-2xl border border-[#E2DDD5] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <h3 className="font-serif font-bold text-sm text-[#3B0B12]">
            {lang === "ta" ? "சமீபத்திய விளையாட்டு முடிவுகள்" : "Recent Puzzle Attempts"}
          </h3>
          <span className="text-xs font-mono font-bold text-stone-500">
            {attempts.length} {lang === "ta" ? "முடிவுகள்" : "entries"}
          </span>
        </div>

        {attempts.length === 0 ? (
          <div className="p-8 text-center text-stone-400 text-xs">
            {lang === "ta"
              ? "இதுவரை நீங்கள் எந்த புதிரையும் விளையாடவில்லை. உடனே விளையாடத் தொடங்குங்கள்!"
              : "You haven't played any word finder puzzles yet. Start a puzzle today!"}
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {attempts.slice(0, 15).map((att) => (
              <div
                key={att.id}
                className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-stone-50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-600">
                      #{String(att.puzzleNumber).padStart(3, "0")}
                    </span>
                    <h4 className="font-serif font-bold text-xs sm:text-sm text-[#3B0B12]">
                      {att.puzzleTitleTa}
                    </h4>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-stone-400 mt-1">
                    <span>{att.difficulty}</span>
                    <span>•</span>
                    <span>{att.timeTaken}s</span>
                    <span>•</span>
                    <span>{new Date(att.completedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-serif font-black text-amber-700 block">
                      +{att.score} XP
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold">
                      {att.foundWords?.length || 0}/{att.totalWords}{" "}
                      {lang === "ta" ? "சொற்கள்" : "words"}
                    </span>
                  </div>

                  {onPlayPuzzle && (
                    <button
                      onClick={() => onPlayPuzzle(att.puzzleId)}
                      className="p-2 rounded-xl text-stone-500 hover:text-[#5C121E] hover:bg-stone-100 border border-stone-200 transition-all cursor-pointer"
                      title={lang === "ta" ? "மீண்டும் விளையாடு" : "Replay"}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

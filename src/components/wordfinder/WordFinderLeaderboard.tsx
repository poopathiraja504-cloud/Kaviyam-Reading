import React, { useState, useEffect } from "react";
import {
  Trophy,
  Award,
  Medal,
  Crown,
  Sparkles,
  Zap,
  Users,
  RefreshCw,
} from "lucide-react";
import { getWordFinderLeaderboard } from "../../services/wordFinderService";
import { WordFinderLeaderboardEntry } from "../../types/wordFinder";
import { User } from "../../types";
import { Language } from "../../utils/i18n";

interface WordFinderLeaderboardProps {
  currentUser: User | null;
  lang: Language;
}

export default function WordFinderLeaderboard({
  currentUser,
  lang,
}: WordFinderLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<WordFinderLeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const data = await getWordFinderLeaderboard();
      setLeaderboard(data);
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-extrabold text-[#3B0B12] flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#D4AF37]" />
            <span>
              {lang === "ta" ? "சொல் கண்டுபிடி தரவரிசைப் பட்டியல்" : "Word Finder Leaderboard"}
            </span>
          </h2>
          <p className="text-xs text-stone-600 mt-0.5">
            {lang === "ta"
              ? "புதிர்களில் அதிக புள்ளிகள் மற்றும் சொற்களைக் கண்டறிந்த சிறந்த வாசகர்கள்"
              : "Top scholars ranked by total words discovered and puzzle mastery"}
          </p>
        </div>

        <button
          onClick={fetchLeaderboard}
          disabled={isLoading}
          className="self-start inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>{lang === "ta" ? "புதுப்பி" : "Refresh"}</span>
        </button>
      </div>

      {/* TOP 3 PODIUM */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl mx-auto pt-4">
          {/* Rank 2 - Silver */}
          <div className="bg-white rounded-2xl border border-stone-200 p-4 text-center shadow-xs flex flex-col justify-end mt-4">
            <div className="w-10 h-10 rounded-full bg-stone-200 text-stone-700 font-serif font-black mx-auto flex items-center justify-center text-sm shadow-xs mb-2">
              2
            </div>
            <h4 className="font-serif font-bold text-xs sm:text-sm text-[#3B0B12] truncate">
              {leaderboard[1].userName}
            </h4>
            <div className="text-[11px] text-amber-700 font-bold mt-1">
              {leaderboard[1].totalScore} XP
            </div>
            <div className="text-[10px] text-stone-400">
              {leaderboard[1].puzzlesCompleted} {lang === "ta" ? "புதிர்கள்" : "puzzles"}
            </div>
          </div>

          {/* Rank 1 - Gold */}
          <div className="bg-gradient-to-b from-amber-50 to-white rounded-2xl border border-[#D4AF37]/60 p-4 text-center shadow-md flex flex-col justify-end relative">
            <Crown className="w-6 h-6 text-[#D4AF37] mx-auto mb-1 animate-bounce" />
            <div className="w-12 h-12 rounded-full bg-[#D4AF37] text-white font-serif font-black mx-auto flex items-center justify-center text-base shadow-sm mb-2">
              1
            </div>
            <h4 className="font-serif font-bold text-sm sm:text-base text-[#3B0B12] truncate">
              {leaderboard[0].userName}
            </h4>
            <div className="text-xs text-amber-700 font-black mt-1">
              {leaderboard[0].totalScore} XP
            </div>
            <div className="text-[10px] text-stone-500 font-medium">
              {leaderboard[0].puzzlesCompleted} {lang === "ta" ? "புதிர்கள்" : "puzzles"}
            </div>
          </div>

          {/* Rank 3 - Bronze */}
          <div className="bg-white rounded-2xl border border-stone-200 p-4 text-center shadow-xs flex flex-col justify-end mt-6">
            <div className="w-10 h-10 rounded-full bg-amber-700/20 text-amber-900 font-serif font-black mx-auto flex items-center justify-center text-sm shadow-xs mb-2">
              3
            </div>
            <h4 className="font-serif font-bold text-xs sm:text-sm text-[#3B0B12] truncate">
              {leaderboard[2].userName}
            </h4>
            <div className="text-[11px] text-amber-700 font-bold mt-1">
              {leaderboard[2].totalScore} XP
            </div>
            <div className="text-[10px] text-stone-400">
              {leaderboard[2].puzzlesCompleted} {lang === "ta" ? "புதிர்கள்" : "puzzles"}
            </div>
          </div>
        </div>
      )}

      {/* FULL LEADERBOARD LIST */}
      <div className="bg-white rounded-2xl border border-[#E2DDD5] shadow-xs overflow-hidden">
        <div className="grid grid-cols-12 p-3 sm:p-4 bg-stone-50 text-[11px] font-bold text-stone-500 uppercase tracking-wider border-b border-stone-100">
          <div className="col-span-2 sm:col-span-1 text-center">
            {lang === "ta" ? "வரிசை" : "Rank"}
          </div>
          <div className="col-span-5 sm:col-span-6">
            {lang === "ta" ? "வாசகர் பெயர்" : "Reader"}
          </div>
          <div className="col-span-3 sm:col-span-3 text-center">
            {lang === "ta" ? "முடித்த புதிர்கள்" : "Completed"}
          </div>
          <div className="col-span-2 sm:col-span-2 text-right">XP</div>
        </div>

        {leaderboard.length === 0 ? (
          <div className="p-8 text-center text-stone-400 text-xs">
            {isLoading
              ? (lang === "ta" ? "தரவரிசை ஏற்றப்படுகிறது..." : "Loading rankings...")
              : (lang === "ta" ? "தரவரிசை பட்டியல் தயாராகிறது..." : "Leaderboard entries will appear here.")}
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {leaderboard.map((entry, idx) => {
              const isCurrentUser = currentUser?.id === entry.userId;
              const rank = entry.rank || idx + 1;

              return (
                <div
                  key={entry.userId}
                  className={`grid grid-cols-12 p-3 sm:p-4 items-center text-xs transition-colors ${
                    isCurrentUser ? "bg-amber-50/60 font-bold" : "hover:bg-stone-50"
                  }`}
                >
                  <div className="col-span-2 sm:col-span-1 text-center font-serif font-bold">
                    {rank === 1 ? (
                      <span className="text-amber-500 font-extrabold text-sm">🥇 1</span>
                    ) : rank === 2 ? (
                      <span className="text-stone-400 font-extrabold text-sm">🥈 2</span>
                    ) : rank === 3 ? (
                      <span className="text-amber-700 font-extrabold text-sm">🥉 3</span>
                    ) : (
                      <span className="text-stone-500 font-mono">#{rank}</span>
                    )}
                  </div>

                  <div className="col-span-5 sm:col-span-6 flex items-center gap-2 min-w-0 pr-2">
                    <div className="w-7 h-7 rounded-full bg-[#5C121E]/10 text-[#5C121E] flex items-center justify-center font-bold text-xs shrink-0">
                      {(entry.userName || "வாசகர்").slice(0, 1).toUpperCase()}
                    </div>
                    <span className="truncate font-medium text-[#3B0B12]">
                      {entry.userName}
                      {isCurrentUser && (
                        <span className="ml-1 text-[10px] text-amber-700 font-bold">
                          ({lang === "ta" ? "நீங்கள்" : "You"})
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="col-span-3 sm:col-span-3 text-center text-stone-600 font-mono">
                    {entry.puzzlesCompleted}
                  </div>

                  <div className="col-span-2 sm:col-span-2 text-right font-serif font-black text-amber-700">
                    {entry.totalScore}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

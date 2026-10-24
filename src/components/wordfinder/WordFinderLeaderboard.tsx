import React, { useState, useEffect } from "react";
import { Trophy, Medal, Award, Flame, User as UserIcon, Sparkles } from "lucide-react";
import { User } from "../../types";
import { Language } from "../../utils/i18n";
import { WordFinderLeaderboardEntry, WordFinderAttempt } from "../../types/wordFinder";

interface WordFinderLeaderboardProps {
  currentUser: User | null;
  lang: Language;
}

export default function WordFinderLeaderboard({
  currentUser,
  lang,
}: WordFinderLeaderboardProps) {
  const isTamil = lang === "ta";
  const [leaderboard, setLeaderboard] = useState<WordFinderLeaderboardEntry[]>([]);

  useEffect(() => {
    // Generate realistic Tamil literature champions combined with local user progress
    const baseChampions: WordFinderLeaderboardEntry[] = [
      {
        userId: "champ-1",
        username: "வந்தியத்தேவன் (Vallavarayan)",
        puzzlesCompleted: 48,
        totalScore: 4650,
        fastestTimeSeconds: 58,
        rank: 1,
      },
      {
        userId: "champ-2",
        username: "குந்தவை நாச்சியார் (Kundavai)",
        puzzlesCompleted: 45,
        totalScore: 4320,
        fastestTimeSeconds: 64,
        rank: 2,
      },
      {
        userId: "champ-3",
        username: "இளங்கோ அடிகள் (Silambu)",
        puzzlesCompleted: 39,
        totalScore: 3810,
        fastestTimeSeconds: 72,
        rank: 3,
      },
      {
        userId: "champ-4",
        username: "கம்பர் வாசிப்பு மன்றம்",
        puzzlesCompleted: 34,
        totalScore: 3200,
        fastestTimeSeconds: 85,
        rank: 4,
      },
      {
        userId: "champ-5",
        username: "அருள்மொழிவர்மன் (Rajarajan)",
        puzzlesCompleted: 30,
        totalScore: 2950,
        fastestTimeSeconds: 91,
        rank: 5,
      },
      {
        userId: "champ-6",
        username: "ஆழ்வார்க்கடியான் நம்பி",
        puzzlesCompleted: 26,
        totalScore: 2540,
        fastestTimeSeconds: 104,
        rank: 6,
      },
    ];

    // Check local attempts to place current user if applicable
    try {
      const raw = localStorage.getItem("kaviyam_wordfinder_attempts");
      if (raw && currentUser) {
        const attempts: WordFinderAttempt[] = JSON.parse(raw);
        const myAttempts = attempts.filter((a) => a.userId === currentUser.id && a.status === "completed");
        if (myAttempts.length > 0) {
          const myScore = myAttempts.reduce((acc, a) => acc + (a.score || 0), 0);
          const myFastest = Math.min(...myAttempts.map((a) => a.timeTakenSeconds || (a as any).timeTaken || 120));
          
          const myEntry: WordFinderLeaderboardEntry = {
            userId: currentUser.id,
            username: currentUser.name || currentUser.username || (isTamil ? "எனது சுயவிவரம்" : "You"),
            puzzlesCompleted: myAttempts.length,
            totalScore: myScore,
            fastestTimeSeconds: myFastest === Infinity ? 120 : myFastest,
            rank: 7,
          };

          const combined = [...baseChampions.filter((b) => b.userId !== currentUser.id), myEntry]
            .sort((a, b) => b.totalScore - a.totalScore)
            .map((entry, idx) => ({ ...entry, rank: idx + 1 }));

          setLeaderboard(combined);
          return;
        }
      }
    } catch (_) {}

    setLeaderboard(baseChampions);
  }, [currentUser, isTamil]);

  const formatSecs = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m > 0 ? `${m}m ` : ""}${sec}s`;
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-stone-100 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold mb-1">
            <Trophy className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{isTamil ? "சிறந்த சொல் வேட்டையாளர்கள்" : "Top Word Seekers"}</span>
          </div>
          <h2 className="font-serif font-bold text-lg text-[#3B0B12]">
            {isTamil ? "அகில உலகத் தரவரிசைப் பட்டியல்" : "Global Word Finder Leaderboard"}
          </h2>
        </div>
      </div>

      <div className="space-y-3">
        {leaderboard.map((entry) => {
          const isMe = currentUser && entry.userId === currentUser.id;
          return (
            <div
              key={entry.userId}
              className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                isMe
                  ? "bg-amber-50/70 border-[#D4AF37] shadow-sm"
                  : "bg-stone-50/60 border-stone-200 hover:bg-stone-50"
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Rank Badge */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-serif font-bold text-sm ${
                    entry.rank === 1
                      ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-xs"
                      : entry.rank === 2
                      ? "bg-gradient-to-br from-stone-300 to-stone-500 text-white"
                      : entry.rank === 3
                      ? "bg-gradient-to-br from-amber-700 to-amber-900 text-amber-100"
                      : "bg-white text-stone-600 border border-stone-200"
                  }`}
                >
                  {entry.rank <= 3 ? (
                    <Trophy className="w-4 h-4 text-white" />
                  ) : (
                    entry.rank
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-[#3B0B12]">
                      {entry.username}
                    </span>
                    {isMe && (
                      <span className="px-2 py-0.5 rounded-full bg-[#5C121E] text-white text-[10px] font-bold">
                        {isTamil ? "நீங்கள்" : "You"}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-stone-500 mt-0.5">
                    <span>
                      {entry.puzzlesCompleted} {isTamil ? "புதிர்கள்" : "puzzles"}
                    </span>
                    <span>•</span>
                    <span>
                      {isTamil ? "விரைவு" : "Fastest"}: {formatSecs(entry.fastestTimeSeconds)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="font-serif font-bold text-sm sm:text-base text-[#5C121E]">
                  {entry.totalScore.toLocaleString()}
                </span>
                <span className="text-[10px] text-stone-400 block">
                  {isTamil ? "புள்ளிகள்" : "pts"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

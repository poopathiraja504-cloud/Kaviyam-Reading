import React, { useState, useEffect } from "react";
import { Trophy, Crown, Medal, Award, ArrowRight, User as UserIcon, Brain } from "lucide-react";
import { QuizAttempt, Quiz } from "../types";

interface QuizLeaderboardProps {
  currentUser?: any;
  quizzes: Quiz[];
  onGoToQuizzes?: () => void;
  lang?: string;
}

interface LeaderboardEntry {
  userId: string;
  userName: string;
  userPhoto?: string;
  totalScore: number;
  completedCount: number;
  avgScore: number;
  bestScore: number;
}

export default function QuizLeaderboard({
  currentUser,
  quizzes,
  onGoToQuizzes,
  lang = "en"
}: QuizLeaderboardProps) {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("kaviyam_quiz_attempts");
      if (stored) setAttempts(JSON.parse(stored));
    } catch (_) {}
  }, []);

  // Aggregate by user — since all data is local, we only have the current user
  const userAggregates: Record<string, LeaderboardEntry> = {};
  attempts
    .filter(a => a.status === "completed")
    .forEach(att => {
      const uid = att.userId || "anonymous";
      if (!userAggregates[uid]) {
        userAggregates[uid] = {
          userId: uid,
          userName: uid === (currentUser?.id || "guest")
            ? (currentUser?.username || currentUser?.profile?.username || "You")
            : `Reader ${uid.slice(0, 6)}`,
          totalScore: 0,
          completedCount: 0,
          avgScore: 0,
          bestScore: 0,
        };
      }
      userAggregates[uid].completedCount++;
      userAggregates[uid].totalScore += att.percentage;
      if (att.percentage > userAggregates[uid].bestScore) {
        userAggregates[uid].bestScore = att.percentage;
      }
    });

  const leaderboard: LeaderboardEntry[] = Object.values(userAggregates).map(u => ({
    ...u,
    avgScore: u.completedCount > 0 ? Math.round(u.totalScore / u.completedCount) : 0,
  })).sort((a, b) => b.avgScore - a.avgScore || b.completedCount - a.completedCount);

  const rankIcon = (i: number) => {
    if (i === 0) return <Crown className="w-5 h-5 text-amber-400" />;
    if (i === 1) return <Medal className="w-5 h-5 text-stone-400" />;
    if (i === 2) return <Award className="w-5 h-5 text-amber-700" />;
    return <span className="text-sm font-bold text-stone-400">#{i + 1}</span>;
  };

  const myRank = leaderboard.findIndex(e => e.userId === (currentUser?.id || "guest"));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#3B0B12] rounded-xl flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-xl text-[#3B0B12]">Leaderboard</h2>
            <p className="text-xs text-stone-400">Top Tamil literature quiz champions</p>
          </div>
        </div>
        {onGoToQuizzes && (
          <button onClick={onGoToQuizzes} className="text-xs text-[#D4AF37] font-semibold hover:underline flex items-center gap-1">
            Take Quiz <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* My Rank Banner */}
      {myRank >= 0 && (
        <div className="bg-gradient-to-r from-[#3B0B12] to-[#5C121E] rounded-xl p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#D4AF37]/20 rounded-full flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div>
              <p className="text-xs text-amber-200">Your Ranking</p>
              <p className="font-bold">#{myRank + 1} — {leaderboard[myRank]?.userName}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-[#D4AF37]">{leaderboard[myRank]?.avgScore}%</div>
            <div className="text-xs text-amber-200">{leaderboard[myRank]?.completedCount} attempts</div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      {leaderboard.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#E2DDD5]">
          <Trophy className="w-12 h-12 mx-auto text-stone-200 mb-3" />
          <p className="font-medium text-stone-500">No rankings yet.</p>
          <p className="text-xs text-stone-400 mt-1">Complete quizzes to appear on the leaderboard!</p>
          {onGoToQuizzes && (
            <button onClick={onGoToQuizzes} className="mt-4 flex items-center gap-2 mx-auto text-sm text-[#D4AF37] font-semibold hover:underline">
              Start a Quiz <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((entry, i) => {
            const isMe = entry.userId === (currentUser?.id || "guest");
            return (
              <div
                key={entry.userId}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  isMe
                    ? "bg-amber-50 border-[#D4AF37] shadow-sm"
                    : i < 3
                    ? "bg-white border-[#E2DDD5] shadow-sm"
                    : "bg-white border-[#E2DDD5]"
                }`}
              >
                <div className="w-8 flex items-center justify-center">
                  {rankIcon(i)}
                </div>
                <div className="w-9 h-9 rounded-full bg-[#3B0B12]/10 flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-[#3B0B12]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm truncate ${isMe ? "text-[#3B0B12]" : "text-stone-700"}`}>
                    {entry.userName} {isMe && <span className="text-xs text-[#D4AF37] font-normal">(You)</span>}
                  </p>
                  <p className="text-xs text-stone-400">{entry.completedCount} quiz{entry.completedCount !== 1 ? "zes" : ""} completed</p>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-black ${isMe ? "text-[#D4AF37]" : i < 3 ? "text-[#3B0B12]" : "text-stone-600"}`}>
                    {entry.avgScore}%
                  </div>
                  <div className="text-xs text-stone-400">avg</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-stone-400 text-center">
        💡 Leaderboard is based on your local quiz history. Multi-user leaderboards coming soon!
      </p>
    </div>
  );
}

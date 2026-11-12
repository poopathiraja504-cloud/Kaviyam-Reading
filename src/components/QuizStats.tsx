import React, { useState, useEffect } from "react";
import {
  BarChart3, Trophy, CheckCircle2, XCircle, Brain, Flame, Award, Sparkles, TrendingUp, Target, BookOpen, ArrowRight
} from "lucide-react";
import { QuizAttempt, Quiz } from "../types";

interface QuizStatsProps {
  currentUser?: any;
  quizzes: Quiz[];
  onGoToQuizzes?: () => void;
  lang?: string;
}

export default function QuizStats({
  currentUser,
  quizzes,
  onGoToQuizzes,
  lang = "en"
}: QuizStatsProps) {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("kaviyam_quiz_attempts");
      if (stored) setAttempts(JSON.parse(stored));
    } catch (_) {}
  }, []);

  const userId = currentUser?.id || "guest";
  const completedAttempts = attempts.filter(a => (a.userId === userId || userId === "guest") && ((a.status || "").toLowerCase() === "completed"));

  const totalAttempts = completedAttempts.length;
  const totalCorrect = completedAttempts.reduce((acc, a) => acc + a.correctAnswers, 0);
  const totalWrong = completedAttempts.reduce((acc, a) => acc + a.wrongAnswers, 0);
  const totalAnswered = totalCorrect + totalWrong;
  const avgScore = totalAttempts > 0
    ? Math.round(completedAttempts.reduce((acc, a) => acc + a.percentage, 0) / totalAttempts)
    : 0;
  const bestScore = totalAttempts > 0
    ? Math.max(...completedAttempts.map(a => a.percentage))
    : 0;
  const passRate = totalAttempts > 0
    ? Math.round((completedAttempts.filter(a => a.percentage >= 50).length / totalAttempts) * 100)
    : 0;
  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  const uniqueQuizzes = new Set(completedAttempts.map(a => a.quizId)).size;

  // Category breakdown
  const catMap: Record<string, { count: number; totalPct: number }> = {};
  completedAttempts.forEach(a => {
    const quiz = quizzes.find(q => q.id === a.quizId);
    const cat = quiz?.category || "Other";
    if (!catMap[cat]) catMap[cat] = { count: 0, totalPct: 0 };
    catMap[cat].count++;
    catMap[cat].totalPct += a.percentage;
  });
  const catStats = Object.entries(catMap)
    .map(([cat, data]) => ({ cat, count: data.count, avg: Math.round(data.totalPct / data.count) }))
    .sort((a, b) => b.count - a.count);

  if (totalAttempts === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#3B0B12] rounded-xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <h2 className="font-serif font-bold text-xl text-[#3B0B12]">My Quiz Stats</h2>
        </div>
        <div className="text-center py-16 bg-white rounded-2xl border border-[#E2DDD5]">
          <BarChart3 className="w-12 h-12 mx-auto text-stone-200 mb-3" />
          <p className="font-medium text-stone-500">No stats yet.</p>
          <p className="text-xs text-stone-400 mt-1">Complete some quizzes to see your performance analytics!</p>
          {onGoToQuizzes && (
            <button onClick={onGoToQuizzes} className="mt-4 flex items-center gap-2 mx-auto text-sm text-[#D4AF37] font-semibold hover:underline">
              Browse Quizzes <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#3B0B12] rounded-xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-xl text-[#3B0B12]">My Quiz Stats</h2>
            <p className="text-xs text-stone-400">Based on {totalAttempts} attempt{totalAttempts !== 1 ? "s" : ""}</p>
          </div>
        </div>
        {onGoToQuizzes && (
          <button onClick={onGoToQuizzes} className="text-xs text-[#D4AF37] font-semibold hover:underline">
            Browse Quizzes →
          </button>
        )}
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Avg Score", value: `${avgScore}%`, icon: Target, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Best Score", value: `${bestScore}%`, icon: Trophy, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Pass Rate", value: `${passRate}%`, icon: Award, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Accuracy", value: `${accuracy}%`, icon: Brain, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl p-4 ${s.bg} border border-transparent`}>
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <div className="text-2xl font-black text-stone-800">{s.value}</div>
            <div className="text-xs text-stone-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Correct vs Wrong */}
      <div className="bg-white rounded-2xl border border-[#E2DDD5] p-5">
        <h3 className="font-semibold text-[#3B0B12] mb-4 text-sm">Answer Breakdown</h3>
        <div className="flex items-center gap-4 mb-3">
          <div className="flex-1">
            <div className="h-4 bg-[#E2DDD5] rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${accuracy}%` }} />
            </div>
          </div>
          <span className="text-sm font-bold text-emerald-600">{accuracy}%</span>
        </div>
        <div className="flex justify-between text-xs text-stone-500">
          <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> {totalCorrect} Correct</span>
          <span className="flex items-center gap-1"><XCircle className="w-3 h-3 text-red-400" /> {totalWrong} Wrong</span>
        </div>
      </div>

      {/* Additional stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-[#E2DDD5] p-4 text-center">
          <BookOpen className="w-5 h-5 text-[#5C121E] mx-auto mb-1" />
          <div className="text-2xl font-black text-[#3B0B12]">{uniqueQuizzes}</div>
          <div className="text-xs text-stone-400">Unique Quizzes</div>
        </div>
        <div className="bg-white rounded-2xl border border-[#E2DDD5] p-4 text-center">
          <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
          <div className="text-2xl font-black text-[#3B0B12]">{totalAttempts}</div>
          <div className="text-xs text-stone-400">Total Attempts</div>
        </div>
      </div>

      {/* Category Stats */}
      {catStats.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E2DDD5] p-5">
          <h3 className="font-semibold text-[#3B0B12] mb-3 text-sm">Performance by Category</h3>
          <div className="space-y-2">
            {catStats.map(({ cat, count, avg }) => (
              <div key={cat} className="flex items-center gap-3">
                <span className="text-xs text-stone-500 w-28 truncate">{cat}</span>
                <div className="flex-1 h-2 bg-[#E2DDD5] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#3B0B12] to-[#D4AF37] rounded-full" style={{ width: `${avg}%` }} />
                </div>
                <span className="text-xs font-bold text-[#3B0B12] w-10 text-right">{avg}%</span>
                <span className="text-xs text-stone-400 w-12 text-right">{count} tries</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

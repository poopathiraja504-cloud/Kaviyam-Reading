import React, { useState, useEffect } from "react";
import { History, Trophy, RotateCcw, Eye, Calendar, Clock, Brain, ArrowLeft, BookOpen } from "lucide-react";
import { QuizAttempt, Quiz } from "../types";

interface QuizHistoryProps {
  currentUser?: any;
  quizzes: Quiz[];
  onSelectQuiz: (quizId: string) => void;
  onViewStats?: () => void;
  lang?: string;
}

export default function QuizHistory({
  currentUser,
  quizzes,
  onSelectQuiz,
  onViewStats,
  lang = "en"
}: QuizHistoryProps) {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("kaviyam_quiz_attempts");
      if (stored) setAttempts(JSON.parse(stored));
    } catch (_) {}
  }, []);

  const userId = currentUser?.id || "guest";
  const completedAttempts = [...attempts]
    .filter(a => a.userId === userId && a.status === "completed")
    .sort((a, b) => new Date(b.completedAt || b.startedAt).getTime() - new Date(a.completedAt || a.startedAt).getTime());

  const formatSecs = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#3B0B12] rounded-xl flex items-center justify-center">
            <History className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-xl text-[#3B0B12]">Quiz History</h2>
            <p className="text-xs text-stone-400">{completedAttempts.length} completed attempt{completedAttempts.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        {onViewStats && (
          <button onClick={onViewStats} className="text-xs text-[#D4AF37] hover:underline font-semibold">
            View Stats →
          </button>
        )}
      </div>

      {completedAttempts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#E2DDD5]">
          <Brain className="w-12 h-12 mx-auto text-stone-200 mb-3" />
          <p className="font-medium text-stone-500">No quiz attempts yet.</p>
          <p className="text-xs text-stone-400 mt-1">Head to the Quiz Center to start your first quiz!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {completedAttempts.map((attempt) => {
            const quiz = quizzes.find(q => q.id === attempt.quizId);
            const isPassed = attempt.percentage >= 50;
            return (
              <div
                key={attempt.id}
                className="bg-white rounded-xl border border-[#E2DDD5] p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isPassed ? "bg-emerald-100" : "bg-red-100"}`}>
                    <Trophy className={`w-5 h-5 ${isPassed ? "text-emerald-600" : "text-red-400"}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-[#3B0B12] truncate">{quiz?.title || `Quiz ${attempt.quizId}`}</p>
                    <p className="text-xs text-stone-400 flex items-center gap-2 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {formatDate(attempt.completedAt || attempt.startedAt)}
                      <Clock className="w-3 h-3" />
                      {formatSecs(attempt.timeTakenSeconds || 0)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <div className={`text-lg font-black ${isPassed ? "text-emerald-600" : "text-red-500"}`}>
                      {attempt.percentage}%
                    </div>
                    <div className="text-xs text-stone-400">{attempt.correctAnswers}/{attempt.correctAnswers + attempt.wrongAnswers + (attempt.unansweredCount || 0)}</div>
                  </div>
                  <button
                    onClick={() => quiz && onSelectQuiz(quiz.id)}
                    className="p-2 rounded-lg bg-[#3B0B12] text-white hover:bg-[#5C121E] transition-colors"
                    title="Retry Quiz"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

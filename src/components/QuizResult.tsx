import React from "react";
import { Trophy, CheckCircle2, XCircle, Clock, RotateCcw, ArrowLeft, History, Brain, Star } from "lucide-react";
import { Quiz, QuizAttempt } from "../types";

interface QuizResultProps {
  attempt: QuizAttempt;
  quiz: Quiz | any;
  currentUser?: any;
  onReviewAnswers?: () => void;
  onRetry?: () => void;
  onRetake?: () => void;
  onNextQuiz?: () => void;
  onGoToQuizzes?: () => void;
  onBackToCenter?: () => void;
  onViewHistory?: () => void;
  lang?: string;
}

export default function QuizResult({
  attempt,
  quiz,
  currentUser,
  onReviewAnswers,
  onRetry,
  onGoToQuizzes,
  onViewHistory,
  lang = "en"
}: QuizResultProps) {
  const isPassed = attempt.percentage >= 50;

  const formatSecs = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  const grade = () => {
    if (attempt.percentage >= 90) return { label: "Excellent!", color: "text-emerald-600", emoji: "🏆" };
    if (attempt.percentage >= 70) return { label: "Great Job!", color: "text-blue-600", emoji: "⭐" };
    if (attempt.percentage >= 50) return { label: "Good Effort!", color: "text-amber-600", emoji: "👍" };
    return { label: "Keep Trying!", color: "text-red-500", emoji: "💪" };
  };

  const g = grade();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Result Card */}
      <div className={`rounded-2xl p-8 text-center ${isPassed ? "bg-gradient-to-b from-emerald-50 to-white border-2 border-emerald-200" : "bg-gradient-to-b from-red-50 to-white border-2 border-red-200"}`}>
        <div className="text-5xl mb-3">{g.emoji}</div>
        <h2 className={`text-2xl font-bold font-serif mb-1 ${g.color}`}>{g.label}</h2>
        <p className="text-stone-500 text-sm mb-6">{quiz.title}</p>

        {/* Score Circle */}
        <div className={`inline-flex flex-col items-center justify-center w-32 h-32 rounded-full border-4 mb-6 ${isPassed ? "border-emerald-400 bg-emerald-50" : "border-red-400 bg-red-50"}`}>
          <span className={`text-4xl font-black ${isPassed ? "text-emerald-600" : "text-red-600"}`}>
            {attempt.percentage}%
          </span>
          <span className="text-xs text-stone-400 mt-1">Score</span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Score", value: `${attempt.totalScore}/100`, icon: Trophy, color: "text-amber-600" },
            { label: "Correct", value: attempt.correctAnswers, icon: CheckCircle2, color: "text-emerald-600" },
            { label: "Wrong", value: attempt.wrongAnswers, icon: XCircle, color: "text-red-500" },
            { label: "Time Used", value: formatSecs(attempt.timeTakenSeconds || 0), icon: Clock, color: "text-blue-600" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-3 shadow-sm border border-[#E2DDD5]">
              <stat.icon className={`w-4 h-4 ${stat.color} mx-auto mb-1`} />
              <div className="text-lg font-bold text-stone-800">{stat.value}</div>
              <div className="text-xs text-stone-400">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold ${isPassed ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
          {isPassed ? "✓ PASSED" : "✗ FAILED"} — {attempt.unansweredCount || 0} skipped
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onReviewAnswers}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-[#3B0B12] text-white rounded-xl font-semibold text-sm hover:bg-[#5C121E] transition-colors"
        >
          <Brain className="w-4 h-4" />
          Review Answers
        </button>
        <button
          onClick={onRetry}
          className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-[#D4AF37] text-[#3B0B12] rounded-xl font-semibold text-sm hover:bg-amber-50 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Retry Quiz
        </button>
        <button
          onClick={onViewHistory}
          className="flex items-center justify-center gap-2 px-4 py-3 border border-[#E2DDD5] text-stone-600 rounded-xl font-semibold text-sm hover:bg-stone-50 transition-colors"
        >
          <History className="w-4 h-4" />
          View History
        </button>
        <button
          onClick={onGoToQuizzes}
          className="flex items-center justify-center gap-2 px-4 py-3 border border-[#E2DDD5] text-stone-600 rounded-xl font-semibold text-sm hover:bg-stone-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          All Quizzes
        </button>
      </div>
    </div>
  );
}

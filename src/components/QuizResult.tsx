import React, { useState } from "react";
import { Trophy, CheckCircle2, XCircle, Clock, RotateCcw, ArrowRight, Eye, Home, Award, Sparkles, AlertCircle } from "lucide-react";
import { QuizAttempt, QuizSet } from "../types";
import { Language } from "../utils/i18n";

interface QuizResultProps {
  attempt: QuizAttempt;
  quiz: QuizSet;
  onRetake: () => void;
  onNextQuiz?: () => void;
  onBackToCenter: () => void;
  lang: Language;
}

export default function QuizResult({
  attempt,
  quiz,
  onRetake,
  onNextQuiz,
  onBackToCenter,
  lang,
}: QuizResultProps) {
  const [showReview, setShowReview] = useState(false);

  // Determine Performance Level Message
  const getPerformanceMessage = (percentage: number) => {
    if (lang === "ta") {
      if (percentage >= 90) return "மிகச்சிறப்பு! அசத்தலான செயல்திறன்!";
      if (percentage >= 75) return "அருமை! தொடர்ந்து முன்னேறுங்கள்!";
      if (percentage >= 50) return "நல்ல முயற்சி! இன்னும் உங்களால் சிறப்பாக செய்ய முடியும்.";
      return "தொடர்ந்து பயிற்சி செய்யுங்கள். நீங்கள் நிச்சயம் முன்னேறுவீர்கள்!";
    }
    if (percentage >= 90) return "Excellent! Outstanding performance!";
    if (percentage >= 75) return "Great job! Keep going!";
    if (percentage >= 50) return "Good effort! You can improve further.";
    return "Keep practicing. You will improve!";
  };

  const performanceMessage = getPerformanceMessage(attempt.percentage);

  // Format time (e.g., 06:32)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 font-sans">
      {/* Header Result Banner */}
      <div className="bg-gradient-to-br from-[#3B0B12] via-[#5C121E] to-[#1E0408] text-white p-6 sm:p-10 rounded-3xl border border-[#D4AF37]/40 shadow-xl text-center space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Celebration Trophy */}
        <div className="w-20 h-20 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-amber-300 flex items-center justify-center mx-auto shadow-inner animate-bounce">
          <Trophy className="w-10 h-10" />
        </div>

        <div className="space-y-2 max-w-lg mx-auto">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-300 bg-white/10 px-3 py-1 rounded-full border border-white/20">
            {lang === "ta" ? "வினாடி வினா முடிந்தது" : "Quiz Completed"}
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-amber-50">
            {attempt.quizTitle}
          </h1>
          <p className="text-sm font-semibold text-amber-200">
            {performanceMessage}
          </p>
        </div>

        {/* Big Score Display */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 inline-block max-w-sm w-full mx-auto space-y-1">
          <span className="text-stone-300 text-xs uppercase tracking-wider font-bold">
            {lang === "ta" ? "உங்களது மொத்த மதிப்பெண்" : "Your Total Score"}
          </span>
          <div className="text-4xl sm:text-5xl font-serif font-extrabold text-[#D4AF37]">
            {attempt.score} <span className="text-lg sm:text-2xl text-stone-300 font-normal">/ {quiz.totalMarks}</span>
          </div>
          <span className="inline-block px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-300/30">
            {attempt.percentage}% {lang === "ta" ? "சதவீதம்" : "Percentage"}
          </span>
        </div>
      </div>

      {/* Breakdown Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E2DDD5] text-center space-y-1 shadow-xs">
          <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
          <span className="block text-xs font-bold text-stone-500 uppercase">
            {lang === "ta" ? "சரியானவை" : "Correct"}
          </span>
          <span className="text-xl font-bold text-emerald-600">{attempt.correctAnswers}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E2DDD5] text-center space-y-1 shadow-xs">
          <XCircle className="w-6 h-6 text-red-500 mx-auto" />
          <span className="block text-xs font-bold text-stone-500 uppercase">
            {lang === "ta" ? "தவறானவை" : "Wrong"}
          </span>
          <span className="text-xl font-bold text-red-600">{attempt.wrongAnswers}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E2DDD5] text-center space-y-1 shadow-xs">
          <AlertCircle className="w-6 h-6 text-amber-500 mx-auto" />
          <span className="block text-xs font-bold text-stone-500 uppercase">
            {lang === "ta" ? "பதிலளிக்காதவை" : "Unanswered"}
          </span>
          <span className="text-xl font-bold text-amber-600">{attempt.unansweredQuestions}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E2DDD5] text-center space-y-1 shadow-xs">
          <Clock className="w-6 h-6 text-blue-500 mx-auto" />
          <span className="block text-xs font-bold text-stone-500 uppercase">
            {lang === "ta" ? "பயன்படுத்திய நேரம்" : "Time Used"}
          </span>
          <span className="text-xl font-bold text-stone-800">{formatTime(attempt.timeUsed)}</span>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => setShowReview(!showReview)}
          className={`px-5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            showReview
              ? "bg-[#5C121E] text-white border-[#5C121E]"
              : "bg-white text-stone-800 border-[#E2DDD5] hover:bg-stone-50"
          }`}
        >
          <Eye className="w-4 h-4 text-amber-600" />
          <span>
            {showReview
              ? lang === "ta"
                ? "மதிப்பாய்வை மறை"
                : "Hide Review"
              : lang === "ta"
              ? "பதில்களை மதிப்பாய்வு செய்"
              : "Review Answers"}
          </span>
        </button>

        <button
          onClick={onRetake}
          className="px-5 py-2.5 rounded-xl bg-white border border-[#E2DDD5] hover:bg-stone-50 text-stone-800 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-stone-600" />
          <span>{lang === "ta" ? "மீண்டும் முயற்சி செய்" : "Try Again"}</span>
        </button>

        {onNextQuiz && (
          <button
            onClick={onNextQuiz}
            className="px-5 py-2.5 rounded-xl bg-[#5C121E] hover:bg-[#3B0B12] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <span>{lang === "ta" ? "அடுத்த வினாடி வினா" : "Next Quiz"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={onBackToCenter}
          className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
        >
          <Home className="w-4 h-4 text-stone-600" />
          <span>{lang === "ta" ? "வினாடி வினா மையத்திற்கு திரும்பு" : "Back to Quiz Center"}</span>
        </button>
      </div>

      {/* Answer Review Section */}
      {showReview && (
        <div className="bg-white rounded-3xl border border-[#E2DDD5] p-6 sm:p-8 space-y-6 shadow-md">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <h3 className="font-serif text-xl font-bold text-[#3B0B12] flex items-center gap-2">
              <Eye className="w-5 h-5 text-amber-700" />
              <span>{lang === "ta" ? "விரிவான விடை மதிப்பாய்வு" : "Detailed Answers Review"}</span>
            </h3>
            <span className="text-xs text-stone-500 font-medium">
              {lang === "ta" ? "மதிப்பெண்" : "Score"}: {attempt.score} / {quiz.totalMarks}
            </span>
          </div>

          <div className="space-y-6">
            {quiz.questions.map((q, idx) => {
              const userAnswer = attempt.answers[q.questionId];
              const isCorrect = userAnswer === q.correctAnswer;
              const isUnanswered = !userAnswer;

              return (
                <div
                  key={q.questionId}
                  className={`p-5 rounded-2xl border space-y-3 ${
                    isCorrect
                      ? "bg-emerald-50/50 border-emerald-200"
                      : isUnanswered
                      ? "bg-amber-50/50 border-amber-200"
                      : "bg-red-50/50 border-red-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                        {lang === "ta" ? `கேள்வி ${idx + 1}` : `Question ${idx + 1}`}
                      </span>
                      <h4 className="font-serif text-sm sm:text-base font-bold text-stone-900">
                        {q.question}
                      </h4>
                    </div>

                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border shrink-0 ${
                        isCorrect
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : isUnanswered
                          ? "bg-amber-100 text-amber-800 border-amber-300"
                          : "bg-red-100 text-red-800 border-red-300"
                      }`}
                    >
                      {isCorrect
                        ? lang === "ta"
                          ? "✓ 10 / 10 மதிப்பெண்கள்"
                          : "✓ 10 / 10 Marks"
                        : lang === "ta"
                        ? "0 / 10 மதிப்பெண்கள்"
                        : "0 / 10 Marks"}
                    </span>
                  </div>

                  {/* Options status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    {(["A", "B", "C", "D"] as const).map((key) => {
                      const optText = q.options[key];
                      const isUserChoice = userAnswer === key;
                      const isCorrectChoice = q.correctAnswer === key;

                      return (
                        <div
                          key={key}
                          className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                            isCorrectChoice
                              ? "bg-emerald-100/80 border-emerald-400 font-bold text-emerald-950"
                              : isUserChoice
                              ? "bg-red-100/80 border-red-400 font-bold text-red-950"
                              : "bg-white/80 border-stone-200 text-stone-700"
                          }`}
                        >
                          <span className="font-mono font-bold">{key}.</span>
                          <span className="flex-1">{optText}</span>
                          {isCorrectChoice && (
                            <span className="text-emerald-700 text-xs">
                              {lang === "ta" ? "✓ சரியானது" : "✓ Correct"}
                            </span>
                          )}
                          {isUserChoice && !isCorrectChoice && (
                            <span className="text-red-700 text-xs">
                              {lang === "ta" ? "✗ உங்களது விடை" : "✗ Your Answer"}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  <div className="p-3 bg-white/90 rounded-xl border border-stone-200/80 text-xs space-y-1 text-stone-700">
                    <span className="font-bold text-[#3B0B12] block">
                      {lang === "ta" ? "விளக்கம்:" : "Explanation:"}
                    </span>
                    <p className="leading-relaxed">{q.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

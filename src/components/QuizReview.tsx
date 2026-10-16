import React from "react";
import { ArrowLeft, CheckCircle2, XCircle, HelpCircle, Sparkles, BookOpen } from "lucide-react";
import { Quiz, QuizAttempt } from "../types";
import { Language } from "../utils/i18n";

interface QuizReviewProps {
  quiz: Quiz;
  attempt: QuizAttempt;
  onBack: () => void;
  onRetry?: () => void;
  lang?: Language;
}

export default function QuizReview({
  quiz,
  attempt,
  onBack,
  onRetry,
  lang = "en"
}: QuizReviewProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-6 font-sans">
      
      {/* Top Header & Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-[#3B0B12] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#D4AF37]" />
          <span>Back to Result</span>
        </button>

        <span className="text-xs font-extrabold text-[#3B0B12] bg-[#3B0B12]/10 px-3 py-1 rounded-full">
          Score: {attempt.score} / {attempt.totalMarks} ({attempt.percentage}%)
        </span>
      </div>

      {/* Review Header Banner */}
      <div className="bg-gradient-to-r from-[#3B0B12] to-[#5C121E] text-white p-6 rounded-3xl shadow-xl space-y-1 border border-[#D4AF37]/30">
        <h1 className="font-serif text-xl sm:text-2xl font-extrabold text-white">
          Answer Review – {quiz.title}
        </h1>
        <p className="text-xs text-amber-200/80">
          Review all 10 questions, your selected answers, correct solutions, and literary explanations.
        </p>
      </div>

      {/* Questions Breakdown List */}
      <div className="space-y-4">
        {quiz.questions.map((q, idx) => {
          const userAns = attempt.answers[q.id] || "";
          const isCorrect = userAns === q.correctAnswer;
          const isUnanswered = !userAns;

          return (
            <div
              key={q.id}
              className={`bg-white rounded-3xl border p-5 sm:p-6 shadow-sm space-y-4 transition-all ${
                isCorrect
                  ? "border-emerald-200"
                  : isUnanswered
                  ? "border-amber-200"
                  : "border-rose-200"
              }`}
            >
              {/* Question Header & Status Pill */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-[#3B0B12] text-[#D4AF37] font-bold text-xs flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-stone-500">Question {idx + 1} of 10</span>
                </div>

                {isCorrect ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" /> +10 Marks (Correct)
                  </span>
                ) : isUnanswered ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                    <HelpCircle className="w-3.5 h-3.5" /> 0 Marks (Unanswered)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
                    <XCircle className="w-3.5 h-3.5" /> 0 Marks (Incorrect)
                  </span>
                )}
              </div>

              {/* Question Text */}
              <h3 className="font-serif font-bold text-stone-900 text-base leading-snug">
                {q.question}
              </h3>

              {/* Options Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {(["A", "B", "C", "D"] as const).map((key) => {
                  const optText = q.options[key];
                  const isUserSelection = userAns === key;
                  const isCorrectOption = q.correctAnswer === key;

                  let optBg = "bg-stone-50 text-stone-700 border-stone-200";
                  if (isCorrectOption) {
                    optBg = "bg-emerald-100 text-emerald-900 border-emerald-300 font-bold shadow-xs";
                  } else if (isUserSelection && !isCorrect) {
                    optBg = "bg-rose-100 text-rose-900 border-rose-300 font-semibold";
                  }

                  return (
                    <div
                      key={key}
                      className={`p-3 rounded-xl border flex items-start gap-2.5 ${optBg}`}
                    >
                      <span className="font-bold">{key}.</span>
                      <div className="flex-1 min-w-0">
                        <span>{optText}</span>
                        {isCorrectOption && (
                          <span className="ml-2 text-[10px] text-emerald-700 font-extrabold uppercase">(Correct Answer)</span>
                        )}
                        {isUserSelection && !isCorrect && (
                          <span className="ml-2 text-[10px] text-rose-700 font-extrabold uppercase">(Your Answer)</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Literary Explanation Box */}
              <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#E2DDD5] text-xs space-y-1">
                <p className="font-bold text-[#3B0B12] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Literary Explanation:
                </p>
                <p className="text-stone-600 leading-relaxed pl-5">
                  {q.explanation}
                </p>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}

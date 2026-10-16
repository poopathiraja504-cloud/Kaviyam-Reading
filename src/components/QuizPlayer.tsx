import React, { useState, useEffect, useRef } from "react";
import {
  Clock, CheckCircle2, XCircle, ChevronLeft, ChevronRight,
  ArrowLeft, AlertTriangle, Brain
} from "lucide-react";
import { Quiz, QuizAttempt, QuizQuestion } from "../types";

interface QuizPlayerProps {
  quiz: Quiz;
  currentUser?: any;
  onBack: () => void;
  onComplete: (attempt: QuizAttempt) => void;
  lang?: string;
}

export default function QuizPlayer({
  quiz,
  currentUser,
  onBack,
  onComplete,
  lang = "en"
}: QuizPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>({});
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() => quiz.timeLimitMinutes * 60);
  const [timedOut, setTimedOut] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTime = useRef(new Date().toISOString());

  const question: QuizQuestion = quiz.questions[currentIndex];
  const totalQuestions = quiz.questions.length;
  const answered = Object.keys(answers).length;

  // Countdown timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setTimedOut(true);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleSelectAnswer = (option: "A" | "B" | "C" | "D") => {
    setAnswers(prev => ({ ...prev, [question.id]: option }));
  };

  const handleSubmit = (auto = false) => {
    clearInterval(timerRef.current!);
    const correct = quiz.questions.filter(q => answers[q.id] === q.correctAnswer).length;
    const wrong = quiz.questions.filter(q => answers[q.id] && answers[q.id] !== q.correctAnswer).length;
    const unanswered = totalQuestions - answered;
    const totalScore = correct * 10;
    const percentage = Math.round((correct / totalQuestions) * 100);
    const timeUsed = quiz.timeLimitMinutes * 60 - timeLeft;

    const attempt: QuizAttempt = {
      id: `att-${Date.now()}`,
      quizId: quiz.id,
      userId: currentUser?.id || "guest",
      status: "completed",
      answers,
      correctAnswers: correct,
      wrongAnswers: wrong,
      unansweredCount: unanswered,
      totalScore,
      percentage,
      timeTakenSeconds: timeUsed,
      startedAt: startTime.current,
      completedAt: new Date().toISOString(),
    };

    // Persist attempt
    try {
      const existing = JSON.parse(localStorage.getItem("kaviyam_quiz_attempts") || "[]");
      localStorage.setItem("kaviyam_quiz_attempts", JSON.stringify([...existing, attempt]));
    } catch (_) {}

    onComplete(attempt);
  };

  const isTimeLow = timeLeft <= 60;

  const optionLabels: Array<"A" | "B" | "C" | "D"> = ["A", "B", "C", "D"];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-[#3B0B12] to-[#5C121E] rounded-2xl p-4 text-white flex items-center justify-between">
        <div>
          <p className="text-xs text-amber-200 mb-0.5">{quiz.title}</p>
          <p className="text-sm font-semibold">
            Question {currentIndex + 1} of {totalQuestions}
          </p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg ${isTimeLow ? "bg-red-500 animate-pulse" : "bg-white/15"}`}>
          <Clock className="w-4 h-4" />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress */}
      <div className="h-2 bg-[#E2DDD5] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#D4AF37] to-[#5C121E] transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="bg-white rounded-2xl border border-[#E2DDD5] p-6 shadow-sm">
        <div className="flex items-start gap-3 mb-6">
          <span className="w-8 h-8 rounded-full bg-[#3B0B12] text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
            {currentIndex + 1}
          </span>
          <p className="text-stone-800 font-medium leading-relaxed">{question.question}</p>
        </div>

        <div className="space-y-3">
          {optionLabels.map((opt) => {
            const optText = question[`option${opt}` as keyof QuizQuestion] as string;
            const isSelected = answers[question.id] === opt;
            return (
              <button
                key={opt}
                onClick={() => handleSelectAnswer(opt)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  isSelected
                    ? "border-[#D4AF37] bg-amber-50 text-[#3B0B12]"
                    : "border-[#E2DDD5] hover:border-[#D4AF37]/50 hover:bg-amber-50/50 text-stone-700"
                }`}
              >
                <span className={`inline-block w-6 h-6 rounded-full text-xs font-bold mr-3 text-center leading-6 ${
                  isSelected ? "bg-[#D4AF37] text-[#3B0B12]" : "bg-[#E2DDD5] text-stone-600"
                }`}>{opt}</span>
                {optText}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E2DDD5] text-sm font-semibold text-stone-600 hover:bg-stone-50 disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        {/* Question Dots */}
        <div className="flex gap-1 flex-wrap justify-center max-w-xs">
          {quiz.questions.map((q, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-6 h-6 rounded-full text-xs font-bold transition-all ${
                i === currentIndex
                  ? "bg-[#3B0B12] text-white"
                  : answers[q.id]
                  ? "bg-[#D4AF37] text-[#3B0B12]"
                  : "bg-[#E2DDD5] text-stone-500"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {currentIndex < totalQuestions - 1 ? (
          <button
            onClick={() => setCurrentIndex(i => Math.min(totalQuestions - 1, i + 1))}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3B0B12] text-white text-sm font-semibold hover:bg-[#5C121E] transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
          >
            Submit Quiz
            <CheckCircle2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Answered count */}
      <p className="text-center text-xs text-stone-400">
        {answered}/{totalQuestions} answered • {totalQuestions - answered} remaining
      </p>

      {/* Submit Confirm Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
              <h3 className="font-bold text-[#3B0B12]">Submit Quiz?</h3>
            </div>
            <p className="text-sm text-stone-600 mb-2">
              You have answered <strong>{answered}</strong> of <strong>{totalQuestions}</strong> questions.
            </p>
            {answered < totalQuestions && (
              <p className="text-xs text-amber-600 mb-4">
                ⚠ {totalQuestions - answered} question{totalQuestions - answered !== 1 ? "s" : ""} unanswered.
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 px-4 py-2 border border-[#E2DDD5] rounded-xl text-sm font-semibold text-stone-600 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowSubmitModal(false); handleSubmit(); }}
                className="flex-1 px-4 py-2 bg-emerald-600 rounded-xl text-white text-sm font-semibold hover:bg-emerald-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

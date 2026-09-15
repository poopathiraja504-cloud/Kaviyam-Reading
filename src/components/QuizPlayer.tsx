import React, { useState, useEffect, useRef } from "react";
import { Clock, ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle, Lock } from "lucide-react";
import { QuizSet, QuizAttempt, User } from "../types";
import { Language } from "../utils/i18n";
import LoginRequiredScreen from "./LoginRequiredScreen";

interface QuizPlayerProps {
  quiz: QuizSet;
  currentUser: User | null;
  onSubmitQuiz: (attempt: QuizAttempt) => void;
  onCancelQuiz: () => void;
  onRequireLogin?: (quizId: string) => void;
  onRequireRegister?: (quizId: string) => void;
  onGoogleLogin?: () => void;
  lang: Language;
}

export default function QuizPlayer({
  quiz,
  currentUser,
  onSubmitQuiz,
  onCancelQuiz,
  onRequireLogin,
  onRequireRegister,
  onGoogleLogin,
  lang,
}: QuizPlayerProps) {
  const isGuest = !currentUser || currentUser.id === "guest-user-session" || currentUser.role === "guest";

  // If user is guest, immediately block QuizPlayer
  if (isGuest) {
    return (
      <div className="py-8">
        <LoginRequiredScreen
          title={lang === "ta" ? "வினாடி வினா எழுத Google உள்நுழைவு தேவை" : "Google Sign-In Required to Take Quiz"}
          message={
            lang === "ta"
              ? "அனைத்து வினாடி வினாக்களையும் அணுகவும், உங்கள் முன்னேற்றத்தைச் சேமிக்கவும், XP புள்ளிகளைப் பெறவும் Google உள்நுழைவு அவசியம்."
              : "Google sign-in is required to access and attend all quizzes, save your progress, and earn XP."
          }
          onGoogleLogin={onGoogleLogin}
          onBack={onCancelQuiz}
          onLogin={() => {
            if (onRequireLogin) {
              onRequireLogin(quiz.quizId);
            } else {
              localStorage.setItem("pendingQuizId", quiz.quizId);
              localStorage.setItem("kaviyam_pending_quiz_id", quiz.quizId);
              localStorage.setItem("pendingQuizRoute", `/quizzes/${quiz.quizId}`);
              localStorage.setItem("kaviyam_pending_quiz_route", `/quizzes/${quiz.quizId}`);
              window.location.href = "/login";
            }
          }}
          onRegister={() => {
            if (onRequireRegister) {
              onRequireRegister(quiz.quizId);
            } else {
              localStorage.setItem("pendingQuizId", quiz.quizId);
              localStorage.setItem("kaviyam_pending_quiz_id", quiz.quizId);
              localStorage.setItem("pendingQuizRoute", `/quizzes/${quiz.quizId}`);
              localStorage.setItem("kaviyam_pending_quiz_route", `/quizzes/${quiz.quizId}`);
              window.location.href = "/login";
            }
          }}
          lang={lang}
        />
      </div>
    );
  }

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>(() => {
    const saved = localStorage.getItem(`kaviyam_quiz_draft_${quiz.quizId}`);
    return saved ? JSON.parse(saved) : {};
  });

  const [startTime] = useState<number>(() => {
    const savedTime = localStorage.getItem(`kaviyam_quiz_startTime_${quiz.quizId}`);
    if (savedTime) return parseInt(savedTime, 10);
    const now = Date.now();
    localStorage.setItem(`kaviyam_quiz_startTime_${quiz.quizId}`, now.toString());
    return now;
  });

  const [timeLeft, setTimeLeft] = useState<number>(() => {
    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    const remaining = quiz.timeLimit - elapsedSeconds;
    return remaining > 0 ? remaining : 0;
  });

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer Countdown Effect
  useEffect(() => {
    timerRef.current = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      const remaining = quiz.timeLimit - elapsedSeconds;

      if (remaining <= 0) {
        setTimeLeft(0);
        if (timerRef.current) clearInterval(timerRef.current);
        // Auto submit when time runs out
        handleFinalSubmission(true);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTime, quiz.timeLimit]);

  // Persist draft answers to localStorage
  const handleSelectAnswer = (optionKey: "A" | "B" | "C" | "D") => {
    const currentQ = quiz.questions[currentIdx];
    const newAnswers = { ...answers, [currentQ.questionId]: optionKey };
    setAnswers(newAnswers);
    localStorage.setItem(`kaviyam_quiz_draft_${quiz.quizId}`, JSON.stringify(newAnswers));
  };

  // Format Timer string (e.g. 09:59)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Calculate score and complete submission
  const handleFinalSubmission = (autoSubmitted = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (timerRef.current) clearInterval(timerRef.current);

    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    quiz.questions.forEach((q) => {
      const chosen = answers[q.questionId];
      if (!chosen) {
        unansweredCount++;
      } else if (chosen === q.correctAnswer) {
        correctCount++;
      } else {
        wrongCount++;
      }
    });

    const score = correctCount * quiz.marksPerQuestion;
    const percentage = Math.round((score / quiz.totalMarks) * 100);
    const timeUsed = Math.min(quiz.timeLimit, Math.floor((Date.now() - startTime) / 1000));

    // Cleanup draft localStorage
    localStorage.removeItem(`kaviyam_quiz_draft_${quiz.quizId}`);
    localStorage.removeItem(`kaviyam_quiz_startTime_${quiz.quizId}`);

    const attempt: QuizAttempt = {
      attemptId: `att_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      quizId: quiz.quizId,
      quizTitle: quiz.title,
      userId: currentUser?.id || "guest",
      username: currentUser?.username || "Guest Reader",
      answers,
      score,
      percentage,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      unansweredQuestions: unansweredCount,
      timeUsed,
      startedAt: new Date(startTime).toISOString(),
      completedAt: new Date().toISOString(),
      status: "Completed",
    };

    if (autoSubmitted) {
      alert(lang === "ta" ? "நேரம் முடிந்தது! உங்கள் வினாடி வினா தானாகவே சமர்ப்பிக்கப்பட்டது." : "Time's up! Your quiz has been submitted automatically.");
    }

    onSubmitQuiz(attempt);
  };

  const currentQuestion = quiz.questions[currentIdx];
  const selectedOption = answers[currentQuestion.questionId];

  const answeredCount = Object.keys(answers).length;
  const unansweredCount = quiz.totalQuestions - answeredCount;

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      {/* Top Header Bar */}
      <div className="bg-[#3B0B12] text-white p-3.5 sm:p-5 rounded-3xl border border-[#D4AF37]/30 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (answeredCount > 0) {
                if (window.confirm(lang === "ta" ? "வினாடி வினாவிலிருந்து வெளியேற விரும்புகிறீர்களா? உங்கள் தற்போதைய விடைகள் சேமிக்கப்படாது." : "Are you sure you want to leave this quiz? Your current answers will not be saved.")) {
                  onCancelQuiz();
                }
              } else {
                onCancelQuiz();
              }
            }}
            id="quiz-player-back-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-200 hover:text-white border border-white/20 text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs"
            title={lang === "ta" ? "வினாடி வினாக்களுக்குத் திரும்பு" : "Back to Quizzes"}
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>{lang === "ta" ? "திரும்பு" : "Back"}</span>
          </button>

          <div className="min-w-0">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#D4AF37] block">
              {quiz.category} • {lang === "ta" ? `வினாடி வினா ${quiz.quizId.replace("quiz_", "")}` : quiz.quizId.replace("quiz_", "Quiz ")}
            </span>
            <h2 className="font-serif text-base sm:text-lg md:text-xl font-bold text-amber-50 line-clamp-1">
              {quiz.title}
            </h2>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className={`flex items-center justify-center gap-2 px-4 py-2 rounded-2xl border self-end sm:self-auto shrink-0 ${
          timeLeft <= 120 ? "bg-red-950/80 border-red-500 text-red-200 animate-pulse" : "bg-[#5C121E] border-[#D4AF37]/40 text-amber-300"
        }`}>
          <Clock className="w-4 h-4 shrink-0" />
          <span className="font-mono text-xs text-stone-300 mr-1 block uppercase font-bold whitespace-nowrap">
            {lang === "ta" ? "மீதமுள்ள நேரம்:" : "Time Left:"}
          </span>
          <span className="font-mono text-sm sm:text-base font-extrabold tracking-wider">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Progress & Navigator Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2DDD5] shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-stone-600">
          <span>
            {lang === "ta" ? `கேள்வி ${currentIdx + 1} / ${quiz.totalQuestions}` : `Question ${currentIdx + 1} of ${quiz.totalQuestions}`}
          </span>
          <span>
            {Math.round(((currentIdx + 1) / quiz.totalQuestions) * 100)}
            {lang === "ta" ? "% முடிந்தது" : "% Completed"}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden border border-stone-200">
          <div
            className="bg-gradient-to-r from-[#5C121E] to-[#D4AF37] h-full transition-all duration-300 rounded-full"
            style={{ width: `${((currentIdx + 1) / quiz.totalQuestions) * 100}%` }}
          />
        </div>

        {/* Question Numbers Navigator */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto pt-2 custom-scrollbar">
          {quiz.questions.map((q, idx) => {
            const isAnswered = !!answers[q.questionId];
            const isCurrent = idx === currentIdx;

            return (
              <button
                key={q.questionId}
                onClick={() => setCurrentIdx(idx)}
                className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                  isCurrent
                    ? "bg-[#5C121E] text-white ring-2 ring-[#D4AF37] shadow-sm"
                    : isAnswered
                    ? "bg-emerald-100 border border-emerald-300 text-emerald-800"
                    : "bg-stone-100 border border-stone-200 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {idx + 1}
                {isAnswered && !isCurrent && <span className="ml-0.5 text-[8px]">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl border border-[#E2DDD5] p-6 sm:p-8 shadow-md space-y-6">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-100">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
              {lang === "ta" ? `கேள்வி ${currentIdx + 1}` : `Question ${currentIdx + 1}`}
            </span>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#3B0B12] pt-1 leading-snug">
              {currentQuestion.question}
            </h3>
          </div>
          <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full shrink-0 border border-stone-200">
            {lang === "ta" ? "10 மதிப்பெண்கள்" : "10 Marks"}
          </span>
        </div>

        {/* Options List */}
        <div className="space-y-3">
          {(["A", "B", "C", "D"] as const).map((key) => {
            const optionText = currentQuestion.options[key];
            const isSelected = selectedOption === key;

            return (
              <button
                key={key}
                onClick={() => handleSelectAnswer(key)}
                className={`w-full p-4 rounded-2xl border text-left flex items-center gap-4 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#5C121E]/5 border-[#5C121E] text-[#3B0B12] shadow-xs ring-2 ring-[#5C121E]/20"
                    : "bg-stone-50/60 border-stone-200 hover:border-stone-300 text-stone-800 hover:bg-stone-100/80"
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 ${
                    isSelected
                      ? "bg-[#5C121E] text-white"
                      : "bg-stone-200 text-stone-700"
                  }`}
                >
                  {key}
                </span>
                <span className="text-xs sm:text-sm font-medium flex-1 leading-relaxed">
                  {optionText}
                </span>
              </button>
            );
          })}
        </div>

        {/* Navigation Actions */}
        <div className="pt-6 flex items-center justify-between border-t border-stone-100 gap-3">
          <button
            onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
            disabled={currentIdx === 0}
            className="px-4 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === "ta" ? "முந்தையது" : "Previous"}</span>
          </button>

          {currentIdx === quiz.totalQuestions - 1 ? (
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{lang === "ta" ? "சமர்ப்பிக்கவும்" : "Submit Quiz"}</span>
            </button>
          ) : (
            <button
              onClick={() => setCurrentIdx(Math.min(quiz.totalQuestions - 1, currentIdx + 1))}
              className="px-6 py-2.5 rounded-xl bg-[#5C121E] hover:bg-[#3B0B12] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <span>{lang === "ta" ? "அடுத்து" : "Next"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-[#E2DDD5] animate-in fade-in zoom-in-95">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#3B0B12]">
                {lang === "ta" ? "வினாடி வினா சமர்ப்பிப்பு" : "Submit Quiz Confirmation"}
              </h3>
              <p className="text-xs text-stone-600">
                {lang === "ta" ? "உங்கள் பதில்களை இறுதி செய்து சமர்ப்பிக்க விரும்புகிறீர்களா?" : "Are you sure you want to finalize and submit your answers?"}
              </p>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 grid grid-cols-2 gap-4 text-center">
              <div>
                <span className="block text-stone-500 text-[10px] font-bold uppercase">
                  {lang === "ta" ? "பதிலளித்தவை" : "Answered"}
                </span>
                <span className="text-lg font-bold text-emerald-600">{answeredCount} / {quiz.totalQuestions}</span>
              </div>
              <div className="border-l border-stone-200">
                <span className="block text-stone-500 text-[10px] font-bold uppercase">
                  {lang === "ta" ? "பதிலளிக்காதவை" : "Unanswered"}
                </span>
                <span className="text-lg font-bold text-amber-600">{unansweredCount}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold transition-all cursor-pointer"
              >
                {lang === "ta" ? "வினாடி வினாவைத் தொடர்" : "Continue Quiz"}
              </button>
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  handleFinalSubmission(false);
                }}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                {lang === "ta" ? "உறுதிசெய்து சமர்ப்பி" : "Confirm & Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

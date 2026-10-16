import React from "react";
import { Brain, Clock, Award, CheckCircle2, ArrowLeft, Play, ShieldAlert, Sparkles } from "lucide-react";
import { Quiz } from "../types";
import { Language } from "../utils/i18n";

interface QuizDetailsViewProps {
  quiz: Quiz;
  currentUser?: any;
  onStartQuiz: () => void;
  onBack: () => void;
  lang?: Language;
}

export default function QuizDetailsView({
  quiz,
  currentUser,
  onStartQuiz,
  onBack,
  lang = "en"
}: QuizDetailsViewProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-6 font-sans">
      
      {/* Top Back Navigation */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-[#3B0B12] transition-colors"
      >
        <ArrowLeft className="w-4 h-4 text-[#D4AF37]" />
        <span>Back to Quiz Center</span>
      </button>

      {/* Main Details Card */}
      <div className="bg-white rounded-3xl border border-[#E2DDD5] p-6 sm:p-8 shadow-xl space-y-6">
        
        {/* Quiz Title & Header */}
        <div className="space-y-3 pb-6 border-b border-stone-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#3B0B12]/10 text-[#3B0B12] text-xs font-bold uppercase tracking-wider">
              {quiz.category}
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
              Difficulty: {quiz.difficulty}
            </span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#3B0B12]">
            {quiz.title}
          </h1>

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            {quiz.description}
          </p>
        </div>

        {/* Quiz Key Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#E2DDD5] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3B0B12] flex items-center justify-center flex-shrink-0">
              <Brain className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <p className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">Total Questions</p>
              <p className="text-base font-extrabold text-stone-900">{quiz.totalQuestions} Questions</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#E2DDD5] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3B0B12] flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <p className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">Total Marks</p>
              <p className="text-base font-extrabold text-stone-900">{quiz.totalMarks} Marks</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#E2DDD5] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3B0B12] flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <p className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">Time Limit</p>
              <p className="text-base font-extrabold text-stone-900">{quiz.timeLimitMinutes} Minutes</p>
            </div>
          </div>
        </div>

        {/* Rules & Guidelines Section */}
        <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
          <h3 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            Quiz Rules & Instructions
          </h3>
          <ul className="text-xs text-stone-700 space-y-2 leading-relaxed">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>Each question carries <strong>10 marks</strong> with no negative marking for wrong answers.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>Single-choice multiple options (A, B, C, D) per question.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>A live <strong>15:00 countdown timer</strong> will run continuously during the test.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>The quiz will automatically submit when the countdown timer reaches zero.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>Refreshing or navigating during the quiz retains your active timer and chosen answers.</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={onStartQuiz}
            className="flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-[#3B0B12] to-[#5C121E] text-white font-bold text-sm shadow-md hover:brightness-110 flex items-center justify-center gap-2 transition-all"
          >
            <Play className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
            <span>Start Quiz Now</span>
          </button>
          <button
            onClick={onBack}
            className="py-3 px-6 rounded-2xl bg-stone-100 text-stone-700 font-semibold text-sm hover:bg-stone-200 transition-colors"
          >
            Back to Quizzes
          </button>
        </div>

      </div>

    </div>
  );
}

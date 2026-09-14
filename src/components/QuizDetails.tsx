import React from "react";
import { ArrowLeft, Clock, Award, HelpCircle, CheckCircle, ShieldAlert, Play, Sparkles, Lock } from "lucide-react";
import { QuizSet, QuizAttempt, User } from "../types";
import { Language } from "../utils/i18n";

interface QuizDetailsProps {
  quiz: QuizSet;
  userAttempts: QuizAttempt[];
  currentUser?: User | null;
  onBack: () => void;
  onStartQuiz: (quizId: string) => void;
  lang: Language;
}

export default function QuizDetails({
  quiz,
  userAttempts,
  currentUser,
  onBack,
  onStartQuiz,
  lang,
}: QuizDetailsProps) {
  // Find previous attempts for this quiz
  const quizAttempts = userAttempts.filter((att) => att.quizId === quiz.quizId);
  const bestAttempt = quizAttempts.reduce<QuizAttempt | null>((best, curr) => {
    if (!best || curr.score > best.score) return curr;
    return best;
  }, null);

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-[#5C121E] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{lang === "ta" ? "வினாடி வினா மையத்திற்கு திரும்பு" : "Back to Quiz Center"}</span>
      </button>

      {/* Main Details Card */}
      <div className="bg-white rounded-3xl border border-[#E2DDD5] p-6 sm:p-10 shadow-lg space-y-8">
        {/* Title Header */}
        <div className="space-y-4 pb-6 border-b border-stone-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
              {lang === "ta" ? `வினாடி வினா ${quiz.quizId.replace("quiz_", "")}` : quiz.quizId.replace("quiz_", "Quiz ")}
            </span>
            <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
              {quiz.category}
            </span>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${
                quiz.difficulty === "Easy"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : quiz.difficulty === "Medium"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}
            >
              {lang === "ta"
                ? quiz.difficulty === "Easy"
                  ? "எளிது"
                  : quiz.difficulty === "Medium"
                  ? "நடுத்தரம்"
                  : "கடினம்"
                : quiz.difficulty}
            </span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#3B0B12]">
            {quiz.title}
          </h1>
          <p className="text-sm text-stone-600 leading-relaxed">
            {quiz.description}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-[#E2DDD5] text-center space-y-1">
            <HelpCircle className="w-5 h-5 text-amber-700 mx-auto" />
            <span className="block text-xs font-bold text-stone-500 uppercase">
              {lang === "ta" ? "கேள்விகள்" : "Questions"}
            </span>
            <span className="text-lg font-serif font-bold text-[#3B0B12]">{quiz.totalQuestions}</span>
          </div>

          <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-[#E2DDD5] text-center space-y-1">
            <Award className="w-5 h-5 text-amber-700 mx-auto" />
            <span className="block text-xs font-bold text-stone-500 uppercase">
              {lang === "ta" ? "மொத்த மதிப்பெண்கள்" : "Total Marks"}
            </span>
            <span className="text-lg font-serif font-bold text-[#3B0B12]">{quiz.totalMarks}</span>
          </div>

          <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-[#E2DDD5] text-center space-y-1">
            <Clock className="w-5 h-5 text-amber-700 mx-auto" />
            <span className="block text-xs font-bold text-stone-500 uppercase">
              {lang === "ta" ? "நேர வரம்பு" : "Time Limit"}
            </span>
            <span className="text-lg font-serif font-bold text-[#3B0B12]">
              {Math.floor(quiz.timeLimit / 60)} {lang === "ta" ? "நிமிடங்கள்" : "Mins"}
            </span>
          </div>

          <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-[#E2DDD5] text-center space-y-1">
            <CheckCircle className="w-5 h-5 text-amber-700 mx-auto" />
            <span className="block text-xs font-bold text-stone-500 uppercase">
              {lang === "ta" ? "சிறந்த மதிப்பெண்" : "Best Score"}
            </span>
            <span className="text-lg font-serif font-bold text-[#3B0B12]">
              {bestAttempt ? `${bestAttempt.score}/${quiz.totalMarks}` : lang === "ta" ? "இல்லை" : "N/A"}
            </span>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-amber-50/60 rounded-2xl p-5 border border-amber-200 space-y-3">
          <h3 className="font-serif text-sm font-bold text-amber-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-700" />
            <span>
              {lang === "ta" ? "விதிகள் மற்றும் அறிவுறுத்தல்கள்" : "Quiz Rules & Instructions"}
            </span>
          </h3>
          <ul className="text-xs text-amber-950 space-y-2 list-disc list-inside leading-relaxed">
            {lang === "ta" ? (
              <>
                <li>ஒவ்வொரு கேள்விக்கும் சரியாக <strong>{quiz.marksPerQuestion} மதிப்பெண்கள்</strong> வழங்கப்படும்.</li>
                <li>ஒவ்வொரு கேள்விக்கும் சரியாக <strong>ஒரு விருப்பத்தை</strong> (A, B, C, அல்லது D) தேர்ந்தெடுக்கவும்.</li>
                <li>வினாடி வினாவைச் சமர்ப்பிக்கும் முன் எப்போது வேண்டுமானாலும் உங்கள் பதிலை மாற்றிக் கொள்ளலாம்.</li>
                <li><strong>{Math.floor(quiz.timeLimit / 60)}-நிமிட கால வரம்பு</strong> முடிவதற்குள் வினாடி வினாவைச் சமர்ப்பிக்கவும்.</li>
                <li>நேரம் 00:00 ஐ அடைந்தால், உங்கள் வினாடி வினா தானாகவே சமர்ப்பிக்கப்படும்.</li>
                <li>சமர்ப்பித்த உடனேயே உங்கள் இறுதி மதிப்பெண், சதவீதம் மற்றும் விரிவான விளக்கங்கள் உங்களுக்குக் கிடைக்கும்.</li>
              </>
            ) : (
              <>
                <li>Each question carries exactly <strong>{quiz.marksPerQuestion} marks</strong>.</li>
                <li>Select exactly <strong>one option</strong> (A, B, C, or D) per question.</li>
                <li>You can change your selected answer anytime before submitting the quiz.</li>
                <li>Submit the quiz before the <strong>{Math.floor(quiz.timeLimit / 60)}-minute timer</strong> expires.</li>
                <li>If the timer reaches 00:00, your quiz will be submitted automatically.</li>
                <li>Your final score, percentage, and detailed explanations will be available immediately upon submission.</li>
              </>
            )}
          </ul>
        </div>

        {/* Action Button */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stone-100">
          <div className="text-xs text-stone-500">
            {(!currentUser || currentUser.id === "guest-user-session") ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>{lang === "ta" ? "வினாடி வினாவைத் தொடங்க உள்நுழையவும்" : "Login required to start quiz"}</span>
              </span>
            ) : quizAttempts.length > 0 ? (
              lang === "ta"
                ? `நீங்கள் இந்த வினாடி வினாவை ${quizAttempts.length} முறை முயற்சித்துள்ளீர்கள்.`
                : `You have attempted this quiz ${quizAttempts.length} time(s).`
            ) : lang === "ta" ? (
              "உங்கள் இலக்கிய அறிவை சோதிக்க நீங்கள் தயாரா?"
            ) : (
              "Ready to test your knowledge?"
            )}
          </div>

          <button
            onClick={() => onStartQuiz(quiz.quizId)}
            id="start-quiz-btn"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#5C121E] hover:bg-[#3B0B12] text-white font-serif font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all transform hover:scale-105 cursor-pointer"
          >
            {(!currentUser || currentUser.id === "guest-user-session") ? (
              <>
                <Lock className="w-4 h-4 text-amber-300" />
                <span>{lang === "ta" ? "உள்நுழைந்து எழுதவும்" : "Login to Start Quiz"}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current text-amber-300" />
                <span>
                  {bestAttempt
                    ? lang === "ta"
                      ? "மீண்டும் முயற்சி செய்"
                      : "Retake Quiz"
                    : lang === "ta"
                    ? "தொடங்கவும்"
                    : "Start Quiz Now"}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

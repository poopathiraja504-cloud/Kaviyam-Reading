import React from "react";
import { Lock, X, LogIn, UserPlus, ArrowRight } from "lucide-react";
import { Language } from "../utils/i18n";

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  onRegister: () => void;
  onGoogleLogin?: () => void;
  type?: "quiz" | "word-finder" | "quiz-history" | "quiz-stats" | "general";
  title?: string;
  message?: string;
  lang?: Language;
}

export default function LoginRequiredModal({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  onGoogleLogin,
  type = "quiz",
  title,
  message,
  lang = "ta",
}: LoginRequiredModalProps) {
  if (!isOpen) return null;

  // Default localized titles
  const modalTitle = title || (lang === "ta" ? "உள்நுழைவு தேவை" : "Login Required");

  // Default localized messages based on trigger type
  const getMessage = () => {
    if (message) return message;
    if (type === "quiz") {
      return lang === "ta"
        ? "அனைத்து வினாடி வினாக்களையும் அணுகவும் எழுதவும் Google உள்நுழைவு அவசியம்."
        : "Google sign-in is required to access and attend all quizzes.";
    }
    if (type === "word-finder") {
      return lang === "ta"
        ? "இந்த விளையாட்டை விளையாட முதலில் உள்நுழைய வேண்டும்."
        : "Please log in to your account first to play this game.";
    }
    if (type === "quiz-history") {
      return lang === "ta"
        ? "உங்கள் Quiz வரலாற்றைப் பார்க்க உள்நுழைய வேண்டும்."
        : "Please log in to your account to view your quiz history.";
    }
    if (type === "quiz-stats") {
      return lang === "ta"
        ? "உங்கள் வினாடி வினா புள்ளிவிவரங்களைப் பார்க்க உள்நுழைய வேண்டும்."
        : "Please log in to your account to view your quiz statistics.";
    }
    // Default: Quiz
    return lang === "ta"
      ? "அனைத்து வினாடி வினாக்களையும் அணுகவும் எழுதவும் Google உள்நுழைவு அவசியம்."
      : "Google sign-in is required to access and attend all quizzes.";
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        id="login-required-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white rounded-3xl border border-[#D4AF37]/40 shadow-2xl p-6 sm:p-8 text-center space-y-6 transform transition-all animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Close Icon in top right */}
        <button
          onClick={onClose}
          id="login-required-close-btn"
          aria-label="Close modal"
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Lock Icon Emblem */}
        <div className="mx-auto w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-100 to-amber-200/60 border border-amber-300/80 flex items-center justify-center shadow-inner text-[#3B0B12]">
          <span className="text-3xl select-none" role="img" aria-label="Lock">🔐</span>
        </div>

        {/* Headings */}
        <div className="space-y-2">
          <h3 
            id="auth-modal-title"
            className="font-serif font-black text-2xl text-[#3B0B12] tracking-tight"
          >
            {modalTitle}
          </h3>
          <p className="text-sm font-medium text-stone-600 max-w-xs mx-auto leading-relaxed">
            {getMessage()}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          {/* Featured: Google Sign-in button */}
          {onGoogleLogin && (
            <button
              onClick={() => {
                onGoogleLogin();
                onClose();
              }}
              id="login-required-google-btn"
              className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-stone-50 text-stone-800 border-2 border-stone-200 hover:border-stone-300 font-sans font-bold text-sm tracking-wide shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{lang === "ta" ? "Google மூலம் உள்நுழைக" : "Sign in with Google"}</span>
            </button>
          )}

          {/* Regular Login Button (உள்நுழைக) */}
          <button
            onClick={onLogin}
            id="login-required-login-btn"
            className="w-full py-3 px-4 rounded-2xl bg-[#5C121E] hover:bg-[#3B0B12] text-white font-serif font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <LogIn className="w-4 h-4 text-amber-300" />
            <span>{lang === "ta" ? "மின்னஞ்சல் மூலம் உள்நுழைக" : "Sign in with Email"}</span>
          </button>

          {/* 3. Cancel Button (ரத்து செய்) */}
          <button
            onClick={onClose}
            id="login-required-cancel-btn"
            className="w-full py-2.5 px-4 text-xs font-bold text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
          >
            {lang === "ta" ? "ரத்து செய்" : "Cancel"}
          </button>
        </div>

        {/* Subtle Brand Tag */}
        <div className="pt-1 border-t border-stone-100 text-[10px] text-stone-400 font-sans">
          Kaviyam Reading • {lang === "ta" ? "பாதுகாப்பான வாசகர் கணக்கு" : "Secure Reader Portal"}
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { Lock, X, LogIn, UserPlus, ArrowRight } from "lucide-react";
import { Language } from "../utils/i18n";

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  onRegister: () => void;
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
      ? "Quiz-ஐ எழுதுவதற்கு முதலில் உங்கள் கணக்கில் உள்நுழைய வேண்டும்."
      : "Please log in to your account first to take this quiz.";
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
          {/* 1. Login Button (உள்நுழைக) */}
          <button
            onClick={onLogin}
            id="login-required-login-btn"
            className="w-full py-3 px-4 rounded-2xl bg-[#5C121E] hover:bg-[#3B0B12] text-white font-serif font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <LogIn className="w-4 h-4 text-amber-300" />
            <span>{lang === "ta" ? "உள்நுழைக" : "Login"}</span>
          </button>

          {/* 2. Create Account Button (கணக்கு உருவாக்கவும்) */}
          <button
            onClick={onRegister}
            id="login-required-register-btn"
            className="w-full py-3 px-4 rounded-2xl bg-amber-50 hover:bg-amber-100 text-[#3B0B12] border border-amber-300 font-serif font-bold text-sm tracking-wide shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <UserPlus className="w-4 h-4 text-[#8C6D3D]" />
            <span>{lang === "ta" ? "கணக்கு உருவாக்கவும்" : "Create Account"}</span>
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

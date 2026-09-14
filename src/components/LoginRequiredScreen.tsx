import React from "react";
import { Lock, LogIn, UserPlus, ArrowLeft } from "lucide-react";
import { Language } from "../utils/i18n";

interface LoginRequiredScreenProps {
  onLogin: () => void;
  onRegister?: () => void;
  onBack?: () => void;
  title?: string;
  message?: string;
  lang?: Language;
}

export default function LoginRequiredScreen({
  onLogin,
  onRegister,
  onBack,
  title,
  message,
  lang = "ta",
}: LoginRequiredScreenProps) {
  return (
    <div className="max-w-xl mx-auto my-12 p-8 sm:p-12 bg-white rounded-3xl border border-[#D4AF37]/30 shadow-xl text-center space-y-6 font-sans">
      {onBack && (
        <div className="flex justify-start">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-[#5C121E] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === "ta" ? "← பின்செல்லவும்" : "← Go Back"}</span>
          </button>
        </div>
      )}

      {/* Lock Symbol */}
      <div className="mx-auto w-20 h-20 rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center shadow-inner">
        <span className="text-4xl" role="img" aria-label="Lock">🔐</span>
      </div>

      <div className="space-y-2">
        <h2 className="font-serif font-black text-2xl text-[#3B0B12]">
          {title || (lang === "ta" ? "உள்நுழைவு தேவை" : "Login Required")}
        </h2>
        <p className="text-sm font-medium text-stone-600 max-w-md mx-auto leading-relaxed">
          {message || (lang === "ta"
            ? "உங்கள் Quiz வரலாற்றைப் பார்க்க உள்நுழைய வேண்டும்."
            : "Please sign in to your account to view this content.")}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
        <button
          onClick={onLogin}
          id="screen-login-btn"
          className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-[#5C121E] hover:bg-[#3B0B12] text-white font-serif font-bold text-xs tracking-wider uppercase shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogIn className="w-4 h-4 text-amber-300" />
          <span>{lang === "ta" ? "உள்நுழைக" : "Sign In"}</span>
        </button>

        {onRegister && (
          <button
            onClick={onRegister}
            id="screen-register-btn"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-[#3B0B12] border border-amber-300 font-serif font-bold text-xs tracking-wider uppercase shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-[#8C6D3D]" />
            <span>{lang === "ta" ? "கணக்கு உருவாக்கவும்" : "Create Account"}</span>
          </button>
        )}
      </div>

      <p className="text-[11px] text-stone-400 pt-2">
        {lang === "ta"
          ? "கணக்கு வைத்திருந்தால் உங்கள் சாதனைகள், மதிப்பெண்கள் மற்றும் XP பாதுகாப்பாக சேமிக்கப்படும்."
          : "An authenticated account ensures your achievements, scores, and XP are saved permanently."}
      </p>
    </div>
  );
}

import React from "react";
import { Lock, LogIn, UserPlus, ArrowLeft } from "lucide-react";
import { Language } from "../utils/i18n";

interface LoginRequiredScreenProps {
  onLogin: () => void;
  onRegister?: () => void;
  onGoogleLogin?: () => void;
  onBack?: () => void;
  title?: string;
  message?: string;
  lang?: Language;
}

export default function LoginRequiredScreen({
  onLogin,
  onRegister,
  onGoogleLogin,
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
            ? "அனைத்து வினாடி வினாக்களையும் அணுகவும் எழுதவும் Google உள்நுழைவு அவசியம்."
            : "Google sign-in is required to access and attend all quizzes.")}
        </p>
      </div>

      <div className="flex flex-col items-center justify-center gap-3 pt-4 max-w-sm mx-auto">
        {onGoogleLogin && (
          <button
            onClick={onGoogleLogin}
            id="screen-google-login-btn"
            className="w-full px-6 py-3.5 rounded-2xl bg-white hover:bg-stone-50 text-stone-800 border-2 border-stone-200 hover:border-stone-300 font-sans font-bold text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
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

        <button
          onClick={onLogin}
          id="screen-login-btn"
          className="w-full px-6 py-3 rounded-2xl bg-[#5C121E] hover:bg-[#3B0B12] text-white font-serif font-bold text-xs tracking-wider uppercase shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogIn className="w-4 h-4 text-amber-300" />
          <span>{lang === "ta" ? "மின்னஞ்சல் மூலம் உள்நுழைக" : "Sign in with Email"}</span>
        </button>

        {onRegister && (
          <button
            onClick={onRegister}
            id="screen-register-btn"
            className="w-full px-6 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-[#3B0B12] border border-amber-300 font-serif font-bold text-xs tracking-wider uppercase shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-[#8C6D3D]" />
            <span>{lang === "ta" ? "கணக்கு உருவாக்கவும்" : "Create Account"}</span>
          </button>
        )}
      </div>

      <p className="text-[11px] text-stone-400 pt-2">
        {lang === "ta"
          ? "Google கணக்கு மூலம் உள்நுழைந்து உங்கள் வினாடி வினா முன்னேற்றம் மற்றும் புள்ளிகளை உடனுக்குடன் பதிவு செய்யுங்கள்."
          : "Sign in with Google to record your quiz progress and XP instantly."}
      </p>
    </div>
  );
}

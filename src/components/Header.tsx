import React from "react";
import { Search, Globe, LogOut, User as UserIcon, BookOpen, Mail, Shield, Sparkles } from "lucide-react";
import { User } from "../types";
import { Language } from "../utils/i18n";
import KaviyamBrandLogo from "./KaviyamBrandLogo";

interface HeaderProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  currentUser: User | null;
  onSignInClick: () => void;
  onSignOutClick: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  unreadEmailCount?: number;
}

export default function Header({
  activeTab,
  onSelectTab,
  lang,
  onLanguageChange,
  currentUser,
  onSignInClick,
  onSignOutClick,
  searchQuery,
  onSearchChange,
  unreadEmailCount = 0,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#E2DDD5] px-4 sm:px-6 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo */}
        <div
          onClick={() => onSelectTab("home")}
          className="cursor-pointer flex items-center gap-3 group"
        >
          <KaviyamBrandLogo size="md" />
          <div className="hidden sm:block">
            <h1 className="font-serif font-bold text-lg text-[#3B0B12] leading-none tracking-tight group-hover:text-[#5C121E] transition-colors">
              {lang === "ta" ? "காவியம் வாசிப்பு" : "KAVIYAM READING"}
            </h1>
            <p className="text-[10px] text-stone-500 font-sans tracking-wider uppercase mt-0.5">
              {lang === "ta" ? "தமிழ் இலக்கிய நாவல்கள்" : "Tamil Classical Literature"}
            </p>
          </div>
        </div>

        {/* Center: Search Input */}
        <div className="flex-1 max-w-md mx-2">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={
                lang === "ta"
                  ? "நாவல், ஆசிரியர் அல்லது திருக்குறள் தேடுக..."
                  : "Search novels, authors, or couplets..."
              }
              className="w-full pl-10 pr-4 py-2 bg-stone-100/80 border border-stone-200 focus:border-[#5C121E] focus:bg-white rounded-full text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Language Switcher */}
          <button
            onClick={() => onLanguageChange(lang === "ta" ? "en" : "ta")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium border border-stone-200 transition-colors"
            title="Toggle Language / மொழி மாற்றுக"
          >
            <Globe className="w-3.5 h-3.5 text-[#5C121E]" />
            <span className="font-semibold">{lang === "ta" ? "தமிழ்" : "English"}</span>
          </button>

          {/* Mailbox / Inbox Quick Button */}
          {currentUser && (
            <button
              onClick={() => onSelectTab("mailbox")}
              className="relative p-2 rounded-full hover:bg-stone-100 text-stone-600 hover:text-stone-900 transition-colors"
              title="Mailbox"
            >
              <Mail className="w-5 h-5" />
              {unreadEmailCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-[#5C121E] text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                  {unreadEmailCount}
                </span>
              )}
            </button>
          )}

          {/* User Profile / Auth State */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectTab("profile")}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-full hover:bg-stone-100 border border-stone-200 transition-colors"
              >
                <img
                  src={
                    currentUser.profile?.profilePhoto ||
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"
                  }
                  alt={currentUser.username}
                  className="w-7 h-7 rounded-full object-cover border border-amber-300"
                />
                <span className="hidden md:inline font-sans text-xs font-semibold text-stone-800 truncate max-w-[100px]">
                  {currentUser.username}
                </span>
              </button>

              <button
                onClick={onSignOutClick}
                className="p-2 rounded-full hover:bg-red-50 text-stone-500 hover:text-red-700 transition-colors"
                title={lang === "ta" ? "வெளியேறு" : "Sign Out"}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onSignInClick}
              className="px-4 py-2 rounded-full bg-[#5C121E] hover:bg-[#3B0B12] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>{lang === "ta" ? "உள்நுழைக" : "Sign In"}</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}

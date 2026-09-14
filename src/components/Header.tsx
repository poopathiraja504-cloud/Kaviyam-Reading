import React from "react";
import { Search, Globe, LogOut, User as UserIcon, Mail, Menu, X, Sparkles } from "lucide-react";
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
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
  onPlayIntro?: () => void;
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
  onToggleMobileMenu,
  isMobileMenuOpen = false,
  onPlayIntro,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#E2DDD5] px-2 sm:px-6 py-2 transition-colors w-full">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-1 sm:gap-4 min-w-0">
        
        {/* Left: Mobile Menu Trigger + Brand Logo */}
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          {/* Mobile Hamburger Button */}
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
            title="Toggle Menu"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-[#5C121E]" /> : <Menu className="w-5 h-5 text-[#5C121E]" />}
          </button>

          <div
            onClick={() => onSelectTab("home")}
            className="cursor-pointer flex items-center gap-1.5 group"
          >
            <KaviyamBrandLogo size="md" showWordmark={false} />
            <div className="block">
              <h1 className="font-serif font-bold text-xs sm:text-base md:text-lg text-[#3B0B12] leading-none tracking-tight group-hover:text-[#5C121E] transition-colors">
                {lang === "ta" ? "காவியம் வாசிப்பு" : "KAVIYAM READING"}
              </h1>
              <p className="text-[8px] sm:text-[10px] text-stone-500 font-sans tracking-wider uppercase mt-0.5 hidden xs:block">
                {lang === "ta" ? "தமிழ் இலக்கிய நாவல்கள்" : "Tamil Classical Literature"}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Search Input (Responsive & Flexible) */}
        <div className="flex-1 min-w-[80px] max-w-[140px] xs:max-w-[180px] sm:max-w-md mx-1 sm:mx-2">
          <div className="relative w-full">
            <Search className="absolute left-2.5 sm:left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={
                lang === "ta"
                  ? "தேடுக..."
                  : "Search..."
              }
              className="w-full pl-7 sm:pl-10 pr-2 sm:pr-4 py-1.5 sm:py-2 bg-stone-100/90 border border-stone-200 focus:border-[#5C121E] focus:bg-white rounded-full text-xs text-stone-800 placeholder-stone-400 focus:outline-none transition-all shadow-inner truncate"
            />
          </div>
        </div>

        {/* Right Actions - Guaranteed Visibility for Language, Intro, Mailbox, Logout */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          
          {/* Language Switcher */}
          <button
            onClick={() => onLanguageChange(lang === "ta" ? "en" : "ta")}
            className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold border border-stone-200 transition-colors cursor-pointer shrink-0"
            title="Toggle Language / மொழி மாற்றுக"
          >
            <Globe className="w-3.5 h-3.5 text-[#5C121E] shrink-0" />
            <span className="text-[11px] sm:text-xs font-bold">{lang === "ta" ? "தமிழ்" : "EN"}</span>
          </button>

          {/* Mailbox / Inbox Quick Button */}
          {currentUser && (
            <button
              onClick={() => onSelectTab("mailbox")}
              className="relative p-1.5 sm:p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 transition-colors cursor-pointer shrink-0"
              title="Mailbox / அஞ்சல் பெட்டி"
            >
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-stone-700" />
              {unreadEmailCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#5C121E] text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                  {unreadEmailCount}
                </span>
              )}
            </button>
          )}

          {/* User Profile / Logout State */}
          {currentUser && currentUser.id !== "guest-user-session" ? (
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              <button
                onClick={() => onSelectTab("profile")}
                className="flex items-center gap-1 p-1 rounded-full hover:bg-stone-100 border border-stone-200 transition-colors cursor-pointer"
                title={currentUser.username}
              >
                <img
                  src={
                    currentUser.profile?.profilePhoto ||
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"
                  }
                  alt={currentUser.username}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-amber-400 shrink-0"
                />
                <span className="hidden md:inline font-sans text-xs font-semibold text-stone-800 truncate max-w-[80px]">
                  {currentUser.username}
                </span>
              </button>
              <button
                onClick={onSignOutClick}
                className="p-1.5 sm:p-2 rounded-full bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-700 transition-colors cursor-pointer shrink-0 border border-stone-200/60"
                title={lang === "ta" ? "வெளியேறு (Logout)" : "Sign Out"}
                aria-label="Logout"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-600 hover:text-red-600" />
              </button>
            </div>
          ) : (
            <button
              onClick={onSignInClick}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#5C121E] hover:bg-[#3B0B12] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span className="text-[11px] sm:text-xs">{lang === "ta" ? "உள்நுழைக" : "Sign In"}</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}

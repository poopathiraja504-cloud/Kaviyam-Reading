import React, { useState } from "react";
import { 
  BookOpen, 
  Search, 
  Bell, 
  User as UserIcon, 
  LogIn, 
  LogOut, 
  Menu, 
  X, 
  Database, 
  HelpCircle, 
  Mail, 
  Shield,
  BookMarked,
  TrendingUp,
  Sparkles,
  Library as LibraryIcon
} from "lucide-react";
import { Language, translations } from "../utils/i18n";
import { User } from "../types";

interface HeaderProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  currentUser: User | null;
  onSignInClick: () => void;
  onSignOutClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  unreadEmailCount?: number;
  onToggleMobileSidebar?: () => void;
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
  onToggleMobileSidebar,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const t = (key: keyof typeof translations["ta"]) => translations[lang][key] || key;

  // Section 18: Simplified top navbar
  const mainNavItems = [
    { id: "home", label: t("navHome") },
    { id: "explore", label: "Explore" },
    { id: "catalog", label: t("navCatalogLibrary") },
    { id: "quizzes", label: "Quizzes" },
    { id: "aifeatures", label: "Kaviyam AI" },
    { id: "notifications", label: "Notifications" },
    { id: "profile", label: t("navProfileSettings") },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#3B0B12] text-white border-b border-[#5C121E] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Brand Logo */}
        <div 
          className="flex items-center gap-2.5 cursor-pointer select-none flex-shrink-0"
          onClick={() => onSelectTab("home")}
          id="header-logo"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#9A7B24] p-0.5 shadow-md">
            <div className="w-full h-full bg-[#3B0B12] rounded-[10px] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#D4AF37]" />
            </div>
          </div>
          <div>
            <h1 className="font-serif font-bold text-base sm:text-lg tracking-wide text-white leading-none">
              Kaviyam<span className="text-[#D4AF37] font-normal">-Reading</span>
            </h1>
            <p className="text-[9px] text-amber-200/70 font-sans tracking-wider hidden sm:block">
              {lang === "ta" ? "தமிழ் டிஜிட்டல் நூலகம்" : "Tamil Digital Platform"}
            </p>
          </div>
        </div>

        {/* Desktop Main Navigation Links (Item #1) */}
        <nav className="hidden lg:flex items-center space-x-1">
          {mainNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                id={`header-nav-${item.id}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 relative ${
                  isActive
                    ? "bg-[#5C121E] text-[#D4AF37] border border-[#D4AF37]/40 shadow-inner"
                    : "text-amber-100/80 hover:text-white hover:bg-white/10"
                }`}
              >
                {item.label}
                {item.id === "mailbox" && unreadEmailCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Section: Search, Language Switcher, Notifications, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Search Input Bar */}
          <div className="relative hidden md:block w-40 xl:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-amber-200/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-full bg-[#25060A] text-amber-100 placeholder-amber-200/40 border border-[#5C121E] focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          {/* Language Switcher Pill (Item #12) */}
          <div className="flex items-center bg-[#25060A] p-0.5 rounded-full border border-[#5C121E]">
            <button
              onClick={() => onLanguageChange("ta")}
              id="lang-btn-ta"
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                lang === "ta"
                  ? "bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-[#25060A] shadow-xs"
                  : "text-amber-200/70 hover:text-white"
              }`}
            >
              தமிழ்
            </button>
            <button
              onClick={() => onLanguageChange("en")}
              id="lang-btn-en"
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                lang === "en"
                  ? "bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-[#25060A] shadow-xs"
                  : "text-amber-200/70 hover:text-white"
              }`}
            >
              English
            </button>
          </div>

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-full text-amber-100/80 hover:text-white hover:bg-white/10 relative"
              id="header-notif-btn"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#D4AF37] rounded-full" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-[#4A0E17] border border-[#D4AF37]/30 rounded-xl shadow-2xl z-50 p-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#5C121E]">
                  <span className="font-bold text-amber-100">{t("notifications")}</span>
                  <span className="text-[10px] text-[#D4AF37]">2 new</span>
                </div>
                <div className="py-2 space-y-1.5 text-amber-200/90 text-[11px]">
                  <p>• Ponniyin Selvan chapter 2 released</p>
                  <p>• 7-day reading streak achieved!</p>
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Sign In */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                id="header-profile-avatar"
                className="flex items-center gap-1.5 p-0.5 rounded-full border border-[#D4AF37]/40 hover:border-[#D4AF37]"
              >
                <img
                  src={currentUser.profile.profilePhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"}
                  alt={currentUser.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-[#4A0E17] border border-[#D4AF37]/30 rounded-xl shadow-2xl z-50 p-2 text-xs">
                  <div className="px-3 py-2 border-b border-[#5C121E]">
                    <p className="font-bold text-white truncate">{currentUser.username}</p>
                    <p className="text-amber-200/60 text-[10px] truncate">{currentUser.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => { onSelectTab("profile"); setProfileDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2 text-amber-100 hover:bg-[#5C121E] rounded-lg flex items-center gap-2"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
                      {t("navProfileSettings")}
                    </button>
                    <button
                      onClick={() => { onSelectTab("mailbox"); setProfileDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2 text-amber-100 hover:bg-[#5C121E] rounded-lg flex items-center gap-2"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
                      {t("navMailbox")}
                    </button>
                    <button
                      onClick={() => { onSelectTab("settings"); setProfileDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2 text-amber-100 hover:bg-[#5C121E] rounded-lg"
                    >
                      {t("navSettings")}
                    </button>
                  </div>
                  <div className="pt-1 border-t border-[#5C121E]">
                    <button
                      onClick={() => { onSignOutClick(); setProfileDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2 text-red-300 hover:bg-red-950/40 rounded-lg flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      {t("signOut")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onSignInClick}
              id="header-signin-btn"
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-[#2A080E] font-bold text-xs hover:brightness-110 shadow-md flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t("signIn")}</span>
            </button>
          )}

          {/* Mobile Sidebar Hamburger Trigger */}
          <button
            onClick={() => {
              if (onToggleMobileSidebar) {
                onToggleMobileSidebar();
              } else {
                setMobileMenuOpen(!mobileMenuOpen);
              }
            }}
            className="lg:hidden p-2 rounded-lg text-amber-100 hover:bg-white/10"
            aria-label="Open navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>

        </div>

      </div>

    </header>
  );
}

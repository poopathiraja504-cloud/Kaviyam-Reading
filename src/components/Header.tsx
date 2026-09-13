import React, { useState } from "react";
import { BookOpen, Search, Bell, User as UserIcon, LogIn, LogOut, Menu, X, Check } from "lucide-react";
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
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const t = (key: keyof typeof translations["ta"]) => translations[lang][key] || key;

  const mockNotifications = [
    { id: 1, title: lang === "ta" ? "புதிய அத்தியாயம் சேர்க்கப்பட்டது" : "New Chapter Released", desc: "Ponniyin Selvan - Chapter 3 is live now.", time: "10m ago", read: false },
    { id: 2, title: lang === "ta" ? "வாசிப்பு சாதனை!" : "Reading Achievement!", desc: "You completed 7 days reading streak.", time: "2h ago", read: true },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#3B0B12] text-white border-b border-[#5C121E] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => onSelectTab("home")}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#9A7B24] p-0.5 flex items-center justify-center shadow-md">
            <div className="w-full h-full bg-[#3B0B12] rounded-[10px] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#D4AF37]" />
            </div>
          </div>
          <div>
            <h1 className="font-serif font-bold text-lg tracking-wide text-white flex items-center gap-1.5">
              Kaviyam<span className="text-[#D4AF37] font-normal">-Reading</span>
            </h1>
            <p className="text-[10px] text-amber-200/70 font-sans tracking-wider hidden sm:block">
              {lang === "ta" ? "தமிழ் டிஜிட்டல் நூலகம்" : "Tamil Digital Platform"}
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          {[
            { id: "home", label: t("navHome") },
            { id: "library", label: t("navLibrary") },
            { id: "mybooks", label: t("navMyBooks") },
            { id: "progress", label: t("navProgress") },
            { id: "aifeatures", label: t("navAIFeatures") },
            { id: "about", label: t("navAbout") },
          ].map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[#5C121E] text-[#D4AF37] border border-[#D4AF37]/30 shadow-inner"
                    : "text-amber-100/80 hover:text-white hover:bg-white/5"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Section: Search, Language Switcher, Notifications, User */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Search Input (Desktop) */}
          <div className="relative hidden md:block w-48 xl:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-200/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-full bg-[#2A080E] text-amber-100 placeholder-amber-200/40 border border-[#5C121E] focus:outline-none focus:border-[#D4AF37] transition-all"
            />
          </div>

          {/* Language Switcher Pill */}
          <div className="flex items-center bg-[#25060A] p-0.5 rounded-full border border-[#5C121E]">
            <button
              onClick={() => onLanguageChange("ta")}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                lang === "ta"
                  ? "bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-[#25060A] shadow-sm"
                  : "text-amber-200/70 hover:text-white"
              }`}
            >
              தமிழ்
            </button>
            <button
              onClick={() => onLanguageChange("en")}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                lang === "en"
                  ? "bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-[#25060A] shadow-sm"
                  : "text-amber-200/70 hover:text-white"
              }`}
            >
              English
            </button>
          </div>

          {/* Notification Button */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-full text-amber-100/80 hover:text-white hover:bg-white/10 relative transition-colors"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#D4AF37] rounded-full animate-ping" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#D4AF37] rounded-full" />
            </button>

            {/* Notification Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-[#4A0E17] border border-[#D4AF37]/30 rounded-xl shadow-2xl z-50 p-3 text-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#5C121E]">
                  <span className="font-semibold text-amber-100">{t("notifications")}</span>
                  <span className="text-[10px] text-[#D4AF37]">2 {lang === "ta" ? "புதியது" : "new"}</span>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {mockNotifications.map((n) => (
                    <div key={n.id} className="p-2 rounded-lg bg-[#3B0B12] border border-[#5C121E]">
                      <p className="font-semibold text-white">{n.title}</p>
                      <p className="text-[#D5CFC7] text-[11px] mt-0.5">{n.desc}</p>
                      <span className="text-[9px] text-amber-200/40 block mt-1">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Auth Button */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-full border border-[#D4AF37]/40 hover:border-[#D4AF37] transition-all"
              >
                <img
                  src={currentUser.profile.profilePhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"}
                  alt={currentUser.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#4A0E17] border border-[#D4AF37]/30 rounded-xl shadow-2xl z-50 p-2 text-xs">
                  <div className="px-3 py-2 border-b border-[#5C121E]">
                    <p className="font-bold text-white truncate">{currentUser.username}</p>
                    <p className="text-amber-200/60 text-[10px] truncate">{currentUser.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => { onSelectTab("profile"); setProfileDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2 text-amber-100 hover:bg-[#5C121E] rounded-lg transition-colors flex items-center gap-2"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
                      {t("navProfile")}
                    </button>
                    <button
                      onClick={() => { onSelectTab("settings"); setProfileDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2 text-amber-100 hover:bg-[#5C121E] rounded-lg transition-colors"
                    >
                      {t("navSettings")}
                    </button>
                  </div>
                  <div className="pt-1 border-t border-[#5C121E]">
                    <button
                      onClick={() => { onSignOutClick(); setProfileDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2 text-red-300 hover:bg-red-950/40 rounded-lg transition-colors flex items-center gap-2"
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
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-[#2A080E] font-semibold text-xs hover:brightness-110 shadow-md transition-all flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              {t("signIn")}
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-amber-100 hover:bg-white/10"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#2C080E] border-b border-[#5C121E] px-4 pt-3 pb-6 space-y-2">
          {/* Mobile Search */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-200/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-[#1D0408] text-amber-100 border border-[#5C121E]"
            />
          </div>

          {[
            { id: "home", label: t("navHome") },
            { id: "library", label: t("navLibrary") },
            { id: "mybooks", label: t("navMyBooks") },
            { id: "progress", label: t("navProgress") },
            { id: "aifeatures", label: t("navAIFeatures") },
            { id: "about", label: t("navAbout") },
            { id: "settings", label: t("navSettings") },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium ${
                activeTab === item.id ? "bg-[#5C121E] text-[#D4AF37]" : "text-amber-100/80"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

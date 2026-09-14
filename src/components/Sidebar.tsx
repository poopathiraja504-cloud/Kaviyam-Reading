import React from "react";
import {
  Home,
  BookOpen,
  Library as LibraryIcon,
  Bookmark,
  TrendingUp,
  Sparkles,
  User as UserIcon,
  Mail,
  Database,
  HelpCircle,
  Settings as SettingsIcon,
  Shield,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Info,
} from "lucide-react";
import { User } from "../types";
import { Language } from "../utils/i18n";

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  lang: Language;
  currentUser: User | null;
  onSignOut: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({
  activeTab,
  onSelectTab,
  lang,
  currentUser,
  onSignOut,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  const isAdmin = currentUser?.email === "admin@kaviyam.com";

  const navItems = [
    { id: "home", icon: Home, labelTa: "முகப்பு", labelEn: "Home" },
    { id: "tamil-library", icon: BookOpen, labelTa: "தமிழ் நாவல்கள்", labelEn: "Tamil Classics" },
    { id: "catalog", icon: LibraryIcon, labelTa: "நூலகக் விபரம்", labelEn: "Library Catalog" },
    { id: "mybooks", icon: Bookmark, labelTa: "என் புத்தகங்கள்", labelEn: "My Bookshelf" },
    { id: "progress", icon: TrendingUp, labelTa: "வாசிப்பு முன்னேற்றம்", labelEn: "Progress" },
    { id: "aifeatures", icon: Sparkles, labelTa: "AI உதவித் தோழன்", labelEn: "AI Companion" },
    { id: "profile", icon: UserIcon, labelTa: "சுயவிவரம்", labelEn: "Profile" },
    { id: "mailbox", icon: Mail, labelTa: "அஞ்சல் பெட்டி", labelEn: "Mailbox" },
    { id: "localdb", icon: Database, labelTa: "உள் தரவுத்தளம்", labelEn: "Local Storage" },
    { id: "help", icon: HelpCircle, labelTa: "உதவி & FAQ", labelEn: "Help & FAQ" },
    { id: "about", icon: Info, labelTa: "பற்றி", labelEn: "About" },
    { id: "settings", icon: SettingsIcon, labelTa: "அமைப்புகள்", labelEn: "Settings" },
  ];

  if (isAdmin) {
    navItems.push({ id: "admin", icon: Shield, labelTa: "நிர்வாகி", labelEn: "Admin Panel" });
  }

  return (
    <aside
      className={`fixed top-[57px] bottom-0 left-0 z-30 bg-[#F8F5EE] border-r border-[#E2DDD5] flex flex-col transition-all duration-300 shadow-sm ${
        collapsed ? "w-16 sm:w-20" : "w-60"
      }`}
    >
      {/* Collapse Toggle Button */}
      <div className="p-3 border-b border-[#E2DDD5] flex items-center justify-end">
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg bg-stone-200/60 hover:bg-stone-300/80 text-stone-600 transition-colors"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const label = lang === "ta" ? item.labelTa : item.labelEn;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-[#5C121E] text-white shadow-sm"
                  : "text-stone-700 hover:bg-stone-200/70 hover:text-stone-900"
              } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? label : undefined}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#F5E6B3]" : "text-stone-500"}`} />
              {!collapsed && <span className="truncate">{label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User Footer inside Sidebar */}
      {currentUser && (
        <div className="p-3 border-t border-[#E2DDD5] bg-[#F3EFE6]">
          <div className={`flex items-center gap-2 ${collapsed ? "justify-center" : ""}`}>
            <img
              src={
                currentUser.profile?.profilePhoto ||
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"
              }
              alt={currentUser.username}
              className="w-8 h-8 rounded-full object-cover border border-amber-300"
            />
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-sans text-xs font-bold text-stone-800 truncate">
                  {currentUser.username}
                </p>
                <p className="text-[10px] text-stone-500 truncate">{currentUser.email}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}

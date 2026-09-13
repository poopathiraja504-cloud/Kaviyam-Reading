import React from "react";
import { 
  Home, 
  BookOpen, 
  BookMarked, 
  TrendingUp, 
  Sparkles, 
  Bookmark, 
  Heart, 
  Settings, 
  LogOut, 
  User as UserIcon,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Language, translations } from "../utils/i18n";
import { User } from "../types";

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
  onToggleCollapse
}: SidebarProps) {
  const t = (key: keyof typeof translations["ta"]) => translations[lang][key] || key;

  const menuItems = [
    { id: "home", label: t("navHome"), icon: Home },
    { id: "library", label: t("navLibrary"), icon: BookOpen },
    { id: "mybooks", label: t("navMyBooks"), icon: BookMarked },
    { id: "progress", label: t("navProgress"), icon: TrendingUp },
    { id: "aifeatures", label: t("navAIFeatures"), icon: Sparkles },
    { id: "bookmarks", label: t("navBookmarks"), icon: Bookmark },
    { id: "favorites", label: t("navFavorites"), icon: Heart },
    { id: "settings", label: t("navSettings"), icon: Settings },
  ];

  return (
    <aside
      className={`fixed top-16 left-0 bottom-0 z-30 bg-[#3B0B12] border-r border-[#5C121E] transition-all duration-300 flex flex-col justify-between ${
        collapsed ? "w-16 sm:w-20" : "w-60"
      }`}
    >
      {/* Navigation List */}
      <div className="p-3 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                isActive
                  ? "bg-gradient-to-r from-[#5C121E] to-[#4A0E17] text-[#D4AF37] border border-[#D4AF37]/30 shadow-md font-semibold"
                  : "text-amber-100/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-[#D4AF37]" : "text-amber-200/50"}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </div>

      {/* Collapse Toggle & User Info */}
      <div className="p-3 border-t border-[#5C121E] bg-[#2C080E] space-y-2">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-1.5 rounded-lg text-amber-200/60 hover:text-white hover:bg-white/5 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>

        {currentUser && (
          <div className="flex items-center gap-2 pt-2 border-t border-[#5C121E]/60">
            <img
              src={currentUser.profile.profilePhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"}
              alt={currentUser.username}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-[#D4AF37]/40"
            />
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{currentUser.username}</p>
                <p className="text-[10px] text-amber-200/50 truncate">{currentUser.email}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

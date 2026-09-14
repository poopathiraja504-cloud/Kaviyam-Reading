import React, { useState, useEffect } from "react";
import {
  Home,
  Compass,
  Sparkles,
  TrendingUp,
  BookOpen,
  Bookmark,
  Clock,
  PlusCircle,
  Brain,
  History,
  Trophy,
  BarChart2,
  Gift,
  HelpCircle,
  MessageSquare,
  Users,
  Bell,
  Crown,
  User as UserIcon,
  Settings as SettingsIcon,
  LogOut,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  X,
  Volume2,
  BookMarked,
  Sparkle,
  Coins,
  Shield,
  CreditCard,
  Download,
  Info,
  CheckCircle,
  PauseCircle,
  FolderOpen,
  Pin,
  Tag,
  Flame,
  Target,
  Award,
  BookCheck,
  Zap,
  Star,
  Activity,
  MessagesSquare,
  FileText,
  Quote,
  Vote,
  UserCheck,
  UserPlus,
  Mail,
  AlertCircle,
  Megaphone,
  BookOpenCheck,
  ShoppingBag,
  History as HistoryIcon,
  Search as SearchIcon,
  Globe,
  Play,
  Layers
} from "lucide-react";
import { User, QuizAttempt } from "../types";
import { Language } from "../utils/i18n";
import { getLevelInfo } from "../services/levelService";
import KaviyamBrandLogo from "./KaviyamBrandLogo";

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  lang: Language;
  currentUser: User | null;
  onSignOut: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  userAttempts?: QuizAttempt[];
  unreadNotificationsCount?: number;
  onSelectCategory?: (categoryId: string) => void;
  onSelectSmartCollection?: (collectionId: string) => void;
  onPlayIntro?: () => void;
  onStartReading?: () => void;
  activeCategory?: string;
  activeSmartCollection?: string;
}

interface SidebarItem {
  id: string;
  labelEn: string;
  labelTa: string;
  icon: React.ComponentType<any>;
  actionType?: "category" | "smart-collection" | "custom-action" | "tab";
  actionValue?: string;
}

interface SidebarGroup {
  key: string;
  labelEn: string;
  labelTa: string;
  icon: React.ComponentType<any>;
  items: SidebarItem[];
}

export default function Sidebar({
  activeTab,
  onSelectTab,
  lang,
  currentUser,
  onSignOut,
  collapsed,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
  userAttempts = [],
  unreadNotificationsCount = 3, // Default fallback to match requirements
  onSelectCategory,
  onSelectSmartCollection,
  onPlayIntro,
  onStartReading,
  activeCategory = "all",
  activeSmartCollection = "",
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  
  // Persistent collapse states of sections in Sidebar
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("kaviyam_sidebar_groups");
      return saved ? JSON.parse(saved) : {
        main: true,
        myreading: true,
        quizlearning: true,
        kaviyamai: false,
        readingtools: false,
        rewards: false,
        community: false,
        notifications: false,
        premium: false,
        account: false,
      };
    } catch (_) {
      return { main: true, myreading: true, quizlearning: true };
    }
  });

  useEffect(() => {
    localStorage.setItem("kaviyam_sidebar_groups", JSON.stringify(expandedGroups));
  }, [expandedGroups]);

  // Calculate unfinished quizzes count
  const unfinishedQuizzesCount = React.useMemo(() => {
    const totalQuizzes = 50; // Total specified in specs
    // Extract unique quizIds completed
    const completedQuizIds = new Set(
      userAttempts
        .filter((att) => att.score >= 40) // successfully completed / passed
        .map((att) => att.quizId)
    );
    const unfinished = totalQuizzes - completedQuizIds.size;
    return unfinished > 0 ? unfinished : 0;
  }, [userAttempts]);

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  const isAdmin = currentUser?.email === "admin@kaviyam.com";

  // Streamlined Minimal Navigation Structure according to exact specifications
  const sidebarGroups: SidebarGroup[] = [
    {
      key: "main",
      labelEn: "MAIN",
      labelTa: "முதன்மை",
      icon: Home,
      items: [
        { id: "home", labelEn: "Home", labelTa: "முகப்பு", icon: Home },
        { id: "explore", labelEn: "Explore", labelTa: "ஆராய்ந்து காண்க", icon: Compass },
        { id: "tamil-library", labelEn: "Browse Tamil Library", labelTa: "நூலகத்தை ஆராய்க", icon: BookOpen },
      ],
    },
    {
      key: "myreading",
      labelEn: "MY READING",
      labelTa: "என் வாசிப்பு",
      icon: Bookmark,
      items: [
        { id: "mybooks", labelEn: "My Library", labelTa: "என் நூலகம்", icon: Bookmark },
        { id: "continue-reading", labelEn: "Continue Reading", labelTa: "தொடர்ந்து வாசிக்க", icon: BookOpenCheck },
        { id: "bookmarks", labelEn: "Bookmarks", labelTa: "புத்தகக் குறியீடுகள்", icon: Pin },
      ],
    },
    {
      key: "quizlearning",
      labelEn: "QUIZ & LEARNING",
      labelTa: "வினாடி வினா & கற்றல்",
      icon: Brain,
      items: [
        { id: "quizzes", labelEn: "Quizzes", labelTa: "வினாடி வினாக்கள்", icon: Brain },
        { id: "word-finder", labelEn: "Word Finder", labelTa: "சொல் கண்டுபிடி", icon: Sparkles },
        { id: "quiz-history", labelEn: "Quiz History", labelTa: "வினாடி வினா வரலாறு", icon: History },
        { id: "quiz-stats", labelEn: "My Quiz Stats", labelTa: "வினாடி வினா புள்ளிவிவரங்கள்", icon: BarChart2 },
      ],
    },
    {
      key: "kaviyamai",
      labelEn: "KAVIYAM AI",
      labelTa: "காவியம் AI",
      icon: Sparkles,
      items: [
        { id: "aifeatures", labelEn: "Ask Kaviyam AI", labelTa: "AI உதவித் தோழன்", icon: Sparkles },
        { id: "smart-summary", labelEn: "Smart Summary", labelTa: "அறிவுசார் சுருக்கம்", icon: Sparkle },
        { id: "explain-this", labelEn: "Explain This", labelTa: "இதனை விளக்கு", icon: Info },
      ],
    },
    {
      key: "readingtools",
      labelEn: "READING TOOLS",
      labelTa: "வாசிப்பு கருவிகள்",
      icon: BookOpen,
      items: [
        { id: "notes", labelEn: "Notes", labelTa: "குறிப்புகள்", icon: FileText },
        { id: "highlights", labelEn: "Highlights", labelTa: "முன்னிலைப்படுத்தியவை", icon: Bookmark },
        { id: "reading-mode", labelEn: "Reading Mode", labelTa: "வாசிப்பு முறை", icon: BookOpen },
        { id: "fullscreen-reader", labelEn: "Fullscreen Reader", labelTa: "முழுத்திரை வாசிப்பு", icon: ChevronRight },
      ],
    },
    {
      key: "rewards",
      labelEn: "REWARDS",
      labelTa: "பரிசுகள் & நிலைகள்",
      icon: Trophy,
      items: [
        { id: "streak", labelEn: "Reading Streak", labelTa: "தொடர் வாசிப்பு நாட்கள்", icon: Flame },
        { id: "levels", labelEn: "Levels", labelTa: "நிலைகள்", icon: TrendingUp },
        { id: "achievements", labelEn: "Achievements", labelTa: "சாதனைகள்", icon: Award },
      ],
    },
    {
      key: "community",
      labelEn: "COMMUNITY",
      labelTa: "வாசகர் சமமூகக் கூடம்",
      icon: Users,
      items: [
        { id: "book-discussions", labelEn: "Book Discussions", labelTa: "நூல் விவாதங்கள்", icon: MessageSquare },
        { id: "reader-clubs", labelEn: "Reader Clubs", labelTa: "வாசகர் மன்றங்கள்", icon: Users },
      ],
    },
    {
      key: "notifications",
      labelEn: "NOTIFICATIONS",
      labelTa: "அறிவிப்புகள்",
      icon: Bell,
      items: [
        { id: "notifications", labelEn: "Notifications", labelTa: "அறிவிப்புகள்", icon: Bell },
      ],
    },
    {
      key: "premium",
      labelEn: "PREMIUM",
      labelTa: "பிரீமியம்",
      icon: Crown,
      items: [
        { id: "premium", labelEn: "Kaviyam Premium", labelTa: "காவியம் பிரீமியம்", icon: Crown },
        { id: "premium-books", labelEn: "Premium Books", labelTa: "பிரீமியம் புத்தகங்கள்", icon: Bookmark },
        { id: "subscription", labelEn: "Subscription", labelTa: "சந்தா விவரங்கள்", icon: CreditCard },
      ],
    },
    {
      key: "account",
      labelEn: "ACCOUNT",
      labelTa: "கணக்கு",
      icon: UserIcon,
      items: [
        { id: "profile", labelEn: "Profile", labelTa: "சுயவிவரம்", icon: UserIcon },
        { id: "settings", labelEn: "Settings", labelTa: "அமைப்புகள்", icon: SettingsIcon },
        { id: "help", labelEn: "Help & Support", labelTa: "உதவி & ஆதரவு", icon: HelpCircle },
        { id: "logout", labelEn: "Logout", labelTa: "வெளியேறு", icon: LogOut },
      ],
    },
  ];

  if (isAdmin) {
    // Add Admin Panel to account section before logout
    const accGroup = sidebarGroups.find((g) => g.key === "account");
    if (accGroup) {
      accGroup.items.splice(accGroup.items.length - 1, 0, {
        id: "admin",
        labelEn: "Admin Panel",
        labelTa: "நிர்வாகி தளம்",
        icon: Shield,
      });
    }
  }

  // Filter items based on search query
  const getFilteredGroups = () => {
    if (!searchQuery) return sidebarGroups;

    const query = searchQuery.toLowerCase();
    return sidebarGroups
      .map((group) => {
        const filteredItems = group.items.filter(
          (item) =>
            item.labelEn.toLowerCase().includes(query) ||
            item.labelTa.toLowerCase().includes(query)
        );
        return { ...group, items: filteredItems };
      })
      .filter((group) => group.items.length > 0);
  };

  const filteredGroups = getFilteredGroups();

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-stone-900/60 backdrop-blur-xs md:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Navigation Panel */}
      <aside
        className={`fixed top-0 md:top-[53px] sm:md:top-[57px] bottom-0 left-0 z-50 md:z-30 bg-[#FBF9F3] border-r border-[#E2DDD5] flex flex-col transition-all duration-300 shadow-2xl md:shadow-sm ${
          mobileOpen ? "translate-x-0 w-72 max-w-[85vw]" : "-translate-x-full md:translate-x-0"
        } ${collapsed ? "md:w-20" : "md:w-64"}`}
      >
        {/* Sidebar Controls Bar (Collapse & Mobile Close - No duplicate brand) */}
        <div className={`px-3 py-2 border-b border-[#E2DDD5] flex items-center justify-between bg-[#F5EFE1] shrink-0 ${collapsed && !mobileOpen ? "md:justify-center" : ""}`}>
          <div className={`${collapsed && !mobileOpen ? "hidden" : "flex"} items-center gap-1.5`}>
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              {lang === "ta" ? "பட்டி" : "Navigation"}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Mobile Close Icon Button */}
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg bg-stone-200/80 hover:bg-stone-300 text-stone-700 transition-colors cursor-pointer"
              title="Close Menu"
            >
              <X className="w-4 h-4" />
            </button>
            {/* Desktop Collapse Icon Button */}
            <button
              onClick={onToggleCollapse}
              className="hidden md:flex p-1.5 rounded-lg bg-stone-200/60 hover:bg-amber-100 text-[#5C121E] transition-all cursor-pointer hover:shadow-xs border border-transparent hover:border-amber-300/50 items-center justify-center"
              title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* SEARCH NAVIGATION - Hidden on Collapsed Desktop Sidebar */}
        {(!collapsed || mobileOpen) && (
          <div className="p-3 border-b border-[#E2DDD5] bg-[#FAF8F2] shrink-0">
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === "ta" ? "அம்சங்களைத் தேடுக..." : "Search features..."}
                className="w-full pl-8 pr-3 py-1.5 bg-stone-100 hover:bg-white focus:bg-white border border-stone-200 focus:border-amber-500 rounded-lg text-xs text-stone-800 placeholder-stone-400 focus:outline-none transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ACCORDION NAV LIST (Scrollable) */}
        <nav className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-2 space-y-2 custom-scrollbar">
          {filteredGroups.map((group) => {
            const isGroupExpanded = expandedGroups[group.key] || searchQuery.length > 0;
            const groupLabel = lang === "ta" ? group.labelTa : group.labelEn;
            const GroupIcon = group.icon;

            return (
              <div key={group.key} className="space-y-0.5">
                {/* Accordion Group Header */}
                {(!collapsed || mobileOpen) ? (
                  <button
                    onClick={() => toggleGroup(group.key)}
                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider text-stone-500 hover:text-[#5C121E] uppercase hover:bg-stone-100 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      <GroupIcon className="w-3 h-3 text-stone-400" />
                      <span>{groupLabel}</span>
                    </div>
                    {isGroupExpanded ? (
                      <ChevronUp className="w-3 h-3 text-stone-400" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-stone-400" />
                    )}
                  </button>
                ) : (
                  <div className="w-full border-b border-stone-200/50 my-2" />
                )}

                {/* Sub-items list */}
                {((isGroupExpanded || collapsed) && !searchQuery) || searchQuery.length > 0 ? (
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const ItemIcon = item.icon;
                      const isActive = item.actionType === "category"
                        ? (activeTab === "tamil-library" && activeCategory === item.actionValue)
                        : item.actionType === "smart-collection"
                        ? (activeTab === "tamil-library" && activeSmartCollection === item.actionValue)
                        : activeTab === item.id;
                      const itemLabel = lang === "ta" ? item.labelTa : item.labelEn;

                      // Check for specific badges
                      const showBadge = (item.id === "notifications" && unreadNotificationsCount > 0) ||
                                      (item.id === "quizzes" && unfinishedQuizzesCount > 0);
                      const badgeVal = item.id === "notifications" ? unreadNotificationsCount : unfinishedQuizzesCount;

                      // Unique styling for Premium button
                      const isPremiumBtn = item.id === "premium";

                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            if (item.id === "logout") {
                              if (onSignOut) onSignOut();
                            } else if (item.actionType === "custom-action") {
                              if (item.id === "start-reading" && onStartReading) {
                                onStartReading();
                              } else if (item.id === "play-intro" && onPlayIntro) {
                                onPlayIntro();
                              }
                            } else if (item.actionType === "category" && onSelectCategory) {
                              onSelectCategory(item.actionValue || "all");
                            } else if (item.actionType === "smart-collection" && onSelectSmartCollection) {
                              onSelectSmartCollection(item.actionValue || "");
                            } else {
                              onSelectTab(item.id);
                            }
                            if (onCloseMobile) onCloseMobile();
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer relative group/item ${
                            isActive
                              ? isPremiumBtn
                                ? "bg-gradient-to-r from-amber-500 to-amber-700 text-white shadow-md border border-amber-300/30"
                                : "bg-[#5C121E] text-white shadow-sm border border-[#5C121E]"
                              : isPremiumBtn
                              ? "bg-amber-100/60 hover:bg-amber-100 text-amber-900 border border-amber-200/40"
                              : "text-stone-700 hover:bg-amber-50/50 hover:text-[#5C121E] border border-transparent"
                          } ${collapsed && !mobileOpen ? "md:justify-center md:px-2" : ""}`}
                          title={collapsed && !mobileOpen ? itemLabel : undefined}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <ItemIcon
                              className={`w-4 h-4 shrink-0 transition-transform group-hover/item:scale-105 ${
                                isActive
                                  ? "text-amber-200"
                                  : isPremiumBtn
                                  ? "text-amber-600 animate-pulse"
                                  : "text-stone-500 group-hover/item:text-[#5C121E]"
                              }`}
                            />
                            <span
                              className={`truncate font-medium ${
                                collapsed && !mobileOpen ? "md:hidden" : "block"
                              }`}
                            >
                              {itemLabel}
                            </span>
                          </div>

                          {/* Dynamic notification / quiz badges */}
                          {showBadge && (!collapsed || mobileOpen) && (
                            <span className="flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-amber-500 text-[#3B0B12] font-black text-[9px] shadow-xs">
                              {badgeVal}
                            </span>
                          )}

                          {/* Mini dot for collapsed badges */}
                          {showBadge && collapsed && !mobileOpen && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 border border-white" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        {/* USER FOOTER AREA */}
        {(!currentUser || currentUser.id === "guest-user-session") ? (
          <div className="p-3 border-t border-[#E2DDD5] bg-[#F5EFE1] shrink-0">
            <button
              onClick={() => {
                if (onCloseMobile) onCloseMobile();
                onSelectTab("login");
              }}
              id="sidebar-guest-login-btn"
              className={`w-full py-2.5 px-3 rounded-xl bg-[#5C121E] hover:bg-[#3B0B12] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
                collapsed && !mobileOpen ? "px-1.5" : ""
              }`}
              title={lang === "ta" ? "கணக்கில் உள்நுழைக" : "Sign In to Account"}
            >
              <UserIcon className="w-4 h-4 shrink-0 text-amber-300" />
              <span className={collapsed && !mobileOpen ? "md:hidden" : "inline"}>
                {lang === "ta" ? "உள்நுழைக" : "Sign In"}
              </span>
            </button>
          </div>
        ) : (
          <div className="p-3 border-t border-[#E2DDD5] bg-[#F5EFE1] shrink-0 relative">
            {/* Expanded Dropdown Panel */}
            {profileDropdownOpen && (
              <div
                className={`absolute left-3 right-3 bottom-16 bg-white border border-[#E2DDD5] rounded-xl shadow-xl z-50 p-1 space-y-0.5 overflow-hidden transition-all duration-200`}
              >
                <button
                  onClick={() => {
                    onSelectTab("profile");
                    setProfileDropdownOpen(false);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-100 hover:text-stone-900 flex items-center gap-2 cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5 text-stone-500" />
                  <span>{lang === "ta" ? "சுயவிவரம்" : "Profile"}</span>
                </button>
                <button
                  onClick={() => {
                    onSelectTab("settings");
                    setProfileDropdownOpen(false);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-100 hover:text-stone-900 flex items-center gap-2 cursor-pointer"
                >
                  <SettingsIcon className="w-3.5 h-3.5 text-stone-500" />
                  <span>{lang === "ta" ? "அமைப்புகள்" : "Settings"}</span>
                </button>
                <div className="h-px bg-stone-200/60 my-1" />
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    if (onCloseMobile) onCloseMobile();
                    onSignOut();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-red-700 hover:bg-red-50 hover:text-red-800 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-600" />
                  <span>{lang === "ta" ? "வெளியேறு (Logout)" : "Logout"}</span>
                </button>
              </div>
            )}

            <div
              onClick={() => {
                if (collapsed && !mobileOpen) {
                  onSelectTab("profile");
                } else {
                  setProfileDropdownOpen(!profileDropdownOpen);
                }
              }}
              className={`flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-stone-200/50 cursor-pointer transition-colors ${
                collapsed && !mobileOpen ? "md:justify-center" : ""
              }`}
              title={lang === "ta" ? "சுயவிவர பட்டி" : "User Menu"}
            >
              <img
                src={
                  currentUser.profile?.profilePhoto ||
                  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"
                }
                alt={currentUser.username}
                className="w-8.5 h-8.5 rounded-full object-cover border-2 border-amber-400 shrink-0 shadow-xs"
                referrerPolicy="no-referrer"
              />
              <div className={`flex-1 min-w-0 ${collapsed && !mobileOpen ? "md:hidden" : "block"}`}>
                <p className="font-sans text-xs font-black text-stone-800 truncate leading-tight">
                  {currentUser.username}
                </p>
                {(() => {
                  const totalXp = currentUser.totalXP || currentUser.totalXp || 0;
                  const lvlInfo = getLevelInfo(totalXp, lang);
                  return (
                    <div className="flex flex-col mt-0.5 space-y-0.5">
                      <span className="text-[9px] font-semibold text-[#8C6D3D] uppercase tracking-wide leading-none">
                        {currentUser.email === "admin@kaviyam.com" ? "Administrator" : "Kaviyam Reader"}
                      </span>
                      <span className="text-[9px] font-bold text-[#5C121E] leading-none">
                        Lvl {lvlInfo.currentLevel} – {lang === "ta" ? lvlInfo.levelNameTa : lvlInfo.levelNameEn}
                      </span>
                      {/* XP Progress Bar */}
                      <div className="h-1 w-full bg-stone-300 rounded-full overflow-hidden mt-1" title={`${totalXp} XP`}>
                        <div 
                          className="h-full bg-amber-500 transition-all duration-300"
                          style={{ width: `${lvlInfo.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

import React, { useState } from "react";
import { 
  Home, 
  Compass, 
  Flame, 
  BookOpen, 
  Library as LibraryIcon, 
  Bookmark, 
  Clock, 
  CheckCircle2, 
  PauseCircle, 
  Heart, 
  FolderPlus, 
  PlusCircle, 
  Tag, 
  Pin, 
  Brain, 
  History, 
  BarChart3, 
  Trophy, 
  Award, 
  Zap, 
  Sparkles, 
  FileText, 
  Key, 
  HelpCircle, 
  Users, 
  Map, 
  Link2, 
  HelpCircle as QuizMeIcon, 
  Volume2, 
  Headphones, 
  Search, 
  BookMarked, 
  Languages, 
  StickyNote, 
  Highlighter, 
  Eye, 
  Maximize, 
  Coins, 
  Crown, 
  UserCheck, 
  MessageSquare, 
  UserPlus, 
  Share2, 
  Vote, 
  Quote, 
  Bell, 
  Gift, 
  ShoppingBag, 
  Download, 
  User as UserIcon, 
  Settings as SettingsIcon, 
  Info, 
  LogOut, 
  ChevronDown, 
  ChevronRight, 
  ChevronLeft, 
  X,
  Shield,
  Star
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
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  unreadNotifCount?: number;
  unfinishedQuizCount?: number;
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
  onCloseMobile = () => {},
  unreadNotifCount = 3,
  unfinishedQuizCount = 2,
}: SidebarProps) {
  const [navSearch, setNavSearch] = useState("");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    main: true,
    myReading: true,
    quizLearning: true,
    kaviyamAi: false,
    readingTools: false,
    rewards: false,
    community: false,
    notifications: false,
    premium: false,
    account: true,
  });

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const toggleSection = (sectionKey: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  // Nav Sections Definition
  const sections = [
    {
      key: "main",
      title: "MAIN",
      icon: Home,
      items: [
        { id: "home", label: "Home", icon: Home },
        { id: "explore", label: "Explore", icon: Compass },
        { id: "discover", label: "Discover", icon: Sparkles },
        { id: "trending", label: "Trending", icon: Flame },
        { id: "book-of-the-day", label: "Book of the Day", icon: BookOpen },
      ],
    },
    {
      key: "myReading",
      title: "MY READING",
      icon: LibraryIcon,
      items: [
        { id: "catalog", label: "My Library", icon: LibraryIcon },
        { id: "continue-reading", label: "Continue Reading", icon: Clock },
        { id: "reading-queue", label: "Reading Queue", icon: BookMarked },
        { id: "recently-read", label: "Recently Read", icon: History },
        { id: "recently-opened", label: "Recently Opened", icon: Eye },
        { id: "finished-books", label: "Finished Books", icon: CheckCircle2 },
        { id: "paused-books", label: "Paused Books", icon: PauseCircle },
        { id: "mybooks", label: "Save for Later", icon: Bookmark },
        { id: "collections", label: "Collections", icon: FolderPlus },
        { id: "create-shelf", label: "Create Shelf", icon: PlusCircle },
        { id: "pinned", label: "Pinned", icon: Pin },
        { id: "tags", label: "Tags", icon: Tag },
      ],
    },
    {
      key: "quizLearning",
      title: "QUIZ & LEARNING",
      icon: Brain,
      items: [
        { id: "quizzes", label: "Quizzes", icon: Brain, badge: unfinishedQuizCount },
        { id: "quiz-history", label: "Quiz History", icon: History },
        { id: "quiz-stats", label: "My Quiz Stats", icon: BarChart3 },
        { id: "quiz-leaderboard", label: "Quiz Leaderboard", icon: Trophy },
        { id: "achievements", label: "Achievements", icon: Award },
        { id: "reading-challenges", label: "Reading Challenges", icon: Zap },
      ],
    },
    {
      key: "kaviyamAi",
      title: "KAVIYAM AI",
      icon: Sparkles,
      items: [
        { id: "aifeatures", label: "Ask Kaviyam AI", icon: Sparkles },
        { id: "ai-summary", label: "Smart Summary", icon: FileText },
        { id: "ai-key-ideas", label: "Key Ideas", icon: Key },
        { id: "ai-explain", label: "Explain This", icon: HelpCircle },
        { id: "ai-characters", label: "Character Guide", icon: Users },
        { id: "ai-timeline", label: "Story Timeline", icon: Clock },
        { id: "ai-map", label: "Story Map", icon: Map },
        { id: "ai-topics", label: "Related Topics", icon: Tag },
        { id: "ai-connections", label: "Story Connections", icon: Link2 },
        { id: "ai-quiz-me", label: "Quiz Me", icon: QuizMeIcon },
        { id: "ai-generate-questions", label: "Generate Questions", icon: PlusCircle },
      ],
    },
    {
      key: "readingTools",
      title: "READING TOOLS",
      icon: Headphones,
      items: [
        { id: "tools-read-aloud", label: "Read Aloud", icon: Volume2 },
        { id: "tools-listen", label: "Listen to Book", icon: Headphones },
        { id: "tools-find", label: "Find in Book", icon: Search },
        { id: "tools-dictionary", label: "Dictionary", icon: BookMarked },
        { id: "tools-translation", label: "Translation", icon: Languages },
        { id: "tools-notes", label: "Notes", icon: StickyNote },
        { id: "tools-highlights", label: "Highlights", icon: Highlighter },
        { id: "tools-bookmarks", label: "Bookmarks", icon: Bookmark },
        { id: "tools-reading-mode", label: "Reading Mode", icon: Eye },
        { id: "tools-focus-mode", label: "Focus Mode", icon: Zap },
        { id: "tools-fullscreen", label: "Fullscreen Reader", icon: Maximize },
      ],
    },
    {
      key: "rewards",
      title: "REWARDS",
      icon: Trophy,
      items: [
        { id: "streak", label: "Reading Streak", icon: Flame },
        { id: "rewards-daily-mission", label: "Daily Mission", icon: CheckCircle2 },
        { id: "rewards-weekly-challenge", label: "Weekly Challenge", icon: Zap },
        { id: "rewards-monthly-challenge", label: "Monthly Challenge", icon: Trophy },
        { id: "rewards-xp", label: "XP", icon: Star },
        { id: "rewards-coins", label: "Kaviyam Coins", icon: Coins },
        { id: "rewards-levels", label: "Levels", icon: Award },
        { id: "rewards-badges", label: "Badges", icon: Shield },
        { id: "rewards", label: "Rewards", icon: Gift },
        { id: "rewards-my-ranking", label: "My Ranking", icon: UserCheck },
        { id: "rewards-top-readers", label: "Top Readers", icon: Crown },
      ],
    },
    {
      key: "community",
      title: "COMMUNITY",
      icon: Users,
      items: [
        { id: "community", label: "Book Discussions", icon: MessageSquare },
        { id: "clubs", label: "Reader Clubs", icon: Users },
        { id: "clubs-join", label: "Join a Club", icon: UserPlus },
        { id: "community-posts", label: "Community Posts", icon: FileText },
        { id: "community-thoughts", label: "Reader Thoughts", icon: Heart },
        { id: "community-quotes", label: "Popular Quotes", icon: Quote },
        { id: "community-trending", label: "Trending Discussions", icon: Flame },
        { id: "community-polls", label: "Book Polls", icon: Vote },
        { id: "community-find-readers", label: "Find Readers", icon: Search },
        { id: "community-invite", label: "Invite Friends", icon: Share2 },
      ],
    },
    {
      key: "notifications",
      title: "NOTIFICATIONS",
      icon: Bell,
      items: [
        { id: "notifications", label: "Notifications", icon: Bell, badge: unreadNotifCount },
        { id: "notifications-books", label: "New Book Alerts", icon: BookOpen },
        { id: "notifications-favorites", label: "Favorite Updates", icon: Heart },
        { id: "notifications-goals", label: "Goal Reminders", icon: Clock },
        { id: "notifications-streaks", label: "Streak Reminders", icon: Flame },
        { id: "notifications-community", label: "Community Updates", icon: Users },
        { id: "notifications-announcements", label: "Announcements", icon: Info },
      ],
    },
    {
      key: "premium",
      title: "PREMIUM",
      icon: Crown,
      items: [
        { id: "premium", label: "Kaviyam Premium", icon: Crown, isPremium: true },
        { id: "premium-books", label: "Premium Books", icon: Star },
        { id: "premium-pass", label: "Book Pass", icon: Shield },
        { id: "premium-subscription", label: "Subscription", icon: Zap },
        { id: "store", label: "Kaviyam Store", icon: ShoppingBag },
        { id: "store-gift", label: "Gift a Book", icon: Gift },
        { id: "store-history", label: "Purchase History", icon: History },
        { id: "downloads", label: "My Downloads", icon: Download },
      ],
    },
    {
      key: "account",
      title: "ACCOUNT",
      icon: UserIcon,
      items: [
        { id: "profile", label: "Profile", icon: UserIcon },
        { id: "settings", label: "Settings", icon: SettingsIcon },
        { id: "help", label: "Help & Support", icon: HelpCircle },
        { id: "about", label: "About Kaviyam", icon: Info },
      ],
    },
  ];

  // Handle item select
  const handleItemClick = (id: string) => {
    onSelectTab(id);
    if (mobileOpen) onCloseMobile();
  };

  // Filter items by search query if user typed
  const isSearching = navSearch.trim().length > 0;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#3B0B12] text-amber-100 font-sans border-r border-[#5C121E]">
      
      {/* 1. SIDEBAR HEADER */}
      <div className="p-4 border-b border-[#5C121E] bg-[#2C080E] flex items-center justify-between flex-shrink-0">
        <div 
          onClick={() => handleItemClick("home")}
          className="flex items-center gap-3 cursor-pointer select-none truncate"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#9A7B24] p-0.5 shadow-md flex-shrink-0">
            <div className="w-full h-full bg-[#3B0B12] rounded-[10px] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#D4AF37]" />
            </div>
          </div>
          {(!collapsed || mobileOpen) && (
            <div className="min-w-0">
              <h2 className="font-serif font-extrabold text-base tracking-wide text-white leading-tight truncate">
                KAVIYAM <span className="text-[#D4AF37] font-normal">READING</span>
              </h2>
              <p className="text-[10px] text-amber-200/60 tracking-wider truncate">
                Read • Learn • Discover
              </p>
            </div>
          )}
        </div>

        {/* Mobile close X button */}
        {mobileOpen && (
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-amber-200/70 hover:text-white hover:bg-white/10 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 2. SEARCH INSIDE SIDEBAR */}
      {(!collapsed || mobileOpen) && (
        <div className="p-3 border-b border-[#5C121E]/60 bg-[#340910] flex-shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-amber-200/50" />
            <input
              type="text"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              placeholder="Search features..."
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl bg-[#25060A] text-amber-100 placeholder-amber-200/40 border border-[#5C121E] focus:outline-none focus:border-[#D4AF37] transition-all"
            />
            {navSearch && (
              <button
                onClick={() => setNavSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-amber-200/50 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. COLLAPSIBLE NAVIGATION SECTIONS */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-3 custom-scrollbar">
        {sections.map((section) => {
          const isExpanded = isSearching || expandedSections[section.key];

          // Filter section items if searching
          const filteredItems = isSearching
            ? section.items.filter((item) =>
                item.label.toLowerCase().includes(navSearch.toLowerCase())
              )
            : section.items;

          if (isSearching && filteredItems.length === 0) return null;

          return (
            <div key={section.key} className="space-y-1">
              
              {/* Section Accordion Title Header */}
              {(!collapsed || mobileOpen) ? (
                <button
                  onClick={() => toggleSection(section.key)}
                  className="w-full flex items-center justify-between px-2.5 py-1 text-[11px] font-bold text-amber-200/50 hover:text-[#D4AF37] uppercase tracking-wider transition-colors"
                >
                  <span className="truncate">{section.title}</span>
                  {!isSearching && (
                    <span className="text-amber-200/40">
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </span>
                  )}
                </button>
              ) : (
                <div className="h-px bg-[#5C121E]/60 my-2" />
              )}

              {/* Items List */}
              {(isExpanded || collapsed) && (
                <div className="space-y-0.5">
                  {filteredItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    const isPremium = (item as any).isPremium;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(item.id)}
                        title={collapsed && !mobileOpen ? item.label : undefined}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 relative group ${
                          isActive
                            ? "bg-gradient-to-r from-[#5C121E] to-[#4A0E17] text-[#D4AF37] border border-[#D4AF37]/40 shadow-inner font-semibold"
                            : isPremium
                            ? "bg-gradient-to-r from-[#D4AF37]/20 to-[#9A7B24]/10 text-[#D4AF37] border border-[#D4AF37]/30 hover:bg-[#D4AF37]/30 font-semibold"
                            : "text-amber-100/80 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon
                            className={`w-4 h-4 flex-shrink-0 transition-colors ${
                              isActive
                                ? "text-[#D4AF37]"
                                : isPremium
                                ? "text-[#D4AF37]"
                                : "text-amber-200/50 group-hover:text-amber-100"
                            }`}
                          />
                          {(!collapsed || mobileOpen) && (
                            <span className="truncate">{item.label}</span>
                          )}
                        </div>

                        {/* Badges */}
                        {item.badge !== undefined && item.badge > 0 && (
                          <span
                            className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                              isActive
                                ? "bg-[#D4AF37] text-[#2C080E]"
                                : "bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30"
                            } ${collapsed && !mobileOpen ? "absolute top-1 right-1 p-1 w-2 h-2 text-[0px]" : ""}`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* 4. USER PROFILE & FOOTER CONTROLS */}
      <div className="p-3 border-t border-[#5C121E] bg-[#2C080E] flex-shrink-0 space-y-2">
        
        {/* Collapse Toggle Button (Desktop Only) */}
        {!mobileOpen && (
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center p-1.5 rounded-lg text-amber-200/60 hover:text-white hover:bg-white/5 transition-colors"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}

        {/* User Card */}
        {currentUser && (
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="w-full flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-white/5 transition-colors text-left"
            >
              <img
                src={
                  currentUser.profile.profilePhoto ||
                  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"
                }
                alt={currentUser.username}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-[#D4AF37]/40"
              />
              {(!collapsed || mobileOpen) && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{currentUser.username}</p>
                  <p className="text-[10px] text-amber-200/60 truncate">Reader</p>
                </div>
              )}
              {(!collapsed || mobileOpen) && (
                <ChevronDown className="w-3.5 h-3.5 text-amber-200/40" />
              )}
            </button>

            {/* User Popover Dropdown */}
            {userDropdownOpen && (
              <div className="absolute bottom-12 left-0 w-full bg-[#4A0E17] border border-[#D4AF37]/30 rounded-xl shadow-2xl z-50 p-1 text-xs space-y-0.5">
                <button
                  onClick={() => { handleItemClick("profile"); setUserDropdownOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-amber-100 hover:bg-[#5C121E] flex items-center gap-2"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => { handleItemClick("settings"); setUserDropdownOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-amber-100 hover:bg-[#5C121E] flex items-center gap-2"
                >
                  <SettingsIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Settings</span>
                </button>
                <div className="h-px bg-[#5C121E] my-1" />
                <button
                  onClick={() => { onSignOut(); setUserDropdownOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-red-300 hover:bg-red-950/40 flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-400" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );

  return (
    <>
      {/* DESKTOP FIXED SIDEBAR */}
      <aside
        className={`hidden lg:block fixed top-16 left-0 bottom-0 z-30 transition-all duration-300 ${
          collapsed ? "w-16 sm:w-20" : "w-64 xl:w-70"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* MOBILE / TABLET SLIDE-OUT DRAWER */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop Overlay */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Container */}
          <div className="fixed top-0 bottom-0 left-0 w-72 max-w-[85vw] shadow-2xl transition-transform duration-300 ease-in-out">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

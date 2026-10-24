import React from "react";
import { Book, User } from "../types";
import { Language } from "../utils/i18n";
import { QUIZ_DATABASE } from "../quizData";
import QuizStats from "./QuizStats";
import QuizHistory from "./QuizHistory";
import QuizLeaderboard from "./QuizLeaderboard";
import ComingSoonPage from "./ComingSoonPage";

interface SidebarPagesProps {
  activeTab: string;
  books: Book[];
  bookmarks: string[];
  onSelectBook: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  lang: Language;
  currentUser: User | null;
  navigateTo: (tab: string, subId?: string) => void;
}

const TAB_TITLES: Record<string, { en: string; ta: string }> = {
  "explore": { en: "Explore Books", ta: "நூல்களை ஆராய்க" },
  "discover": { en: "Discover New Epics", ta: "புதிய காவியங்களைக் கண்டறிக" },
  "trending": { en: "Trending Literature", ta: "பிரபலமான இலக்கியங்கள்" },
  "book-of-day": { en: "Book of the Day", ta: "இன்றைய சிறப்பு நூல்" },
  "continue-reading": { en: "Continue Reading", ta: "தொடர்ந்து வாசிக்க" },
  "reading-queue": { en: "Reading Queue", ta: "வாசிப்பு வரிசை" },
  "recently-read": { en: "Recently Read", ta: "சமீபத்தில் வாசித்தவை" },
  "recently-opened": { en: "Recently Opened", ta: "சமீபத்தில் திறந்தவை" },
  "help": { en: "Help & FAQ", ta: "உதவி & அடிக்கடி கேட்கப்படும் கேள்விகள்" },
  "about": { en: "About Kaviyam", ta: "காவியம் பற்றி" },
};

export default function SidebarPages({
  activeTab,
  books,
  bookmarks,
  onSelectBook,
  onToggleBookmark,
  lang,
  currentUser,
  navigateTo,
}: SidebarPagesProps) {
  const isTamil = lang === "ta";

  if (activeTab === "quiz-stats") {
    return (
      <QuizStats
        currentUser={currentUser}
        quizzes={QUIZ_DATABASE}
        onGoToQuizzes={() => navigateTo("quizzes")}
        lang={lang}
      />
    );
  }

  if (activeTab === "quiz-history") {
    return (
      <QuizHistory
        currentUser={currentUser}
        quizzes={QUIZ_DATABASE}
        onSelectQuiz={(quizId) => navigateTo("quizzes", quizId)}
        onViewStats={() => navigateTo("quiz-stats")}
        lang={lang}
      />
    );
  }

  if (activeTab === "quiz-leaderboard") {
    return (
      <QuizLeaderboard
        currentUser={currentUser}
        quizzes={QUIZ_DATABASE}
        onGoToQuizzes={() => navigateTo("quizzes")}
        lang={lang}
      />
    );
  }

  const titleInfo = TAB_TITLES[activeTab] || {
    en: activeTab.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    ta: activeTab,
  };

  return (
    <ComingSoonPage
      title={isTamil ? titleInfo.ta : titleInfo.en}
      category="Kaviyam Feature"
      onBack={() => navigateTo("home")}
      lang={lang}
    />
  );
}

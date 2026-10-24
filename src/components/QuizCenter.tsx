import React, { useState, useEffect } from "react";
import {
  Brain, Trophy, BarChart3, History, ChevronRight, Star, Filter,
  Search, Zap, BookOpen, Users, Clock, Target, Award
} from "lucide-react";
import { Quiz, QuizAttempt, User } from "../types";
import { Language } from "../utils/i18n";

interface QuizCenterProps {
  quizzes: Quiz[];
  currentUser: any;
  userAttempts?: any[];
  onSelectQuiz: (quizId: string) => void;
  onViewHistory?: () => void;
  onViewStats?: () => void;
  onViewLeaderboard?: () => void;
  onBack?: () => void;
  onGoogleLogin?: () => void;
  onStartQuiz?: (id: string) => void;
  lang?: any;
}

export default function QuizCenter({
  quizzes,
  currentUser,
  onSelectQuiz,
  onViewHistory,
  onViewStats,
  onViewLeaderboard,
  lang = "en"
}: QuizCenterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"newest" | "difficulty" | "name">("newest");

  // Load attempts from localStorage
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  useEffect(() => {
    try {
      const stored = localStorage.getItem("kaviyam_quiz_attempts");
      if (stored) setAttempts(JSON.parse(stored));
    } catch (_) {}
  }, []);

  const userAttempts = attempts.filter(a => a.userId === (currentUser?.id || "guest"));
  const completedQuizIds = new Set(userAttempts.filter(a => a.status === "completed").map(a => a.quizId));

  const categories = ["All", ...Array.from(new Set(quizzes.map(q => q.category)))];
  const difficulties = ["All", "Easy", "Medium", "Hard"];

  const filtered = quizzes
    .filter(q => {
      const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === "All" || q.category === selectedCategory;
      const matchesDiff = selectedDifficulty === "All" || q.difficulty === selectedDifficulty;
      return matchesSearch && matchesCat && matchesDiff;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.title.localeCompare(b.title);
      if (sortBy === "difficulty") {
        const order = { Easy: 0, Medium: 1, Hard: 2 };
        return (order[a.difficulty as keyof typeof order] || 0) - (order[b.difficulty as keyof typeof order] || 0);
      }
      return 0;
    });

  const diffColor = (d: string) => {
    if (d === "Easy") return "bg-emerald-100 text-emerald-700";
    if (d === "Medium") return "bg-amber-100 text-amber-700";
    return "bg-red-100 text-red-700";
  };

  const totalCompleted = completedQuizIds.size;
  const avgScore = userAttempts.length > 0
    ? Math.round(userAttempts.reduce((s, a) => s + (a.percentage || 0), 0) / userAttempts.length)
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#3B0B12] to-[#5C121E] rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-[#D4AF37]/20 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-serif">Quiz Center</h1>
            <p className="text-amber-200 text-sm">Test your Tamil literature knowledge</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Quizzes", value: quizzes.length, icon: BookOpen },
            { label: "Completed", value: totalCompleted, icon: Trophy },
            { label: "Avg Score", value: `${avgScore}%`, icon: Target },
            { label: "Attempts", value: userAttempts.length, icon: Zap },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
              <stat.icon className="w-4 h-4 text-[#D4AF37] mx-auto mb-1" />
              <div className="text-xl font-bold">{stat.value}</div>
              <div className="text-xs text-amber-200">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Nav */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "History", icon: History, onClick: onViewHistory },
          { label: "My Stats", icon: BarChart3, onClick: onViewStats },
          { label: "Leaderboard", icon: Trophy, onClick: onViewLeaderboard },
        ].map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-[#E2DDD5] hover:border-[#D4AF37] hover:bg-amber-50 transition-all shadow-sm"
          >
            <item.icon className="w-5 h-5 text-[#5C121E]" />
            <span className="text-xs font-semibold text-stone-700">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="bg-white rounded-xl border border-[#E2DDD5] p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search quizzes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-[#E2DDD5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="text-xs border border-[#E2DDD5] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40"
          >
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
          <select
            value={selectedDifficulty}
            onChange={e => setSelectedDifficulty(e.target.value)}
            className="text-xs border border-[#E2DDD5] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40"
          >
            {difficulties.map(d => <option key={d}>{d}</option>)}
          </select>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="text-xs border border-[#E2DDD5] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40"
          >
            <option value="newest">Default</option>
            <option value="name">A–Z</option>
            <option value="difficulty">By Difficulty</option>
          </select>
        </div>
        <p className="text-xs text-stone-400">{filtered.length} quiz{filtered.length !== 1 ? "zes" : ""} found</p>
      </div>

      {/* Quiz Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((quiz) => {
          const isCompleted = completedQuizIds.has(quiz.id);
          const bestAttempt = userAttempts
            .filter(a => a.quizId === quiz.id && a.status === "completed")
            .sort((a, b) => b.percentage - a.percentage)[0];
          return (
            <button
              key={quiz.id}
              onClick={() => onSelectQuiz(quiz.id)}
              className="text-left bg-white rounded-xl border border-[#E2DDD5] hover:border-[#D4AF37] hover:shadow-md transition-all overflow-hidden group"
            >
              <div className="h-2 bg-gradient-to-r from-[#3B0B12] to-[#D4AF37]" />
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-[#3B0B12] text-sm leading-tight group-hover:text-[#5C121E] line-clamp-2">
                    {quiz.title}
                  </h3>
                  {isCompleted && (
                    <span className="flex-shrink-0 w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Trophy className="w-3 h-3 text-emerald-600" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500 line-clamp-2">{quiz.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${diffColor(quiz.difficulty)}`}>
                    {quiz.difficulty}
                  </span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    {quiz.category}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {quiz.timeLimitMinutes}m
                  </span>
                  <span>{quiz.questions.length} questions</span>
                  {bestAttempt && (
                    <span className="text-emerald-600 font-semibold">{bestAttempt.percentage}%</span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-stone-400">
          <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No quizzes found matching your filters.</p>
          <button onClick={() => { setSearchQuery(""); setSelectedCategory("All"); setSelectedDifficulty("All"); }}
            className="mt-3 text-sm text-[#D4AF37] hover:underline">Clear filters</button>
        </div>
      )}
    </div>
  );
}

import React, { useState } from "react";
import { TrendingUp, Clock, BookOpen, Award, CheckCircle2, Flame, Calendar, Coins, Zap, Trophy, Gift, Users } from "lucide-react";
import { Language } from "../utils/i18n";

interface ProgressDashboardProps {
  lang: Language;
}

export default function ProgressDashboard({ lang }: ProgressDashboardProps) {
  const [coins, setCoins] = useState<number>(350);
  const [xp, setXp] = useState<number>(1250);
  const [claimedMissions, setClaimedMissions] = useState<string[]>([]);
  const [activeGamificationTab, setActiveGamificationTab] = useState<string>("missions");

  const stats = [
    {
      titleTa: "வாசித்த நேரங்கள்",
      titleEn: "Hours Read",
      value: "14.5 hrs",
      icon: Clock,
      color: "bg-amber-100 text-amber-800",
    },
    {
      titleTa: "படித்த பக்கங்கள்",
      titleEn: "Pages Completed",
      value: "420 pgs",
      icon: BookOpen,
      color: "bg-emerald-100 text-emerald-800",
    },
    {
      titleTa: "தொடர் நாட்கள் (Streak)",
      titleEn: "Current Streak",
      value: "7 Days 🔥",
      icon: Flame,
      color: "bg-orange-100 text-orange-800",
    },
    {
      titleTa: "முடிந்த நாவல்கள்",
      titleEn: "Completed Books",
      value: "2 Books",
      icon: CheckCircle2,
      color: "bg-blue-100 text-blue-800",
    },
  ];

  const weeklyActivity = [
    { day: "Mon", hrs: 1.5 },
    { day: "Tue", hrs: 2.0 },
    { day: "Wed", hrs: 1.0 },
    { day: "Thu", hrs: 2.5 },
    { day: "Fri", hrs: 3.0 },
    { day: "Sat", hrs: 2.2 },
    { day: "Sun", hrs: 2.3 },
  ];

  const missions = [
    { id: "daily-1", title: "Read 15 mins today", reward: 50, xp: 100, icon: "🎯", type: "Daily Mission" },
    { id: "weekly-1", title: "Complete 3 chapters", reward: 150, xp: 300, icon: "📅", type: "Weekly Challenge" },
    { id: "monthly-1", title: "Read 1 Classic Epic", reward: 500, xp: 1000, icon: "🏆", type: "Monthly Challenge" },
  ];

  const leaderboard = [
    { rank: 1, name: "Ilango Adigal Fan", xp: "4,850 XP", badge: "🥇 Sangam Legend" },
    { rank: 2, name: "Kalki Scholar", xp: "3,920 XP", badge: "🥈 Ponniyin Scholar" },
    { rank: 3, name: "You (Kaviyam Reader)", xp: `${xp} XP`, badge: "🥉 Chola Explorer" },
    { rank: 4, name: "Tamil Literary Lover", xp: "1,100 XP", badge: "Aadi Scholar" },
  ];

  const handleClaimReward = (id: string, rewardCoins: number, rewardXp: number) => {
    if (!claimedMissions.includes(id)) {
      setClaimedMissions([...claimedMissions, id]);
      setCoins(prev => prev + rewardCoins);
      setXp(prev => prev + rewardXp);
    }
  };

  return (
    <div className="space-y-8 font-sans pb-12">
      
      {/* Header with Kaviyam Coins & XP Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#3B0B12] via-[#4A0E17] to-[#5C121E] text-white p-6 rounded-3xl border border-[#D4AF37]/30 shadow-lg">
        <div>
          <h2 className="font-serif font-bold text-2xl text-white">
            {lang === "ta" ? "வாசிப்பு முன்னேற்ற புள்ளிவிவரங்கள்" : "Reading Missions & Level Rewards"}
          </h2>
          <p className="text-xs text-amber-100/80 mt-1">
            {lang === "ta"
              ? "உங்கள் தினசரி வாசிப்பு இலக்குகள், நாணயங்கள் மற்றும் பேட்ஜ்கள்"
              : "Level up your status, earn Kaviyam Coins, and conquer monthly challenges"}
          </p>
        </div>

        {/* Gamification Coins & Level Pill */}
        <div className="flex items-center gap-3 bg-black/30 backdrop-blur-md p-2.5 rounded-2xl border border-[#D4AF37]/40 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 text-[#D4AF37] border border-[#D4AF37]/50 text-xs font-extrabold">
            <Coins className="w-4 h-4 text-amber-400 animate-spin" />
            <span>💰 {coins} Coins</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/20 text-purple-200 border border-purple-400/50 text-xs font-extrabold">
            <Zap className="w-4 h-4 text-purple-300" />
            <span>⚡ {xp} XP (Lvl 5)</span>
          </div>
        </div>
      </div>

      {/* Top 4 Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="p-5 rounded-3xl bg-white border border-[#E2DDD5] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500 font-semibold">
                  {lang === "ta" ? stat.titleTa : stat.titleEn}
                </span>
                <div className={`p-2 rounded-2xl ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="font-serif font-bold text-2xl text-stone-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Weekly Activity Bar Chart */}
      <div className="p-6 rounded-3xl bg-white border border-[#E2DDD5] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-bold text-base text-[#3B0B12]">
            {lang === "ta" ? "இந்த வார வாசிப்பு நேரம்" : "Weekly Reading Activity"}
          </h3>
          <span className="text-xs font-semibold text-stone-500">Total: 14.5 hrs</span>
        </div>

        <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
          {weeklyActivity.map((item, i) => {
            const heightPercent = (item.hrs / 3.5) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[10px] text-stone-500 font-semibold">{item.hrs}h</span>
                <div
                  style={{ height: `${heightPercent}%` }}
                  className="w-full max-w-[36px] bg-gradient-to-t from-[#5C121E] to-[#8B1D2F] rounded-t-xl transition-all hover:brightness-110"
                />
                <span className="text-xs text-stone-600 font-medium">{item.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements / Badges Section */}
      <div className="p-6 rounded-3xl bg-amber-50/70 border border-amber-200/80 shadow-sm space-y-4">
        <h3 className="font-serif font-bold text-base text-[#3B0B12] flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-600" />
          <span>{lang === "ta" ? "பெறப்பட்ட விருதுகள் & பேட்ஜ்கள்" : "Unlocked Milestones & Badges"}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-amber-200 flex items-center gap-3">
            <span className="text-2xl">📚</span>
            <div>
              <p className="font-semibold text-xs text-stone-900">
                {lang === "ta" ? "முதல் வாசிப்பு" : "First Masterpiece"}
              </p>
              <p className="text-[10px] text-stone-500">Read 1st chapter of Ponniyin Selvan</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-amber-200 flex items-center gap-3">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="font-semibold text-xs text-stone-900">
                {lang === "ta" ? "7 நாட்கள் தொடர்" : "7-Day Streak"}
              </p>
              <p className="text-[10px] text-stone-500">Read every day for 1 week</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-amber-200 flex items-center gap-3">
            <span className="text-2xl">👑</span>
            <div>
              <p className="font-semibold text-xs text-stone-900">
                {lang === "ta" ? "சோழ வரலாற்று அறிஞர்" : "Chola Scholar"}
              </p>
              <p className="text-[10px] text-stone-500">Read over 10 hours of historical fiction</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

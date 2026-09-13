import React, { useState } from "react";
import { User as UserIcon, Mail, Calendar, BookOpen, Clock, Flame, Award, Shield, Settings, Bookmark } from "lucide-react";
import { User } from "../types";
import { Language, translations } from "../utils/i18n";

interface ProfileProps {
  currentUser: User | null;
  onSelectTab: (tab: string) => void;
  lang: Language;
}

export default function Profile({ currentUser, onSelectTab, lang }: ProfileProps) {
  const [activeSubTab, setActiveSubTab] = useState<"info" | "achievements" | "history">("info");
  const t = (key: keyof typeof translations["ta"]) => translations[lang][key] || key;

  if (!currentUser) return null;

  return (
    <div className="space-y-6 font-sans pb-12 max-w-4xl mx-auto">
      
      {/* Profile Header Card matching reference design */}
      <div className="p-8 rounded-3xl bg-white border border-[#E2DDD5] shadow-lg text-center sm:text-left flex flex-col sm:flex-row items-center gap-6">
        <img
          src={currentUser.profile.profilePhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"}
          alt={currentUser.username}
          className="w-24 h-24 rounded-full object-cover border-4 border-[#D4AF37] shadow-xl flex-shrink-0"
        />

        <div className="flex-1 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="font-serif text-2xl font-bold text-[#3B0B12]">{currentUser.username}</h1>
              <p className="text-xs text-stone-500">{currentUser.email}</p>
            </div>

            <button
              onClick={() => onSelectTab("settings")}
              className="px-4 py-2 rounded-xl bg-[#F7F2EB] text-[#3B0B12] text-xs font-bold border border-[#E2DDD5] hover:bg-[#3B0B12] hover:text-[#D4AF37] transition-all flex items-center justify-center gap-1.5"
            >
              <Settings className="w-4 h-4" />
              <span>{t("navSettings")}</span>
            </button>
          </div>

          <p className="text-xs text-stone-600 italic">
            "{currentUser.profile.bio}"
          </p>

          <span className="inline-block text-[10px] font-bold text-amber-900 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            {t("memberSince")} Jan 2026
          </span>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: t("booksReadCount"), val: "24", icon: BookOpen },
          { label: t("totalReadingTimeHours"), val: "48h 36m", icon: Clock },
          { label: t("chaptersCompletedCount"), val: "186", icon: Award },
          { label: t("currentStreakDays"), val: "12 Days", icon: Flame },
        ].map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="p-4 rounded-2xl bg-white border border-[#E2DDD5] text-center space-y-1">
              <Icon className="w-5 h-5 text-[#D4AF37] mx-auto" />
              <p className="font-serif font-bold text-lg text-[#3B0B12]">{s.val}</p>
              <span className="text-[10px] text-stone-500 font-semibold uppercase">{s.label}</span>
            </div>
          );
        })}
      </div>

      {/* Profile Details & Achievements */}
      <div className="p-6 rounded-3xl bg-white border border-[#E2DDD5] shadow-sm space-y-6">
        <div className="flex border-b border-[#E2DDD5] space-x-6 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab("info")}
            className={`pb-3 ${activeSubTab === "info" ? "border-b-2 border-[#3B0B12] text-[#3B0B12]" : "text-stone-400"}`}
          >
            {lang === "ta" ? "தனிப்பட்ட தகவல்" : "Personal Info"}
          </button>
          <button
            onClick={() => setActiveSubTab("achievements")}
            className={`pb-3 ${activeSubTab === "achievements" ? "border-b-2 border-[#3B0B12] text-[#3B0B12]" : "text-stone-400"}`}
          >
            {t("achievements")} (4)
          </button>
        </div>

        {activeSubTab === "info" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#FDFBF7] border border-[#E2DDD5] space-y-1">
              <span className="text-stone-400 font-bold uppercase text-[10px]">Email</span>
              <p className="font-bold text-stone-800">{currentUser.email}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#FDFBF7] border border-[#E2DDD5] space-y-1">
              <span className="text-stone-400 font-bold uppercase text-[10px]">Phone</span>
              <p className="font-bold text-stone-800">{currentUser.profile.phoneNumber || "+91 9876543210"}</p>
            </div>
          </div>
        )}

        {activeSubTab === "achievements" && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {[
              { title: "Scholarly Reader", desc: "Read Ponniyin Selvan", icon: "📜" },
              { title: "Night Owl", desc: "Read past midnight", icon: "🌙" },
              { title: "Streak Master", desc: "7 Days reading streak", icon: "🔥" },
              { title: "Tamil Scholar", desc: "AI Mastered 10 words", icon: "🎓" },
            ].map((badge, i) => (
              <div key={i} className="p-4 rounded-2xl bg-[#F7F2EB] border border-[#E2DDD5] space-y-1">
                <span className="text-3xl block">{badge.icon}</span>
                <h4 className="font-serif font-bold text-xs text-[#3B0B12]">{badge.title}</h4>
                <p className="text-[10px] text-stone-500">{badge.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

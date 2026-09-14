import React from "react";
import { TrendingUp, BookOpen, CheckCircle, Clock, Flame, Award, Calendar } from "lucide-react";
import { Language, translations } from "../utils/i18n";

interface ProgressDashboardProps {
  lang: Language;
}

export default function ProgressDashboard({ lang }: ProgressDashboardProps) {
  const t = (key: keyof typeof translations["ta"]) => translations[lang][key] || key;

  return (
    <div className="space-y-6 font-sans pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2DDD5] shadow-sm">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#3B0B12] flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[#D4AF37]" />
            <span>{t("navProgress")}</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            {lang === "ta" ? "உங்கள் வாசிப்புப் பழக்கம் மற்றும் சாதனைகளின் பகுப்பாய்வு" : "Track your reading habits, monthly statistics, and scholarship streak"}
          </p>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t("booksReadCount"), val: "24", icon: BookOpen, tag: "2 {lang === 'ta' ? 'இந்த மாதம்' : 'this month'}" },
          { label: t("chaptersCompletedCount"), val: "186", icon: CheckCircle, tag: "Top 5% reader" },
          { label: t("totalReadingTimeHours"), val: "48h 36m", icon: Clock, tag: "+5h this week" },
          { label: t("currentStreakDays"), val: "12 Days", icon: Flame, tag: "🔥 Active streak" },
        ].map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="p-5 rounded-2xl bg-white border border-[#E2DDD5] shadow-sm space-y-2">
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-xs font-semibold text-stone-600">{s.label}</span>
                <Icon className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <p className="font-serif text-2xl font-bold text-[#3B0B12]">{s.val}</p>
              <span className="text-[10px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-full inline-block">
                {s.tag}
              </span>
            </div>
          );
        })}
      </div>

      {/* Monthly Goals & Weekly Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white border border-[#E2DDD5] shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-lg text-[#3B0B12]">{t("weeklyActivity")}</h3>
          <div className="h-48 w-full pt-4 flex items-end justify-between gap-3 border-b border-[#E2DDD5] pb-2">
            {[
              { day: "Mon", val: 40 },
              { day: "Tue", val: 65 },
              { day: "Wed", val: 30 },
              { day: "Thu", val: 85 },
              { day: "Fri", val: 90 },
              { day: "Sat", val: 100 },
              { day: "Sun", val: 75 },
            ].map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex justify-center items-end h-32">
                  <div
                    className="w-full max-w-[24px] bg-[#3B0B12] hover:bg-[#D4AF37] rounded-t-lg transition-all"
                    style={{ height: `${d.val}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-stone-500">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 p-6 rounded-2xl bg-white border border-[#E2DDD5] shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-lg text-[#3B0B12]">{t("monthlyGoal")}</h3>
          <div className="p-4 rounded-xl bg-[#F7F2EB] border border-[#E2DDD5] space-y-3">
            <div className="flex justify-between text-xs font-bold text-stone-700">
              <span>Goal: 5 Books / month</span>
              <span className="text-[#3B0B12]">80%</span>
            </div>
            <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#D4AF37] to-[#3B0B12] w-4/5 rounded-full" />
            </div>
            <p className="text-[11px] text-stone-500">
              {lang === "ta" ? "இன்னும் 1 புத்தகம் படித்தால் மாதாந்திர இலக்கு முடிவடையும்!" : "Read 1 more book to achieve your monthly target!"}
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}

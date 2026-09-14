import React, { useState } from "react";
import { Trophy, Award, ArrowLeft, Medal, Users, Zap, Star } from "lucide-react";
import { QuizAttempt } from "../types";
import { Language } from "../utils/i18n";

interface QuizLeaderboardProps {
  userAttempts: QuizAttempt[];
  onBackToCenter: () => void;
  lang: Language;
}

export default function QuizLeaderboard({
  userAttempts,
  onBackToCenter,
  lang,
}: QuizLeaderboardProps) {
  // Base scholars localized if Tamil
  const baseLeaderboard = lang === "ta" ? [
    { rank: 1, name: "இளங்கோ அடிகள் அறிஞர்", xp: 4850, quizzesCompleted: 49, avgScore: 98, avatar: "👑" },
    { rank: 2, name: "கல்கி பொன்னியின் செல்வன் மாஸ்டர்", xp: 4200, quizzesCompleted: 42, avgScore: 95, avatar: "⚔️" },
    { rank: 3, name: "வள்ளுவர் அறிவு வாசகர்", xp: 3900, quizzesCompleted: 39, avgScore: 92, avatar: "📜" },
    { rank: 4, name: "சங்க இலக்கிய கவிதை நிபுணர்", xp: 3400, quizzesCompleted: 34, avgScore: 89, avatar: "🪕" },
    { rank: 5, name: "சோழ பேரரசு வரலாற்று ஆய்வாளர்", xp: 2900, quizzesCompleted: 29, avgScore: 86, avatar: "🏰" },
  ] : [
    { rank: 1, name: "Ilango Adigal Scholar", xp: 4850, quizzesCompleted: 49, avgScore: 98, avatar: "👑" },
    { rank: 2, name: "Kalki Ponniyin Master", xp: 4200, quizzesCompleted: 42, avgScore: 95, avatar: "⚔️" },
    { rank: 3, name: "Valluvar Wisdom Reader", xp: 3900, quizzesCompleted: 39, avgScore: 92, avatar: "📜" },
    { rank: 4, name: "Sangam Poetry Expert", xp: 3400, quizzesCompleted: 34, avgScore: 89, avatar: "🪕" },
    { rank: 5, name: "Chola Imperial Historian", xp: 2900, quizzesCompleted: 29, avgScore: 86, avatar: "🏰" },
  ];

  // Calculate current user stats from userAttempts
  const userTotalXP = userAttempts.reduce((acc, curr) => acc + curr.score, 0);
  const userQuizzesCount = userAttempts.length;
  const userAvgScore = userQuizzesCount > 0 ? Math.round(userTotalXP / userQuizzesCount) : 0;

  // Insert user entry
  const leaderboard = [...baseLeaderboard];
  if (userQuizzesCount > 0) {
    leaderboard.push({
      rank: 6,
      name: lang === "ta" ? "நீங்கள் (காவியம் அறிஞர்)" : "You (Kaviyam Scholar)",
      xp: userTotalXP,
      quizzesCompleted: userQuizzesCount,
      avgScore: userAvgScore,
      avatar: "🎓",
    });
  }

  // Sort by XP descending
  leaderboard.sort((a, b) => b.xp - a.xp);
  leaderboard.forEach((item, index) => {
    item.rank = index + 1;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 font-sans">
      {/* Back button */}
      <button
        onClick={onBackToCenter}
        className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-[#5C121E] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{lang === "ta" ? "வினாடி வினா மையத்திற்கு திரும்பு" : "Back to Quiz Center"}</span>
      </button>

      {/* Leaderboard Header Banner */}
      <div className="bg-gradient-to-r from-[#3B0B12] via-[#5C121E] to-[#1E0408] text-white p-6 sm:p-10 rounded-3xl border border-[#D4AF37]/40 shadow-xl space-y-4 text-center relative overflow-hidden">
        <div className="w-16 h-16 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-amber-300 flex items-center justify-center mx-auto shadow-inner">
          <Trophy className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-300">
            {lang === "ta" ? "உலகளாவிய அறிவு தரவரிசை" : "Global Knowledge Ranking"}
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-amber-50">
            {lang === "ta" ? "காவியம் வினாடி வினா தரவரிசைப் பட்டியல்" : "Kaviyam Quiz Leaderboard"}
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto">
            {lang === "ta"
              ? "சக வாசகர்களுடன் போட்டியிடுங்கள், ஒவ்வொரு சரியான பதிலுக்கும் எக்ஸ்பி (XP) புள்ளிகளைப் பெறுங்கள் மற்றும் புகழ் பெற்றோர் பட்டியலில் முதலிடம் வகியுங்கள்!"
              : "Compete with fellow readers, gain XP points per correct answer, and top the hall of fame!"}
          </p>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {leaderboard.slice(0, 3).map((player, idx) => (
          <div
            key={player.rank}
            className={`p-5 rounded-2xl border text-center space-y-3 relative overflow-hidden ${
              idx === 0
                ? "bg-gradient-to-b from-amber-50 to-amber-100/50 border-[#D4AF37] shadow-md"
                : idx === 1
                ? "bg-gradient-to-b from-slate-50 to-slate-100/50 border-slate-300 shadow-xs"
                : "bg-gradient-to-b from-amber-900/5 to-amber-900/10 border-amber-800/20 shadow-xs"
            }`}
          >
            <div className="text-3xl">{player.avatar}</div>
            <div className="space-y-1">
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                idx === 0 ? "bg-amber-400 text-amber-950" : idx === 1 ? "bg-slate-300 text-slate-900" : "bg-amber-700 text-amber-50"
              }`}>
                {lang === "ta" ? `தரம் #${player.rank}` : `Rank #${player.rank}`}
              </span>
              <h3 className="font-serif text-sm font-bold text-[#3B0B12] line-clamp-1">
                {player.name}
              </h3>
            </div>
            <div className="pt-2 border-t border-black/10 text-xs space-y-0.5">
              <div className="font-bold text-amber-900">
                {lang === "ta" ? `${player.xp} XP புள்ளிகள்` : `${player.xp} XP Points`}
              </div>
              <div className="text-[11px] text-stone-500">
                {lang === "ta"
                  ? `${player.quizzesCompleted} வினாடி வினாக்கள் • ${player.avgScore}% சராசரி`
                  : `${player.quizzesCompleted} Quizzes • ${player.avgScore}% Avg`}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-3xl border border-[#E2DDD5] shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between">
          <h3 className="font-serif text-base font-bold text-[#3B0B12] flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-700" />
            <span>{lang === "ta" ? "சிறந்த அறிஞர்கள் & வினாடி வினா வல்லுநர்கள்" : "Top Scholars & Quiz Masters"}</span>
          </h3>
          <span className="text-xs text-stone-500 font-medium">
            {lang === "ta" ? "நேரலையில் புதுப்பிக்கப்பட்டது" : "Updated Realtime"}
          </span>
        </div>

        <div className="divide-y divide-stone-100">
          {leaderboard.map((item) => {
            const isUser = item.name.includes("You") || item.name.includes("நீங்கள்");
            return (
              <div
                key={item.rank}
                className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                  isUser
                    ? "bg-amber-50/70 font-bold border-l-4 border-l-[#D4AF37]"
                    : "hover:bg-stone-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs shrink-0 ${
                    item.rank === 1
                      ? "bg-amber-400 text-amber-950"
                      : item.rank === 2
                      ? "bg-slate-300 text-slate-900"
                      : item.rank === 3
                      ? "bg-amber-700 text-amber-50"
                      : "bg-stone-100 text-stone-600"
                  }`}>
                    #{item.rank}
                  </span>

                  <div>
                    <h4 className="font-serif text-sm font-bold text-stone-900 flex items-center gap-1.5">
                      <span>{item.name}</span>
                      {isUser && (
                        <span className="text-[10px] bg-[#5C121E] text-white px-2 py-0.2 rounded-full">
                          {lang === "ta" ? "நீங்கள்" : "You"}
                        </span>
                      )}
                    </h4>
                    <span className="text-[11px] text-stone-500">
                      {lang === "ta"
                        ? `${item.quizzesCompleted} வினாடி வினாக்கள் முடிந்தது • ${item.avgScore}% சராசரி துல்லியம்`
                        : `${item.quizzesCompleted} Quizzes Completed • ${item.avgScore}% Avg Accuracy`}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-serif font-extrabold text-sm text-[#5C121E] flex items-center gap-1 justify-end">
                    <Zap className="w-3.5 h-3.5 text-amber-500 fill-current" />
                    <span>{item.xp} XP</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

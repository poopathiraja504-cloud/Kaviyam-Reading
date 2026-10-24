import React from "react";
import {
  Trophy,
  CheckCircle2,
  Clock,
  Zap,
  Target,
  Sparkles,
  Award,
  Play,
  RotateCcw,
} from "lucide-react";
import { WordFinderAttempt } from "../../types/wordFinder";
import { User } from "../../types";
import { Language } from "../../utils/i18n";

interface WordFinderStatsProps {
  currentUser: User | null;
  attempts: WordFinderAttempt[];
  onPlayPuzzle: (puzzleId: string) => void;
  lang: Language;
}

export default function WordFinderStats({
  currentUser,
  attempts,
  onPlayPuzzle,
  lang,
}: WordFinderStatsProps) {
  const isTamil = lang === "ta";

  const completedAttempts = attempts.filter((a) => a.status === "completed");
  const totalCompleted = completedAttempts.length;
  const totalWordsFound = attempts.reduce((acc, a) => acc + (a.wordsFound || 0), 0);
  const totalScore = completedAttempts.reduce((acc, a) => acc + (a.score || 0), 0);

  const avgTimeSeconds =
    completedAttempts.length > 0
      ? Math.round(
          completedAttempts.reduce(
            (acc, a) => acc + (a.timeTakenSeconds || (a as any).timeTaken || 0),
            0
          ) / completedAttempts.length
        )
      : 0;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs">
          <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold mb-1">
            <Trophy className="w-4 h-4 text-[#D4AF37]" />
            <span>{isTamil ? "நிறைவு செய்தவை" : "Completed"}</span>
          </div>
          <div className="text-2xl font-bold font-serif text-[#3B0B12]">
            {totalCompleted}
          </div>
          <p className="text-[10px] text-stone-400 mt-0.5">
            {isTamil ? "500 புதிர்களில்" : "of 500 total"}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs">
          <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold mb-1">
            <Target className="w-4 h-4 text-emerald-600" />
            <span>{isTamil ? "சொற்கள்" : "Words Found"}</span>
          </div>
          <div className="text-2xl font-bold font-serif text-[#3B0B12]">
            {totalWordsFound}
          </div>
          <p className="text-[10px] text-stone-400 mt-0.5">
            {isTamil ? "மொத்த கண்டுபிடிப்புகள்" : "across all puzzles"}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs">
          <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold mb-1">
            <Clock className="w-4 h-4 text-sky-600" />
            <span>{isTamil ? "சராசரி நேரம்" : "Avg. Time"}</span>
          </div>
          <div className="text-2xl font-bold font-serif text-[#3B0B12]">
            {avgTimeSeconds > 0 ? formatTime(avgTimeSeconds) : "--"}
          </div>
          <p className="text-[10px] text-stone-400 mt-0.5">
            {isTamil ? "ஒரு புதிருக்கு" : "per puzzle"}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs">
          <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold mb-1">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{isTamil ? "மொத்த புள்ளிகள்" : "Total Score"}</span>
          </div>
          <div className="text-2xl font-bold font-serif text-[#3B0B12]">
            {totalScore}
          </div>
          <p className="text-[10px] text-stone-400 mt-0.5">
            {isTamil ? "சேகரித்த புள்ளிகள்" : "points earned"}
          </p>
        </div>
      </div>

      {/* Recent History Table */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
        <h3 className="font-serif font-bold text-base text-[#3B0B12] mb-4">
          {isTamil ? "சமீபத்திய ஆட்டங்கள்" : "Recent Game History"}
        </h3>

        {attempts.length === 0 ? (
          <div className="p-8 text-center text-stone-500 text-xs">
            {isTamil
              ? "நீங்கள் இதுவரை புதிர்களை விளையாடவில்லை. புதிய புதிரைத் தொடங்கவும்!"
              : "No puzzle attempts yet. Start playing your first puzzle!"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-100 text-stone-400 font-semibold">
                  <th className="pb-3">{isTamil ? "புதிர்" : "Puzzle"}</th>
                  <th className="pb-3">{isTamil ? "நிலை" : "Status"}</th>
                  <th className="pb-3">{isTamil ? "சொற்கள்" : "Words"}</th>
                  <th className="pb-3">{isTamil ? "நேரம்" : "Time"}</th>
                  <th className="pb-3">{isTamil ? "மதிப்பெண்" : "Score"}</th>
                  <th className="pb-3 text-right">{isTamil ? "செயல்" : "Action"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {attempts.slice(0, 15).map((att) => (
                  <tr key={att.id} className="hover:bg-stone-50/60">
                    <td className="py-3 font-medium text-stone-800">
                      {att.titleTa || att.title || `Puzzle #${att.puzzleNumber || att.puzzleId}`}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          att.status === "completed"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {att.status === "completed" ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {isTamil ? "வெற்றி" : "Completed"}
                          </>
                        ) : (
                          isTamil ? "காலாவதி" : "Timed Out"
                        )}
                      </span>
                    </td>
                    <td className="py-3 text-stone-600">
                      {att.wordsFound} / {att.totalWords || 5}
                    </td>
                    <td className="py-3 text-stone-600">
                      {formatTime(att.timeTakenSeconds || (att as any).timeTaken || 0)}
                    </td>
                    <td className="py-3 font-bold text-[#5C121E]">
                      {att.score} pts
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => onPlayPuzzle(att.puzzleId)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5C121E] hover:underline"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>{isTamil ? "மீண்டும் ஆடுக" : "Play Again"}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

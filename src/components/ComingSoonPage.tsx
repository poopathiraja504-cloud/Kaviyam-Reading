import React from "react";
import { Sparkles, ArrowLeft, BookOpen, Clock, Compass } from "lucide-react";
import { Language } from "../utils/i18n";

interface ComingSoonPageProps {
  title: string;
  category?: string;
  description?: string;
  onBack: () => void;
  lang?: Language;
}

export default function ComingSoonPage({
  title,
  category = "Kaviyam Reading Feature",
  description = "We are currently perfecting this feature to bring you an extraordinary digital reading experience. Stay tuned for upcoming platform updates!",
  onBack,
  lang = "en"
}: ComingSoonPageProps) {
  return (
    <div className="min-h-[65vh] flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="w-full max-w-xl bg-gradient-to-b from-white to-[#FDFBF7] border border-[#E2DDD5] rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
        
        {/* Top Decorative Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#D4AF37]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#3B0B12]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Feature Icon Header */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#3B0B12] to-[#5C121E] p-0.5 mx-auto mb-6 shadow-lg">
          <div className="w-full h-full bg-[#3B0B12] rounded-[14px] flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-[#D4AF37] animate-pulse" />
          </div>
        </div>

        {/* Category Pill */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#3B0B12]/5 text-[#3B0B12] text-xs font-semibold uppercase tracking-wider mb-3">
          <Compass className="w-3.5 h-3.5 text-[#D4AF37]" />
          {category}
        </div>

        {/* Feature Title */}
        <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#3B0B12] mb-3">
          {title}
        </h2>

        {/* Description */}
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-8 max-w-md mx-auto">
          {description}
        </p>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-semibold mb-8">
          <Clock className="w-4 h-4 text-[#D4AF37]" />
          <span>{lang === "ta" ? "விரைவில் வருகிறது • Coming Soon" : "Feature Under Active Development"}</span>
        </div>

        {/* Action Button */}
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#3B0B12] to-[#5C121E] text-white text-xs font-bold shadow-md hover:brightness-110 transition-all duration-150"
          >
            <ArrowLeft className="w-4 h-4 text-[#D4AF37]" />
            <span>{lang === "ta" ? "முகப்பிற்குத் திரும்பு" : "Return to Dashboard"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}

import React from "react";
import { BookOpen, Sparkles, Star, ArrowRight, ShieldCheck, Heart } from "lucide-react";
import { Language } from "../utils/i18n";

interface PublicHeroProps {
  lang: Language;
  onBrowseBooks: () => void;
  onStartReading: () => void;
}

export default function PublicHero({ lang, onBrowseBooks, onStartReading }: PublicHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#3B0B12] via-[#5C121E] to-[#2A080D] text-white p-8 sm:p-12 mb-8 shadow-2xl border border-amber-900/30">
      
      {/* Background Decorative Graphic Pattern */}
      <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute right-10 top-10 w-40 h-40 rounded-full bg-red-500/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl space-y-6">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-amber-300/30 text-amber-200 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>{lang === "ta" ? "தமிழ் வரலாற்றுப் புதினங்கள் & காவியங்கள்" : "Classical Tamil Historical Epics"}</span>
        </div>

        {/* Hero Title */}
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight text-amber-50 drop-shadow-sm">
          {lang === "ta"
            ? "பொன்னியின் செல்வன் & தமிழ் காவியங்களின் பேரனுபவம்"
            : "Immerse Yourself in Timeless Tamil Literature & Masterpieces"}
        </h1>

        {/* Hero Description */}
        <p className="text-stone-300 text-xs sm:text-sm md:text-base leading-relaxed font-sans max-w-2xl">
          {lang === "ta"
            ? "கல்கியின் பொன்னியின் செல்வன், சிவகாமியின் சபதம், திருக்குறள் மற்றும் சங்க இலக்கியங்களை 3D புத்தக அமைப்பில், AI கேள்விகளுடன் நவீன டிஜிட்டல் வாசிப்பில் அனுபவியுங்கள்."
            : "Read Kalki's Ponniyin Selvan, Sivagamiyin Sabatham, Thirukkural, and classic epics with immersive 3D realistic book covers, AI chapter analysis, and audio reader mode."}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <button
            onClick={onStartReading}
            className="px-6 py-3 rounded-2xl bg-[#D4AF37] hover:bg-[#B89628] text-stone-950 font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>{lang === "ta" ? "உடனே வாசிக்கத் தொடங்குக" : "Start Reading Now"}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          <button
            onClick={onBrowseBooks}
            className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 backdrop-blur-md transition-all"
          >
            {lang === "ta" ? "நூலகத்தை பார்வையிடுக" : "Browse Tamil Library"}
          </button>
        </div>

        {/* Highlights Bar */}
        <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4 text-center sm:text-left">
          <div>
            <p className="font-serif font-bold text-lg sm:text-xl text-amber-300">100%</p>
            <p className="text-[10px] sm:text-xs text-stone-300 font-sans">
              {lang === "ta" ? "முழுமையான உரைகள்" : "Original Full Texts"}
            </p>
          </div>
          <div>
            <p className="font-serif font-bold text-lg sm:text-xl text-amber-300">AI Powered</p>
            <p className="text-[10px] sm:text-xs text-stone-300 font-sans">
              {lang === "ta" ? "காவியம் AI தோழன்" : "Gemini AI Novel Guide"}
            </p>
          </div>
          <div>
            <p className="font-serif font-bold text-lg sm:text-xl text-amber-300">Offline</p>
            <p className="text-[10px] sm:text-xs text-stone-300 font-sans">
              {lang === "ta" ? "உள் சேமிப்பு வசதி" : "Local Database Cache"}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

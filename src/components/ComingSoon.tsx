import React from "react";
import { Sparkles, ArrowLeft, BookOpen, Brain, Compass, HelpCircle, Trophy } from "lucide-react";

interface ComingSoonProps {
  featureId: string;
  featureName: string;
  onBackToHome: () => void;
  lang: "ta" | "en";
}

export default function ComingSoon({ featureId, featureName, onBackToHome, lang }: ComingSoonProps) {
  const isTa = lang === "ta";

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
      <div className="relative mb-6">
        {/* Decorative elements */}
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-700 opacity-20 blur-lg animate-pulse" />
        <div className="relative bg-[#5C121E] p-5 rounded-2xl border border-amber-300/30 text-amber-200 shadow-xl">
          <Sparkles className="w-10 h-10 animate-bounce" />
        </div>
      </div>

      <h2 className="font-serif text-3xl font-bold text-[#3B0B12] mb-3 leading-tight tracking-wide">
        {featureName}
      </h2>

      <p className="font-serif italic text-amber-800 text-sm mb-2 max-w-md">
        {isTa ? "“புதிய வாசிப்பு அனுபவம் விரைவில் உதயமாகிறது”" : "“A premium reading experience is taking shape”"}
      </p>

      <p className="text-stone-600 text-sm mb-8 max-w-md leading-relaxed">
        {isTa
          ? `${featureName} அம்சம் தற்போது வடிவமைப்பு நிலையில் உள்ளது. சிறந்த வாசிப்பு மற்றும் கற்றல் கருவிகளுடன் விரைவில் உங்களை வந்தடையும்.`
          : `The ${featureName} feature is currently being handcrafted to ensure a truly luxurious digital reading journey. Stay tuned for advanced tools and immersive resources.`}
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onBackToHome}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#5C121E] hover:bg-[#4A0E18] text-white font-serif text-xs font-bold shadow-md transition-all cursor-pointer border border-amber-500/20"
        >
          <ArrowLeft className="w-4 h-4 text-amber-200" />
          {isTa ? "முகப்பிற்குச் செல்" : "Back to Home"}
        </button>
      </div>
    </div>
  );
}

import React from "react";
import { BookOpen, Sparkles, TrendingUp, Volume2, Globe, Search, ArrowRight, Star, Shield, Award } from "lucide-react";
import { Language, translations } from "../utils/i18n";
import Book3D from "./Book3D";
import TiltCard from "./TiltCard";
import { PRESET_BOOKS } from "../booksData";

interface PublicHeroProps {
  lang: Language;
  onBrowseBooks: () => void;
  onStartReading: () => void;
}

export default function PublicHero({ lang, onBrowseBooks, onStartReading }: PublicHeroProps) {
  const t = (key: keyof typeof translations["ta"]) => translations[lang][key] || key;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#25060A] via-[#4A0E17] to-[#3B0B12] text-white border-b border-[#5C121E]">
      
      {/* Background Glows & Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-red-950/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Text */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5C121E]/80 border border-[#D4AF37]/40 shadow-inner">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs font-semibold tracking-wide text-amber-200">
                {lang === "ta" ? "நவீன தமிழ் வாசிப்பு அனுபவம்" : "Next-Gen Tamil Reading Experience"}
              </span>
            </div>

            {/* Hero Main Heading */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white drop-shadow-md">
              {lang === "ta" ? (
                <>
                  தமிழ் இலக்கியத்தின் <br />
                  <span className="bg-gradient-to-r from-[#FFE599] via-[#D4AF37] to-[#C5A059] bg-clip-text text-transparent">
                    மொழி முத்துக்கள்
                  </span>
                </>
              ) : (
                <>
                  Discover the Literary <br />
                  <span className="bg-gradient-to-r from-[#FFE599] via-[#D4AF37] to-[#C5A059] bg-clip-text text-transparent">
                    Treasures of Tamil
                  </span>
                </>
              )}
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base text-amber-100/80 max-w-2xl leading-relaxed font-sans mx-auto lg:mx-0">
              {t("heroSubtitle")}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onBrowseBooks}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#9A7B24] text-[#2A080E] font-bold text-sm shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 group"
              >
                <BookOpen className="w-4 h-4" />
                {t("browseBooks")}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onStartReading}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#2A080E]/70 hover:bg-[#3B0B12] text-amber-100 font-semibold text-sm border border-[#D4AF37]/40 shadow-md backdrop-blur-md active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                {t("startReading")}
              </button>
            </div>

            {/* Quick Stats Pill */}
            <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-amber-200/70 border-t border-[#5C121E]/60">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                <span><strong className="text-white">4.9/5</strong> Rating</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-[#D4AF37]" />
                <span><strong className="text-white">50,000+</strong> Active Readers</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#D4AF37]" />
                <span><strong className="text-white">100%</strong> Free & Open</span>
              </div>
            </div>

          </div>

          {/* Right Hero Visual — 3D bookshelf */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full max-w-md aspect-square rounded-3xl bg-gradient-to-b from-[#5C121E]/60 to-[#2A080E]/90 p-4 border border-[#D4AF37]/30 shadow-2xl overflow-hidden">
              <div className="absolute inset-0 opacity-30 mix-blend-overlay">
                <img
                  src="https://images.unsplash.com/photo-1608659597669-b45511779f93?auto=format&fit=crop&q=80&w=800"
                  alt="Tamil Heritage Temple"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#25060A] via-transparent to-[#3B0B12]/80" />

              <div className="relative z-10 text-center pt-3">
                <div className="inline-block px-4 py-2 rounded-2xl bg-[#3B0B12]/80 border border-[#D4AF37]/40 shadow-xl backdrop-blur-md">
                  <span className="text-2xl tracking-widest text-[#D4AF37] font-serif block">𑿀 ௐ 𑿀</span>
                  <p className="text-[10px] font-bold text-amber-100 tracking-wider uppercase mt-0.5">
                    {lang === "ta" ? "காவியம் தமிழ் நூலகம்" : "Kaviyam Tamil Archives"}
                  </p>
                </div>
              </div>

              <div className="hero-bookshelf z-10">
                <div className="hero-book hero-book-left">
                  <Book3D
                    coverUrl={PRESET_BOOKS[1]?.coverUrl || PRESET_BOOKS[0].coverUrl}
                    title={PRESET_BOOKS[1]?.title || PRESET_BOOKS[0].title}
                    tilt="none"
                  />
                </div>
                <div className="hero-book hero-book-center">
                  <Book3D
                    coverUrl={PRESET_BOOKS[0].coverUrl}
                    title={PRESET_BOOKS[0].title}
                    tilt="pointer"
                    float
                  />
                </div>
                <div className="hero-book hero-book-right">
                  <Book3D
                    coverUrl={PRESET_BOOKS[2]?.coverUrl || PRESET_BOOKS[0].coverUrl}
                    title={PRESET_BOOKS[2]?.title || PRESET_BOOKS[0].title}
                    tilt="none"
                  />
                </div>
                <div className="hero-shelf" />
              </div>
            </div>
          </div>

        </div>

        {/* 5 Feature Highlight Cards Bar (Bottom Row) */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
          {[
            { title: t("feature1Title"), desc: t("feature1Desc"), icon: BookOpen, tag: "5000+ Works" },
            { title: t("feature2Title"), desc: t("feature2Desc"), icon: Sparkles, tag: "Gemini AI" },
            { title: t("feature3Title"), desc: t("feature3Desc"), icon: TrendingUp, tag: "Analytics" },
            { title: t("feature4Title"), desc: t("feature4Desc"), icon: Volume2, tag: "Speech Audio" },
            { title: t("feature5Title"), desc: t("feature5Desc"), icon: Globe, tag: "தமிழ் | EN" },
          ].map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <TiltCard
                key={idx}
                className="p-3 sm:p-4 rounded-2xl bg-[#3B0B12]/70 hover:bg-[#5C121E]/80 border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 shadow-lg backdrop-blur-md"
                intensity={8}
              >
                <div className="w-8 h-8 rounded-xl bg-[#5C121E] flex items-center justify-center mb-2.5 border border-[#D4AF37]/30">
                  <Icon className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-white leading-snug">{feat.title}</h3>
                <p className="text-[11px] text-amber-200/60 mt-0.5 font-sans">{feat.desc}</p>
                <span className="inline-block mt-2 px-2 py-0.5 rounded text-[9px] font-semibold bg-[#25060A] text-[#D4AF37] border border-[#5C121E]">
                  {feat.tag}
                </span>
              </TiltCard>
            );
          })}
        </div>

      </div>
    </div>
  );
}

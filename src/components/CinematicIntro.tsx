import React, { useState, useEffect } from "react";
import { X, Play, Volume2, VolumeX, Sparkles, BookOpen, ChevronRight, Award } from "lucide-react";

interface CinematicIntroProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export default function CinematicIntro({ isOpen, onClose, onComplete }: CinematicIntroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const slides = [
    {
      titleTa: "செவ்வியல் தமிழ் காவியங்களின் புதையல்",
      titleEn: "The Treasury of Classical Tamil Epics",
      quoteTa: "யாதும் ஊரே யாவரும் கேளிர்; தீதும் நன்றும் பிறர்தர வாரா.",
      quoteAuthor: "– கணியன் பூங்குன்றனார்",
      description: "பொன்னியின் செல்வன், சிவகாமியின் சபதம், பார்த்திபன் கனவு, சிலப்பதிகாரம் மற்றும் திருக்குறளின் உன்னத உலகிற்கு நல்வரவு.",
      bgImage: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=1200",
    },
    {
      titleTa: "பொன்னியின் செல்வன் – வரலாற்றுப் பெருங்காவியம்",
      titleEn: "Ponniyin Selvan – The Legendary Chola Saga",
      quoteTa: "வந்தியத்தேவன், குந்தவை, அருள்மொழிவர்மன் மற்றும் நந்தினியின் வரலாற்றுச் சுழல்...",
      quoteAuthor: "– கல்கி கிருஷ்ணமூர்த்தி",
      description: "சோழப் பேரரசின் வீரமும் தியாகமும் நிறைந்த ஐந்து பாகங்களையும் அத்தியாயம் அத்தியாயமாக 3D புத்தக வடிவில் வாசியுங்கள்.",
      bgImage: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=1200",
    },
    {
      titleTa: "வினாடி வினாக்கள் & சொல் கண்டுபிடி",
      titleEn: "Quizzes, XP Progression & Word Finder",
      quoteTa: "கற்க கசடறக் கற்பவை கற்றபின் நிற்க அதற்குத் தக.",
      quoteAuthor: "– திருவள்ளுவர்",
      description: "500க்கும் மேற்பட்ட சொல் புதிர்கள், தமிழ் இலக்கிய வினாடி வினாக்கள் மற்றும் உடனடி சான்றிதழ்களைப் பெற்று மகிழுங்கள்.",
      bgImage: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=1200",
    },
  ];

  useEffect(() => {
    if (!isOpen || !isPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        if (prev < slides.length - 1) return prev + 1;
        return 0;
      });
    }, 6000);
    return () => clearInterval(interval);
  }, [isOpen, isPlaying, slides.length]);

  if (!isOpen) return null;

  const slide = slides[currentSlide];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-300 font-sans"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl h-[560px] sm:h-[620px] rounded-3xl overflow-hidden shadow-2xl border border-amber-500/40 flex flex-col justify-between text-white"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundImage: `linear-gradient(to top, rgba(35, 6, 12, 0.95), rgba(59, 11, 18, 0.75), rgba(20, 3, 6, 0.85)), url(${slide.bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Top Controls Bar */}
        <div className="relative z-10 p-4 sm:p-6 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-serif font-bold text-xs sm:text-sm tracking-wider uppercase text-amber-200">
              Kaviyam Reading • Cinematic Journey
            </span>
          </div>

          <button
            onClick={() => {
              if (onComplete) onComplete();
              onClose();
            }}
            className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white transition-colors cursor-pointer border border-white/20"
            title="Close / மூடுக"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Center Content Slide */}
        <div className="relative z-10 px-6 sm:px-12 py-6 space-y-4 max-w-2xl text-left animate-in fade-in slide-in-from-bottom-4 duration-500 key={currentSlide}">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>அத்தியாயம் {currentSlide + 1} / {slides.length}</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-4xl font-extrabold leading-tight text-amber-50 drop-shadow-md">
            {slide.titleTa}
          </h2>

          <p className="font-serif italic text-sm sm:text-base text-amber-200/90 border-l-2 border-amber-400 pl-3">
            "{slide.quoteTa}" <span className="text-xs text-amber-300/80 block mt-1">{slide.quoteAuthor}</span>
          </p>

          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-xl">
            {slide.description}
          </p>
        </div>

        {/* Bottom Navigation & Action Bar */}
        <div className="relative z-10 p-4 sm:p-6 bg-black/40 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Slide Dots Indicator */}
          <div className="flex items-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentSlide === idx ? "w-8 bg-amber-400" : "w-2 bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {currentSlide < slides.length - 1 ? (
              <button
                onClick={() => setCurrentSlide((prev) => prev + 1)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-400/50 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>அடுத்து (Next)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : null}

            <button
              onClick={() => {
                if (onComplete) onComplete();
                onClose();
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>வாசிக்கத் தொடங்குங்கள் (Enter Platform)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

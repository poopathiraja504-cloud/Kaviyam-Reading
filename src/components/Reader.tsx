import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Type,
  List,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { Book, Chapter } from "../types";
import { Language } from "../utils/i18n";

interface ReaderProps {
  book: Book;
  initialChapter?: number;
  onBack: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  lang: Language;
}

export default function Reader({
  book,
  initialChapter = 1,
  onBack,
  isBookmarked,
  onToggleBookmark,
  lang,
}: ReaderProps) {
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(
    Math.max(0, initialChapter - 1)
  );
  const [theme, setTheme] = useState<"light" | "sepia" | "dark">("sepia");
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg" | "xl">("md");
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [showTocDrawer, setShowTocDrawer] = useState<boolean>(false);

  const chapters: Chapter[] = book.chapters || [
    {
      id: "ch-1",
      number: 1,
      title: "அத்தியாயம் 1: ஆடித்திருநாள்",
      content:
        "ஆடி மாதத்து முதல் நாளில் சோழ நாட்டுப் பாதசாரிகளும் குதிரை வீரர்களும் காவேரி நதிக்கரையில் அணிவகுத்துச் சென்று கொண்டிருந்தனர். இளம் வீரன் வந்தியத்தேவன் தனது முறுக்குயர்ந்த குதிரையின் மீது அமர்ந்து காவேரியின் வெள்ளப் பெருக்கையும் கரையின் மருத மரங்களையும் ரசித்துக் கொண்டே பயணம் செய்தான்...\n\nவந்தியத்தேவனின் மனதிலே காஞ்சி நகரின் இளவரசர் ஆதித்த கரிகாலர் ஒப்படைத்த அந்த ஓலை பற்றிய நினைவுகள் அலைமோதின. கடம்பூர் சம்புவரையர் மாளிகைக்குச் சென்று அங்கு நடக்கும் இரகசியக் கூட்டத்தை உளவு பார்க்க வேண்டும் என்பதே அவனது கடமையாகும்.",
    },
    {
      id: "ch-2",
      number: 2,
      title: "அத்தியாயம் 2: வந்தியத்தேவன்",
      content:
        "குதிரை வேகமாகக் காவேரிக்கரையோரம் பாய்ந்தது. வழியெல்லாம் ஆடியிடும் மக்கள் கூட்டம், காவேரித் தாய்க்கு மலரிட்டு வணங்கும் காட்சி. வந்தியத்தேவனின் உள்ளத்தில் வீரமும் உற்சாகமும் பொங்கி வழிந்தன. அவனுக்குத் தெரியும், தன் பயணத்தில் பேரபாயங்கள் காத்திருக்கின்றன என்று...",
    },
  ];

  const currentChapter = chapters[currentChapterIndex] || chapters[0];

  // TTS Speech Synthesis simulation
  const toggleTTS = () => {
    if ("speechSynthesis" in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(currentChapter.content);
        utterance.lang = lang === "ta" ? "ta-IN" : "en-US";
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
        setIsPlayingAudio(true);
      }
    } else {
      alert("Text-to-Speech is not supported in this browser.");
    }
  };

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Theme style classes
  const themeStyles = {
    light: "bg-[#FFFFFF] text-stone-900 border-stone-200",
    sepia: "bg-[#FBF0D9] text-[#2B1B17] border-[#E5D5BC]",
    dark: "bg-[#1A1A1A] text-stone-200 border-stone-800",
  };

  const fontSizeClasses = {
    sm: "text-sm leading-relaxed",
    md: "text-base sm:text-lg leading-loose",
    lg: "text-lg sm:text-xl leading-loose",
    xl: "text-xl sm:text-2xl leading-loose",
  };

  return (
    <div className={`min-h-screen flex flex-col ${themeStyles[theme]} transition-colors duration-300 font-serif`}>
      
      {/* Top Controls Header */}
      <header className={`sticky top-0 z-30 px-4 sm:px-8 py-3 border-b flex items-center justify-between backdrop-blur-md bg-opacity-95 ${themeStyles[theme]}`}>
        
        {/* Left: Back Button & Book Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-black/10 transition-colors"
            title="Back to Book Details"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-serif font-bold text-xs sm:text-sm truncate max-w-[150px] sm:max-w-xs">
              {book.title}
            </h1>
            <p className="text-[10px] opacity-75 font-sans">
              {currentChapter ? currentChapter.title : `Chapter ${currentChapterIndex + 1}`}
            </p>
          </div>
        </div>

        {/* Right Controls: TOC, Font, Theme, TTS, Bookmark */}
        <div className="flex items-center gap-2 font-sans">
          
          {/* Table of Contents Button */}
          <button
            onClick={() => setShowTocDrawer(!showTocDrawer)}
            className="p-2 rounded-lg hover:bg-black/10 transition-colors text-xs font-semibold flex items-center gap-1"
            title="Table of Contents"
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">{lang === "ta" ? "பொருளடக்கம்" : "TOC"}</span>
          </button>

          {/* Theme Selector */}
          <div className="flex items-center bg-black/5 p-1 rounded-full text-xs">
            <button
              onClick={() => setTheme("light")}
              className={`p-1.5 rounded-full ${theme === "light" ? "bg-white text-black shadow-sm" : "opacity-60"}`}
              title="Light Theme"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme("sepia")}
              className={`p-1.5 rounded-full ${theme === "sepia" ? "bg-[#F3E5AB] text-[#3B0B12] shadow-sm" : "opacity-60"}`}
              title="Sepia Theme"
            >
              <Type className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`p-1.5 rounded-full ${theme === "dark" ? "bg-stone-800 text-white shadow-sm" : "opacity-60"}`}
              title="Dark Night Theme"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Font Size Adjuster */}
          <button
            onClick={() => {
              const sizes: ("sm" | "md" | "lg" | "xl")[] = ["sm", "md", "lg", "xl"];
              const nextIndex = (sizes.indexOf(fontSize) + 1) % sizes.length;
              setFontSize(sizes[nextIndex]);
            }}
            className="p-2 rounded-lg hover:bg-black/10 text-xs font-bold font-sans"
            title="Change Font Size"
          >
            A
          </button>

          {/* TTS Audio Read Out */}
          <button
            onClick={toggleTTS}
            className={`p-2 rounded-lg transition-colors ${isPlayingAudio ? "bg-[#5C121E] text-white" : "hover:bg-black/10"}`}
            title="Listen Audio TTS"
          >
            {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Bookmark Button */}
          <button
            onClick={onToggleBookmark}
            className={`p-2 rounded-lg transition-colors ${isBookmarked ? "text-amber-600" : "hover:bg-black/10 opacity-70"}`}
            title="Bookmark Chapter"
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
          </button>
        </div>

      </header>

      {/* Main Chapter Reader Content */}
      <main className="flex-1 max-w-3xl mx-auto px-6 py-10 w-full">
        {currentChapter && (
          <article className="space-y-6">
            <header className="text-center border-b border-black/10 pb-6 mb-8">
              <span className="text-xs font-sans font-bold uppercase tracking-widest opacity-60">
                {lang === "ta" ? `அத்தியாயம் ${currentChapter.number}` : `Chapter ${currentChapter.number}`}
              </span>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl mt-2 leading-tight">
                {currentChapter.title}
              </h2>
            </header>

            <div className={`${fontSizeClasses[fontSize]} whitespace-pre-line tracking-wide space-y-4`}>
              {currentChapter.content}
            </div>
          </article>
        )}
      </main>

      {/* Bottom Floating Navigation (Prev / Next Chapter) */}
      <footer className={`sticky bottom-0 border-t px-6 py-4 flex items-center justify-between backdrop-blur-md bg-opacity-95 ${themeStyles[theme]}`}>
        <button
          disabled={currentChapterIndex <= 0}
          onClick={() => setCurrentChapterIndex((prev) => Math.max(0, prev - 1))}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-black/20 text-xs font-semibold font-sans disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black/10 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{lang === "ta" ? "முந்தைய அத்தியாயம்" : "Previous Chapter"}</span>
        </button>

        <span className="text-xs font-sans font-medium opacity-70">
          {currentChapterIndex + 1} / {chapters.length}
        </span>

        <button
          disabled={currentChapterIndex >= chapters.length - 1}
          onClick={() => setCurrentChapterIndex((prev) => Math.min(chapters.length - 1, prev + 1))}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#5C121E] text-white text-xs font-semibold font-sans disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#3B0B12] transition-colors shadow-sm"
        >
          <span>{lang === "ta" ? "அடுத்த அத்தியாயம்" : "Next Chapter"}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </footer>

      {/* TOC Drawer Overlay */}
      {showTocDrawer && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end">
          <div className="w-80 max-w-full bg-white text-stone-900 h-full p-6 shadow-2xl overflow-y-auto space-y-4 font-sans">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif font-bold text-lg text-[#3B0B12]">
                {lang === "ta" ? "அத்தியாயங்கள்" : "Chapters"}
              </h3>
              <button onClick={() => setShowTocDrawer(false)} className="text-stone-500 hover:text-stone-900 font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {chapters.map((ch, idx) => (
                <button
                  key={ch.id || idx}
                  onClick={() => {
                    setCurrentChapterIndex(idx);
                    setShowTocDrawer(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl text-xs font-semibold transition-all ${
                    idx === currentChapterIndex
                      ? "bg-[#5C121E] text-white"
                      : "hover:bg-stone-100 text-stone-800"
                  }`}
                >
                  {ch.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

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
  onChapterComplete?: (chapterNumber: number) => void;
}

export default function Reader({
  book,
  initialChapter = 1,
  onBack,
  isBookmarked,
  onToggleBookmark,
  lang,
  onChapterComplete,
}: ReaderProps) {
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(
    Math.max(0, initialChapter - 1)
  );
  const [theme, setTheme] = useState<"light" | "sepia" | "dark" | "amber">("sepia");
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg" | "xl">("md");
  const [fontFamily, setFontFamily] = useState<"serif" | "sans" | "mono" | "dyslexic">("serif");
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [voiceLang, setVoiceLang] = useState<string>("ta-IN");
  const [showTocDrawer, setShowTocDrawer] = useState<boolean>(false);
  
  // Advanced reader features
  const [viewMode, setViewMode] = useState<"scroll" | "page">("scroll");
  const [isDistractionFree, setIsDistractionFree] = useState<boolean>(false);
  const [isReadingLight, setIsReadingLight] = useState<boolean>(false);
  const [showNoteModal, setShowNoteModal] = useState<boolean>(false);
  const [userNote, setUserNote] = useState<string>("");
  const [savedNotes, setSavedNotes] = useState<string[]>([]);
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Smart Reading AI Drawer states
  const [activeAiTool, setActiveAiTool] = useState<string | null>(null);

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

  const currentChapter = chapters[currentChapterIndex] || chapters[0] || {
    id: "ch-1",
    number: 1,
    title: lang === "ta" ? "அத்தியாயம் 1: ஆரம்பம்" : "Chapter 1: Introduction",
    content: book.description || (lang === "ta" ? "வாசிப்பு உரை..." : "Reading text..."),
  };

  // Estimated reading time left
  const wordCount = currentChapter.content.split(/\s+/).length;
  const minutesLeft = Math.max(1, Math.round(wordCount / 150));

  // TTS Speech Synthesis simulation with custom voice & playback speed
  const toggleTTS = () => {
    if ("speechSynthesis" in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(currentChapter.content);
        utterance.lang = voiceLang;
        utterance.rate = playbackSpeed;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
        setIsPlayingAudio(true);
      }
    } else {
      alert("Text-to-Speech is not supported in this browser.");
    }
  };

  const handleSaveNote = () => {
    if (userNote.trim()) {
      setSavedNotes([...savedNotes, userNote.trim()]);
      setUserNote("");
      setShowNoteModal(false);
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
    amber: "bg-[#2D1F15] text-[#F3E5AB] border-[#5A3E2B]",
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
      <header className={`sticky top-0 z-30 px-2.5 sm:px-8 py-2.5 border-b flex items-center justify-between backdrop-blur-md bg-opacity-95 gap-1.5 ${themeStyles[theme]}`}>
        
        {/* Left: Back Button & Book Title */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 shrink">
          <button
            onClick={onBack}
            className="p-1.5 sm:p-2 rounded-full hover:bg-black/10 transition-colors shrink-0"
            title="Back to Book Details"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="font-serif font-bold text-xs sm:text-sm truncate max-w-[80px] xs:max-w-[120px] sm:max-w-xs">
              {book.title}
            </h1>
            <p className="text-[9px] sm:text-[10px] opacity-75 font-sans truncate max-w-[80px] xs:max-w-[120px] sm:max-w-xs">
              {currentChapter?.title || `Chapter ${currentChapterIndex + 1}`}
            </p>
          </div>
        </div>

        {/* Right Controls: TOC, Font, Theme, TTS, Bookmark */}
        <div className="flex items-center gap-1 sm:gap-2 font-sans shrink-0 overflow-x-auto no-scrollbar py-0.5">
          
          {/* Table of Contents Button */}
          <button
            onClick={() => setShowTocDrawer(!showTocDrawer)}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-black/10 transition-colors text-xs font-semibold flex items-center gap-1 shrink-0"
            title="Table of Contents"
          >
            <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden md:inline">{lang === "ta" ? "பொருளடக்கம்" : "TOC"}</span>
          </button>

          {/* Theme Selector */}
          <div className="flex items-center bg-black/5 p-0.5 sm:p-1 rounded-full text-xs shrink-0">
            <button
              onClick={() => setTheme("light")}
              className={`p-1 sm:p-1.5 rounded-full ${theme === "light" ? "bg-white text-black shadow-sm" : "opacity-60"}`}
              title="Light Theme"
            >
              <Sun className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
            <button
              onClick={() => setTheme("sepia")}
              className={`p-1 sm:p-1.5 rounded-full ${theme === "sepia" ? "bg-[#F3E5AB] text-[#3B0B12] shadow-sm" : "opacity-60"}`}
              title="Sepia Theme"
            >
              <Type className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`p-1 sm:p-1.5 rounded-full ${theme === "dark" ? "bg-stone-800 text-white shadow-sm" : "opacity-60"}`}
              title="Dark Night Theme"
            >
              <Moon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>

          {/* Font Size Adjuster */}
          <button
            onClick={() => {
              const sizes: ("sm" | "md" | "lg" | "xl")[] = ["sm", "md", "lg", "xl"];
              const nextIndex = (sizes.indexOf(fontSize) + 1) % sizes.length;
              setFontSize(sizes[nextIndex]);
            }}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-black/10 text-xs font-bold font-sans shrink-0"
            title="Change Font Size"
          >
            A
          </button>

          {/* TTS Audio Read Out */}
          <button
            onClick={toggleTTS}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors shrink-0 ${isPlayingAudio ? "bg-[#5C121E] text-white" : "hover:bg-black/10"}`}
            title="Listen Audio TTS"
          >
            {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>

          {/* Bookmark Button */}
          <button
            onClick={onToggleBookmark}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors shrink-0 ${isBookmarked ? "text-amber-600" : "hover:bg-black/10 opacity-70"}`}
            title="Bookmark Chapter"
          >
            <Bookmark className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isBookmarked ? "fill-current" : ""}`} />
          </button>
        </div>

      </header>

      {/* Ambient Reading Light Warm Filter Overlay */}
      {isReadingLight && (
        <div className="fixed inset-0 pointer-events-none z-20 bg-amber-500/10 mix-blend-multiply" />
      )}

      {/* Main Chapter Reader Content */}
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6">
        
        {/* In-Reader Quick Toolbar (Exact snippet format requested) */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 px-1 font-sans no-scrollbar">
          <button
            onClick={onToggleBookmark}
            className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
              isBookmarked ? "bg-amber-500 text-stone-950 border-amber-400 shadow-xs" : "bg-black/5 hover:bg-black/10 border-black/10"
            }`}
          >
            <span>🔖 Bookmark</span>
          </button>

          <button
            onClick={() => setShowNoteModal(true)}
            className="px-3 py-1.5 rounded-full bg-black/5 hover:bg-black/10 border border-black/10 text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1"
          >
            <span>📝 Note ({savedNotes.length})</span>
          </button>

          <button
            onClick={() => setActiveAiTool(activeAiTool === "ai" ? null : "ai")}
            className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 text-black font-bold text-xs shadow-xs hover:brightness-110 transition-all shrink-0 cursor-pointer flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>✨ AI Tools</span>
          </button>

          <button
            onClick={toggleTTS}
            className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
              isPlayingAudio ? "bg-[#5C121E] text-white border-[#5C121E]" : "bg-black/5 hover:bg-black/10 border-black/10"
            }`}
          >
            <span>🎧 Listen ({playbackSpeed}x)</span>
          </button>

          <button
            onClick={() => setActiveAiTool("explain")}
            className="px-3 py-1.5 rounded-full bg-black/5 hover:bg-black/10 border border-black/10 text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1"
          >
            <span>💡 Explain</span>
          </button>

          <button
            onClick={() => setShowSearchModal(true)}
            className="px-3 py-1.5 rounded-full bg-black/5 hover:bg-black/10 border border-black/10 text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1"
          >
            <span>🔍 Search</span>
          </button>

          <button
            onClick={() => setActiveAiTool("progress")}
            className="px-3 py-1.5 rounded-full bg-black/5 hover:bg-black/10 border border-black/10 text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1"
          >
            <span>📊 Progress ({minutesLeft}m left)</span>
          </button>
        </div>

        {/* Smart Reading Buttons Strip (12 Requested Smart Buttons) */}
        {activeAiTool === "ai" && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#3B0B12] to-[#5C121E] text-white space-y-3 font-sans shadow-lg animate-fade-in border border-[#D4AF37]/30">
            <div className="flex items-center justify-between border-b border-amber-900/40 pb-2">
              <span className="font-serif font-bold text-xs text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Kaviyam Smart Reading Suite</span>
              </span>
              <button onClick={() => setActiveAiTool(null)} className="text-amber-200/60 hover:text-white text-xs">✕</button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
              <button onClick={() => setActiveAiTool("summary")} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-left font-semibold">
                🧠 Smart Summary
              </button>
              <button onClick={() => setActiveAiTool("ideas")} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-left font-semibold">
                💡 Key Ideas
              </button>
              <button onClick={() => setActiveAiTool("map")} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-left font-semibold">
                🗺️ Chapter Map
              </button>
              <button onClick={() => setActiveAiTool("guide")} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-left font-semibold">
                👥 Character Guide
              </button>
              <button onClick={() => setActiveAiTool("timeline")} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-left font-semibold">
                📖 Story Timeline
              </button>
              <button onClick={() => setActiveAiTool("topics")} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-left font-semibold">
                🔗 Related Topics
              </button>
              <button onClick={() => setActiveAiTool("connections")} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-left font-semibold">
                🧩 Story Connections
              </button>
              <button onClick={() => setActiveAiTool("quiz")} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-left font-semibold">
                ❓ Quiz Me
              </button>
              <button onClick={() => setActiveAiTool("test")} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-left font-semibold">
                🎯 Test Understanding
              </button>
              <button onClick={() => setActiveAiTool("questions")} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-left font-semibold">
                📝 Generate Questions
              </button>
              <button onClick={() => setActiveAiTool("chat")} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-left font-semibold">
                🗣️ Discuss with AI
              </button>
              <button onClick={() => setShowSearchModal(true)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-left font-semibold">
                🔍 Find in Book
              </button>
            </div>
          </div>
        )}

        {/* AI Output Panel */}
        {activeAiTool && activeAiTool !== "ai" && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-stone-900 font-sans space-y-2 animate-fade-in">
            <div className="flex items-center justify-between font-bold text-xs text-[#3B0B12]">
              <span className="capitalize">✨ Kaviyam AI: {activeAiTool}</span>
              <button onClick={() => setActiveAiTool(null)} className="text-stone-500 hover:text-stone-900">✕</button>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed font-serif">
              {activeAiTool === "summary" && `[Smart Summary] ${currentChapter.title} - This chapter establishes the initial historical setup, character dynamics, and journey along the Kaveri river banks.`}
              {activeAiTool === "explain" && `[Deep Explanation] "ஆடித்திருநாள்" refers to the Tamil month of Aadi festival. The narrative highlights Chola kingdom heritage and military movement.`}
              {activeAiTool === "quiz" && `[Chapter Quiz] Q1: Who is riding the horse along the Kaveri riverbank? A) Vandhiyathevan B) Aditya Karikalan`}
              {activeAiTool === "guide" && `[Character Guide] Vandhiyathevan (Warrior & Messenger), Aditya Karikalan (Crown Prince), Sambuvarayar (Chola Chieftain).`}
              {activeAiTool === "progress" && `[Reading Metrics] You are reading at 150 words/min. Estimated time to finish current chapter: ${minutesLeft} mins.`}
              {activeAiTool !== "summary" && activeAiTool !== "explain" && activeAiTool !== "quiz" && activeAiTool !== "guide" && activeAiTool !== "progress" && `AI analysis active for ${activeAiTool}. Processing literary text structure...`}
            </p>
          </div>
        )}

        {currentChapter && (
          <article className="space-y-6">
            <header className="text-center border-b border-black/10 pb-6 mb-8">
              <span className="text-xs font-sans font-bold uppercase tracking-widest opacity-60">
                {lang === "ta" ? `அத்தியாயம் ${currentChapter.number || currentChapterIndex + 1}` : `Chapter ${currentChapter.number || currentChapterIndex + 1}`}
              </span>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl mt-2 leading-tight">
                {currentChapter.title || (lang === "ta" ? `அத்தியாயம் ${currentChapterIndex + 1}` : `Chapter ${currentChapterIndex + 1}`)}
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
          onClick={() => {
            if (onChapterComplete) {
              onChapterComplete(currentChapterIndex + 1);
            }
            setCurrentChapterIndex((prev) => Math.min(chapters.length - 1, prev + 1));
          }}
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
                    if (onChapterComplete && idx !== currentChapterIndex) {
                      onChapterComplete(currentChapterIndex + 1);
                    }
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

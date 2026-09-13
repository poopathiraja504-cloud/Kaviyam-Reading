import React, { useState, useEffect, useRef } from "react";
import { 
  BookOpen, 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  Volume2, 
  VolumeX, 
  Sun, 
  Moon, 
  Sparkles, 
  List, 
  Type, 
  Maximize2, 
  Minimize2,
  Play,
  Pause,
  X
} from "lucide-react";
import { Book, Chapter } from "../types";
import { Language, translations } from "../utils/i18n";

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
  const [currentChapterIdx, setCurrentChapterIdx] = useState(
    Math.max(0, Math.min(initialChapter - 1, book.chapters.length - 1))
  );

  // Reader Customizations
  const [fontSize, setFontSize] = useState<number>(() => {
    const cached = localStorage.getItem("kaviyam_reader_fontsize");
    return cached ? parseInt(cached, 10) : 18;
  });

  const [readerTheme, setReaderTheme] = useState<"light" | "sepia" | "dark">(() => {
    const cached = localStorage.getItem("kaviyam_reader_theme");
    return (cached === "light" || cached === "sepia" || cached === "dark") ? cached : "sepia";
  });

  const [isChapterDrawerOpen, setIsChapterDrawerOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [aiAnalysisText, setAiAnalysisText] = useState<string | null>(null);
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);

  // TTS State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const t = (key: keyof typeof translations["ta"]) => translations[lang][key] || key;
  const chapter = book.chapters[currentChapterIdx] || book.chapters[0];

  useEffect(() => {
    localStorage.setItem("kaviyam_reader_fontsize", fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem("kaviyam_reader_theme", readerTheme);
  }, [readerTheme]);

  // TTS Control
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const handleToggleAudio = () => {
    if (!synthRef.current) return;

    if (isPlayingAudio) {
      synthRef.current.cancel();
      setIsPlayingAudio(false);
    } else {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(chapter.content);
      utterance.lang = lang === "ta" ? "ta-IN" : "en-US";
      utterance.rate = speechRate;

      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      synthRef.current.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  // AI Chapter Summary / Explanation
  const handleRunAiSummary = async () => {
    setIsAnalyzingAi(true);
    setAiAnalysisText(null);
    try {
      const response = await fetch("/api/gemini/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Summarize chapter "${chapter.chapterTitle}" and explain difficult words in Tamil. Context: ${chapter.content.substring(0, 800)}`,
        }),
      });
      const data = await response.json();
      setAiAnalysisText(data.result || "Chapter analysis generated successfully.");
    } catch (e: any) {
      setAiAnalysisText("AI service unavailable. Please check backend connection.");
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  // Theme CSS Classes
  const getThemeClass = () => {
    if (readerTheme === "dark") return "bg-[#171214] text-[#E6DEC6]";
    if (readerTheme === "sepia") return "bg-[#F4ECD8] text-[#382319]";
    return "bg-[#FFFDF9] text-[#2A1810]";
  };

  const progressPct = Math.round(((currentChapterIdx + 1) / book.chapters.length) * 100);

  return (
    <div className={`min-h-screen flex flex-col justify-between font-sans transition-colors duration-300 ${getThemeClass()}`}>
      
      {/* Reader Top Bar */}
      <header className={`sticky top-0 z-40 px-4 h-16 border-b flex items-center justify-between transition-colors ${
        readerTheme === "dark" ? "bg-[#1D0408] border-[#3B0B12]" : "bg-white/90 border-[#E2DDD5] backdrop-blur-md"
      }`}>
        {/* Back & Chapter Drawer Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#D4AF37]" />
          </button>

          <button
            onClick={() => setIsChapterDrawerOpen(!isChapterDrawerOpen)}
            className="flex items-center gap-2 p-2 rounded-xl border border-[#D4AF37]/30 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/10"
          >
            <List className="w-4 h-4 text-[#D4AF37]" />
            <span className="hidden sm:inline">{t("chaptersList")}</span>
          </button>
        </div>

        {/* Title Info */}
        <div className="text-center truncate max-w-xs sm:max-w-md">
          <h2 className="font-serif font-bold text-sm sm:text-base truncate">{book.title}</h2>
          <p className="text-[11px] opacity-70 truncate font-sans">
            {t("chapter")} {chapter.chapterNumber}: {chapter.chapterTitle}
          </p>
        </div>

        {/* Top Controls (Font Size, Theme, AI, Bookmark) */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Font Size Adjust */}
          <div className="flex items-center bg-black/5 dark:bg-white/10 rounded-full p-0.5 border border-black/10">
            <button
              onClick={() => setFontSize(Math.max(14, fontSize - 2))}
              className="px-2 py-1 text-xs font-bold hover:text-[#D4AF37]"
            >
              A-
            </button>
            <span className="text-[10px] font-mono opacity-70 px-1">{fontSize}px</span>
            <button
              onClick={() => setFontSize(Math.min(28, fontSize + 2))}
              className="px-2 py-1 text-xs font-bold hover:text-[#D4AF37]"
            >
              A+
            </button>
          </div>

          {/* Theme Switcher Pill */}
          <div className="hidden sm:flex items-center bg-black/5 dark:bg-white/10 rounded-full p-0.5 border border-black/10">
            <button
              onClick={() => setReaderTheme("light")}
              className={`px-2 py-1 text-[10px] font-bold rounded-full ${readerTheme === "light" ? "bg-white text-black shadow-xs" : ""}`}
            >
              {t("themeLight")}
            </button>
            <button
              onClick={() => setReaderTheme("sepia")}
              className={`px-2 py-1 text-[10px] font-bold rounded-full ${readerTheme === "sepia" ? "bg-[#F4ECD8] text-[#382319] shadow-xs" : ""}`}
            >
              {t("themeSepia")}
            </button>
            <button
              onClick={() => setReaderTheme("dark")}
              className={`px-2 py-1 text-[10px] font-bold rounded-full ${readerTheme === "dark" ? "bg-[#3B0B12] text-[#D4AF37] shadow-xs" : ""}`}
            >
              {t("themeDark")}
            </button>
          </div>

          {/* AI Chapter Assistant */}
          <button
            onClick={() => { setIsAiDrawerOpen(!isAiDrawerOpen); if (!aiAnalysisText) handleRunAiSummary(); }}
            className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 border border-amber-300/40 hover:brightness-110"
          >
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          </button>

          {/* Bookmark */}
          <button
            onClick={onToggleBookmark}
            className={`p-2 rounded-xl border transition-all ${
              isBookmarked
                ? "bg-[#D4AF37] text-[#3B0B12] border-[#D4AF37]"
                : "border-black/10 hover:bg-black/5 dark:hover:bg-white/10"
            }`}
          >
            <Bookmark className="w-4 h-4 fill-current" />
          </button>
        </div>
      </header>

      {/* Main Chapter Content Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-12">
        <div className="space-y-6">
          
          {/* Chapter Title Banner */}
          <div className="text-center pb-8 border-b border-black/10 dark:border-white/10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
              {t("chapter")} {chapter.chapterNumber}
            </span>
            <h1 className="font-serif text-2xl sm:text-4xl font-extrabold leading-tight">
              {chapter.chapterTitle}
            </h1>
          </div>

          {/* Tamil Reading Body */}
          <div
            style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
            className="font-serif drop-cap whitespace-pre-line text-justify tracking-normal"
          >
            {chapter.content}
          </div>

        </div>
      </main>

      {/* Bottom Reading Controls */}
      <footer className={`sticky bottom-0 z-40 px-4 py-3 border-t flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors ${
        readerTheme === "dark" ? "bg-[#1D0408] border-[#3B0B12]" : "bg-white/90 border-[#E2DDD5] backdrop-blur-md"
      }`}>
        
        {/* Previous Chapter */}
        <button
          onClick={() => setCurrentChapterIdx(Math.max(0, currentChapterIdx - 1))}
          disabled={currentChapterIdx === 0}
          className="w-full sm:w-auto px-4 py-2 rounded-xl border border-black/10 text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-30"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{t("previousChapter")}</span>
        </button>

        {/* Center Progress Slider */}
        <div className="flex-1 w-full max-w-md flex items-center gap-3">
          <span className="text-[10px] font-bold opacity-70">
            {currentChapterIdx + 1} / {book.chapters.length}
          </span>
          <div className="flex-1 h-2 bg-black/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#D4AF37] to-[#3B0B12] rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-[10px] font-bold text-[#D4AF37]">{progressPct}%</span>

          {/* TTS Play Button */}
          <button
            onClick={handleToggleAudio}
            className="p-2 rounded-full bg-[#3B0B12] text-[#D4AF37] hover:brightness-110 shadow-md ml-2"
          >
            {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>
        </div>

        {/* Next Chapter */}
        <button
          onClick={() => setCurrentChapterIdx(Math.min(book.chapters.length - 1, currentChapterIdx + 1))}
          disabled={currentChapterIdx === book.chapters.length - 1}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#3B0B12] text-[#D4AF37] text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-30 shadow-md"
        >
          <span>{t("nextChapter")}</span>
          <ChevronRight className="w-4 h-4" />
        </button>

      </footer>

      {/* Chapter Drawer Modal */}
      {isChapterDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-start">
          <div className="w-80 max-w-full h-full bg-[#3B0B12] text-white p-6 space-y-4 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#5C121E] pb-3">
              <h3 className="font-serif font-bold text-lg text-amber-100">{t("chaptersList")}</h3>
              <button onClick={() => setIsChapterDrawerOpen(false)}>
                <X className="w-5 h-5 text-amber-200/60 hover:text-white" />
              </button>
            </div>

            <div className="space-y-2">
              {book.chapters.map((ch, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentChapterIdx(idx);
                    setIsChapterDrawerOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl text-xs font-semibold transition-all ${
                    idx === currentChapterIdx
                      ? "bg-[#5C121E] text-[#D4AF37] border border-[#D4AF37]/40 font-bold"
                      : "text-amber-100/70 hover:bg-white/5"
                  }`}
                >
                  {ch.chapterNumber}. {ch.chapterTitle}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Drawer Modal */}
      {isAiDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">
          <div className="w-96 max-w-full h-full bg-[#2C080E] text-white p-6 space-y-4 shadow-2xl overflow-y-auto border-l border-[#5C121E]">
            <div className="flex items-center justify-between border-b border-[#5C121E] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-serif font-bold text-lg text-amber-100">{t("aiAssistantTitle")}</h3>
              </div>
              <button onClick={() => setIsAiDrawerOpen(false)}>
                <X className="w-5 h-5 text-amber-200/60 hover:text-white" />
              </button>
            </div>

            {isAnalyzingAi ? (
              <div className="p-8 text-center space-y-3">
                <Sparkles className="w-8 h-8 text-[#D4AF37] animate-spin mx-auto" />
                <p className="text-xs text-amber-200/80">
                  {lang === "ta" ? "அத்தியாயத்தைச் பகுப்பாய்வு செய்கிறது..." : "Analyzing chapter with Gemini AI..."}
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-xs text-amber-100/90 leading-relaxed font-sans">
                <div className="p-4 rounded-xl bg-[#3B0B12] border border-[#5C121E] space-y-2">
                  <span className="font-bold text-[#D4AF37] uppercase tracking-wider block text-[10px]">
                    {t("aiSummarize")}
                  </span>
                  <p>{aiAnalysisText}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

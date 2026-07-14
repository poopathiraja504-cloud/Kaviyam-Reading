import { Book, Chapter, Review } from "../types";
import { ChevronLeft, ChevronRight, Settings, MessageSquare, Star, ArrowLeft, Loader2, Send, Languages, BookOpen, Sparkles, Moon, Sun } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { audioSynth } from "../utils/audioSynth";

interface ReaderProps {
  book: Book;
  onBackToLibrary: () => void;
  currentUser: any;
  onAddReview: (bookId: string, rating: number, comment: string) => void;
  downloadedBookIds?: string[];
  onToggleDownload?: (bookId: string) => void;
  isOfflineMode?: boolean;
}

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
}

export default function Reader({
  book,
  onBackToLibrary,
  currentUser,
  onAddReview,
  downloadedBookIds = [],
  onToggleDownload = () => {},
  isOfflineMode = false,
}: ReaderProps) {
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg" | "xl">("base");
  const [theme, setTheme] = useState<"paper" | "sepia" | "dark">("paper");
  const [showSettings, setShowSettings] = useState(false);
  const [showCompanion, setShowCompanion] = useState(false);

  // Night Mode overrides system and local theme settings with a high-contrast dark theme
  const [isNightMode, setIsNightMode] = useState<boolean>(() => {
    const cached = localStorage.getItem("kaviyam_reader_night_mode");
    return cached ? JSON.parse(cached) : false;
  });

  const toggleNightMode = () => {
    const nextVal = !isNightMode;
    setIsNightMode(nextVal);
    localStorage.setItem("kaviyam_reader_night_mode", JSON.stringify(nextVal));
  };

  // Voice Narration States
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [ambientMood, setAmbientMood] = useState<string>("off");

  // Review System
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");

  // AI Companion Chat State
  const [companionInput, setCompanionInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isCompanionLoading, setIsCompanionLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const activeChapter: Chapter = book.chapters[currentChapterIdx] || { 
    chapterNumber: 1, 
    chapterTitle: "Opening", 
    content: "No content available." 
  };

  // Initialize browser speech voices & handle cleanup
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        // Pre-select a Tamil or English voice
        const tamilVoice = voices.find(v => v.lang.includes("ta"));
        const englishVoice = voices.find(v => v.lang.includes("en"));
        setSelectedVoice(tamilVoice || englishVoice || voices[0] || null);
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      audioSynth.stop();
    };
  }, []);

  // Cancel speech when chapter changes
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, [currentChapterIdx]);

  const paragraphs = activeChapter.content.split("\n\n").filter(p => p.trim() !== "");

  const handleSpeak = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      alert("Speech Synthesis is not supported in this browser context.");
      return;
    }

    if (isSpeaking) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
      return;
    }

    window.speechSynthesis.cancel();
    
    // Combine chapter title and text content
    const plainText = `${activeChapter.chapterTitle}. ${paragraphs.join(" ")}`;
    const utterance = new SpeechSynthesisUtterance(plainText);
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.rate = speechRate;

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    setIsPaused(false);
  };

  const handleStopSpeaking = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  useEffect(() => {
    // Reset reader position on book change
    setCurrentChapterIdx(0);
    setChatHistory([
      {
        sender: "ai",
        text: `Greetings! I am Kaviyam AI, your reading assistant. I can summarize "${book.title}", clarify difficult terms, discuss character motivations, or even translate chapters! What shall we talk about?`,
      },
    ]);
  }, [book]);

  useEffect(() => {
    // Scroll companion chat to bottom
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Please login first to leave a review.");
      return;
    }
    if (!userComment.trim()) return;

    onAddReview(book.id, userRating, userComment);
    setUserComment("");
    alert("Thank you for your rating and review!");
  };

  const handleSendCompanionMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companionInput.trim()) return;

    const userText = companionInput;
    setCompanionInput("");
    setChatHistory((prev) => [...prev, { sender: "user", text: userText }]);
    setIsCompanionLoading(true);

    try {
      const serverHistory = chatHistory.map((m) => ({
        role: m.sender === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      }));

      const res = await fetch("/api/gemini/companion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          contextBook: { title: book.title, description: book.description },
          contextChapter: activeChapter,
          history: serverHistory,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to contact companion.");
      }

      setChatHistory((prev) => [...prev, { sender: "ai", text: data.reply }]);
    } catch (err: any) {
      console.error(err);
      setChatHistory((prev) => [
        ...prev,
        { sender: "ai", text: "My apologies. I had trouble weaving a response. Please double-check your Gemini API key in the Secrets panel." },
      ]);
    } finally {
      setIsCompanionLoading(false);
    }
  };

  const handleTriggerSummary = async () => {
    setIsCompanionLoading(true);
    setChatHistory((prev) => [...prev, { sender: "user", text: "Please summarize this chapter." }]);
    try {
      const res = await fetch("/api/gemini/companion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Please write a concise 3-sentence plot summary for the active chapter and suggest 2 discussion questions.",
          contextBook: { title: book.title, description: book.description },
          contextChapter: activeChapter,
          history: [],
        }),
      });

      const data = await res.json();
      setChatHistory((prev) => [...prev, { sender: "ai", text: data.reply || "Could not generate summary." }]);
    } catch (err) {
      setChatHistory((prev) => [...prev, { sender: "ai", text: "Failed to summarize. Check network connections." }]);
    } finally {
      setIsCompanionLoading(false);
    }
  };

  const handleTriggerTranslate = async (langCode: string) => {
    setIsCompanionLoading(true);
    setChatHistory((prev) => [...prev, { sender: "user", text: `Please translate this chapter into ${langCode}.` }]);
    try {
      const res = await fetch("/api/gemini/companion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Translate the active chapter context content beautifully into ${langCode}. Only return the translation, no commentary.`,
          contextBook: { title: book.title, description: book.description },
          contextChapter: activeChapter,
          history: [],
        }),
      });

      const data = await res.json();
      setChatHistory((prev) => [...prev, { sender: "ai", text: data.reply || "Could not translate." }]);
    } catch (err) {
      setChatHistory((prev) => [...prev, { sender: "ai", text: "Failed to translate chapter." }]);
    } finally {
      setIsCompanionLoading(false);
    }
  };

  // Safe splitting of paragraphs for editorial drop cap

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px] text-left" id="reader-root">
      
      {/* Main Reader Stage */}
      <div className={`lg:col-span-${showCompanion ? '8' : '12'} flex flex-col justify-between rounded-3xl border transition-all duration-300 shadow-sm ${
        isNightMode ? "bg-black border-stone-900 text-stone-100" :
        theme === "paper" ? "bg-[#fbfaf7] border-stone-200 text-stone-900" :
        theme === "sepia" ? "bg-[#f5ebd0] border-[#decba5] text-stone-900" :
        "bg-[#14120f] border-stone-800 text-stone-100"
      }`} id="reader-stage">
        
        {/* Navigation / Header */}
        <div className={`p-4 border-b flex justify-between items-center ${
          isNightMode ? "border-stone-900 bg-black/95 text-stone-100" :
          theme === "paper" ? "border-stone-200/80 bg-white/80 text-stone-900" :
          theme === "sepia" ? "border-[#decba5] bg-[#ece2c0]/80 text-stone-900" :
          "border-stone-800 bg-[#1c1a16]/80 text-stone-100"
        } backdrop-blur-md sticky top-0 z-10 rounded-t-3xl`}>
          <button
            onClick={onBackToLibrary}
            className="flex items-center gap-2 text-xs font-bold transition hover:opacity-85"
            id="reader-back-btn"
          >
            <ArrowLeft size={14} className="text-[#bfa030]" />
            Back to Library
          </button>

          <span className="font-serif text-xs font-extrabold italic tracking-tight line-clamp-1 max-w-[150px] md:max-w-md">
            {book.title}
          </span>

          <div className="flex items-center gap-1.5">
            {/* Night Mode Toggle Button */}
            <button
              onClick={toggleNightMode}
              className={`p-2 rounded-xl transition-all duration-200 border ${
                isNightMode
                  ? "bg-amber-500 text-stone-950 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                  : theme === "dark" ? "hover:bg-stone-800 border-stone-800 text-stone-400" : "hover:bg-stone-100 border-stone-200 text-stone-600"
              }`}
              id="reader-night-toggle-header"
              title={isNightMode ? "Switch to Day Mode" : "Switch to Night Mode (High Contrast)"}
            >
              {isNightMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-xl transition ${
                showSettings 
                  ? "bg-stone-200 text-stone-800" 
                  : theme === "dark" || isNightMode ? "hover:bg-stone-800 text-stone-400" : "hover:bg-stone-100 text-stone-600"
              }`}
              id="reader-settings-btn"
              title="Aesthetic Adjustments"
            >
              <Settings size={15} />
            </button>
            <button
              onClick={() => setShowCompanion(!showCompanion)}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold shadow-sm ${
                showCompanion 
                  ? "bg-[#bfa030] text-black scale-105" 
                  : theme === "dark" || isNightMode
                    ? "bg-stone-800 text-[#bfa030] hover:bg-stone-700" 
                    : "bg-white text-stone-800 border border-stone-200 hover:bg-stone-50"
              }`}
              id="reader-companion-toggle"
            >
              <MessageSquare size={13} />
              AI Companion
            </button>
          </div>
        </div>

        {/* Reader Settings Drawer */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`px-6 py-4 border-b flex flex-col md:flex-row gap-4 justify-between items-start md:items-center text-xs overflow-hidden ${
                isNightMode ? "border-stone-900 bg-stone-950 text-stone-300" :
                theme === "paper" ? "border-stone-200 bg-stone-50/80" :
                theme === "sepia" ? "border-[#decba5] bg-[#eae0c2]" :
                "border-stone-800 bg-[#1c1a16]"
              }`}
              id="reader-settings-panel"
            >
              {/* Theme Selector */}
              <div className="flex items-center gap-3">
                <span className="font-bold text-stone-500 uppercase tracking-wider text-[10px]">Theme</span>
                <div className="flex gap-1">
                  {(["paper", "sepia", "dark"] as const).map((t) => (
                    <button
                      key={t}
                      disabled={isNightMode}
                      onClick={() => setTheme(t)}
                      className={`px-3.5 py-1.5 rounded-lg border text-[11px] font-bold transition-all capitalize ${
                        isNightMode
                          ? "border-stone-900 bg-stone-950 text-stone-600 cursor-not-allowed"
                          : theme === t
                            ? "border-[#bfa030] bg-white text-stone-900 shadow-sm"
                            : theme === "dark"
                              ? "border-stone-800 bg-stone-900 text-stone-400 hover:text-white"
                              : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Night Mode Toggle Control */}
              <div className="flex items-center gap-3">
                <span className="font-bold text-stone-500 uppercase tracking-wider text-[10px]">Night Mode</span>
                <button
                  onClick={toggleNightMode}
                  className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                    isNightMode
                      ? "bg-amber-500 text-stone-950 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                      : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
                  }`}
                  id="settings-night-mode-toggle"
                >
                  {isNightMode ? (
                    <>
                      <Sun size={12} className="text-stone-950" />
                      <span>Night Mode On</span>
                    </>
                  ) : (
                    <>
                      <Moon size={12} className="text-stone-500" />
                      <span>Night Mode Off</span>
                    </>
                  )}
                </button>
              </div>

              {/* Font Sizer */}
              <div className="flex items-center gap-3">
                <span className="font-bold text-stone-500 uppercase tracking-wider text-[10px]">Font Size</span>
                <div className="flex gap-1">
                  {(["sm", "base", "lg", "xl"] as const).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setFontSize(sz)}
                      className={`w-9 h-8 rounded-lg border uppercase font-mono text-[11px] font-bold transition-all flex items-center justify-center ${
                        fontSize === sz
                          ? "border-[#bfa030] bg-stone-900 text-white shadow-sm"
                          : theme === "dark" || isNightMode
                            ? "border-stone-800 bg-stone-900 text-stone-400 hover:text-white"
                            : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice Narration Option */}
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center border-t sm:border-t-0 sm:border-l border-stone-200/40 pt-3 sm:pt-0 sm:pl-4">
                <span className="font-bold text-stone-500 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Voice Reader
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleSpeak}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 ${
                      isSpeaking
                        ? isPaused 
                          ? "bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-200" 
                          : "bg-amber-500 text-white animate-pulse"
                        : theme === "dark" 
                          ? "bg-stone-800 text-stone-300 hover:bg-stone-700 border border-stone-700" 
                          : "bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200"
                    }`}
                  >
                    <span>{isSpeaking ? (isPaused ? "▶️ Resume" : "⏸️ Pause") : "🔊 Listen Mode"}</span>
                  </button>

                  {isSpeaking && (
                    <button
                      type="button"
                      onClick={handleStopSpeaking}
                      className="px-2.5 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold transition border border-red-200"
                    >
                      Stop
                    </button>
                  )}

                  {/* Speech Rate Speed */}
                  <select
                    value={speechRate}
                    onChange={(e) => {
                      const rate = parseFloat(e.target.value);
                      setSpeechRate(rate);
                      if (isSpeaking) {
                        handleStopSpeaking();
                        setTimeout(() => handleSpeak(), 100);
                      }
                    }}
                    className={`px-2 py-1 text-[11px] rounded border ${
                      theme === "dark" 
                        ? "bg-stone-900 border-stone-800 text-stone-300" 
                        : "bg-white border-stone-200 text-stone-700"
                    } font-mono`}
                  >
                    <option value="0.75">0.75x</option>
                    <option value="1">1.0x</option>
                    <option value="1.25">1.25x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2">2.0x</option>
                  </select>

                  {/* Voice Selector */}
                  {availableVoices.length > 0 && (
                    <select
                      value={selectedVoice?.name || ""}
                      onChange={(e) => {
                        const voice = availableVoices.find(v => v.name === e.target.value);
                        if (voice) {
                          setSelectedVoice(voice);
                          if (isSpeaking) {
                            handleStopSpeaking();
                            setTimeout(() => handleSpeak(), 100);
                          }
                        }
                      }}
                      className={`max-w-[130px] px-2 py-1 text-[11px] rounded border ${
                        theme === "dark" 
                          ? "bg-stone-900 border-stone-800 text-stone-300" 
                          : "bg-white border-stone-200 text-stone-700"
                      } truncate`}
                    >
                      {availableVoices.map((v) => (
                        <option key={v.name} value={v.name}>
                          {v.name} ({v.lang})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Ambient Voice Mood Option */}
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center border-t sm:border-t-0 sm:border-l border-stone-200/40 pt-3 sm:pt-0 sm:pl-4">
                <span className="font-bold text-stone-500 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <span>🎵 Voice Mood Sound</span>
                </span>
                <div className="flex gap-1.5 flex-wrap">
                  {([
                    { id: "off", label: "Off" },
                    { id: "drone", label: "🧘 Zen" },
                    { id: "bell", label: "🔔 Bells" },
                    { id: "wind", label: "🎋 Flute" },
                    { id: "rain", label: "🌧️ Rain" }
                  ] as const).map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setAmbientMood(m.id);
                        audioSynth.playMood(m.id);
                      }}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all border ${
                        ambientMood === m.id
                          ? "border-[#bfa030] bg-stone-950 text-white shadow-sm"
                          : theme === "dark"
                            ? "border-stone-800 bg-stone-900 text-stone-400 hover:text-white"
                            : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Story Text Stage */}
        <div className="flex-1 p-6 md:p-12 max-w-2xl mx-auto space-y-6 leading-relaxed select-text" id="reader-text-container">
          <div className="text-center space-y-3">
            <span className="text-[10px] tracking-wider uppercase font-mono font-bold text-[#bfa030]">
              Chapter {activeChapter.chapterNumber} of {book.chapters.length}
            </span>
            <h1 className={`font-serif text-3xl md:text-4xl font-bold tracking-tight ${
              isNightMode ? "text-stone-100" : "text-stone-900 dark:text-white"
            }`}>
              {activeChapter.chapterTitle}
            </h1>
            <div className="w-12 h-1 bg-[#bfa030] mx-auto mt-4 rounded-full" />
          </div>

          <div className={`leading-loose whitespace-pre-line text-left transition-all duration-300 space-y-6 ${
            fontSize === "sm" ? "text-sm" :
            fontSize === "base" ? "text-base" :
            fontSize === "lg" ? "text-lg md:text-[19px]" :
            "text-xl md:text-2xl"
          }`} id="reader-body-text">
            {paragraphs.map((p, idx) => (
              <p
                key={idx}
                className={`font-serif tracking-normal leading-loose text-justify ${
                  isNightMode ? "text-stone-200" :
                  theme === "dark" ? "text-stone-200" : "text-stone-800"
                } ${idx === 0 ? "drop-cap" : ""}`}
              >
                {p}
              </p>
            ))}
          </div>
        </div>

        {/* Footer controls */}
        <div className={`p-4 border-t flex justify-between items-center ${
          isNightMode ? "border-stone-900 bg-black/50" :
          theme === "paper" ? "border-stone-200 bg-stone-50/50" :
          theme === "sepia" ? "border-[#decba5] bg-[#e7dbb9]/50" :
          "border-stone-800 bg-[#1c1a16]/50"
        }`}>
          <button
            disabled={currentChapterIdx === 0}
            onClick={() => setCurrentChapterIdx(currentChapterIdx - 1)}
            className="flex items-center gap-1.5 text-xs font-bold hover:opacity-80 disabled:opacity-30 disabled:pointer-events-none transition-all"
            id="reader-prev-chapter"
          >
            <ChevronLeft size={16} className="text-[#bfa030]" />
            Previous
          </button>

          <span className="text-xs font-mono text-stone-500 font-bold uppercase tracking-wider">
            Chapter {currentChapterIdx + 1} / {book.chapters.length}
          </span>

          <button
            disabled={currentChapterIdx >= book.chapters.length - 1}
            onClick={() => setCurrentChapterIdx(currentChapterIdx + 1)}
            className="flex items-center gap-1.5 text-xs font-bold hover:opacity-80 disabled:opacity-30 disabled:pointer-events-none transition-all"
            id="reader-next-chapter"
          >
            Next
            <ChevronRight size={16} className="text-[#bfa030]" />
          </button>
        </div>

        {/* Reviews and Ratings Section */}
        <div className={`p-6 md:p-8 border-t rounded-b-3xl ${
          theme === "paper" ? "border-stone-200 bg-white" :
          theme === "sepia" ? "border-[#decba5] bg-[#ece5cb]" :
          "border-stone-800 bg-[#181613]"
        }`} id="reader-comments-section">
          
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif font-bold text-base flex items-center gap-2 text-stone-800 dark:text-white">
                <MessageSquare size={16} className="text-[#bfa030]" />
                Reviews & Analytical Remarks
              </h3>
              <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-[#bfa030]">
                {book.reviews.length} reviews
              </span>
            </div>

            {/* Review form */}
            {currentUser ? (
              <form onSubmit={handleReviewSubmit} className="space-y-4 bg-stone-50/50 dark:bg-white/5 p-5 rounded-2xl border border-stone-200/60 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-700 dark:text-stone-300 font-bold">Leave your scholarly rating:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setUserRating(star)}
                        className="text-stone-300 hover:text-[#bfa030] transition"
                        id={`star-rating-btn-${star}`}
                      >
                        <Star size={18} className={star <= userRating ? "fill-[#bfa030] text-[#bfa030]" : ""} />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="relative">
                  <textarea
                    required
                    rows={3}
                    placeholder="Share your thoughts on characters, plot twists, historical context, or prose style..."
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    className="w-full p-3 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:border-[#bfa030] text-stone-800 leading-relaxed font-serif shadow-inner"
                    id="user-comment-textarea"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-stone-900 hover:bg-stone-800 text-white font-bold px-5 py-2 rounded-xl text-xs transition shadow-sm"
                    id="comment-submit-btn"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-stone-100/50 dark:bg-white/5 border border-stone-200/60 dark:border-white/10 rounded-xl p-4 text-center text-xs text-stone-500 mb-6 font-serif">
                Please sign in or register to submit a rating and leave a review.
              </div>
            )}

            {/* Reviews list */}
            <div className="space-y-4 divide-y divide-stone-100 dark:divide-white/5">
              {book.reviews.length === 0 ? (
                <p className="text-xs text-stone-400 italic font-serif py-4">No reviews yet. Be the first to analyze this masterpiece!</p>
              ) : (
                book.reviews.map((rev, idx) => (
                  <div key={rev.id} className={`text-xs flex gap-3 text-left pt-4 ${idx === 0 ? 'pt-0' : ''}`}>
                    <img
                      src={rev.userPhoto}
                      alt=""
                      className="w-9 h-9 rounded-full object-cover border border-stone-200"
                      referrerPolicy="no-referrer"
                    />
                    <div className="space-y-1.5 flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-stone-800 dark:text-stone-200">{rev.username}</span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={11} className={i < rev.rating ? "fill-current text-[#bfa030]" : "text-stone-300"} />
                        ))}
                      </div>
                      <p className="text-stone-600 dark:text-stone-300 font-serif leading-relaxed text-justify">{rev.comment}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI COMPANION SIDE DRAWER PANEL */}
      {showCompanion && (
        <div className="lg:col-span-4 flex flex-col h-[650px] lg:h-[800px] border border-stone-200 bg-white rounded-3xl shadow-sm overflow-hidden" id="ai-companion-drawer">
          {/* Header */}
          <div className="p-4 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-left">
              <div className="p-1.5 bg-[#bfa030]/10 rounded-lg text-[#bfa030]">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="font-serif text-xs font-extrabold text-stone-800">Kaviyam AI Companion</h3>
                <p className="text-[9px] text-stone-400 font-mono uppercase tracking-wider">Literary Analyst</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowCompanion(false)}
              className="text-stone-400 hover:text-stone-600 text-xs font-bold"
              id="close-companion-btn"
            >
              Close
            </button>
          </div>

          {/* Quick Actions Panel */}
          <div className="p-3 bg-amber-50/30 border-b border-stone-100 flex flex-wrap gap-1.5 text-left justify-start">
            <span className="text-[9px] font-mono font-bold text-amber-800 uppercase tracking-wider block w-full mb-1">AI Prompt Shortcuts:</span>
            
            <button
              onClick={handleTriggerSummary}
              disabled={isCompanionLoading}
              className="px-2.5 py-1 bg-white border border-stone-200 rounded-lg text-[10px] font-bold text-stone-600 hover:border-[#bfa030] transition flex items-center gap-1 shadow-sm"
              id="shortcut-summary"
            >
              <BookOpen size={10} className="text-[#bfa030]" />
              Summarize
            </button>

            <button
              onClick={() => handleTriggerTranslate("French")}
              disabled={isCompanionLoading}
              className="px-2.5 py-1 bg-white border border-stone-200 rounded-lg text-[10px] font-bold text-stone-600 hover:border-[#bfa030] transition flex items-center gap-1 shadow-sm"
              id="shortcut-translate-fr"
            >
              <Languages size={10} className="text-[#bfa030]" />
              French
            </button>

            <button
              onClick={() => handleTriggerTranslate("Spanish")}
              disabled={isCompanionLoading}
              className="px-2.5 py-1 bg-white border border-stone-200 rounded-lg text-[10px] font-bold text-stone-600 hover:border-[#bfa030] transition flex items-center gap-1 shadow-sm"
              id="shortcut-translate-es"
            >
              <Languages size={10} className="text-[#bfa030]" />
              Spanish
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-stone-50/40" id="companion-chat-messages">
            {chatHistory.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col max-w-[85%] text-left ${
                  m.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                <span className="text-[8px] font-mono font-bold text-stone-400 uppercase tracking-wider mb-0.5">
                  {m.sender === "user" ? "You" : "Kaviyam AI"}
                </span>
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed font-serif shadow-sm ${
                    m.sender === "user"
                      ? "bg-stone-900 text-white rounded-tr-none"
                      : "bg-[#fdfcf7] text-stone-800 rounded-tl-none border border-stone-200"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {isCompanionLoading && (
              <div className="flex items-center gap-2 text-xs text-stone-400 italic">
                <Loader2 size={12} className="animate-spin text-[#bfa030]" />
                <span>Kaviyam AI is synthesizing...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat input */}
          <form onSubmit={handleSendCompanionMessage} className="p-3 bg-stone-50 border-t border-stone-100 flex gap-2">
            <input
              type="text"
              placeholder="Ask me about the characters or lore..."
              value={companionInput}
              onChange={(e) => setCompanionInput(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-stone-200 bg-white rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#bfa030]"
              id="companion-chat-input"
            />
            <button
              type="submit"
              disabled={isCompanionLoading || !companionInput}
              className="bg-stone-900 hover:bg-stone-800 text-white p-2 rounded-xl transition disabled:opacity-40"
              id="companion-send-btn"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

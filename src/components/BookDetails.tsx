import React, { useState } from "react";
import { BookOpen, Star, Bookmark, Play, ArrowLeft, Volume2, MessageSquare, Share2, Clock, Check } from "lucide-react";
import { Book, Chapter, Review } from "../types";
import { Language, translations } from "../utils/i18n";
import Book3D from "./Book3D";

interface BookDetailsProps {
  book: Book;
  onBack: () => void;
  onStartReading: (chapterNum?: number) => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  lang: Language;
}

export default function BookDetails({
  book,
  onBack,
  onStartReading,
  isBookmarked,
  onToggleBookmark,
  lang,
}: BookDetailsProps) {
  const [activeTab, setActiveTab] = useState<"about" | "chapters" | "reviews">("about");
  const t = (key: keyof typeof translations["ta"]) => translations[lang][key] || key;

  return (
    <div className="space-y-6 font-sans pb-12 max-w-6xl mx-auto">
      
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-semibold text-[#5C121E] hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{lang === "ta" ? "நூலகத்திற்கு திரும்பு" : "Back to Library"}</span>
      </button>

      {/* Main Details Hero Card (Cover on Left, Metadata on Right) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E2DDD5] shadow-lg grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Book Cover (4 Cols) */}
        <div className="md:col-span-4 flex flex-col items-center">
          <div className="w-full max-w-xs">
            <Book3D
              coverUrl={book.coverUrl}
              title={book.title}
              size="lg"
              tilt="pointer"
              overlay={
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[#D4AF37] text-xs font-bold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{book.rating.toFixed(1)}</span>
                </div>
              }
            />
          </div>
        </div>

        {/* Book Info & Actions (8 Cols) */}
        <div className="md:col-span-8 flex flex-col justify-between space-y-6">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#F7F2EB] text-[#3B0B12] text-xs font-bold uppercase tracking-wider">
                {book.genre}
              </span>
              {book.isCustomAI && (
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                  ✨ AI Curated
                </span>
              )}
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#3B0B12]">
              {book.title}
            </h1>

            <p className="text-sm font-semibold text-stone-600">
              {lang === "ta" ? "ஆசிரியர்:" : "Author:"} <span className="text-[#5C121E] font-bold">{book.author}</span>
            </p>

            {/* Metrics bar */}
            <div className="flex items-center gap-6 text-xs text-stone-600 pt-2 border-y border-stone-100 py-3">
              <div>
                <span className="block text-[10px] text-stone-400 font-bold uppercase">{t("rating")}</span>
                <span className="font-serif text-base font-bold text-stone-900">{book.rating} ★ ({book.ratingCount})</span>
              </div>
              <div className="w-px h-8 bg-stone-200" />
              <div>
                <span className="block text-[10px] text-stone-400 font-bold uppercase">{t("chapters")}</span>
                <span className="font-serif text-base font-bold text-stone-900">{book.chapters.length}</span>
              </div>
              <div className="w-px h-8 bg-stone-200" />
              <div>
                <span className="block text-[10px] text-stone-400 font-bold uppercase">{t("readers")}</span>
                <span className="font-serif text-base font-bold text-stone-900">12.5K+</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans pt-2">
              {book.description}
            </p>
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => onStartReading(1)}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#4A0E17] via-[#5C121E] to-[#3B0B12] text-[#D4AF37] font-bold text-sm shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{t("startReadingNow")}</span>
            </button>

            <button
              onClick={onToggleBookmark}
              className={`px-6 py-3.5 rounded-xl font-semibold text-xs border transition-all flex items-center gap-2 ${
                isBookmarked
                  ? "bg-[#D4AF37] text-[#3B0B12] border-[#D4AF37]"
                  : "bg-white text-stone-800 border-[#E2DDD5] hover:bg-stone-50"
              }`}
            >
              <Bookmark className="w-4 h-4 fill-current" />
              <span>{isBookmarked ? t("inMyBooks") : t("addToMyBooks")}</span>
            </button>
          </div>

        </div>

      </div>

      {/* Detail Tabs (About, Chapters, Reviews) */}
      <div className="p-6 rounded-3xl bg-white border border-[#E2DDD5] shadow-sm space-y-6">
        
        {/* Tab Switcher */}
        <div className="flex border-b border-[#E2DDD5] space-x-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab("about")}
            className={`pb-3 transition-colors ${
              activeTab === "about" ? "border-b-2 border-[#3B0B12] text-[#3B0B12]" : "text-stone-400 hover:text-stone-700"
            }`}
          >
            {t("aboutBook")}
          </button>
          <button
            onClick={() => setActiveTab("chapters")}
            className={`pb-3 transition-colors ${
              activeTab === "chapters" ? "border-b-2 border-[#3B0B12] text-[#3B0B12]" : "text-stone-400 hover:text-stone-700"
            }`}
          >
            {t("chaptersList")} ({book.chapters.length})
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-3 transition-colors ${
              activeTab === "reviews" ? "border-b-2 border-[#3B0B12] text-[#3B0B12]" : "text-stone-400 hover:text-stone-700"
            }`}
          >
            {t("reviews")} ({book.reviews.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "about" && (
          <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed font-sans">
            <h3 className="font-serif font-bold text-lg text-[#3B0B12]">
              {lang === "ta" ? "இலக்கியக் குறிப்பு" : "Literary Significance"}
            </h3>
            <p>
              {book.description}
            </p>
            <div className="p-4 rounded-2xl bg-[#F7F2EB] border border-[#E2DDD5] space-y-2">
              <span className="font-bold text-[#3B0B12] text-xs uppercase tracking-wider block">
                {lang === "ta" ? "சிறப்பம்சங்கள்" : "Key Highlights"}
              </span>
              <ul className="list-disc list-inside space-y-1 text-xs text-stone-600">
                <li>{lang === "ta" ? "இருமொழித் தமிழ் உரை வசதி" : "Dual-language Tamil text support"}</li>
                <li>{lang === "ta" ? "குரல் வாசிப்பு ஒலி வசதி" : "Text-to-Speech audio capability"}</li>
                <li>{lang === "ta" ? "AI அத்தியாயச் சுருக்கம் மற்றும் கடின வார்த்தை விளக்கம்" : "AI powered chapter summarization and glossary"}</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === "chapters" && (
          <div className="space-y-2">
            {book.chapters.map((ch, idx) => (
              <div
                key={idx}
                onClick={() => onStartReading(ch.chapterNumber)}
                className="p-4 rounded-xl bg-white hover:bg-[#FDFBF7] border border-[#E2DDD5] hover:border-[#D4AF37] cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F7F2EB] text-[#3B0B12] font-bold text-xs flex items-center justify-center font-serif group-hover:bg-[#3B0B12] group-hover:text-[#D4AF37] transition-colors">
                    {ch.chapterNumber}
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-stone-900 text-sm group-hover:text-[#3B0B12]">
                      {ch.chapterTitle}
                    </h4>
                    <span className="text-[11px] text-stone-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      ~5 mins read
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="p-2 rounded-lg bg-[#F7F2EB] text-[#3B0B12] group-hover:bg-[#3B0B12] group-hover:text-[#D4AF37] transition-colors"
                  >
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-4">
            {book.reviews.length === 0 ? (
              <p className="text-xs text-stone-500 italic">
                {lang === "ta" ? "இன்னும் விமர்சனங்கள் இல்லை." : "No reviews yet. Be the first to review!"}
              </p>
            ) : (
              book.reviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-xl bg-[#FDFBF7] border border-[#E2DDD5] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src={rev.userPhoto} alt={rev.username} className="w-7 h-7 rounded-full object-cover" />
                      <span className="font-bold text-xs text-stone-900">{rev.username}</span>
                    </div>
                    <div className="flex items-center text-[#D4AF37] text-xs">
                      {"★".repeat(rev.rating)}
                    </div>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed font-sans">{rev.comment}</p>
                </div>
              ))
            )}
          </div>
        )}

      </div>

    </div>
  );
}

import React, { useState } from "react";
import { BookOpen, Star, Bookmark, Play, Sparkles, TrendingUp, Plus, Award, ChevronRight } from "lucide-react";
import { Book } from "../types";
import { Language } from "../utils/i18n";
import Book3D from "./Book3D";

interface TamilDashboardProps {
  books: Book[];
  onSelectBook: (bookId: string) => void;
  bookmarks: string[];
  onToggleBookmark: (bookId: string) => void;
  onAddCustomBook?: (book: Book) => void;
  lang: Language;
}

export default function TamilDashboard({
  books,
  onSelectBook,
  bookmarks,
  onToggleBookmark,
  onAddCustomBook,
  lang,
}: TamilDashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Daily Thirukkural Sample
  const dailyKural = {
    number: 391,
    coupletTa: "கற்க கசடறக் கற்பவை கற்றபின்\nநிற்க அதற்குத் தக.",
    translationEn: "Learn thoroughly whatever you learn; after learning, abide by what you have learned.",
    meaningTa: "கற்கத் தகுந்த நூல்களைக் குற்றமறக் கற்க வேண்டும்; கற்ற பிறகு அக்கல்வியின் வழி நடக்க வேண்டும்.",
  };

  const categories = [
    { id: "all", labelTa: "அனைத்தும்", labelEn: "All Books" },
    { id: "historical", labelTa: "வரலாற்று நாவல்கள்", labelEn: "Historical Fiction" },
    { id: "epics", labelTa: "காவியங்கள்", labelEn: "Epics" },
    { id: "sangam", labelTa: "சங்க இலக்கியம்", labelEn: "Sangam Literature" },
  ];

  const featuredBooks = books.slice(0, 6);

  return (
    <div className="space-y-8 font-sans pb-12">
      
      {/* Daily Thirukkural Feature Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-amber-50/80 border border-amber-200/80 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-2 text-[#5C121E] font-serif font-bold text-sm mb-3">
          <Award className="w-4 h-4 text-amber-600" />
          <span>{lang === "ta" ? "இன்றைய திருக்குறள் (குறள் 391)" : "Thirukkural of the Day (Couplet 391)"}</span>
        </div>
        
        <p className="font-serif text-lg sm:text-xl font-bold text-[#3B0B12] leading-relaxed whitespace-pre-line mb-2">
          {dailyKural.coupletTa}
        </p>

        <p className="text-xs sm:text-sm text-stone-700 italic font-sans mb-3">
          "{dailyKural.meaningTa}"
        </p>

        <div className="pt-3 border-t border-amber-200/60 text-[11px] text-stone-500 font-sans">
          <span>English: {dailyKural.translationEn}</span>
        </div>
      </div>

      {/* Featured Masterpieces Carousel / Section Header */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-serif font-bold text-2xl text-[#3B0B12]">
              {lang === "ta" ? "பிரபலமான தமிழ் நாவல்கள்" : "Featured Tamil Classics"}
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              {lang === "ta"
                ? "வாசகர்களால் அதிகம் படிக்கப்பட்ட அழியா வரலாற்றுப் படைப்புகள்"
                : "Top recommended classical novels and epic sagas"}
            </p>
          </div>
        </div>

        {/* Single Row Horizontal Scrollable Carousel of Books */}
        <div className="flex items-stretch gap-4 overflow-x-auto pb-4 pt-1 px-1 custom-scrollbar snap-x">
          {featuredBooks.map((book) => {
            const isBookmarked = bookmarks.includes(book.id);
            return (
              <div
                key={book.id}
                className="w-36 sm:w-44 shrink-0 snap-start flex flex-col justify-between items-center text-center group cursor-pointer bg-white p-3 rounded-2xl border border-[#E2DDD5] shadow-xs hover:border-[#D4AF37] hover:shadow-md transition-all overflow-hidden"
                onClick={() => onSelectBook(book.id)}
              >
                <div className="mb-2 w-full flex justify-center transform group-hover:-translate-y-1 transition-transform">
                  <Book3D
                    coverUrl={book.coverUrl}
                    title={book.title}
                    author={book.author}
                    size="sm"
                    tilt="hover"
                    overlay={
                      <div className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-amber-300">
                        <Star className="w-3 h-3 fill-current" />
                      </div>
                    }
                  />
                </div>

                <div className="w-full space-y-0.5">
                  <h3 className="font-serif font-bold text-xs sm:text-sm text-stone-900 line-clamp-1 group-hover:text-[#5C121E] transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-[11px] text-stone-500 line-clamp-1 font-sans">
                    {book.author}
                  </p>
                </div>

                <div className="mt-2.5 flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    ⭐ {book.rating.toFixed(1)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleBookmark(book.id);
                    }}
                    className={`p-1 rounded-full text-xs transition-colors cursor-pointer ${
                      isBookmarked ? "text-amber-600" : "text-stone-400 hover:text-stone-700"
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "fill-current" : ""}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

import React, { useState } from "react";
import { BookMarked, Play, Trash2, CheckCircle2, Clock } from "lucide-react";
import { Book } from "../types";
import { Language, translations } from "../utils/i18n";
import Book3D from "./Book3D";

interface MyBooksProps {
  books: Book[];
  bookmarks: string[];
  onSelectBook: (bookId: string) => void;
  onRemoveBookmark: (bookId: string) => void;
  lang: Language;
}

export default function MyBooks({
  books,
  bookmarks,
  onSelectBook,
  onRemoveBookmark,
  lang,
}: MyBooksProps) {
  const [activeTab, setActiveTab] = useState<"reading" | "completed" | "saved">("saved");
  const t = (key: keyof typeof translations["ta"]) => translations[lang][key] || key;

  const bookmarkedBooks = books.filter((b) => bookmarks.includes(b.id));

  return (
    <div className="space-y-6 font-sans pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2DDD5] shadow-sm">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#3B0B12] flex items-center gap-2">
            <BookMarked className="w-6 h-6 text-[#D4AF37]" />
            <span>{t("navMyBooks")}</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            {lang === "ta" ? "நீங்கள் வாசிக்கும் மற்றும் சேமித்த புத்தகங்களின் பட்டியல்" : "Manage your active bookshelf, completed novels, and saved titles"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-[#E2DDD5] shadow-sm max-w-md">
        {[
          { id: "saved", label: t("savedBooks") + ` (${bookmarkedBooks.length})` },
          { id: "reading", label: t("currentlyReading") + " (2)" },
          { id: "completed", label: t("completed") + " (5)" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === tab.id
                ? "bg-[#3B0B12] text-[#D4AF37] shadow-md"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Book Grid */}
      {bookmarkedBooks.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#E2DDD5] space-y-3">
          <BookMarked className="w-12 h-12 text-stone-300 mx-auto" />
          <p className="font-serif font-bold text-stone-700 text-base">
            {lang === "ta" ? "சேமிக்கப்பட்ட புத்தகங்கள் இல்லை" : "Your bookshelf is currently empty."}
          </p>
          <p className="text-xs text-stone-500">
            {lang === "ta" ? "நூலகத்திற்குச் சென்று புத்தகங்களை சேமிக்கவும்." : "Browse the library and click the bookmark icon on any book."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookmarkedBooks.map((book) => (
            <div
              key={book.id}
              className="p-4 rounded-2xl bg-white border border-[#E2DDD5] shadow-sm hover:border-[#D4AF37] hover:shadow-md transition-all flex gap-4"
            >
              <Book3D coverUrl={book.coverUrl} title={book.title} size="sm" />

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#5C121E] uppercase">{book.genre}</span>
                  <h3 className="font-serif font-bold text-stone-900 text-sm line-clamp-1">{book.title}</h3>
                  <p className="text-xs text-stone-500 truncate">{book.author}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-stone-500">
                    <span>{t("progress")}</span>
                    <span>45%</span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#D4AF37] w-5/12 rounded-full" />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => onSelectBook(book.id)}
                      className="px-3 py-1 rounded-lg bg-[#3B0B12] text-[#D4AF37] text-xs font-semibold hover:brightness-110 flex items-center gap-1"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{lang === "ta" ? "தொடர்க" : "Continue"}</span>
                    </button>

                    <button
                      onClick={() => onRemoveBookmark(book.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

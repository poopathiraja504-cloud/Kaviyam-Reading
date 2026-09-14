import React, { useState, useMemo } from "react";
import { Search, Filter, Star, BookOpen, Bookmark, Play, Plus, SlidersHorizontal, Award, Sparkles } from "lucide-react";
import { Book } from "../types";
import { Language, translations } from "../utils/i18n";
import Book3D from "./Book3D";

interface LibraryProps {
  books: Book[];
  onSelectBook: (bookId: string) => void;
  bookmarks: string[];
  onToggleBookmark: (bookId: string) => void;
  lang: Language;
}

export default function Library({
  books,
  onSelectBook,
  bookmarks,
  onToggleBookmark,
  lang,
}: LibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [selectedAuthor, setSelectedAuthor] = useState<string>("all");
  const [selectedSort, setSelectedSort] = useState<string>("rating");

  const t = (key: string): string => {
    const res = (translations[lang] as Record<string, any>)[key];
    return typeof res === "string" ? res : key;
  };

  // Extract unique genres and authors
  const genres = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => b.genre && set.add(b.genre));
    return Array.from(set);
  }, [books]);

  const authors = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => b.author && set.add(b.author));
    return Array.from(set);
  }, [books]);

  // Filtered and sorted books
  const filteredBooks = useMemo(() => {
    return books
      .filter((b) => {
        const matchesSearch =
          !searchQuery.trim() ||
          b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.description.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesGenre = selectedGenre === "all" || b.genre === selectedGenre;
        const matchesAuthor = selectedAuthor === "all" || b.author === selectedAuthor;

        return matchesSearch && matchesGenre && matchesAuthor;
      })
      .sort((a, b) => {
        if (selectedSort === "rating") return b.rating - a.rating;
        if (selectedSort === "popular") return b.ratingCount - a.ratingCount;
        return a.title.localeCompare(b.title);
      });
  }, [books, searchQuery, selectedGenre, selectedAuthor, selectedSort]);

  return (
    <div className="space-y-6 font-sans pb-12">
      
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2DDD5] shadow-sm">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#3B0B12] flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#D4AF37]" />
            <span>{t("libraryTitle")}</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            {lang === "ta" ? "தமிழ் இலக்கியத்தின் அரிய படைப்புகளைக் கண்டறியுங்கள்" : "Browse all available Tamil literary works and classics"}
          </p>
        </div>

        <div className="text-xs font-semibold text-[#3B0B12] bg-[#F7F2EB] px-3.5 py-1.5 rounded-full border border-[#E2DDD5]">
          {filteredBooks.length} {lang === "ta" ? "புத்தகங்கள்" : "Books available"}
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#E2DDD5] shadow-sm space-y-3">
        
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#FDFBF7] border border-[#E2DDD5] text-stone-900 focus:outline-none focus:border-[#3B0B12]"
            />
          </div>

          {/* Genre Filter */}
          <div className="sm:col-span-2">
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-[#FDFBF7] border border-[#E2DDD5] text-stone-800 font-medium"
            >
              <option value="all">{t("allGenres")}</option>
              {genres.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Author Filter */}
          <div className="sm:col-span-2">
            <select
              value={selectedAuthor}
              onChange={(e) => setSelectedAuthor(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-[#FDFBF7] border border-[#E2DDD5] text-stone-800 font-medium"
            >
              <option value="all">{t("allAuthors")}</option>
              {authors.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Sort Filter */}
          <div className="sm:col-span-2">
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-[#FDFBF7] border border-[#E2DDD5] text-stone-800 font-medium"
            >
              <option value="rating">{t("sortRating")}</option>
              <option value="popular">{t("sortPopular")}</option>
            </select>
          </div>

        </div>

      </div>

      {/* Book Cards Grid */}
      {filteredBooks.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#E2DDD5] space-y-3">
          <BookOpen className="w-12 h-12 text-stone-300 mx-auto" />
          <p className="font-serif font-bold text-stone-700 text-lg">
            {lang === "ta" ? "புத்தகங்கள் எதுவும் கிடைக்கவில்லை" : "No books match your search criteria."}
          </p>
          <p className="text-xs text-stone-500">
            {lang === "ta" ? "தயவுசெய்து தேடல் சொல்லை மாற்றவும்." : "Try adjusting your filters or search keyword."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredBooks.map((book) => {
            const isBookmarked = bookmarks.includes(book.id);
            return (
              <div
                key={book.id}
                className="group p-3 rounded-2xl bg-white border border-[#E2DDD5] shadow-sm hover:border-[#D4AF37] hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div className="aspect-[3/4] w-full mb-3">
                  <Book3D
                    coverUrl={book.coverUrl}
                    title={book.title}
                    overlay={
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleBookmark(book.id);
                          }}
                          className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-all ${
                            isBookmarked
                              ? "bg-[#D4AF37] text-[#3B0B12]"
                              : "bg-black/40 text-white hover:bg-black/60"
                          }`}
                        >
                          <Bookmark className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1">
                          <Star className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37]" />
                          <span>{book.rating.toFixed(1)}</span>
                        </div>
                      </>
                    }
                  />
                </div>

                {/* Book Details */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#5C121E] uppercase tracking-wider block">
                    {book.genre}
                  </span>
                  <h3 className="font-serif font-bold text-stone-900 text-sm line-clamp-1 group-hover:text-[#3B0B12]">
                    {book.title}
                  </h3>
                  <p className="text-xs text-stone-500 truncate">{book.author}</p>

                  <div className="pt-3 flex items-center justify-between border-t border-stone-100">
                    <span className="text-[10px] text-stone-400">
                      {book.chapters.length} {t("chapters")}
                    </span>

                    <button
                      onClick={() => onSelectBook(book.id)}
                      className="px-2.5 py-1 rounded-lg bg-[#3B0B12] text-[#D4AF37] text-[11px] font-semibold hover:brightness-110 flex items-center gap-1 shadow-sm"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{t("startReadingNow")}</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

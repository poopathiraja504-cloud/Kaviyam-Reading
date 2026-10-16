import React, { useState, useMemo } from "react";
import { Book } from "../types";
import {
  Search,
  BookOpen,
  Download,
  Eye,
  Sparkles,
  Calendar,
  Layers,
  Award,
  FileText,
  Star,
  CheckCircle,
  ExternalLink,
  Info,
  Filter,
  ArrowRight,
  BookMarked,
  Sun,
  Moon,
} from "lucide-react";

interface KaviyamDigitalLibraryProps {
  books: Book[];
  onOpenBook: (book: Book) => void;
  onDownloadBook: (book: Book) => void;
  onSelectBookDetails?: (book: Book) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const KaviyamDigitalLibrary: React.FC<KaviyamDigitalLibraryProps> = ({
  books,
  onOpenBook,
  onDownloadBook,
  onSelectBookDetails,
  isDark,
  onToggleTheme,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [viewLayout, setViewLayout] = useState<"showcase" | "grid">("showcase");
  const [previewBook, setPreviewBook] = useState<Book | null>(null);

  // The 3 primary books are always prioritized at the top
  const featuredThree = useMemo(() => books.slice(0, 3), [books]);

  // Filter books based on search query
  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      const matchSearch =
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.tamilTitle && b.tamilTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.monthYear && b.monthYear.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchSearch) return false;

      if (selectedFilter === "all") return true;
      if (selectedFilter === "featured") return b.id.includes("mutram") || b.id.includes("solvayal");
      if (selectedFilter === "mutram") return b.id.includes("mutram");
      if (selectedFilter === "solvayal") return b.id.includes("solvayal");
      if (selectedFilter === "classics") return !b.id.includes("mutram") && !b.id.includes("solvayal");

      return true;
    });
  }, [books, searchQuery, selectedFilter]);

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Banner Section */}
      <section
        className={`relative overflow-hidden rounded-3xl border shadow-2xl transition-all duration-300 ${
          isDark
            ? "border-amber-500/25 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 text-slate-100"
            : "border-amber-300/60 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/50 text-slate-900"
        }`}
      >
        {/* Decorative golden ambient backlights */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative px-6 py-10 sm:px-12 sm:py-14 max-w-5xl mx-auto text-center">
          {/* Subtle Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-400 mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            <span>செந்தமிழ்ச் சுவடி &amp; மின்னூல் களஞ்சியம் · Kaviyam Reading</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-serif leading-tight">
            காவியம் ரீடிங்{" "}
            <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
              டிஜிட்டல் நூலகம்
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
            அரசு மற்றும் மொழியியல் மாத இதழ்களை எங்கும் எப்போது வேண்டுமானாலும் வாசியுங்கள்.
            முழுமையான PDF வாசிப்பு வசதி, ஜூம், முழுத்திரை மற்றும் நேரடி பதிவிறக்கம்.
          </p>

          {/* Search Bar & Filter Controls */}
          <div className="mt-8 max-w-2xl mx-auto">
            <div
              className={`flex items-center gap-3 rounded-2xl border px-4 py-2.5 shadow-lg backdrop-blur-md transition-all ${
                isDark
                  ? "border-amber-500/30 bg-slate-900/80 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-500/20"
                  : "border-amber-300 bg-white focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20"
              }`}
            >
              <Search className="h-5 w-5 text-amber-400 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="இதழ் பெயர் அல்லது தலைப்பைத் தேடுக... (முற்றம், சொல்வயல், 2026)"
                className="w-full bg-transparent text-sm sm:text-base outline-none placeholder:text-slate-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded-md"
                >
                  அழி
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {[
                { id: "all", label: "அனைத்து இதழ்கள் (All)" },
                { id: "featured", label: "முதன்மை 3 இதழ்கள் (Featured 3)" },
                { id: "mutram", label: "முற்றம் இதழ்கள்" },
                { id: "solvayal", label: "சொல்வயல் இதழ்" },
                { id: "classics", label: "செவ்வியல் நூல்கள்" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFilter(f.id)}
                  className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                    selectedFilter === f.id
                      ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 scale-105"
                      : isDark
                      ? "border border-slate-800 bg-slate-900/60 text-slate-400 hover:border-amber-500/30 hover:text-slate-200"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:text-slate-900"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats Strip */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-amber-500/20 max-w-3xl mx-auto text-center">
            <div className="p-2">
              <span className="block text-xl sm:text-2xl font-bold text-amber-400 font-serif">3</span>
              <span className="text-[11px] text-slate-400">முதன்மை இதழ்கள்</span>
            </div>
            <div className="p-2">
              <span className="block text-xl sm:text-2xl font-bold text-amber-400 font-serif">36</span>
              <span className="text-[11px] text-slate-400">முழு பக்கங்கள்</span>
            </div>
            <div className="p-2">
              <span className="block text-xl sm:text-2xl font-bold text-amber-400 font-serif">100%</span>
              <span className="text-[11px] text-slate-400">இலவச பதிவிறக்கம்</span>
            </div>
            <div className="p-2">
              <span className="block text-xl sm:text-2xl font-bold text-amber-400 font-serif">PDF.js</span>
              <span className="text-[11px] text-slate-400">அதிவேக வாசிப்பு</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Primary Books Section (The 3 User-Requested Books) */}
      <section aria-labelledby="featured-books-heading" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b pb-4 border-amber-500/20">
          <div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-400" />
              <h2
                id="featured-books-heading"
                className="text-2xl sm:text-3xl font-extrabold font-serif text-amber-400"
              >
                சிறப்பு இதழ்கள் களஞ்சியம்
              </h2>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              தமிழ்நாடு அரசு வெளியீடுகள் மற்றும் செந்தமிழ்ச் சொற்பிறப்பியல் ஆய்விதழ்கள்
            </p>
          </div>

          {/* Layout switch */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/60 p-1 text-xs">
            <button
              onClick={() => setViewLayout("showcase")}
              className={`rounded-lg px-3 py-1 font-semibold transition-all ${
                viewLayout === "showcase"
                  ? "bg-amber-500 text-slate-950"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              விரிவான காட்சி
            </button>
            <button
              onClick={() => setViewLayout("grid")}
              className={`rounded-lg px-3 py-1 font-semibold transition-all ${
                viewLayout === "grid"
                  ? "bg-amber-500 text-slate-950"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              கட்டமைப்புக் காட்சி (Grid)
            </button>
          </div>
        </div>

        {/* 3 Primary Books Detailed Showcase */}
        {viewLayout === "showcase" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {featuredThree.map((book, idx) => (
              <article
                key={book.id}
                className={`group relative flex flex-col justify-between rounded-3xl border p-5 sm:p-6 transition-all duration-300 ${
                  isDark
                    ? "border-amber-500/20 bg-slate-900/70 hover:border-amber-400/60 hover:bg-slate-900/90 hover:shadow-2xl hover:shadow-amber-500/15"
                    : "border-amber-200 bg-white/90 hover:border-amber-400 hover:shadow-2xl hover:shadow-stone-900/10"
                }`}
              >
                {/* Top Badge & Number */}
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-0.5 text-xs font-bold text-amber-400">
                    இதழ் #{idx + 1}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {book.pageCount} பக்கங்கள் · {book.fileSize}
                  </span>
                </div>

                {/* 3D Book Cover Presentation with Deep Shadow */}
                <div className="relative mb-6 flex justify-center">
                  <div
                    onClick={() => onOpenBook(book)}
                    className="relative w-44 sm:w-48 h-64 sm:h-70 cursor-pointer overflow-hidden rounded-xl shadow-2xl shadow-black/60 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-amber-500/30"
                    title={`${book.title} திறக்க`}
                  >
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />

                    {/* Realistic 3D book spine gradient overlay on the left */}
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
                    {/* Realistic book page edge sheen on the right */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-1.5 bg-gradient-to-l from-white/30 to-transparent" />

                    {/* Hover Click Overlay */}
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-slate-950 shadow-xl shadow-amber-500/50">
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <span className="mt-2 text-xs font-bold text-amber-300">
                        PDF உடனடியாகப் படிக்க
                      </span>
                    </div>
                  </div>
                </div>

                {/* Title & Metadata */}
                <div className="flex-1">
                  <h3
                    onClick={() => onOpenBook(book)}
                    className="cursor-pointer text-lg sm:text-xl font-bold font-serif leading-snug hover:text-amber-400 transition-colors"
                  >
                    {book.title}
                  </h3>
                  <p className="mt-1 text-xs text-amber-500 font-medium">{book.monthYear}</p>
                  <p className="mt-0.5 text-xs text-slate-400 line-clamp-1">{book.publisher}</p>

                  <p className="mt-3 text-xs leading-relaxed text-slate-300 line-clamp-3">
                    {book.description}
                  </p>

                  {/* Highlights Bullet List */}
                  {book.highlights && book.highlights.length > 0 && (
                    <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        முக்கிய சிறப்பம்சங்கள்:
                      </span>
                      <ul className="mt-1.5 space-y-1 text-[11px] text-slate-300">
                        {book.highlights.slice(0, 3).map((hl, hIdx) => (
                          <li key={hIdx} className="flex items-start gap-1.5 line-clamp-1">
                            <span className="text-amber-400">•</span>
                            <span className="truncate">{hl}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Action Buttons: Prominent Download & Read Online */}
                <div className="mt-6 flex flex-col sm:flex-row items-center gap-2.5 pt-4 border-t border-slate-800">
                  {/* Read Online Button */}
                  <button
                    onClick={() => onOpenBook(book)}
                    className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/25 hover:bg-amber-400 active:scale-95 transition-all"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Read Online (படிக்க)</span>
                  </button>

                  {/* Prominent Download Button */}
                  <button
                    onClick={() => onDownloadBook(book)}
                    className={`w-full sm:flex-1 flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition-all active:scale-95 ${
                      isDark
                        ? "border-amber-400/40 bg-slate-800 text-amber-300 hover:border-amber-400 hover:bg-slate-700"
                        : "border-amber-400 bg-amber-50 text-amber-800 hover:bg-amber-100"
                    }`}
                  >
                    <Download className="h-4 w-4" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className={`group flex flex-col justify-between rounded-2xl border p-3.5 transition-all duration-200 ${
                  isDark
                    ? "border-slate-800 bg-slate-900/60 hover:border-amber-400/50 hover:bg-slate-900"
                    : "border-slate-200 bg-white hover:border-amber-300 hover:shadow-lg"
                }`}
              >
                <div
                  onClick={() => onOpenBook(book)}
                  className="relative h-48 sm:h-56 cursor-pointer overflow-hidden rounded-lg shadow-md group-hover:scale-105 transition-transform"
                >
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <span className="text-[11px] font-bold text-amber-300">படிக்க கிளிக் செய்க</span>
                  </div>
                </div>

                <div className="mt-3 flex-1">
                  <span className="text-[10px] text-amber-500 font-semibold">
                    {book.monthYear || book.genre}
                  </span>
                  <h4
                    onClick={() => onOpenBook(book)}
                    className="cursor-pointer text-sm font-bold line-clamp-2 hover:text-amber-400 transition-colors"
                  >
                    {book.title}
                  </h4>
                </div>

                <div className="mt-3 flex items-center gap-1.5 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => onOpenBook(book)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-colors"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>படிக்க</span>
                  </button>

                  <button
                    onClick={() => onDownloadBook(book)}
                    className="flex items-center justify-center p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-amber-400 transition-colors"
                    title="Download PDF"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Library Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div
          className={`rounded-2xl border p-6 backdrop-blur-md transition-all ${
            isDark ? "border-amber-500/20 bg-slate-900/60" : "border-amber-200 bg-amber-50/50"
          }`}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 mb-4">
            <BookOpen className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-amber-400">உடனடி PDF வாசிப்பாளர் (PDF.js)</h3>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
            பக்க மறுஏற்றம் இன்றி உடனடியாக திறக்கும் அதிவேக தொழில்நுட்பம். எந்தவித மந்தநிலையும்
            இல்லாமல் மிகத் துல்லியமான வாசிப்பு அனுபவம்.
          </p>
        </div>

        <div
          className={`rounded-2xl border p-6 backdrop-blur-md transition-all ${
            isDark ? "border-amber-500/20 bg-slate-900/60" : "border-amber-200 bg-amber-50/50"
          }`}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 mb-4">
            <Layers className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-amber-400">நிரந்தர மிதக்கும் நூலடுக்கு</h3>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
            திரையின் வலது மூலையில் எப்போதும் காட்சி தரும் மிதக்கும் அலமாரி. நீங்கள் எந்தப் பக்கத்தில்
            இருந்தாலும் ஒரு கிளிக்கில் வாசிக்கலாம் அல்லது பதிவிறக்கலாம்.
          </p>
        </div>

        <div
          className={`rounded-2xl border p-6 backdrop-blur-md transition-all ${
            isDark ? "border-amber-500/20 bg-slate-900/60" : "border-amber-200 bg-amber-50/50"
          }`}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 mb-4">
            <Download className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-amber-400">நேரடி முழு PDF பதிவிறக்கம்</h3>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
            ஒவ்வொரு இதழுக்கும் தனித்தனியான உயர்ரக PDF கோப்புகள். மொபைல், டேப்லெட், கணினிகளில்
            ஆஃப்லைனில் படிக்க முழுமையான கோப்புகள்.
          </p>
        </div>
      </section>
    </div>
  );
};

export default KaviyamDigitalLibrary;

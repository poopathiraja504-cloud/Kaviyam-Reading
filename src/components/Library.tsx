import { Book } from "../types";
import { Search, Sparkles, Filter, Bookmark, Star, BookOpen, ChevronRight, Loader2, BookMarked, TrendingUp, Flame, Compass, History, Download } from "lucide-react";
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import TamilDashboard from "./TamilDashboard";

interface LibraryProps {
  books: Book[];
  bookmarks: string[];
  onToggleBookmark: (bookId: string) => void;
  onSelectBook: (bookId: string) => void;
  onAddCustomBook: (newBook: Book) => void;
  currentUser: any;
  downloadedBookIds?: string[];
  onToggleDownload?: (bookId: string) => void;
}

export default function Library({
  books,
  bookmarks,
  onToggleBookmark,
  onSelectBook,
  onAddCustomBook,
  currentUser,
  downloadedBookIds = [],
  onToggleDownload = () => {},
}: LibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [viewMode, setViewMode] = useState<"catalog" | "bookshelf" | "build" | "tamil" | "downloads">("catalog");

  // Story Builder State
  const [prompt, setPrompt] = useState("");
  const [genre, setGenre] = useState("Fantasy");
  const [length, setLength] = useState("medium");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Offline Download Simulated State
  const [downloadingBookId, setDownloadingBookId] = useState<string | null>(null);

  const handleDownloadClick = (bookId: string) => {
    if (downloadingBookId) return;
    setDownloadingBookId(bookId);
    setTimeout(() => {
      onToggleDownload(bookId);
      setDownloadingBookId(null);
    }, 1200); // high fidelity local storage caching simulation
  };

  const genres = ["All", "Fantasy", "Sci-Fi", "Mystery", "Romance", "Adventure"];

  // Filter logic
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === "All" || book.genre.toLowerCase() === selectedGenre.toLowerCase();
    return matchesSearch && matchesGenre;
  });

  const bookmarkedBooks = books.filter((b) => bookmarks.includes(b.id));

  // Curated lists for Dashboard
  const trendingBooks = books.slice(0, 2); // Show first 2 books as trending
  const recommendedBooks = books.filter(b => b.genre === "Fantasy" || b.isCustomAI || b.rating >= 4.8);

  const handleBuildStory = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsGenerating(true);

    if (!currentUser) {
      setErrorMsg("Please sign in or create an account to use the AI Novel Builder.");
      setIsGenerating(false);
      return;
    }

    if (!currentUser.isVerified) {
      setErrorMsg("Email verification is required to generate custom novels. Please check the Simulated Mailbox to verify your account first.");
      setIsGenerating(false);
      return;
    }

    try {
      const response = await fetch("/api/gemini/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, genre, length }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to compile AI custom novel. Check your API key setup.");
      }

      // Map generated response to a full Book object
      const newBook: Book = {
        id: `ai-story-${Date.now()}`,
        title: data.title || "AI Generated Novel",
        author: `Kaviyam AI (for ${currentUser.username})`,
        description: data.description || "A custom literary tapestry woven by the machine's dreams.",
        coverUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400",
        genre: data.genre || genre,
        rating: 5.0,
        ratingCount: 1,
        chapters: data.chapters || [],
        reviews: [],
        isCustomAI: true,
      };

      onAddCustomBook(newBook);
      alert("Your custom novel has been compiled successfully and added to your Library!");
      setPrompt("");
      setViewMode("catalog");
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || "An error occurred while generating the novel.");
    } finally {
      setIsGenerating(false);
    }
  };

  const isBrowsingFiltered = searchQuery.trim() !== "" || selectedGenre !== "All";

  return (
    <div className="space-y-8 text-left" id="library-root">
      
      {/* Visual Navigation Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-3">
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none w-full max-w-full">
          <button
            onClick={() => { setViewMode("catalog"); setSearchQuery(""); setSelectedGenre("All"); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
              viewMode === "catalog"
                ? "bg-stone-900 text-white shadow-sm"
                : "text-stone-500 hover:bg-stone-100 hover:text-stone-800"
            }`}
            id="lib-tab-catalog"
          >
            Catalog Library
          </button>
          <button
            onClick={() => setViewMode("bookshelf")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
              viewMode === "bookshelf"
                ? "bg-stone-900 text-white shadow-sm"
                : "text-stone-500 hover:bg-stone-100 hover:text-stone-800"
            }`}
            id="lib-tab-bookshelf"
          >
            <BookMarked size={14} />
            My Bookshelf
            {bookmarks.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-stone-200 text-stone-800 text-[9px] rounded-full font-mono font-extrabold">
                {bookmarks.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setViewMode("downloads")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
              viewMode === "downloads"
                ? "bg-stone-900 text-white shadow-sm"
                : "text-stone-500 hover:bg-stone-100 hover:text-stone-800"
            }`}
            id="lib-tab-downloads"
          >
            <Download size={14} className="text-[#bfa030]" />
            Offline Downloads
            {downloadedBookIds.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-stone-200 text-stone-800 text-[9px] rounded-full font-mono font-extrabold">
                {downloadedBookIds.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setViewMode("tamil")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 border border-indigo-200 bg-indigo-50/50 text-indigo-900 hover:bg-indigo-100/60 whitespace-nowrap flex-shrink-0 ${
              viewMode === "tamil" ? "ring-2 ring-[#003366] bg-indigo-50" : ""
            }`}
            id="lib-tab-tamil"
          >
            📚 Tamil Library
          </button>
        </div>

        {/* Desktop Quick Search when in catalog mode */}
        {viewMode === "catalog" && (
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              placeholder="Quick search catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 placeholder-stone-400 text-xs focus:outline-none focus:border-stone-400 focus:bg-white transition-all"
              id="library-quick-search"
            />
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {viewMode === "catalog" && (
          <motion.div
            key="catalog-dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Hero Brand Banner Removed */}

            {/* Filter Controls (Genre selector + Search detail) */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-lg font-bold text-stone-800 flex items-center gap-2">
                  <Compass size={18} className="text-[#bfa030]" />
                  {isBrowsingFiltered ? "Search & Filter Results" : "Explore Collections"}
                </h2>
                {isBrowsingFiltered && (
                  <button
                    onClick={() => { setSearchQuery(""); setSelectedGenre("All"); }}
                    className="text-xs text-[#bfa030] hover:underline font-bold"
                  >
                    Clear Filter
                  </button>
                )}
              </div>

              {/* Genre pill selector */}
              <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                {genres.map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGenre(g)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                      selectedGenre === g
                        ? "bg-stone-900 text-white shadow-sm"
                        : "bg-stone-100 text-stone-500 border border-stone-200/50 hover:bg-stone-200 hover:text-stone-800"
                    }`}
                    id={`genre-btn-${g}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Dashboard Sections or Searched Grid */}
            <AnimatePresence mode="wait">
              {!isBrowsingFiltered ? (
                <motion.div
                  key="standard-dashboard-sections"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  {/* SECTION 1: CONTINUE READING REMOVED */}

                  {/* SECTION 2: TRENDING */}
                  <div className="space-y-4">
                    <h3 className="font-serif text-sm font-extrabold text-stone-800 uppercase tracking-wider flex items-center gap-2">
                      <Flame size={14} className="text-[#bfa030]" />
                      Trending Masterpieces
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {trendingBooks.map((book) => {
                        const isBookmarked = bookmarks.includes(book.id);
                        return (
                          <div
                            key={book.id}
                            className="bg-white rounded-3xl border border-stone-200/80 overflow-hidden flex flex-col hover:shadow-lg transition group"
                          >
                            <div className="relative h-48 bg-stone-100 overflow-hidden">
                              <img
                                src={book.coverUrl}
                                alt={book.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent opacity-85 z-0" />
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleBookmark(book.id);
                                }}
                                className={`absolute top-4 right-4 p-2.5 rounded-xl border shadow-sm transition-all duration-300 ${
                                  isBookmarked
                                    ? "bg-[#bfa030] border-[#b09124] text-black scale-105"
                                    : "bg-white/80 backdrop-blur-sm border-stone-200 text-stone-600 hover:bg-white"
                                }`}
                                id={`bookmark-btn-trending-${book.id}`}
                              >
                                <Bookmark size={14} className={isBookmarked ? "fill-current" : ""} />
                              </button>

                              <span className="absolute bottom-4 left-4 text-[9px] font-mono font-bold tracking-wider uppercase bg-[#bfa030] text-black px-2.5 py-0.5 rounded-md">
                                🔥 Popular
                              </span>
                            </div>

                            <div className="p-5 flex-1 flex flex-col justify-between text-left space-y-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-[10px] text-stone-400 font-mono">
                                  <span>{book.genre}</span>
                                  <span>•</span>
                                  <span>By {book.author}</span>
                                </div>
                                <h4 className="font-serif font-extrabold text-stone-800 text-sm leading-snug line-clamp-1">
                                  {book.title}
                                </h4>
                                <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed font-serif">
                                  {book.description}
                                </p>
                              </div>

                              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                                <div className="flex items-center gap-1 font-mono text-[11px] text-stone-600 font-bold">
                                  <Star size={12} className="text-amber-500 fill-amber-500" />
                                  <span>{book.rating.toFixed(1)}</span>
                                  <span className="text-stone-400 font-normal">({book.ratingCount} reads)</span>
                                </div>

                                <button
                                  onClick={() => onSelectBook(book.id)}
                                  className="flex items-center gap-1.5 text-xs text-stone-900 hover:text-[#bfa030] font-extrabold transition-all"
                                >
                                  Read Chapter
                                  <ChevronRight size={13} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* SECTION 3: RECOMMENDED */}
                  <div className="space-y-4">
                    <h3 className="font-serif text-sm font-extrabold text-stone-800 uppercase tracking-wider flex items-center gap-2">
                      <Star size={14} className="text-[#bfa030] fill-current" />
                      Recommended For You
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {recommendedBooks.map((book) => {
                        const isBookmarked = bookmarks.includes(book.id);
                        return (
                          <div
                            key={book.id}
                            className="bg-white rounded-2xl border border-stone-200/60 overflow-hidden flex flex-col justify-between hover:border-stone-300 hover:shadow-md transition duration-300 h-full"
                          >
                            <div className="relative h-40 bg-stone-100 overflow-hidden">
                              <img
                                src={book.coverUrl}
                                alt=""
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                              
                              <button
                                onClick={() => onToggleBookmark(book.id)}
                                className={`absolute top-3 right-3 p-2 rounded-lg border shadow-sm transition ${
                                  isBookmarked
                                    ? "bg-[#bfa030] border-[#a88a1e] text-black"
                                    : "bg-white/80 backdrop-blur-sm border-stone-200 text-stone-600 hover:bg-white"
                                }`}
                              >
                                <Bookmark size={12} className={isBookmarked ? "fill-current" : ""} />
                              </button>

                              <span className="absolute bottom-3 left-3 text-[9px] font-mono tracking-wider bg-white/90 backdrop-blur-sm text-stone-800 font-bold px-2 py-0.5 rounded">
                                {book.genre}
                              </span>
                            </div>

                            <div className="p-4 text-left flex-grow flex flex-col justify-between space-y-3">
                              <div className="space-y-1">
                                <h4 className="font-serif font-bold text-stone-800 text-xs line-clamp-1">
                                  {book.title}
                                </h4>
                                <p className="text-[10px] text-stone-400 font-semibold">By {book.author}</p>
                                <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed mt-1 font-serif">
                                  {book.description}
                                </p>
                              </div>

                              <div className="pt-2 border-t border-stone-50 flex items-center justify-between">
                                <span className="flex items-center gap-0.5 text-[10px] font-mono font-bold text-stone-600">
                                  <Star size={11} className="text-amber-500 fill-amber-500" />
                                  {book.rating.toFixed(1)}
                                </span>
                                <button
                                  onClick={() => onSelectBook(book.id)}
                                  className="text-xs text-stone-900 font-bold hover:text-[#bfa030] flex items-center gap-0.5"
                                >
                                  Open
                                  <ChevronRight size={11} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              ) : (
                // Filtered Search Results Grid
                <motion.div
                  key="filtered-grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {filteredBooks.length === 0 ? (
                    <div className="col-span-full py-16 text-center text-stone-400 border border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
                      <p className="font-serif text-sm font-semibold">No novels matched your filters.</p>
                      <p className="text-[11px] text-stone-400 mt-1">Try broadening your parameters or compose a custom novel using the AI Builder!</p>
                      <button
                        onClick={() => { setSearchQuery(""); setSelectedGenre("All"); }}
                        className="mt-4 px-4 py-1.5 bg-stone-950 text-white text-xs font-bold rounded-lg hover:bg-stone-800 transition"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  ) : (
                    filteredBooks.map((book) => {
                      const isBookmarked = bookmarks.includes(book.id);
                      return (
                        <div
                          key={book.id}
                          className="bg-white rounded-2xl border border-stone-200 overflow-hidden flex flex-col hover:shadow-md transition group h-full relative"
                          id={`book-card-${book.id}`}
                        >
                          <div className="relative h-44 bg-stone-100 overflow-hidden">
                            <img
                              src={book.coverUrl}
                              alt={book.title}
                              className="w-full h-full object-cover group-hover:scale-103 transition duration-500"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleBookmark(book.id);
                              }}
                              className={`absolute top-3 right-3 p-2 rounded-xl border shadow-sm transition-all ${
                                isBookmarked
                                  ? "bg-[#bfa030] border-[#b09124] text-black"
                                  : "bg-white/80 backdrop-blur-sm border-stone-200 text-stone-600 hover:bg-white"
                              }`}
                              id={`bookmark-btn-${book.id}`}
                            >
                              <Bookmark size={13} className={isBookmarked ? "fill-current" : ""} />
                            </button>

                            <span className="absolute bottom-3 left-3 text-[10px] font-mono tracking-wider bg-white/95 text-stone-800 font-extrabold px-2 py-0.5 rounded shadow-sm">
                              {book.genre}
                            </span>
                          </div>

                          <div className="p-4 flex-1 flex flex-col justify-between text-left space-y-4">
                            <div className="space-y-1">
                              <h3 className="font-serif font-extrabold text-stone-800 leading-snug line-clamp-1">
                                {book.title}
                              </h3>
                              <p className="text-[11px] text-stone-400 font-semibold">By {book.author}</p>
                              <p className="text-[11px] text-stone-500 line-clamp-3 leading-relaxed mt-2 font-serif">
                                {book.description}
                              </p>
                            </div>

                            <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                              <div className="flex items-center gap-1 font-mono text-[11px] text-stone-600 font-bold">
                                <Star size={12} className="text-amber-500 fill-amber-500" />
                                <span>{book.rating.toFixed(1)}</span>
                                <span className="text-stone-400 font-normal">({book.ratingCount})</span>
                              </div>

                              <button
                                onClick={() => onSelectBook(book.id)}
                                className="flex items-center gap-1 text-xs text-stone-900 hover:text-[#bfa030] font-extrabold transition-all"
                                id={`read-now-btn-${book.id}`}
                              >
                                <BookOpen size={13} />
                                Read Now
                                <ChevronRight size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {viewMode === "bookshelf" && (
          <motion.div
            key="bookshelf-dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="p-6 bg-stone-50 border border-stone-200 rounded-3xl text-left space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#bfa030] font-extrabold">My Bookshelf</span>
              <h3 className="font-serif text-base font-bold text-stone-800">Your Personalized Library</h3>
              <p className="text-[11px] text-stone-500 leading-relaxed max-w-2xl">
                Novels added to your list persist here. These are the books you are actively reading, favoring, or translating. All customized AI novels also appear here for your immediate access.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarkedBooks.length === 0 ? (
                <div className="col-span-full py-16 text-center text-stone-400 border border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
                  <Bookmark size={32} className="stroke-1 mx-auto mb-2 text-stone-300" />
                  <p className="font-serif text-sm font-semibold">Your bookshelf is empty.</p>
                  <p className="text-[10px] text-stone-400 mt-1">Browse the library and tap the bookmark ribbon to save a story here!</p>
                  <button
                    onClick={() => setViewMode("catalog")}
                    className="mt-4 px-4 py-1.5 bg-stone-900 text-white text-xs font-bold rounded-lg"
                  >
                    Browse Catalog
                  </button>
                </div>
              ) : (
                bookmarkedBooks.map((book) => (
                  <div
                    key={book.id}
                    className="bg-white rounded-2xl border border-stone-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition group h-full"
                    id={`bookshelf-card-${book.id}`}
                  >
                    <div className="flex gap-4 p-4 text-left">
                      <img
                        src={book.coverUrl}
                        alt=""
                        className="w-16 h-22 rounded-xl object-cover shadow-sm flex-shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="space-y-1 flex-1">
                        <span className="inline-block text-[9px] font-mono bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md font-extrabold uppercase">
                          {book.genre}
                        </span>
                        <h4 className="font-serif font-bold text-stone-800 text-xs line-clamp-2 leading-snug">
                          {book.title}
                        </h4>
                        <p className="text-[10px] text-stone-400 font-semibold">By {book.author}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-stone-50/55 border-t border-stone-100 flex justify-between items-center">
                      <button
                        onClick={() => onToggleBookmark(book.id)}
                        className="text-[11px] text-red-500 hover:underline font-bold"
                        id={`remove-shelf-btn-${book.id}`}
                      >
                        Remove
                      </button>

                      <button
                        onClick={() => onSelectBook(book.id)}
                        className="bg-stone-900 hover:bg-stone-800 text-white px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all shadow-sm"
                        id={`shelf-read-btn-${book.id}`}
                      >
                        Resume Reader
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}



        {viewMode === "tamil" && (
          <motion.div
            key="tamil-dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <TamilDashboard 
              onSelectBook={onSelectBook}
              bookmarks={bookmarks}
              onToggleBookmark={onToggleBookmark}
              onAddCustomBook={onAddCustomBook}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

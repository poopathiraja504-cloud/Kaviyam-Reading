import React, { useState } from "react";
import { Book } from "../types";
import { BookOpen, Download, ChevronRight, ChevronLeft, Sparkles, Eye } from "lucide-react";

interface FloatingBookshelfProps {
  books: Book[];
  activeBookId?: string | null;
  onOpenBook: (book: Book) => void;
  onDownloadBook: (book: Book) => void;
  isDark?: boolean;
}

export const FloatingBookshelf: React.FC<FloatingBookshelfProps> = ({
  books,
  activeBookId,
  onOpenBook,
  onDownloadBook,
  isDark = true,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Take only the 3 primary books
  const featuredThree = books.slice(0, 3);

  return (
    <aside
      aria-label="Floating Bookshelf"
      className={`fixed right-3 top-24 z-40 transition-all duration-300 ease-in-out ${
        isCollapsed ? "translate-x-[calc(100%-42px)]" : "translate-x-0"
      }`}
    >
      <div
        className={`flex items-start rounded-2xl border shadow-2xl backdrop-blur-xl transition-colors ${
          isDark
            ? "border-amber-500/30 bg-slate-950/85 text-slate-100 shadow-amber-500/10"
            : "border-amber-300/60 bg-white/95 text-slate-900 shadow-stone-900/15"
        }`}
      >
        {/* Toggle Button Tab */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`flex h-28 w-10 flex-col items-center justify-center rounded-l-2xl border-y border-l transition-colors ${
            isDark
              ? "border-amber-500/40 bg-slate-900/90 text-amber-400 hover:bg-slate-800"
              : "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
          }`}
          title={isCollapsed ? "நூலடுக்கை விரி (Expand Bookshelf)" : "நூலடுக்கை சுருக்கு (Collapse Bookshelf)"}
          aria-expanded={!isCollapsed}
        >
          {isCollapsed ? (
            <ChevronLeft className="h-5 w-5 animate-pulse" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
          <span className="mt-2 text-[10px] font-bold tracking-wider [writing-mode:vertical-rl] rotate-180">
            {isCollapsed ? "நூலடுக்கு" : "மறை"}
          </span>
        </button>

        {/* Bookshelf Content Area */}
        <div className="w-64 sm:w-72 p-3 sm:p-4 max-h-[calc(100vh-120px)] overflow-y-auto">
          {/* Header */}
          <div className="mb-3 flex items-center justify-between border-b pb-2 border-amber-500/20">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <h3 className="text-xs sm:text-sm font-bold tracking-wide text-amber-400">
                சிறப்பு நூலடுக்கு
              </h3>
            </div>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                isDark ? "bg-amber-400/10 text-amber-300" : "bg-amber-100 text-amber-800"
              }`}
            >
              3 இதழ்கள்
            </span>
          </div>

          <p className="mb-3 text-[11px] leading-tight text-slate-400">
            முக்கிய 3 இதழ்களை இங்கிருந்து உடனடியாகப் படிக்கலாம் & பதிவிறக்கலாம்:
          </p>

          {/* Vertical list of 3 books */}
          <div className="space-y-3">
            {featuredThree.map((book, idx) => {
              const isActive = activeBookId === book.id;
              return (
                <div
                  key={book.id}
                  className={`group relative rounded-xl border p-2.5 transition-all duration-200 ${
                    isActive
                      ? isDark
                        ? "border-amber-400 bg-amber-500/15 shadow-md shadow-amber-500/20"
                        : "border-amber-500 bg-amber-50 shadow-md shadow-amber-500/20"
                      : isDark
                      ? "border-slate-800/80 bg-slate-900/60 hover:border-amber-400/50 hover:bg-slate-900/90"
                      : "border-slate-200 bg-slate-50/80 hover:border-amber-300 hover:bg-white"
                  }`}
                >
                  <div className="flex gap-2.5">
                    {/* 3D Book Cover Thumbnail with Shadow */}
                    <div
                      onClick={() => onOpenBook(book)}
                      className="relative w-16 h-22 flex-shrink-0 cursor-pointer overflow-hidden rounded-md shadow-md shadow-black/40 transition-transform duration-200 group-hover:scale-105 group-hover:shadow-amber-500/30"
                      title={`${book.title} படிக்க`}
                    >
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                      {/* Spine highlight overlay */}
                      <div className="pointer-events-none absolute inset-y-0 left-0 w-1.5 bg-gradient-to-r from-black/40 to-transparent" />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-1">
                        <Eye className="w-3.5 h-3.5 text-amber-300" />
                      </div>
                    </div>

                    {/* Book Metadata & Actions */}
                    <div className="flex flex-1 flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold text-amber-500 uppercase">
                            #{idx + 1}
                          </span>
                          <span className="text-[9px] text-slate-400 font-medium truncate">
                            {book.fileSize || "PDF"}
                          </span>
                        </div>
                        <h4
                          onClick={() => onOpenBook(book)}
                          className="cursor-pointer text-xs font-semibold leading-snug line-clamp-2 hover:text-amber-400 transition-colors"
                          title={book.title}
                        >
                          {book.title}
                        </h4>
                        <p className="mt-0.5 text-[10px] text-slate-400 truncate">
                          {book.monthYear || book.genre}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-2 flex items-center gap-1.5 pt-1 border-t border-slate-700/30">
                        <button
                          onClick={() => onOpenBook(book)}
                          className={`flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-md text-[11px] font-medium transition-all ${
                            isDark
                              ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
                              : "bg-amber-600 text-white hover:bg-amber-700"
                          } shadow-sm active:scale-95`}
                          title="Read Online"
                        >
                          <BookOpen className="h-3 w-3" />
                          <span>படிக்க</span>
                        </button>

                        <button
                          onClick={() => onDownloadBook(book)}
                          className={`flex items-center justify-center p-1 rounded-md text-[11px] transition-all ${
                            isDark
                              ? "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-amber-400"
                              : "bg-slate-200 text-slate-700 hover:bg-slate-300 hover:text-amber-800"
                          } active:scale-95`}
                          title={`${book.title} PDF பதிவிறக்கம் (Download PDF)`}
                          aria-label={`Download ${book.title} PDF`}
                        >
                          <Download className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 text-center">
            <span className="text-[10px] text-slate-400 font-medium">
              காவியம் ரீடிங் · Kaviyam Reading
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default FloatingBookshelf;

import React from "react";
import { Bookmark, BookOpen, Trash2, ArrowRight } from "lucide-react";
import { Book } from "../types";
import { Language } from "../utils/i18n";
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
  const bookmarkedBooks = books.filter((b) => bookmarks.includes(b.id));

  return (
    <div className="space-y-6 font-sans pb-12">
      
      {/* Header */}
      <div>
        <h2 className="font-serif font-bold text-2xl text-[#3B0B12]">
          {lang === "ta" ? "என் புத்தக அலமாரி" : "My Bookshelf & Saved Collection"}
        </h2>
        <p className="text-xs text-stone-500 mt-1">
          {lang === "ta"
            ? "நீங்கள் வாசிக்க சேமித்து வைத்துள்ள நாவல்கள் மற்றும் காவியங்கள்"
            : "Your saved books and reading bookmarks list"}
        </p>
      </div>

      {bookmarkedBooks.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-[#E2DDD5] space-y-4 max-w-lg mx-auto my-8">
          <Bookmark className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="font-serif font-bold text-lg text-stone-800">
            {lang === "ta" ? "சேமிக்கப்பட்ட புத்தகங்கள் இல்லை" : "No Saved Books Yet"}
          </h3>
          <p className="text-xs text-stone-500 max-w-xs mx-auto">
            {lang === "ta"
              ? "நூலகத்திற்குச் சென்று உங்களுக்குப் பிடித்த நாவல்களை சேமித்து வைத்திடுங்கள்."
              : "Explore the library and click the bookmark icon on any book to save it here for quick reading access."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarkedBooks.map((book) => (
            <div
              key={book.id}
              className="p-5 rounded-3xl bg-white border border-[#E2DDD5] shadow-sm hover:shadow-md transition-shadow flex gap-5 items-center"
            >
              <div onClick={() => onSelectBook(book.id)} className="cursor-pointer shrink-0">
                <Book3D coverUrl={book.coverUrl} title={book.title} size="sm" tilt="hover" />
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <h3
                  onClick={() => onSelectBook(book.id)}
                  className="font-serif font-bold text-sm text-stone-900 hover:text-[#5C121E] cursor-pointer truncate"
                >
                  {book.title}
                </h3>
                <p className="text-xs text-stone-500 truncate">{book.author}</p>
                
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => onSelectBook(book.id)}
                    className="px-3 py-1.5 rounded-xl bg-[#5C121E] text-white text-xs font-semibold hover:bg-[#3B0B12] transition-colors flex items-center gap-1"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{lang === "ta" ? "வாசிக்க" : "Read"}</span>
                  </button>

                  <button
                    onClick={() => onRemoveBookmark(book.id)}
                    className="p-1.5 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Remove from bookmarks"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

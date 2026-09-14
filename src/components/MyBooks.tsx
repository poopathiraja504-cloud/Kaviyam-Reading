import React, { useState } from "react";
import { Bookmark, BookOpen, Trash2, FolderPlus, Download, Tag, Pin, Clock, CheckCircle } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<string>("all");
  const [shelves, setShelves] = useState<string[]>(["Favorites", "Sangam Classics", "Weekend Reads"]);
  const [showNewShelfModal, setShowNewShelfModal] = useState<boolean>(false);
  const [newShelfName, setNewShelfName] = useState<string>("");

  const bookmarkedBooks = books.filter((b) => bookmarks.includes(b.id));

  const handleCreateShelf = (e: React.FormEvent) => {
    e.preventDefault();
    if (newShelfName.trim()) {
      setShelves([...shelves, newShelfName.trim()]);
      setNewShelfName("");
      setShowNewShelfModal(false);
    }
  };

  const handleExportNotes = () => {
    const text = `Kaviyam Reading Notes Export\n---------------------------\nSaved Books Count: ${bookmarkedBooks.length}\n` +
      bookmarkedBooks.map(b => `- ${b.title} by ${b.author}`).join('\n');
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "kaviyam-reading-notes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-2xl text-[#3B0B12]">
            {lang === "ta" ? "என் புத்தக அலமாரி" : "My Bookshelf & Personal Library"}
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            {lang === "ta"
              ? "நீங்கள் வாசிக்க சேமித்து வைத்துள்ள நாவல்கள் மற்றும் காவியங்கள்"
              : "Organize collections, queue reads, pin titles, and export notes"}
          </p>
        </div>

        {/* Action Buttons: Create Shelf & Export Notes */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewShelfModal(true)}
            className="px-3 py-2 rounded-xl bg-white border border-[#E2DDD5] text-stone-800 text-xs font-bold hover:bg-[#3B0B12] hover:text-[#D4AF37] transition-all flex items-center gap-1.5 shadow-xs"
          >
            <FolderPlus className="w-4 h-4" />
            <span>📁 Create Shelf</span>
          </button>
          <button
            onClick={handleExportNotes}
            className="px-3 py-2 rounded-xl bg-[#5C121E] text-white text-xs font-bold hover:bg-[#3B0B12] transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>📤 Export Notes</span>
          </button>
        </div>
      </div>

      {/* Personal Organization Filter Tabs (Requested Buttons) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === "all" ? "bg-[#3B0B12] text-[#D4AF37]" : "bg-white border border-[#E2DDD5] text-stone-700 hover:bg-stone-50"
          }`}
        >
          📋 Reading Queue ({bookmarkedBooks.length})
        </button>
        <button
          onClick={() => setActiveTab("pinned")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === "pinned" ? "bg-[#3B0B12] text-[#D4AF37]" : "bg-white border border-[#E2DDD5] text-stone-700 hover:bg-stone-50"
          }`}
        >
          📌 Pinned
        </button>
        <button
          onClick={() => setActiveTab("recent")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === "recent" ? "bg-[#3B0B12] text-[#D4AF37]" : "bg-white border border-[#E2DDD5] text-stone-700 hover:bg-stone-50"
          }`}
        >
          🕘 Recently Read
        </button>
        <button
          onClick={() => setActiveTab("finished")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === "finished" ? "bg-[#3B0B12] text-[#D4AF37]" : "bg-white border border-[#E2DDD5] text-stone-700 hover:bg-stone-50"
          }`}
        >
          📚 Finished Books
        </button>
        <button
          onClick={() => setActiveTab("paused")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === "paused" ? "bg-[#3B0B12] text-[#D4AF37]" : "bg-white border border-[#E2DDD5] text-stone-700 hover:bg-stone-50"
          }`}
        >
          ⏸️ Paused Books
        </button>

        {/* Dynamic Shelves */}
        {shelves.map((shelf, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(`shelf-${shelf}`)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === `shelf-${shelf}` ? "bg-[#3B0B12] text-[#D4AF37]" : "bg-amber-50 border border-amber-200 text-amber-900"
            }`}
          >
            🗃️ {shelf}
          </button>
        ))}
      </div>

      {bookmarkedBooks.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-[#E2DDD5] space-y-4 max-w-lg mx-auto my-8">
          <Bookmark className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="font-serif font-bold text-lg text-stone-800">
            {lang === "ta" ? "உங்கள் நூலகத்தில் இன்னும் புத்தகங்கள் இல்லை" : "உங்கள் நூலகத்தில் இன்னும் புத்தகங்கள் இல்லை"}
          </h3>
          <p className="text-xs text-stone-500 max-w-xs mx-auto">
            {lang === "ta"
              ? "புத்தகங்களை ஆராய்க"
              : "புத்தகங்களை ஆராய்க"}
          </p>
          <div className="pt-2">
            <button 
              onClick={() => onSelectBook("")}
              className="px-4 py-2 bg-[#5C121E] hover:bg-[#3B0B12] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              புத்தகங்களை ஆராய்க
            </button>
          </div>
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

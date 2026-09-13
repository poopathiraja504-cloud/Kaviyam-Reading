import React, { useState } from "react";
import { 
  BookOpen, 
  Users, 
  Clock, 
  Bookmark, 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  PieChart, 
  Play, 
  PlusCircle, 
  ChevronRight,
  Award
} from "lucide-react";
import { Book } from "../types";
import { Language, translations } from "../utils/i18n";
import Book3D from "./Book3D";
import TiltCard from "./TiltCard";

interface TamilDashboardProps {
  books: Book[];
  onSelectBook: (bookId: string) => void;
  bookmarks: string[];
  onToggleBookmark: (bookId: string) => void;
  onAddCustomBook: (newBook: any) => void;
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
  const [ingestName, setIngestName] = useState("");
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestError, setIngestError] = useState<string | null>(null);

  const t = (key: keyof typeof translations["ta"]) => translations[lang][key] || key;

  // Handle AI Ingestion of missing Tamil book
  const handleIngestBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingestName.trim()) return;

    setIsIngesting(true);
    setIngestError(null);

    try {
      const response = await fetch("/api/gemini/ingest-book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookName: ingestName }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to compile requested book.");
      }

      const newBook: Book = {
        id: `ingested-${Date.now()}`,
        title: data.title || ingestName,
        author: data.author || "Tamil Historical Archives",
        description: data.description || `A curated masterpiece covering ${ingestName}.`,
        coverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400",
        genre: data.genre || "Classic",
        rating: 5.0,
        ratingCount: 120,
        chapters: data.chapters || [],
        reviews: [],
        isCustomAI: true,
      };

      onAddCustomBook(newBook);
      onSelectBook(newBook.id);
      setIngestName("");
    } catch (err: any) {
      setIngestError(err.message || "Could not retrieve the book.");
    } finally {
      setIsIngesting(false);
    }
  };

  // Mock Continue Reading items matching reference dashboard
  const continueReadingBooks = [
    {
      id: "ponniyin-selvan",
      title: "பொன்னியின் செல்வன்",
      author: "கல்கி",
      progress: 74,
      cover: "https://images.unsplash.com/photo-1608659597669-b45511779f93?auto=format&fit=crop&q=80&w=300"
    },
    {
      id: "silappatikaram",
      title: "சிலப்பதிகாரம்",
      author: "இளங்கோ அடிகள்",
      progress: 40,
      cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=300"
    },
    {
      id: "manimekalai",
      title: "மணிமேகலை",
      author: "சீத்தலை சாத்தனார்",
      progress: 60,
      cover: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=300"
    },
    {
      id: "bharathiyar-poems",
      title: "பாரதியார் கவிதைகள்",
      author: "சுப்பிரமணிய பாரதி",
      progress: 25,
      cover: "https://images.unsplash.com/photo-1510519138101-570d1dca3d66?auto=format&fit=crop&q=80&w=300"
    }
  ];

  return (
    <div className="space-y-8 font-sans pb-12">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2DDD5] shadow-sm">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#3B0B12]">
            {t("dashTitle")}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            {lang === "ta" ? "இன்றைய வாசிப்புச் சுருக்கம் மற்றும் முன்னேற்றம்" : "Your daily reading analytics & active bookshelf"}
          </p>
        </div>

        {/* AI Ingestion Quick Launcher */}
        <form onSubmit={handleIngestBook} className="w-full md:w-auto flex items-center gap-2">
          <input
            type="text"
            value={ingestName}
            onChange={(e) => setIngestName(e.target.value)}
            placeholder={lang === "ta" ? "புத்தகத்தின் பெயர் உள்ளிடுக..." : "Enter Tamil book title..."}
            className="w-full md:w-64 px-3 py-2 text-xs rounded-xl bg-[#F7F2EB] text-stone-900 border border-[#E2DDD5] focus:outline-none focus:border-[#3B0B12]"
          />
          <button
            type="submit"
            disabled={isIngesting}
            className="px-4 py-2 rounded-xl bg-[#3B0B12] text-[#D4AF37] text-xs font-semibold hover:brightness-110 flex items-center gap-1.5 flex-shrink-0 shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isIngesting ? "..." : (lang === "ta" ? "AI மூலம் தேடுக" : "AI Ingest")}</span>
          </button>
        </form>
      </div>

      {/* 4 Summary Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t("totalBooks"), count: "1,286", change: "+12 " + t("thisWeek"), icon: BookOpen },
          { label: t("totalAuthors"), count: "245", change: "+5 " + t("thisWeek"), icon: Users },
          { label: t("readingTime"), count: "48h 36m", change: "+5h " + t("thisWeek"), icon: Clock },
          { label: t("totalSeries"), count: "24", change: "+2 " + t("thisWeek"), icon: Bookmark },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <TiltCard
              key={i}
              className="p-5 rounded-2xl bg-white border border-[#E2DDD5] shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-between text-stone-500 mb-3">
                <span className="text-xs font-semibold text-stone-600">{stat.label}</span>
                <div className="w-8 h-8 rounded-xl bg-[#F7F2EB] flex items-center justify-center text-[#3B0B12]">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="font-serif text-2xl font-bold text-[#3B0B12]">{stat.count}</p>
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1">
                {stat.change}
              </span>
            </TiltCard>
          );
        })}
      </div>

      {/* Continue Reading Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-[#3B0B12] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#D4AF37]" />
            <span>{t("continueReading")}</span>
          </h2>
          <button className="text-xs font-semibold text-[#5C121E] hover:underline flex items-center gap-1">
            <span>{t("viewAll")}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {continueReadingBooks.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectBook(item.id)}
              className="group cursor-pointer p-3.5 rounded-2xl bg-white border border-[#E2DDD5] shadow-sm hover:border-[#D4AF37] hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div className="aspect-[3/4] w-full mb-3 relative">
                <Book3D
                  coverUrl={item.cover}
                  title={item.title}
                  overlay={
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-[#D4AF37] text-[#3B0B12] flex items-center justify-center shadow-xl">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  }
                />
              </div>

              <div>
                <h3 className="font-serif font-bold text-stone-900 text-sm truncate group-hover:text-[#3B0B12]">
                  {item.title}
                </h3>
                <p className="text-xs text-stone-500 truncate mt-0.5">{item.author}</p>

                {/* Progress Bar */}
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-stone-600">
                    <span>{t("progress")}</span>
                    <span className="text-[#3B0B12]">{item.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#D4AF37] to-[#3B0B12] rounded-full"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Section Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Reading Progress Line Graph (8 Cols) */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white border border-[#E2DDD5] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#3B0B12]">{t("readingActivity")}</h3>
              <p className="text-xs text-stone-500">
                {lang === "ta" ? "மாதாந்திர வாசிப்பு சதவீதங்கள்" : "Monthly reading completion percentages"}
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#F7F2EB] text-[#3B0B12]">
              2026
            </span>
          </div>

          {/* Canvas SVG Line Graph */}
          <div className="h-52 w-full pt-4 flex items-end justify-between gap-2 border-b border-[#E2DDD5] pb-2">
            {[
              { month: "Jan", val: 35 },
              { month: "Feb", val: 48 },
              { month: "Mar", val: 62 },
              { month: "Apr", val: 55 },
              { month: "May", val: 78 },
              { month: "Jun", val: 88 },
              { month: "Jul", val: 70 },
              { month: "Aug", val: 92 },
            ].map((d, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full flex justify-center items-end h-40">
                  <div
                    className="w-full max-w-[28px] bg-gradient-to-t from-[#3B0B12] to-[#D4AF37] rounded-t-lg group-hover:brightness-125 transition-all duration-300 relative"
                    style={{ height: `${d.val}%` }}
                  >
                    <span className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-[#3B0B12] text-[#D4AF37] text-[9px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap transition-opacity">
                      {d.val}%
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-stone-500">{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Genre Distribution Pie / Donut Chart (4 Cols) */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-white border border-[#E2DDD5] shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-lg text-[#3B0B12]">{t("genreDistribution")}</h3>

          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative w-36 h-36 rounded-full border-8 border-[#3B0B12] border-t-[#D4AF37] border-r-amber-700 flex items-center justify-center">
              <div className="text-center">
                <span className="text-2xl font-bold font-serif text-[#3B0B12]">100%</span>
                <span className="block text-[10px] text-stone-500 uppercase">{lang === "ta" ? "வகைகள்" : "Genres"}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs font-medium">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#3B0B12]" />
                {lang === "ta" ? "நாவல்கள்" : "Novels"}
              </span>
              <span className="font-bold text-stone-800">40%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#D4AF37]" />
                {lang === "ta" ? "காவியங்கள்" : "Epics"}
              </span>
              <span className="font-bold text-stone-800">25%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-700" />
                {lang === "ta" ? "கவிதைகள்" : "Poetry"}
              </span>
              <span className="font-bold text-stone-800">20%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-stone-300" />
                {lang === "ta" ? "கட்டுரைகள்" : "Essays"}
              </span>
              <span className="font-bold text-stone-800">15%</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

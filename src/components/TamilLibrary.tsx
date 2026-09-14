import React, { useState, useMemo } from "react";
import { 
  BookOpen, 
  Search, 
  Filter, 
  Star, 
  ExternalLink, 
  Globe, 
  BookMarked, 
  Play, 
  Sparkles, 
  Bookmark, 
  Download, 
  Layers,
  ArrowRight,
  Library as LibraryIcon
} from "lucide-react";
import { Book } from "../types";
import { Language, translations } from "../utils/i18n";
import Book3D from "./Book3D";
import TiltCard from "./TiltCard";

interface TamilLibraryProps {
  books: Book[];
  onSelectBook: (bookId: string) => void;
  bookmarks: string[];
  onToggleBookmark: (bookId: string) => void;
  onAddCustomBook: (newBook: any) => void;
  lang: Language;
}

export default function TamilLibrary({
  books,
  onSelectBook,
  bookmarks,
  onToggleBookmark,
  onAddCustomBook,
  lang,
}: TamilLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [selectedAuthor, setSelectedAuthor] = useState<string>("all");
  const [selectedSort, setSelectedSort] = useState<string>("popularity");

  // Ingest Novel state
  const [ingestName, setIngestName] = useState("");
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestResult, setIngestResult] = useState<Book | null>(null);
  const [ingestError, setIngestError] = useState<string | null>(null);

  const t = (key: string): string => {
    const res = (translations[lang] as Record<string, any>)[key];
    return typeof res === "string" ? res : key;
  };

  // Categories list matching user requirement #2
  const categories = [
    { id: "all", label: lang === "ta" ? "அனைத்து படைப்புகள்" : "All Literature" },
    { id: "classics", label: t("tamilClassics") },
    { id: "novels", label: t("tamilNovels") },
    { id: "historical", label: t("historicalNovels") },
    { id: "romance", label: t("romanticNovels") },
    { id: "stories", label: t("shortStories") },
    { id: "literary", label: t("literaryWorks") },
    { id: "modern", label: t("modernTamilLit") },
    { id: "free", label: t("freeTamilBooks") },
    { id: "rare", label: t("rareAcademicBooks") },
  ];

  // Major Online Archives & Databases (#3)
  const onlineArchives = [
    {
      title: "Tamil Digital Library (தமிழ் இணையக் கல்விக்கழகம்)",
      domain: "tamildigitallibrary.in",
      url: "https://tamildigitallibrary.in/",
      desc: lang === "ta"
        ? "100,000 க்கும் மேற்பட்ட அரிய தமிழ் ஏட்டுச்சுவடிகள், நூல்கள் மற்றும் இதழ்களின் டிஜிட்டல் காப்பகம்."
        : "Access over 100,000+ digitized rare Tamil palm-leaf manuscripts, books, and periodicals."
    },
    {
      title: "Free Tamil Ebooks (இலவச தமிழ் புத்தகங்கள்)",
      domain: "freetamilebooks.com",
      url: "https://freetamilebooks.com/",
      desc: lang === "ta"
        ? "கிரியேட்டிவ் காமன்ஸ் உரிமையுடைய நவீன மற்றும் செவ்வியல் தமிழ் மின்னூல்கள்."
        : "Creative Commons licensed contemporary and classical Tamil ebooks for open reading."
    },
    {
      title: "Tamil Books PDF / Project Madurai (மதுரைத் திட்டம்)",
      domain: "projectmadurai.org",
      url: "https://www.projectmadurai.org/",
      desc: lang === "ta"
        ? "சங்க இலக்கியம் முதல் தற்கால படைப்புகள் வரையிலான திறந்தநிலை மின்னூல் தொகுப்பு."
        : "Open electronic library of ancient, medieval, and modern Tamil literary classics."
    },
    {
      title: "Noolaham Digital Archive (நூலகம் நிறுவனம்)",
      domain: "noolaham.org",
      url: "http://www.noolaham.org/",
      desc: lang === "ta"
        ? "ஈழத்து தமிழ் ஆவணங்கள் மற்றும் கலாச்சார படைப்புகளின் சர்வதேச டிஜிட்டல் காப்பகம்."
        : "Digital documentation of Sri Lankan Tamil literature, periodicals, and cultural heritage."
    }
  ];

  // Contemporary & Romantic Novel Hubs (#4)
  const novelHubs = [
    {
      title: "SM Tamil Novels Forum",
      domain: "smtamilnovels.com",
      url: "https://smtamilnovels.com/",
      desc: lang === "ta"
        ? "பிரபல தமிழ் நாவலாசிரியர்களின் தொடர்கதைகள் மற்றும் வாசகர் விவாதக் கூடம்."
        : "Active reader community and serialization platform for popular Tamil romance and family fiction."
    },
    {
      title: "All Tamil Novels Blog",
      domain: "alltamilnovels.com",
      url: "https://alltamilnovels.com/",
      desc: lang === "ta"
        ? "தமிழ் நாவலாசிரியர்கள், தொடர்கதைகள் மற்றும் இலக்கிய விமர்சனங்களின் தொகுப்பு."
        : "Comprehensive index of Tamil writers, serial novels, and literary discussions."
    },
    {
      title: "Chillzee Tamil Novels",
      domain: "chillzee.in",
      url: "https://www.chillzee.in/",
      desc: lang === "ta"
        ? "நவீன தமிழ் காதல், த்ரில்லர் மற்றும் குடும்ப நாவல்களின் முன்னணி தளம்."
        : "Contemporary romance, mystery, and family drama Tamil stories."
    }
  ];

  // Handle Fetch Novel (Search & Fetch Novel #6)
  const handleFetchNovel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingestName.trim()) return;

    setIsIngesting(true);
    setIngestError(null);
    setIngestResult(null);

    try {
      const response = await fetch("/api/gemini/ingest-book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookName: ingestName }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "Could not retrieve the requested Tamil novel.");
      }

      const fetchedBook: Book = {
        id: `fetched-${Date.now()}`,
        title: data.title || ingestName,
        author: data.author || "Tamil Literature Archive",
        description: data.description || `Full curated edition of ${ingestName}.`,
        coverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400",
        genre: data.genre || "Classic",
        rating: 5.0,
        ratingCount: 150,
        chapters: data.chapters || [],
        reviews: [],
        isCustomAI: true,
      };

      setIngestResult(fetchedBook);
      onAddCustomBook(fetchedBook);
    } catch (err: any) {
      setIngestError(err.message || "Failed to fetch book.");
    } finally {
      setIsIngesting(false);
    }
  };

  // Filtered books
  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      const matchesQuery =
        !searchQuery.trim() ||
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGenre = selectedGenre === "all" || b.genre === selectedGenre;
      const matchesCategory =
        activeCategory === "all" ||
        (activeCategory === "classics" && (b.genre === "Classic" || b.genre === "Epic")) ||
        (activeCategory === "historical" && b.genre === "Adventure") ||
        (activeCategory === "novels" && b.genre !== "Poetry");

      return matchesQuery && matchesGenre && matchesCategory;
    });
  }, [books, searchQuery, selectedGenre, activeCategory]);

  return (
    <div className="space-y-10 font-sans pb-16">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#3B0B12] via-[#4A0E17] to-[#5C121E] text-white p-8 rounded-3xl border border-[#D4AF37]/30 shadow-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 text-xs font-semibold">
          <LibraryIcon className="w-4 h-4" />
          <span>{lang === "ta" ? "தமிழ் இலக்கிய டிஜிட்டல் நூலகம்" : "Official Tamil Literature Hub"}</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-white">
          {t("navTamilLibrary")}
        </h1>
        <p className="text-xs sm:text-sm text-amber-100/80 max-w-2xl">
          {lang === "ta"
            ? "சங்க இலக்கியங்கள், காவியங்கள், வரலாற்று நாவல்கள் மற்றும் இணையக் காப்பகங்களை ஒரே இடத்தில் கண்டறியுங்கள்."
            : "Explore classical Tamil epics, historical novels, short stories, rare archives, and contemporary community hubs."}
        </p>
      </div>

      {/* Category Navigation Pills (#2) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? "bg-[#3B0B12] text-[#D4AF37] border border-[#D4AF37]/40 shadow-md"
                : "bg-white text-stone-700 border border-[#E2DDD5] hover:bg-stone-50"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* SECTION 6: SEARCH & FETCH NOVEL (AI Ingest) */}
      <div className="p-6 rounded-3xl bg-white border border-[#E2DDD5] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-bold text-lg text-[#3B0B12] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
            <span>{t("fetchNovelTitle")}</span>
          </h2>
          <span className="text-[10px] font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-full">
            Gemini AI Ingestion
          </span>
        </div>

        <form onSubmit={handleFetchNovel} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={ingestName}
              onChange={(e) => setIngestName(e.target.value)}
              placeholder={t("fetchPlaceholder")}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[#FDFBF7] border border-[#E2DDD5] text-stone-900 focus:outline-none focus:border-[#3B0B12]"
            />
          </div>
          <button
            type="submit"
            disabled={isIngesting}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#3B0B12] text-[#D4AF37] font-bold text-xs shadow-md hover:brightness-110 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isIngesting ? "பெறுகிறது..." : t("fetchBtn")}</span>
          </button>
        </form>

        {/* Fetch Error or Result */}
        {ingestError && (
          <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
            {ingestError}
          </div>
        )}

        {ingestResult && (
          <div className="p-4 rounded-2xl bg-[#F7F2EB] border border-[#D4AF37]/40 flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-emerald-700 uppercase">✓ Successfully Compiled</span>
              <h3 className="font-serif font-bold text-sm text-[#3B0B12]">{ingestResult.title}</h3>
              <p className="text-xs text-stone-600">{ingestResult.author}</p>
            </div>
            <button
              onClick={() => onSelectBook(ingestResult.id)}
              className="px-4 py-2 rounded-xl bg-[#3B0B12] text-[#D4AF37] font-bold text-xs hover:brightness-110 flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{t("readNow")}</span>
            </button>
          </div>
        )}
      </div>

      {/* SECTION: TAMIL BOOKS GRID (#2) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-bold text-xl text-[#3B0B12] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#D4AF37]" />
            <span>{t("navTamilLibrary")} ({filteredBooks.length})</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
                      <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-[#D4AF37] backdrop-blur-md">
                        <Star className="w-3 h-3 fill-current" />
                      </div>
                    }
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#5C121E] uppercase tracking-wider block">
                    {book.genre}
                  </span>
                  <h3 className="font-serif font-bold text-stone-900 text-xs line-clamp-1 group-hover:text-[#3B0B12]">
                    {book.title}
                  </h3>
                  <p className="text-[11px] text-stone-500 truncate">{book.author}</p>

                  <div className="pt-3 flex items-center justify-between border-t border-stone-100 gap-1">
                    <button
                      onClick={() => onSelectBook(book.id)}
                      className="flex-1 py-1.5 rounded-lg bg-[#3B0B12] text-[#D4AF37] text-[10px] font-bold hover:brightness-110 flex items-center justify-center gap-1 shadow-xs"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{t("readNow")}</span>
                    </button>

                    <button
                      onClick={() => onToggleBookmark(book.id)}
                      className={`p-1.5 rounded-lg border transition-all ${
                        isBookmarked ? "bg-[#D4AF37] text-[#3B0B12] border-[#D4AF37]" : "border-[#E2DDD5] text-stone-500"
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 5: PERSONAL OFFLINE DOWNLOADS & PRESETS */}
      <div className="space-y-4">
        <h2 className="font-serif font-bold text-xl text-[#3B0B12] flex items-center gap-2">
          <Download className="w-5 h-5 text-[#D4AF37]" />
          <span>{t("offlinePresetsTitle")}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {books.slice(0, 4).map((book) => (
            <div
              key={book.id}
              className="p-4 rounded-2xl bg-white border border-[#E2DDD5] shadow-sm hover:border-[#D4AF37] transition-all flex gap-4 items-center"
            >
              <Book3D coverUrl={book.coverUrl} title={book.title} size="sm" />
              <div className="flex-1 min-w-0">
                <h3 className="font-serif font-bold text-sm text-[#3B0B12] truncate">{book.title}</h3>
                <p className="text-xs text-stone-500 truncate">{book.author}</p>
                <p className="text-[11px] text-stone-600 line-clamp-1 mt-1">{book.description}</p>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => onSelectBook(book.id)}
                    className="px-3 py-1 rounded-lg bg-[#3B0B12] text-[#D4AF37] text-xs font-bold hover:brightness-110 flex items-center gap-1"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{t("openLocalBook")}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: MAJOR ONLINE ARCHIVES & DATABASES */}
      <div className="space-y-4">
        <h2 className="font-serif font-bold text-xl text-[#3B0B12] flex items-center gap-2">
          <Globe className="w-5 h-5 text-[#D4AF37]" />
          <span>{t("onlineArchivesTitle")}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {onlineArchives.map((arc, idx) => (
            <TiltCard key={idx} className="p-5 rounded-2xl bg-white border border-[#E2DDD5] shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-stone-400 uppercase">{arc.domain}</span>
                  <ExternalLink className="w-4 h-4 text-stone-400" />
                </div>
                <h3 className="font-serif font-bold text-base text-[#3B0B12] mt-1">{arc.title}</h3>
                <p className="text-xs text-stone-600 leading-relaxed mt-1">{arc.desc}</p>
              </div>

              <a
                href={arc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 rounded-xl bg-[#F7F2EB] text-[#3B0B12] font-bold text-xs border border-[#E2DDD5] hover:bg-[#3B0B12] hover:text-[#D4AF37] transition-all flex items-center justify-center gap-1.5"
              >
                <span>{t("visitArchive")}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </TiltCard>
          ))}
        </div>
      </div>

      {/* SECTION 4: CONTEMPORARY & ROMANTIC NOVEL HUBS */}
      <div className="space-y-4">
        <h2 className="font-serif font-bold text-xl text-[#3B0B12] flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#D4AF37]" />
          <span>{t("novelHubsTitle")}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {novelHubs.map((hub, idx) => (
            <TiltCard key={idx} className="p-5 rounded-2xl bg-white border border-[#E2DDD5] shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-stone-400 uppercase">{hub.domain}</span>
                <h3 className="font-serif font-bold text-sm text-[#3B0B12] mt-1">{hub.title}</h3>
                <p className="text-xs text-stone-600 leading-relaxed mt-1">{hub.desc}</p>
              </div>

              <a
                href={hub.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 rounded-xl bg-[#F7F2EB] text-[#3B0B12] font-bold text-xs border border-[#E2DDD5] hover:bg-[#3B0B12] hover:text-[#D4AF37] transition-all flex items-center justify-center gap-1.5"
              >
                <span>{t("openCommunity")}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </TiltCard>
          ))}
        </div>
      </div>

    </div>
  );
}

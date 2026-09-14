import React, { useState, useMemo, useRef, useEffect } from "react";
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
  ChevronLeft,
  ChevronRight,
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
  externalCategory?: string;
  onCategoryChange?: (category: string) => void;
}

export default function TamilLibrary({
  books,
  onSelectBook,
  bookmarks,
  onToggleBookmark,
  onAddCustomBook,
  lang,
  externalCategory,
  onCategoryChange,
}: TamilLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [selectedAuthor, setSelectedAuthor] = useState<string>("all");
  const [selectedSort, setSelectedSort] = useState<string>("popularity");

  // Sync with external category prop
  useEffect(() => {
    if (externalCategory) {
      setActiveCategory(externalCategory);
    }
  }, [externalCategory]);

  const handleSetCategory = (catId: string) => {
    setActiveCategory(catId);
    if (onCategoryChange) {
      onCategoryChange(catId);
    }
  };

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

  // Major Online Archives & E-Book Libraries (6 Ref Links)
  const onlineArchives = [
    {
      title: "Free Tamil Ebooks (Creative Commons)",
      domain: "freetamilebooks.com",
      url: "https://freetamilebooks.com/",
      desc: lang === "ta"
        ? "கிரியேட்டிவ் காமன்ஸ் உரிமையுடைய திறந்தநிலை தமிழ் செவ்வியல் மற்றும் நவீன மின்புத்தகங்கள்."
        : "Thousands of copyright-free open access Tamil classic and contemporary novels for e-readers."
    },
    {
      title: "Tamil Books PDF (2000+ Novels Archive)",
      domain: "tamilbookspdf.com",
      url: "https://tamilbookspdf.com/",
      desc: lang === "ta"
        ? "2000-க்கும் மேற்பட்ட வரலாற்று நாவல்கள், துப்பறியும் கதைகள் மற்றும் தமிழ் இலக்கியப் பொக்கிஷங்கள்."
        : "Downloadable PDF collection of 2000+ Tamil novels, historical thrillers, and classics."
    },
    {
      title: "Free Tamil Books Portal",
      domain: "freetamilbooks.com",
      url: "https://freetamilbooks.com/",
      desc: lang === "ta"
        ? "தமிழ் இலக்கியங்கள், கட்டுரைகள், கவிதைகள் மற்றும் பொது அறிவு நூல்களின் இலவச மின் ஆவணம்."
        : "Open-source digital library archiving Tamil literature, historical essays, and poems."
    },
    {
      title: "Tamil Bookshelf Digital Library",
      domain: "tamilbookshelf.in",
      url: "https://tamilbookshelf.in/library.html#",
      desc: lang === "ta"
        ? "சங்க இலக்கியங்கள், காப்பியங்கள் மற்றும் அரிய வரலாற்று ஆய்வுகளின் பட்டியலிடப்பட்ட மின்னூலகம்."
        : "Curated digital bookshelf cataloging ancient classics, Sangam literature, and epics."
    },
    {
      title: "Tamilcube Free Tamil Books & Dictionaries",
      domain: "shop.tamilcube.com",
      url: "https://shop.tamilcube.com/tamil-books-free/",
      desc: lang === "ta"
        ? "சிங்கப்பூர் & உலகத் தமிழர்களுக்கான சிறுவர் கதைகள், இலக்கண நூல்கள் மற்றும் அகராதி."
        : "Singapore & global Tamil education portal offering free children's books and dictionaries."
    },
    {
      title: "TN Samacheer Kalvi School Textbooks",
      domain: "tntextbooks.in",
      url: "https://www.tntextbooks.in/p/school-books.html",
      desc: lang === "ta"
        ? "தமிழ்நாடு அரசு சமச்சீர் கல்வி 1 முதல் 12-ஆம் வகுப்பு வரையிலான அனைத்துப் பாடநூல்கள்."
        : "Official repository of Tamil Nadu State Board Samacheer Kalvi school textbooks (Std 1-12)."
    }
  ];

  // Contemporary & Serialized Novel Hubs (4 Ref Links)
  const novelHubs = [
    {
      title: "SM Tamil Novels Forum",
      domain: "forum.smtamilnovels.com",
      url: "https://forum.smtamilnovels.com/",
      desc: lang === "ta"
        ? "சுயாதீன தமிழ் நாவலாசிரியர்களின் தினசரி தொடர்கதைகள் மற்றும் வாசகர் விவாதக் கூடம்."
        : "Interactive reader community and serialization platform for romantic & family Tamil novels."
    },
    {
      title: "All Tamil Novels Download",
      domain: "alltamilnovelsdownload.blogspot.com",
      url: "https://alltamilnovelsdownload.blogspot.com/",
      desc: lang === "ta"
        ? "வரலாற்றுப் புதினங்கள், குடும்பக் கதைகள் மற்றும் பிரபல எழுத்தாளர்களின் நாவல் காப்பகம்."
        : "Comprehensive web archive containing historical novels, romantic series, and classics."
    },
    {
      title: "Chillzee Tamil Novels & Stories",
      domain: "chillzee.in",
      url: "https://www.chillzee.in/",
      desc: lang === "ta"
        ? "நவீன தமிழ் தொடர்கதைகள், சிறுகதைகள், காதல் நாவல்கள் மற்றும் ஆடியோ கதைகள்."
        : "Vibrant online portal for serialized novels, audio stories, mystery, and family fiction."
    },
    {
      title: "Pratilipi Tamil Story Community",
      domain: "tamil.pratilipi.com",
      url: "https://tamil.pratilipi.com/",
      desc: lang === "ta"
        ? "லட்சக்கணக்கான வாசகர்களைக் கொண்ட இந்தியாவின் முதன்மையான தமிழ் கதை & நாவல் தளம்."
        : "Largest digital storytelling network with millions of Tamil web series, romance, and fantasy."
    }
  ];

  // Tamil News & Regional Media Portals (6 Ref Links)
  const newsPortals = [
    {
      title: "Dinamani (தினமணி) - Daily Tamil Newspaper",
      domain: "dinamani.com",
      url: "https://www.dinamani.com/",
      desc: lang === "ta"
        ? "தூய தமிழ் இதழியல், இலக்கிய சிறப்பிதழ்கள் மற்றும் நடுநிலையான தேசிய செய்திகள்."
        : "Prestigious Tamil daily newspaper renowned for quality journalism and literary supplements."
    },
    {
      title: "Asianet News Tamil - Political Desk",
      domain: "tamil.asianetnews.com",
      url: "https://tamil.asianetnews.com/politics",
      desc: lang === "ta"
        ? "தமிழ்நாடு அரசியல் கள நிலவரங்கள், தேர்தல் செய்திகள் மற்றும் நேரலை பகுப்பாய்வுகள்."
        : "Fast-breaking political updates, assembly insights, and regional Tamil analysis."
    },
    {
      title: "Polimer News 24x7 Channel",
      domain: "polimernews.com",
      url: "https://www.polimernews.com/",
      desc: lang === "ta"
        ? "24 மணி நேரமும் நேரலை செய்திகள், மாவட்ட நடப்புகள் மற்றும் சிறப்பு புலனாய்வுச் செய்திகள்."
        : "24-hour satellite news network featuring live broadcasts, local headlines, and reports."
    },
    {
      title: "The New Indian Express",
      domain: "newindianexpress.com",
      url: "https://www.newindianexpress.com/",
      desc: lang === "ta"
        ? "தமிழ்நாடு மற்றும் தென்னிந்திய நடப்புகள், தேசிய செய்திகளைத் துல்லியமாக வழங்கும் நாளிதழ்."
        : "Major Indian English newspaper providing state reportage and investigative journalism."
    },
    {
      title: "DT Next - Chennai & TN Portal",
      domain: "dtnext.in",
      url: "https://www.dtnext.in/",
      desc: lang === "ta"
        ? "சென்னை மற்றும் தமிழகத்தின் கலாச்சார, வணிக மற்றும் சமூக நிகழ்வுகளை வழங்கும் இதழ்."
        : "Leading Chennai-based daily with rich city journalism, cultural features, and state news."
    },
    {
      title: "The Hindu - Tamil Nadu News Edition",
      domain: "thehindu.com",
      url: "https://www.thehindu.com/news/national/tamil-nadu/",
      desc: lang === "ta"
        ? "தமிழ்நாட்டின் சட்டம், சமூகம், அரசியல் மற்றும் பண்பாட்டு நிகழ்வுகளை ஆழமாக ஆராயும் செய்தியகம்."
        : "Authoritative statewide reportage on Tamil Nadu policies, heritage, and state developments."
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
  const categoriesRef = useRef<HTMLDivElement>(null);
  const discoveryRef = useRef<HTMLDivElement>(null);

  const scrollCategories = (direction: "left" | "right") => {
    if (categoriesRef.current) {
      categoriesRef.current.scrollBy({
        left: direction === "left" ? -220 : 220,
        behavior: "smooth",
      });
    }
  };

  const scrollDiscovery = (direction: "left" | "right") => {
    if (discoveryRef.current) {
      discoveryRef.current.scrollBy({
        left: direction === "left" ? -220 : 220,
        behavior: "smooth",
      });
    }
  };

  // 🔮 Surprise Me & Random Book Handler
  const handleSurpriseMe = () => {
    if (books.length === 0) return;
    const randomIndex = Math.floor(Math.random() * books.length);
    const randomBook = books[randomIndex];
    onSelectBook(randomBook.id);
  };

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

      {/* SECTION: TAMIL BOOKS (Single Row Horizontal Scroll Carousel) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-bold text-xl text-[#3B0B12] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#D4AF37]" />
            <span>{t("navTamilLibrary")} ({filteredBooks.length})</span>
          </h2>
          <span className="text-xs text-stone-500 font-sans italic">
            {lang === "ta" ? "கிடைமட்டமாக உருட்டவும் →" : "Scroll horizontally →"}
          </span>
        </div>

        <div className="flex items-stretch gap-4 overflow-x-auto pb-4 pt-1 px-1 custom-scrollbar snap-x">
          {filteredBooks.map((book) => {
            const isBookmarked = bookmarks.includes(book.id);
            return (
              <div
                key={book.id}
                className="w-44 sm:w-52 shrink-0 snap-start group p-3 rounded-2xl bg-white border border-[#E2DDD5] shadow-sm hover:border-[#D4AF37] hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                <div className="w-full mb-3 px-1 flex items-center justify-center">
                  <Book3D
                    coverUrl={book.coverUrl}
                    title={book.title}
                    size="md"
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
                      className="flex-1 py-1.5 rounded-lg bg-[#3B0B12] text-[#D4AF37] text-[10px] font-bold hover:brightness-110 flex items-center justify-center gap-1 shadow-xs truncate"
                    >
                      <Play className="w-3 h-3 fill-current shrink-0" />
                      <span className="truncate">{t("readNow")}</span>
                    </button>

                    <button
                      onClick={() => onToggleBookmark(book.id)}
                      className={`p-1.5 rounded-lg border transition-all shrink-0 ${
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

      {/* SECTION 5: PERSONAL OFFLINE DOWNLOADS & PRESETS (Single Row Horizontal Scroll) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-bold text-xl text-[#3B0B12] flex items-center gap-2">
            <Download className="w-5 h-5 text-[#D4AF37]" />
            <span>{t("offlinePresetsTitle")}</span>
          </h2>
          <span className="text-xs text-stone-500 font-sans italic">
            {lang === "ta" ? "கிடைமட்டமாக உருட்டவும் →" : "Scroll horizontally →"}
          </span>
        </div>

        <div className="flex items-stretch gap-4 overflow-x-auto pb-4 pt-1 px-1 custom-scrollbar snap-x">
          {books.slice(0, 4).map((book) => (
            <div
              key={book.id}
              className="w-72 sm:w-80 shrink-0 snap-start p-4 rounded-2xl bg-white border border-[#E2DDD5] shadow-sm hover:border-[#D4AF37] transition-all flex gap-3.5 items-center overflow-hidden min-w-0"
            >
              <div className="shrink-0 flex items-center justify-center">
                <Book3D coverUrl={book.coverUrl} title={book.title} size="sm" />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <h3 className="font-serif font-bold text-sm text-[#3B0B12] truncate">{book.title}</h3>
                <p className="text-xs text-stone-500 truncate">{book.author}</p>
                <p className="text-[11px] text-stone-600 line-clamp-2 mt-1">{book.description}</p>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => onSelectBook(book.id)}
                    className="px-3 py-1.5 rounded-xl bg-[#3B0B12] text-[#D4AF37] text-xs font-bold hover:brightness-110 flex items-center gap-1.5 shrink-0 max-w-full"
                  >
                    <Play className="w-3 h-3 fill-current shrink-0" />
                    <span className="truncate">{t("openLocalBook")}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: MAJOR ONLINE ARCHIVES & DATABASES (Single Row Horizontal Scroll) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-bold text-xl text-[#3B0B12] flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#D4AF37]" />
            <span>{t("onlineArchivesTitle")}</span>
          </h2>
          <span className="text-xs text-stone-500 font-sans italic">
            {lang === "ta" ? "கிடைமட்டமாக உருட்டவும் →" : "Scroll horizontally →"}
          </span>
        </div>

        <div className="flex items-stretch gap-4 overflow-x-auto pb-4 pt-1 px-1 custom-scrollbar snap-x">
          {onlineArchives.map((arc, idx) => (
            <TiltCard key={idx} className="w-72 sm:w-80 shrink-0 snap-start p-5 rounded-2xl bg-white border border-[#E2DDD5] shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-stone-400 uppercase">{arc.domain}</span>
                  <ExternalLink className="w-4 h-4 text-stone-400" />
                </div>
                <h3 className="font-serif font-bold text-base text-[#3B0B12] mt-1">{arc.title}</h3>
                <p className="text-xs text-stone-600 leading-relaxed mt-1 line-clamp-3">{arc.desc}</p>
              </div>

              <a
                href={arc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 rounded-xl bg-[#F7F2EB] text-[#3B0B12] font-bold text-xs border border-[#E2DDD5] hover:bg-[#3B0B12] hover:text-[#D4AF37] transition-all flex items-center justify-center gap-1.5 mt-2"
              >
                <span>{t("visitArchive")}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </TiltCard>
          ))}
        </div>
      </div>

      {/* SECTION 4: CONTEMPORARY & ROMANTIC NOVEL HUBS (Single Row Horizontal Scroll) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-bold text-xl text-[#3B0B12] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#D4AF37]" />
            <span>{t("novelHubsTitle")}</span>
          </h2>
          <span className="text-xs text-stone-500 font-sans italic">
            {lang === "ta" ? "கிடைமட்டமாக உருட்டவும் →" : "Scroll horizontally →"}
          </span>
        </div>

        <div className="flex items-stretch gap-4 overflow-x-auto pb-4 pt-1 px-1 custom-scrollbar snap-x">
          {novelHubs.map((hub, idx) => (
            <TiltCard key={idx} className="w-72 sm:w-80 shrink-0 snap-start p-5 rounded-2xl bg-white border border-[#E2DDD5] shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-stone-400 uppercase">{hub.domain}</span>
                <h3 className="font-serif font-bold text-sm text-[#3B0B12] mt-1">{hub.title}</h3>
                <p className="text-xs text-stone-600 leading-relaxed mt-1 line-clamp-3">{hub.desc}</p>
              </div>

              <a
                href={hub.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 rounded-xl bg-[#F7F2EB] text-[#3B0B12] font-bold text-xs border border-[#E2DDD5] hover:bg-[#3B0B12] hover:text-[#D4AF37] transition-all flex items-center justify-center gap-1.5 mt-2"
              >
                <span>{t("openCommunity")}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </TiltCard>
          ))}
        </div>
      </div>

      {/* SECTION: TAMIL NEWS & REGIONAL MEDIA PORTALS (Single Row Horizontal Scroll) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-bold text-xl text-[#3B0B12] flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#D4AF37]" />
            <span>{lang === "ta" ? "தமிழ் செய்திகள் & ஊடகங்கள்" : "Tamil News & Regional Media"}</span>
          </h2>
          <span className="text-xs text-stone-500 font-sans italic">
            {lang === "ta" ? "கிடைமட்டமாக உருட்டவும் →" : "Scroll horizontally →"}
          </span>
        </div>

        <div className="flex items-stretch gap-4 overflow-x-auto pb-4 pt-1 px-1 custom-scrollbar snap-x">
          {newsPortals.map((news, idx) => (
            <TiltCard key={idx} className="w-72 sm:w-80 shrink-0 snap-start p-5 rounded-2xl bg-white border border-[#E2DDD5] shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-stone-400 uppercase">{news.domain}</span>
                  <ExternalLink className="w-4 h-4 text-stone-400" />
                </div>
                <h3 className="font-serif font-bold text-sm text-[#3B0B12] mt-1">{news.title}</h3>
                <p className="text-xs text-stone-600 leading-relaxed mt-1 line-clamp-3">{news.desc}</p>
              </div>

              <a
                href={news.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 rounded-xl bg-[#F7F2EB] text-[#3B0B12] font-bold text-xs border border-[#E2DDD5] hover:bg-[#3B0B12] hover:text-[#D4AF37] transition-all flex items-center justify-center gap-1.5 mt-2"
              >
                <span>{lang === "ta" ? "செய்திகளை வாசிக்க" : "Read News Portal"}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </TiltCard>
          ))}
        </div>
      </div>

    </div>
  );
}

import React, { useState } from "react";
import { Globe, BookOpen, ExternalLink, Bookmark, MessageSquare, Download, Sparkles, BookMarked, Loader2, Search, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

interface TamilDashboardProps {
  onSelectBook: (bookId: string) => void;
  bookmarks: string[];
  onToggleBookmark: (bookId: string) => void;
  onAddCustomBook: (newBook: any) => void;
}

export default function TamilDashboard({
  onSelectBook,
  bookmarks,
  onToggleBookmark,
  onAddCustomBook,
}: TamilDashboardProps) {

  const [ingestName, setIngestName] = useState("");
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestError, setIngestError] = useState<string | null>(null);

  const handleIngestBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingestName.trim()) return;

    setIsIngesting(true);
    setIngestError(null);

    try {
      const response = await fetch("/api/gemini/ingest-book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookName: ingestName }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to retrieve or compile requested Tamil book.");
      }

      const newBook = {
        id: `ingested-${Date.now()}`,
        title: data.title || ingestName,
        author: data.author || "Tamil Historical Archives",
        description: data.description || `A curated bilingual masterpiece covering the epic story of ${ingestName}.`,
        coverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400",
        genre: data.genre || "Adventure",
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
      console.error("Ingestion error:", err);
      setIngestError(err.message || "Could not retrieve the book. Please try again.");
    } finally {
      setIsIngesting(false);
    }
  };

  const downloadHTMLDashboard = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="ta">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Tamil Novel Collection Dashboard</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f9; color: #333; margin: 0; padding: 20px; }
        header { background-color: #003366; color: white; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px; }
        .container { max-width: 1000px; margin: 0 auto; }
        .section { background: white; padding: 20px; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h2 { color: #003366; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px; }
        ul { list-style-type: none; padding: 0; }
        li { padding: 12px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
        li:last-child { border-bottom: none; }
        .btn { background-color: #28a745; color: white; padding: 6px 12px; text-decoration: none; border-radius: 4px; font-size: 14px; }
        .btn:hover { background-color: #218838; }
        .btn-visit { background-color: #007bff; }
        .btn-visit:hover { background-color: #0069d9; }
        .tag { background: #e9ecef; padding: 3px 8px; border-radius: 4px; font-size: 12px; color: #495057; }
    </style>
</head>
<body>

<div class="container">
    <header>
        <h1>தமிழ் நாவல்கள் நூலகம் (Tamil Novels Library)</h1>
        <p>Access and download thousands of Tamil books from primary web databases.</p>
    </header>

    <!-- SECTION 1: TOP DIGITAL LIBRARIES -->
    <div class="section">
        <h2>🌐 Major Online Archives & Databases</h2>
        <ul>
            <li>
                <div>
                    <strong>Tamil Digital Library</strong> <span class="tag">Rare &amp; Academic</span>
                    <br><small>Massive government archive of digitized historical books and rare texts.</small>
                </div>
                <a href="https://tamildigitallibrary.in" target="_blank" class="btn btn-visit">Visit Archive</a>
            </li>
            <li>
                <div>
                    <strong>Free Tamil Ebooks</strong> <span class="tag">Creative Commons</span>
                    <br><small>Thousands of copyright-free classics like Ponniyin Selvan, fully formatted.</small>
                </div>
                <a href="https://freetamilebooks.com" target="_blank" class="btn btn-visit">Visit Site</a>
            </li>
            <li>
                <div>
                    <strong>Tamil Books PDF</strong> <span class="tag">2000+ Novels</span>
                    <br><small>Collection featuring top contemporary, romance, and thriller authors.</small>
                </div>
                <a href="https://tamilbookspdf.com" target="_blank" class="btn btn-visit">Visit Site</a>
            </li>
        </ul>
    </div>

    <!-- SECTION 2: POPULAR COMMUNITY FORUMS -->
    <div class="section">
        <h2>💬 Contemporary & Romantic Novel Hubs</h2>
        <ul>
            <li>
                <div>
                    <strong>SM Tamil Novels Forum</strong> <span class="tag">Daily Updates</span>
                    <br><small>Popular forum for independent and romantic Tamil fiction web-novels.</small>
                </div>
                <a href="https://forum.smtamilnovels.com" target="_blank" class="btn btn-visit">Open Forum</a>
            </li>
            <li>
                <div>
                    <strong>All Tamil Novels Blog</strong> <span class="tag">Direct Downloads</span>
                    <br><small>Curated indexing site for popular romance and family story writers.</small>
                </div>
                <a href="https://alltamilnovelsdownload.blogspot.com" target="_blank" class="btn btn-visit">Open Blog</a>
            </li>
        </ul>
    </div>

    <!-- SECTION 3: LOCAL DOWNLOAD LINKS (Add your own links here) -->
    <div class="section">
        <h2>📂 My Personal Offline Downloads / Links</h2>
        <p><small><em>Edit this section in your HTML file to add direct paths to PDFs saved on your hard drive!</em></small></p>
        <ul>
            <li>
                <div><strong>Kalki - Ponniyin Selvan (Full Book)</strong></div>
                <!-- Replace '#' with your actual downloaded file path, e.g., 'C:/Books/Ponniyin_Selvan.pdf' -->
                <a href="#" class="btn">Open Local PDF</a>
            </li>
            <li>
                <div><strong>Sandilyan - Yavana Rani</strong></div>
                <a href="#" class="btn">Open Local PDF</a>
            </li>
        </ul>
    </div>
</div>

</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Tamil_Novels_Library_Dashboard.html");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const archives = [
    {
      title: "Tamil Digital Library",
      tag: "Rare & Academic",
      desc: "Massive government archive of digitized historical books, manuscripts, and rare scholarly texts.",
      url: "https://tamildigitallibrary.in",
      domain: "tamildigitallibrary.in"
    },
    {
      title: "Free Tamil Ebooks",
      tag: "Creative Commons",
      desc: "Thousands of copyright-free Tamil classics, formatted professionally for mobile readers and e-readers.",
      url: "https://freetamilebooks.com",
      domain: "freetamilebooks.com"
    },
    {
      title: "Tamil Books PDF",
      tag: "2000+ Novels",
      desc: "Curated collection featuring contemporary, romantic, detective and historical thriller novels.",
      url: "https://tamilbookspdf.com",
      domain: "tamilbookspdf.com"
    }
  ];

  const forums = [
    {
      title: "SM Tamil Novels Forum",
      tag: "Daily Updates",
      desc: "Leading active forum for independent writers and romantic Tamil web-novelists.",
      url: "https://forum.smtamilnovels.com",
      domain: "forum.smtamilnovels.com"
    },
    {
      title: "All Tamil Novels Blog",
      tag: "Direct Downloads",
      desc: "Curated indexing and hosting site for popular contemporary romance and family drama writers.",
      url: "https://alltamilnovelsdownload.blogspot.com",
      domain: "alltamilnovelsdownload.blogspot.com"
    }
  ];

  const localBooks = [
    {
      id: "ponniyin-selvan",
      title: "Kalki - Ponniyin Selvan (Full Book)",
      desc: "The timeless historical thriller epic describing the rise of Rajaraja Chola. Fully integrated bilingually into the reader.",
      btnText: "Open Local Book"
    },
    {
      id: "yavana-rani",
      title: "Sandilyan - Yavana Rani (Full Book)",
      desc: "A thrilling ancient maritime adventure featuring Chola commanders and a Roman Queen.",
      btnText: "Open Local Book"
    }
  ];

  return (
    <div className="space-y-8 text-left" id="tamil-dashboard-root">
      
      {/* Tamil Header Banner */}
      <div className="relative bg-gradient-to-r from-[#003366] to-[#001f3f] text-white rounded-3xl p-6 md:p-8 overflow-hidden shadow-md">
        {/* Decorative background grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#004080] via-[#002244] to-[#001122] opacity-90 z-0" />
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#bfa030]/10 blur-[50px] rounded-full pointer-events-none z-0" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md text-[#bfa030] text-[10px] tracking-wider uppercase font-mono font-bold rounded-full border border-white/10">
            <Sparkles size={11} className="animate-pulse" /> தமிழ் நாவல்கள் நூலகம்
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-extrabold text-white">
            Tamil Novels Library & Dashboard
          </h1>
          <p className="text-stone-300 text-xs md:text-sm max-w-2xl leading-relaxed font-serif">
            Welcome to your curated Tamil literary terminal! Access thousands of classics and contemporary stories from top digital archives, or read pre-loaded masterpiece editions directly inside our eye-safe, sandboxed reader.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Archives and Forums */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Instant Open Archive Book Ingestor - Guest Compatible */}
          <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-sm space-y-4 text-left relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#003366] to-[#bfa030]" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search size={18} className="text-[#003366]" />
                <h2 className="font-serif text-base font-bold text-stone-800">
                  📖 Open Archive: Instant Book Ingestion
                </h2>
              </div>
              <span className="text-[9px] font-mono font-bold text-[#bfa030] uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                No Login Required
              </span>
            </div>
            
            <p className="text-stone-600 text-xs leading-relaxed font-serif">
              Access the open literary archives immediately! Simply enter the specific name of any Tamil classic, contemporary, or modern novel below. The system will securely locate, translate, format, and ingest it into your offline reading tray instantly.
            </p>

            <form onSubmit={handleIngestBook} className="space-y-3 pt-1">
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                  Book Name / Novel Title
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g., Sivagamiyin Sabatham, Parthiban Kanavu, Kadal Pura, Alai Osai..."
                    value={ingestName}
                    onChange={(e) => setIngestName(e.target.value)}
                    disabled={isIngesting}
                    className="flex-grow px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 placeholder-stone-400 text-xs focus:outline-none focus:border-stone-400 focus:bg-white transition-all"
                    id="guest-ingest-book-input"
                  />
                  <button
                    type="submit"
                    disabled={isIngesting || !ingestName.trim()}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shrink-0 ${
                      isIngesting || !ingestName.trim()
                        ? "bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed"
                        : "bg-[#003366] hover:bg-[#002244] text-white shadow-sm"
                    }`}
                    id="guest-ingest-submit-btn"
                  >
                    {isIngesting ? (
                      <>
                        <Loader2 className="animate-spin text-white" size={13} />
                        Ingesting...
                      </>
                    ) : (
                      <>
                        Fetch Novel
                        <ArrowRight size={13} />
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {ingestError && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl">
                  {ingestError}
                </div>
              )}
            </form>
          </div>

          {/* Section 1: Major Online Archives */}
          <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-sm space-y-5 text-left">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <Globe size={18} className="text-[#003366]" />
              <h2 className="font-serif text-base font-bold text-stone-800">
                🌐 Major Online Archives & Databases
              </h2>
            </div>
            
            <div className="space-y-4">
              {archives.map((archive, idx) => (
                <div 
                  key={idx}
                  className="p-4 border border-stone-100 bg-stone-50/50 rounded-2xl hover:border-stone-200/80 hover:bg-white transition duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong className="text-stone-800 font-serif text-sm">{archive.title}</strong>
                      <span className="text-[9px] font-mono font-bold uppercase bg-stone-200 text-stone-700 px-2 py-0.5 rounded">
                        {archive.tag}
                      </span>
                    </div>
                    <p className="text-stone-500 text-xs leading-relaxed max-w-lg">{archive.desc}</p>
                    <span className="text-[10px] font-mono text-[#003366] hover:underline cursor-pointer block pt-0.5">
                      {archive.domain}
                    </span>
                  </div>
                  
                  <a 
                    href={archive.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    referrerPolicy="no-referrer"
                    className="w-full sm:w-auto px-4 py-2 bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 flex-shrink-0"
                  >
                    Visit Archive
                    <ExternalLink size={12} />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Forums & Communities */}
          <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-sm space-y-5 text-left">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <MessageSquare size={18} className="text-[#003366]" />
              <h2 className="font-serif text-base font-bold text-stone-800">
                💬 Contemporary & Romantic Novel Hubs
              </h2>
            </div>
            
            <div className="space-y-4">
              {forums.map((forum, idx) => (
                <div 
                  key={idx}
                  className="p-4 border border-stone-100 bg-stone-50/50 rounded-2xl hover:border-stone-200/80 hover:bg-white transition duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong className="text-stone-800 font-serif text-sm">{forum.title}</strong>
                      <span className="text-[9px] font-mono font-bold uppercase bg-stone-200 text-stone-700 px-2 py-0.5 rounded">
                        {forum.tag}
                      </span>
                    </div>
                    <p className="text-stone-500 text-xs leading-relaxed max-w-lg">{forum.desc}</p>
                    <span className="text-[10px] font-mono text-[#003366] hover:underline cursor-pointer block pt-0.5">
                      {forum.domain}
                    </span>
                  </div>
                  
                  <a 
                    href={forum.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    referrerPolicy="no-referrer"
                    className="w-full sm:w-auto px-4 py-2 bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 flex-shrink-0"
                  >
                    Open Community
                    <ExternalLink size={12} />
                  </a>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right column: Local reads / Offline Downloads */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-sm space-y-5 text-left relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-[#bfa030]" />

            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <Download size={18} className="text-[#bfa030]" />
              <h2 className="font-serif text-base font-bold text-stone-800">
                📂 Personal Offline Downloads & Presets
              </h2>
            </div>
            
            <p className="text-[11px] text-stone-500 leading-relaxed font-serif">
              Open preset epic volumes or link files below. You can bookmark them to add them directly to your personal reading shelf for safe session logging!
            </p>

            <div className="space-y-4 pt-2">
              {localBooks.map((book) => {
                const isBookmarked = bookmarks.includes(book.id);
                return (
                  <div 
                    key={book.id}
                    className="p-4 border border-stone-150 bg-[#faf9f5] rounded-2xl flex flex-col justify-between space-y-3 shadow-inner hover:bg-amber-50/20 transition duration-200"
                  >
                    <div className="space-y-1">
                      <h4 className="font-serif font-bold text-stone-800 text-xs">
                        {book.title}
                      </h4>
                      <p className="text-[10px] text-stone-500 leading-relaxed">
                        {book.desc}
                      </p>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => onSelectBook(book.id)}
                        className="flex-1 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg transition text-center shadow-sm"
                      >
                        {book.btnText}
                      </button>
                      
                      <button
                        onClick={() => onToggleBookmark(book.id)}
                        className={`px-2.5 py-1.5 border rounded-lg transition flex items-center justify-center ${
                          isBookmarked 
                            ? "bg-[#bfa030] border-[#aa8e28] text-black" 
                            : "bg-white border-stone-200 text-stone-500 hover:text-stone-800"
                        }`}
                        title={isBookmarked ? "Remove Bookmark" : "Save to Bookshelf"}
                      >
                        <Bookmark size={13} className={isBookmarked ? "fill-current" : ""} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-stone-50 border border-stone-150 rounded-xl text-[10px] text-stone-500 leading-relaxed font-serif">
              <strong>Local Path Configuration:</strong> In your downloaded HTML collection dashboard, you can substitute `#` links with paths like <code>file:///C:/Books/Ponniyin_Selvan.pdf</code> to access hard-drive copies seamlessly.
            </div>
          </div>

          {/* Standalone Dashboard Download Card */}
          <div className="bg-[#f0f4f8] border border-blue-100 rounded-2xl p-5 text-left space-y-3.5 shadow-sm">
            <span className="text-[9px] font-mono font-bold text-[#003366] uppercase tracking-wider block">Standalone Asset</span>
            <h4 className="font-serif font-bold text-xs text-stone-800">My Tamil Novel Collection Dashboard</h4>
            <p className="text-[10px] text-stone-600 leading-relaxed font-serif">
              You can export the original styled, self-contained HTML dashboard file to run offline directly from your computer.
            </p>
            <button
              onClick={downloadHTMLDashboard}
              className="w-full py-2 bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold rounded-xl transition duration-200 flex items-center justify-center gap-1.5 shadow-sm"
              id="download-html-dashboard-btn"
            >
              <Download size={13} />
              Download Offline HTML
            </button>
          </div>

          {/* Quick Info Box */}
          <div className="bg-[#fdfcf7] border border-amber-100 rounded-2xl p-5 text-left space-y-2.5 shadow-sm">
            <span className="text-[9px] font-mono font-bold text-amber-800 uppercase tracking-wider block">Platform Integration</span>
            <h4 className="font-serif font-bold text-xs text-stone-800">Bilingual Reading Engine</h4>
            <p className="text-[10px] text-stone-600 leading-relaxed font-serif">
              Kaviyam Reading's built-in reader parses authentic Tamil Unicode scripts perfectly. Choose the sepia theme for an authentic historical paper feel!
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

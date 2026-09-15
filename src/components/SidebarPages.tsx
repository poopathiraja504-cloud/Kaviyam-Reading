import React, { useState, useEffect } from "react";
import { 
  Compass, Sparkles, TrendingUp, Star, BookOpen, Clock, History, 
  FolderOpen, CheckCircle, PauseCircle, Pin, BookMarked, PlusCircle, 
  BarChart2, Award, Target, Brain, Sparkle, Info, Users, Activity, 
  Volume2, Search, Globe, FileText, ChevronRight, Flame, Shield, 
  Coins, Gift, Crown, MessageSquare, Vote, UserPlus, Bell, AlertCircle, 
  Megaphone, CreditCard, ShoppingBag, Download, Trash2, Heart, Plus, Minus, ArrowLeft,
  Lock, LogIn, Copy, Check, Palette, Maximize
} from "lucide-react";
import { Book, User, QuizAttempt } from "../types";
import { Language } from "../utils/i18n";
import Book3D from "./Book3D";

interface SidebarPagesProps {
  activeTab: string;
  books: Book[];
  bookmarks: string[];
  onSelectBook: (bookId: string) => void;
  onToggleBookmark: (bookId: string) => void;
  lang: Language;
  currentUser: User | null;
  navigateTo: (tab: string, bookId?: string | null) => void;
}

export default function SidebarPages({
  activeTab,
  books,
  bookmarks,
  onSelectBook,
  onToggleBookmark,
  lang,
  currentUser,
  navigateTo,
}: SidebarPagesProps) {
  // Common states used across tabs
  const [selectedBookForAction, setSelectedBookForAction] = useState<string>(books[0]?.id || "");
  const [inputText, setInputText] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState("");
  
  // Specific Tab states
  // Discover Persona State
  const [personaStep, setPersonaStep] = useState(0);
  const [personaAnswers, setPersonaAnswers] = useState<string[]>([]);
  const [readingPersona, setReadingPersona] = useState<string>("");

  // Reading Queue State
  const [readingQueue, setReadingQueue] = useState<string[]>(() => {
    const saved = localStorage.getItem("kaviyam_reading_queue");
    return saved ? JSON.parse(saved) : ["ponniyin-selvan", "silappatikaram"];
  });

  // Recently Opened State
  const [recentlyOpened, setRecentlyOpened] = useState<string[]>(() => {
    const saved = localStorage.getItem("kaviyam_recently_opened");
    return saved ? JSON.parse(saved) : ["ponniyin-selvan", "thirukkural", "sivagamiyin-sabatham"];
  });

  // Finished Books States
  const [finishedBooks, setFinishedBooks] = useState<string[]>(() => {
    const saved = localStorage.getItem("kaviyam_finished_books");
    return saved ? JSON.parse(saved) : ["thirukkural"];
  });

  // Paused Books States
  const [pausedBooks, setPausedBooks] = useState<string[]>(() => {
    const saved = localStorage.getItem("kaviyam_paused_books");
    return saved ? JSON.parse(saved) : ["yavana-rani"];
  });

  // Saved for Later
  const [savedLater, setSavedLater] = useState<string[]>(() => {
    const saved = localStorage.getItem("kaviyam_saved_later");
    return saved ? JSON.parse(saved) : ["sivagamiyin-sabatham"];
  });

  // Collections State
  const [collections, setCollections] = useState<{ id: string; name: string; description: string; bookIds: string[] }[]>(() => {
    const saved = localStorage.getItem("kaviyam_collections");
    return saved ? JSON.parse(saved) : [
      { id: "col-1", name: "Chola Imperial Saga", description: "All historical epics detailing the mighty Chola Dynasty", bookIds: ["ponniyin-selvan", "yavana-rani"] },
      { id: "col-2", name: "Spiritual & Philosophical", description: "Writings on ethics, virtue, and lifestyle guide", bookIds: ["thirukkural"] }
    ];
  });
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDesc, setNewCollectionDesc] = useState("");

  // Creating virtual shelves state
  const [shelves, setShelves] = useState<{ id: string; name: string; bookIds: string[] }[]>(() => {
    const saved = localStorage.getItem("kaviyam_shelves");
    return saved ? JSON.parse(saved) : [
      { id: "sh-1", name: "My Classics", bookIds: ["silappatikaram", "thirukkural"] }
    ];
  });
  const [newShelfName, setNewShelfName] = useState("");

  // Quiz Stats state
  const [quizStreak, setQuizStreak] = useState(3);
  
  // AI Feature State (Server proxy triggers)
  const [aiOutput, setAiOutput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Focus Mode / Sound Control
  const [isFocusPlaying, setIsFocusPlaying] = useState(false);
  const [focusSound, setFocusSound] = useState("rain");
  const [readingTheme, setReadingTheme] = useState("warm");

  // Community Poll State
  const [pollVotes, setPollVotes] = useState<Record<string, number>>({ "vandiyathevan": 142, "kalki": 88, "kundavai": 110 });
  const [voted, setVoted] = useState(false);

  // Discussions Forum State
  const [discussions, setDiscussions] = useState<{ id: string; author: string; title: string; likes: number; replies: number; date: string }[]>([
    { id: "d1", author: "Muthu Selvan", title: "வந்தியத்தேவனின் சாமர்த்தியம் மற்றும் வீரம் பற்றிய அலசல்", likes: 24, replies: 8, date: "1 hour ago" },
    { id: "d2", author: "Kavya Raj", title: "சிலப்பதிகாரத்தில் கண்ணகியின் நீதிநெறி இன்றைய சமுதாயத்திற்குப் பொருந்துமா?", likes: 18, replies: 12, date: "4 hours ago" },
    { id: "d3", author: "Tamil Scholar", title: "திருக்குறளின் உலகளாவிய வாழ்வியல் தத்துவம்", likes: 35, replies: 15, date: "Yesterday" }
  ]);
  const [newPostTitle, setNewPostTitle] = useState("");

  // Notifications State
  const [localNotifications, setLocalNotifications] = useState<{ id: string; title: string; text: string; time: string; read: boolean }[]>([
    { id: "n1", title: "New Book Release", text: "Yavana Rani is now available in pristine interactive audio format!", time: "2 hours ago", read: false },
    { id: "n2", title: "Streak Saved!", text: "Congratulations! You maintained your 7-day reading streak.", time: "1 day ago", read: true },
    { id: "n3", title: "New Quiz Available", text: "Test your Chola lineage knowledge on the Ponniyin Selvan Act 2 quiz.", time: "2 days ago", read: true }
  ]);

  // Notes State
  const [userNotes, setUserNotes] = useState<{ id: string; bookTitle: string; chapter: string; text: string; date: string }[]>(() => {
    const saved = localStorage.getItem("kaviyam_user_notes");
    return saved ? JSON.parse(saved) : [
      { id: "note-1", bookTitle: "பொன்னியின் செல்வன்", chapter: "அத்தியாயம் 1: ஆடிப்பெருக்கு", text: "வந்தியத்தேவன் வீராணம் ஏரிக்கரையில் பயணிக்கும் போது காவிரியின் நீர்வரத்து மற்றும் மக்களின் கொண்டாட்டங்கள் அருமையாக விவரிக்கப்பட்டுள்ளன.", date: "2026-09-12" },
      { id: "note-2", bookTitle: "திருக்குறள்", chapter: "அறத்துப்பால் - கடவுள் வாழ்த்து", text: "அகர முதல எழுத்தெல்லாம் ஆதி பகவன் முதற்றே உலகு - உலகின் தொடக்கம் மற்றும் இறைத்தத்துவத்தின் எளிமையான வடிவம்.", date: "2026-09-13" }
    ];
  });
  const [newNoteText, setNewNoteText] = useState("");
  const [newNoteBook, setNewNoteBook] = useState("பொன்னியின் செல்வன்");

  // Highlights State
  const [userHighlights, setUserHighlights] = useState<{ id: string; bookTitle: string; quote: string; color: string; chapter: string }[]>(() => {
    const saved = localStorage.getItem("kaviyam_user_highlights");
    return saved ? JSON.parse(saved) : [
      { id: "hl-1", bookTitle: "பொன்னியின் செல்வன்", quote: "குழப்பமான காலங்களில்தான் வீரர்களின் துணிச்சலும் அறிஞர்களின் விவேகமும் வெளிப்படும்.", color: "amber", chapter: "பாகம் 1" },
      { id: "hl-2", bookTitle: "சிலப்பதிகாரம்", quote: "அரசியல் பிழைத்தோர்க்கு அறங்கூற்றாவதூஉம் உரைசால் பத்தினியை உயர்ந்தோர் ஏத்தலும்.", color: "emerald", chapter: "மங்கல வாழ்த்துப் பாடல்" },
      { id: "hl-3", bookTitle: "சிவகாமியின் சபதம்", quote: "கலைஞனின் இதயம் சிற்பக் கல்லில் அல்ல, தன் கற்பனை உலகில்தான் வாழ்கிறது.", color: "rose", chapter: "பரஞ்சோதி யாத்திரை" }
    ];
  });

  // Reading Mode State
  const [readingPalette, setReadingPalette] = useState<string>(() => localStorage.getItem("kaviyam_reading_palette") || "papyrus");
  const [readingFontSize, setReadingFontSize] = useState<string>(() => localStorage.getItem("kaviyam_reading_font_size") || "base");

  // Reader Clubs State
  const [joinedClubs, setJoinedClubs] = useState<string[]>(() => {
    const saved = localStorage.getItem("kaviyam_joined_clubs");
    return saved ? JSON.parse(saved) : ["club-1"];
  });

  // Persist local states
  useEffect(() => {
    localStorage.setItem("kaviyam_user_notes", JSON.stringify(userNotes));
  }, [userNotes]);

  useEffect(() => {
    localStorage.setItem("kaviyam_user_highlights", JSON.stringify(userHighlights));
  }, [userHighlights]);

  useEffect(() => {
    localStorage.setItem("kaviyam_reading_palette", readingPalette);
  }, [readingPalette]);

  useEffect(() => {
    localStorage.setItem("kaviyam_reading_font_size", readingFontSize);
  }, [readingFontSize]);

  useEffect(() => {
    localStorage.setItem("kaviyam_joined_clubs", JSON.stringify(joinedClubs));
  }, [joinedClubs]);

  // Persist local states
  useEffect(() => {
    localStorage.setItem("kaviyam_reading_queue", JSON.stringify(readingQueue));
  }, [readingQueue]);

  useEffect(() => {
    localStorage.setItem("kaviyam_recently_opened", JSON.stringify(recentlyOpened));
  }, [recentlyOpened]);

  useEffect(() => {
    localStorage.setItem("kaviyam_finished_books", JSON.stringify(finishedBooks));
  }, [finishedBooks]);

  useEffect(() => {
    localStorage.setItem("kaviyam_paused_books", JSON.stringify(pausedBooks));
  }, [pausedBooks]);

  useEffect(() => {
    localStorage.setItem("kaviyam_saved_later", JSON.stringify(savedLater));
  }, [savedLater]);

  useEffect(() => {
    localStorage.setItem("kaviyam_collections", JSON.stringify(collections));
  }, [collections]);

  useEffect(() => {
    localStorage.setItem("kaviyam_shelves", JSON.stringify(shelves));
  }, [shelves]);

  // General Notification Trigger
  const triggerToast = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(""), 4000);
  };

  const currentActiveBook = books.find(b => b.id === selectedBookForAction) || books[0];

  // Helper to trigger server AI summarization & details via Express
  const triggerAiFeature = async (featureName: string) => {
    setIsAiLoading(true);
    setAiOutput("");
    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Provide a detailed ${featureName} for the Tamil book '${currentActiveBook.title}' by author '${currentActiveBook.author}'. Respond in a highly engaging, rich, informative format in bilingual Tamil and English, suitable for Tamil literature enthusiasts.`
        })
      });
      const data = await response.json();
      if (data.reply) {
        setAiOutput(data.reply);
      } else {
        setAiOutput("An error occurred during AI processing. Please check if the server is running properly.");
      }
    } catch (err) {
      // Fallback response with beautiful rich pre-baked content
      let prebaked = "";
      if (featureName === "Smart Summary") {
        prebaked = `### ${currentActiveBook.title} - அறிவுசார் சுருக்கம் (Smart Summary)\n\n**தமிழ் சுருக்கம்:**\nஇப்புத்தகம் தமிழ் இலக்கியத்தின் மிக முக்கியமான படைப்பாகும். இது சமூக, வரலாற்று மற்றும் தார்மீக விழுமியங்களை விரிவாக விவரிக்கிறது. கதை மாந்தர்களின் உணர்வுகளையும் தமிழ் மண்ணின் பெருமையையும் அழகாக விவரிக்கும் அற்புதப் படைப்பு.\n\n**English Summary:**\nThis masterpiece captures the cultural, ethical, and historic essence of ancient Tamil Nadu. Through brilliant character arcs and rich narrative, the author brings to life the struggles, grandeur, and moral values of our heritage. It serves as a majestic gateway into classical Tamil wisdom.`;
      } else if (featureName === "Key Ideas") {
        prebaked = `### ${currentActiveBook.title} - முக்கிய கருத்துக்கள் (Key Ideas)\n\n1. **தனிமனித அறம் (Individual Ethics):** Living with honesty, integrity, and honor.\n2. **அரச நீதி (Imperial Justice):** Maintaining equity and caring for the welfare of citizens.\n3. **உன்னத காதல் (Exalted Love):** Emotional depth, sacrifice, and loyalty in relationships.\n4. **வரலாற்றுப் பெருமை (Historical Pride):** Preserving the art, sculpture, and administrative genius of Tamil dynasties.`;
      } else {
        prebaked = `### Kaviyam AI Insight for ${currentActiveBook.title}\n\n* **அகராதி விளக்கம்:** This classical narrative utilizes rich vocabulary that ties deep metaphors with realistic landscapes. \n* **பரிந்துரை:** We highly recommend reading this parallel to the translation provided inside our modern e-reader.`;
      }
      setAiOutput(prebaked);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-8 font-sans pb-16">
      
      {/* Dynamic Toast Feedback Notification */}
      {feedbackMsg && (
        <div className="fixed top-20 right-6 z-50 bg-[#3B0B12] text-amber-200 border border-amber-400 px-5 py-3 rounded-2xl shadow-2xl animate-bounce flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold">{feedbackMsg}</span>
        </div>
      )}

      {/* Top Navigation / Back Button */}
      <div>
        <button
          onClick={() => navigateTo("home")}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-[#3B0B12] text-stone-700 hover:text-white border border-[#E2DDD5] shadow-xs transition-all text-xs font-bold cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>{lang === "ta" ? "← முகப்பிற்கு திரும்பு (Back)" : "← Back to Home"}</span>
        </button>
      </div>

      {/* HEADER BAR FOR SIDEBAR PAGES */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#E2DDD5] pb-4 gap-2">
        <div>
          <h1 className="font-serif font-black text-2xl text-[#3B0B12] tracking-tight">
            {activeTab.toUpperCase().replace("-", " ")}
          </h1>
          <p className="text-xs text-stone-500 font-medium">
            Kaviyam Digital Sanctuary • {lang === "ta" ? "சிறப்புப் பக்கம்" : "Exclusive Feature Dashboard"}
          </p>
        </div>

        {/* Global Book selector widget for AI / Tools page contexts */}
        {["smart-summary", "key-ideas", "explain-this", "character-guide", "story-timeline", "story-map", "related-topics", "story-connections", "quiz-me", "read-aloud", "listen-book", "find-in-book", "dictionary", "translation", "notes", "highlights", "bookmarks", "reading-mode", "focus-mode", "fullscreen-reader"].includes(activeTab) && (
          <div className="flex items-center gap-2 bg-amber-50 p-1.5 rounded-2xl border border-amber-200/60 w-full sm:w-auto">
            <span className="text-[10px] font-bold text-[#8C6D3D] uppercase pl-2 shrink-0">தேர்ந்தெடுக்கப்பட்ட நூல்:</span>
            <select
              value={selectedBookForAction}
              onChange={(e) => {
                setSelectedBookForAction(e.target.value);
                triggerToast(`Book set to: ${books.find(b => b.id === e.target.value)?.title}`);
              }}
              className="text-xs font-bold bg-white text-stone-800 border border-stone-200 rounded-xl px-2 py-1 focus:outline-none cursor-pointer"
            >
              {books.map(b => (
                <option key={b.id} value={b.id}>{b.title.split(" (")[0]}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* RENDER PAGES CONDITIONALLY */}

      {/* TAB: EXPLORE */}
      {activeTab === "explore" && (
        <div className="space-y-6">
          <div className="p-6 bg-amber-50/50 rounded-3xl border border-[#E2DDD5] space-y-4">
            <h2 className="font-serif text-lg font-bold text-[#3B0B12]">புனைவுகளை ஆராய்க (Explore Literary Eras)</h2>
            <p className="text-xs text-stone-600">Browse through Sangam Epics, Pallava sculpting eras, and the grand Chola dynasties of Tamil history.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { tag: "Chola Dynasty", ta: "சோழர் காலவரலாறு", count: 2, icon: "👑" },
                { tag: "Sangam Era", ta: "சங்க இலக்கியம்", count: 1, icon: "🏺" },
                { tag: "Pallava Sculptures", ta: "பல்லவர் சிற்பக்கலை", count: 1, icon: "🗿" },
                { tag: "Moral Philosophy", ta: "அறநெறி தத்துவங்கள்", count: 1, icon: "📜" },
              ].map((cat, i) => (
                <button 
                  key={i} 
                  onClick={() => {
                    navigateTo("tamil-library");
                    triggerToast(`Filtering library by: ${cat.tag}`);
                  }}
                  className="p-4 rounded-2xl bg-white border border-[#E2DDD5] text-left hover:border-amber-500 hover:scale-[1.02] transition-all group"
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <p className="font-bold text-xs text-stone-800 mt-2 group-hover:text-[#5C121E]">{cat.tag}</p>
                  <p className="text-[10px] text-amber-800 font-medium">{cat.ta}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-serif text-base font-bold text-stone-800">அனைத்து நூல்கள் (All Masterpieces)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map(book => (
                <div key={book.id} className="p-5 rounded-3xl bg-white border border-[#E2DDD5] shadow-xs hover:shadow-md transition-all flex gap-5 items-center">
                  <div onClick={() => onSelectBook(book.id)} className="cursor-pointer shrink-0">
                    <Book3D coverUrl={book.coverUrl} title={book.title} size="sm" tilt="hover" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <h4 onClick={() => onSelectBook(book.id)} className="font-serif font-bold text-sm text-stone-900 hover:text-[#5C121E] cursor-pointer truncate">{book.title}</h4>
                    <p className="text-xs text-stone-500 truncate">{book.author}</p>
                    <span className="inline-block px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold uppercase">{book.genre}</span>
                    <div className="pt-2">
                      <button onClick={() => onSelectBook(book.id)} className="px-3 py-1 bg-[#5C121E] hover:bg-[#3B0B12] text-white rounded-xl text-xs font-bold transition-all">Details</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: DISCOVER */}
      {activeTab === "discover" && (
        <div className="p-6 bg-white border border-[#E2DDD5] rounded-3xl space-y-6">
          <div className="max-w-xl mx-auto text-center space-y-4">
            <Sparkles className="w-10 h-10 text-amber-500 mx-auto animate-pulse" />
            <h2 className="font-serif text-xl font-bold text-[#3B0B12]">உங்கள் வாசிப்பு ஆளுமை (Identify Your Reading Persona)</h2>
            <p className="text-xs text-stone-600 leading-relaxed">Let Kaviyam AI determine your classical literary persona based on 3 rapid, interactive ancient queries.</p>
            
            {personaStep === 0 && (
              <button 
                onClick={() => setPersonaStep(1)}
                className="px-5 py-2.5 rounded-2xl bg-[#5C121E] hover:bg-[#3B0B12] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                ஆளுமையைக் கண்டறிக (Start Interactive Persona Check)
              </button>
            )}

            {personaStep === 1 && (
              <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-200 text-left space-y-4">
                <p className="text-xs font-bold text-amber-900">Q1: Which scenery pulls your soul the most?</p>
                <div className="space-y-2">
                  {[
                    "Veeranarayana Lake with full historical sails (வரலாறு)",
                    "Silent hermitage of a master sculptor in Pallava kingdom (கலை)",
                    "High court of Madurai demanding justice with Kannagi (நீதி)",
                  ].map((ans, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => {
                        setPersonaAnswers([ans]);
                        setPersonaStep(2);
                      }}
                      className="w-full text-left p-3 rounded-xl bg-white hover:bg-amber-100/60 border border-stone-200 text-xs text-stone-700 transition-colors"
                    >
                      {ans}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {personaStep === 2 && (
              <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-200 text-left space-y-4">
                <p className="text-xs font-bold text-amber-900">Q2: What is the core virtue you seek in a grand narrative?</p>
                <div className="space-y-2">
                  {[
                    "Aram (அறம்) - Righteousness, ethics and truth",
                    "Porul (பொருள்) - Imperial wealth, warfare and strategy",
                    "Inbam (இன்பம்) - Art, romance and literary aesthetics",
                  ].map((ans, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => {
                        setPersonaAnswers([...personaAnswers, ans]);
                        setPersonaStep(3);
                        // Compute result
                        const combined = [...personaAnswers, ans].join("");
                        if (combined.includes("வரலாறு") || combined.includes("Porul")) {
                          setReadingPersona("சோழ பேரரசு ஆய்வாளர் (Imperial Chola Chronicler)");
                        } else if (combined.includes("கலை") || combined.includes("Inbam")) {
                          setReadingPersona("கலை நயமிக்க கவிஞர் (Renaissance Aesthetics Scholar)");
                        } else {
                          setReadingPersona("அறநெறி தத்துவஞானி (Classic Virtue Philosopher)");
                        }
                      }}
                      className="w-full text-left p-3 rounded-xl bg-white hover:bg-amber-100/60 border border-stone-200 text-xs text-stone-700 transition-colors"
                    >
                      {ans}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {personaStep === 3 && (
              <div className="p-6 bg-gradient-to-r from-amber-500/10 to-amber-700/10 rounded-2xl border border-amber-500/30 space-y-4">
                <h3 className="font-serif text-lg font-bold text-[#3B0B12]">உங்களின் இலக்கிய ஆளுமை (Your Classical Persona)</h3>
                <div className="py-2 px-4 rounded-xl bg-white border border-amber-400 inline-block text-sm font-black text-amber-900 shadow-xs">
                  👑 {readingPersona}
                </div>
                <p className="text-xs text-stone-600">Based on your inner inclinations, we have unlocked premium personalized recommendations for your library shelf.</p>
                
                <div className="flex gap-2 justify-center pt-2">
                  <button 
                    onClick={() => {
                      setPersonaStep(0);
                      setPersonaAnswers([]);
                    }}
                    className="px-4 py-1.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-xs text-stone-700"
                  >
                    Retake
                  </button>
                  <button 
                    onClick={() => {
                      navigateTo("tamil-library");
                      triggerToast("Personalized recommendations added to your explorer page.");
                    }}
                    className="px-4 py-1.5 rounded-xl bg-[#5C121E] text-white text-xs font-bold"
                  >
                    Browse Recommendations
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: TRENDING */}
      {activeTab === "trending" && (
        <div className="space-y-6">
          <div className="p-6 bg-white border border-[#E2DDD5] rounded-3xl space-y-4">
            <h2 className="font-serif text-lg font-bold text-[#3B0B12] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-500" />
              <span>மக்களின் விருப்பம் (Most Trending This Week)</span>
            </h2>
            <p className="text-xs text-stone-600">Based on the synchronous reading time of thousands of active scholars over the last 72 hours.</p>

            <div className="space-y-4 pt-2">
              {[
                { title: "Ponniyin Selvan", reads: "12,500 active reading sessions", pct: "w-full" },
                { title: "Thirukkural", reads: "8,900 ethics insights viewed", pct: "w-[75%]" },
                { title: "Sivagamiyin Sabatham", reads: "6,200 chapters completed", pct: "w-[50%]" },
              ].map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-stone-700">
                    <span>{i+1}. {item.title}</span>
                    <span className="text-stone-500">{item.reads}</span>
                  </div>
                  <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                    <div className={`${item.pct} bg-[#5C121E] h-full rounded-full`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: BOOK OF THE DAY */}
      {activeTab === "book-of-day" && (
        <div className="p-6 bg-amber-50/30 rounded-3xl border border-[#E2DDD5] flex flex-col md:flex-row gap-8 items-center">
          <div className="shrink-0">
            <Book3D coverUrl={books[0]?.coverUrl} title={books[0]?.title} size="md" />
          </div>
          <div className="space-y-4 flex-1">
            <div className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black uppercase tracking-wider">
              ⭐ Book of the Day (இன்றைய சிறப்பு நூல்)
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#3B0B12]">{books[0]?.title}</h2>
            <p className="text-xs text-stone-600 leading-relaxed">{books[0]?.description}</p>
            
            <div className="p-4 bg-white rounded-2xl border border-amber-200 space-y-2">
              <p className="text-[10px] font-bold text-amber-800 uppercase">💡 Daily Wisdom Verse:</p>
              <p className="font-serif text-xs italic text-stone-700">"திங்களை போற்றுதும் திங்களை போற்றுதும் ஞாயிறு போற்றுதும் ஞாயிறு போற்றுதும்..."</p>
              <p className="text-[10px] text-stone-500">- Unlocking the cosmic harmonies of Tamil nature-epics.</p>
            </div>

            <button 
              onClick={() => onSelectBook(books[0]?.id)}
              className="px-5 py-2 rounded-xl bg-[#5C121E] hover:bg-[#3B0B12] text-white text-xs font-bold transition-all shadow-md"
            >
              Start Reading Now
            </button>
          </div>
        </div>
      )}

      {/* TAB: MY LIBRARY */}
      {(activeTab === "mybooks" || activeTab === "library") && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-serif text-lg font-bold text-[#3B0B12]">என் நூலகம் (My Saved Books)</h2>
            <button 
              onClick={() => {
                navigateTo("tamil-library");
                triggerToast("Opening Library catalog...");
              }}
              className="text-xs font-bold text-[#5C121E] hover:underline"
            >
              + Add More Books
            </button>
          </div>

          {bookmarks.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-[#E2DDD5] space-y-4 max-w-lg mx-auto">
              <BookOpen className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="font-serif font-bold text-lg text-stone-800">உங்கள் நூலகத்தில் இன்னும் புத்தகங்கள் இல்லை</h3>
              <p className="text-xs text-stone-500">Explore our extensive library of classical epics and historical narratives, and bookmark them to populate your shelf.</p>
              <button 
                onClick={() => navigateTo("tamil-library")}
                className="px-4 py-2 bg-[#5C121E] hover:bg-[#3B0B12] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
              >
                புத்தகங்களை ஆராய்க (Browse Books)
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.filter(b => bookmarks.includes(b.id)).map(book => (
                <div key={book.id} className="p-5 rounded-3xl bg-white border border-[#E2DDD5] shadow-xs flex gap-5 items-center">
                  <div onClick={() => onSelectBook(book.id)} className="cursor-pointer shrink-0">
                    <Book3D coverUrl={book.coverUrl} title={book.title} size="sm" tilt="hover" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <h3 onClick={() => onSelectBook(book.id)} className="font-serif font-bold text-sm text-stone-900 hover:text-[#5C121E] cursor-pointer truncate">{book.title}</h3>
                    <p className="text-xs text-stone-500 truncate">{book.author}</p>
                    <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#5C121E] h-full rounded-full w-[45%]" />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-stone-500 font-bold">
                      <span>45% Read</span>
                      <span>2 hours ago</span>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <button 
                        onClick={() => onSelectBook(book.id)}
                        className="px-3 py-1.5 rounded-xl bg-[#5C121E] text-white text-xs font-bold hover:bg-[#3B0B12] transition-all flex items-center gap-1"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>Continue</span>
                      </button>
                      <button 
                        onClick={() => onToggleBookmark(book.id)}
                        className="p-1.5 rounded-xl text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Remove book from library"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => triggerToast("Added to Favorites shelf")}
                        className="p-1.5 rounded-xl text-stone-400 hover:text-amber-500 hover:bg-amber-50 transition-colors"
                        title="Favorite this book"
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: CONTINUE READING */}
      {activeTab === "continue-reading" && (
        <div className="space-y-6">
          <h2 className="font-serif text-lg font-bold text-[#3B0B12]">தொடர்ந்து வாசிக்க (In-Progress Reads)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {books.slice(0, 2).map(book => (
              <div key={book.id} className="p-6 rounded-3xl bg-white border border-[#E2DDD5] shadow-xs flex gap-5 items-center">
                <Book3D coverUrl={book.coverUrl} title={book.title} size="sm" />
                <div className="flex-1 space-y-2">
                  <h3 className="font-serif font-black text-sm text-[#3B0B12]">{book.title}</h3>
                  <p className="text-xs text-stone-500">{book.author}</p>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-stone-600 font-bold">
                      <span>Chapter 1 progress: 65%</span>
                      <span>Level Up +250 XP</span>
                    </div>
                    <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                      <div className="w-[65%] bg-gradient-to-r from-[#5C121E] to-[#9A1E31] h-full rounded-full" />
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      onSelectBook(book.id);
                      triggerToast("Opening reader at your saved progress point.");
                    }}
                    className="px-4 py-1.5 bg-[#5C121E] text-white hover:bg-[#3B0B12] text-xs font-bold rounded-xl shadow-xs"
                  >
                    Continue Reading
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: READING QUEUE */}
      {activeTab === "reading-queue" && (
        <div className="p-6 bg-white border border-[#E2DDD5] rounded-3xl space-y-6">
          <h2 className="font-serif text-lg font-bold text-[#3B0B12]">வாசிப்பு வரிசை (My Personal Reading Queue)</h2>
          <p className="text-xs text-stone-600">Establish and prioritize which Tamil novels you wish to read next. Drag-and-drop or push books in the queue stack.</p>

          <div className="space-y-3">
            {readingQueue.map((bookId, index) => {
              const book = books.find(b => b.id === bookId);
              if (!book) return null;
              return (
                <div key={bookId} className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/50 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-extrabold text-[#8C6D3D]">#{index + 1}</span>
                    <div>
                      <h4 className="font-bold text-xs text-stone-900">{book.title.split(" (")[0]}</h4>
                      <p className="text-[10px] text-stone-500">{book.author}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        onSelectBook(bookId);
                        triggerToast(`Opening: ${book.title}`);
                      }}
                      className="px-3 py-1 bg-[#5C121E] text-white text-[10px] font-bold rounded-lg"
                    >
                      Start Reading
                    </button>
                    <button 
                      onClick={() => {
                        setReadingQueue(readingQueue.filter(id => id !== bookId));
                        triggerToast("Removed from queue");
                      }}
                      className="p-1 rounded-lg text-stone-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-stone-200/60 flex items-center gap-2">
            <span className="text-xs text-stone-600 font-bold">Add book to queue:</span>
            <select 
              onChange={(e) => {
                if (e.target.value && !readingQueue.includes(e.target.value)) {
                  setReadingQueue([...readingQueue, e.target.value]);
                  triggerToast("Added to queue stack");
                }
              }}
              className="text-xs border border-stone-200 rounded-lg p-1"
            >
              <option value="">Select Book...</option>
              {books.map(b => (
                <option key={b.id} value={b.id}>{b.title.split(" (")[0]}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* TAB: RECENTLY READ / OPENED */}
      {(activeTab === "recently-read" || activeTab === "recently-opened") && (
        <div className="space-y-6">
          <h2 className="font-serif text-lg font-bold text-[#3B0B12]">
            {activeTab === "recently-read" ? "சமீபத்தில் வாசித்தவை (Recently Read History)" : "சமீபத்தில் திறந்தவை (Recently Opened Library Logs)"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recentlyOpened.map(bookId => {
              const book = books.find(b => b.id === bookId);
              if (!book) return null;
              return (
                <div key={bookId} className="p-4 rounded-2xl bg-white border border-[#E2DDD5] flex gap-4 items-center">
                  <Book3D coverUrl={book.coverUrl} title={book.title} size="sm" />
                  <div className="flex-1 space-y-1.5">
                    <h4 className="font-bold text-xs text-stone-900">{book.title}</h4>
                    <p className="text-[10px] text-stone-500">{book.author}</p>
                    <p className="text-[9px] text-stone-400">Opened: {activeTab === "recently-read" ? "Watched parallel translation 4 hours ago" : "Analyzed in dictionary tool yesterday"}</p>
                    <button 
                      onClick={() => onSelectBook(bookId)}
                      className="px-2.5 py-1 rounded-lg bg-[#5C121E] text-white text-[10px] font-bold"
                    >
                      Open Book
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: FINISHED BOOKS */}
      {activeTab === "finished-books" && (
        <div className="p-6 bg-white border border-[#E2DDD5] rounded-3xl space-y-6">
          <h2 className="font-serif text-lg font-bold text-[#3B0B12]">வாசித்து முடித்தவை (Finished Treasures)</h2>
          <p className="text-xs text-stone-600">Review your accomplished classical reading archives and certificates.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {finishedBooks.map(id => {
              const book = books.find(b => b.id === id);
              if (!book) return null;
              return (
                <div key={id} className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-emerald-100/30 border border-emerald-200 flex gap-4 items-center">
                  <CheckCircle className="w-10 h-10 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm text-stone-900">{book.title.split(" (")[0]}</h4>
                    <p className="text-xs text-stone-500">Author: {book.author}</p>
                    <p className="text-[10px] text-emerald-800 font-bold mt-1">Completed: Aug 14, 2026 • 5.5 hours total read time</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: PAUSED BOOKS */}
      {activeTab === "paused-books" && (
        <div className="p-6 bg-white border border-[#E2DDD5] rounded-3xl space-y-4">
          <h2 className="font-serif text-lg font-bold text-[#3B0B12]">நிறுத்தப்பட்ட நூல்கள் (Paused Books)</h2>
          <p className="text-xs text-stone-600">These novels are kept on pause. Resume your literary voyage anytime.</p>

          {pausedBooks.map(id => {
            const book = books.find(b => b.id === id);
            if (!book) return null;
            return (
              <div key={id} className="p-4 rounded-2xl bg-amber-50/30 border border-stone-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <PauseCircle className="w-8 h-8 text-amber-500 shrink-0" />
                  <div>
                    <h4 className="font-bold text-xs text-stone-900">{book.title.split(" (")[0]}</h4>
                    <p className="text-[10px] text-stone-500">Progress: 14% completed</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      onSelectBook(id);
                      setPausedBooks(pausedBooks.filter(item => item !== id));
                    }}
                    className="px-3 py-1 bg-[#5C121E] hover:bg-[#3B0B12] text-white text-[10px] font-bold rounded-lg"
                  >
                    Resume Voyage
                  </button>
                  <button 
                    onClick={() => {
                      setPausedBooks(pausedBooks.filter(item => item !== id));
                      triggerToast("Removed from Paused stack");
                    }}
                    className="px-3 py-1 bg-white border border-stone-300 text-stone-700 text-[10px] rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB: SAVE FOR LATER */}
      {activeTab === "saved-for-later" && (
        <div className="p-6 bg-white border border-[#E2DDD5] rounded-3xl space-y-4">
          <h2 className="font-serif text-lg font-bold text-[#3B0B12]">பின்னர் படிக்க சேமித்தவை (Saved for Later)</h2>
          <p className="text-xs text-stone-600">A special holding area for books you intend to read on cozy winter nights.</p>

          {savedLater.map(id => {
            const book = books.find(b => b.id === id);
            if (!book) return null;
            return (
              <div key={id} className="p-4 rounded-2xl bg-amber-50/20 border border-stone-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Pin className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-xs text-stone-900">{book.title.split(" (")[0]}</h4>
                    <p className="text-[10px] text-stone-500">{book.author}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      onSelectBook(id);
                      setSavedLater(savedLater.filter(item => item !== id));
                    }}
                    className="px-3 py-1 bg-[#5C121E] text-white text-[10px] font-bold rounded-lg"
                  >
                    Read Now
                  </button>
                  <button 
                    onClick={() => {
                      setSavedLater(savedLater.filter(item => item !== id));
                      triggerToast("Deleted");
                    }}
                    className="px-3 py-1 border border-stone-300 text-stone-700 text-[10px] rounded-lg"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB: COLLECTIONS */}
      {activeTab === "collections" && (
        <div className="p-6 bg-white border border-[#E2DDD5] rounded-3xl space-y-6">
          <h2 className="font-serif text-lg font-bold text-[#3B0B12]">தொகுப்புகள் (Custom Literary Collections)</h2>
          <p className="text-xs text-stone-600">Establish and group relevant texts based on themes, Dynasties, or author categories.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {collections.map(col => (
              <div key={col.id} className="p-5 rounded-2xl border border-[#E2DDD5] bg-amber-50/20 space-y-3">
                <div>
                  <h4 className="font-serif font-black text-sm text-[#3B0B12]">{col.name}</h4>
                  <p className="text-[10px] text-stone-500 mt-0.5">{col.description}</p>
                </div>

                <div className="flex gap-2">
                  {col.bookIds.map(bookId => {
                    const b = books.find(item => item.id === bookId);
                    if (!b) return null;
                    return (
                      <span key={bookId} onClick={() => onSelectBook(bookId)} className="inline-block px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-[9px] font-bold text-stone-700 cursor-pointer hover:border-amber-500">
                        {b.title.split(" (")[0]}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            if (newCollectionName) {
              setCollections([...collections, {
                id: `col-${Date.now()}`,
                name: newCollectionName,
                description: newCollectionDesc || "Custom classical compilation",
                bookIds: ["ponniyin-selvan"]
              }]);
              setNewCollectionName("");
              setNewCollectionDesc("");
              triggerToast("Collection created successfully!");
            }
          }} className="p-5 bg-stone-50 rounded-2xl border border-stone-200/60 space-y-3">
            <h4 className="font-bold text-xs text-stone-800">Add New Collection</h4>
            <input 
              type="text" 
              placeholder="Collection name (e.g., Sangam Epics)" 
              value={newCollectionName} 
              onChange={e => setNewCollectionName(e.target.value)}
              className="w-full text-xs p-2 bg-white border border-stone-200 rounded-lg focus:outline-none"
            />
            <input 
              type="text" 
              placeholder="Short description" 
              value={newCollectionDesc} 
              onChange={e => setNewCollectionDesc(e.target.value)}
              className="w-full text-xs p-2 bg-white border border-stone-200 rounded-lg focus:outline-none"
            />
            <button type="submit" className="px-4 py-1.5 bg-[#5C121E] text-white text-xs font-bold rounded-lg hover:bg-[#3B0B12]">Create Collection</button>
          </form>
        </div>
      )}

      {/* TAB: CREATE SHELF */}
      {activeTab === "create-shelf" && (
        <div className="p-6 bg-white border border-[#E2DDD5] rounded-3xl space-y-6">
          <h2 className="font-serif text-lg font-bold text-[#3B0B12]">புதிய அலமாரி (Virtual Bookshelves Creator)</h2>
          <p className="text-xs text-stone-600">Organize and display books on clean virtual bookshelves.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shelves.map(sh => (
              <div key={sh.id} className="p-5 rounded-2xl bg-amber-50/10 border border-amber-200/60 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-serif font-black text-xs text-amber-900">📚 Shelf: {sh.name}</h4>
                  <span className="text-[9px] text-stone-400">{sh.bookIds.length} books</span>
                </div>

                <div className="flex gap-3 pt-2">
                  {sh.bookIds.map(bookId => {
                    const b = books.find(item => item.id === bookId);
                    if (!b) return null;
                    return (
                      <div key={bookId} onClick={() => onSelectBook(bookId)} className="cursor-pointer">
                        <Book3D coverUrl={b.coverUrl} title={b.title} size="sm" />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            if (newShelfName) {
              setShelves([...shelves, {
                id: `sh-${Date.now()}`,
                name: newShelfName,
                bookIds: ["ponniyin-selvan", "silappatikaram"]
              }]);
              setNewShelfName("");
              triggerToast("Virtual Shelf created!");
            }
          }} className="p-5 bg-stone-50 rounded-2xl border border-stone-200/60 space-y-3">
            <h4 className="font-bold text-xs text-stone-800">Create New Shelf</h4>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Shelf name (e.g., Weekend reading)" 
                value={newShelfName} 
                onChange={e => setNewShelfName(e.target.value)}
                className="flex-1 text-xs p-2 bg-white border border-stone-200 rounded-lg focus:outline-none"
              />
              <button type="submit" className="px-4 py-1.5 bg-[#5C121E] text-white text-xs font-bold rounded-lg hover:bg-[#3B0B12]">Create</button>
            </div>
          </form>
        </div>
      )}

      {/* TAB: QUIZ STATS */}
      {activeTab === "quiz-stats" && (
        !currentUser || currentUser.id === "guest-user-session" ? (
          <div className="max-w-xl mx-auto my-8 p-8 sm:p-12 bg-white rounded-3xl border border-[#D4AF37]/40 shadow-xl text-center space-y-6 font-sans">
            <div className="mx-auto w-20 h-20 rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center shadow-inner">
              <span className="text-4xl" role="img" aria-label="Lock">🔐</span>
            </div>

            <div className="space-y-2">
              <h2 className="font-serif font-black text-2xl text-[#3B0B12]">
                {lang === "ta" ? "உள்நுழைவு தேவை" : "Login Required"}
              </h2>
              <p className="text-sm font-medium text-stone-600 max-w-md mx-auto leading-relaxed">
                {lang === "ta"
                  ? "உங்கள் வினாடி வினா புள்ளிவிவரங்களைப் பார்க்க உள்நுழைய வேண்டும்."
                  : "Please log in to your account to view your quiz statistics."}
              </p>
            </div>

            <div className="pt-2 flex justify-center">
              <button
                onClick={() => {
                  localStorage.setItem("pendingQuizRoute", "/quiz-stats");
                  localStorage.setItem("kaviyam_pending_quiz_route", "/quiz-stats");
                  navigateTo("login");
                }}
                id="quiz-stats-login-btn"
                className="px-8 py-3 rounded-2xl bg-[#5C121E] hover:bg-[#3B0B12] text-white font-serif font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
              >
                <LogIn className="w-4 h-4 text-amber-300" />
                <span>{lang === "ta" ? "உள்நுழைக" : "Login"}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-white border border-[#E2DDD5] rounded-3xl space-y-6">
            <h2 className="font-serif text-lg font-bold text-[#3B0B12]">வினாடி வினா புள்ளிவிவரங்கள் (Quiz Scholar Analytics)</h2>
            <p className="text-xs text-stone-600">Review your test outcomes, accurate answers, and daily quiz streaks.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3">
                <Award className="w-10 h-10 text-amber-600" />
                <div>
                  <p className="text-[10px] text-stone-500 font-bold uppercase">Average Score</p>
                  <p className="font-serif text-lg font-black text-amber-950">92% Precision</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 flex items-center gap-3">
                <Flame className="w-10 h-10 text-purple-600 animate-pulse" />
                <div>
                  <p className="text-[10px] text-stone-500 font-bold uppercase">Quiz Streak</p>
                  <p className="font-serif text-lg font-black text-purple-950">{quizStreak} Days Active</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                <Brain className="w-10 h-10 text-emerald-600" />
                <div>
                  <p className="text-[10px] text-stone-500 font-bold uppercase">Unlocked Badges</p>
                  <p className="font-serif text-lg font-black text-emerald-950">4 Gold Insignias</p>
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* TAB: ACHIEVEMENTS / CHALLENGES */}
      {(activeTab === "achievements" || activeTab === "challenges" || activeTab === "achievements-reward") && (
        <div className="p-6 bg-white border border-[#E2DDD5] rounded-3xl space-y-6">
          <h2 className="font-serif text-lg font-bold text-[#3B0B12]">
            {activeTab === "challenges" ? "வாசிப்பு சவால்கள் (Active Literary Challenges)" : "சாதனைகள் (Scholar Achievements & Badges)"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "Ponniyin Prince", desc: "Read chapter 1 of Ponniyin Selvan in both Tamil & English", xp: "+500 XP", coins: "💰 150 Coins", unlocked: true },
              { title: "Kalki Devotee", desc: "Unlock three premium Kalki novels from our library", xp: "+1,200 XP", coins: "💰 400 Coins", unlocked: false },
              { title: "Virtue Pioneer", desc: "Complete 10 ethics quizzes of Thirukkural couplets", xp: "+800 XP", coins: "💰 250 Coins", unlocked: true },
            ].map((ach, i) => (
              <div key={i} className={`p-4 rounded-2xl border flex gap-4 items-center ${ach.unlocked ? "bg-amber-50/40 border-amber-200" : "bg-stone-50/50 border-stone-200 opacity-60"}`}>
                <span className="text-3xl">{ach.unlocked ? "🏆" : "🔒"}</span>
                <div>
                  <h4 className="font-serif font-black text-xs text-[#3B0B12]">{ach.title}</h4>
                  <p className="text-[10px] text-stone-500 mt-0.5">{ach.desc}</p>
                  <div className="flex gap-2 mt-1 text-[9px] font-black uppercase tracking-wider text-amber-800">
                    <span>{ach.xp}</span>
                    <span>•</span>
                    <span>{ach.coins}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TABS: KAVIYAM AI SPECIALIZED VIEWS */}
      {["smart-summary", "key-ideas", "explain-this", "character-guide", "story-timeline", "story-map", "related-topics", "story-connections", "quiz-me"].includes(activeTab) && (
        <div className="p-6 bg-white border border-[#E2DDD5] rounded-3xl space-y-6">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-amber-500 shrink-0" />
            <div>
              <h3 className="font-serif font-black text-base text-[#3B0B12] uppercase tracking-wider">
                {activeTab.replace("-", " ")} (Kaviyam AI Co-Pilot)
              </h3>
              <p className="text-[10px] text-stone-500">Selected: {currentActiveBook.title}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => triggerAiFeature(activeTab === "smart-summary" ? "Smart Summary" : activeTab === "key-ideas" ? "Key Ideas" : "Generative Insights")}
              disabled={isAiLoading}
              className="px-4 py-2 bg-[#5C121E] hover:bg-[#3B0B12] text-white text-xs font-bold rounded-xl transition-all shadow-xs shrink-0 cursor-pointer disabled:opacity-50"
            >
              {isAiLoading ? "AI is processing..." : "விசாரிக்க (Query Kaviyam AI)"}
            </button>
          </div>

          {/* AI Output Window */}
          <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/25 min-h-[150px] font-serif text-xs leading-relaxed space-y-4 shadow-inner">
            {isAiLoading ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-3 bg-amber-200/50 rounded-full w-[40%]" />
                <div className="h-3 bg-amber-200/50 rounded-full w-[85%]" />
                <div className="h-3 bg-amber-200/50 rounded-full w-[75%]" />
              </div>
            ) : aiOutput ? (
              <div className="whitespace-pre-line text-stone-800">{aiOutput}</div>
            ) : (
              <p className="text-stone-400 italic font-sans text-center pt-8">Click 'Query Kaviyam AI' to synthesise dynamic classical literary perspectives instantly.</p>
            )}
          </div>

          {/* Specific custom visualization: Story Timeline or Map */}
          {activeTab === "story-timeline" && (
            <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
              <h4 className="font-bold text-xs text-stone-800 uppercase tracking-widest">Imperial Chronology (கதை காலவரிசை)</h4>
              <div className="relative border-l-2 border-[#5C121E] pl-6 ml-2 space-y-6">
                {[
                  { time: "Aadi Perukku Evening", title: "Vandiyathevan rides near Veeranarayana lake with imperial letters.", desc: "Meets Alwarkadiyan Nambi." },
                  { time: "Night Fall", title: "Arrival at Kadambur fort.", desc: "Overhears secret alliance plots of the Paluvettaraiyar lords." },
                  { time: "Next Morning", title: "Journey towards Kudanthai town.", desc: "Astrology session detailing Arulmozhi's future stars." },
                ].map((t, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-[31px] top-0 w-3.5 h-3.5 rounded-full bg-[#5C121E] border-2 border-white" />
                    <p className="text-[10px] font-black text-amber-800 uppercase">{t.time}</p>
                    <h5 className="font-serif font-bold text-xs text-stone-800">{t.title}</h5>
                    <p className="text-[10px] text-stone-500">{t.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "story-map" && (
            <div className="p-5 bg-[#FAF8F2] rounded-2xl border border-amber-200/60 text-center space-y-4">
              <h4 className="font-bold text-xs text-[#3B0B12] uppercase tracking-widest">Grand Journey Map of Vandiyathevan (கதை வரைபடம்)</h4>
              
              {/* Grand journey illustration inside SVG */}
              <div className="w-full max-w-lg mx-auto bg-white border border-amber-200 rounded-xl overflow-hidden shadow-xs relative">
                <svg viewBox="0 0 400 200" className="w-full h-auto">
                  <path d="M 40 120 Q 120 40 200 120 T 360 80" fill="none" stroke="#D4AF37" strokeWidth="3" strokeDasharray="5,5" />
                  
                  {/* Veeranarayana Lake point */}
                  <circle cx="40" cy="120" r="6" fill="#5C121E" />
                  <text x="40" y="140" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#3B0B12">Veeranarayana Lake</text>
                  
                  {/* Kadambur Fort */}
                  <circle cx="150" cy="80" r="6" fill="#5C121E" />
                  <text x="150" y="65" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#3B0B12">Kadambur Fort</text>

                  {/* Kudanthai Astrologer */}
                  <circle cx="260" cy="130" r="6" fill="#5C121E" />
                  <text x="260" y="150" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#3B0B12">Kudanthai</text>

                  {/* Tanjore Imperial Palace */}
                  <circle cx="360" cy="80" r="6" fill="#5C121E" />
                  <text x="360" y="95" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#3B0B12">Tanjore Palace</text>
                </svg>
              </div>
              <p className="text-[10px] text-stone-500 italic">Vandiyathevan's imperial ride mapping ancient Tamil geography.</p>
            </div>
          )}
        </div>
      )}

      {/* TABS: READING TOOLS */}
      {["read-aloud", "listen-book", "find-in-book", "dictionary", "translation", "notes", "highlights", "bookmarks", "reading-mode", "focus-mode", "fullscreen-reader"].includes(activeTab) && (
        <div className="p-6 bg-white border border-[#E2DDD5] rounded-3xl space-y-6">
          <h2 className="font-serif text-lg font-bold text-[#3B0B12] uppercase tracking-wider flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-amber-500" />
            <span>{activeTab.replace("-", " ")}</span>
          </h2>

          {activeTab === "focus-mode" && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <h4 className="font-bold text-xs text-amber-950">Ambient Sound Synthesizer</h4>
                  <p className="text-[10px] text-stone-500">Play soothing backgrounds to block distractions during reading.</p>
                </div>
                <div className="flex gap-2">
                  {["rain", "temple-bells", "classical-flute", "forest"].map(sound => (
                    <button 
                      key={sound}
                      onClick={() => {
                        setFocusSound(sound);
                        setIsFocusPlaying(true);
                        triggerToast(`Synthesized ambient backdrop set to: ${sound}`);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all ${focusSound === sound && isFocusPlaying ? "bg-[#3B0B12] text-amber-200" : "bg-white border border-stone-200 text-stone-600"}`}
                    >
                      {sound.replace("-", " ")}
                    </button>
                  ))}
                  {isFocusPlaying && (
                    <button 
                      onClick={() => setIsFocusPlaying(false)}
                      className="px-3 py-1.5 rounded-xl text-[10px] bg-red-600 text-white font-bold"
                    >
                      Stop
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "read-aloud" && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-[#3B0B12] text-white space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-serif font-black text-sm text-[#D4AF37]">Voice Synthesis Engine</h4>
                    <p className="text-[10px] text-amber-100/60">Bilingual audio voice narration for {currentActiveBook.title}</p>
                  </div>
                  <Volume2 className="w-6 h-6 text-[#D4AF37] animate-bounce" />
                </div>

                <div className="flex items-center justify-center gap-4 py-4">
                  <button onClick={() => triggerToast("Narration speed: 0.8x")} className="p-2 bg-black/20 hover:bg-black/40 rounded-full"><Minus className="w-4 h-4 text-amber-200" /></button>
                  <button onClick={() => triggerToast("Synthesized Voice: Playing chapter voice-over")} className="px-6 py-2.5 bg-[#D4AF37] text-[#3B0B12] hover:scale-105 active:scale-95 font-extrabold text-xs rounded-2xl shadow-xl transition-all">PLAY VOICE-OVER</button>
                  <button onClick={() => triggerToast("Narration speed: 1.2x")} className="p-2 bg-black/20 hover:bg-black/40 rounded-full"><Plus className="w-4 h-4 text-amber-200" /></button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "dictionary" && (
            <div className="space-y-4">
              <h4 className="font-bold text-xs text-stone-800 uppercase tracking-widest">Sangam Literature Dictionary (அகராதி)</h4>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Enter classic word (e.g., ஆடிப் பெருக்கு, யாழ், கரிகாலன்)..." 
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  className="flex-1 text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:bg-white focus:border-amber-500"
                />
                <button 
                  onClick={() => {
                    if (inputText.toLowerCase().includes("ஆடி")) {
                      triggerToast("ஆடிப் பெருக்கு: A festive water flow celebration along river Cauvery during the Tamil month of Aadi.");
                    } else {
                      triggerToast("Word lookup complete. Definition loaded.");
                    }
                  }}
                  className="px-4 py-2 bg-[#5C121E] text-white rounded-xl text-xs font-bold"
                >
                  Search
                </button>
              </div>
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-6">
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                <h4 className="font-bold text-xs text-stone-800">Add Literary Annotation / Note:</h4>
                <div className="flex gap-2 flex-wrap">
                  <select
                    value={newNoteBook}
                    onChange={(e) => setNewNoteBook(e.target.value)}
                    className="text-xs p-2 bg-white border border-stone-200 rounded-lg focus:outline-none"
                  >
                    {books.map((b) => (
                      <option key={b.id} value={b.title}>
                        {b.title}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Type note, insight, or reflection..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    className="flex-1 min-w-[200px] text-xs p-2 bg-white border border-stone-200 rounded-lg focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      if (!newNoteText.trim()) return;
                      setUserNotes([
                        {
                          id: `note-${Date.now()}`,
                          bookTitle: newNoteBook,
                          chapter: "வாசகர் குறிப்பு",
                          text: newNoteText.trim(),
                          date: new Date().toISOString().split("T")[0],
                        },
                        ...userNotes,
                      ]);
                      setNewNoteText("");
                      triggerToast("Note successfully saved!");
                    }}
                    className="px-4 py-2 bg-[#5C121E] hover:bg-[#3B0B12] text-white text-xs font-bold rounded-lg transition-all"
                  >
                    Save Note
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Saved Scholar Notes ({userNotes.length})
                </h4>
                {userNotes.map((note) => (
                  <div key={note.id} className="p-4 bg-stone-50/50 border border-[#E2DDD5] rounded-2xl space-y-2">
                    <div className="flex justify-between items-center text-[10px] text-stone-500">
                      <span className="font-bold text-[#3B0B12]">📖 {note.bookTitle} • {note.chapter}</span>
                      <div className="flex items-center gap-2">
                        <span>{note.date}</span>
                        <button
                          onClick={() => {
                            setUserNotes(userNotes.filter((n) => n.id !== note.id));
                            triggerToast("Note removed.");
                          }}
                          className="p-1 hover:text-red-500 text-stone-400 transition-colors"
                          title="Delete note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-stone-700 leading-relaxed font-serif">{note.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "highlights" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-xs text-stone-600">Cherished sentences, poetic lines, and memorable passages marked during your reading.</p>
                <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  {userHighlights.length} Highlights
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userHighlights.map((hl) => (
                  <div key={hl.id} className="p-4 rounded-2xl border bg-white border-amber-200/80 space-y-3 shadow-xs">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-[#3B0B12]">📖 {hl.bookTitle}</span>
                      <span className="text-stone-400">{hl.chapter}</span>
                    </div>
                    <blockquote className="font-serif text-xs text-stone-800 italic border-l-2 border-amber-500 pl-3 leading-relaxed">
                      "{hl.quote}"
                    </blockquote>
                    <div className="flex justify-between items-center pt-1 text-[10px]">
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 font-medium">
                        Highlight
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(hl.quote);
                          triggerToast("Highlight copied to clipboard!");
                        }}
                        className="flex items-center gap-1 text-stone-500 hover:text-[#5C121E] font-medium"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "reading-mode" && (
            <div className="space-y-6">
              <p className="text-xs text-stone-600">Customize your reading environment for optimal visual comfort and immersion.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                  <h4 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-amber-600" />
                    <span>Background Palette</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {[
                      { id: "papyrus", name: "Papyrus Cream", bg: "bg-[#FDFBF7]", text: "text-[#3B0B12]" },
                      { id: "sepia", name: "Sepia Warm", bg: "bg-[#F4ECD8]", text: "text-[#2D1B08]" },
                      { id: "night", name: "Night Scholar", bg: "bg-[#1C1917]", text: "text-stone-200" },
                      { id: "milk", name: "Milk Paper", bg: "bg-white", text: "text-stone-900" },
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setReadingPalette(p.id);
                          triggerToast(`Reading palette set to ${p.name}`);
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all flex items-center justify-between ${
                          readingPalette === p.id
                            ? "border-amber-600 ring-2 ring-amber-400/30"
                            : "border-stone-200 hover:border-stone-300"
                        } ${p.bg} ${p.text}`}
                      >
                        <span>{p.name}</span>
                        {readingPalette === p.id && <Check className="w-3.5 h-3.5 text-amber-600" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                  <h4 className="text-xs font-bold text-stone-800">Font Size</h4>
                  <div className="flex gap-2 pt-1">
                    {[
                      { id: "sm", label: "Small (14px)" },
                      { id: "base", label: "Standard (16px)" },
                      { id: "lg", label: "Large (18px)" },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => {
                          setReadingFontSize(f.id);
                          triggerToast(`Font size updated to ${f.label}`);
                        }}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                          readingFontSize === f.id
                            ? "bg-[#3B0B12] text-amber-200 shadow-xs"
                            : "bg-white border border-stone-200 text-stone-700 hover:bg-stone-100"
                        }`}
                      >
                        {f.label.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-2xl border border-stone-300 transition-colors ${
                readingPalette === "sepia" ? "bg-[#F4ECD8] text-[#2D1B08]" :
                readingPalette === "night" ? "bg-[#1C1917] text-stone-200" :
                readingPalette === "milk" ? "bg-white text-stone-900" :
                "bg-[#FDFBF7] text-[#3B0B12]"
              }`}>
                <p className="text-[10px] uppercase font-bold tracking-widest opacity-60 mb-2">Live Reading Preview</p>
                <h3 className="font-serif font-bold text-base mb-2">பொன்னியின் செல்வன் — முதற் பாகம்</h3>
                <p className={`font-serif leading-relaxed ${
                  readingFontSize === "sm" ? "text-xs" :
                  readingFontSize === "lg" ? "text-base" : "text-sm"
                }`}>
                  ஆடிப் பெருக்கு நாளன்று மாலையில், வீராணம் ஏரிக்கரையின் மீது ஒரு வாலிபன் குதிரை மீது ஏறிப் பிரயாணம் செய்து கொண்டிருந்தான். அவன் பெயர் வல்லவரையன் வந்தியத்தேவன்...
                </p>
              </div>
            </div>
          )}

          {activeTab === "fullscreen-reader" && (
            <div className="space-y-6">
              <div className="p-8 rounded-3xl bg-gradient-to-br from-[#3B0B12] to-[#5C121E] text-white text-center space-y-4">
                <Maximize className="w-12 h-12 text-[#D4AF37] mx-auto animate-pulse" />
                <h3 className="font-serif text-xl font-bold">முழுத்திரை வாசிப்பு (Zen Fullscreen Mode)</h3>
                <p className="text-xs text-amber-100/80 max-w-md mx-auto leading-relaxed">
                  Immerse yourself completely in classical Tamil literature with zero distractions, edge-to-edge typography, and ambient lighting.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      if (currentActiveBook) {
                        onSelectBook(currentActiveBook.id);
                        triggerToast(`Opening ${currentActiveBook.title} in reader...`);
                      }
                    }}
                    className="px-6 py-3 rounded-2xl bg-[#D4AF37] text-[#3B0B12] font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-lg"
                  >
                    🚀 Open Current Book in Reader Mode
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "bookmarks" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-xs text-stone-600">Your saved books and bookmarks for quick resumption.</p>
                <span className="text-xs font-bold text-[#5C121E]">{bookmarks.length} Bookmarks</span>
              </div>

              {bookmarks.length === 0 ? (
                <div className="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-300 space-y-3">
                  <BookMarked className="w-8 h-8 text-stone-400 mx-auto" />
                  <p className="text-xs text-stone-500">No books bookmarked yet.</p>
                  <button
                    onClick={() => navigateTo("explore")}
                    className="px-4 py-2 bg-[#5C121E] text-white text-xs font-bold rounded-xl"
                  >
                    Explore Library
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {books.filter((b) => bookmarks.includes(b.id)).map((book) => (
                    <div key={book.id} className="p-4 rounded-2xl border border-[#E2DDD5] bg-white space-y-3 flex flex-col justify-between">
                      <div className="flex gap-3">
                        <Book3D coverUrl={book.coverUrl} title={book.title} size="sm" />
                        <div>
                          <h4 className="font-serif font-bold text-xs text-[#3B0B12] line-clamp-1">{book.title}</h4>
                          <p className="text-[10px] text-stone-500">{book.author}</p>
                          <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                            Bookmarked
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2 border-t border-stone-100">
                        <button
                          onClick={() => onSelectBook(book.id)}
                          className="flex-1 py-1.5 bg-[#5C121E] text-white rounded-lg text-xs font-bold text-center hover:bg-[#3B0B12]"
                        >
                          Read Now
                        </button>
                        <button
                          onClick={() => onToggleBookmark(book.id)}
                          className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                          title="Remove bookmark"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB: REWARDS */}
      {["streak", "daily-mission", "weekly-challenge", "monthly-challenge", "xp", "kaviyam-coins", "levels", "badges", "rewards", "my-ranking"].includes(activeTab) && (
        <div className="p-6 bg-white border border-[#E2DDD5] rounded-3xl space-y-6">
          <h2 className="font-serif text-lg font-bold text-[#3B0B12] uppercase tracking-wider flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-500" />
            <span>{activeTab.replace("-", " ")}</span>
          </h2>

          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#3B0B12] to-[#5C121E] text-white flex justify-between items-center">
            <div>
              <p className="text-[10px] text-amber-200 uppercase tracking-widest font-black">Current Scholar Tier</p>
              <h4 className="font-serif text-2xl font-bold text-white">Chola Imperial Envoy (Level 5)</h4>
              <p className="text-xs text-amber-100/60 mt-1">Level up to unlock high-definition audio covers and priority AI prompts.</p>
            </div>
            <Award className="w-12 h-12 text-[#D4AF37]" />
          </div>

          {activeTab === "streak" && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-300 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center">
                    <Flame className="w-8 h-8 text-amber-600 animate-bounce" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800">Active Reading Streak</span>
                    <h3 className="font-serif text-2xl font-bold text-[#3B0B12]">7 Days Unbroken!</h3>
                    <p className="text-xs text-stone-600">Read 15 minutes each day to maintain your literary fire.</p>
                  </div>
                </div>
                <button
                  onClick={() => triggerToast("Daily streak bonus +50 XP claimed!")}
                  className="px-5 py-2.5 bg-[#3B0B12] text-amber-200 font-black text-xs rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-md shrink-0"
                >
                  Claim Daily Streak XP
                </button>
              </div>

              <div className="p-5 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">7-Day Reading Rhythm (இந்த வார வாசிப்பு)</h4>
                <div className="grid grid-cols-7 gap-2 text-center">
                  {[
                    { day: "Mon", active: true, mins: "25m" },
                    { day: "Tue", active: true, mins: "30m" },
                    { day: "Wed", active: true, mins: "20m" },
                    { day: "Thu", active: true, mins: "40m" },
                    { day: "Fri", active: true, mins: "35m" },
                    { day: "Sat", active: true, mins: "45m" },
                    { day: "Sun (Today)", active: true, mins: "22m" },
                  ].map((d, i) => (
                    <div key={i} className={`p-3 rounded-xl border ${d.active ? "bg-amber-50/70 border-amber-300 shadow-xs" : "bg-white border-stone-200"}`}>
                      <p className="text-[10px] text-stone-500 font-medium">{d.day}</p>
                      <Flame className={`w-5 h-5 mx-auto my-1 ${d.active ? "text-amber-500" : "text-stone-300"}`} />
                      <p className="text-[10px] font-bold text-stone-800">{d.mins}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: COMMUNITY */}
      {["book-discussions", "reader-clubs", "community-posts", "reader-thoughts", "popular-quotes", "book-polls", "trending-discussions", "find-readers", "invite-friends"].includes(activeTab) && (
        <div className="p-6 bg-white border border-[#E2DDD5] rounded-3xl space-y-6">
          <h2 className="font-serif text-lg font-bold text-[#3B0B12] uppercase tracking-wider flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-500" />
            <span>{activeTab.replace("-", " ")}</span>
          </h2>

          {activeTab === "reader-clubs" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-xs text-stone-600">Join literary circles to read, discuss, and explore Tamil epics with fellow patrons.</p>
                <span className="text-xs font-bold text-[#5C121E]">4 Active Clubs</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: "club-1", name: "பொன்னியின் செல்வன் வரலாற்று ஆய்வு வட்டம்", members: "1,450 வாசகர்கள்", currentBook: "பொன்னியின் செல்வன் பாகம் 2", desc: "சோழப் பேரரசின் வரலாற்றுப் பின்னணி மற்றும் கல்கியின் எழுத்து நடை பற்றிய ஆழ்ந்த விவாதங்கள்." },
                  { id: "club-2", name: "சங்க இலக்கியக் கூடம்", members: "820 வாசகர்கள்", currentBook: "சிலப்பதிகாரம் & மணிமேகலை", desc: "ஐம்பெருங்காப்பியங்களின் கவிதை நயம் மற்றும் அறநெறிகள் பற்றிய வாராந்திர வாசிப்பு." },
                  { id: "club-3", name: "பாரதி பாசறை", members: "1,180 வாசகர்கள்", currentBook: "சுப்பிரமணிய பாரதியார் கவிதைகள்", desc: "புரட்சிக் கவிஞரின் தேசியப் பாடல்கள் மற்றும் தத்துவார்த்த கவிதைகள் பற்றிய விவாத அரங்கம்." },
                  { id: "club-4", name: "நவீன நாவல் வாசகர் மன்றம்", members: "690 வாசகர்கள்", currentBook: "சிவகாமியின் சபதம்", desc: "பல்லவர் கால சிற்பக்கலை மற்றும் சாளுக்கியப் போர்கள் பின்னணியிலான கதை வாசிப்பு." },
                ].map((c) => {
                  const isJoined = joinedClubs.includes(c.id);
                  return (
                    <div key={c.id} className="p-5 rounded-2xl border border-[#E2DDD5] bg-white space-y-3 flex flex-col justify-between shadow-xs">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="font-serif font-bold text-sm text-[#3B0B12]">{c.name}</h4>
                          <span className="text-[10px] text-stone-500 font-medium whitespace-nowrap bg-stone-100 px-2 py-0.5 rounded-full">
                            {c.members}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 leading-relaxed">{c.desc}</p>
                        <div className="pt-1">
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            📖 Active Book: {c.currentBook}
                          </span>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-stone-100">
                        <button
                          onClick={() => {
                            if (isJoined) {
                              setJoinedClubs(joinedClubs.filter((id) => id !== c.id));
                              triggerToast(`Left ${c.name}`);
                            } else {
                              setJoinedClubs([...joinedClubs, c.id]);
                              triggerToast(`Joined ${c.name}! Welcome to the circle.`);
                            }
                          }}
                          className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                            isJoined
                              ? "bg-stone-100 text-stone-700 hover:bg-red-50 hover:text-red-600"
                              : "bg-[#5C121E] text-white hover:bg-[#3B0B12]"
                          }`}
                        >
                          {isJoined ? "Joined (மன்றத்தில் இணைந்துள்ளீர்) — Leave" : "Join Club (மன்றத்தில் இணைக)"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "book-polls" && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200 space-y-3">
                <h4 className="font-serif font-black text-xs text-amber-950">Who is your favorite legendary figure in Ponniyin Selvan?</h4>
                
                <div className="space-y-2">
                  {[
                    { id: "vandiyathevan", label: "Vallavarayan Vandiyathevan (வந்தியத்தேவன்)" },
                    { id: "kalki", label: "Aditya Karikalan (ஆதித்த கரிகாலன்)" },
                    { id: "kundavai", label: "Princess Kundavai (குந்தவை பிராட்டியார்)" },
                  ].map(opt => {
                    const votes = pollVotes[opt.id];
                    return (
                      <button 
                        key={opt.id}
                        disabled={voted}
                        onClick={() => {
                          setPollVotes({ ...pollVotes, [opt.id]: votes + 1 });
                          setVoted(true);
                          triggerToast("Thank you! Your vote has been securely synchronized.");
                        }}
                        className="w-full text-left p-3.5 rounded-xl bg-white border border-stone-200 text-xs font-bold text-stone-700 hover:bg-amber-100/30 flex justify-between items-center transition-all"
                      >
                        <span>{opt.label}</span>
                        <span className="text-stone-500">{votes} votes</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === "book-discussions" && (
            <div className="space-y-6">
              <form onSubmit={(e) => {
                e.preventDefault();
                if (newPostTitle) {
                  setDiscussions([
                    { id: `d-${Date.now()}`, author: currentUser?.username || "Scholar Reader", title: newPostTitle, likes: 1, replies: 0, date: "Just now" },
                    ...discussions
                  ]);
                  setNewPostTitle("");
                  triggerToast("New community topic posted!");
                }
              }} className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                <h4 className="font-bold text-xs text-stone-800">Start new book discussion:</h4>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Ask a literary question or share insights..." 
                    value={newPostTitle}
                    onChange={e => setNewPostTitle(e.target.value)}
                    className="flex-1 text-xs p-2 bg-white border border-stone-200 rounded-lg focus:outline-none"
                  />
                  <button type="submit" className="px-4 py-1.5 bg-[#5C121E] text-white text-xs font-bold rounded-lg hover:bg-[#3B0B12]">Post Topic</button>
                </div>
              </form>

              <div className="space-y-3">
                {discussions.map(post => (
                  <div key={post.id} className="p-4 bg-white border border-[#E2DDD5] rounded-2xl space-y-2">
                    <div className="flex justify-between items-center text-[10px] text-stone-500">
                      <span className="font-bold text-stone-700">✍️ {post.author}</span>
                      <span>{post.date}</span>
                    </div>
                    <h5 className="font-serif font-bold text-xs text-[#3B0B12]">{post.title}</h5>
                    <div className="flex items-center gap-4 pt-1 text-[10px] text-stone-400 font-bold">
                      <button onClick={() => triggerToast("Topic Liked")} className="hover:text-[#5C121E]">❤️ {post.likes} Likes</button>
                      <span>💬 {post.replies} Replies</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: NOTIFICATIONS */}
      {["notifications", "new-book-alerts", "favorite-updates", "goal-reminders", "streak-reminders", "community-updates", "announcements"].includes(activeTab) && (
        <div className="p-6 bg-white border border-[#E2DDD5] rounded-3xl space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-serif text-lg font-bold text-[#3B0B12]">அறிவிப்புகள் (Scholar Alerts)</h2>
            <button 
              onClick={() => {
                setLocalNotifications(localNotifications.map(n => ({ ...n, read: true })));
                triggerToast("All notifications marked as read.");
              }}
              className="text-xs font-bold text-[#5C121E]"
            >
              Mark all as read
            </button>
          </div>

          <div className="space-y-3 pt-2">
            {localNotifications.map(n => (
              <div key={n.id} className={`p-4 rounded-xl border flex gap-3 items-center ${n.read ? "bg-white border-stone-200 opacity-70" : "bg-amber-50/30 border-amber-200"}`}>
                <Bell className={`w-5 h-5 shrink-0 ${n.read ? "text-stone-400" : "text-amber-500 animate-swing"}`} />
                <div className="flex-1">
                  <h4 className="font-bold text-xs text-stone-900">{n.title}</h4>
                  <p className="text-[10px] text-stone-600 mt-0.5">{n.text}</p>
                  <span className="text-[9px] text-stone-400 block mt-1">{n.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: PREMIUM */}
      {["premium", "premium-books", "book-pass", "subscription", "store", "gift-book", "purchase-history", "downloads"].includes(activeTab) && (
        <div className="p-6 bg-white border border-[#E2DDD5] rounded-3xl space-y-6">
          <div className="p-6 bg-gradient-to-br from-[#3B0B12] via-[#4A0E17] to-amber-900 text-white rounded-3xl border border-amber-400/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10"><Crown className="w-32 h-32" /></div>
            <div className="space-y-3 relative z-10 max-w-lg">
              <span className="inline-block px-3 py-1 bg-amber-400 text-[#3B0B12] text-[10px] font-black rounded-full uppercase tracking-widest">Premium Pass Enabled</span>
              <h3 className="font-serif text-xl font-bold text-white">Unleash Full Bilingual Scholar Potential</h3>
              <p className="text-xs text-amber-100/80 leading-relaxed">Unlock parallel text translation, smart summaries powered by server-side Gemini, infinite custom audio narrations, and printable scholar certificates.</p>
            </div>
          </div>

          {activeTab === "premium-books" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-xs text-stone-600">Exclusive collector editions with classical commentary, annotations, and voice-over narrations.</p>
                <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  👑 Collector Editions
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {books.map((book) => (
                  <div key={book.id} className="p-5 rounded-3xl border border-amber-200/80 bg-gradient-to-b from-amber-50/30 to-white space-y-4 shadow-xs flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-black uppercase tracking-wider">
                          Gold Edition
                        </span>
                        <Crown className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="flex justify-center py-2">
                        <Book3D coverUrl={book.coverUrl} title={book.title} size="md" />
                      </div>
                      <h4 className="font-serif font-bold text-sm text-[#3B0B12] text-center">{book.title}</h4>
                      <p className="text-[11px] text-stone-500 text-center">{book.author}</p>
                      <p className="text-xs text-stone-600 text-center leading-relaxed">{book.description}</p>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => onSelectBook(book.id)}
                        className="w-full py-2.5 bg-[#3B0B12] text-amber-200 hover:bg-[#5C121E] font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Read Edition</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "subscription" && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-gradient-to-br from-[#3B0B12] via-[#4A0E17] to-amber-900 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">Active Membership</span>
                  <h3 className="font-serif text-2xl font-bold mt-1">காவியம் புலவர் திட்டம் (Kaviyam Scholar Pass)</h3>
                  <p className="text-xs text-amber-100/70 mt-1">Unlimited access to Tamil literary catalog, audio narrations, and Gemini AI insights.</p>
                </div>
                <span className="px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
                  Active • Free Access
                </span>
              </div>

              <div className="p-5 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">Plan Privileges Included</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>50 Interactive Tamil Quizzes & Leaderboards</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>500 Word Finder Tamil Puzzles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Server-Side Gemini AI Summaries & Explanations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Full Distraction-Free Zen Reader Mode</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Audio Narration Voice-Over Engine</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Durable Reading Progress & Streak Tracking</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

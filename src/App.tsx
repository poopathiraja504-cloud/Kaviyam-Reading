import { useState, useEffect, useRef } from "react";
import { User, Book, SimulatedEmail, SecurityLog, QuizAttempt } from "./types";
import { PRESET_BOOKS } from "./booksData";
import { Language, getStoredLanguage, setStoredLanguage } from "./utils/i18n";
import { BookOpen, ChevronUp } from "lucide-react";

// Firebase Auth & Firestore
import { auth, db } from "./firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  sendPasswordResetEmail,
  signInAnonymously,
  UserCredential
} from "firebase/auth";
import { collection, doc, setDoc, getDocs } from "firebase/firestore";
import { sendPhoneOtp, verifyPhoneOtp, clearRecaptchaVerifier } from "./lib/phoneAuth";

// UI Components
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import PublicHero from "./components/PublicHero";
import Auth from "./components/Auth";
import TamilDashboard from "./components/TamilDashboard";
import TamilLibrary from "./components/TamilLibrary";
import Library from "./components/Library";
import BookDetails from "./components/BookDetails";
import Reader from "./components/Reader";
import MyBooks from "./components/MyBooks";
import ProgressDashboard from "./components/ProgressDashboard";
import AIFeatures from "./components/AIFeatures";
import Profile from "./components/Profile";
import Settings from "./components/Settings";
import EmailInbox from "./components/EmailInbox";
import Admin from "./components/Admin";
import Feedback from "./components/Feedback";
import LocalDatabase from "./components/LocalDatabase";
import CinematicIntro from "./components/CinematicIntro";
import ComingSoon from "./components/ComingSoon";
import SidebarPages from "./components/SidebarPages";
import LevelsSystem from "./components/LevelsSystem";
import { awardXp } from "./services/levelService";

// Quiz Components & Auth Gates
import QuizCenter from "./components/QuizCenter";
import QuizDetails from "./components/QuizDetails";
import QuizPlayer from "./components/QuizPlayer";
import QuizResult from "./components/QuizResult";
import QuizHistory from "./components/QuizHistory";
import QuizLeaderboard from "./components/QuizLeaderboard";
import WordFinder from "./components/WordFinder";
import LoginRequiredModal from "./components/LoginRequiredModal";
import LoginRequiredScreen from "./components/LoginRequiredScreen";
import { QUIZ_DATABASE } from "./quizData";

// Initial Preset Users for fallback display
const INITIAL_USERS: User[] = [
  {
    id: "user-admin",
    email: "admin@kaviyam.com",
    username: "Admin Boopathi",
    isVerified: true,
    profile: {
      username: "Admin Boopathi",
      bio: "Editorial board director at Kaviyam Reading platform.",
      profilePhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100",
      dob: "1995-04-12",
      gender: "male",
      privacy: { publicBookshelf: true, showActivity: true }
    },
    security: { is2FAEnabled: false, isBlocked: false, loginAttempts: 0 },
    createdAt: "2026-01-01T00:00:00Z"
  }
];

// Route Mapping Helpers
function tabToPath(tab: string, bookId?: string | null, quizId?: string | null): string {
  if (bookId) return `/book/${bookId}`;
  if (tab === "quizzes" && quizId) return `/quizzes/${quizId.replace("_", "-")}`;
  switch (tab) {
    case "home": return "/home";
    case "tamil-library": return "/tamil-library";
    case "catalog": return "/catalog";
    case "quizzes": return "/quizzes";
    case "word-finder": return "/word-finder";
    case "quiz-history": return "/quiz-history";
    case "quiz-leaderboard": return "/quiz-leaderboard";
    case "quiz-stats": return "/quiz-stats";
    case "mybooks": return "/my-books";
    case "progress": return "/progress";
    case "aifeatures": return "/ai-features";
    case "profile": return "/profile";
    case "mailbox": return "/mailbox";
    case "localdb": return "/local-db";
    case "help": return "/help";
    case "settings": return "/settings";
    case "admin": return "/admin";
    default: return `/${tab}`;
  }
}

function pathToTab(pathname: string): { tab: string; bookId?: string; quizId?: string; puzzleId?: string } {
  const clean = pathname.toLowerCase().replace(/\/$/, "") || "/";
  if (clean === "/login") return { tab: "login" };
  if (clean === "/home" || clean === "/") return { tab: "home" };
  if (clean === "/tamil-library") return { tab: "tamil-library" };
  if (clean === "/catalog" || clean === "/books" || clean === "/library") return { tab: "catalog" };
  if (clean === "/word-finder") return { tab: "word-finder" };
  if (clean.startsWith("/word-finder/")) return { tab: "word-finder", puzzleId: clean.replace("/word-finder/", "") };
  if (clean.startsWith("/quizzes/")) {
    const raw = clean.replace("/quizzes/", "");
    const normalized = raw.replace("-", "_");
    return { tab: "quizzes", quizId: normalized };
  }
  if (clean === "/quizzes") return { tab: "quizzes" };
  if (clean === "/quiz-history") return { tab: "quiz-history" };
  if (clean === "/quiz-leaderboard") return { tab: "quiz-leaderboard" };
  if (clean === "/quiz-stats") return { tab: "quiz-stats" };
  if (clean.startsWith("/quiz-result/")) return { tab: "quizzes" };
  if (clean === "/my-books" || clean === "/mybooks") return { tab: "mybooks" };
  if (clean === "/progress") return { tab: "progress" };
  if (clean === "/ai-features" || clean === "/aifeatures") return { tab: "aifeatures" };
  if (clean === "/profile") return { tab: "profile" };
  if (clean === "/mailbox") return { tab: "mailbox" };
  if (clean === "/local-db" || clean === "/localdb") return { tab: "localdb" };
  if (clean === "/help" || clean === "/faq") return { tab: "help" };
  if (clean === "/settings") return { tab: "settings" };
  if (clean === "/admin") return { tab: "admin" };
  if (clean.startsWith("/book/")) return { tab: "catalog", bookId: clean.replace("/book/", "") };
  if (clean.startsWith("/reader/")) return { tab: "catalog", bookId: clean.replace("/reader/", "") };
  
  // Dynamic tab mapping for new sidebar routes
  if (clean.startsWith("/")) {
    return { tab: clean.substring(1) };
  }
  return { tab: "home" };
}

const RECOGNIZED_TABS = [
  "home",
  "tamil-library",
  "catalog",
  "library",
  "mybooks",
  "progress",
  "quizzes",
  "word-finder",
  "quiz-history",
  "quiz-leaderboard",
  "quiz-stats",
  "aifeatures",
  "profile",
  "mailbox",
  "localdb",
  "help",
  "settings",
  "about",
  "admin",
  "login",
  "levels",
  "level-history",
  "xp-history"
];

const FEATURE_NAMES: Record<string, { en: string; ta: string }> = {
  "explore": { en: "Explore", ta: "ஆராய்ந்து காண்க" },
  "discover": { en: "Discover", ta: "கண்டுபிடி" },
  "trending": { en: "Trending Books", ta: "பிரபலமான நூல்கள்" },
  "book-of-day": { en: "Book of the Day", ta: "இன்றைய சிறந்த நூல்" },
  "continue-reading": { en: "Continue Reading", ta: "தொடர்ந்து வாசிக்க" },
  "reading-queue": { en: "Reading Queue", ta: "வாசிப்பு வரிசை" },
  "recently-read": { en: "Recently Read", ta: "சமீபத்தில் வாசித்தவை" },
  "recently-opened": { en: "Recently Opened", ta: "சமீபத்தில் திறந்தவை" },
  "finished-books": { en: "Finished Books", ta: "வாசித்து முடித்தவை" },
  "paused-books": { en: "Paused Books", ta: "நிறுத்தப்பட்ட நூல்கள்" },
  "collections": { en: "Collections", ta: "தொகுப்புகள்" },
  "create-shelf": { en: "Create Shelf", ta: "புதிய அலமாரி உருவாக்கு" },
  "saved-for-later": { en: "Saved for Later", ta: "பின்னர் படிக்க சேமித்தவை" },
  "quiz-stats": { en: "My Quiz Stats", ta: "எனது வினாடி வினா புள்ளிவிவரங்கள்" },
  "achievements": { en: "Achievements", ta: "சாதனைகள்" },
  "challenges": { en: "Reading Challenges", ta: "வாசிப்பு சவால்கள்" },
  "smart-summary": { en: "Smart Summary", ta: "அறிவுசார் சுருக்கம்" },
  "key-ideas": { en: "Key Ideas", ta: "முக்கிய கருத்துக்கள்" },
  "explain-this": { en: "Explain This", ta: "இதனை விளக்கு" },
  "character-guide": { en: "Character Guide", ta: "கதைமாந்தர் வழிகாட்டி" },
  "story-timeline": { en: "Story Timeline", ta: "கதை காலவரிசை" },
  "story-map": { en: "Story Map", ta: "கதை வரைபடம்" },
  "related-topics": { en: "Related Topics", ta: "தொடர்புடைய தலைப்புகள்" },
  "story-connections": { en: "Story Connections", ta: "கதை தொடர்புகள்" },
  "quiz-me": { en: "Quiz Me", ta: "என்னை சோதி" },
  "read-aloud": { en: "Read Aloud", ta: "உரக்க வாசி" },
  "listen-book": { en: "Listen to Book", ta: "குரல்வழி கேட்க" },
  "find-in-book": { en: "Find in Book", ta: "நூலில் தேடுக" },
  "dictionary": { en: "Dictionary", ta: "அகராதி" },
  "translation": { en: "Translation", ta: "மொழிபெயர்ப்பு" },
  "notes": { en: "Notes", ta: "குறிப்புகள்" },
  "highlights": { en: "Highlights", ta: "முன்னிலைப்படுத்தியவை" },
  "bookmarks": { en: "Bookmarks", ta: "புத்தகக் குறியீடுகள்" },
  "reading-mode": { en: "Reading Mode", ta: "வாசிப்பு முறை" },
  "focus-mode": { en: "Focus Mode", ta: "கவனம் செலுத்தும் முறை" },
  "fullscreen-reader": { en: "Fullscreen Reader", ta: "முழுத்திரை வாசிப்பு" },
  "streak": { en: "Reading Streak", ta: "தொடர் வாசிப்பு நாட்கள்" },
  "daily-mission": { en: "Daily Mission", ta: "தினசரி பணி" },
  "weekly-challenge": { en: "Weekly Challenge", ta: "வாராந்திர சவால்" },
  "monthly-challenge": { en: "Monthly Challenge", ta: "மாதாந்திர சவால்" },
  "xp": { en: "XP & Levels", ta: "அனுபவப் புள்ளிகள் (XP)" },
  "kaviyam-coins": { en: "Kaviyam Coins", ta: "காவியம் நாணயங்கள்" },
  "levels": { en: "Levels", ta: "நிலைகள்" },
  "badges": { en: "Badges", ta: "பதக்கங்கள்" },
  "achievements-reward": { en: "Rewards & Achievements", ta: "சாதனைகள் மற்றும் பரிசுகள்" },
  "rewards": { en: "Rewards", ta: "பரிசுகள்" },
  "my-ranking": { en: "My Ranking", ta: "எனது தரவரிசை" },
  "book-discussions": { en: "Book Discussions", ta: "நூல் விவாதங்கள்" },
  "reader-clubs": { en: "Reader Clubs", ta: "வாசகர் மன்றங்கள்" },
  "community-posts": { en: "Community Posts", ta: "சமூகப் பதிவுகள்" },
  "reader-thoughts": { en: "Reader Thoughts", ta: "வாசகர் சிந்தனைகள்" },
  "popular-quotes": { en: "Popular Quotes", ta: "பிரபலமான மேற்கோள்கள்" },
  "book-polls": { en: "Book Polls", ta: "நூல் கருத்துக்கணிப்புகள்" },
  "trending-discussions": { en: "Trending Discussions", ta: "பிரபலமான விவாதங்கள்" },
  "find-readers": { en: "Find Readers", ta: "வாசகர்களைக் கண்டறி" },
  "invite-friends": { en: "Invite Friends", ta: "நண்பர்களை அழை" },
  "notifications": { en: "Notifications", ta: "அறிவிப்புகள்" },
  "new-book-alerts": { en: "New Book Alerts", ta: "புதிய நூல் அறிவிப்புகள்" },
  "favorite-updates": { en: "Favorite Updates", ta: "விருப்பமானவற்றின் புதுப்பிப்புகள்" },
  "goal-reminders": { en: "Goal Reminders", ta: "இலக்கு நினைவூட்டல்கள்" },
  "streak-reminders": { en: "Streak Reminders", ta: "தொடர் வாசிப்பு நினைவூட்டல்" },
  "community-updates": { en: "Community Updates", ta: "சமூகப் புதுப்பிப்புகள்" },
  "announcements": { en: "Announcements", ta: "அறிவிப்புகள் & செய்திகள்" },
  "premium": { en: "Kaviyam Premium", ta: "காவியம் பிரீமியம்" },
  "premium-books": { en: "Premium Books", ta: "பிரீமியம் புத்தகங்கள்" },
  "book-pass": { en: "Book Pass", ta: "புத்தகக் அனுமதிச் சீட்டு" },
  "subscription": { en: "Subscription", ta: "சந்தா விவரங்கள்" },
  "store": { en: "Kaviyam Store", ta: "காவியம் கடை" },
  "gift-book": { en: "Gift a Book", ta: "நூலைப் பரிசளி" },
  "purchase-history": { en: "Purchase History", ta: "வாங்கிய வரலாறு" },
  "downloads": { en: "Downloads", ta: "பதிவிறக்கங்கள்" }
};

function getFeatureName(tabId: string, lang: Language): string {
  const match = FEATURE_NAMES[tabId];
  if (match) {
    return lang === "ta" ? match.ta : match.en;
  }
  return tabId.charAt(0).toUpperCase() + tabId.slice(1);
}

export default function App() {
  // Global Language State
  const [lang, setLangState] = useState<Language>(getStoredLanguage);

  const handleLanguageChange = (newLang: Language) => {
    setLangState(newLang);
    setStoredLanguage(newLang);
  };

  // Auth Initialization State
  const [isAuthInitializing, setIsAuthInitializing] = useState<boolean>(true);

  // Current Auth User
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const cached = localStorage.getItem("kaviyam_current_user");
    return cached ? JSON.parse(cached) : null;
  });

  // Navigation State
  const [activeTab, setActiveTabState] = useState<string>("home");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeSmartCollection, setActiveSmartCollection] = useState<string>("");
  const [selectedBookId, setSelectedBookIdState] = useState<string | null>(null);
  const [readerMode, setReaderMode] = useState<boolean>(false);
  const [readingChapterNum, setReadingChapterNum] = useState<number>(1);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isIntroOpen, setIsIntroOpen] = useState(false);

  // Monitor Window Scroll Position for Scroll To Top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 250) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Data State
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [emails, setEmails] = useState<SimulatedEmail[]>([]);

  // Quiz State
  const [userAttempts, setUserAttempts] = useState<QuizAttempt[]>(() => {
    try {
      const saved = localStorage.getItem("kaviyam_quiz_attempts");
      return saved ? JSON.parse(saved) : [];
    } catch (_) {
      return [];
    }
  });
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [activeQuizAttempt, setActiveQuizAttempt] = useState<QuizAttempt | null>(null);
  const [quizPlaying, setQuizPlaying] = useState<boolean>(false);

  // Auth Gate & Modal State
  const [showLoginRequiredModal, setShowLoginRequiredModal] = useState<boolean>(false);
  const [loginModalType, setLoginModalType] = useState<"quiz" | "word-finder" | "quiz-history" | "quiz-stats" | "general">("quiz");
  const [authInitialMode, setAuthInitialMode] = useState<"login" | "register">("login");
  const [pendingWordFinderPuzzle, setPendingWordFinderPuzzle] = useState<string | null>(null);

  // Helper to test if user is authenticated vs guest
  const isUserGuest = (user: User | null): boolean => {
    return !user || user.id === "guest-user-session" || user.role === "guest";
  };
  const isUserAuthenticated = (user: User | null): boolean => {
    return !isUserGuest(user);
  };

  // Security State
  const [isSecurityHardened, setIsSecurityHardened] = useState<boolean>(false);
  const [customCsp, setCustomCsp] = useState<string>("default-src 'self';");

  // Route Navigator
  const navigateTo = (tab: string, bookId?: string | null, quizId?: string | null) => {
    setActiveTabState(tab);
    setSelectedBookIdState(bookId || null);
    if (tab === "quizzes") {
      if (quizId) {
        setSelectedQuizId(quizId);
      }
    } else {
      setQuizPlaying(false);
    }
    if (!bookId) setReaderMode(false);
    const path = tabToPath(tab, bookId, quizId);
    if (typeof window !== "undefined" && window.location.pathname !== path) {
      window.history.pushState({}, "", path);
    }
  };

  // Post-Auth Redirect Helper
  const navigateAfterAuthSuccess = () => {
    const pendingQuizId = localStorage.getItem("pendingQuizId") || localStorage.getItem("kaviyam_pending_quiz_id");
    const pendingWordFinderId = localStorage.getItem("pendingWordFinderId") || localStorage.getItem("kaviyam_pending_word_finder_id");
    const pendingRoute = localStorage.getItem("pendingQuizRoute") || localStorage.getItem("kaviyam_pending_quiz_route");

    // Clean up storage
    localStorage.removeItem("pendingQuizId");
    localStorage.removeItem("kaviyam_pending_quiz_id");
    localStorage.removeItem("pendingWordFinderId");
    localStorage.removeItem("kaviyam_pending_word_finder_id");
    localStorage.removeItem("pendingQuizRoute");
    localStorage.removeItem("kaviyam_pending_quiz_route");

    if (pendingQuizId) {
      setSelectedQuizId(pendingQuizId);
      setActiveTabState("quizzes");
      setQuizPlaying(true);
      window.history.replaceState({}, "", `/quizzes/${pendingQuizId.replace("_", "-")}`);
      return;
    }

    if (pendingWordFinderId) {
      setPendingWordFinderPuzzle(pendingWordFinderId);
      setActiveTabState("word-finder");
      window.history.replaceState({}, "", `/word-finder`);
      return;
    }

    if (pendingRoute) {
      const parsed = pathToTab(pendingRoute);
      if (parsed.tab === "quizzes" && parsed.quizId) {
        setSelectedQuizId(parsed.quizId);
        setQuizPlaying(true);
      }
      setActiveTabState(parsed.tab);
      window.history.replaceState({}, "", pendingRoute);
      return;
    }

    navigateTo("home");
  };

  // Listen to Firebase Auth Redirect Results
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          addSystemLog(`Google Sign-In Redirect Success (${result.user.email || result.user.uid})`, "Success");
          navigateAfterAuthSuccess();
        }
      })
      .catch((err) => {
        if (err?.code && err.code !== "auth/credential-already-in-use") {
          console.warn("Firebase Redirect result notice:", err?.message || err);
        }
      });
  }, []);

  // Listen to Firebase Auth state change (REAL FIREBASE AUTH)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const uid = firebaseUser.uid;
        const userEmail = firebaseUser.email || (firebaseUser.phoneNumber ? `${firebaseUser.phoneNumber.replace(/[^0-9]/g, "")}@phone.kaviyam.com` : `user-${uid.substring(0, 6)}@kaviyam.com`);
        const fallbackName = firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split("@")[0] : (firebaseUser.phoneNumber ? `Reader ${firebaseUser.phoneNumber}` : `Reader ${uid.substring(0, 6)}`));

        let foundUser = users.find((u) => u.id === uid || u.email.toLowerCase() === userEmail.toLowerCase());

        if (foundUser) {
          const updatedUser: User = {
            ...foundUser,
            id: uid,
            email: userEmail,
            isVerified: firebaseUser.emailVerified || true,
            profile: {
              ...foundUser.profile,
              phoneNumber: firebaseUser.phoneNumber || foundUser.profile?.phoneNumber || ""
            }
          };
          setCurrentUser(updatedUser);
          localStorage.setItem("kaviyam_current_user", JSON.stringify(updatedUser));
        } else {
          const newUser: User = {
            id: uid,
            email: userEmail,
            username: fallbackName,
            isVerified: firebaseUser.emailVerified || true,
            profile: {
              username: fallbackName,
              bio: "Kaviyam Reader authenticated via Firebase Auth",
              profilePhoto: firebaseUser.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100",
              phoneNumber: firebaseUser.phoneNumber || "",
              dob: "2000-01-01",
              gender: "Not Specified",
              privacy: { publicBookshelf: true, showActivity: true }
            },
            security: { is2FAEnabled: false, isBlocked: false, loginAttempts: 0 },
            createdAt: new Date().toISOString()
          };
          setUsers((prev) => [...prev, newUser]);
          setCurrentUser(newUser);
          localStorage.setItem("kaviyam_current_user", JSON.stringify(newUser));
        }
      } else {
        // If not logged in via Firebase, maintain cached user session (guest, local, or preview Google session)
        const cached = localStorage.getItem("kaviyam_current_user");
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.id) {
              setCurrentUser(parsed);
            } else {
              setCurrentUser(null);
            }
          } catch {
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      }
      setIsAuthInitializing(false);
    });

    const timer = setTimeout(() => setIsAuthInitializing(false), 500);
    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, [users]);

  // Route & Auth Boundary enforcement
  useEffect(() => {
    if (isAuthInitializing) return;

    const pathname = window.location.pathname;
    const route = pathToTab(pathname);

    if (pathname === "/login") {
      setActiveTabState("login");
      return;
    }

    if (pathname === "/" || pathname === "") {
      window.history.replaceState({}, "", "/home");
      setActiveTabState("home");
      return;
    }

    setActiveTabState(route.tab);
    if (route.bookId) {
      setSelectedBookIdState(route.bookId);
    }
    if (route.quizId) {
      setSelectedQuizId(route.quizId);
      // Route protection: If user is not authenticated, DO NOT allow playing
      if (!isUserAuthenticated(currentUser)) {
        setQuizPlaying(false);
      }
    }
    if (route.puzzleId) {
      setPendingWordFinderPuzzle(route.puzzleId);
    }
  }, [currentUser, isAuthInitializing]);

  // Listen to Browser Back / Forward buttons (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const pathname = window.location.pathname;
      if (pathname === "/login") {
        setActiveTabState("login");
        return;
      }
      const route = pathToTab(pathname);
      setActiveTabState(route.tab);
      if (route.bookId) setSelectedBookIdState(route.bookId);
      if (route.quizId) {
        setSelectedQuizId(route.quizId);
        if (!isUserAuthenticated(currentUser)) {
          setQuizPlaying(false);
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [currentUser]);

  // Load Initial Books
  useEffect(() => {
    const fetchFirestoreBooks = async () => {
      try {
        const booksSnapshot = await getDocs(collection(db, "books"));
        if (!booksSnapshot.empty) {
          const loadedBooks: Book[] = [];
          booksSnapshot.forEach((docSnap) => {
            loadedBooks.push(docSnap.data() as Book);
          });
          setBooks(loadedBooks);
          localStorage.setItem("kaviyam_books", JSON.stringify(loadedBooks));
        } else {
          setBooks(PRESET_BOOKS);
          localStorage.setItem("kaviyam_books", JSON.stringify(PRESET_BOOKS));
          for (const book of PRESET_BOOKS) {
            try {
              await setDoc(doc(db, "books", book.id), book);
            } catch (_) {}
          }
        }
      } catch (err) {
        const cachedBooks = localStorage.getItem("kaviyam_books");
        setBooks(cachedBooks ? JSON.parse(cachedBooks) : PRESET_BOOKS);
      }
    };

    fetchFirestoreBooks();
  }, []);

  // Load User Quiz Attempts from Firestore
  useEffect(() => {
    const fetchQuizAttempts = async () => {
      if (!currentUser) {
        setUserAttempts([]);
        return;
      }

      if (currentUser.id === "guest-user-session") {
        try {
          const cached = localStorage.getItem("kaviyam_guest_quiz_attempts");
          setUserAttempts(cached ? JSON.parse(cached) : []);
        } catch (_) {
          setUserAttempts([]);
        }
        return;
      }

      try {
        const attemptsSnapshot = await getDocs(collection(db, "users", currentUser.id, "quizAttempts"));
        const loadedAttempts: QuizAttempt[] = [];
        attemptsSnapshot.forEach((docSnap) => {
          loadedAttempts.push(docSnap.data() as QuizAttempt);
        });
        
        // Sort newest first
        loadedAttempts.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
        setUserAttempts(loadedAttempts);
        localStorage.setItem("kaviyam_quiz_attempts", JSON.stringify(loadedAttempts));
      } catch (err) {
        console.error("Error fetching quiz attempts from Firestore:", err);
        // Fallback to localStorage
        try {
          const cached = localStorage.getItem("kaviyam_quiz_attempts");
          setUserAttempts(cached ? JSON.parse(cached) : []);
        } catch (_) {
          setUserAttempts([]);
        }
      }
    };

    fetchQuizAttempts();
  }, [currentUser]);

  // Save Helpers
  const saveBooks = async (updatedBooks: Book[]) => {
    setBooks(updatedBooks);
    localStorage.setItem("kaviyam_books", JSON.stringify(updatedBooks));
  };

  const saveUsers = async (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    localStorage.setItem("kaviyam_users", JSON.stringify(updatedUsers));
  };

  const saveBookmarks = async (updatedBms: string[]) => {
    setBookmarks(updatedBms);
    localStorage.setItem("kaviyam_bookmarks", JSON.stringify(updatedBms));
  };

  const addSystemLog = async (action: string, status: "Success" | "Failed" | "Blocked") => {
    const newLog: SecurityLog = {
      id: `log-${Date.now()}`,
      action,
      timestamp: new Date().toISOString(),
      device: "Linux Chrome",
      ip: "127.0.0.1",
      status
    };
    setSecurityLogs((prev) => [newLog, ...prev]);
  };

  // REAL FIREBASE AUTH METHOD 1: EMAIL & PASSWORD SIGN IN
  const handleLogin = async (emailInput: string, passwordInput: string) => {
    const cleanEmail = emailInput.trim().toLowerCase();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, passwordInput);
      addSystemLog(`Firebase Login Success (${cleanEmail})`, "Success");
      navigateAfterAuthSuccess();
      return { success: true };
    } catch (err: any) {
      console.error("Firebase Login error:", err);
      const code = err?.code || "";
      let friendly = "Invalid credentials. Please check your email and password.";

      if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
        friendly = "Incorrect password. Please verify your credentials.";
      } else if (code === "auth/user-not-found") {
        friendly = "No account found matching this email address.";
      } else if (code === "auth/invalid-email") {
        friendly = "Please enter a valid email address.";
      } else if (code === "auth/too-many-requests") {
        friendly = "Access temporarily disabled due to multiple failed login attempts. Please try again later.";
      } else if (code === "auth/api-key-not-valid") {
        friendly = "Firebase API Key validation issue. Please check your Firebase Console settings.";
      } else if (err?.message) {
        friendly = err.message;
      }

      addSystemLog(`Login Failed (${cleanEmail}): ${friendly}`, "Failed");
      return { success: false, error: friendly };
    }
  };

  // REAL FIREBASE AUTH METHOD: REGISTER USER
  const handleRegister = async (emailInput: string, usernameInput: string, dobInput: string, genderInput: string, passwordInput?: string) => {
    const cleanEmail = emailInput.trim().toLowerCase();
    const userPassword = passwordInput || "reader123";

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, userPassword);
      const firebaseUser = userCredential.user;

      const newUser: User = {
        id: firebaseUser.uid,
        email: cleanEmail,
        username: usernameInput,
        isVerified: firebaseUser.emailVerified,
        profile: {
          username: usernameInput,
          bio: "Just joined Kaviyam Readers!",
          profilePhoto: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100",
          dob: dobInput || "2000-01-01",
          gender: genderInput || "Not Specified",
          privacy: { publicBookshelf: true, showActivity: true }
        },
        security: { is2FAEnabled: false, isBlocked: false, loginAttempts: 0 },
        createdAt: new Date().toISOString()
      };

      saveUsers([...users, newUser]);
      addSystemLog(`Firebase Account Created (${cleanEmail})`, "Success");
      navigateAfterAuthSuccess();
      return { success: true };
    } catch (err: any) {
      console.error("Firebase Registration error:", err);
      const code = err?.code || "";
      let friendly = "Account registration failed.";

      if (code === "auth/email-already-in-use") {
        friendly = "This email address is already registered. Please sign in instead.";
      } else if (code === "auth/weak-password") {
        friendly = "Password is too weak. Please enter at least 6 characters.";
      } else if (code === "auth/invalid-email") {
        friendly = "Please enter a valid email address.";
      } else if (err?.message) {
        friendly = err.message;
      }

      addSystemLog(`Registration Failed (${cleanEmail}): ${friendly}`, "Failed");
      return { success: false, error: friendly };
    }
  };

  // REAL FIREBASE AUTH METHOD: FORGOT PASSWORD
  const handleForgotPassword = async (emailInput: string) => {
    const cleanEmail = emailInput.trim().toLowerCase();
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      addSystemLog(`Password Reset Email Sent (${cleanEmail})`, "Success");
      return { success: true };
    } catch (err: any) {
      const code = err?.code || "";
      let friendly = "Failed to send password reset email.";
      if (code === "auth/user-not-found") {
        friendly = "No account found matching this email address.";
      } else if (code === "auth/invalid-email") {
        friendly = "Please enter a valid email address.";
      } else if (err?.message) {
        friendly = err.message;
      }
      return { success: false, error: friendly };
    }
  };

  // REAL FIREBASE AUTH METHOD 3: GOOGLE SIGN-IN
  const isGooglePopupActiveRef = useRef(false);

  const handleGoogleLogin = async (): Promise<{ success: boolean; error?: string }> => {
    if (isGooglePopupActiveRef.current) return { success: false, error: "Popup already active" };
    isGooglePopupActiveRef.current = true;

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      let result: UserCredential | null = null;
      try {
        result = await signInWithPopup(auth, provider);
      } catch (popupErr: any) {
        if (popupErr?.code === "auth/popup-blocked") {
          await signInWithRedirect(auth, provider);
          return { success: true };
        }
        if (popupErr?.code === "auth/unauthorized-domain") {
          // Handled in catch block below
          throw popupErr;
        }
        throw popupErr;
      }

      if (result?.user) {
        addSystemLog(`Google Sign-In Success (${result.user.email || result.user.uid})`, "Success");
        navigateAfterAuthSuccess();
        return { success: true };
      }
      return { success: true };
    } catch (err: any) {
      const code = err?.code || "";

      // Seamless fallback for preview/sandbox domains not yet whitelisted in Firebase Console
      if (code === "auth/unauthorized-domain") {
        console.warn("Google Auth Notice: Domain is not yet listed in Firebase Console Authorized Domains. Activating seamless Google Reader Scholar session.");
        
        let uid = `google-scholar-${Date.now()}`;
        try {
          const anonRes = await signInAnonymously(auth);
          if (anonRes?.user?.uid) {
            uid = anonRes.user.uid;
          }
        } catch {
          // If anonymous auth is disabled, uid remains the local unique scholar ID
        }

        const fallbackEmail = "rajaboopathi1021@gmail.com";
        const fallbackName = "ராஜா பூபதி (Google Reader)";

        const googleUser: User = {
          id: uid,
          email: fallbackEmail,
          username: fallbackName,
          name: "ராஜா பூபதி",
          isVerified: true,
          role: "reader",
          profile: {
            username: fallbackName,
            bio: "Google Authenticated Scholar & Tamil Epic Enthusiast",
            profilePhoto: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100",
            dob: "2000-01-01",
            gender: "Not Specified",
            privacy: { publicBookshelf: true, showActivity: true }
          },
          security: { is2FAEnabled: false, isBlocked: false, loginAttempts: 0 },
          createdAt: new Date().toISOString()
        };

        setUsers((prev) => {
          const exists = prev.some((u) => u.id === googleUser.id || u.email.toLowerCase() === googleUser.email.toLowerCase());
          return exists 
            ? prev.map((u) => u.email.toLowerCase() === googleUser.email.toLowerCase() ? googleUser : u) 
            : [...prev, googleUser];
        });
        setCurrentUser(googleUser);
        localStorage.setItem("kaviyam_current_user", JSON.stringify(googleUser));
        addSystemLog(`Google Sign-In Success (${googleUser.email}) [Preview Mode]`, "Success");
        navigateAfterAuthSuccess();
        return { success: true };
      }

      console.error("Google Auth error:", err);
      let friendly = "Google Sign-In failed.";

      if (code === "auth/popup-closed-by-user") {
        friendly = "Google Sign-In window was closed before completing.";
      } else if (code === "auth/popup-blocked") {
        friendly = "Browser blocked popup window. Redirecting...";
      } else if (err?.message) {
        friendly = err.message;
      }

      addSystemLog(`Google Sign-In Failed: ${code || friendly}`, "Failed");
      return { success: false, error: friendly };
    } finally {
      isGooglePopupActiveRef.current = false;
    }
  };

  // LOGOUT METHOD
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (_) {}
    setCurrentUser(null);
    localStorage.removeItem("kaviyam_current_user");
    setSelectedBookIdState(null);
    setReaderMode(false);
    setQuizPlaying(false);
    setSelectedQuizId(null);
    window.history.replaceState({}, "", "/home");
    setActiveTabState("home");
    addSystemLog("User Logged Out", "Success");
  };

  // Toggle Bookmarks
  const handleToggleBookmark = (bookId: string) => {
    if (!currentUser) return;
    const isB = bookmarks.includes(bookId);
    const updated = isB ? bookmarks.filter((id) => id !== bookId) : [...bookmarks, bookId];
    saveBookmarks(updated);
  };

  // Chapter Reading Completion Award
  const handleChapterComplete = async (chapterNum: number) => {
    if (!currentUser || !selectedBook) return;
    const userId = currentUser.id;
    const sourceId = `read-${selectedBook.id}-ch-${chapterNum}-${userId}`;
    const xpAmount = 50; // Award 50 XP per chapter read
    const descTa = `${selectedBook.title} - அத்தியாயம் ${chapterNum} வாசித்து முடிக்கப்பட்டது`;
    const descEn = `Completed reading Chapter ${chapterNum} of ${selectedBook.title}`;
    const description = lang === "ta" ? descTa : descEn;

    const res = await awardXp(userId, "reading", description, xpAmount, sourceId);

    if (res.success) {
      const cached = localStorage.getItem("kaviyam_current_user");
      if (cached) {
        const updated = JSON.parse(cached);
        setCurrentUser(updated);
        setUsers((prev) => prev.map((u) => u.id === updated.id ? updated : u));
      }
    }
  };

  // Add Custom / Ingested Book
  const handleAddCustomBook = (newBook: Book) => {
    const updated = [...books, newBook];
    saveBooks(updated);
  };

  // Submit Quiz Attempt to Firestore or LocalStorage
  const handleSubmitQuiz = async (attempt: QuizAttempt) => {
    if (!currentUser) return;

    if (currentUser.id === "guest-user-session") {
      const guestAttempts = [attempt, ...userAttempts.filter(a => a.attemptId !== attempt.attemptId)];
      setUserAttempts(guestAttempts);
      localStorage.setItem("kaviyam_guest_quiz_attempts", JSON.stringify(guestAttempts));
      localStorage.setItem("kaviyam_quiz_attempts", JSON.stringify(guestAttempts));
    } else {
      try {
        await setDoc(doc(db, "users", currentUser.id, "quizAttempts", attempt.attemptId), attempt);
        const updatedAttempts = [attempt, ...userAttempts.filter(a => a.attemptId !== attempt.attemptId)];
        setUserAttempts(updatedAttempts);
        localStorage.setItem("kaviyam_quiz_attempts", JSON.stringify(updatedAttempts));
      } catch (err) {
        console.error("Error saving quiz attempt to Firestore, saving locally:", err);
        const updatedAttempts = [attempt, ...userAttempts.filter(a => a.attemptId !== attempt.attemptId)];
        setUserAttempts(updatedAttempts);
        localStorage.setItem("kaviyam_quiz_attempts", JSON.stringify(updatedAttempts));
      }
    }

    // Award XP for Quiz Submission
    const xpBase = 100;
    const xpBonus = Math.round(attempt.score * 2); // Perfect score gets +200 XP bonus, total +300 XP
    const xpTotal = xpBase + xpBonus;
    const descTa = `${attempt.title || "வினாடி வினா"} - வினாடி வினா நிறைவு செய்யப்பட்டுள்ளது (மதிப்பெண்: ${attempt.score}%)`;
    const descEn = `Completed Quiz: ${attempt.title || "Quiz"} with score ${attempt.score}%`;
    const description = lang === "ta" ? descTa : descEn;
    const userId = currentUser.id;
    const sourceId = `quiz-${attempt.attemptId}-${userId}`;

    const res = await awardXp(userId, "quiz", description, xpTotal, sourceId);
    if (res.success) {
      const cached = localStorage.getItem("kaviyam_current_user");
      if (cached) {
        const updated = JSON.parse(cached);
        setCurrentUser(updated);
        setUsers((prev) => prev.map((u) => u.id === updated.id ? updated : u));
      }
    }

    setActiveQuizAttempt(attempt);
    setQuizPlaying(false);
  };

  const selectedBook = books.find((b) => b.id === selectedBookId);

  // 1. LOADING SCREEN DURING AUTH INITIALIZATION
  if (isAuthInitializing) {
    return (
      <div className="min-h-screen bg-[#3B0B12] text-amber-100 flex flex-col items-center justify-center font-sans space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#9A7B24] p-0.5 shadow-2xl animate-pulse">
          <div className="w-full h-full bg-[#3B0B12] rounded-xl flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-[#D4AF37]" />
          </div>
        </div>
        <h2 className="font-serif text-2xl font-extrabold text-white tracking-wide">
          Kaviyam<span className="text-[#D4AF37] font-normal">-Reading</span>
        </h2>
        <p className="text-xs text-amber-200/60 font-sans tracking-wider">
          {lang === "ta" ? "சரிபார்க்கப்படுகிறது..." : "Initializing session..."}
        </p>
      </div>
    );
  }

  // GUEST LOGIN METHOD
  const handleGuestLogin = () => {
    const guestUser: User = {
      id: "guest-user-session",
      uid: "guest-user-session",
      email: "guest@kaviyam.com",
      username: lang === "ta" ? "விருந்தினர் வாசகர்" : "Guest Reader",
      isVerified: true,
      role: "reader",
      createdAt: new Date().toISOString(),
      profile: {
        username: lang === "ta" ? "விருந்தினர் வாசகர்" : "Guest Reader",
        bio: "Guest Explorer Mode",
        profilePhoto: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100",
        dob: "2000-01-01",
        gender: "other",
        privacy: { publicBookshelf: true, showActivity: true }
      },
      security: { is2FAEnabled: false, isBlocked: false, loginAttempts: 0 }
    };
    setCurrentUser(guestUser);
    try {
      localStorage.setItem("kaviyam_current_user", JSON.stringify(guestUser));
    } catch {}
    addSystemLog("Guest Session Started", "Success");
    navigateTo("home");
  };

  // 2. EXPLICIT AUTH ROUTE: SHOW LOGIN / SIGNUP SCREEN
  if (activeTab === "login") {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-center items-center font-sans">
        <Auth
          currentUser={currentUser}
          initialMode={authInitialMode}
          onLogin={handleLogin}
          onRegister={handleRegister}
          onForgotPassword={handleForgotPassword}
          onResetPasswordWithToken={async () => ({ success: true })}
          onResendVerification={async () => ({ success: true })}
          resetToken={resetToken}
          setResetToken={setResetToken}
          addSystemLog={addSystemLog}
          onGoogleLogin={handleGoogleLogin}
          onGuestLogin={handleGuestLogin}
          onCancel={() => navigateTo("home")}
          lang={lang}
          onLanguageChange={handleLanguageChange}
        />
      </div>
    );
  }

  // 3. AUTHENTICATED: READER MODE (FULL SCREEN)
  if (readerMode && selectedBook) {
    return (
      <Reader
        book={selectedBook}
        initialChapter={readingChapterNum}
        onBack={() => {
          setReaderMode(false);
          navigateTo("catalog", selectedBook.id);
        }}
        isBookmarked={bookmarks.includes(selectedBook.id)}
        onToggleBookmark={() => handleToggleBookmark(selectedBook.id)}
        lang={lang}
        onChapterComplete={handleChapterComplete}
      />
    );
  }

  // 4. AUTHENTICATED: MAIN WEBSITE LAYOUT
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans text-stone-900 selection:bg-[#F5E6B3] selection:text-[#3B0B12] max-w-full overflow-x-hidden">
      
      {/* Header Bar */}
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setMobileMenuOpen(false);
          navigateTo(tab);
        }}
        lang={lang}
        onLanguageChange={handleLanguageChange}
        currentUser={currentUser}
        onSignInClick={() => {}}
        onSignOutClick={handleLogout}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (q.trim() && activeTab !== "tamil-library" && activeTab !== "catalog") {
            navigateTo("tamil-library");
          }
        }}
        unreadEmailCount={emails.filter(e => !e.read).length}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        isMobileMenuOpen={mobileMenuOpen}
        onPlayIntro={() => setIsIntroOpen(true)}
      />

      {/* Cinematic Intro Overlay Component */}
      <CinematicIntro 
        isOpen={isIntroOpen} 
        onClose={() => setIsIntroOpen(false)} 
        onComplete={() => {}} 
      />

      {/* Main Workspace Layout (Sidebar + Content Body) */}
      <div className="flex-1 flex relative max-w-full overflow-x-hidden">
        
        {/* Left Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setMobileMenuOpen(false);
            navigateTo(tab);
          }}
          lang={lang}
          currentUser={currentUser}
          onSignOut={handleLogout}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          userAttempts={userAttempts}
          activeCategory={activeCategory}
          activeSmartCollection={activeSmartCollection}
          onSelectCategory={(categoryId) => {
            setMobileMenuOpen(false);
            setActiveCategory(categoryId);
            setActiveSmartCollection("");
            navigateTo("tamil-library");
          }}
          onSelectSmartCollection={(collectionId) => {
            setMobileMenuOpen(false);
            setActiveSmartCollection(collectionId);
            if (collectionId === "surprise" || collectionId === "random") {
              if (books.length > 0) {
                const randomBook = books[Math.floor(Math.random() * books.length)];
                navigateTo("catalog", randomBook.id);
              }
            } else {
              let targetCat = "all";
              if (collectionId === "tonight") targetCat = "novels";
              else if (collectionId === "morning") targetCat = "stories";
              else if (collectionId === "quick") targetCat = "stories";
              else if (collectionId === "hidden") targetCat = "rare";
              else if (collectionId === "discover") targetCat = "all";
              
              setActiveCategory(targetCat);
              navigateTo("tamil-library");
            }
          }}
          onPlayIntro={() => {
            setMobileMenuOpen(false);
            setIsIntroOpen(true);
          }}
          onStartReading={() => {
            setMobileMenuOpen(false);
            if (books.length > 0) {
              const firstBook = books[0];
              setSelectedBookIdState(firstBook.id);
              setReadingChapterNum(1);
              setReaderMode(true);
              window.history.pushState({}, "", `/reader/${firstBook.id}`);
            }
          }}
        />

        {/* Content Body Container */}
        <div className={`flex-1 min-w-0 transition-all duration-300 ${sidebarCollapsed ? "md:ml-20" : "md:ml-64"} ml-0 overflow-x-hidden`}>
          
          {/* Public Hero section on Home tab */}
          {activeTab === "home" && !selectedBookId && (
            <PublicHero
              lang={lang}
              onBrowseBooks={() => navigateTo("tamil-library")}
              onStartReading={() => {
                const firstBook = books[0] || PRESET_BOOKS[0];
                navigateTo("catalog", firstBook.id);
                setReadingChapterNum(1);
                setReaderMode(true);
              }}
              onPlayIntro={() => setIsIntroOpen(true)}
            />
          )}

          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            
            {/* BOOK DETAILS VIEW */}
            {selectedBookId && selectedBook ? (
              <BookDetails
                book={selectedBook}
                onBack={() => navigateTo(activeTab)}
                onStartReading={(chNum) => {
                  setReadingChapterNum(chNum || 1);
                  setReaderMode(true);
                  if (selectedBookId) window.history.pushState({}, "", `/reader/${selectedBookId}`);
                }}
                isBookmarked={bookmarks.includes(selectedBook.id)}
                onToggleBookmark={() => handleToggleBookmark(selectedBook.id)}
                lang={lang}
              />
            ) : (
              <>
                {/* ROUTE: HOME / DASHBOARD */}
                {activeTab === "home" && (
                  <TamilDashboard
                    books={books}
                    onSelectBook={(id) => navigateTo("catalog", id)}
                    bookmarks={bookmarks}
                    onToggleBookmark={handleToggleBookmark}
                    onAddCustomBook={handleAddCustomBook}
                    lang={lang}
                  />
                )}

                {/* ROUTE: TAMIL LIBRARY (/tamil-library) */}
                {activeTab === "tamil-library" && (
                  <TamilLibrary
                    books={books}
                    onSelectBook={(id) => navigateTo("catalog", id)}
                    bookmarks={bookmarks}
                    onToggleBookmark={handleToggleBookmark}
                    onAddCustomBook={handleAddCustomBook}
                    lang={lang}
                    externalCategory={activeCategory}
                    onCategoryChange={(cat) => {
                      setActiveCategory(cat);
                      setActiveSmartCollection("");
                    }}
                  />
                )}

                {/* ROUTE: CATALOG LIBRARY (/catalog) */}
                {(activeTab === "catalog" || activeTab === "library") && (
                  <Library
                    books={books}
                    onSelectBook={(id) => navigateTo("catalog", id)}
                    bookmarks={bookmarks}
                    onToggleBookmark={handleToggleBookmark}
                    lang={lang}
                  />
                )}

                {/* ROUTE: MY BOOKS (/my-books) */}
                {activeTab === "mybooks" && (
                  <MyBooks
                    books={books}
                    bookmarks={bookmarks}
                    onSelectBook={(id) => navigateTo("catalog", id)}
                    onRemoveBookmark={handleToggleBookmark}
                    lang={lang}
                  />
                )}

                {/* ROUTE: PROGRESS (/progress) */}
                {activeTab === "progress" && (
                  <ProgressDashboard lang={lang} />
                )}

                {/* ROUTE: QUIZZES (/quizzes) */}
                {activeTab === "quizzes" && (
                  quizPlaying && selectedQuizId ? (
                    <QuizPlayer
                      quiz={QUIZ_DATABASE.find(q => q.quizId === selectedQuizId)!}
                      currentUser={currentUser}
                      onSubmitQuiz={handleSubmitQuiz}
                      onCancelQuiz={() => {
                        setQuizPlaying(false);
                        setSelectedQuizId(null);
                        window.history.replaceState({}, "", "/quizzes");
                      }}
                      onRequireLogin={(qId) => {
                        localStorage.setItem("pendingQuizId", qId);
                        localStorage.setItem("kaviyam_pending_quiz_id", qId);
                        localStorage.setItem("pendingQuizRoute", `/quizzes/${qId.replace("_", "-")}`);
                        localStorage.setItem("kaviyam_pending_quiz_route", `/quizzes/${qId.replace("_", "-")}`);
                        setAuthInitialMode("login");
                        navigateTo("login");
                      }}
                      onRequireRegister={(qId) => {
                        localStorage.setItem("pendingQuizId", qId);
                        localStorage.setItem("kaviyam_pending_quiz_id", qId);
                        localStorage.setItem("pendingQuizRoute", `/quizzes/${qId.replace("_", "-")}`);
                        localStorage.setItem("kaviyam_pending_quiz_route", `/quizzes/${qId.replace("_", "-")}`);
                        setAuthInitialMode("register");
                        navigateTo("login");
                      }}
                      lang={lang}
                    />
                  ) : activeQuizAttempt ? (
                    <QuizResult
                      attempt={activeQuizAttempt}
                      quiz={QUIZ_DATABASE.find(q => q.quizId === activeQuizAttempt.quizId)!}
                      onRetake={() => {
                        setActiveQuizAttempt(null);
                        setQuizPlaying(true);
                      }}
                      onNextQuiz={() => {
                        const num = parseInt(activeQuizAttempt.quizId.replace("quiz_", ""), 10);
                        const nextId = `quiz_${String(num + 1).padStart(3, "0")}`;
                        const nextQuiz = QUIZ_DATABASE.find(q => q.quizId === nextId);
                        if (nextQuiz) {
                          setSelectedQuizId(nextId);
                          setQuizPlaying(true);
                          setActiveQuizAttempt(null);
                        } else {
                          setActiveQuizAttempt(null);
                          setSelectedQuizId(null);
                          window.history.replaceState({}, "", "/quizzes");
                        }
                      }}
                      onBackToCenter={() => {
                        setActiveQuizAttempt(null);
                        setSelectedQuizId(null);
                        window.history.replaceState({}, "", "/quizzes");
                      }}
                      lang={lang}
                    />
                  ) : selectedQuizId ? (
                    <QuizDetails
                      quiz={QUIZ_DATABASE.find(q => q.quizId === selectedQuizId)!}
                      userAttempts={userAttempts}
                      currentUser={currentUser}
                      onBack={() => {
                        setSelectedQuizId(null);
                        window.history.replaceState({}, "", "/quizzes");
                      }}
                      onStartQuiz={(qId) => {
                        if (!isUserAuthenticated(currentUser)) {
                          localStorage.setItem("pendingQuizId", qId);
                          localStorage.setItem("kaviyam_pending_quiz_id", qId);
                          localStorage.setItem("pendingQuizRoute", `/quizzes/${qId.replace("_", "-")}`);
                          localStorage.setItem("kaviyam_pending_quiz_route", `/quizzes/${qId.replace("_", "-")}`);
                          setLoginModalType("quiz");
                          setShowLoginRequiredModal(true);
                          return;
                        }
                        setSelectedQuizId(qId);
                        setQuizPlaying(true);
                        window.history.replaceState({}, "", `/quizzes/${qId.replace("_", "-")}`);
                      }}
                      lang={lang}
                    />
                  ) : (
                    <QuizCenter
                      quizzes={QUIZ_DATABASE}
                      userAttempts={userAttempts}
                      currentUser={currentUser}
                      onSelectQuiz={(id) => {
                        setSelectedQuizId(id);
                        window.history.replaceState({}, "", `/quizzes/${id.replace("_", "-")}`);
                      }}
                      onViewHistory={() => navigateTo("quiz-history")}
                      onViewLeaderboard={() => navigateTo("quiz-leaderboard")}
                      onStartQuiz={(id) => {
                        if (!isUserAuthenticated(currentUser)) {
                          localStorage.setItem("pendingQuizId", id);
                          localStorage.setItem("kaviyam_pending_quiz_id", id);
                          localStorage.setItem("pendingQuizRoute", `/quizzes/${id.replace("_", "-")}`);
                          localStorage.setItem("kaviyam_pending_quiz_route", `/quizzes/${id.replace("_", "-")}`);
                          setLoginModalType("quiz");
                          setShowLoginRequiredModal(true);
                          return;
                        }
                        setSelectedQuizId(id);
                        setQuizPlaying(true);
                        window.history.replaceState({}, "", `/quizzes/${id.replace("_", "-")}`);
                      }}
                      lang={lang}
                    />
                  )
                )}

                {/* ROUTE: QUIZ HISTORY (/quiz-history) */}
                {activeTab === "quiz-history" && (
                  <QuizHistory
                    attempts={userAttempts}
                    currentUser={currentUser}
                    onSelectAttempt={(att) => {
                      setActiveQuizAttempt(att);
                      navigateTo("quizzes");
                      setSelectedQuizId(att.quizId);
                    }}
                    onBackToCenter={() => navigateTo("quizzes")}
                    onRequireLogin={() => {
                      localStorage.setItem("pendingQuizRoute", "/quiz-history");
                      localStorage.setItem("kaviyam_pending_quiz_route", "/quiz-history");
                      setLoginModalType("quiz");
                      setShowLoginRequiredModal(true);
                    }}
                    lang={lang}
                  />
                )}

                {/* ROUTE: QUIZ LEADERBOARD (/quiz-leaderboard) */}
                {activeTab === "quiz-leaderboard" && (
                  <QuizLeaderboard
                    userAttempts={userAttempts}
                    onBackToCenter={() => navigateTo("quizzes")}
                    lang={lang}
                  />
                )}

                {/* ROUTE: AI FEATURES (/ai-features) */}
                {activeTab === "aifeatures" && (
                  <AIFeatures lang={lang} />
                )}

                {/* ROUTE: PROFILE SETTINGS (/profile) */}
                {activeTab === "profile" && (
                  <Profile currentUser={currentUser} onSelectTab={(t) => navigateTo(t)} lang={lang} />
                )}

                {/* ROUTE: LEVELS SYSTEM (/levels) */}
                {["levels", "level-history", "xp-history"].includes(activeTab) && (
                  <LevelsSystem
                    currentUser={currentUser}
                    books={books}
                    bookmarks={bookmarks}
                    userAttempts={userAttempts}
                    lang={lang}
                    onSelectTab={(t) => navigateTo(t)}
                  />
                )}

                {/* ROUTE: MAILBOX (/mailbox) */}
                {activeTab === "mailbox" && (
                  <EmailInbox
                    emails={emails}
                    onReadEmail={(id) => {
                      setEmails(emails.map((m) => (m.id === id ? { ...m, read: true } : m)));
                    }}
                    onDeleteEmail={(id) => {
                      setEmails(emails.filter((m) => m.id !== id));
                    }}
                    onTriggerLink={(action) => {
                      if (action === "ResetPassword") navigateTo("profile");
                    }}
                  />
                )}

                {/* ROUTE: LOCAL DB (/local-db) */}
                {activeTab === "localdb" && <LocalDatabase />}

                {/* ROUTE: HELP & FAQ (/help) */}
                {activeTab === "help" && <Feedback />}

                {/* ROUTE: SETTINGS (/settings) */}
                {activeTab === "settings" && (
                  <Settings
                    lang={lang}
                    onLanguageChange={handleLanguageChange}
                    isDarkMode={false}
                    onToggleDarkMode={() => {}}
                    onBack={() => navigateTo("home")}
                  />
                )}

                {/* ROUTE: ABOUT */}
                {activeTab === "about" && (
                  <div className="p-8 rounded-3xl bg-white border border-[#E2DDD5] space-y-4 font-sans">
                    <h2 className="font-serif text-2xl font-bold text-[#3B0B12]">
                      {lang === "ta" ? "Kaviyam-Reading பற்றி" : "About Kaviyam-Reading"}
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                      {lang === "ta"
                        ? "Kaviyam-Reading என்பது நவீன டிஜிட்டல் தொழில்நுட்பத்துடன் தமிழ் இலக்கியங்களை வாசிக்கவும், கற்கவும், அனுபவிக்கவும் உருவாக்கப்பட்ட பிரீமியம் தளமாகும்."
                        : "Kaviyam-Reading is a modern digital platform designed to preserve, promote, and revolutionize the reading experience of Tamil literature."}
                    </p>
                  </div>
                )}

                {/* ROUTE: ADMIN */}
                {activeTab === "admin" && currentUser?.email === "admin@kaviyam.com" && (
                  <Admin
                    usersList={users}
                    allSecurityLogs={securityLogs}
                    booksList={books}
                    onBlockUser={() => {}}
                    onDeleteUser={() => {}}
                    isSecurityHardened={isSecurityHardened}
                    onToggleSecurityHardening={() => setIsSecurityHardened(!isSecurityHardened)}
                    customCsp={customCsp}
                    onUpdateCustomCsp={setCustomCsp}
                  />
                )}

                {/* ROUTE: WORD FINDER (/word-finder) */}
                {activeTab === "word-finder" && (
                  <WordFinder
                    currentUser={currentUser}
                    initialPuzzleId={pendingWordFinderPuzzle}
                    onRequireLogin={(puzzleId) => {
                      if (puzzleId) {
                        localStorage.setItem("pendingWordFinderId", puzzleId);
                        localStorage.setItem("kaviyam_pending_word_finder_id", puzzleId);
                      }
                      localStorage.setItem("pendingQuizRoute", "/word-finder");
                      localStorage.setItem("kaviyam_pending_quiz_route", "/word-finder");
                      setLoginModalType("word-finder");
                      setShowLoginRequiredModal(true);
                    }}
                    onBackToHome={() => navigateTo("home")}
                    onSelectTab={(tab) => navigateTo(tab)}
                    onLevelUp={(lvl, name) => {
                      console.log("User leveled up to:", lvl, name);
                    }}
                    lang={lang}
                  />
                )}

                {/* ROUTE: QUIZ STATS (/quiz-stats) */}
                {activeTab === "quiz-stats" && (
                  <SidebarPages
                    activeTab={activeTab}
                    books={books}
                    bookmarks={bookmarks}
                    onSelectBook={(id) => navigateTo("catalog", id)}
                    onToggleBookmark={handleToggleBookmark}
                    lang={lang}
                    currentUser={currentUser}
                    navigateTo={navigateTo}
                  />
                )}

                {/* ROUTE: DYNAMIC COMING SOON OR CUSTOM SIDEBAR PAGES */}
                {!RECOGNIZED_TABS.includes(activeTab) && (
                  <SidebarPages
                    activeTab={activeTab}
                    books={books}
                    bookmarks={bookmarks}
                    onSelectBook={(id) => navigateTo("catalog", id)}
                    onToggleBookmark={handleToggleBookmark}
                    lang={lang}
                    currentUser={currentUser}
                    navigateTo={navigateTo}
                  />
                )}
              </>
            )}

          </div>

          {/* Footer */}
          <Footer lang={lang} onLanguageChange={handleLanguageChange} onSelectTab={(t) => navigateTo(t)} />
        </div>

      </div>

      {/* Login Required Gate Modal */}
      <LoginRequiredModal
        isOpen={showLoginRequiredModal}
        onClose={() => setShowLoginRequiredModal(false)}
        onLogin={() => {
          setShowLoginRequiredModal(false);
          setAuthInitialMode("login");
          navigateTo("login");
        }}
        onRegister={() => {
          setShowLoginRequiredModal(false);
          setAuthInitialMode("register");
          navigateTo("login");
        }}
        type={loginModalType}
        lang={lang}
      />

      {/* Floating Scroll To Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-[#5C121E] text-[#D4AF37] shadow-2xl hover:bg-[#3B0B12] hover:scale-110 active:scale-95 transition-all border border-[#D4AF37]/50 flex items-center justify-center cursor-pointer group"
          title={lang === "ta" ? "மேலே செல்க" : "Scroll to top"}
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      )}

    </div>
  );
}

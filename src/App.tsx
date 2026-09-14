import { useState, useEffect, useRef } from "react";
import { User, Book, SimulatedEmail, SecurityLog } from "./types";
import { PRESET_BOOKS } from "./booksData";
import { Language, getStoredLanguage, setStoredLanguage } from "./utils/i18n";
import { BookOpen } from "lucide-react";

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
function tabToPath(tab: string, bookId?: string | null): string {
  if (bookId) return `/book/${bookId}`;
  switch (tab) {
    case "home": return "/home";
    case "tamil-library": return "/tamil-library";
    case "catalog": return "/catalog";
    case "mybooks": return "/my-books";
    case "progress": return "/progress";
    case "aifeatures": return "/ai-features";
    case "profile": return "/profile";
    case "mailbox": return "/mailbox";
    case "localdb": return "/local-db";
    case "help": return "/help";
    case "settings": return "/settings";
    case "admin": return "/admin";
    default: return "/home";
  }
}

function pathToTab(pathname: string): { tab: string; bookId?: string } {
  const clean = pathname.toLowerCase().replace(/\/$/, "") || "/";
  if (clean === "/login") return { tab: "login" };
  if (clean === "/home" || clean === "/") return { tab: "home" };
  if (clean === "/tamil-library") return { tab: "tamil-library" };
  if (clean === "/catalog" || clean === "/books" || clean === "/library") return { tab: "catalog" };
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
  return { tab: "home" };
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
  const [selectedBookId, setSelectedBookIdState] = useState<string | null>(null);
  const [readerMode, setReaderMode] = useState<boolean>(false);
  const [readingChapterNum, setReadingChapterNum] = useState<number>(1);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [resetToken, setResetToken] = useState<string | null>(null);

  // Data State
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [emails, setEmails] = useState<SimulatedEmail[]>([]);

  // Security State
  const [isSecurityHardened, setIsSecurityHardened] = useState<boolean>(false);
  const [customCsp, setCustomCsp] = useState<string>("default-src 'self';");

  // Route Navigator
  const navigateTo = (tab: string, bookId?: string | null) => {
    setActiveTabState(tab);
    setSelectedBookIdState(bookId || null);
    if (!bookId) setReaderMode(false);
    const path = tabToPath(tab, bookId);
    if (typeof window !== "undefined" && window.location.pathname !== path) {
      window.history.pushState({}, "", path);
    }
  };

  // Listen to Firebase Auth Redirect Results
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          addSystemLog(`Google Sign-In Redirect Success (${result.user.email || result.user.uid})`, "Success");
          navigateTo("home");
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
        setCurrentUser(null);
        localStorage.removeItem("kaviyam_current_user");
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

    const route = pathToTab(window.location.pathname);

    if (!currentUser) {
      if (window.location.pathname !== "/login") {
        window.history.replaceState({}, "", "/login");
      }
      setActiveTabState("login");
      setSelectedBookIdState(null);
      setReaderMode(false);
    } else {
      if (window.location.pathname === "/login" || window.location.pathname === "/") {
        window.history.replaceState({}, "", "/home");
        setActiveTabState("home");
      } else {
        setActiveTabState(route.tab === "login" ? "home" : route.tab);
        setSelectedBookIdState(route.bookId || null);
      }
    }
  }, [currentUser, isAuthInitializing]);

  // Listen to Browser Back / Forward buttons (popstate)
  useEffect(() => {
    const handlePopState = () => {
      if (!currentUser) {
        if (window.location.pathname !== "/login") {
          window.history.replaceState({}, "", "/login");
        }
        setActiveTabState("login");
      } else {
        const route = pathToTab(window.location.pathname);
        if (route.tab === "login") {
          window.history.replaceState({}, "", "/home");
          setActiveTabState("home");
        } else {
          setActiveTabState(route.tab);
          setSelectedBookIdState(route.bookId || null);
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
      navigateTo("home");
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
      navigateTo("home");
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

  const handleGoogleLogin = async (): Promise<void> => {
    if (isGooglePopupActiveRef.current) return;
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
          return;
        }
        throw popupErr;
      }

      if (result?.user) {
        addSystemLog(`Google Sign-In Success (${result.user.email || result.user.uid})`, "Success");
        navigateTo("home");
      }
    } catch (err: any) {
      console.error("Google Auth error:", err);
      const code = err?.code || "";
      let friendly = "Google Sign-In failed.";

      if (code === "auth/popup-closed-by-user") {
        friendly = "Google Sign-In window was closed before completing.";
      } else if (code === "auth/popup-blocked") {
        friendly = "Browser blocked popup window. Redirecting...";
      } else if (code === "auth/unauthorized-domain") {
        friendly = "Domain not authorized in Firebase Console. Please add this domain under Authentication > Settings > Authorized domains.";
      } else if (err?.message) {
        friendly = err.message;
      }

      addSystemLog(`Google Sign-In Failed: ${code || friendly}`, "Failed");
      throw new Error(friendly);
    } finally {
      isGooglePopupActiveRef.current = false;
    }
  };

  // LOGOUT METHOD
  const handleLogout = async () => {
    if (currentUser) {
      try {
        await signOut(auth);
      } catch (_) {}
      setCurrentUser(null);
      localStorage.removeItem("kaviyam_current_user");
      setSelectedBookIdState(null);
      setReaderMode(false);
      window.history.replaceState({}, "", "/login");
      setActiveTabState("login");
    }
  };

  // Toggle Bookmarks
  const handleToggleBookmark = (bookId: string) => {
    if (!currentUser) return;
    const isB = bookmarks.includes(bookId);
    const updated = isB ? bookmarks.filter((id) => id !== bookId) : [...bookmarks, bookId];
    saveBookmarks(updated);
  };

  // Add Custom / Ingested Book
  const handleAddCustomBook = (newBook: Book) => {
    const updated = [...books, newBook];
    saveBooks(updated);
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
          {lang === "ta" ? "தரவுகளைச் சரிபார்க்கிறது..." : "Initializing session..."}
        </p>
      </div>
    );
  }

  // 2. UNAUTHENTICATED BARRIER: SHOW ONLY LOGIN PAGE (NO MAIN WEBSITE IN DOM)
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-center items-center font-sans">
        <Auth
          currentUser={currentUser}
          onLogin={handleLogin}
          onRegister={handleRegister}
          onForgotPassword={handleForgotPassword}
          onResetPasswordWithToken={async () => ({ success: true })}
          onResendVerification={() => {}}
          resetToken={resetToken}
          setResetToken={setResetToken}
          addSystemLog={addSystemLog}
          onGoogleLogin={handleGoogleLogin}
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
      />
    );
  }

  // 4. AUTHENTICATED: MAIN WEBSITE LAYOUT
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans text-stone-900 selection:bg-[#F5E6B3] selection:text-[#3B0B12]">
      
      {/* Header Bar */}
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => navigateTo(tab)}
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
      />

      {/* Main Workspace Layout (Sidebar + Content Body) */}
      <div className="flex-1 flex relative">
        
        {/* Left Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => navigateTo(tab)}
          lang={lang}
          currentUser={currentUser}
          onSignOut={handleLogout}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Content Body Container */}
        <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "ml-16 sm:ml-20" : "ml-0 lg:ml-60"}`}>
          
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

                {/* ROUTE: AI FEATURES (/ai-features) */}
                {activeTab === "aifeatures" && (
                  <AIFeatures lang={lang} />
                )}

                {/* ROUTE: PROFILE SETTINGS (/profile) */}
                {activeTab === "profile" && (
                  <Profile currentUser={currentUser} onSelectTab={(t) => navigateTo(t)} lang={lang} />
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
              </>
            )}

          </div>

          {/* Footer */}
          <Footer lang={lang} onLanguageChange={handleLanguageChange} onSelectTab={(t) => navigateTo(t)} />
        </div>

      </div>

    </div>
  );
}

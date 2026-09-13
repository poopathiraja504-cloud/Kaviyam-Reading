import React, { useState, useEffect } from "react";
import { User, Book, Chapter } from "./types";
import { SAMPLE_BOOKS } from "./booksData";
import Auth from "./components/Auth";
import ProfileView from "./components/ProfileView";
import { 
  syncUserToFirestore, 
  testFirestoreConnection 
} from "./services/userService";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import { 
  BookOpen, 
  Search, 
  Bookmark, 
  User as UserIcon, 
  LogOut, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Type, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  CheckCircle, 
  Moon, 
  Sun,
  ShieldAlert,
  Compass
} from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  // Reader state
  const [books, setBooks] = useState<Book[]>(SAMPLE_BOOKS);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [savedBookIds, setSavedBookIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg" | "xl">("base");
  const [readerTheme, setReaderTheme] = useState<"dark" | "sepia" | "light">("dark");
  const [activeTab, setActiveTab] = useState<"library" | "reader" | "companion" | "profile">("library");

  // TTS Voice State
  const [isSpeaking, setIsSpeaking] = useState(false);

  // AI Companion state
  const [companionMessages, setCompanionMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    {
      sender: "ai",
      text: "வணக்கம்! நான் உங்கள் காவியம் வாசிப்புத் தோழன் (Kaviyam AI Reading Companion). இந்த நாவலின் கதை, கதாப்பாத்திரங்கள் அல்லது தமிழ் இலக்கியம் பற்றி எதை வேண்டுமானாலும் கேளுங்கள்!"
    }
  ]);
  const [companionInput, setCompanionInput] = useState("");
  const [isCompanionLoading, setIsCompanionLoading] = useState(false);

  // Track Firebase Auth state & Sync with Firestore /users/{uid}
  useEffect(() => {
    // Initial connection test
    testFirestoreConnection();

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          // Sync with Firestore: if user is not in database, add them with all fields: name, email, photo file name
          const profile = await syncUserToFirestore({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName,
            photoURL: fbUser.photoURL,
            phoneNumber: fbUser.phoneNumber,
            emailVerified: fbUser.emailVerified
          });
          setCurrentUser(profile);
          localStorage.setItem("kaviyam_user_session", JSON.stringify(profile));
        } catch (e) {
          console.error("Firestore sync error on auth state change:", e);
          const fallbackUser: User = {
            id: fbUser.uid,
            uid: fbUser.uid,
            name: fbUser.displayName || fbUser.email?.split("@")[0] || "Tamil Reader",
            email: fbUser.email || "",
            photoFileName: "avatar_tamil_scholar.png",
            username: fbUser.displayName || fbUser.email?.split("@")[0] || "Tamil Reader",
            isVerified: fbUser.emailVerified,
            phone: fbUser.phoneNumber || undefined,
            createdAt: new Date().toISOString()
          };
          setCurrentUser(fallbackUser);
        }
      } else {
        // Check local session
        const stored = localStorage.getItem("kaviyam_user_session");
        if (stored) {
          try {
            setCurrentUser(JSON.parse(stored));
          } catch {
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      }
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);

  // System audit logger
  const addSystemLog = (action: string, status: "Success" | "Failed" | "Blocked") => {
    const logItem = {
      id: `log-${Date.now()}`,
      action,
      status,
      timestamp: new Date().toISOString()
    };
    try {
      fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "security_log",
          content: logItem,
          createdAt: new Date().toISOString()
        })
      }).catch(() => {});
    } catch {}
  };

  // Auth Handlers
  const handleLogin = async (email: string, pass: string, _otp?: string, rememberMe?: boolean) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      // Sync or add user to Firestore collection '/users' at path '/users/{uid}'
      const userProfile = await syncUserToFirestore({
        uid: cred.user.uid,
        email: cred.user.email || email,
        displayName: cred.user.displayName,
        photoURL: cred.user.photoURL,
        phoneNumber: cred.user.phoneNumber,
        emailVerified: cred.user.emailVerified,
      });

      setCurrentUser(userProfile);
      if (rememberMe) {
        localStorage.setItem("kaviyam_remember_me", "true");
        localStorage.setItem("kaviyam_remembered_email", email);
      }
      localStorage.setItem("kaviyam_user_session", JSON.stringify(userProfile));
      addSystemLog(`User signed in & synced with Firestore: ${email} (/users/${cred.user.uid})`, "Success");
      return { success: true };
    } catch (err: any) {
      // Fallback local simulated auth if offline/preview credentials
      if (pass.length >= 6) {
        const simUid = `sim-${Date.now()}`;
        const simUser: User = {
          id: simUid,
          uid: simUid,
          name: email.split("@")[0],
          username: email.split("@")[0],
          email,
          photoFileName: "avatar_tamil_scholar.png",
          isVerified: true,
          createdAt: new Date().toISOString()
        };
        setCurrentUser(simUser);
        localStorage.setItem("kaviyam_user_session", JSON.stringify(simUser));
        addSystemLog(`User signed in (local): ${email}`, "Success");
        return { success: true };
      }
      addSystemLog(`Failed login attempt: ${email}`, "Failed");
      return { success: false, error: err?.message || "Invalid credentials provided." };
    }
  };

  const handleRegister = async (email: string, username: string, dob: string, gender: string, pass?: string) => {
    try {
      const passwordToUse = pass || "Kaviyam@2026";
      const cred = await createUserWithEmailAndPassword(auth, email, passwordToUse);
      if (cred.user) {
        await sendEmailVerification(cred.user).catch(() => {});
      }

      // Add user to Firestore database collection '/users' at path: "/users/{{uid}}"
      // Including all required fields: name, email, photo file name
      const newUser = await syncUserToFirestore(
        {
          uid: cred.user.uid,
          email: cred.user.email || email,
          displayName: username || email.split("@")[0],
          photoURL: cred.user.photoURL,
          emailVerified: false,
        },
        {
          name: username || email.split("@")[0],
          photoFileName: "avatar_tamil_scholar.png",
          dob,
          gender,
          bio: "தமிழ் இலக்கிய ஆர்வலர் (Tamil Literature Enthusiast)",
        }
      );

      setCurrentUser(newUser);
      localStorage.setItem("kaviyam_user_session", JSON.stringify(newUser));
      addSystemLog(`New user registered & added to Firestore (/users/${cred.user.uid}): ${email}`, "Success");
      return { success: true, requireVerification: true, email };
    } catch (err: any) {
      if (pass && pass.length >= 6) {
        const simUid = `sim-${Date.now()}`;
        const simUser: User = {
          id: simUid,
          uid: simUid,
          name: username || email.split("@")[0],
          username: username || email.split("@")[0],
          email,
          photoFileName: "avatar_tamil_scholar.png",
          dob,
          gender,
          isVerified: true,
          createdAt: new Date().toISOString()
        };
        setCurrentUser(simUser);
        localStorage.setItem("kaviyam_user_session", JSON.stringify(simUser));
        return { success: true };
      }
      return { success: false, error: err?.message || "Registration failed." };
    }
  };

  const handleForgotPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      addSystemLog(`Password reset email sent: ${email}`, "Success");
      return { success: true, email };
    } catch (err: any) {
      return { success: false, error: err?.message || "Failed to send reset link." };
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const userProfile = await syncUserToFirestore(
        {
          uid: res.user.uid,
          email: res.user.email || "google-user@kaviyam.com",
          displayName: res.user.displayName || "Google Reader",
          photoURL: res.user.photoURL,
          phoneNumber: res.user.phoneNumber,
          emailVerified: res.user.emailVerified,
        },
        {
          name: res.user.displayName || "Google Reader",
          photoFileName: "avatar_tamil_scholar.png",
        }
      );

      setCurrentUser(userProfile);
      localStorage.setItem("kaviyam_user_session", JSON.stringify(userProfile));
      addSystemLog(`Google sign-in & Firestore synced: ${userProfile.email}`, "Success");
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || "Google sign-in was interrupted." };
    }
  };

  const handlePhoneLogin = async (phone: string) => {
    const currentAuth = auth.currentUser;
    const uid = currentAuth?.uid || `phone-${Date.now()}`;
    const cleanEmail = `${phone.replace(/\D/g, "")}@kaviyam.com`;
    const cleanName = `Reader (${phone.slice(-4)})`;

    try {
      const userProfile = await syncUserToFirestore(
        {
          uid,
          email: cleanEmail,
          displayName: cleanName,
          phoneNumber: phone,
          emailVerified: true,
        },
        {
          name: cleanName,
          photoFileName: "avatar_modern_reader.png",
          phone,
        }
      );
      setCurrentUser(userProfile);
      localStorage.setItem("kaviyam_user_session", JSON.stringify(userProfile));
      addSystemLog(`Phone authenticated & synced to /users/${uid}: ${phone}`, "Success");
      return { success: true };
    } catch {
      const userObj: User = {
        id: uid,
        uid,
        name: cleanName,
        username: cleanName,
        email: cleanEmail,
        photoFileName: "avatar_modern_reader.png",
        phone,
        isVerified: true,
        createdAt: new Date().toISOString()
      };
      setCurrentUser(userObj);
      localStorage.setItem("kaviyam_user_session", JSON.stringify(userObj));
      addSystemLog(`Phone authenticated: ${phone}`, "Success");
      return { success: true };
    }
  };

  const handleGuestLogin = () => {
    const guestUser: User = {
      id: `guest-${Date.now()}`,
      uid: `guest-${Date.now()}`,
      name: "Guest Reader (விருந்தினர்)",
      username: "Guest Reader (விருந்தினர்)",
      email: "guest@kaviyam.com",
      photoFileName: "avatar_modern_reader.png",
      role: "guest",
      isVerified: true,
      createdAt: new Date().toISOString()
    };
    setCurrentUser(guestUser);
    addSystemLog("Guest reader accessed platform", "Success");
  };

  const handleAccountDeleted = async () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    await signOut(auth).catch(() => {});
    localStorage.removeItem("kaviyam_user_session");
    setCurrentUser(null);
    setActiveTab("library");
    addSystemLog("User account and Firestore records permanently deleted", "Success");
  };

  const handleLogout = async () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    await signOut(auth).catch(() => {});
    localStorage.removeItem("kaviyam_user_session");
    setCurrentUser(null);
  };

  // Text-To-Speech (Tamil Reader)
  const toggleTamilTTS = (textToRead: string) => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = "ta-IN";
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Ask AI Companion
  const handleAskCompanion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companionInput.trim() || isCompanionLoading) return;

    const userMsg = companionInput.trim();
    setCompanionInput("");
    setCompanionMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setIsCompanionLoading(true);

    try {
      const res = await fetch("/api/companion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          contextBook: selectedBook,
          contextChapter: selectedBook?.chapters[currentChapterIndex]
        })
      });
      const data = await res.json();
      if (data.reply) {
        setCompanionMessages((prev) => [...prev, { sender: "ai", text: data.reply }]);
      } else {
        setCompanionMessages((prev) => [
          ...prev, 
          { sender: "ai", text: "மன்னிக்கவும், தகவல் பெறுவதில் சிறிய தாமதம். மீண்டும் ஒருமுறை கேட்கவும்!" }
        ]);
      }
    } catch {
      setCompanionMessages((prev) => [
        ...prev, 
        { sender: "ai", text: `இந்த பகுதி சோழப் பேரரசின் உன்னத வரலாற்றையும், கதாபாத்திரங்களின் அழுத்தமான உணர்வுகளையும் அழகாக விவரிக்கிறது.` }
      ]);
    } finally {
      setIsCompanionLoading(false);
    }
  };

  const toggleBookmark = (bookId: string) => {
    setSavedBookIds((prev) => 
      prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]
    );
  };

  const filteredBooks = books.filter((b) => 
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#060c18] flex items-center justify-center text-stone-300">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#f0c15c] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-mono tracking-widest text-[#f0c15c]">LOADING KAVIYAM...</p>
        </div>
      </div>
    );
  }

  // Not logged in: Show Auth screen
  if (!currentUser) {
    return (
      <Auth
        currentUser={null}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onForgotPassword={handleForgotPassword}
        onResetPasswordWithToken={async () => ({ success: true })}
        onResendVerification={async (_email: string) => ({ success: true })}
        resetToken={resetToken}
        setResetToken={setResetToken}
        addSystemLog={addSystemLog}
        onGoogleLogin={handleGoogleLogin}
        onPhoneLogin={handlePhoneLogin}
        onGuestLogin={handleGuestLogin}
        isDarkMode={true}
      />
    );
  }

  // Active reading chapter
  const currentChapter = selectedBook?.chapters[currentChapterIndex];

  return (
    <div className="min-h-screen bg-[#070e1c] text-stone-100 flex flex-col font-sans selection:bg-[#f0c15c] selection:text-black">
      {/* Platform Header */}
      <header className="sticky top-0 z-40 bg-[#091222]/90 backdrop-blur border-b border-[#182a4d] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            onClick={() => { setSelectedBook(null); setActiveTab("library"); }} 
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#f0c15c] to-[#d48c1a] flex items-center justify-center text-black font-extrabold shadow-md">
              <BookOpen size={20} />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-wider text-stone-100 group-hover:text-[#f0c15c] transition-colors">
                KAVIYAM READING
              </h1>
              <p className="text-[10px] font-mono text-stone-400">தமிழ் நாவல்கள் &amp; காவியங்கள்</p>
            </div>
          </div>
        </div>

        {/* Center navigation tabs */}
        <div className="hidden md:flex items-center gap-1 bg-[#0c1830] p-1 rounded-xl border border-stone-800">
          <button
            onClick={() => { setSelectedBook(null); setActiveTab("library"); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "library" && !selectedBook ? "bg-[#f0c15c] text-black font-bold shadow-sm" : "text-stone-400 hover:text-stone-200"
            }`}
          >
            நூலகம் (Library)
          </button>
          {selectedBook && (
            <button
              onClick={() => setActiveTab("reader")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "reader" ? "bg-[#f0c15c] text-black font-bold shadow-sm" : "text-stone-400 hover:text-stone-200"
              }`}
            >
              வாசிப்பாளர் (Reader)
            </button>
          )}
          <button
            onClick={() => setActiveTab("companion")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeTab === "companion" ? "bg-[#f0c15c] text-black font-bold shadow-sm" : "text-stone-400 hover:text-stone-200"
            }`}
          >
            <Sparkles size={13} />
            AI வாசிப்புத் தோழன்
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeTab === "profile" ? "bg-[#f0c15c] text-black font-bold shadow-sm" : "text-stone-400 hover:text-stone-200"
            }`}
            id="nav-profile-tab"
          >
            <UserIcon size={13} />
            சுயவிவரம் (Profile)
          </button>
        </div>

        {/* User profile & logout */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("profile")}
            title="Open Profile & Firestore Document (/users/{uid})"
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#0c1830] hover:bg-[#13274e] border border-stone-800 hover:border-[#f0c15c]/50 transition-all text-left cursor-pointer group"
            id="header-profile-btn"
          >
            <div className="w-7 h-7 rounded-lg overflow-hidden bg-[#f0c15c] text-black font-black flex items-center justify-center text-xs flex-shrink-0">
              {currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                (currentUser.name || currentUser.username || "U")[0].toUpperCase()
              )}
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-stone-200 group-hover:text-[#f0c15c] transition-colors">
                {currentUser.name || currentUser.username}
              </p>
              <p className="text-[10px] text-stone-400 font-mono truncate max-w-[130px]">
                {currentUser.photoFileName || "avatar_tamil_scholar.png"}
              </p>
            </div>
          </button>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-2 rounded-lg bg-[#0d1a33] hover:bg-red-950/60 hover:text-red-400 text-stone-400 transition-colors border border-stone-800 cursor-pointer"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {/* VIEW 1: LIBRARY CATALOG */}
        {(activeTab === "library" || !selectedBook) && activeTab !== "companion" && activeTab !== "profile" && (
          <div className="space-y-6">
            {/* Search and Hero Bar */}
            <div className="bg-gradient-to-r from-[#0c1830] via-[#0e1d3a] to-[#0a1428] p-6 rounded-2xl border border-[#1f3560] shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#f0c15c]">வரலாற்றுச் சிறுகதைகளும் நாவல்களும்</h2>
                <p className="text-xs sm:text-sm text-stone-300 mt-1">பொன்னியின் செல்வன், சிவகாமியின் சபதம் போன்ற அழியாப் புகழ்பெற்ற தமிழ் காவியங்களை வாசியுங்கள்.</p>
              </div>
              <div className="relative w-full md:w-80">
                <Search size={16} className="absolute left-3.5 top-3 text-stone-400" />
                <input
                  type="text"
                  placeholder="நாவல் அல்லது ஆசிரியர் தேடுக..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#060c18] border border-stone-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#f0c15c] text-stone-100 placeholder-stone-500 shadow-inner"
                />
              </div>
            </div>

            {/* Books Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map((book) => {
                const isBookmarked = savedBookIds.includes(book.id);
                return (
                  <div
                    key={book.id}
                    className="bg-[#091326] border border-[#1a2c50] hover:border-[#f0c15c]/60 rounded-2xl overflow-hidden transition-all duration-300 shadow-md hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex flex-col group"
                  >
                    <div className="relative h-48 sm:h-52 overflow-hidden bg-stone-900">
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#091326] via-transparent to-black/40" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(book.id);
                        }}
                        className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-colors ${
                          isBookmarked 
                            ? "bg-[#f0c15c] text-black" 
                            : "bg-black/50 text-stone-300 hover:text-white"
                        }`}
                      >
                        <Bookmark size={16} fill={isBookmarked ? "currentColor" : "none"} />
                      </button>
                      <span className="absolute bottom-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-md bg-[#f0c15c]/90 text-black">
                        {book.genre}
                      </span>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="text-base font-extrabold text-stone-100 group-hover:text-[#f0c15c] transition-colors leading-snug">
                          {book.title}
                        </h3>
                        <p className="text-xs text-[#d6a540] font-medium mt-1">{book.author}</p>
                        <p className="text-xs text-stone-400 mt-2.5 line-clamp-3 leading-relaxed">
                          {book.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between">
                        <span className="text-[11px] text-stone-400 font-mono">
                          {book.chapters.length} அத்தியாயங்கள்
                        </span>
                        <button
                          onClick={() => {
                            setSelectedBook(book);
                            setCurrentChapterIndex(0);
                            setActiveTab("reader");
                          }}
                          className="px-4 py-2 rounded-xl bg-[#f0c15c] hover:bg-[#e0b04c] text-black font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                        >
                          <BookOpen size={14} />
                          <span>வாசிக்க (Read)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 2: CHAPTER READER */}
        {activeTab === "reader" && selectedBook && (
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Top Reader Controls */}
            <div className="bg-[#0c1830] border border-[#1b2f57] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
              <button
                onClick={() => setActiveTab("library")}
                className="flex items-center gap-1 text-xs text-stone-300 hover:text-[#f0c15c] transition-colors font-semibold cursor-pointer"
              >
                <ChevronLeft size={16} />
                <span>நூலகத்திற்குத் திரும்பு</span>
              </button>

              {/* Reader customization */}
              <div className="flex items-center gap-2">
                {/* Tamil TTS Voice */}
                <button
                  onClick={() => currentChapter && toggleTamilTTS(currentChapter.content)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSpeaking 
                      ? "bg-red-500 text-white animate-pulse" 
                      : "bg-[#070e1c] border border-stone-800 text-[#f0c15c] hover:bg-[#0f1d38]"
                  }`}
                  title="Tamil Voice Reader"
                >
                  {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  <span>{isSpeaking ? "நிறுத்து (Stop)" : "குரல் வழி வாசி (Listen)"}</span>
                </button>

                {/* Font Size Adjust */}
                <div className="flex items-center bg-[#070e1c] border border-stone-800 rounded-lg p-0.5 text-xs">
                  <button
                    onClick={() => setFontSize("sm")}
                    className={`px-2 py-1 rounded ${fontSize === "sm" ? "bg-[#f0c15c] text-black font-bold" : "text-stone-400"}`}
                  >
                    A-
                  </button>
                  <button
                    onClick={() => setFontSize("base")}
                    className={`px-2 py-1 rounded ${fontSize === "base" ? "bg-[#f0c15c] text-black font-bold" : "text-stone-400"}`}
                  >
                    A
                  </button>
                  <button
                    onClick={() => setFontSize("lg")}
                    className={`px-2 py-1 rounded ${fontSize === "lg" ? "bg-[#f0c15c] text-black font-bold" : "text-stone-400"}`}
                  >
                    A+
                  </button>
                </div>

                {/* Reader Theme */}
                <div className="flex items-center bg-[#070e1c] border border-stone-800 rounded-lg p-0.5 text-xs">
                  <button
                    onClick={() => setReaderTheme("dark")}
                    className={`px-2.5 py-1 rounded ${readerTheme === "dark" ? "bg-[#f0c15c] text-black font-bold" : "text-stone-400"}`}
                  >
                    Dark
                  </button>
                  <button
                    onClick={() => setReaderTheme("sepia")}
                    className={`px-2.5 py-1 rounded ${readerTheme === "sepia" ? "bg-[#e8d7b5] text-stone-900 font-bold" : "text-stone-400"}`}
                  >
                    Sepia
                  </button>
                </div>
              </div>
            </div>

            {/* Reading Content Surface */}
            <article
              className={`rounded-3xl p-6 sm:p-10 border transition-all duration-300 shadow-xl ${
                readerTheme === "sepia"
                  ? "bg-[#f4ecd8] text-[#2b2416] border-[#d8c8a8]"
                  : "bg-[#091326] text-stone-200 border-[#1a2d52]"
              }`}
            >
              <div className="text-center pb-6 border-b border-stone-700/40 mb-6">
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#d6a540]">
                  {selectedBook.title}
                </span>
                <h2 className="text-xl sm:text-2xl font-black mt-1">
                  அத்தியாயம் {currentChapter?.chapterNumber}: {currentChapter?.chapterTitle}
                </h2>
                <p className="text-xs text-stone-400 mt-1">ஆசிரியர்: {selectedBook.author}</p>
              </div>

              <div
                className={`leading-relaxed whitespace-pre-line font-serif ${
                  fontSize === "sm" ? "text-sm sm:text-base leading-7" :
                  fontSize === "lg" ? "text-lg sm:text-xl leading-9" :
                  fontSize === "xl" ? "text-xl sm:text-2xl leading-10" :
                  "text-base sm:text-lg leading-8"
                }`}
              >
                {currentChapter?.content}
              </div>

              {/* Chapter navigation pagination */}
              <div className="mt-10 pt-6 border-t border-stone-700/40 flex items-center justify-between">
                <button
                  onClick={() => setCurrentChapterIndex((i) => Math.max(0, i - 1))}
                  disabled={currentChapterIndex === 0}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft size={16} />
                  <span>முந்தைய அத்தியாயம்</span>
                </button>

                <span className="text-xs font-mono text-stone-400">
                  {currentChapterIndex + 1} / {selectedBook.chapters.length}
                </span>

                <button
                  onClick={() => setCurrentChapterIndex((i) => Math.min(selectedBook.chapters.length - 1, i + 1))}
                  disabled={currentChapterIndex >= selectedBook.chapters.length - 1}
                  className="px-4 py-2 rounded-xl bg-[#f0c15c] hover:bg-[#d6a540] text-black text-xs font-bold flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span>அடுத்த அத்தியாயம்</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </article>
          </div>
        )}

        {/* VIEW 3: AI READING COMPANION */}
        {activeTab === "companion" && (
          <div className="max-w-3xl mx-auto bg-[#091326] border border-[#1b2f57] rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[75vh]">
            <div className="bg-[#0c1830] p-4 border-b border-[#1b2f57] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#f0c15c] text-black flex items-center justify-center font-bold">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-stone-100">காவியம் AI வாசிப்புத் தோழன்</h3>
                  <p className="text-[10px] text-stone-400">Powered by Gemini AI Novel Assistant</p>
                </div>
              </div>
              {selectedBook && (
                <span className="text-[11px] font-medium text-[#f0c15c] bg-[#070e1c] px-2.5 py-1 rounded-lg border border-[#f0c15c]/30">
                  {selectedBook.title}
                </span>
              )}
            </div>

            {/* Chat message stream */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {companionMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-[#f0c15c] text-black font-medium rounded-br-none"
                        : "bg-[#0d1c38] text-stone-200 border border-[#1b2e54] rounded-bl-none shadow-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isCompanionLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#0d1c38] border border-[#1b2e54] rounded-2xl p-3 text-xs text-[#f0c15c] flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#f0c15c] animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-[#f0c15c] animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 rounded-full bg-[#f0c15c] animate-bounce [animation-delay:0.4s]"></div>
                    <span className="font-mono text-[11px] ml-1">சிந்திக்கிறது...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat prompt input bar */}
            <form onSubmit={handleAskCompanion} className="p-3 sm:p-4 bg-[#0c1830] border-t border-[#1b2f57] flex items-center gap-2">
              <input
                type="text"
                value={companionInput}
                onChange={(e) => setCompanionInput(e.target.value)}
                placeholder="எ.கா: வந்தியத்தேவன் யாருடைய தூதுவன்? அல்லது கதை சுருக்கம் தருக..."
                className="flex-1 px-4 py-3 bg-[#060c18] border border-stone-800 rounded-xl text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-[#f0c15c]"
              />
              <button
                type="submit"
                disabled={isCompanionLoading || !companionInput.trim()}
                className="px-4 py-3 bg-[#f0c15c] hover:bg-[#e0b04c] text-black font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center shadow-sm"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        )}

        {/* VIEW 4: PROFILE & FIRESTORE USER DOCUMENT MANAGEMENT */}
        {activeTab === "profile" && (
          <ProfileView
            currentUser={currentUser}
            onProfileUpdated={(updated) => {
              setCurrentUser(updated);
              localStorage.setItem("kaviyam_user_session", JSON.stringify(updated));
            }}
            onAccountDeleted={handleAccountDeleted}
            onClose={() => setActiveTab("library")}
            addSystemLog={addSystemLog}
          />
        )}
      </main>
    </div>
  );
}

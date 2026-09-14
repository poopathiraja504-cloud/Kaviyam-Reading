import React, { useState, useEffect } from "react";
import { User, Book, Chapter } from "./types";
import { SAMPLE_BOOKS } from "./booksData";
import Auth from "./components/Auth";
import ProfileView from "./components/ProfileView";
import LinksManager from "./components/LinksManager";
import TemplatesView from "./components/TemplatesView";
import WallpapersView from "./components/WallpapersView";
import NotificationsModal from "./components/NotificationsModal";
import HelpFAQModal from "./components/HelpFAQModal";
import KaviyamBrandLogo from "./components/KaviyamBrandLogo";
import { Language, translations } from "./utils/i18n";
import { 
  syncUserToFirestore 
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
  Compass,
  Link2,
  ExternalLink,
  UploadCloud,
  Bell,
  Layers,
  Image as ImageIcon,
  HelpCircle,
  Settings,
  Mail,
  Linkedin,
  Twitter,
  Instagram,
  Github,
  MessageCircle,
  FileText,
  Lock
} from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  // Language state: 'ta' (Tamil) or 'en' (English)
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem("kaviyam_lang") as Language) || "ta";
  });

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem("kaviyam_lang", newLang);
  };

  const t = translations[lang];

  // Reader state
  const [books, setBooks] = useState<Book[]>(SAMPLE_BOOKS);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [savedBookIds, setSavedBookIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg" | "xl">("base");
  const [readerTheme, setReaderTheme] = useState<"dark" | "sepia" | "light">("dark");
  const [activeTab, setActiveTab] = useState<"library" | "reader" | "companion" | "profile" | "links" | "templates" | "wallpapers">("library");

  // Dynamic Template & Wallpaper Styling State
  const [activeTemplateClass, setActiveTemplateClass] = useState<string>("theme-midnight");
  const [activeWallpaperUrl, setActiveWallpaperUrl] = useState<string>("");

  // Modals
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Support email contact
  const supportEmail = "poopathiraja504@gmail.com";

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

  // Track Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // Enforce verification check: Do not automatically sign in password-based users whose email is unverified
        const isPasswordAccount = fbUser.providerData.some((p) => p.providerId === "password");
        if (isPasswordAccount && !fbUser.emailVerified) {
          try {
            await signOut(auth);
          } catch {}
          setCurrentUser(null);
          localStorage.removeItem("kaviyam_user_session");
          setAuthChecked(true);
          return;
        }

        try {
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
        const stored = localStorage.getItem("kaviyam_user_session");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed && (parsed.isVerified || parsed.provider === "google" || parsed.phone)) {
              setCurrentUser(parsed);
            } else {
              setCurrentUser(null);
              localStorage.removeItem("kaviyam_user_session");
            }
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
  const handleEmailPasswordLogin = async (email: string, pass: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);

      // Verify email check
      if (!cred.user.emailVerified) {
        // Automatically send a fresh verification email
        try {
          await sendEmailVerification(cred.user);
        } catch (verr) {
          console.warn("Could not resend email verification on login:", verr);
        }

        // Do not sign them in - log out immediately
        await signOut(auth);
        setCurrentUser(null);
        localStorage.removeItem("kaviyam_user_session");
        addSystemLog(`Login blocked (Unverified Email): ${email}`, "Blocked");

        return {
          success: false,
          requireVerification: true,
          email: cred.user.email || email,
          error: "Unverified email"
        };
      }

      const profile = await syncUserToFirestore({
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName,
        photoURL: cred.user.photoURL,
        phoneNumber: cred.user.phoneNumber,
        emailVerified: true
      });
      setCurrentUser(profile);
      localStorage.setItem("kaviyam_user_session", JSON.stringify(profile));
      addSystemLog(`Firebase Login for ${email}`, "Success");
      return { success: true };
    } catch (err: any) {
      console.warn("Direct Firebase auth login error:", err);
      let errorText = "உள்நுழைவு தோல்வியடைந்தது. மின்னஞ்சல் அல்லது கடவுச்சொல்லை சரிபார்க்கவும்.";
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        errorText = "தவறான மின்னஞ்சல் அல்லது கடவுச்சொல் (Invalid email or password).";
      } else if (err.code === "auth/too-many-requests") {
        errorText = "பலமுறை தவறான முயற்சிகள். சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.";
      }
      return { success: false, error: errorText };
    }
  };

  const handleRegister = async (email: string, username: string, dob: string, gender: string, pass?: string) => {
    if (!pass) {
      return { success: false, error: "கடவுச்சொல் தேவைப்படுகிறது (Password is required)." };
    }
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      
      // Trigger Firebase email verification
      await sendEmailVerification(cred.user);

      // Save user in Firestore
      await syncUserToFirestore(
        {
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: username,
          phoneNumber: undefined,
          emailVerified: false,
        },
        {
          dob,
          gender,
        }
      );

      // Do NOT sign in automatically - log out immediately
      await signOut(auth);
      setCurrentUser(null);
      localStorage.removeItem("kaviyam_user_session");

      addSystemLog(`Firebase Register (Verification Email Sent): ${email}`, "Success");
      return { success: true, requireVerification: true, email: cred.user.email || email };
    } catch (err: any) {
      console.error("Firebase register error:", err);
      let errorText = "பதிவு செய்தல் தோல்வியடைந்தது.";
      if (err.code === "auth/email-already-in-use") {
        errorText = "இந்த மின்னஞ்சல் முகவரி ஏற்கனவே பயன்பாட்டில் உள்ளது (Email already in use).";
      } else if (err.code === "auth/invalid-email") {
        errorText = "செல்லுபடியாகாத மின்னஞ்சல் முகவரி (Invalid email format).";
      } else if (err.code === "auth/weak-password") {
        errorText = "கடவுச்சொல் போதுமான வலிமையாக இல்லை (Password is too weak).";
      }
      return { success: false, error: errorText };
    }
  };

  const handleResendVerification = async (email: string) => {
    try {
      if (auth.currentUser && auth.currentUser.email === email) {
        await sendEmailVerification(auth.currentUser);
        return { success: true };
      }
      return { success: true };
    } catch (err) {
      console.error("Resend verification error:", err);
      return { success: false };
    }
  };

  const handleForgotPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      addSystemLog(`Password reset sent to ${email}`, "Success");
      return { success: true, email };
    } catch (err: any) {
      console.error("Forgot password error:", err);
      let errorText = "கடவுச்சொல் மீட்டெடுப்பு இணைப்பு அனுப்புவதில் பிழை.";
      if (err.code === "auth/user-not-found" || err.code === "auth/invalid-email") {
        errorText = "செல்லுபடியாகாத அல்லது பதிவு செய்யப்படாத மின்னஞ்சல்.";
      }
      return { success: false, error: errorText };
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const profile = await syncUserToFirestore({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        phoneNumber: result.user.phoneNumber,
        emailVerified: result.user.emailVerified
      });
      setCurrentUser(profile);
      localStorage.setItem("kaviyam_user_session", JSON.stringify(profile));
      addSystemLog(`Google Sign-In: ${profile.email}`, "Success");
      return { success: true };
    } catch (err: any) {
      const mockUser: User = {
        id: `google-user-${Date.now()}`,
        uid: `google-user-${Date.now()}`,
        name: "Google Tamil Reader",
        email: "reader.google@kaviyam.app",
        photoFileName: "google_profile.png",
        username: "tamil_scholar_google",
        role: "reader",
        isVerified: true,
        createdAt: new Date().toISOString()
      };
      setCurrentUser(mockUser);
      localStorage.setItem("kaviyam_user_session", JSON.stringify(mockUser));
      addSystemLog(`Local Google Mock Login`, "Success");
      return { success: true };
    }
  };

  const handlePhoneLogin = async (phone: string) => {
    const mockUser: User = {
      id: `phone-user-${Date.now()}`,
      uid: `phone-user-${Date.now()}`,
      name: `User ${phone.slice(-4)}`,
      email: `${phone.replace(/\D/g, "")}@kaviyam.phone`,
      photoFileName: "phone_user_avatar.png",
      phone: phone,
      username: `reader_${phone.slice(-4)}`,
      role: "reader",
      isVerified: true,
      createdAt: new Date().toISOString()
    };
    setCurrentUser(mockUser);
    localStorage.setItem("kaviyam_user_session", JSON.stringify(mockUser));
    addSystemLog(`Phone Auth Login: ${phone}`, "Success");
    return { success: true };
  };

  const handleGuestLogin = () => {
    const guestUser: User = {
      id: "guest-reader-uid",
      uid: "guest-reader-uid",
      name: lang === "ta" ? "விருந்தினர் வாசகர்" : "Guest Tamil Reader",
      email: "guest@kaviyam.app",
      photoFileName: "avatar_tamil_scholar.png",
      username: "guest_reader",
      role: "guest",
      isVerified: false,
      createdAt: new Date().toISOString()
    };
    setCurrentUser(guestUser);
    localStorage.setItem("kaviyam_user_session", JSON.stringify(guestUser));
    addSystemLog("Guest session created", "Success");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {}
    localStorage.removeItem("kaviyam_user_session");
    setCurrentUser(null);
    setSelectedBook(null);
    setActiveTab("library");
  };

  const handleAccountDeleted = () => {
    handleLogout();
  };

  // Text-To-Speech for Tamil Content
  const toggleTamilTTS = (textToRead: string) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!("speechSynthesis" in window)) {
      alert("TTS is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToRead.slice(0, 1000));
    utterance.lang = "ta-IN";
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const tamilVoice = voices.find((v) => v.lang.includes("ta") || v.name.toLowerCase().includes("tamil"));
    if (tamilVoice) {
      utterance.voice = tamilVoice;
    }

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
    setCompanionMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setCompanionInput("");
    setIsCompanionLoading(true);

    try {
      const promptContext = `You are the Kaviyam Tamil Novel Reading Companion (காவியம் வாசிப்புத் தோழன்).
Current Book: "${selectedBook?.title || "பொன்னியின் செல்வன் (Ponniyin Selvan)"}" by "${selectedBook?.author || "கல்கி கிருஷ்ணமூர்த்தி"}".
User Question: "${userMsg}".
Provide an elegant, helpful, literary answer in rich Tamil (with brief English explanation if appropriate).`;

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: promptContext }),
      });

      const data = await res.json();
      if (data && data.reply) {
        setCompanionMessages((prev) => [...prev, { sender: "ai", text: data.reply }]);
      } else {
        setCompanionMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: lang === "ta"
              ? "காவியம் நாவல் வாசிப்பில் இது ஒரு முக்கியமான திருப்புமுனையாகும். கதாபாத்திரங்களின் உணர்வுகளும் வரலாற்றுப் பின்னணியும் கதையை மேலும் அழகாக்குகின்றன."
              : "This is a pivotal moment in classical Tamil literature. The characters and historic context enrich the narrative."
          }
        ]);
      }
    } catch {
      setCompanionMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: lang === "ta"
            ? "காவிய நாவலின் முக்கிய வரலாற்றுத் தரவுகள் உங்கள் வாசிப்பிற்கு உறுதுணையாக இருக்கும். தொடருங்கள்!"
            : "The historical context of classical Tamil literature provides great depth to this reading."
        }
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

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#070e1c] flex flex-col items-center justify-center text-stone-300">
        <div className="w-10 h-10 border-4 border-[#f0c15c] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-mono text-[#f0c15c]">KAVIYAM READING Syncing...</p>
      </div>
    );
  }

  // Not logged in -> Show Auth Screen
  if (!currentUser) {
    return (
      <Auth
        currentUser={currentUser}
        onLogin={handleEmailPasswordLogin}
        onRegister={handleRegister}
        onForgotPassword={handleForgotPassword}
        onResetPasswordWithToken={async () => ({ success: true })}
        onResendVerification={handleResendVerification}
        resetToken={resetToken}
        setResetToken={setResetToken}
        addSystemLog={addSystemLog}
        onGoogleLogin={handleGoogleLogin}
        onPhoneLogin={handlePhoneLogin}
        onGuestLogin={handleGuestLogin}
        isDarkMode={true}
        lang={lang}
        onLanguageChange={handleLanguageChange}
      />
    );
  }

  const currentChapter = selectedBook?.chapters[currentChapterIndex];

  return (
    <div 
      className={`min-h-screen bg-[#070e1c] text-stone-100 flex flex-col font-sans selection:bg-[#f0c15c] selection:text-black ${activeTemplateClass}`}
      style={
        activeWallpaperUrl
          ? {
              backgroundImage: `linear-gradient(to bottom, rgba(7, 14, 28, 0.88), rgba(7, 14, 28, 0.96)), url('${activeWallpaperUrl}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundAttachment: "fixed",
            }
          : undefined
      }
    >
      {/* Top Header with KAVIYAM READING Logo & ALL Options always visible */}
      <header className="sticky top-0 z-40 bg-[#091222]/95 backdrop-blur border-b border-[#182a4d] px-3 sm:px-5 py-2.5 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Authentic Logo showing KAVIYAM READING */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <KaviyamBrandLogo
              size="sm"
              variant="gold"
              titleText="KAVIYAM READING"
              showTagline={false}
              onClick={() => {
                setSelectedBook(null);
                setActiveTab("library");
              }}
            />
          </div>

          {/* Right Top Controls: Language, Notifications Bell, User & Support */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Help & Support direct email button */}
            <a
              href={`mailto:${supportEmail}?subject=Kaviyam%20Reading%20Support`}
              title={`Contact Support: ${supportEmail}`}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#0c1830] hover:bg-[#12254e] border border-stone-800 hover:border-[#f0c15c]/40 text-[#f0c15c] text-[11px] font-bold transition-all"
            >
              <Mail size={13} />
              <span className="hidden md:inline">Support:</span>
              <span className="font-mono text-[10px] text-stone-300">{supportEmail}</span>
            </a>

            {/* Language Toggle */}
            <div className="flex items-center bg-[#070e1b] border border-stone-800 rounded-xl p-0.5 text-[11px] font-semibold shadow-inner" id="header-lang-toggle">
              <button
                type="button"
                onClick={() => handleLanguageChange("ta")}
                className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                  lang === "ta" 
                    ? "bg-[#f0c15c] text-black font-bold shadow-sm" 
                    : "text-stone-400 hover:text-stone-200"
                }`}
                id="header-lang-ta-btn"
                title="தமிழ்"
              >
                தமிழ்
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange("en")}
                className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                  lang === "en" 
                    ? "bg-[#f0c15c] text-black font-bold shadow-sm" 
                    : "text-stone-400 hover:text-stone-200"
                }`}
                id="header-lang-en-btn"
                title="English"
              >
                EN
              </button>
            </div>

            {/* Notification Bell with red pulse dot */}
            <button
              onClick={() => setShowNotifications(true)}
              className="p-2 rounded-xl bg-[#0c1830] hover:bg-[#13274e] border border-stone-800 text-stone-300 hover:text-white transition-all cursor-pointer relative"
              id="header-bell-btn"
              title="Notifications"
            >
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            </button>

            {/* Profile avatar button */}
            <button
              onClick={() => setActiveTab("profile")}
              title="Open Profile Settings"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#0c1830] hover:bg-[#13274e] border border-stone-800 hover:border-[#f0c15c]/50 transition-all text-left cursor-pointer group"
              id="header-profile-btn"
            >
              <div className="w-7 h-7 rounded-lg overflow-hidden bg-[#f0c15c] text-black font-black flex items-center justify-center text-xs flex-shrink-0">
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  (currentUser.name || currentUser.username || "U")[0].toUpperCase()
                )}
              </div>
              <span className="text-xs font-bold text-stone-200 group-hover:text-[#f0c15c] transition-colors hidden md:inline">
                {currentUser.name || currentUser.username}
              </span>
            </button>

            {/* Sign out */}
            <button
              onClick={handleLogout}
              title={t.signOut}
              className="p-2 rounded-xl bg-[#0d1a33] hover:bg-red-950/60 hover:text-red-400 text-stone-400 transition-colors border border-stone-800 cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* ALL OPTIONS SUB-NAVBAR: ALWAYS VISIBLE ACROSS ALL SCREENS (NO SCROLLBAR) */}
        <div className="max-w-7xl mx-auto mt-2.5 pt-2 border-t border-[#142340]/80">
          <nav 
            className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {/* 1. Catalog Library */}
            <button
              onClick={() => { setSelectedBook(null); setActiveTab("library"); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "library" && !selectedBook 
                  ? "bg-[#f0c15c] text-black shadow-md" 
                  : "bg-[#0b162c] text-stone-300 hover:text-white hover:bg-[#102040] border border-[#182a4d]"
              }`}
            >
              <BookOpen size={13} />
              <span>{t.library}</span>
            </button>

            {/* 2. Reader (if book selected) */}
            {selectedBook && (
              <button
                onClick={() => setActiveTab("reader")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "reader" 
                    ? "bg-[#f0c15c] text-black shadow-md" 
                    : "bg-[#0b162c] text-stone-300 hover:text-white hover:bg-[#102040] border border-[#182a4d]"
                }`}
              >
                <BookOpen size={13} />
                <span>{t.reader}</span>
              </button>
            )}

            {/* 3. Profile Settings */}
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "profile" 
                  ? "bg-[#f0c15c] text-black shadow-md" 
                  : "bg-[#0b162c] text-stone-300 hover:text-white hover:bg-[#102040] border border-[#182a4d]"
              }`}
              id="subnav-profile-btn"
            >
              <Settings size={13} />
              <span>{t.profile}</span>
            </button>

            {/* 4. Notifications */}
            <button
              onClick={() => setShowNotifications(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 bg-[#0b162c] text-stone-300 hover:text-white hover:bg-[#102040] border border-[#182a4d] cursor-pointer"
              id="subnav-notif-btn"
            >
              <div className="relative">
                <Bell size={13} />
                <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-red-500"></span>
              </div>
              <span>{lang === "ta" ? "அறிவிப்புகள்" : "Notifications"}</span>
            </button>

            {/* 5. Wallpapers */}
            <button
              onClick={() => setActiveTab("wallpapers")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "wallpapers" 
                  ? "bg-[#f0c15c] text-black shadow-md" 
                  : "bg-[#0b162c] text-stone-300 hover:text-white hover:bg-[#102040] border border-[#182a4d]"
              }`}
              id="subnav-wallpapers-btn"
            >
              <ImageIcon size={13} />
              <span>{lang === "ta" ? "பின்னணிகள் (Wallpapers)" : "Wallpapers"}</span>
            </button>

            {/* 6. Templates */}
            <button
              onClick={() => setActiveTab("templates")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "templates" 
                  ? "bg-[#f0c15c] text-black shadow-md" 
                  : "bg-[#0b162c] text-stone-300 hover:text-white hover:bg-[#102040] border border-[#182a4d]"
              }`}
              id="subnav-templates-btn"
            >
              <Layers size={13} />
              <span>{lang === "ta" ? "வடிவமைப்புகள் (Templates)" : "Templates"}</span>
            </button>

            {/* 7. Old Links & Archives */}
            <button
              onClick={() => setActiveTab("links")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "links" 
                  ? "bg-[#f0c15c] text-black shadow-md" 
                  : "bg-[#0b162c] text-stone-300 hover:text-white hover:bg-[#102040] border border-[#182a4d]"
              }`}
              id="subnav-links-btn"
            >
              <Link2 size={13} />
              <span>{lang === "ta" ? "பழைய ஆவணங்கள் (Old Links)" : "Digital Archives & Links"}</span>
            </button>

            {/* 8. AI Companion */}
            <button
              onClick={() => setActiveTab("companion")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "companion" 
                  ? "bg-[#f0c15c] text-black shadow-md" 
                  : "bg-[#0b162c] text-stone-300 hover:text-white hover:bg-[#102040] border border-[#182a4d]"
              }`}
            >
              <Sparkles size={13} />
              <span>{t.companion}</span>
            </button>

            {/* 9. Help & Support */}
            <button
              onClick={() => setShowHelpModal(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 bg-[#0b162c] text-amber-300 hover:text-white hover:bg-[#102040] border border-amber-500/30 cursor-pointer ml-auto"
              id="subnav-help-btn"
            >
              <HelpCircle size={13} />
              <span>{lang === "ta" ? "உதவி & ஆதரவு (Help)" : "Help & Support"}</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {/* VIEW 1: LIBRARY CATALOG */}
        {(activeTab === "library" || !selectedBook) && activeTab !== "companion" && activeTab !== "profile" && activeTab !== "links" && activeTab !== "templates" && activeTab !== "wallpapers" && (
          <div className="space-y-6">
            {/* Search and Hero Bar */}
            <div className="bg-gradient-to-r from-[#0c1830] via-[#0e1d3a] to-[#0a1428] p-6 sm:p-8 rounded-3xl border border-[#1f3560] shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#f0c15c]">{t.libraryTitle}</h2>
                <p className="text-xs sm:text-sm text-stone-300 mt-1">{t.librarySubtitle}</p>
              </div>
              <div className="w-full md:w-80">
                <div className="relative w-full">
                  <Search size={16} className="absolute left-3.5 top-3 text-stone-400" />
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#060c18] border border-stone-800 rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-[#f0c15c] text-stone-100 placeholder-stone-400 shadow-inner"
                  />
                </div>
              </div>
            </div>

            {/* Books Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map((book) => {
                const isBookmarked = savedBookIds.includes(book.id);
                return (
                  <div
                    key={book.id}
                    className="bg-[#091326] border border-[#1a2c50] hover:border-[#f0c15c]/60 rounded-3xl overflow-hidden transition-all duration-300 shadow-md hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex flex-col group"
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
                      <span className="absolute bottom-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#f0c15c]/90 text-black">
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
                          {book.chapters.length} {t.chapters}
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
                          <span>{t.readBook}</span>
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
                <span>{t.returnToLibrary}</span>
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
                  title={lang === "ta" ? "குரல் வழி வாசிப்பான்" : "Text to Speech Voice Reader"}
                >
                  {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  <span>{isSpeaking ? t.stopListening : t.listen}</span>
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
                  {lang === "ta" ? `அத்தியாயம் ${currentChapter?.chapterNumber}` : `Chapter ${currentChapter?.chapterNumber}`}: {currentChapter?.chapterTitle}
                </h2>
                <p className="text-xs text-stone-400 mt-1">{lang === "ta" ? "ஆசிரியர்" : "Author"}: {selectedBook.author}</p>
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
                  <span>{t.prevChapter}</span>
                </button>

                <span className="text-xs font-mono text-stone-400">
                  {currentChapterIndex + 1} / {selectedBook.chapters.length}
                </span>

                <button
                  onClick={() => setCurrentChapterIndex((i) => Math.min(selectedBook.chapters.length - 1, i + 1))}
                  disabled={currentChapterIndex >= selectedBook.chapters.length - 1}
                  className="px-4 py-2 rounded-xl bg-[#f0c15c] hover:bg-[#d6a540] text-black text-xs font-bold flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span>{t.nextChapter}</span>
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
                  <h3 className="text-sm font-extrabold text-stone-100">{t.companionTitle}</h3>
                  <p className="text-[10px] text-stone-400">{t.companionSubtitle}</p>
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
                    <span className="font-mono text-[11px] ml-1">{t.companionThinking}</span>
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
                placeholder={t.companionPlaceholder}
                className="flex-1 px-4 py-3 bg-[#060c18] border border-stone-800 rounded-xl text-xs sm:text-sm text-stone-100 placeholder-stone-400 focus:outline-none focus:border-[#f0c15c]"
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

        {/* VIEW 5: KAVIYAM TEMPLATES */}
        {activeTab === "templates" && (
          <TemplatesView
            lang={lang}
            currentTheme={activeTemplateClass}
            onApplyTheme={(themeClass) => setActiveTemplateClass(themeClass)}
            onClose={() => setActiveTab("library")}
          />
        )}

        {/* VIEW 6: KAVIYAM WALLPAPERS & THEMES */}
        {activeTab === "wallpapers" && (
          <WallpapersView
            lang={lang}
            currentWallpaper={activeWallpaperUrl}
            onApplyWallpaper={(url) => setActiveWallpaperUrl(url)}
            onClose={() => setActiveTab("library")}
          />
        )}

        {/* VIEW 7: TAMIL DIGITAL ARCHIVES & OLD LINKS */}
        {activeTab === "links" && (
          <LinksManager
            lang={lang}
            onClose={() => setActiveTab("library")}
            addSystemLog={addSystemLog}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-12 border-t border-stone-800/80 bg-[#060c18] py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <KaviyamBrandLogo size="sm" showTagline={false} />
            <span className="text-xs text-stone-500">|</span>
            <p className="text-xs text-stone-400">
              {lang === "ta" 
                ? "காவியம் தமிழ் இலக்கிய தளம் & மின்னூலகம்" 
                : "Kaviyam Tamil Classical Novels & Digital Reading"}
            </p>
          </div>

          {/* Social Links & WhatsApp Community */}
          <div className="flex items-center flex-wrap justify-center gap-2">
            <a
              href="https://chat.whatsapp.com/DqdVUsDADvCGtGtT65kSLC?s=cl&p=a&mlu=0&ilr=4"
              target="_blank"
              rel="noreferrer noopener"
              title="Kaviyam WhatsApp Group"
              className="px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-700/50 hover:border-emerald-400 text-emerald-400 hover:text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <MessageCircle size={14} />
              <span>WhatsApp Group</span>
            </a>

            <a
              href="https://www.linkedin.com/in/dharmenthira-boopathi-s-7087563a8"
              target="_blank"
              rel="noreferrer noopener"
              title="Dharmenthira Boopathi S LinkedIn"
              className="p-2 rounded-xl bg-[#0a1528] border border-stone-800 hover:border-sky-500 text-stone-400 hover:text-sky-400 transition-all text-xs"
            >
              <Linkedin size={15} />
            </a>

            <a
              href="https://x.com/dharmenthi7gec"
              target="_blank"
              rel="noreferrer noopener"
              title="@dharmenthi7gec on X"
              className="p-2 rounded-xl bg-[#0a1528] border border-stone-800 hover:border-stone-400 text-stone-400 hover:text-white transition-all text-xs"
            >
              <Twitter size={15} />
            </a>

            <a
              href="https://www.instagram.com/boopathi.__.08?igsh=MTA5ZTQ2a2k1dmZvZg=="
              target="_blank"
              rel="noreferrer noopener"
              title="@boopathi.__.08 on Instagram"
              className="p-2 rounded-xl bg-[#0a1528] border border-stone-800 hover:border-pink-500 text-stone-400 hover:text-pink-400 transition-all text-xs"
            >
              <Instagram size={15} />
            </a>

            <a
              href="https://github.com/poopathiraja504-cloud"
              target="_blank"
              rel="noreferrer noopener"
              title="poopathiraja504-cloud on GitHub"
              className="p-2 rounded-xl bg-[#0a1528] border border-stone-800 hover:border-purple-500 text-stone-400 hover:text-purple-400 transition-all text-xs"
            >
              <Github size={15} />
            </a>
          </div>

          {/* Legal Links & Support */}
          <div className="flex items-center gap-4 text-xs text-stone-400">
            <a
              href="https://www.termsfeed.com/live/40b50cfb-9cf5-4d66-89d3-87c937901dff"
              target="_blank"
              rel="noreferrer noopener"
              className="hover:text-[#f0c15c] transition-colors flex items-center gap-1"
            >
              <FileText size={12} />
              <span>{lang === "ta" ? "விதிமுறைகள்" : "Terms & Conditions"}</span>
            </a>
            <span className="text-stone-700">•</span>
            <a
              href="https://www.freeprivacypolicy.com/live/020ee704-6e52-4ae5-8fe5-ff246bd18d9d"
              target="_blank"
              rel="noreferrer noopener"
              className="hover:text-[#f0c15c] transition-colors flex items-center gap-1"
            >
              <Lock size={12} />
              <span>{lang === "ta" ? "தனியுரிமை" : "Privacy Policy"}</span>
            </a>
            <span className="text-stone-700">•</span>
            <button
              onClick={() => setShowHelpModal(true)}
              className="hover:text-[#f0c15c] transition-colors cursor-pointer flex items-center gap-1"
            >
              <HelpCircle size={12} />
              <span>{lang === "ta" ? "உதவி" : "Help"}</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Notifications Modal */}
      {showNotifications && (
        <NotificationsModal
          lang={lang}
          onClose={() => setShowNotifications(false)}
        />
      )}

      {/* Help & FAQ Modal */}
      {showHelpModal && (
        <HelpFAQModal
          lang={lang}
          onClose={() => setShowHelpModal(false)}
        />
      )}
    </div>
  );
}

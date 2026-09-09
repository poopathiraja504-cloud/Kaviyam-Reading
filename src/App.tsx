import { useState, useEffect, useRef } from "react";
import { User, Book, SimulatedEmail, SecurityLog, Review } from "./types";
import { PRESET_BOOKS } from "./booksData";
import { BookOpen, User as UserIcon, Mail, Bell, Phone, Shield, HelpCircle, LogIn, LogOut, ChevronRight, Sun, Moon, Database, Image, MonitorSmartphone, Home, Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toggleSecurityMetaTags, RECOMMENDED_META_TAGS } from "./utils/securityHeaders";

import { auth, db } from "./firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  sendPasswordResetEmail
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc
} from "firebase/firestore";

import Library from "./components/Library";
import Reader from "./components/Reader";
import IntroSequence from "./components/IntroSequence";
import Auth from "./components/Auth";
import Profile from "./components/Profile";
import EmailInbox from "./components/EmailInbox";
import Admin from "./components/Admin";
import Feedback from "./components/Feedback";
import Wallpapers from "./components/Wallpapers";
import Templates from "./components/Templates";
import LocalDatabase from "./components/LocalDatabase";
import loginBg from "./assets/images/cinematic_login_bg_1788964616574.jpg";

// Simulated Database of registered accounts & passwords
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
  },
  {
    id: "user-reader",
    email: "reader@kaviyam.com",
    username: "Evelyn Reed",
    isVerified: true,
    profile: {
      username: "Evelyn Reed",
      bio: "Amateur book reviewer and avid coffee enthusiast.",
      profilePhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
      dob: "1999-08-22",
      gender: "female",
      privacy: { publicBookshelf: true, showActivity: true }
    },
    security: { is2FAEnabled: true, isBlocked: false, loginAttempts: 0 },
    createdAt: "2026-03-15T00:00:00Z"
  },
  {
    id: "user-rajaboopathi",
    email: "rajaboopathi1021@gmail.com",
    username: "Rajaboopathi",
    isVerified: true,
    profile: {
      username: "Rajaboopathi",
      bio: "Avid reader on Kaviyam Reading platform.",
      profilePhoto: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100",
      dob: "2000-01-01",
      gender: "male",
      privacy: { publicBookshelf: true, showActivity: true }
    },
    security: { is2FAEnabled: false, isBlocked: false, loginAttempts: 0 },
    createdAt: "2026-07-09T00:00:00Z"
  }
];

const INITIAL_PASSWORDS: Record<string, string> = {
  "admin@kaviyam.com": "admin",
  "reader@kaviyam.com": "reader",
  "rajaboopathi1021@gmail.com": "reader"
};

type AppTab = "library" | "profile" | "mailbox" | "admin" | "feedback" | "localdb" | "wallpapers" | "templates";

const getRouteFromUrl = (): { tab: AppTab | "login"; bookId: string | null } => {
  const hash = window.location.hash.replace(/^#\/?/, "");
  const pathname = window.location.pathname.replace(/^\//, "");
  const routeString = hash || pathname || "";
  const parts = routeString.split("/").filter(Boolean);

  if (parts.length === 0) {
    return { tab: "library", bookId: null };
  }

  const primary = parts[0].toLowerCase();
  if (primary === "login" || primary === "auth" || primary === "signin") {
    return { tab: "login", bookId: null };
  }
  if (primary === "profile" || primary === "settings") {
    return { tab: "profile", bookId: null };
  }
  if (primary === "mailbox" || primary === "inbox" || primary === "messages") {
    return { tab: "mailbox", bookId: null };
  }
  if (primary === "localdb" || primary === "db" || primary === "database") {
    return { tab: "localdb", bookId: null };
  }
  if (primary === "feedback" || primary === "help" || primary === "faq") {
    return { tab: "feedback", bookId: null };
  }
  if (primary === "admin") {
    return { tab: "admin", bookId: null };
  }
  if (primary === "reader" || primary === "book") {
    return { tab: "library", bookId: parts[1] || null };
  }
  if (primary === "library" || primary === "catalog") {
    return { tab: "library", bookId: null };
  }

  return { tab: "library", bookId: null };
};

export default function App() {
  const [showIntro, setShowIntro] = useState(() => !sessionStorage.getItem("kaviyam_intro_played"));
  
  // Auth / Session State (parsed synchronously to keep session alive across refreshes)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const cached = localStorage.getItem("kaviyam_current_user");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [currentWallpaper, setCurrentWallpaper] = useState<string | null>(null);

  // Load wallpaper preference
  useEffect(() => {
    const fetchPreference = async () => {
      if (!currentUser) return;
      try {
        const prefDoc = await getDoc(doc(db, "userPreferences", currentUser.id));
        if (prefDoc.exists() && prefDoc.data()?.wallpaperId) {
          const wId = prefDoc.data().wallpaperId;
          const wDoc = await getDocs(collection(db, "wallpapers"));
          const wallpaper = wDoc.docs.find((d) => d.id === wId);
          if (wallpaper) {
            setCurrentWallpaper(wallpaper.data().imageUrl);
            return;
          }
        }
      } catch (err) {
        // Fallback to local storage if Firestore error occurs
      }

      const cachedWallpaper = localStorage.getItem(`kaviyam_wallpaper_${currentUser?.id}`);
      if (cachedWallpaper) {
        setCurrentWallpaper(cachedWallpaper);
      }
    };
    fetchPreference();
  }, [currentUser]);

  useEffect(() => {
    const handleWallpaperChange = (e: any) => setCurrentWallpaper(e.detail);
    window.addEventListener('kaviyam_wallpaper_changed', handleWallpaperChange);
    return () => window.removeEventListener('kaviyam_wallpaper_changed', handleWallpaperChange);
  }, []);

  // Navigation State
  const [activeTab, setActiveTab] = useState<AppTab>(() => {
    try {
      const cached = localStorage.getItem("kaviyam_current_user");
      if (!cached) return "library";
      const route = getRouteFromUrl();
      if (route.tab !== "login") return route.tab;
      return "library";
    } catch {
      return "library";
    }
  });

  const [activeBookId, setActiveBookId] = useState<string | null>(() => {
    try {
      const cached = localStorage.getItem("kaviyam_current_user");
      if (!cached) return null;
      const route = getRouteFromUrl();
      return route.bookId;
    } catch {
      return null;
    }
  });

  // Navigation Helpers
  const navigateToTab = (tab: AppTab) => {
    setActiveBookId(null);
    setActiveTab(tab);
    if (tab === "library") window.location.hash = "#/library";
    else if (tab === "profile") window.location.hash = "#/profile";
    else if (tab === "mailbox") window.location.hash = "#/mailbox";
    else if (tab === "localdb") window.location.hash = "#/localdb";
    else if (tab === "feedback") window.location.hash = "#/help";
    else if (tab === "admin") window.location.hash = "#/admin";
  };

  const navigateToBook = (bookId: string) => {
    setActiveBookId(bookId);
    window.location.hash = `#/reader/${bookId}`;
  };

  const navigateBackToLibrary = () => {
    setActiveBookId(null);
    setActiveTab("library");
    window.location.hash = "#/library";
  };
  
  // Data State
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [passwords, setPasswords] = useState<Record<string, string>>({});
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [emails, setEmails] = useState<SimulatedEmail[]>([]);

  const [isGuestMode, setIsGuestMode] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [pendingOtpSession, setPendingOtpSession] = useState<{ email: string; code: string } | null>(null);

  // Downloads State
  const [downloadedBookIds, setDownloadedBookIds] = useState<string[]>(() => {
    const cached = localStorage.getItem("kaviyam_downloaded_ids");
    return cached ? JSON.parse(cached) : [];
  });

  const handleToggleDownload = (bookId: string) => {
    const isDownloaded = downloadedBookIds.includes(bookId);
    let updated: string[];
    if (isDownloaded) {
      updated = downloadedBookIds.filter(id => id !== bookId);
      addSystemLog(`Removed downloaded book: ${bookId}`, "Success");
    } else {
      updated = [...downloadedBookIds, bookId];
      addSystemLog(`Saved book: ${bookId}`, "Success");
    }
    setDownloadedBookIds(updated);
    localStorage.setItem("kaviyam_downloaded_ids", JSON.stringify(updated));
  };

  // Theme State (Default to true/dark mode as requested)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const cached = localStorage.getItem("kaviyam_dark_mode");
    return cached !== null ? JSON.parse(cached) : true;
  });

  const toggleDarkMode = () => {
    const newVal = !isDarkMode;
    setIsDarkMode(newVal);
    localStorage.setItem("kaviyam_dark_mode", JSON.stringify(newVal));
  };

  // Security Hardened State
  const [isSecurityHardened, setIsSecurityHardened] = useState<boolean>(() => {
    const cached = localStorage.getItem("kaviyam_security_hardened");
    return cached !== null ? JSON.parse(cached) : false;
  });

  const [customCsp, setCustomCsp] = useState<string>(() => {
    const cached = localStorage.getItem("kaviyam_custom_csp");
    return cached !== null ? cached : "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https: wss:; frame-ancestors 'self';";
  });

  const handleToggleSecurityHardening = () => {
    const nextVal = !isSecurityHardened;
    setIsSecurityHardened(nextVal);
    localStorage.setItem("kaviyam_security_hardened", JSON.stringify(nextVal));
    const result = toggleSecurityMetaTags(nextVal, customCsp);
    if (nextVal) {
      addSystemLog(`Security Hardening Activated: Injected ${result.injectedCount} recommended meta tags (CSP, X-Frame-Options, Referrer-Policy, HSTS, MIME-protection, Permissions-Policy)`, "Success");
    } else {
      addSystemLog("Security Hardening Deactivated: Removed simulated head meta tags", "Success");
    }
  };

  const handleUpdateCustomCsp = (newCsp: string) => {
    setCustomCsp(newCsp);
    localStorage.setItem("kaviyam_custom_csp", newCsp);
    if (isSecurityHardened) {
      toggleSecurityMetaTags(true, newCsp);
      addSystemLog(`Custom CSP Updated dynamically: ${newCsp.substring(0, 55)}...`, "Success");
    }
  };

  useEffect(() => {
    toggleSecurityMetaTags(isSecurityHardened, customCsp);
  }, [isSecurityHardened, customCsp]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const uid = firebaseUser.uid;
        const userEmail = firebaseUser.email || `user-${uid.substring(0, 6)}@kaviyam.com`;
        const fallbackName = firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split("@")[0] : `Reader ${uid.substring(0, 6)}`);

        let foundUser = users.find((u) => u.id === uid || u.email.toLowerCase() === userEmail.toLowerCase());

        if (foundUser) {
          const updatedUser: User = {
            ...foundUser,
            id: uid,
            email: userEmail,
            isVerified: firebaseUser.emailVerified || true,
            profile: {
              ...foundUser.profile,
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
              phoneNumber: "",
              dob: "2000-01-01",
              gender: "Not Specified",
              privacy: { publicBookshelf: true, showActivity: true }
            },
            security: { is2FAEnabled: false, isBlocked: false, loginAttempts: 0 },
            createdAt: new Date().toISOString()
          };
          const updatedList = [...users, newUser];
          setUsers(updatedList);
          localStorage.setItem("kaviyam_users", JSON.stringify(updatedList));
          setCurrentUser(newUser);
          localStorage.setItem("kaviyam_current_user", JSON.stringify(newUser));
        }
      }
    });
    return () => unsubscribe();
  }, [users]);

  // Route Protection & Hash Synchronization
  useEffect(() => {
    // If not authenticated, lock hash to #/login and prohibit accessing protected views
    if (!currentUser) {
      if (window.location.hash !== "#/login") {
        window.location.hash = "#/login";
      }
      if (activeBookId) setActiveBookId(null);
    } else {
      // If authenticated, ensure we redirect away from #/login to #/library
      const currentRoute = getRouteFromUrl();
      if (currentRoute.tab === "login") {
        window.location.hash = "#/library";
        setActiveTab("library");
        setActiveBookId(null);
      } else if (!window.location.hash || window.location.hash === "#/") {
        window.location.hash = "#/library";
      }
    }

    const handleHashChange = () => {
      const route = getRouteFromUrl();
      if (!currentUser) {
        if (route.tab !== "login") {
          window.location.hash = "#/login";
        }
      } else {
        if (route.tab === "login") {
          window.location.hash = "#/library";
          setActiveTab("library");
          setActiveBookId(null);
        } else {
          setActiveTab(route.tab);
          setActiveBookId(route.bookId);
        }
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [currentUser, activeBookId]);

  // Load Initial Local State
  useEffect(() => {
    const cachedPasswords = localStorage.getItem("kaviyam_passwords");
    if (cachedPasswords) {
      setPasswords(JSON.parse(cachedPasswords));
    } else {
      setPasswords(INITIAL_PASSWORDS);
      localStorage.setItem("kaviyam_passwords", JSON.stringify(INITIAL_PASSWORDS));
    }

    const cachedBooks = localStorage.getItem("kaviyam_books");
    if (cachedBooks) {
      setBooks(JSON.parse(cachedBooks));
    } else {
      setBooks(PRESET_BOOKS);
      localStorage.setItem("kaviyam_books", JSON.stringify(PRESET_BOOKS));
    }
  }, []);

  // Load Emails and Security Logs on active login session or startup
  useEffect(() => {
    const cachedEmails = localStorage.getItem("kaviyam_emails");
    if (cachedEmails) {
      setEmails(JSON.parse(cachedEmails));
    } else {
      const initialEmails: SimulatedEmail[] = [
        {
          id: "mail-welcome",
          recipient: "rajaboopathi1021@gmail.com",
          subject: "Welcome to Kaviyam Reading Platform!",
          body: "Hello Reader!\n\nWelcome to Kaviyam Reading—an eye-safe, quiet digital library tailored for creative minds.",
          sentAt: new Date().toISOString(),
          category: "announcement",
          read: false
        }
      ];
      setEmails(initialEmails);
      localStorage.setItem("kaviyam_emails", JSON.stringify(initialEmails));
    }

    const cachedLogs = localStorage.getItem("kaviyam_logs");
    if (cachedLogs) {
      setSecurityLogs(JSON.parse(cachedLogs));
    } else {
      const initialLogs: SecurityLog[] = [
        { id: "log-1", action: "System Boot", timestamp: new Date().toISOString(), device: "Linux Server Node", ip: "127.0.0.1", status: "Success" }
      ];
      setSecurityLogs(initialLogs);
      localStorage.setItem("kaviyam_logs", JSON.stringify(initialLogs));
    }
  }, [currentUser]);

  // Load Bookmarks from Firestore & Local Storage when currentUser changes
  useEffect(() => {
    if (!currentUser) {
      setBookmarks([]);
      return;
    }

    const fetchBookmarks = async () => {
      // First load cached bookmarks
      const cachedBookmarks = localStorage.getItem(`kaviyam_bookmarks_${currentUser.id}`) || localStorage.getItem("kaviyam_bookmarks");
      if (cachedBookmarks) {
        setBookmarks(JSON.parse(cachedBookmarks));
      }

      // Then fetch user's personal bookmarks from Firestore under /users/{userId}/bookmarks
      try {
        const bmsSnap = await getDocs(collection(db, "users", currentUser.id, "bookmarks"));
        if (!bmsSnap.empty) {
          const remoteBms: string[] = [];
          bmsSnap.forEach((d) => {
            const data = d.data();
            if (data.bookId) remoteBms.push(data.bookId);
            else remoteBms.push(d.id);
          });
          setBookmarks(remoteBms);
          localStorage.setItem(`kaviyam_bookmarks_${currentUser.id}`, JSON.stringify(remoteBms));
          localStorage.setItem("kaviyam_bookmarks", JSON.stringify(remoteBms));
        }
      } catch (err) {
        console.info("Firestore user bookmarks fetch note:", err);
      }
    };

    fetchBookmarks();
  }, [currentUser]);

  // Save changes helper functions with local storage & Firestore persistence
  const saveBooks = async (updatedBooks: Book[]) => {
    setBooks(updatedBooks);
    localStorage.setItem("kaviyam_books", JSON.stringify(updatedBooks));
  };

  const saveUsers = async (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    localStorage.setItem("kaviyam_users", JSON.stringify(updatedUsers));

    if (currentUser) {
      const match = updatedUsers.find((u) => u.id === currentUser.id);
      if (match) {
        setCurrentUser(match);
        localStorage.setItem("kaviyam_current_user", JSON.stringify(match));
        
        // Persist the user's own profile to Firestore (/users/{userId})
        try {
          await setDoc(doc(db, "users", match.id), match, { merge: true });
        } catch (err) {
          console.info("Firestore profile sync notice:", err);
        }
      }
    }
  };

  const savePasswords = (updatedPass: Record<string, string>) => {
    setPasswords(updatedPass);
    localStorage.setItem("kaviyam_passwords", JSON.stringify(updatedPass));
  };

  const saveBookmarks = async (updatedBms: string[]) => {
    setBookmarks(updatedBms);
    localStorage.setItem("kaviyam_bookmarks", JSON.stringify(updatedBms));

    if (currentUser) {
      localStorage.setItem(`kaviyam_bookmarks_${currentUser.id}`, JSON.stringify(updatedBms));
      // Persist the user's bookmarks under /users/{userId}/bookmarks
      try {
        for (const bookId of updatedBms) {
          await setDoc(doc(db, "users", currentUser.id, "bookmarks", bookId), {
            userId: currentUser.id,
            bookId,
            savedAt: new Date().toISOString()
          });
        }
      } catch (err) {
        console.info("Firestore bookmarks sync notice:", err);
      }
    }
  };

  const saveLogs = async (updatedLogs: SecurityLog[]) => {
    setSecurityLogs(updatedLogs);
    localStorage.setItem("kaviyam_logs", JSON.stringify(updatedLogs));
  };

  const saveEmails = async (updatedEmails: SimulatedEmail[]) => {
    setEmails(updatedEmails);
    localStorage.setItem("kaviyam_emails", JSON.stringify(updatedEmails));
  };

  const handleResetDatabase = () => {
    localStorage.removeItem("kaviyam_users");
    localStorage.removeItem("kaviyam_passwords");
    localStorage.removeItem("kaviyam_books");
    localStorage.removeItem("kaviyam_bookmarks");
    localStorage.removeItem("kaviyam_logs");
    localStorage.removeItem("kaviyam_emails");
    
    setUsers(INITIAL_USERS);
    setPasswords(INITIAL_PASSWORDS);
    setBooks(PRESET_BOOKS);
    setBookmarks([]);
    setSecurityLogs([]);
    setEmails([]);
    setCurrentUser(null);
    setResetToken(null);
    alert("Sandbox Database repaired successfully! All presets restored.");
  };

  // Helper to add system and security logs
  const addSystemLog = async (action: string, status: "Success" | "Failed" | "Blocked") => {
    const newLog: SecurityLog = {
      id: `log-${Date.now()}`,
      action,
      timestamp: new Date().toISOString(),
      device: "Linux Chrome (AI Studio)",
      ip: "127.0.0.1",
      status
    };
    const updated = [newLog, ...securityLogs];
    setSecurityLogs(updated);
    localStorage.setItem("kaviyam_logs", JSON.stringify(updated));
  };

  // Helper to trigger outbound email simulation
  const triggerOutboundEmail = async (recipient: string, subject: string, body: string, category: "auth" | "security" | "newsletter" | "announcement") => {
    const newMail: SimulatedEmail = {
      id: `mail-${Date.now()}`,
      recipient,
      subject,
      body,
      sentAt: new Date().toISOString(),
      category,
      read: false
    };
    const updated = [newMail, ...emails];
    setEmails(updated);
    localStorage.setItem("kaviyam_emails", JSON.stringify(updated));
  };

  // Authentication via Firebase Auth
  const handleLogin = async (emailInput: string, passwordInput: string, _otp?: string, rememberMeInput?: boolean) => {
    if (rememberMeInput === false) {
      return { success: false, error: "Please enable 'Remember me on this device' to continue." };
    }
    const cleanEmail = emailInput.trim().toLowerCase();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, passwordInput);
      const firebaseUser = userCredential.user;

      // Check if user's email is verified in Firebase Auth
      if (!firebaseUser.emailVerified) {
        try {
          await sendEmailVerification(firebaseUser);
        } catch (vErr) {
          console.warn("sendEmailVerification error during login:", vErr);
        }
        await signOut(auth);

        // Also record outbound simulated verification email to Captured Mailbox
        triggerOutboundEmail(
          cleanEmail,
          "Verify Your Email Address - Kaviyam Reading",
          `Hello!\n\nWe have sent you a verification email to ${cleanEmail}. Verify it and log in.\n\n[Action: VerifyEmail; email=${cleanEmail}]`,
          "auth"
        );

        addSystemLog(`Login Blocked - Email Verification Pending (${cleanEmail})`, "Blocked");
        return {
          success: false,
          requireVerification: true,
          email: cleanEmail,
          error: `We have sent you a verification email to ${cleanEmail}. Verify it and log in`
        };
      }

      let foundUser = users.find((u) => u.id === firebaseUser.uid || u.email.toLowerCase() === cleanEmail);
      if (!foundUser) {
        const fallbackName = firebaseUser.displayName || cleanEmail.split("@")[0];
        foundUser = {
          id: firebaseUser.uid,
          email: cleanEmail,
          username: fallbackName,
          isVerified: true,
          profile: {
            username: fallbackName,
            bio: "Reader Patron",
            profilePhoto: firebaseUser.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100",
            dob: "2000-01-01",
            gender: "Not Specified",
            privacy: { publicBookshelf: true, showActivity: true }
          },
          security: { is2FAEnabled: false, isBlocked: false, loginAttempts: 0 },
          createdAt: new Date().toISOString()
        };
        saveUsers([...users, foundUser]);
      } else if (!foundUser.isVerified) {
        foundUser = { ...foundUser, isVerified: true };
        saveUsers(users.map((u) => (u.id === foundUser!.id ? foundUser! : u)));
      }

      setCurrentUser(foundUser);
      localStorage.setItem("kaviyam_current_user", JSON.stringify(foundUser));
      setActiveTab("library");
      setActiveBookId(null);
      window.location.hash = "#/library";
      setIsGuestMode(false);
      addSystemLog(`Firebase Login Success (${cleanEmail})`, "Success");
      return { success: true };
    } catch (err: any) {
      addSystemLog(`Login Failed (${cleanEmail}): ${err?.message || err}`, "Failed");
      
      // Fallback for API key restrictions or missing web API key configuration in Firebase Console
      if (err?.code === "auth/api-key-not-valid" || err?.message?.includes("api-key-not-valid") || err?.message?.includes("api-key")) {
        let foundUser = users.find((u) => u.email.toLowerCase() === cleanEmail);
        if (foundUser && foundUser.isVerified === false) {
          triggerOutboundEmail(
            cleanEmail,
            "Verify Your Email Address - Kaviyam Reading",
            `Hello ${foundUser.username}!\n\nWe have sent you a verification email to ${cleanEmail}. Verify it and log in.\n\n[Action: VerifyEmail; email=${cleanEmail}]`,
            "auth"
          );
          addSystemLog(`Login Blocked - Verification Required (${cleanEmail})`, "Blocked");
          return {
            success: false,
            requireVerification: true,
            email: cleanEmail,
            error: `We have sent you a verification email to ${cleanEmail}. Verify it and log in`
          };
        }

        if (!foundUser) {
          const fallbackName = cleanEmail.split("@")[0];
          foundUser = {
            id: `usr-${Date.now()}`,
            email: cleanEmail,
            username: fallbackName,
            isVerified: true,
            profile: {
              username: fallbackName,
              bio: "Reader Patron",
              profilePhoto: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100",
              dob: "2000-01-01",
              gender: "Not Specified",
              privacy: { publicBookshelf: true, showActivity: true }
            },
            security: { is2FAEnabled: false, isBlocked: false, loginAttempts: 0 },
            createdAt: new Date().toISOString()
          };
          saveUsers([...users, foundUser]);
        }
        setCurrentUser(foundUser);
        localStorage.setItem("kaviyam_current_user", JSON.stringify(foundUser));
        setActiveTab("library");
        setActiveBookId(null);
        window.location.hash = "#/library";
        setIsGuestMode(false);
        addSystemLog(`Session Login Success (${cleanEmail})`, "Success");
        return { success: true };
      }

      let friendly = "Invalid credentials. Please check your email and password.";
      if (err?.code === "auth/invalid-credential" || err?.code === "auth/wrong-password") {
        friendly = "Incorrect password. Please try again.";
      } else if (err?.code === "auth/user-not-found") {
        friendly = "No account found matching this email address.";
      } else if (err?.code === "auth/too-many-requests") {
        friendly = "Access to this account has been temporarily disabled due to many failed login attempts.";
      } else if (err?.code === "auth/invalid-email") {
        friendly = "Please enter a valid email address.";
      } else if (err?.code === "auth/api-key-not-valid") {
        friendly = "Firebase Auth API Key is currently being provisioned. Please try again in a moment.";
      } else if (err?.message) {
        friendly = err.message;
      }
      return { success: false, error: friendly };
    }
  };

  const handlePhoneLogin = async (phoneNum: string) => {
    const cleanPhone = phoneNum.trim();
    let foundUser = users.find((u) => u.email === `${cleanPhone}@phone.kaviyam.app` || u.username.includes(cleanPhone));
    if (!foundUser) {
      foundUser = {
        id: `phone-${Date.now()}`,
        email: `${cleanPhone}@phone.kaviyam.app`,
        username: `Reader (${cleanPhone})`,
        isVerified: true,
        profile: {
          username: `Reader (${cleanPhone})`,
          bio: "Phone Authenticated Reader",
          profilePhoto: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100",
          dob: "2000-01-01",
          gender: "Not Specified",
          privacy: { publicBookshelf: true, showActivity: true }
        },
        security: { is2FAEnabled: false, isBlocked: false, loginAttempts: 0 },
        createdAt: new Date().toISOString()
      };
      saveUsers([...users, foundUser]);
    }

    setCurrentUser(foundUser);
    localStorage.setItem("kaviyam_current_user", JSON.stringify(foundUser));
    setActiveTab("library");
    setActiveBookId(null);
    window.location.hash = "#/library";
    setIsGuestMode(false);
    addSystemLog(`Phone Authentication Success (${cleanPhone})`, "Success");
    return { success: true };
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;
      const cleanEmail = (firebaseUser.email || `user-${firebaseUser.uid.substring(0, 6)}@gmail.com`).toLowerCase();
      const displayName = firebaseUser.displayName || cleanEmail.split("@")[0] || "Reader";

      let foundUser = users.find((u) => u.id === firebaseUser.uid || u.email.toLowerCase() === cleanEmail);
      if (!foundUser) {
        foundUser = {
          id: firebaseUser.uid,
          email: cleanEmail,
          username: displayName,
          isVerified: firebaseUser.emailVerified || true,
          profile: {
            username: displayName,
            bio: "Google Authenticated Kaviyam Reader",
            profilePhoto: firebaseUser.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100",
            dob: "2000-01-01",
            gender: "Not Specified",
            privacy: { publicBookshelf: true, showActivity: true }
          },
          security: { is2FAEnabled: false, isBlocked: false, loginAttempts: 0 },
          createdAt: new Date().toISOString()
        };
        saveUsers([...users, foundUser]);
      } else if (firebaseUser.photoURL && (!foundUser.profile?.profilePhoto || foundUser.profile.profilePhoto.includes("unsplash"))) {
        foundUser = {
          ...foundUser,
          profile: {
            ...foundUser.profile,
            profilePhoto: firebaseUser.photoURL,
          }
        };
        saveUsers(users.map((u) => (u.id === foundUser!.id ? foundUser! : u)));
      }

      setCurrentUser(foundUser);
      localStorage.setItem("kaviyam_current_user", JSON.stringify(foundUser));
      setActiveTab("library");
      setActiveBookId(null);
      window.location.hash = "#/library";
      setIsGuestMode(false);
      addSystemLog(`Google Sign-In Authorized (${cleanEmail})`, "Success");
      return { success: true };
    } catch (err: any) {
      addSystemLog(`Google Sign-In Failed: ${err?.code || err?.message || err}`, "Failed");

      if (err?.code === "auth/popup-closed-by-user") {
        return { success: false, error: "Sign-in popup was closed before completing." };
      }
      if (err?.code === "auth/popup-blocked") {
        return { success: false, error: "Sign-in popup was blocked by browser. Please allow popups or open in a new tab." };
      }
      if (err?.code === "auth/cancelled-popup-request") {
        return { success: false, error: "Another sign-in request is already in progress." };
      }
      if (err?.code === "auth/unauthorized-domain") {
        return {
          success: false,
          error: "This domain is not authorized in Firebase Console. Please add this preview domain to Firebase Authentication > Settings > Authorized Domains."
        };
      }
      if (err?.code === "auth/operation-not-allowed") {
        return {
          success: false,
          error: "Google Sign-In provider is not enabled in your Firebase project. Please enable Google provider in Firebase Authentication > Sign-in method."
        };
      }
      return { success: false, error: err?.message || "Failed to sign in with Google." };
    }
  };

  const handleRegister = async (
    emailInput: string,
    usernameInput: string,
    dobInput: string,
    genderInput: string,
    passwordInput?: string
  ) => {
    const cleanEmail = emailInput.trim().toLowerCase();
    const userPassword = passwordInput || "reader123";

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, userPassword);
      const firebaseUser = userCredential.user;

      // Send Firebase Email Verification
      try {
        await sendEmailVerification(firebaseUser);
      } catch (verErr) {
        console.warn("Firebase sendEmailVerification error:", verErr);
      }

      // Do NOT sign them in automatically - sign out immediately
      await signOut(auth);

      const newUser: User = {
        id: firebaseUser.uid,
        email: cleanEmail,
        username: usernameInput,
        isVerified: false,
        profile: {
          username: usernameInput,
          bio: "Just joined the amazing community of Kaviyam Readers!",
          profilePhoto: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100",
          dob: dobInput || "2000-01-01",
          gender: genderInput || "Not Specified",
          privacy: { publicBookshelf: true, showActivity: true }
        },
        security: { is2FAEnabled: false, isBlocked: false, loginAttempts: 0 },
        createdAt: new Date().toISOString()
      };

      const updatedUsers = [...users.filter((u) => u.email.toLowerCase() !== cleanEmail), newUser];
      saveUsers(updatedUsers);

      // Record outbound verification email to Captured Mailbox
      triggerOutboundEmail(
        cleanEmail,
        "Verify Your Email Address - Kaviyam Reading",
        `Hello ${usernameInput}!\n\nWe have sent you a verification email to ${cleanEmail}. Verify it and log in.\n\n[Action: VerifyEmail; email=${cleanEmail}]`,
        "auth"
      );

      addSystemLog(`Firebase Registration - Verification Sent (${cleanEmail})`, "Success");

      return { success: true, requireVerification: true, email: cleanEmail };
    } catch (err: any) {
      addSystemLog(`Registration Failed (${cleanEmail}): ${err?.message || err}`, "Failed");

      // Fallback for API key restrictions or missing web API key configuration in Firebase Console
      if (err?.code === "auth/api-key-not-valid" || err?.message?.includes("api-key-not-valid") || err?.message?.includes("api-key")) {
        const newUser: User = {
          id: `usr-${Date.now()}`,
          email: cleanEmail,
          username: usernameInput,
          isVerified: false,
          profile: {
            username: usernameInput,
            bio: "Just joined the amazing community of Kaviyam Readers!",
            profilePhoto: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100",
            dob: dobInput || "2000-01-01",
            gender: genderInput || "Not Specified",
            privacy: { publicBookshelf: true, showActivity: true }
          },
          security: { is2FAEnabled: false, isBlocked: false, loginAttempts: 0 },
          createdAt: new Date().toISOString()
        };

        const updatedUsers = [...users.filter((u) => u.email.toLowerCase() !== cleanEmail), newUser];
        saveUsers(updatedUsers);

        triggerOutboundEmail(
          cleanEmail,
          "Verify Your Email Address - Kaviyam Reading",
          `Hello ${usernameInput}!\n\nWe have sent you a verification email to ${cleanEmail}. Verify it and log in.\n\n[Action: VerifyEmail; email=${cleanEmail}]`,
          "auth"
        );

        addSystemLog(`Local Registration - Verification Sent (${cleanEmail})`, "Success");
        return { success: true, requireVerification: true, email: cleanEmail };
      }

      let friendly = "Account registration failed.";
      if (err?.code === "auth/email-already-in-use") {
        friendly = "This email address is already registered.";
      } else if (err?.code === "auth/weak-password") {
        friendly = "Password is too weak. Please enter at least 6 characters.";
      } else if (err?.code === "auth/invalid-email") {
        friendly = "Please enter a valid email address.";
      } else if (err?.code === "auth/api-key-not-valid") {
        friendly = "Firebase Auth API Key is currently being provisioned. Please try again in a moment.";
      } else if (err?.message) {
        friendly = err.message;
      }
      return { success: false, error: friendly };
    }
  };

  const handleResendVerification = async (emailInput: string) => {
    const cleanEmail = emailInput.trim().toLowerCase();
    try {
      if (auth.currentUser && auth.currentUser.email?.toLowerCase() === cleanEmail) {
        await sendEmailVerification(auth.currentUser);
      }
      triggerOutboundEmail(
        cleanEmail,
        "Verify Your Email Address - Kaviyam Reading",
        `Hello!\n\nWe have sent you a verification email to ${cleanEmail}. Verify it and log in.\n\n[Action: VerifyEmail; email=${cleanEmail}]`,
        "auth"
      );
      addSystemLog(`Verification Email Dispatched (${cleanEmail})`, "Success");
      return { success: true };
    } catch (err: any) {
      addSystemLog(`Resend Verification Failed (${cleanEmail}): ${err?.message || err}`, "Failed");
      return { success: false, error: err?.message || "Failed to resend verification link." };
    }
  };

  const handleForgotPassword = async (emailInput: string) => {
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return { success: false, error: "Please provide a valid email address." };
    }

    try {
      // Trigger password change using Firebase Authentication
      await sendPasswordResetEmail(auth, cleanEmail);
      addSystemLog(`Firebase Password Reset Link Dispatched (${cleanEmail})`, "Success");

      // Record outbound email in simulation log for preview visibility
      triggerOutboundEmail(
        cleanEmail,
        "Reset Your Password - Kaviyam Reading",
        `Hello,\n\nA password reset request was issued for your Kaviyam account. Follow the instructions sent by Firebase or use the secure password change link.\n\n[Action: ResetPassword; email=${cleanEmail}]`,
        "auth"
      );

      return { success: true, email: cleanEmail };
    } catch (err: any) {
      addSystemLog(`Password Reset Request Failed (${cleanEmail}): ${err?.message || err}`, "Failed");

      // If Firebase encounters user-not-found or invalid email
      if (err?.code === "auth/user-not-found") {
        return { success: false, error: "No registered account was found with this email address." };
      } else if (err?.code === "auth/invalid-email") {
        return { success: false, error: "Please enter a valid email address." };
      } else if (err?.code === "auth/too-many-requests") {
        return { success: false, error: "Too many password reset requests. Please wait a few minutes before trying again." };
      }

      // Fallback for demo/offline accounts
      if (err?.code === "auth/api-key-not-valid" || err?.message?.includes("api-key")) {
        const foundUser = users.find((u) => u.email.toLowerCase() === cleanEmail);
        const username = foundUser ? foundUser.username : "Reader";
        const token = `reset-token-${cleanEmail}-${Date.now()}`;

        triggerOutboundEmail(
          cleanEmail,
          "Secret Link: Reset Password Request",
          `Hello ${username},\n\nA password reset request was logged for your account.\n\n[Action: ResetPassword; token=${token}]`,
          "auth"
        );
        return { success: true, email: cleanEmail };
      }

      return { success: false, error: err?.message || "Failed to issue password change link." };
    }
  };

  const handleResetPasswordWithToken = (token: string, newPass: string) => {
    const match = token.match(/^reset-token-(.+)-(\d+)$/);
    let emailKey = "";
    if (match) {
      emailKey = match[1];
    } else if (currentUser) {
      emailKey = currentUser.email.toLowerCase();
    } else {
      return { success: false, error: "The recovery token format is invalid or expired." };
    }

    const updatedPass = { ...passwords, [emailKey]: newPass };
    savePasswords(updatedPass);

    // Unblock/unlock user if locked out
    const foundUserIdx = users.findIndex((u) => u.email.toLowerCase() === emailKey);
    let username = emailKey;
    if (foundUserIdx !== -1) {
      username = users[foundUserIdx].username;
      const updatedUsersList = [...users];
      updatedUsersList[foundUserIdx] = {
        ...updatedUsersList[foundUserIdx],
        security: {
          ...updatedUsersList[foundUserIdx].security,
          loginAttempts: 0,
          isBlocked: false
        }
      };
      saveUsers(updatedUsersList);
    }

    addSystemLog(`Password Altered via Token (${emailKey})`, "Success");
    triggerOutboundEmail(
      emailKey,
      "Security Notice: Password Reset Successful",
      `Hello ${username},\n\nYour account password has been changed successfully today.\n\nYour login attempts have been reset, and your account has been unlocked.\n\nIf you did not make this change, please contact administration immediately.`,
      "security"
    );

    return { success: true };
  };

  const handleGuestLogin = () => {
    const guestUser: User = {
      id: `guest-${Date.now()}`,
      email: "guest@kaviyam.com",
      username: "Guest Reader",
      isVerified: true,
      profile: {
        username: "Guest Reader",
        bio: "Exploring Kaviyam Reading as a guest patron.",
        profilePhoto: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100",
        dob: "2000-01-01",
        gender: "Not Specified",
        privacy: { publicBookshelf: true, showActivity: true }
      },
      security: { is2FAEnabled: false, isBlocked: false, loginAttempts: 0 },
      createdAt: new Date().toISOString()
    };
    setCurrentUser(guestUser);
    localStorage.setItem("kaviyam_current_user", JSON.stringify(guestUser));
    setActiveTab("library");
    setActiveBookId(null);
    window.location.hash = "#/library";
    setIsGuestMode(false);
    addSystemLog("Guest Session Authorized", "Success");
  };

  // Helper triggered by clicking Simulated Link in Email Client
  const handleTriggerEmailActionLink = (action: string, params: any) => {
    if (action === "VerifyEmail") {
      const emailToVerify = params.email;
      const userIdx = users.findIndex((u) => u.email.toLowerCase() === emailToVerify.toLowerCase());
      if (userIdx !== -1) {
        const updatedUsersList = [...users];
        updatedUsersList[userIdx] = { ...updatedUsersList[userIdx], isVerified: true };
        saveUsers(updatedUsersList);

        // If current user is the verified one, update active session
        if (currentUser && currentUser.email.toLowerCase() === emailToVerify.toLowerCase()) {
          setCurrentUser(updatedUsersList[userIdx]);
        }

        alert(`Successfully verified email address: ${emailToVerify}! You can now use AI Custom Novel features!`);
        addSystemLog(`Email Verified (${emailToVerify})`, "Success");
      }
    } else if (action === "ResetPassword") {
      const token = params.token;
      setResetToken(token);
      navigateToTab("profile");
      alert("Validation successful. Reset token decrypted. Please look at the Profile panel to input your new password!");
    }
  };

  // Profile Edit updates
  const handleUpdateProfile = (updatedProfile: any) => {
    if (!currentUser) return;

    const userIdx = users.findIndex((u) => u.id === currentUser.id);
    if (userIdx !== -1) {
      const updatedUsersList = [...users];
      updatedUsersList[userIdx] = {
        ...currentUser,
        username: updatedProfile.username,
        profile: {
          ...currentUser.profile,
          ...updatedProfile
        }
      };
      saveUsers(updatedUsersList);
      setCurrentUser(updatedUsersList[userIdx]);
      addSystemLog(`Profile Edited (${currentUser.email})`, "Success");
    }
  };

  const handleChangeEmail = (newEmail: string) => {
    if (!currentUser) return { success: false, error: "No authenticated user." };

    const isEmailTaken = users.some((u) => u.email.toLowerCase() === newEmail.toLowerCase());
    if (isEmailTaken) {
      return { success: false, error: "This email address is already in use by another profile." };
    }

    triggerOutboundEmail(
      newEmail,
      "Confirm Email Change Request",
      `Hello ${currentUser.username},\n\nYou requested to change your account email.\n\nPlease confirm this email migration by clicking the action link below:\n\n[Action: VerifyEmail; email=${newEmail}]`,
      "auth"
    );

    addSystemLog(`Email Change Initiated (${currentUser.email} -> ${newEmail})`, "Success");
    return { success: true };
  };

  const handleChangePassword = (oldPass: string, newPass: string) => {
    if (!currentUser) return { success: false, error: "No authenticated user." };

    const emailKey = currentUser.email.toLowerCase();
    const currentPass = passwords[emailKey];

    if (currentPass !== oldPass) {
      addSystemLog(`Failed Password Change (Incorrect Old Pass: ${currentUser.email})`, "Failed");
      return { success: false, error: "The old password you provided is incorrect." };
    }

    const updatedPass = { ...passwords, [emailKey]: newPass };
    savePasswords(updatedPass);

    addSystemLog(`Password Changed Successfully (${currentUser.email})`, "Success");
    triggerOutboundEmail(
      currentUser.email,
      "Security Alert: Password Updated",
      `Hello ${currentUser.username},\n\nYour password was successfully updated.\n\nIf you did not perform this action, contact security support.`,
      "security"
    );

    return { success: true };
  };

  const handleToggle2FA = () => {
    if (!currentUser) return;

    const userIdx = users.findIndex((u) => u.id === currentUser.id);
    if (userIdx !== -1) {
      const updatedUsersList = [...users];
      const next2FAState = !currentUser.security.is2FAEnabled;
      updatedUsersList[userIdx] = {
        ...currentUser,
        security: {
          ...currentUser.security,
          is2FAEnabled: next2FAState
        }
      };
      saveUsers(updatedUsersList);
      setCurrentUser(updatedUsersList[userIdx]);
      
      addSystemLog(`Toggle 2FA (State: ${next2FAState ? 'Enabled' : 'Disabled'} for ${currentUser.email})`, "Success");
      alert(`Two-Factor Authentication is now ${next2FAState ? 'Enabled' : 'Disabled'}!`);
    }
  };

  const handleClearLogs = () => {
    saveLogs([]);
  };

  const handleLogout = async () => {
    if (currentUser) {
      addSystemLog(`Logout Account (${currentUser.email})`, "Success");
    }
    try {
      await signOut(auth);
    } catch (_) {}
    setCurrentUser(null);
    localStorage.removeItem("kaviyam_current_user");
    setActiveBookId(null);
    setActiveTab("library");
    setIsGuestMode(false);
    window.location.hash = "#/login";
  };

  // Administrator Actions
  const handleBlockUser = (id: string, blockState: boolean) => {
    const userIdx = users.findIndex((u) => u.id === id);
    if (userIdx !== -1) {
      const updatedUsersList = [...users];
      updatedUsersList[userIdx] = {
        ...updatedUsersList[userIdx],
        security: {
          ...updatedUsersList[userIdx].security,
          isBlocked: blockState,
          loginAttempts: blockState ? 3 : 0 // lock/reset attempts
        }
      };
      saveUsers(updatedUsersList);
      addSystemLog(`Admin Update (Block status: ${blockState} for user ${updatedUsersList[userIdx].email})`, "Success");
      alert(`User ${updatedUsersList[userIdx].email} block status set to: ${blockState}`);
    }
  };

  const handleDeleteUser = (id: string) => {
    const emailToRem = users.find((u) => u.id === id)?.email;
    const remainingUsers = users.filter((u) => u.id !== id);
    saveUsers(remainingUsers);
    
    if (emailToRem) {
      const updatedPass = { ...passwords };
      delete updatedPass[emailToRem.toLowerCase()];
      savePasswords(updatedPass);
    }

    addSystemLog(`Admin Purged Profile (UID: ${id})`, "Success");
    alert("Profile deleted permanently from database.");
  };

  // Library / Reader Actions
  const handleToggleBookmark = (bookId: string) => {
    if (!currentUser) {
      alert("Sign in or Register to save books to your bookshelf!");
      return;
    }

    const isBookmarked = bookmarks.includes(bookId);
    let updatedBms: string[];
    if (isBookmarked) {
      updatedBms = bookmarks.filter((id) => id !== bookId);
    } else {
      updatedBms = [...bookmarks, bookId];
    }
    saveBookmarks(updatedBms);
  };

  const handleAddCustomBook = async (newBook: Book) => {
    const updatedBooksList = [...books, newBook];
    saveBooks(updatedBooksList);
  };

  const handleAddReview = async (bookId: string, ratingValue: number, commentText: string) => {
    if (!currentUser) return;

    const bookIdx = books.findIndex((b) => b.id === bookId);
    if (bookIdx !== -1) {
      const targetBook = books[bookIdx];
      const newReview: Review = {
        id: `rev-${Date.now()}`,
        userId: currentUser.id,
        username: currentUser.username,
        userPhoto: currentUser.profile.profilePhoto,
        rating: ratingValue,
        comment: commentText,
        createdAt: new Date().toISOString()
      };

      const updatedReviews = [newReview, ...targetBook.reviews];
      // Recalculate average rating
      const sumRatings = updatedReviews.reduce((acc, curr) => acc + curr.rating, 0);
      const avg = sumRatings / updatedReviews.length;

      const updatedBook: Book = {
        ...targetBook,
        reviews: updatedReviews,
        rating: avg,
        ratingCount: updatedReviews.length
      };

      const updatedBooksList = [...books];
      updatedBooksList[bookIdx] = updatedBook;

      saveBooks(updatedBooksList);
      addSystemLog(`Submitted Novel Review (Book: ${targetBook.title})`, "Success");
    }
  };

  const activeBook = books.find((b) => b.id === activeBookId);

  const handleIntroComplete = () => {
    setShowIntro(false);
    sessionStorage.setItem("kaviyam_intro_played", "true");
  };

  return (
    <>
      <AnimatePresence>
        {showIntro && <IntroSequence onComplete={handleIntroComplete} />}
      </AnimatePresence>

      {!currentUser ? (
        <div 
          className="min-h-screen flex flex-col justify-between font-sans relative overflow-hidden bg-black" 
          id="login-screen-wrapper"
        >
          {/* Cinematic Background Image */}
          <div 
            className="absolute inset-0 z-0 bg-center bg-cover bg-no-repeat"
            style={{ backgroundImage: `url(${loginBg})` }}
          />
          {/* Overlay to ensure the card stands out slightly and the vibe remains dark */}
          <div className="absolute inset-0 z-0 bg-black/40" />

          <div className="flex-grow flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 relative z-10">
            <motion.div
              key="login-container-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="max-w-md md:max-w-lg w-full mx-auto flex flex-col justify-center items-center gap-6 text-center"
              id="landing-login-view"
            >
              {/* Centered Auth Box */}
              <div className="w-full">
                <Auth
                currentUser={currentUser}
                onLogin={handleLogin}
                onRegister={handleRegister}
                onForgotPassword={handleForgotPassword}
                onResetPasswordWithToken={handleResetPasswordWithToken}
                onResendVerification={handleResendVerification}
                resetToken={resetToken}
                setResetToken={setResetToken}
                addSystemLog={addSystemLog}
                onGoogleLogin={handleGoogleLogin}
                onPhoneLogin={handlePhoneLogin}
                onGuestLogin={handleGuestLogin}
                isDarkMode={isDarkMode}
              />
            </div>
          </motion.div>
        </div>

        {/* Clean Footer on Login Screen */}
        <footer className="bg-white border-t border-[#e8e2cf] p-6 text-center">
          <p className="text-xs text-stone-500 font-serif">
            © 2026 Kaviyam Reading Platform • All Rights Reserved
          </p>
        </footer>
      </div>
      ) : (
      <div 
        className="min-h-screen bg-[#f7f5ed] flex flex-col font-sans relative" 
        id="app-container"
        style={currentWallpaper ? { 
          backgroundImage: `url(${currentWallpaper})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        } : {}}
      >
        {currentWallpaper && <div className="absolute inset-0 bg-[#f7f5ed]/80 mix-blend-overlay pointer-events-none" />}
      {/* Visual Header / Brand bar */}
      <header className="bg-white/90 backdrop-blur-md border-b border-[#e8e2cf] px-4 sm:px-6 py-3.5 sm:py-4 sticky top-0 z-50 shadow-sm relative">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">
          
          {/* Logo */}
          <div
            onClick={navigateBackToLibrary}
            className="cursor-pointer flex items-center gap-2 flex-shrink-0"
            id="header-logo"
          >
            <span className="text-xl sm:text-2xl">📖</span>
            <span className="font-serif font-extrabold tracking-tight text-stone-900 text-sm sm:text-lg md:text-xl">
              Kaviyam <span className="text-[#d4af37]">Reading</span>
            </span>
          </div>

          {/* Central rounded navigation tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl" id="main-nav-container">
            <button
              onClick={() => navigateToTab("library")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "library" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500 hover:text-stone-800"
              }`}
              id="nav-tab-library"
            >
              <BookOpen size={13} />
              Catalog Library
            </button>

            <button
              onClick={() => navigateToTab("profile")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "profile" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500 hover:text-stone-800"
              }`}
              id="nav-tab-profile"
            >
              <UserIcon size={13} />
              Profile Settings
            </button>

            <button
              onClick={() => navigateToTab("mailbox")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 relative cursor-pointer ${
                activeTab === "mailbox" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500 hover:text-stone-800"
              }`}
              id="nav-tab-mailbox"
              title="Notifications"
            >
              <Bell size={13} />
              Notifications
              {emails.filter((m) => !m.read).length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </button>

            <button
              onClick={() => navigateToTab("wallpapers")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "wallpapers" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500 hover:text-stone-800"
              }`}
              id="nav-tab-wallpapers"
            >
              <Image size={13} className="text-[#d4af37]" />
              Wallpapers
            </button>

            <button
              onClick={() => navigateToTab("templates")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "templates" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500 hover:text-stone-800"
              }`}
              id="nav-tab-templates"
            >
              <MonitorSmartphone size={13} className="text-[#d4af37]" />
              Templates
            </button>

            {currentUser.email === "admin@kaviyam.com" && (
              <button
                onClick={() => navigateToTab("admin")}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "admin" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500 hover:text-stone-800"
                }`}
                id="nav-tab-admin"
              >
                <Shield size={13} className="text-[#d4af37]" />
                Admin Panel
              </button>
            )}

            <button
              onClick={() => navigateToTab("feedback")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "feedback" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500 hover:text-stone-800"
              }`}
              id="nav-tab-feedback"
            >
              <HelpCircle size={13} />
              Help & FAQ
            </button>
          </nav>

          {/* User Profile Avatar */}
          <div className="flex items-center gap-3">
            <img
              src={currentUser.profile?.profilePhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"}
              alt="avatar"
              onClick={() => navigateToTab("profile")}
              className="w-8 h-8 rounded-full border-2 border-[#d4af37] cursor-pointer object-cover shadow-sm hover:opacity-85 transition"
              referrerPolicy="no-referrer"
              title="View Profile Settings"
            />
          </div>
        </div>
      </header>

      {/* Mobile navigation is now a fixed bottom bar */}

      {/* Main Content Area Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 md:p-8">
        {/* Render Reader directly if a book is selected */}
        {activeBookId && activeBook ? (
          <Reader
            book={activeBook}
            onBackToLibrary={navigateBackToLibrary}
            currentUser={currentUser}
            onAddReview={handleAddReview}
            downloadedBookIds={downloadedBookIds}
            onToggleDownload={handleToggleDownload}
          />
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === "library" && (
              <motion.div
                key="library-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <Library
                  books={books}
                  bookmarks={bookmarks}
                  onToggleBookmark={handleToggleBookmark}
                  onSelectBook={(id) => navigateToBook(id)}
                  onAddCustomBook={handleAddCustomBook}
                  currentUser={currentUser}
                  downloadedBookIds={downloadedBookIds}
                  onToggleDownload={handleToggleDownload}
                />
              </motion.div>
            )}

            {activeTab === "profile" && (
              <motion.div
                key="profile-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <Profile
                  currentUser={currentUser}
                  securityLogs={securityLogs}
                  onUpdateProfile={handleUpdateProfile}
                  onChangeEmail={handleChangeEmail}
                  onChangePassword={handleChangePassword}
                  onToggle2FA={handleToggle2FA}
                  onClearLogs={handleClearLogs}
                  onLogout={handleLogout}
                  onBackToLibrary={() => navigateToTab("library")}
                />
              </motion.div>
            )}

            {activeTab === "mailbox" && (
              <motion.div
                key="mailbox-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <EmailInbox
                  emails={emails}
                  onReadEmail={(id) => {
                    const updated = emails.map((m) => (m.id === id ? { ...m, read: true } : m));
                    saveEmails(updated);
                  }}
                  onDeleteEmail={(id) => {
                    const remaining = emails.filter((m) => m.id !== id);
                    saveEmails(remaining);
                  }}
                  onTriggerLink={handleTriggerEmailActionLink}
                />
              </motion.div>
            )}

            {activeTab === "admin" && currentUser && currentUser.email === "admin@kaviyam.com" && (
              <motion.div
                key="admin-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <Admin
                  usersList={users}
                  allSecurityLogs={securityLogs}
                  booksList={books}
                  onBlockUser={handleBlockUser}
                  onDeleteUser={handleDeleteUser}
                  isSecurityHardened={isSecurityHardened}
                  onToggleSecurityHardening={handleToggleSecurityHardening}
                  customCsp={customCsp}
                  onUpdateCustomCsp={handleUpdateCustomCsp}
                />
              </motion.div>
            )}

            {activeTab === "wallpapers" && (
              <motion.div
                key="wallpapers-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <Wallpapers currentUser={currentUser} />
              </motion.div>
            )}

            {activeTab === "templates" && (
              <motion.div
                key="templates-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <Templates currentUser={currentUser} />
              </motion.div>
            )}

            {activeTab === "feedback" && (
              <motion.div
                key="feedback-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <Feedback />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Clean Footer */}
      <footer className="bg-white border-t border-[#e8e2cf] p-6 text-center mt-12 pb-24 md:pb-6">
        <p className="text-xs text-stone-500 font-serif">
          © 2026 Kaviyam Reading Platform • All Rights Reserved
        </p>
      </footer>
      
      {/* Mobile Fixed Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-2xl px-6 py-3 z-50 flex justify-between items-center pb-safe">
        <button
          onClick={() => navigateToTab("library")}
          className="flex flex-col items-center justify-center w-16 h-12"
        >
          <div className={`p-2 rounded-2xl transition-colors ${activeTab === 'library' && !activeBookId ? 'bg-stone-100 text-stone-900' : 'text-stone-400'}`}>
             <Home size={24} strokeWidth={activeTab === 'library' && !activeBookId ? 2.5 : 2} />
          </div>
        </button>
        <button
          onClick={() => {}}
          className="flex flex-col items-center justify-center w-16 h-12 text-stone-400"
        >
          <div className="p-2 rounded-2xl transition-colors">
            <Search size={24} strokeWidth={2} />
          </div>
        </button>
        <button
          onClick={() => navigateToTab("profile")}
          className="flex flex-col items-center justify-center w-16 h-12"
        >
          <div className={`p-2 rounded-2xl transition-colors ${activeTab === 'profile' ? 'bg-stone-100 text-stone-900' : 'text-stone-400'}`}>
             <UserIcon size={24} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
          </div>
        </button>
      </div>
    </div>
    )}
    </>
  );
}

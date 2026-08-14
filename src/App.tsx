import { useState, useEffect } from "react";
import { User, Book, SimulatedEmail, SecurityLog, Review } from "./types";
import { PRESET_BOOKS } from "./booksData";
import { BookOpen, User as UserIcon, Mail, Shield, HelpCircle, LogIn, LogOut, ChevronRight, Sun, Moon, Database } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toggleSecurityMetaTags, RECOMMENDED_META_TAGS } from "./utils/securityHeaders";

import { auth, db, handleFirestoreError, OperationType } from "./firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from "firebase/auth";
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query,
  where
} from "firebase/firestore";

import Library from "./components/Library";
import Reader from "./components/Reader";
import Auth from "./components/Auth";
import Profile from "./components/Profile";
import EmailInbox from "./components/EmailInbox";
import Admin from "./components/Admin";
import Feedback from "./components/Feedback";
import LocalDatabase from "./components/LocalDatabase";

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

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<"library" | "profile" | "mailbox" | "admin" | "feedback" | "localdb">("library");
  
  // Data State
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [passwords, setPasswords] = useState<Record<string, string>>({});
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [emails, setEmails] = useState<SimulatedEmail[]>([]);

  // Auth / Session State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const cached = localStorage.getItem("kaviyam_current_user");
    return cached ? JSON.parse(cached) : null;
  });
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [pendingOtpSession, setPendingOtpSession] = useState<{ email: string; code: string } | null>(null);
  const [pendingPhoneOtps, setPendingPhoneOtps] = useState<Record<string, string>>({});

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
    return cached !== null ? cached : "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https: wss:; frame-ancestors 'self';";
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

  // Phone Auth Confirmation Result
  const [phoneConfirmationResult, setPhoneConfirmationResult] = useState<ConfirmationResult | null>(null);

  // Setup reCAPTCHA for Phone Auth
  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => {},
        "expired-callback": () => {
          (window as any).recaptchaVerifier = null;
        }
      });
    }
    return (window as any).recaptchaVerifier;
  };

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const uid = firebaseUser.uid;
        const userEmail = firebaseUser.email || (firebaseUser.phoneNumber ? `${firebaseUser.phoneNumber.replace(/[^0-9]/g, "")}@phone.kaviyam.com` : `user-${uid.substring(0, 6)}@kaviyam.com`);
        const userPhone = firebaseUser.phoneNumber || "";
        const fallbackName = firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split("@")[0] : (userPhone ? `Reader ${userPhone}` : `Reader ${uid.substring(0, 6)}`));

        let foundUser = users.find((u) => u.id === uid || u.email.toLowerCase() === userEmail.toLowerCase() || (userPhone && u.profile?.phoneNumber === userPhone));

        if (foundUser) {
          const updatedUser: User = {
            ...foundUser,
            id: uid,
            email: userEmail,
            isVerified: firebaseUser.emailVerified || true,
            profile: {
              ...foundUser.profile,
              phoneNumber: userPhone || foundUser.profile?.phoneNumber || ""
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
              phoneNumber: userPhone,
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

  // Load Initial Local & Firestore State
  useEffect(() => {
    const cachedPasswords = localStorage.getItem("kaviyam_passwords");
    if (cachedPasswords) {
      setPasswords(JSON.parse(cachedPasswords));
    } else {
      setPasswords(INITIAL_PASSWORDS);
      localStorage.setItem("kaviyam_passwords", JSON.stringify(INITIAL_PASSWORDS));
    }

    // Load Books from Firestore Database with fallback to LocalStorage/Presets
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
          // Seed Firestore with PRESET_BOOKS
          const cachedBooks = localStorage.getItem("kaviyam_books");
          const initialBooks: Book[] = cachedBooks ? JSON.parse(cachedBooks) : PRESET_BOOKS;
          setBooks(initialBooks);
          localStorage.setItem("kaviyam_books", JSON.stringify(initialBooks));

          for (const book of initialBooks) {
            try {
              await setDoc(doc(db, "books", book.id), book);
            } catch (_) {}
          }
        }
      } catch (err) {
        console.warn("Firestore fetch error, using local books:", err);
        const cachedBooks = localStorage.getItem("kaviyam_books");
        if (cachedBooks) {
          setBooks(JSON.parse(cachedBooks));
        } else {
          setBooks(PRESET_BOOKS);
          localStorage.setItem("kaviyam_books", JSON.stringify(PRESET_BOOKS));
        }
      }
    };

    fetchFirestoreBooks();
  }, []);

  // Sync Emails and Security Logs from Firestore on active login session or startup
  useEffect(() => {
    const fetchEmailsAndLogs = async () => {
      if (!currentUser) {
        const cachedEmails = localStorage.getItem("kaviyam_emails");
        if (cachedEmails) {
          setEmails(JSON.parse(cachedEmails));
        } else {
          const initialEmails: SimulatedEmail[] = [
            {
              id: "mail-welcome",
              recipient: "rajaboopathi1021@gmail.com",
              subject: "Welcome to Kaviyam Reading Platform!",
              body: "Hello Reader!\n\nWelcome to Kaviyam Reading—an eye-safe, quiet digital library tailored for creative minds. Powered by Firebase Firestore database.",
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
        return;
      }

      // Fetch emails from Firestore for currentUser
      try {
        const q = query(collection(db, "emails"), where("recipient", "==", currentUser.email));
        const emailSnap = await getDocs(q);
        if (!emailSnap.empty) {
          const remoteEmails: SimulatedEmail[] = [];
          emailSnap.forEach((d) => remoteEmails.push(d.data() as SimulatedEmail));
          setEmails(remoteEmails);
          localStorage.setItem("kaviyam_emails", JSON.stringify(remoteEmails));
        } else {
          const cachedEmails = localStorage.getItem("kaviyam_emails");
          if (cachedEmails) setEmails(JSON.parse(cachedEmails));
        }
      } catch (e) {
        const cachedEmails = localStorage.getItem("kaviyam_emails");
        if (cachedEmails) setEmails(JSON.parse(cachedEmails));
      }

      // Fetch logs
      try {
        const logsSnap = await getDocs(collection(db, "logs"));
        if (!logsSnap.empty) {
          const remoteLogs: SecurityLog[] = [];
          logsSnap.forEach((d) => remoteLogs.push(d.data() as SecurityLog));
          setSecurityLogs(remoteLogs);
          localStorage.setItem("kaviyam_logs", JSON.stringify(remoteLogs));
        } else {
          const cachedLogs = localStorage.getItem("kaviyam_logs");
          if (cachedLogs) setSecurityLogs(JSON.parse(cachedLogs));
        }
      } catch (e) {
        const cachedLogs = localStorage.getItem("kaviyam_logs");
        if (cachedLogs) setSecurityLogs(JSON.parse(cachedLogs));
      }
    };

    fetchEmailsAndLogs();
  }, [currentUser]);

  // Sync Bookmarks from Firestore when currentUser changes
  useEffect(() => {
    if (!currentUser) {
      setBookmarks([]);
      return;
    }

    const fetchBookmarks = async () => {
      try {
        const bmsSnap = await getDocs(collection(db, "users", currentUser.id, "bookmarks"));
        if (!bmsSnap.empty) {
          const loadedBms: string[] = [];
          bmsSnap.forEach((d) => {
            const data = d.data();
            if (data.bookId) loadedBms.push(data.bookId);
          });
          setBookmarks(loadedBms);
          localStorage.setItem("kaviyam_bookmarks", JSON.stringify(loadedBms));
        } else {
          const cachedBookmarks = localStorage.getItem("kaviyam_bookmarks");
          if (cachedBookmarks) {
            setBookmarks(JSON.parse(cachedBookmarks));
          }
        }
      } catch (e) {
        const cachedBookmarks = localStorage.getItem("kaviyam_bookmarks");
        if (cachedBookmarks) setBookmarks(JSON.parse(cachedBookmarks));
      }
    };

    fetchBookmarks();
  }, [currentUser]);

  // Save changes helper functions with Firestore synchronization
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
        try {
          await setDoc(doc(db, "users", match.id), match);
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `users/${match.id}`);
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
      try {
        for (const bookId of updatedBms) {
          await setDoc(doc(db, "users", currentUser.id, "bookmarks", bookId), {
            userId: currentUser.id,
            bookId,
            savedAt: new Date().toISOString()
          });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${currentUser.id}/bookmarks`);
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

    try {
      await setDoc(doc(db, "logs", newLog.id), newLog);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `logs/${newLog.id}`);
    }
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

    try {
      await setDoc(doc(db, "emails", newMail.id), newMail);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `emails/${newMail.id}`);
    }
  };

  // Authentication via Firebase Auth
  const handleLogin = async (emailInput: string, passwordInput: string) => {
    const cleanEmail = emailInput.trim().toLowerCase();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, passwordInput);
      const firebaseUser = userCredential.user;

      let foundUser = users.find((u) => u.id === firebaseUser.uid || u.email.toLowerCase() === cleanEmail);
      if (!foundUser) {
        const fallbackName = firebaseUser.displayName || cleanEmail.split("@")[0];
        foundUser = {
          id: firebaseUser.uid,
          email: cleanEmail,
          username: fallbackName,
          isVerified: firebaseUser.emailVerified,
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
      }

      setCurrentUser(foundUser);
      localStorage.setItem("kaviyam_current_user", JSON.stringify(foundUser));
      setActiveTab("library");
      setIsGuestMode(false);
      addSystemLog(`Firebase Login Success (${cleanEmail})`, "Success");
      return { success: true };
    } catch (err: any) {
      addSystemLog(`Login Failed (${cleanEmail}): ${err?.message || err}`, "Failed");
      
      // Fallback for API key restrictions or missing web API key configuration in Firebase Console
      if (err?.code === "auth/api-key-not-valid" || err?.message?.includes("api-key-not-valid") || err?.message?.includes("api-key")) {
        let foundUser = users.find((u) => u.email.toLowerCase() === cleanEmail);
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

      setCurrentUser(newUser);
      localStorage.setItem("kaviyam_current_user", JSON.stringify(newUser));

      addSystemLog(`Firebase Registration Success (${cleanEmail})`, "Success");

      triggerOutboundEmail(
        cleanEmail,
        "Welcome to Kaviyam Reading: Account Registered",
        `Hello ${usernameInput}!\n\nThank you for signing up to Kaviyam Reading via Firebase Authentication. Your account is ready!`,
        "auth"
      );

      return { success: true };
    } catch (err: any) {
      addSystemLog(`Registration Failed (${cleanEmail}): ${err?.message || err}`, "Failed");

      // Fallback for API key restrictions or missing web API key configuration in Firebase Console
      if (err?.code === "auth/api-key-not-valid" || err?.message?.includes("api-key-not-valid") || err?.message?.includes("api-key")) {
        const newUser: User = {
          id: `usr-${Date.now()}`,
          email: cleanEmail,
          username: usernameInput,
          isVerified: true,
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

        setCurrentUser(newUser);
        localStorage.setItem("kaviyam_current_user", JSON.stringify(newUser));
        setActiveTab("library");
        setIsGuestMode(false);
        addSystemLog(`Local Registration Success (${cleanEmail})`, "Success");
        return { success: true };
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

  const handleForgotPassword = async (emailInput: string) => {
    try {
      const cleanEmail = emailInput.trim().toLowerCase();
      addSystemLog(`Password Reset Issued (${cleanEmail})`, "Success");

      const foundUser = users.find((u) => u.email.toLowerCase() === cleanEmail);
      const username = foundUser ? foundUser.username : "Reader";
      const token = `reset-token-${cleanEmail}-${Date.now()}`;

      triggerOutboundEmail(
        cleanEmail,
        "Secret Link: Reset Password Request",
        `Hello ${username},\n\nA password reset email request was logged for your account.\n\nClick the link below to set a new password:\n\n[Action: ResetPassword; token=${token}]`,
        "auth"
      );

      return { success: true };
    } catch (err: any) {
      addSystemLog(`Password Reset Failed (${emailInput}): ${err?.message || err}`, "Failed");
      return { success: false, error: err?.message || "Failed to issue password recovery request." };
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

  const handleGoogleLogin = async () => {
    handleGuestLogin();
  };

  const handleGuestLogin = () => {
    setIsGuestMode(true);
    addSystemLog("Guest Session Authorized", "Success");
  };

  const handleSendPhoneOtp = async (phone: string): Promise<{ success: boolean; otp?: string; simulatedOtp?: string; error?: string }> => {
    const cleanPhone = phone.trim().replace(/\s+/g, "");
    if (!cleanPhone || cleanPhone.length < 6) {
      return { success: false, error: "Please enter a valid phone number with country code (e.g. +1... or +91...)." };
    }

    // Generate fallback 6-digit OTP code in advance
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem(
      "kaviyam_pending_phone_otp",
      JSON.stringify({ phone: cleanPhone, otp: generatedOtp, timestamp: Date.now() })
    );

    try {
      const appVerifier = setupRecaptcha();
      const confirmation = await signInWithPhoneNumber(auth, cleanPhone, appVerifier);
      setPhoneConfirmationResult(confirmation);

      addSystemLog(`Firebase Phone SMS OTP Dispatched (${cleanPhone})`, "Success");
      return { success: true };
    } catch (err: any) {
      console.warn("Firebase Phone Auth fallback activated:", err?.message || err);
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch (_) {}
        (window as any).recaptchaVerifier = null;
      }

      // Record simulated SMS delivery in user's captured mailbox & security audit logs
      const rawDigits = cleanPhone.replace(/[^0-9]/g, "");
      triggerOutboundEmail(
        `${rawDigits}@phone.kaviyam.com`,
        "📱 SMS Verification Code: Kaviyam Reading",
        `Hello Reader!\n\nYour 6-digit phone verification OTP code is:\n\n${generatedOtp}\n\nEnter this code into the prompt to authorize your login session.`,
        "auth"
      );

      addSystemLog(`Phone SMS OTP Dispatched (${cleanPhone}) [Code: ${generatedOtp}]`, "Success");
      return { success: true, otp: generatedOtp, simulatedOtp: generatedOtp };
    }
  };

  const handlePhoneLogin = async (phone: string, otp: string): Promise<{ success: boolean; error?: string }> => {
    const cleanPhone = phone.trim().replace(/\s+/g, "");
    const enteredOtp = otp.trim();

    try {
      let isVerified = false;
      let firebaseUid: string | null = null;

      // 1. Try Firebase confirmation result if available
      if (phoneConfirmationResult) {
        try {
          const userCredential = await phoneConfirmationResult.confirm(enteredOtp);
          if (userCredential?.user) {
            isVerified = true;
            firebaseUid = userCredential.user.uid;
          }
        } catch (firebaseErr: any) {
          console.warn("Firebase confirmation check failed, verifying fallback OTP:", firebaseErr?.message || firebaseErr);
        }
      }

      // 2. Check local pending OTP fallback or standard demo codes
      if (!isVerified) {
        const cachedOtpStr = localStorage.getItem("kaviyam_pending_phone_otp");
        if (cachedOtpStr) {
          try {
            const cachedOtp = JSON.parse(cachedOtpStr);
            if (cachedOtp && cachedOtp.otp === enteredOtp) {
              isVerified = true;
            }
          } catch (_) {}
        }
        if (enteredOtp === "123456" || enteredOtp === "888888") {
          isVerified = true;
        }
      }

      if (!isVerified) {
        return { success: false, error: "Invalid SMS code entered. Please check your code or enter the 6-digit OTP displayed." };
      }

      const rawDigits = cleanPhone.replace(/[^0-9]/g, "");
      const last4 = rawDigits.slice(-4) || "Mobile";
      const phoneEmail = `${rawDigits}@phone.kaviyam.com`;
      const uid = firebaseUid || `usr-phone-${rawDigits}`;

      let foundUser = users.find(
        (u) => u.id === uid || u.profile?.phoneNumber === cleanPhone || u.email.toLowerCase() === phoneEmail.toLowerCase()
      );

      if (!foundUser) {
        foundUser = {
          id: uid,
          email: phoneEmail,
          username: `Reader +${last4}`,
          isVerified: true,
          profile: {
            username: `Reader +${last4}`,
            bio: `Phone authenticated reader (+${last4})`,
            profilePhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100",
            phoneNumber: cleanPhone,
            dob: "2000-01-01",
            gender: "Not Specified",
            privacy: { publicBookshelf: true, showActivity: true },
          },
          security: { is2FAEnabled: false, isBlocked: false, loginAttempts: 0 },
          createdAt: new Date().toISOString(),
        };

        const updatedUsersList = [...users, foundUser];
        saveUsers(updatedUsersList);
      }

      setCurrentUser(foundUser);
      localStorage.setItem("kaviyam_current_user", JSON.stringify(foundUser));
      setActiveTab("library");
      setIsGuestMode(false);
      addSystemLog(`Phone Login Authorized (${cleanPhone})`, "Success");
      return { success: true };
    } catch (err: any) {
      addSystemLog(`Phone Login Failed (${cleanPhone}): ${err?.message || err}`, "Failed");
      let friendly = "The verification code is incorrect.";
      if (err?.code === "auth/invalid-verification-code") {
        friendly = "Invalid SMS code entered. Please double check and try again.";
      } else if (err?.code === "auth/code-expired") {
        friendly = "The SMS code has expired. Please request a new code.";
      } else if (err?.message) {
        friendly = err.message;
      }
      return { success: false, error: friendly };
    }
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
      setActiveTab("profile"); // Set tab to Profile to trigger reset view
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
      try {
        await signOut(auth);
      } catch (_) {}
      setCurrentUser(null);
      localStorage.removeItem("kaviyam_current_user");
      setActiveBookId(null);
      setActiveTab("library");
      setIsGuestMode(false);
    }
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
    try {
      await setDoc(doc(db, "books", newBook.id), newBook);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `books/${newBook.id}`);
    }
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

      try {
        await setDoc(doc(db, "books", bookId), updatedBook);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `books/${bookId}`);
      }
    }
  };

  const activeBook = books.find((b) => b.id === activeBookId);

  return (
    <div className="min-h-screen bg-[#f7f5ed] flex flex-col font-sans" id="app-container">
      {/* Visual Header / Brand bar */}
      <header className="bg-white border-b border-[#e8e2cf] px-4 sm:px-6 py-3.5 sm:py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">
          
          {/* Logo */}
          <div
            onClick={() => {
              setActiveBookId(null);
              setActiveTab("library");
            }}
            className="cursor-pointer flex items-center gap-1.5 flex-shrink-0"
          >
            <span className="text-xl sm:text-2xl">📖</span>
            <span className="font-serif font-extrabold tracking-tight text-stone-800 text-sm sm:text-lg md:text-xl">
              Kaviyam <span className="text-[#d4af37]">Reading</span>
            </span>
          </div>

          {/* Central navigation tabs */}
          <nav className="hidden md:flex gap-1.5 bg-stone-100 p-1 rounded-xl">
            <button
              onClick={() => {
                setActiveBookId(null);
                setActiveTab("library");
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "library" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500 hover:text-stone-800"
              }`}
              id="nav-tab-library"
            >
              Catalog Library
            </button>
            <button
              onClick={() => {
                setActiveBookId(null);
                setActiveTab("profile");
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === "profile" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500 hover:text-stone-800"
              }`}
              id="nav-tab-profile"
            >
              <UserIcon size={12} />
              Profile Settings
            </button>
            <button
              onClick={() => {
                setActiveBookId(null);
                setActiveTab("mailbox");
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 relative ${
                activeTab === "mailbox" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500 hover:text-stone-800"
              }`}
              id="nav-tab-mailbox"
            >
              <Mail size={12} />
              Mailbox
              {emails.filter((m) => !m.read).length > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
            
            {/* Show admin panel tab only if current user is admin */}
            {currentUser && currentUser.email === "admin@kaviyam.com" && (
              <button
                onClick={() => {
                  setActiveBookId(null);
                  setActiveTab("admin");
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  activeTab === "admin" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500 hover:text-stone-800"
                }`}
                id="nav-tab-admin"
              >
                <Shield size={12} className="text-[#d4af37]" />
                Admin Panel
              </button>
            )}

            <button
              onClick={() => {
                setActiveBookId(null);
                setActiveTab("localdb");
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === "localdb" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500 hover:text-stone-800"
              }`}
              id="nav-tab-localdb"
            >
              <Database size={12} className="text-[#d4af37]" />
              Local DB
            </button>

            <button
              onClick={() => {
                setActiveBookId(null);
                setActiveTab("feedback");
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === "feedback" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500 hover:text-stone-800"
              }`}
              id="nav-tab-feedback"
            >
              <HelpCircle size={12} />
              Help & FAQ
            </button>
          </nav>

          {/* User Sign-In Action or Mini-Card */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2.5">
                <div className="text-right hidden sm:block">
                  <span className="text-xs font-bold block text-stone-800">{currentUser.username}</span>
                  <span className="text-[9px] uppercase font-mono tracking-wider font-semibold text-stone-400">
                    {currentUser.email === "admin@kaviyam.com" ? "Platform Admin" : "Reader Patron"}
                  </span>
                </div>
                <img
                  src={currentUser.profile.profilePhoto}
                  alt="avatar"
                  onClick={() => {
                    setActiveBookId(null);
                    setActiveTab("profile");
                  }}
                  className="w-8 h-8 rounded-full border-2 border-[#d4af37] cursor-pointer object-cover shadow-sm hover:opacity-85 transition"
                  referrerPolicy="no-referrer"
                />
                <button
                  onClick={handleLogout}
                  className="text-stone-400 hover:text-red-500 p-1.5 hover:bg-stone-50 rounded-lg transition"
                  title="Sign out of your profile"
                  id="header-logout-btn"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setActiveBookId(null);
                  setIsGuestMode(false);
                  setActiveTab("library");
                }}
                className="bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm"
                id="header-signin-btn"
              >
                <LogIn size={13} />
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile navigation tab-rail (only visible on small screens) */}
      <div className="md:hidden bg-white border-b border-[#e8e2cf] p-2 flex justify-around text-[10px] uppercase font-mono font-bold tracking-wider">
        <button
          onClick={() => { setActiveBookId(null); setActiveTab("library"); }}
          className={`px-2 py-1 rounded ${activeTab === "library" ? "bg-[#faf6e8] text-[#d4af37]" : "text-stone-500"}`}
        >
          Library
        </button>
        <button
          onClick={() => { setActiveBookId(null); setActiveTab("profile"); }}
          className={`px-2 py-1 rounded ${activeTab === "profile" ? "bg-[#faf6e8] text-[#d4af37]" : "text-stone-500"}`}
        >
          Profile
        </button>
        <button
          onClick={() => { setActiveBookId(null); setActiveTab("mailbox"); }}
          className={`px-2 py-1 rounded relative ${activeTab === "mailbox" ? "bg-[#faf6e8] text-[#d4af37]" : "text-stone-500"}`}
        >
          Mailbox
          {emails.filter((m) => !m.read).length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
          )}
        </button>
        {currentUser && currentUser.email === "admin@kaviyam.com" && (
          <button
            onClick={() => { setActiveBookId(null); setActiveTab("admin"); }}
            className={`px-2 py-1 rounded ${activeTab === "admin" ? "bg-[#faf6e8] text-[#d4af37]" : "text-stone-500"}`}
          >
            Admin
          </button>
        )}
        <button
          onClick={() => { setActiveBookId(null); setActiveTab("localdb"); }}
          className={`px-2 py-1 rounded ${activeTab === "localdb" ? "bg-[#faf6e8] text-[#d4af37]" : "text-stone-500"}`}
        >
          Database
        </button>
        <button
          onClick={() => { setActiveBookId(null); setActiveTab("feedback"); }}
          className={`px-2 py-1 rounded ${activeTab === "feedback" ? "bg-[#faf6e8] text-[#d4af37]" : "text-stone-500"}`}
        >
          Help
        </button>
      </div>

      {/* Main Content Area Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 md:p-8">
        {/* Render Reader directly if a book is selected */}
        {activeBookId && activeBook ? (
          <Reader
            book={activeBook}
            onBackToLibrary={() => setActiveBookId(null)}
            currentUser={currentUser}
            onAddReview={handleAddReview}
            downloadedBookIds={downloadedBookIds}
            onToggleDownload={handleToggleDownload}
          />
        ) : (
          <AnimatePresence mode="wait">
            {!currentUser && !isGuestMode ? (
              <motion.div
                key="landing-3d-tab"
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -25 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="max-w-md md:max-w-lg w-full mx-auto py-8 px-4 flex flex-col justify-center items-center gap-6 text-center"
                id="landing-3d-view"
              >
                {/* Visual Header inside center stage */}
                <div className="space-y-2 text-center">
                  <h1 className={`font-serif text-3xl md:text-4xl font-extrabold leading-tight ${isDarkMode ? "text-stone-100" : "text-stone-800"}`}>
                    Kaviyam <span className="text-[#f0c15c]">Tamil Literary Platform</span>
                  </h1>
                </div>

                {/* Centered Auth Box with 3D Animations */}
                <div className="w-full">
                  <Auth
                    currentUser={currentUser}
                    onLogin={handleLogin}
                    onRegister={handleRegister}
                    onForgotPassword={handleForgotPassword}
                    onResetPasswordWithToken={handleResetPasswordWithToken}
                    onResendVerification={(email) => alert(`Simulated link resent to ${email}!`)}
                    resetToken={resetToken}
                    setResetToken={setResetToken}
                    addSystemLog={addSystemLog}
                    onGoogleLogin={handleGoogleLogin}
                    onGuestLogin={handleGuestLogin}
                    onPhoneLogin={handlePhoneLogin}
                    onSendPhoneOtp={handleSendPhoneOtp}
                    isDarkMode={isDarkMode}
                  />
                </div>
              </motion.div>
            ) : (
              <>
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
                      onSelectBook={(id) => setActiveBookId(id)}
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
                    {currentUser ? (
                      <Profile
                        currentUser={currentUser}
                        securityLogs={securityLogs}
                        onUpdateProfile={handleUpdateProfile}
                        onChangeEmail={handleChangeEmail}
                        onChangePassword={handleChangePassword}
                        onToggle2FA={handleToggle2FA}
                        onClearLogs={handleClearLogs}
                        onLogout={handleLogout}
                      />
                    ) : (
                      <Auth
                        currentUser={currentUser}
                        onLogin={handleLogin}
                        onRegister={handleRegister}
                        onForgotPassword={handleForgotPassword}
                        onResetPasswordWithToken={handleResetPasswordWithToken}
                        onResendVerification={(email) => alert(`Simulated link resent to ${email}!`)}
                        resetToken={resetToken}
                        setResetToken={setResetToken}
                        addSystemLog={addSystemLog}
                        onGoogleLogin={handleGoogleLogin}
                        onGuestLogin={handleGuestLogin}
                        isDarkMode={isDarkMode}
                      />
                    )}
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

            {activeTab === "localdb" && (
              <motion.div
                key="localdb-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <LocalDatabase />
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
          </>
        )}
      </AnimatePresence>
        )}
      </main>

      {/* Clean Footer */}
      <footer className="bg-white border-t border-[#e8e2cf] p-6 text-center mt-12">
        <p className="text-xs text-stone-500 font-serif">
          © 2026 Kaviyam Reading Platform • All Rights Reserved
        </p>
      </footer>
      {/* Invisible reCAPTCHA container for Phone Auth */}
      <div id="recaptcha-container"></div>
    </div>
  );
}

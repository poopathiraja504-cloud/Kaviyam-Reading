import { useState, useEffect } from "react";
import { User, Book, SimulatedEmail, SecurityLog, Review } from "./types";
import { PRESET_BOOKS } from "./booksData";
import { BookOpen, User as UserIcon, Mail, Shield, HelpCircle, LogIn, LogOut, ChevronRight, Sun, Moon, Wifi, WifiOff, Database } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toggleSecurityMetaTags, RECOMMENDED_META_TAGS } from "./utils/securityHeaders";

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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [pendingOtpSession, setPendingOtpSession] = useState<{ email: string; code: string } | null>(null);

  // Offline and Downloads State
  const [downloadedBookIds, setDownloadedBookIds] = useState<string[]>(() => {
    const cached = localStorage.getItem("kaviyam_downloaded_ids");
    return cached ? JSON.parse(cached) : [];
  });
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(() => {
    const cached = localStorage.getItem("kaviyam_offline_mode");
    return cached ? JSON.parse(cached) : false;
  });

  const handleToggleDownload = (bookId: string) => {
    const isDownloaded = downloadedBookIds.includes(bookId);
    let updated: string[];
    if (isDownloaded) {
      updated = downloadedBookIds.filter(id => id !== bookId);
      addSystemLog(`Removed downloaded book from offline cache: ${bookId}`, "Success");
    } else {
      updated = [...downloadedBookIds, bookId];
      addSystemLog(`Downloaded book for offline access: ${bookId}`, "Success");
    }
    setDownloadedBookIds(updated);
    localStorage.setItem("kaviyam_downloaded_ids", JSON.stringify(updated));
  };

  const handleToggleOfflineMode = () => {
    const nextMode = !isOfflineMode;
    setIsOfflineMode(nextMode);
    localStorage.setItem("kaviyam_offline_mode", JSON.stringify(nextMode));
    addSystemLog(`Simulated network state toggled: ${nextMode ? "Offline" : "Online"}`, "Success");
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

  // Load Initial State
  useEffect(() => {
    // Books
    const cachedBooks = localStorage.getItem("kaviyam_books");
    if (cachedBooks) {
      const parsed: Book[] = JSON.parse(cachedBooks);
      const merged = [...parsed];
      let updated = false;
      PRESET_BOOKS.forEach((preset) => {
        if (!merged.some((b) => b.id === preset.id)) {
          merged.push(preset);
          updated = true;
        }
      });
      setBooks(merged);
      if (updated) {
        localStorage.setItem("kaviyam_books", JSON.stringify(merged));
      }
    } else {
      setBooks(PRESET_BOOKS);
      localStorage.setItem("kaviyam_books", JSON.stringify(PRESET_BOOKS));
    }

    // Users
    const cachedUsers = localStorage.getItem("kaviyam_users");
    if (cachedUsers) {
      setUsers(JSON.parse(cachedUsers));
    } else {
      setUsers(INITIAL_USERS);
      localStorage.setItem("kaviyam_users", JSON.stringify(INITIAL_USERS));
    }

    // Passwords
    const cachedPasswords = localStorage.getItem("kaviyam_passwords");
    if (cachedPasswords) {
      setPasswords(JSON.parse(cachedPasswords));
    } else {
      setPasswords(INITIAL_PASSWORDS);
      localStorage.setItem("kaviyam_passwords", JSON.stringify(INITIAL_PASSWORDS));
    }

    // Bookmarks
    const cachedBookmarks = localStorage.getItem("kaviyam_bookmarks");
    if (cachedBookmarks) setBookmarks(JSON.parse(cachedBookmarks));

    // Security Logs
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

    // Emails
    const cachedEmails = localStorage.getItem("kaviyam_emails");
    if (cachedEmails) {
      setEmails(JSON.parse(cachedEmails));
    } else {
      const initialEmails: SimulatedEmail[] = [
        {
          id: "mail-welcome",
          recipient: "rajaboopathi1021@gmail.com",
          subject: "Welcome to Kaviyam Reading Platform!",
          body: "Hello Rajaboopathi!\n\nWelcome to Kaviyam Reading—an eye-safe, quiet digital library tailored for creative minds. Enjoy our custom, responsive design, sepia-paper readers, and AI custom novel generators. Try registering or logging in to explore the platform to the fullest!",
          sentAt: new Date().toISOString(),
          category: "announcement",
          read: false
        }
      ];
      setEmails(initialEmails);
      localStorage.setItem("kaviyam_emails", JSON.stringify(initialEmails));
    }
  }, []);

  // Save changes to localStorage helper
  const saveBooks = (updatedBooks: Book[]) => {
    setBooks(updatedBooks);
    localStorage.setItem("kaviyam_books", JSON.stringify(updatedBooks));
  };

  const saveUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    localStorage.setItem("kaviyam_users", JSON.stringify(updatedUsers));
  };

  const savePasswords = (updatedPass: Record<string, string>) => {
    setPasswords(updatedPass);
    localStorage.setItem("kaviyam_passwords", JSON.stringify(updatedPass));
  };

  const saveBookmarks = (updatedBms: string[]) => {
    setBookmarks(updatedBms);
    localStorage.setItem("kaviyam_bookmarks", JSON.stringify(updatedBms));
  };

  const saveLogs = (updatedLogs: SecurityLog[]) => {
    setSecurityLogs(updatedLogs);
    localStorage.setItem("kaviyam_logs", JSON.stringify(updatedLogs));
  };

  const saveEmails = (updatedEmails: SimulatedEmail[]) => {
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
    alert("Sandbox Database repaired successfully! All presets restored, including standard credentials.");
  };

  // Helper to add system and security logs
  const addSystemLog = (action: string, status: "Success" | "Failed" | "Blocked") => {
    const newLog: SecurityLog = {
      id: `log-${Date.now()}`,
      action,
      timestamp: new Date().toISOString(),
      device: "Linux Chrome (AI Studio)",
      ip: "127.0.0.1",
      status
    };
    saveLogs([newLog, ...securityLogs]);
  };

  // Helper to trigger outbound email simulation
  const triggerOutboundEmail = (recipient: string, subject: string, body: string, category: "auth" | "security" | "newsletter" | "announcement") => {
    const newMail: SimulatedEmail = {
      id: `mail-${Date.now()}`,
      recipient,
      subject,
      body,
      sentAt: new Date().toISOString(),
      category,
      read: false
    };
    saveEmails([newMail, ...emails]);
  };

  // Authentication Logics
  const handleLogin = (emailInput: string, passwordInput: string, otpInput?: string) => {
    // STRICT SECURITY POLICY: Only allow rajaboopathi1021@gmail.com or predefined admin/reader accounts
    const allowedEmails = ["rajaboopathi1021@gmail.com", "admin@kaviyam.com", "reader@kaviyam.com"];
    if (!allowedEmails.includes(emailInput.toLowerCase())) {
      addSystemLog(`Access Denied (Unauthorized email login attempt: ${emailInput})`, "Blocked");
      return { success: false, error: "Access Denied: This application is strictly restricted to rajaboopathi1021@gmail.com. Other mail addresses are not granted access." };
    }

    const foundUserIndex = users.findIndex((u) => u.email.toLowerCase() === emailInput.toLowerCase());
    
    if (foundUserIndex === -1) {
      addSystemLog(`Login attempt (Email not found: ${emailInput})`, "Failed");
      return { success: false, error: "Invalid email credentials." };
    }

    const foundUser = users[foundUserIndex];

    // Check Block state
    if (foundUser.security.isBlocked) {
      addSystemLog(`Login Blocked (Account locked: ${emailInput})`, "Blocked");
      return { success: false, error: "This account has been locked due to multiple failed login attempts or security block." };
    }

    // Password Check
    const storedPassword = passwords[emailInput.toLowerCase()] || "reader123";
    const isCorrectPass = storedPassword === passwordInput;
    if (!isCorrectPass) {
      const updatedAttempts = foundUser.security.loginAttempts + 1;
      const remains = 3 - updatedAttempts;

      const updatedUsersList = [...users];
      updatedUsersList[foundUserIndex] = {
        ...foundUser,
        security: {
          ...foundUser.security,
          loginAttempts: updatedAttempts,
          isBlocked: updatedAttempts >= 3 ? true : foundUser.security.isBlocked
        }
      };

      saveUsers(updatedUsersList);

      if (updatedAttempts >= 3) {
        addSystemLog(`Account Auto-Lock (Failed attempts: ${emailInput})`, "Blocked");
        triggerOutboundEmail(
          emailInput,
          "Kaviyam Platform Security Alert: Account Locked",
          `Hello ${foundUser.username},\n\nYour account has been locked after 3 consecutive incorrect password attempts.\n\nTo restore access, please initiate a password reset action immediately.`,
          "security"
        );
        return { success: false, error: "Account locked after 3 failed attempts. A security lock notification has been issued to your mailbox." };
      }

      addSystemLog(`Incorrect Password Attempt (${emailInput})`, "Failed");
      return { success: false, error: `Incorrect password. ${remains} attempt(s) remaining before security lockout.` };
    }

    // 2FA Flow
    if (foundUser.security.is2FAEnabled) {
      if (!otpInput) {
        // Issue OTP code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setPendingOtpSession({ email: emailInput, code });

        triggerOutboundEmail(
          emailInput,
          "Two-Factor Security Code: Kaviyam Reading Auth",
          `Hello ${foundUser.username},\n\nA login request was made for your account.\n\nYour 2FA security verification code is: ${code}\n\nDo not share this code. Input it inside the security prompt to finalize login.`,
          "auth"
        );
        addSystemLog(`2FA Token Issued (${emailInput})`, "Success");
        return { success: true, require2FA: true };
      } else {
        // Validate OTP code
        const isOtpValid = pendingOtpSession && pendingOtpSession.email === emailInput && pendingOtpSession.code === otpInput;
        if (!isOtpValid) {
          addSystemLog(`2FA Verification Failed (${emailInput})`, "Failed");
          return { success: false, error: "The Two-Factor security verification code is incorrect." };
        }
        // OTP Success!
        setPendingOtpSession(null);
      }
    }

    // Successful login!
    const resetUserAttempts = [...users];
    resetUserAttempts[foundUserIndex] = {
      ...foundUser,
      security: { ...foundUser.security, loginAttempts: 0 }
    };
    saveUsers(resetUserAttempts);

    setCurrentUser(foundUser);
    setActiveTab("library");
    setIsGuestMode(false);
    addSystemLog(`Login Success (${emailInput})`, "Success");
    
    // Trigger login alert email
    triggerOutboundEmail(
      emailInput,
      "Security Alert: New Account Sign-in Detected",
      `Hello ${foundUser.username},\n\nA successful sign-in was recorded for your account today.\n\nPlatform Node: Linux Sandbox Container\nIP Address: 127.0.0.1\n\nIf this wasn't you, please change your password instantly.`,
      "security"
    );

    return { success: true };
  };

  const handleRegister = (emailInput: string, usernameInput: string, dobInput: string, genderInput: string, passwordInput?: string) => {
    // STRICT SECURITY POLICY: Only allow rajaboopathi1021@gmail.com to register
    if (emailInput.toLowerCase() !== "rajaboopathi1021@gmail.com") {
      addSystemLog(`Registration Blocked (Unauthorized email: ${emailInput})`, "Blocked");
      return { success: false, error: "Access Denied: Registration on this platform is strictly restricted to rajaboopathi1021@gmail.com." };
    }

    const isEmailTaken = users.some((u) => u.email.toLowerCase() === emailInput.toLowerCase());
    if (isEmailTaken) {
      return { success: false, error: "This email address is already registered." };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email: emailInput,
      username: usernameInput,
      isVerified: false,
      profile: {
        username: usernameInput,
        bio: "Just joined the amazing community of Kaviyam Readers!",
        profilePhoto: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100",
        dob: dobInput,
        gender: genderInput,
        privacy: { publicBookshelf: true, showActivity: true }
      },
      security: { is2FAEnabled: false, isBlocked: false, loginAttempts: 0 },
      createdAt: new Date().toISOString()
    };

    const userPassword = passwordInput || "reader123";
    const updatedUsers = [...users, newUser];
    const updatedPasswords = { ...passwords, [emailInput.toLowerCase()]: userPassword };

    saveUsers(updatedUsers);
    savePasswords(updatedPasswords);

    addSystemLog(`Registration Success (${emailInput})`, "Success");

    // Send simulated welcome and verification emails
    triggerOutboundEmail(
      emailInput,
      "Welcome to Kaviyam Reading: Confirm Registration",
      `Hello ${usernameInput}!\n\nThank you for signing up to Kaviyam Reading.\n\nPlease verify your email by clicking the link below to unlock all creative AI features:\n\n[Action: VerifyEmail; email=${emailInput}]`,
      "auth"
    );

    return { success: true };
  };

  const handleForgotPassword = (emailInput: string) => {
    // STRICT SECURITY POLICY: Only allow rajaboopathi1021@gmail.com
    if (emailInput.toLowerCase() !== "rajaboopathi1021@gmail.com") {
      return { success: false, error: "Access Denied: This operation is strictly restricted to rajaboopathi1021@gmail.com." };
    }

    const foundUser = users.find((u) => u.email.toLowerCase() === emailInput.toLowerCase());
    if (!foundUser) {
      return { success: false, error: "This email address is not registered in our database." };
    }

    const token = `reset-token-${emailInput.toLowerCase()}-${Date.now()}`;
    triggerOutboundEmail(
      emailInput,
      "Secret Link: Reset Password Request",
      `Hello ${foundUser.username},\n\nWe received a request to change your secret password.\n\nPlease click the link below to enter your new credentials securely:\n\n[Action: ResetPassword; token=${token}]`,
      "auth"
    );

    addSystemLog(`Password Reset Issued (${emailInput})`, "Success");
    return { success: true };
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

  const handleSendEmailOtp = (recipientEmail: string, otp: string) => {
    triggerOutboundEmail(
      recipientEmail,
      "Your Secure Kaviyam OTP Verification Code",
      `Hello,

Your requested 4-digit security verification OTP code is:

👉  ${otp}  👈

Please enter this code in the login screen to authorize access to your account. This code is active for a single session.

Best regards,
The Kaviyam Security Node`,
      "auth"
    );
    addSystemLog(`Email OTP Dispatched to ${recipientEmail}`, "Success");
  };

  const handleEmailOtpLogin = (emailAddress: string) => {
    let foundUser = users.find((u) => u.email.toLowerCase() === emailAddress.toLowerCase());

    if (!foundUser) {
      const generatedUsername = emailAddress.split("@")[0] || `Patron-${Date.now().toString().slice(-4)}`;
      foundUser = {
        id: `email-otp-${Date.now()}`,
        email: emailAddress,
        username: generatedUsername,
        isVerified: true,
        profile: {
          username: generatedUsername,
          bio: "Patron reader authorized via secure email OTP authentication.",
          profilePhoto: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100",
          phoneNumber: "",
          dob: "2000-01-01",
          gender: "Not Specified",
          privacy: { publicBookshelf: true, showActivity: true }
        },
        security: { is2FAEnabled: false, isBlocked: false, loginAttempts: 0 },
        createdAt: new Date().toISOString()
      };
      saveUsers([...users, foundUser]);
    } else {
      // If user exists and has blocked status or failed attempts, reset them on successful OTP verification
      if (!foundUser.isVerified || foundUser.security.isBlocked || foundUser.security.loginAttempts > 0) {
        foundUser = {
          ...foundUser,
          isVerified: true,
          security: {
            ...foundUser.security,
            isBlocked: false,
            loginAttempts: 0
          }
        };
        const updatedUsersList = users.map((u) => 
          u.email.toLowerCase() === emailAddress.toLowerCase() 
            ? { ...u, isVerified: true, security: { ...u.security, isBlocked: false, loginAttempts: 0 } } 
            : u
        );
        saveUsers(updatedUsersList);
      }
    }

    setCurrentUser(foundUser);
    setActiveTab("library");
    setIsGuestMode(false);
    addSystemLog(`Email OTP Auth Success (${emailAddress})`, "Success");
  };

  const handleGoogleLogin = () => {
    // Simulated Google Sign-In with your real email address
    const googleEmail = "rajaboopathi1021@gmail.com";
    const googleName = "Rajaboopathi";
    
    let foundUser = users.find((u) => u.email.toLowerCase() === googleEmail.toLowerCase());

    if (!foundUser) {
      foundUser = {
        id: `google-${Date.now()}`,
        email: googleEmail,
        username: googleName,
        isVerified: true,
        profile: {
          username: googleName,
          bio: "Avid reader signed in securely via Google Authentication.",
          profilePhoto: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100",
          phoneNumber: "",
          dob: "2000-01-01",
          gender: "Male",
          privacy: { publicBookshelf: true, showActivity: true }
        },
        security: {
          is2FAEnabled: false,
          loginAttempts: 0,
          isBlocked: false,
          lastActive: new Date().toLocaleTimeString(),
          securityQuestions: []
        },
        createdAt: new Date().toISOString()
      };
      
      const updatedUsersList = [...users, foundUser];
      saveUsers(updatedUsersList);
    } else {
      // If user is already registered but blocked/unverified, unblock them on successful Google Authentication
      if (!foundUser.isVerified || foundUser.security.isBlocked || foundUser.security.loginAttempts > 0) {
        foundUser = {
          ...foundUser,
          isVerified: true,
          security: {
            ...foundUser.security,
            isBlocked: false,
            loginAttempts: 0
          }
        };
        const updatedUsersList = users.map((u) => 
          u.email.toLowerCase() === googleEmail.toLowerCase()
            ? { ...u, isVerified: true, security: { ...u.security, isBlocked: false, loginAttempts: 0 } }
            : u
        );
        saveUsers(updatedUsersList);
      }
    }

    setCurrentUser(foundUser);
    setActiveTab("library");
    setIsGuestMode(false);
    addSystemLog(`Google Sign-In Success (${googleEmail})`, "Success");
  };

  const handleGuestLogin = () => {
    setIsGuestMode(true);
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

  const handleLogout = () => {
    if (currentUser) {
      addSystemLog(`Logout Account (${currentUser.email})`, "Success");
      setCurrentUser(null);
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

  const handleAddCustomBook = (newBook: Book) => {
    const updatedBooksList = [...books, newBook];
    saveBooks(updatedBooksList);
  };

  const handleAddReview = (bookId: string, ratingValue: number, commentText: string) => {
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

      const updatedBooksList = [...books];
      updatedBooksList[bookIdx] = {
        ...targetBook,
        reviews: updatedReviews,
        rating: avg,
        ratingCount: updatedReviews.length
      };

      saveBooks(updatedBooksList);
      addSystemLog(`Submitted Novel Review (Book: ${targetBook.title})`, "Success");
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
            {/* Offline Simulation Toggle */}
            <button
              onClick={handleToggleOfflineMode}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 border ${
                isOfflineMode
                  ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                  : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
              }`}
              title={isOfflineMode ? "Switch back to Online Mode" : "Switch to Simulated Offline Mode"}
              id="offline-toggle-btn"
            >
              {isOfflineMode ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  <WifiOff size={13} className="text-amber-600" />
                  <span className="hidden sm:inline">Offline Mode</span>
                </>
              ) : (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <Wifi size={13} className="text-emerald-600" />
                  <span className="hidden sm:inline">Online Mode</span>
                </>
              )}
            </button>

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

      {isOfflineMode && (
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white text-xs font-mono font-bold py-2.5 px-4 text-center tracking-wide flex items-center justify-center gap-2 shadow-inner select-none">
          <span className="w-2 h-2 bg-white rounded-full animate-ping flex-shrink-0" />
          <span>OFFLINE SIMULATION ACTIVE • Reading Local Cache only • Cloud synthesis & AI Companion are disabled</span>
        </div>
      )}

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
            isOfflineMode={isOfflineMode}
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
                <div className="space-y-3">
                  <div className="flex flex-wrap justify-center gap-2 items-center">
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full inline-block border ${
                      isDarkMode 
                        ? "text-[#bfa030] bg-[#1c1a16] border-stone-800" 
                        : "text-[#bfa030] bg-[#fbf8ee] border-amber-200/40"
                    }`}>
                      🏛️ Literary Vault Platform
                    </span>
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full inline-block border ${
                      isDarkMode
                        ? "text-amber-400 bg-stone-900 border-amber-500/25"
                        : "text-[#003366] bg-blue-50 border-blue-100"
                    }`}>
                      Developed & Designed by ANU . M
                    </span>
                  </div>
                  <h1 className={`font-serif text-3xl md:text-4xl font-extrabold leading-tight ${isDarkMode ? "text-stone-100" : "text-stone-800"}`}>
                    Sojourn Into Ancient <span className="text-[#bfa030]">Tamil Epics</span>
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
                    onEmailOtpLogin={handleEmailOtpLogin}
                    onSendEmailOtp={handleSendEmailOtp}
                    onGoogleLogin={handleGoogleLogin}
                    onGuestLogin={handleGuestLogin}
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
                      isOfflineMode={isOfflineMode}
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
                        onEmailOtpLogin={handleEmailOtpLogin}
                        onSendEmailOtp={handleSendEmailOtp}
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

      {/* Quick Developer Testing Guide inside sandbox */}
      <footer className="bg-white border-t border-[#e8e2cf] p-6 text-center mt-12 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto text-stone-400 font-mono text-[10px] gap-2 border-b border-stone-100 pb-3">
          <span>PLATFORM INSTANCE: PORT 3000 LIVE</span>
          <span className="font-extrabold text-stone-700 bg-amber-50 border border-amber-200/80 px-4 py-1.5 rounded-full text-xs shadow-sm flex items-center gap-1">
            <span>💻 Developed by</span> <span className="text-[#003366] font-black uppercase">ANU . M</span> 
            <span className="text-stone-300 mx-1">•</span> 
            <span>🎨 Designed by</span> <span className="text-[#bfa030] font-black uppercase">ANU . M</span>
          </span>
          <span>© 2026 KAVIYAM PLATFORM</span>
        </div>
        <p className="text-[10px] text-stone-400 font-mono tracking-wider uppercase leading-relaxed">
          Kaviyam Reading Platform • Built with React & Tailwind CSS <br />
          <span className="text-[#d4af37] font-semibold">Testing Preset Accounts:</span> Admin (admin@kaviyam.com / admin) • Reader (reader@kaviyam.com / reader)
        </p>
      </footer>
    </div>
  );
}

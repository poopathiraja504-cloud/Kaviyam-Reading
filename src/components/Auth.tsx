import React, { useState, useEffect } from "react";
import { User } from "../types";
import { Shield, Mail, Lock, User as UserIcon, Eye, EyeOff, AlertTriangle, CheckCircle, ExternalLink, X, Chrome, Phone, Smartphone, ArrowRight, RefreshCw, Sparkles, KeyRound } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import LiquidOTP from "./LiquidOTP";

const COUNTRY_CODES = [
  { code: "+91", label: "India (+91)", flag: "🇮🇳" },
  { code: "+1", label: "USA / Canada (+1)", flag: "🇺🇸" },
  { code: "+44", label: "UK (+44)", flag: "🇬🇧" },
  { code: "+65", label: "Singapore (+65)", flag: "🇸🇬" },
  { code: "+971", label: "UAE (+971)", flag: "🇦🇪" },
  { code: "+94", label: "Sri Lanka (+94)", flag: "🇱🇰" },
  { code: "+60", label: "Malaysia (+60)", flag: "🇲🇾" },
  { code: "+61", label: "Australia (+61)", flag: "🇦🇺" },
];

interface AuthProps {
  currentUser: User | null;
  onLogin: (email: string, password: string, otp?: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string; require2FA?: boolean }> | { success: boolean; error?: string; require2FA?: boolean };
  onPhoneLogin?: (phoneNumber: string, otpOrPassword: string, isOtpMode?: boolean) => Promise<{ success: boolean; error?: string }> | { success: boolean; error?: string };
  onSendPhoneOtp?: (phoneNumber: string) => Promise<{ success: boolean; otp?: string; error?: string }> | { success: boolean; otp?: string; error?: string };
  onRegister: (email: string, username: string, dob: string, gender: string, password?: string, phoneNumber?: string) => Promise<{ success: boolean; error?: string }> | { success: boolean; error?: string };
  onForgotPassword: (email: string) => Promise<{ success: boolean; error?: string }> | { success: boolean; error?: string };
  onResetPasswordWithToken: (token: string, newPass: string) => Promise<{ success: boolean; error?: string }> | { success: boolean; error?: string };
  onResendVerification: (email: string) => void;
  resetToken: string | null;
  setResetToken: (token: string | null) => void;
  addSystemLog: (action: string, status: "Success" | "Failed" | "Blocked") => void;
  onGoogleLogin?: () => Promise<{ success: boolean; error?: string }> | void;
  onEmailOtpLogin?: (email: string) => void;
  onSendEmailOtp?: (email: string, otp: string) => void;
  onGuestLogin?: () => void;
  isDarkMode?: boolean;
}

export default function Auth({
  currentUser,
  onLogin,
  onPhoneLogin,
  onSendPhoneOtp,
  onRegister,
  onForgotPassword,
  onResetPasswordWithToken,
  onResendVerification,
  resetToken,
  setResetToken,
  addSystemLog,
  onGoogleLogin,
  onEmailOtpLogin,
  onSendEmailOtp,
  onGuestLogin,
  isDarkMode = false,
}: AuthProps) {
  const [view, setView] = useState<"login" | "register" | "forgot" | "reset" | "require2FA">("login");
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");

  // Email form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Load remembered credentials if stored
  useEffect(() => {
    try {
      const isRemembered = localStorage.getItem("kaviyam_remember_me") === "true";
      const savedEmail = localStorage.getItem("kaviyam_remembered_email");
      if (isRemembered && savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  // Phone form states
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneRaw, setPhoneRaw] = useState("");
  const [phoneAuthMode, setPhoneAuthMode] = useState<"otp" | "password">("otp");
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtpCode, setPhoneOtpCode] = useState("");
  const [phonePassword, setPhonePassword] = useState("");
  const [showPhonePassword, setShowPhonePassword] = useState(false);
  const [isSendingPhoneOtp, setIsSendingPhoneOtp] = useState(false);
  const [phoneResendTimer, setPhoneResendTimer] = useState(0);
  const [latestSimulatedOtp, setLatestSimulatedOtp] = useState<string | null>(null);

  // Register form states
  const [registerPassword, setRegisterPassword] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Not Specified");

  // 2FA / general states
  const [otpCode, setOtpCode] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSubmittingPhone, setIsSubmittingPhone] = useState(false);

  useEffect(() => {
    if (resetToken) {
      setView("reset");
    }
  }, [resetToken]);

  // Resend countdown timer
  useEffect(() => {
    if (phoneResendTimer > 0) {
      const timer = setTimeout(() => setPhoneResendTimer((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [phoneResendTimer]);

  const getFullPhoneNumber = () => {
    const cleaned = phoneRaw.trim().replace(/^0+/, "");
    return `${countryCode} ${cleaned}`;
  };

  const handleGoogleClick = async () => {
    if (!onGoogleLogin) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsGoogleLoading(true);
    try {
      const res = await onGoogleLogin();
      if (res && !res.success && res.error) {
        setErrorMsg(res.error);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Google Sign-In could not be completed.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Enforce required "Remember me on this device" selection before authorization
    if (!rememberMe) {
      setErrorMsg("Please enable 'Remember me on this device' to continue.");
      return;
    }

    try {
      const res = await onLogin(email, password, undefined, rememberMe);
      if (res.success) {
        localStorage.setItem("kaviyam_remember_me", "true");
        localStorage.setItem("kaviyam_remembered_email", email);
        setSuccessMsg("Welcome to Kaviyam Reading! Redirecting...");
      } else if (res.require2FA) {
        setView("require2FA");
        setSuccessMsg("Two-factor security protocol triggered. A simulated one-shot OTP has been generated inside your Captured Mailbox.");
      } else {
        setErrorMsg(res.error || "Invalid email or credentials. Locked out after too many failures.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred during login.");
    }
  };

  const handleRequestPhoneOtp = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanRaw = phoneRaw.trim().replace(/\D/g, "");
    if (!cleanRaw || cleanRaw.length < 6) {
      setErrorMsg("Please enter a valid mobile number.");
      return;
    }

    const fullPhone = getFullPhoneNumber();
    setIsSendingPhoneOtp(true);

    try {
      if (onSendPhoneOtp) {
        const res = await onSendPhoneOtp(fullPhone);
        if (res.success) {
          setPhoneOtpSent(true);
          setPhoneResendTimer(30);
          if (res.otp) {
            setLatestSimulatedOtp(res.otp);
            setSuccessMsg(`SMS verification OTP dispatched to ${fullPhone}! Code: ${res.otp}`);
          } else {
            setSuccessMsg(`Verification OTP successfully dispatched to ${fullPhone}.`);
          }
        } else {
          setErrorMsg(res.error || "Unable to send SMS code. Please verify the phone number.");
        }
      } else {
        // Fallback local simulated OTP
        const demoOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setLatestSimulatedOtp(demoOtp);
        setPhoneOtpSent(true);
        setPhoneResendTimer(30);
        setSuccessMsg(`Simulated SMS OTP sent to ${fullPhone}! Verification Code: ${demoOtp}`);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Error requesting SMS OTP.");
    } finally {
      setIsSendingPhoneOtp(false);
    }
  };

  const handlePhoneLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanRaw = phoneRaw.trim().replace(/\D/g, "");
    if (!cleanRaw || cleanRaw.length < 6) {
      setErrorMsg("Please enter a valid mobile number.");
      return;
    }

    const fullPhone = getFullPhoneNumber();

    if (phoneAuthMode === "otp") {
      if (!phoneOtpCode || phoneOtpCode.length < 6) {
        setErrorMsg("Please enter the 6-digit OTP code sent to your phone.");
        return;
      }
    } else {
      if (!phonePassword) {
        setErrorMsg("Please enter your account password.");
        return;
      }
    }

    setIsSubmittingPhone(true);
    try {
      if (onPhoneLogin) {
        const res = await onPhoneLogin(
          fullPhone,
          phoneAuthMode === "otp" ? phoneOtpCode : phonePassword,
          phoneAuthMode === "otp"
        );
        if (res.success) {
          setSuccessMsg("Phone authenticated successfully! Redirecting...");
        } else {
          setErrorMsg(res.error || "Phone verification failed. Please try again.");
        }
      } else {
        // Direct local login handling
        setSuccessMsg(`Welcome, reader! Authenticated via ${fullPhone}.`);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Phone authentication error.");
    } finally {
      setIsSubmittingPhone(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await onLogin(email, password, otpCode);
      if (res.success) {
        setSuccessMsg("Credentials authorized. Welcome!");
        setView("login");
      } else {
        setErrorMsg(res.error || "The entered security OTP code is incorrect or stale.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred during OTP verification.");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !username || !dob) {
      setErrorMsg("All required account credentials must be provided.");
      return;
    }

    try {
      const res = await onRegister(email, username, dob, gender, registerPassword, registerPhone);
      if (res.success) {
        setSuccessMsg("Account synthesized! You can now sign in with your email or phone number.");
        setView("login");
      } else {
        setErrorMsg(res.error || "Account synthesis failed.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred during registration.");
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await onForgotPassword(email);
      if (res.success) {
        setSuccessMsg("A password recovery package has been dispatched. Review the Simulated Mailbox to proceed.");
        setView("login");
      } else {
        setErrorMsg(res.error || "No active account profile matches this email node.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred during password recovery.");
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!resetToken) return;

    try {
      const res = await onResetPasswordWithToken(resetToken, password);
      if (res.success) {
        setSuccessMsg("Password reset successfully! You can now log in with your new credentials.");
        setResetToken(null);
        setView("login");
      } else {
        setErrorMsg(res.error || "Recovery token has expired or is invalid.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred during password reset.");
    }
  };

  return (
    <div className="w-full max-w-md md:max-w-lg mx-auto my-6" style={{ perspective: "1200px" }}>
      <motion.div
        initial={{ rotateY: -25, rotateX: 10, opacity: 0, scale: 0.96 }}
        animate={{ rotateY: 0, rotateX: 0, opacity: 1, scale: 1 }}
        exit={{ rotateY: 25, rotateX: -10, opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformStyle: "preserve-3d" }}
        className="rounded-[2.2rem] border border-[#f0c15c]/35 bg-gradient-to-b from-[#0a1428] via-[#091122] to-[#070e1c] text-stone-100 p-6 md:p-9 shadow-[0_25px_60px_rgba(0,0,0,0.75),0_0_35px_rgba(240,193,92,0.12)] text-left relative overflow-hidden transition-all duration-300"
        id="auth-root"
      >
        {/* Decorative Golden Leaf Branch Overlay in Top Right */}
        <div className="absolute top-0 right-0 p-3 pointer-events-none opacity-25">
          <svg className="w-32 h-32 text-[#f0c15c]" viewBox="0 0 100 100" fill="none" stroke="currentColor">
            <path d="M10 90 Q 50 60 90 10" strokeWidth="2" strokeLinecap="round" />
            <path d="M30 75 C 20 60, 15 45, 32 50 C 45 55, 38 70, 30 75 Z" fill="currentColor" opacity="0.6" />
            <path d="M50 55 C 40 40, 35 25, 52 30 C 65 35, 58 50, 50 55 Z" fill="currentColor" opacity="0.6" />
            <path d="M70 35 C 60 20, 55 5, 72 10 C 85 15, 78 30, 70 35 Z" fill="currentColor" opacity="0.6" />
            <path d="M25 80 C 40 75, 45 85, 35 90 C 25 95, 20 85, 25 80 Z" fill="currentColor" opacity="0.5" />
          </svg>
        </div>

        {/* Decorative Top Accent Glow Bar */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#f0c15c] to-transparent" />

        <div className="text-center mb-6 relative z-10">
          <h2 className="font-serif text-2xl md:text-3xl font-extrabold text-[#f0c15c] tracking-tight">
            {view === "login" && "Welcome Back!"}
            {view === "register" && "Synthesize Profile"}
            {view === "forgot" && "Recover Account"}
            {view === "reset" && "Set Secure Password"}
            {view === "require2FA" && "2FA Identity Shield"}
          </h2>
          <p className="text-stone-300 text-xs md:text-sm mt-1.5 font-medium leading-relaxed">
            {view === "login" && (loginMethod === "phone" ? "Sign in using your mobile phone number with instant SMS OTP." : "Sign in to continue your reading journey with Kaviyam.")}
            {view === "register" && "Register to review books, track history, and write stories with Gemini."}
            {view === "forgot" && "We will dispatch a recovery packet to your Simulated Mailbox."}
            {view === "reset" && "Establish a robust password combination to secure your credentials."}
            {view === "require2FA" && "Enter the active one-time token sent to your Simulated Mailbox."}
          </p>

          {/* Access Notice Badge */}
          <div className="mt-4 p-3 rounded-2xl border border-[#f0c15c]/25 bg-[#0d1c38]/80 flex items-center gap-3 text-xs leading-relaxed text-stone-200 shadow-sm text-left">
            <div className="w-8 h-8 rounded-full border border-[#f0c15c]/50 bg-[#122347] flex items-center justify-center flex-shrink-0 text-[#f0c15c]">
              <Shield size={16} />
            </div>
            <div>
              <span className="font-extrabold text-[#f0c15c] block text-[11px] uppercase tracking-wider">SECURE AUTHENTICATION:</span>
              <span className="text-stone-300 text-[11px]">
                Email, Mobile Phone SMS OTP & Google Sign-In supported.
              </span>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3.5 bg-red-950/80 border border-red-500/40 text-red-200 text-[11px] rounded-xl flex items-start gap-2 animate-shake relative" id="auth-error-banner">
            <AlertTriangle size={14} className="mt-0.5 flex-shrink-0 text-red-400" />
            <div className="flex-1 pr-5">
              <span className="leading-relaxed block whitespace-pre-line font-medium">{errorMsg}</span>
              {typeof window !== "undefined" && window.self !== window.top && errorMsg.includes("iframe") && (
                <a
                  href={window.location.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f0c15c] text-stone-950 font-bold text-[11px] hover:bg-[#f5ca6a] transition-all shadow-sm cursor-pointer"
                  id="open-in-new-tab-auth-btn"
                >
                  <ExternalLink size={12} />
                  Open App in New Tab
                </a>
              )}
            </div>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="absolute top-2.5 right-2.5 text-stone-400 hover:text-stone-150 transition-colors p-1 rounded-md cursor-pointer"
              title="Dismiss error"
              aria-label="Dismiss error"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3.5 bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-[11px] rounded-xl flex items-start gap-2" id="auth-success-banner">
            <CheckCircle size={14} className="mt-0.5 flex-shrink-0 text-emerald-400" />
            <span className="leading-relaxed">{successMsg}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {view === "login" && (
            <motion.div
              key="login-container"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4 text-xs relative z-10"
            >
              {/* Login Method Segmented Switch */}
              <div className="flex p-1 bg-[#070e1c] border border-[#1e3258] rounded-2xl gap-1 mb-3">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod("email");
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    loginMethod === "email"
                      ? "bg-gradient-to-r from-[#f0c15c] to-[#d48c1a] text-stone-950 shadow-md font-extrabold"
                      : "text-stone-400 hover:text-stone-200"
                  }`}
                  id="tab-login-email"
                >
                  <Mail size={14} />
                  <span>Email Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod("phone");
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    loginMethod === "phone"
                      ? "bg-gradient-to-r from-[#f0c15c] to-[#d48c1a] text-stone-950 shadow-md font-extrabold"
                      : "text-stone-400 hover:text-stone-200"
                  }`}
                  id="tab-login-phone"
                >
                  <Phone size={14} />
                  <span>Phone Number</span>
                </button>
              </div>

              {/* EMAIL LOGIN FORM */}
              {loginMethod === "email" && (
                <form onSubmit={handleLoginSubmit} className="space-y-4" id="email-login-form">
                  <div>
                    <label className="block font-bold mb-1.5 text-stone-200">Email Address</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-3.5 text-[#f0c15c]/60" />
                      <input
                        type="email"
                        required
                        placeholder="e.g. reader@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-[#1e3258] bg-[#0a152d] text-stone-100 placeholder-stone-500 rounded-xl focus:outline-none focus:border-[#f0c15c] transition-all text-xs md:text-sm"
                        id="login-email-input"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block font-bold text-stone-200">Password</label>
                      <button
                        type="button"
                        onClick={() => setView("forgot")}
                        className="text-xs text-[#f0c15c] hover:underline font-bold cursor-pointer"
                        id="forgot-password-link"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-3.5 text-[#f0c15c]/60" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-3 border border-[#1e3258] bg-[#0a152d] text-stone-100 placeholder-stone-500 rounded-xl focus:outline-none focus:border-[#f0c15c] transition-all text-xs md:text-sm"
                        id="login-password-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-200 cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me Option */}
                  <div className="flex items-center justify-between pt-0.5 pb-1">
                    <label
                      htmlFor="remember-me-checkbox"
                      className="flex items-center gap-2 cursor-pointer select-none text-stone-300 hover:text-stone-100 transition-colors group"
                      id="remember-me-label"
                    >
                      <input
                        type="checkbox"
                        id="remember-me-checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-[#1e3258] bg-[#0a152d] text-[#f0c15c] accent-[#f0c15c] focus:ring-1 focus:ring-[#f0c15c] cursor-pointer"
                      />
                      <span className="text-xs font-semibold group-hover:text-[#f0c15c] transition-colors">
                        Remember me on this device
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#f0c15c] via-[#e8a32a] to-[#d48c1a] hover:from-[#f5ca6a] hover:to-[#e09825] text-stone-950 font-extrabold py-3.5 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer text-sm tracking-wide mt-2"
                    id="login-submit-btn"
                  >
                    Authorize Sign In
                  </button>
                </form>
              )}

              {/* PHONE NUMBER LOGIN FORM */}
              {loginMethod === "phone" && (
                <form onSubmit={handlePhoneLoginSubmit} className="space-y-4" id="phone-login-form">
                  <div>
                    <label className="block font-bold mb-1.5 text-stone-200">Mobile Phone Number</label>
                    <div className="flex gap-2">
                      {/* Country Code Select */}
                      <div className="w-32 flex-shrink-0">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          disabled={phoneOtpSent}
                          className="w-full py-3 px-2 border border-[#1e3258] bg-[#0a152d] text-stone-100 focus:outline-none focus:border-[#f0c15c] rounded-xl text-xs cursor-pointer disabled:opacity-60"
                          id="phone-country-code-select"
                        >
                          {COUNTRY_CODES.map((c) => (
                            <option key={c.code} value={c.code} className="bg-[#0a152d] text-stone-100">
                              {c.flag} {c.code}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Phone Digits Input */}
                      <div className="relative flex-grow">
                        <Smartphone size={15} className="absolute left-3.5 top-3.5 text-[#f0c15c]/60" />
                        <input
                          type="tel"
                          required
                          disabled={phoneOtpSent}
                          placeholder="e.g. 98765 43210"
                          value={phoneRaw}
                          onChange={(e) => setPhoneRaw(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-[#1e3258] bg-[#0a152d] text-stone-100 placeholder-stone-500 rounded-xl focus:outline-none focus:border-[#f0c15c] transition-all text-xs md:text-sm disabled:opacity-60"
                          id="login-phone-input"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Auth Mode Toggle for Phone */}
                  <div className="flex items-center justify-between text-xs py-1">
                    <span className="text-stone-400 font-medium">Authentication Type:</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPhoneAuthMode("otp");
                          setErrorMsg(null);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                          phoneAuthMode === "otp"
                            ? "bg-[#f0c15c]/20 text-[#f0c15c] border border-[#f0c15c]/40"
                            : "text-stone-400 hover:text-stone-200"
                        }`}
                        id="phone-mode-otp-btn"
                      >
                        SMS OTP
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPhoneAuthMode("password");
                          setErrorMsg(null);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                          phoneAuthMode === "password"
                            ? "bg-[#f0c15c]/20 text-[#f0c15c] border border-[#f0c15c]/40"
                            : "text-stone-400 hover:text-stone-200"
                        }`}
                        id="phone-mode-password-btn"
                      >
                        Password
                      </button>
                    </div>
                  </div>

                  {/* OTP Mode Content */}
                  {phoneAuthMode === "otp" && (
                    <div className="space-y-3.5">
                      {!phoneOtpSent ? (
                        <button
                          type="button"
                          onClick={handleRequestPhoneOtp}
                          disabled={isSendingPhoneOtp || !phoneRaw.trim()}
                          className="w-full bg-gradient-to-r from-[#f0c15c] via-[#e8a32a] to-[#d48c1a] hover:from-[#f5ca6a] hover:to-[#e09825] text-stone-950 font-extrabold py-3.5 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer text-sm tracking-wide disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                          id="send-phone-otp-btn"
                        >
                          {isSendingPhoneOtp ? (
                            <>
                              <RefreshCw size={15} className="animate-spin" />
                              <span>Dispatching SMS Code...</span>
                            </>
                          ) : (
                            <>
                              <Phone size={15} />
                              <span>Request SMS OTP Code</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <div className="space-y-3 bg-[#0d1c38]/60 p-4 rounded-2xl border border-[#1e3258]">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-stone-300 font-bold flex items-center gap-1.5">
                              <KeyRound size={13} className="text-[#f0c15c]" />
                              Enter 6-Digit SMS Code
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setPhoneOtpSent(false);
                                setPhoneOtpCode("");
                                setLatestSimulatedOtp(null);
                              }}
                              className="text-[#f0c15c] text-[11px] hover:underline cursor-pointer"
                            >
                              Change Number
                            </button>
                          </div>

                          {/* Interactive Liquid OTP Input */}
                          <LiquidOTP
                            value={phoneOtpCode}
                            onChange={setPhoneOtpCode}
                            isDarkMode={true}
                          />

                          {/* Quick fill / preview badge for testing convenience */}
                          {latestSimulatedOtp && (
                            <div className="flex items-center justify-between p-2 rounded-xl bg-[#091122] border border-[#f0c15c]/25 text-[11px]">
                              <span className="text-stone-400">Simulated SMS Code:</span>
                              <button
                                type="button"
                                onClick={() => setPhoneOtpCode(latestSimulatedOtp)}
                                className="font-mono font-bold text-[#f0c15c] px-2 py-0.5 rounded bg-[#1e3258]/60 hover:bg-[#1e3258] transition cursor-pointer"
                                title="Click to autofill OTP"
                              >
                                {latestSimulatedOtp} (Click to fill)
                              </button>
                            </div>
                          )}

                          <div className="flex items-center justify-between text-xs pt-1">
                            <button
                              type="button"
                              onClick={handleRequestPhoneOtp}
                              disabled={phoneResendTimer > 0 || isSendingPhoneOtp}
                              className="text-stone-400 hover:text-stone-200 disabled:opacity-50 flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed text-[11px]"
                              id="resend-phone-otp-btn"
                            >
                              <RefreshCw size={11} className={isSendingPhoneOtp ? "animate-spin" : ""} />
                              {phoneResendTimer > 0 ? `Resend OTP in ${phoneResendTimer}s` : "Resend OTP Code"}
                            </button>
                          </div>

                          <button
                            type="submit"
                            disabled={isSubmittingPhone || phoneOtpCode.length < 6}
                            className="w-full bg-gradient-to-r from-[#f0c15c] via-[#e8a32a] to-[#d48c1a] hover:from-[#f5ca6a] hover:to-[#e09825] text-stone-950 font-extrabold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer text-xs md:text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                            id="verify-phone-otp-submit-btn"
                          >
                            {isSubmittingPhone ? "Verifying Phone..." : "Verify & Sign In"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Password Mode Content */}
                  {phoneAuthMode === "password" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block font-bold text-stone-200 mb-1.5">Account Password</label>
                        <div className="relative">
                          <Lock size={15} className="absolute left-3.5 top-3.5 text-[#f0c15c]/60" />
                          <input
                            type={showPhonePassword ? "text" : "password"}
                            required
                            placeholder="Enter password"
                            value={phonePassword}
                            onChange={(e) => setPhonePassword(e.target.value)}
                            className="w-full pl-10 pr-10 py-3 border border-[#1e3258] bg-[#0a152d] text-stone-100 placeholder-stone-500 rounded-xl focus:outline-none focus:border-[#f0c15c] transition-all text-xs md:text-sm"
                            id="phone-password-input"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPhonePassword(!showPhonePassword)}
                            className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-200 cursor-pointer"
                          >
                            {showPhonePassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingPhone}
                        className="w-full bg-gradient-to-r from-[#f0c15c] via-[#e8a32a] to-[#d48c1a] hover:from-[#f5ca6a] hover:to-[#e09825] text-stone-950 font-extrabold py-3.5 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer text-sm tracking-wide disabled:opacity-60 mt-2"
                        id="phone-password-submit-btn"
                      >
                        {isSubmittingPhone ? "Verifying Credentials..." : "Sign In with Phone"}
                      </button>
                    </div>
                  )}
                </form>
              )}

              {/* Divider */}
              <div className="relative my-5 flex items-center justify-center">
                <div className="absolute inset-x-0 h-px bg-[#1e3258]" />
                <span className="relative px-3 text-[10px] font-bold uppercase tracking-widest text-stone-400 bg-[#091122]">
                  OR CONTINUE WITH
                </span>
              </div>

              {/* Google & Guest Auth Buttons */}
              <div className="space-y-2.5">
                {onGoogleLogin && (
                  <button
                    type="button"
                    onClick={handleGoogleClick}
                    disabled={isGoogleLoading}
                    className="w-full flex items-center justify-center gap-2.5 py-3 px-4 border border-[#2b416e] bg-[#0e1f3d] hover:bg-[#152e5a] text-stone-100 font-bold rounded-2xl transition duration-200 text-xs md:text-sm shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
                    id="google-signin-btn"
                  >
                    <Chrome size={16} className="text-[#f0c15c] group-hover:scale-110 transition-transform flex-shrink-0" />
                    <span className="truncate">{isGoogleLoading ? "Connecting to Google..." : "Sign in with Google"}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onGuestLogin}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 border border-[#1e3258] bg-[#0c1830] hover:bg-[#132549] text-stone-300 hover:text-stone-100 font-semibold rounded-2xl transition duration-200 text-xs shadow-sm cursor-pointer"
                  id="guest-signin-btn"
                >
                  <UserIcon size={14} className="text-[#f0c15c]/80 flex-shrink-0" />
                  <span className="truncate">Continue as Guest</span>
                </button>
              </div>

              <p className="text-center text-stone-400 mt-5 text-xs">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setView("register")}
                  className="text-[#f0c15c] hover:underline font-extrabold cursor-pointer ml-1"
                  id="toggle-register-btn"
                >
                  Create Profile
                </button>
              </p>
            </motion.div>
          )}

          {view === "register" && (
            <motion.form
              key="register-form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              onSubmit={handleRegisterSubmit}
              className="space-y-4 text-xs relative z-10"
            >
              <div>
                <label className="block font-bold text-stone-200 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-3.5 text-[#f0c15c]/60" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. reader@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-[#1e3258] bg-[#0a152d] text-stone-100 placeholder-stone-500 rounded-xl focus:outline-none focus:border-[#f0c15c] transition-all text-xs md:text-sm"
                    id="register-email-input"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-200 mb-1.5">Username (Pen Name)</label>
                <div className="relative">
                  <UserIcon size={15} className="absolute left-3.5 top-3.5 text-[#f0c15c]/60" />
                  <input
                    type="text"
                    required
                    placeholder="Choose an author moniker"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-[#1e3258] bg-[#0a152d] text-stone-100 placeholder-stone-500 rounded-xl focus:outline-none focus:border-[#f0c15c] transition-all text-xs md:text-sm"
                    id="register-username-input"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-200 mb-1.5">
                  Mobile Phone Number <span className="text-stone-400 font-normal text-[11px]">(Optional for SMS Login)</span>
                </label>
                <div className="relative">
                  <Smartphone size={15} className="absolute left-3.5 top-3.5 text-[#f0c15c]/60" />
                  <input
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={registerPhone}
                    onChange={(e) => setRegisterPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-[#1e3258] bg-[#0a152d] text-stone-100 placeholder-stone-500 rounded-xl focus:outline-none focus:border-[#f0c15c] transition-all text-xs md:text-sm"
                    id="register-phone-input"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-200 mb-1.5">Choose Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-3.5 text-[#f0c15c]/60" />
                  <input
                    type={showRegisterPassword ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="Create a secure password (min 6 characters)"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 border border-[#1e3258] bg-[#0a152d] text-stone-100 placeholder-stone-500 rounded-xl focus:outline-none focus:border-[#f0c15c] transition-all text-xs md:text-sm"
                    id="register-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-200 cursor-pointer"
                  >
                    {showRegisterPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-200 mb-1.5">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3 py-2.5 border border-[#1e3258] bg-[#0a152d] text-stone-100 rounded-xl focus:outline-none focus:border-[#f0c15c]"
                    id="register-dob-input"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-200 mb-1.5">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2.5 border border-[#1e3258] bg-[#0a152d] text-stone-100 focus:outline-none focus:border-[#f0c15c] rounded-xl text-xs cursor-pointer"
                    id="register-gender-input"
                  >
                    <option value="Not Specified" className="bg-[#0a152d] text-stone-100">Not Specified</option>
                    <option value="female" className="bg-[#0a152d] text-stone-100">Female</option>
                    <option value="male" className="bg-[#0a152d] text-stone-100">Male</option>
                    <option value="non-binary" className="bg-[#0a152d] text-stone-100">Non-Binary</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#f0c15c] via-[#e8a32a] to-[#d48c1a] hover:from-[#f5ca6a] hover:to-[#e09825] text-stone-950 font-extrabold py-3.5 rounded-2xl transition shadow-lg cursor-pointer text-sm tracking-wide mt-2"
                id="register-submit-btn"
              >
                Create Account Profile
              </button>

              {onGoogleLogin && (
                <>
                  <div className="relative my-4 flex items-center justify-center">
                    <div className="absolute inset-x-0 h-px bg-[#1e3258]" />
                    <span className="relative px-3 text-[10px] font-bold uppercase tracking-widest text-stone-400 bg-[#091122]">
                      OR SIGN UP WITH
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleClick}
                    disabled={isGoogleLoading}
                    className="w-full flex items-center justify-center gap-2.5 py-3 px-4 border border-[#2b416e] bg-[#0e1f3d] hover:bg-[#152e5a] text-stone-100 font-bold rounded-2xl transition duration-200 text-xs md:text-sm shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
                    id="google-register-btn"
                  >
                    <Chrome size={16} className="text-[#f0c15c] group-hover:scale-110 transition-transform flex-shrink-0" />
                    <span className="truncate">{isGoogleLoading ? "Connecting to Google..." : "Sign up with Google"}</span>
                  </button>
                </>
              )}

              <p className="text-center text-stone-400 mt-4 text-xs">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setView("login")}
                  className="text-[#f0c15c] hover:underline font-extrabold cursor-pointer ml-1"
                  id="toggle-login-btn"
                >
                  Sign In
                </button>
              </p>
            </motion.form>
          )}

          {view === "forgot" && (
            <motion.form
              key="forgot-form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              onSubmit={handleForgotSubmit}
              className="space-y-4 text-xs relative z-10"
            >
              <div>
                <label className="block font-bold text-stone-200 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-3.5 text-[#f0c15c]/60" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-[#1e3258] bg-[#0a152d] text-stone-100 placeholder-stone-500 rounded-xl focus:outline-none focus:border-[#f0c15c]"
                    id="forgot-email-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#f0c15c] via-[#e8a32a] to-[#d48c1a] hover:from-[#f5ca6a] hover:to-[#e09825] text-stone-950 font-extrabold py-3.5 rounded-2xl transition shadow-lg cursor-pointer text-sm"
                id="forgot-submit-btn"
              >
                Send Recovery Link
              </button>

              <button
                type="button"
                onClick={() => setView("login")}
                className="w-full border border-[#1e3258] hover:bg-[#0c1830] text-stone-300 py-3 rounded-2xl transition cursor-pointer"
                id="cancel-forgot-btn"
              >
                Back to Sign In
              </button>
            </motion.form>
          )}

          {view === "reset" && (
            <motion.form
              key="reset-form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              onSubmit={handleResetSubmit}
              className="space-y-4 text-xs relative z-10"
            >
              <div className="bg-[#0c1830] border border-[#1e3258] rounded-xl p-3 text-xs text-stone-300 font-mono flex items-center gap-2">
                <Shield size={14} className="text-[#f0c15c]" />
                Secure Reset Node Validated
              </div>

              <div>
                <label className="block font-bold text-stone-200 mb-1.5">New Secure Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-3.5 text-[#f0c15c]/60" />
                  <input
                    type="password"
                    required
                    placeholder="At least 6 complex characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-[#1e3258] bg-[#0a152d] text-stone-100 focus:outline-none focus:border-[#f0c15c] rounded-xl"
                    id="reset-password-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#f0c15c] via-[#e8a32a] to-[#d48c1a] hover:from-[#f5ca6a] hover:to-[#e09825] text-stone-950 font-extrabold py-3.5 rounded-2xl transition shadow-lg cursor-pointer text-sm"
                id="reset-submit-btn"
              >
                Save New Credentials
              </button>
            </motion.form>
          )}

          {view === "require2FA" && (
            <motion.form
              key="2fa-form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              onSubmit={handle2FASubmit}
              className="space-y-4 text-xs relative z-10"
            >
              <div>
                <label className="block font-bold text-stone-200 mb-2 text-center">2FA Security OTP Code</label>
                <LiquidOTP
                  value={otpCode}
                  onChange={setOtpCode}
                  isDarkMode={true}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#f0c15c] via-[#e8a32a] to-[#d48c1a] hover:from-[#f5ca6a] hover:to-[#e09825] text-stone-950 font-extrabold py-3.5 rounded-2xl transition shadow-lg cursor-pointer text-sm"
                id="2fa-submit-btn"
              >
                Verify Security Code
              </button>

              <button
                type="button"
                onClick={() => {
                  setView("login");
                  setErrorMsg(null);
                }}
                className="w-full border border-[#1e3258] hover:bg-[#0c1830] text-stone-300 py-3 rounded-2xl transition cursor-pointer"
                id="cancel-2fa-btn"
              >
                Back to Sign In
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Creator Stamp */}
        <div className="mt-6 pt-4 border-t border-[#1e3258]/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono text-stone-400 relative z-10">
          <span>KAVIYAM AUTHENTICATION v2.5</span>
          <span className="font-bold px-2.5 py-1 rounded-lg border border-[#f0c15c]/30 text-[#f0c15c] bg-[#0c1830]/80">
            Developed by ANU . M • Designed by ANU . M
          </span>
        </div>
      </motion.div>
    </div>
  );
}

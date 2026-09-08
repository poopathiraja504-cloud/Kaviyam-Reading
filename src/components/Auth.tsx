import React, { useState, useEffect } from "react";
import { User } from "../types";
import { Shield, Mail, Lock, User as UserIcon, Eye, EyeOff, AlertTriangle, CheckCircle, ExternalLink, X, ArrowRight, RefreshCw, KeyRound, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import LiquidOTP from "./LiquidOTP";

interface AuthProps {
  currentUser: User | null;
  onLogin: (email: string, password: string, otp?: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string; require2FA?: boolean; requireVerification?: boolean; email?: string }> | { success: boolean; error?: string; require2FA?: boolean; requireVerification?: boolean; email?: string };
  onRegister: (email: string, username: string, dob: string, gender: string, password?: string) => Promise<{ success: boolean; error?: string; requireVerification?: boolean; email?: string }> | { success: boolean; error?: string; requireVerification?: boolean; email?: string };
  onForgotPassword: (email: string) => Promise<{ success: boolean; error?: string; email?: string }> | { success: boolean; error?: string; email?: string };
  onResetPasswordWithToken: (token: string, newPass: string) => Promise<{ success: boolean; error?: string }> | { success: boolean; error?: string };
  onResendVerification: (email: string) => Promise<{ success: boolean; error?: string }> | void;
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
  const [view, setView] = useState<"login" | "register" | "forgot" | "reset" | "require2FA" | "verifyEmail">("login");

  // Email form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Email Verification Screen states
  const [verificationEmail, setVerificationEmail] = useState("");
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);

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

  // Register form states
  const [registerPassword, setRegisterPassword] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Not Specified");

  // 2FA / general states
  const [otpCode, setOtpCode] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Forgot password states
  const [isResetLinkSending, setIsResetLinkSending] = useState(false);
  const [isResetLinkSent, setIsResetLinkSent] = useState(false);
  const [resetSentEmail, setResetSentEmail] = useState("");

  useEffect(() => {
    if (resetToken) {
      setView("reset");
    }
  }, [resetToken]);

  // Resend countdown timer for Email Verification
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

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
      } else if (res.requireVerification) {
        const targetEmail = res.email || email;
        setVerificationEmail(targetEmail);
        setView("verifyEmail");
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

  const handleResendVerificationEmail = async () => {
    const targetEmail = verificationEmail || email;
    if (!targetEmail) return;

    setIsResendingEmail(true);
    setResendSuccess(null);
    setErrorMsg(null);

    try {
      if (onResendVerification) {
        const res = await onResendVerification(targetEmail);
        if (res && !res.success && res.error) {
          setErrorMsg(res.error);
          return;
        }
      }
      setResendCooldown(30);
      setResendSuccess(`We have resent a verification email to ${targetEmail}.`);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to resend verification email.");
    } finally {
      setIsResendingEmail(false);
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
      const res = await onRegister(email, username, dob, gender, registerPassword);
      if (res.success) {
        const targetEmail = res.email || email;
        setVerificationEmail(targetEmail);
        setView("verifyEmail");
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

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setIsResetLinkSending(true);
    try {
      const res = await onForgotPassword(cleanEmail);
      if (res && res.success) {
        setIsResetLinkSent(true);
        setResetSentEmail(res.email || cleanEmail);
      } else {
        setErrorMsg(res?.error || "Failed to issue password change link. Please verify the email address.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred during password recovery.");
    } finally {
      setIsResetLinkSending(false);
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
            {view === "forgot" && (isResetLinkSent ? "Password Reset Sent" : "Forgot Password?")}
            {view === "reset" && "Set Secure Password"}
            {view === "require2FA" && "2FA Identity Shield"}
            {view === "verifyEmail" && "Verify Your Email"}
          </h2>
          <p className="text-stone-300 text-xs md:text-sm mt-1.5 font-medium leading-relaxed">
            {view === "login" && "Sign in to continue your reading journey with Kaviyam."}
            {view === "register" && "Register to review books, track history, and write stories with Gemini."}
            {view === "forgot" && (isResetLinkSent ? "Check your email inbox to change your password." : "Enter your email to receive a password change link.")}
            {view === "reset" && "Establish a robust password combination to secure your credentials."}
            {view === "require2FA" && "Enter the active one-time token sent to your Simulated Mailbox."}
            {view === "verifyEmail" && "Please verify your email address to access your Kaviyam Reading account."}
          </p>

          {/* Access Notice Badge */}
          <div className="mt-4 p-3 rounded-2xl border border-[#f0c15c]/25 bg-[#0d1c38]/80 flex items-center gap-3 text-xs leading-relaxed text-stone-200 shadow-sm text-left">
            <div className="w-8 h-8 rounded-full border border-[#f0c15c]/50 bg-[#122347] flex items-center justify-center flex-shrink-0 text-[#f0c15c]">
              <Shield size={16} />
            </div>
            <div>
              <span className="font-extrabold text-[#f0c15c] block text-[11px] uppercase tracking-wider">SECURE AUTHENTICATION:</span>
              <span className="text-stone-300 text-[11px]">
                Email & Google Sign-In supported with verified credentials.
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
              {/* EMAIL LOGIN FORM */}
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
                      onClick={() => {
                        setErrorMsg(null);
                        setSuccessMsg(null);
                        setIsResetLinkSent(false);
                        setView("forgot");
                      }}
                      className="text-xs text-[#f0c15c] hover:underline font-bold cursor-pointer"
                      id="forgot-password-link"
                    >
                      Forgot password?
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

              {/* Divider */}
              <div className="relative my-5 flex items-center justify-center">
                <div className="absolute inset-x-0 h-px bg-[#1e3258]" />
                <span className="relative px-3 text-[10px] font-bold uppercase tracking-widest text-stone-400 bg-[#091122]">
                  OR CONTINUE WITH
                </span>
              </div>

              {/* Google Auth Button - Official Google Design */}
              {onGoogleLogin && (
                <button
                  type="button"
                  onClick={handleGoogleClick}
                  disabled={isGoogleLoading}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-[#f8fafd] active:bg-[#f1f3f4] text-[#3c4043] font-medium rounded-2xl transition duration-200 text-xs md:text-sm shadow-md hover:shadow-lg border border-[#dadce0] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
                  id="google-signin-btn"
                >
                  <svg className="w-4.5 h-4.5 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span className="truncate font-medium font-sans">
                    {isGoogleLoading ? "Connecting to Google..." : "Sign in with Google"}
                  </span>
                </button>
              )}
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
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-[#f8fafd] active:bg-[#f1f3f4] text-[#3c4043] font-medium rounded-2xl transition duration-200 text-xs md:text-sm shadow-md hover:shadow-lg border border-[#dadce0] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
                    id="google-register-btn"
                  >
                    <svg className="w-4.5 h-4.5 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span className="truncate font-medium font-sans">{isGoogleLoading ? "Connecting to Google..." : "Sign up with Google"}</span>
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
            isResetLinkSent ? (
              <motion.div
                key="forgot-sent-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-5 text-center py-2 relative z-10"
                id="forgot-password-sent-view"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                  <CheckCircle size={28} />
                </div>

                <div className="space-y-2">
                  <h3 className="font-serif text-lg md:text-xl font-bold text-stone-100">
                    Reset Link Dispatched
                  </h3>
                  <p className="text-stone-300 text-xs md:text-sm leading-relaxed px-2">
                    We sent you a password change link to{" "}
                    <span className="font-bold text-[#f0c15c] break-all underline decoration-[#f0c15c]/40 underline-offset-2">
                      {resetSentEmail || email}
                    </span>
                  </p>
                  <p className="text-stone-400 text-xs">
                    Please check your email inbox and click the link to reset your password.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsResetLinkSent(false);
                    setErrorMsg(null);
                    setSuccessMsg(null);
                    setView("login");
                  }}
                  className="w-full bg-gradient-to-r from-[#f0c15c] via-[#e8a32a] to-[#d48c1a] hover:from-[#f5ca6a] hover:to-[#e09825] text-stone-950 font-extrabold py-3.5 rounded-2xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer text-sm tracking-wide"
                  id="forgot-success-signin-btn"
                >
                  <LogIn size={16} />
                  <span>Sign In</span>
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="forgot-form"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                onSubmit={handleForgotSubmit}
                className="space-y-4 text-xs relative z-10"
                id="forgot-password-form"
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
                      className="w-full pl-10 pr-4 py-3 border border-[#1e3258] bg-[#0a152d] text-stone-100 placeholder-stone-500 rounded-xl focus:outline-none focus:border-[#f0c15c] text-xs md:text-sm"
                      id="forgot-email-input"
                      autoFocus
                    />
                  </div>
                  <p className="text-stone-400 text-[11px] mt-1.5">
                    Enter your account email to receive a password reset link from Firebase.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isResetLinkSending}
                  className="w-full bg-gradient-to-r from-[#f0c15c] via-[#e8a32a] to-[#d48c1a] hover:from-[#f5ca6a] hover:to-[#e09825] text-stone-950 font-extrabold py-3.5 rounded-2xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  id="forgot-submit-btn"
                >
                  {isResetLinkSending ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Sending Link...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound size={16} />
                      <span>Get Reset Link</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setSuccessMsg(null);
                    setView("login");
                  }}
                  className="w-full border border-[#1e3258] hover:bg-[#0c1830] text-stone-300 py-3 rounded-2xl transition cursor-pointer font-medium"
                  id="cancel-forgot-btn"
                >
                  Back to Sign In
                </button>
              </motion.form>
            )
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

          {view === "verifyEmail" && (
            <motion.div
              key="verify-email-view"
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="space-y-5 text-xs relative z-10 text-center"
              id="email-verification-screen"
            >
              {/* Verification Icon Badge */}
              <div className="flex justify-center my-2">
                <div className="relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-[#1b2b4f] via-[#101e38] to-[#0a1428] border-2 border-[#f0c15c]/60 flex items-center justify-center shadow-[0_0_30px_rgba(240,193,92,0.25)]">
                    <Mail size={32} className="text-[#f0c15c] animate-pulse" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#f0c15c] text-stone-950 flex items-center justify-center font-black text-xs shadow-md">
                    <CheckCircle size={16} className="text-stone-950" />
                  </div>
                </div>
              </div>

              {/* Exact Screen Notice Card */}
              <div className="bg-[#0c1830] border border-[#f0c15c]/35 rounded-2xl p-5 sm:p-6 text-stone-200 shadow-inner text-center space-y-3">
                <p className="text-sm sm:text-base font-semibold text-stone-200 leading-relaxed">
                  We have sent you a verification email to{" "}
                  <span className="inline-block font-mono font-bold text-[#f0c15c] bg-[#070e1c] px-2.5 py-1 rounded-lg border border-[#f0c15c]/40 break-all text-xs sm:text-sm">
                    {verificationEmail || email || "your registered email"}
                  </span>
                  . Verify it and log in
                </p>
              </div>

              {/* Step Checklist */}
              <div className="p-3.5 rounded-xl bg-[#091429]/90 border border-[#1e3258] text-left text-[11px] text-stone-300 space-y-2">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#f0c15c]/20 text-[#f0c15c] font-bold flex items-center justify-center flex-shrink-0 text-[10px]">1</span>
                  <span>Open your email client inbox (also check Spam / Junk folders).</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#f0c15c]/20 text-[#f0c15c] font-bold flex items-center justify-center flex-shrink-0 text-[10px]">2</span>
                  <span>Click the verification link sent from Firebase Authentication.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#f0c15c]/20 text-[#f0c15c] font-bold flex items-center justify-center flex-shrink-0 text-[10px]">3</span>
                  <span>Return here and click the <strong>Log In</strong> button below.</span>
                </div>
              </div>

              {resendSuccess && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs rounded-xl flex items-center gap-2 text-left animate-fadeIn">
                  <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                  <span className="text-[11px] font-medium">{resendSuccess}</span>
                </div>
              )}

              {/* Login Button */}
              <button
                type="button"
                onClick={() => {
                  if (verificationEmail) setEmail(verificationEmail);
                  setView("login");
                  setErrorMsg(null);
                  setSuccessMsg("Please enter your password and sign in once your email is verified.");
                }}
                className="w-full bg-gradient-to-r from-[#f0c15c] via-[#e8a32a] to-[#d48c1a] hover:from-[#f5ca6a] hover:to-[#e09825] text-stone-950 font-extrabold py-3.5 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer text-sm tracking-wide"
                id="verification-login-btn"
              >
                <LogIn size={16} />
                <span>Log In</span>
              </button>

              {/* Resend Verification Option */}
              <div className="pt-2 flex flex-col items-center gap-2">
                <button
                  type="button"
                  disabled={isResendingEmail || resendCooldown > 0}
                  onClick={handleResendVerificationEmail}
                  className="text-xs text-stone-400 hover:text-[#f0c15c] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  id="resend-verification-btn"
                >
                  <RefreshCw size={12} className={isResendingEmail ? "animate-spin" : ""} />
                  <span>
                    {resendCooldown > 0
                      ? `Resend Verification Email (${resendCooldown}s)`
                      : isResendingEmail
                      ? "Sending Verification Link..."
                      : "Didn't receive the email? Resend Verification"}
                  </span>
                </button>
              </div>
            </motion.div>
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

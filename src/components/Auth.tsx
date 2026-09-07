import React, { useState, useEffect, useRef } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  ConfirmationResult,
} from "firebase/auth";
import { auth } from "../firebase";
import {
  sendPhoneOtp,
  verifyPhoneOtp,
  clearRecaptchaVerifier,
  formatE164PhoneNumber,
} from "../lib/phoneAuth";
import { User } from "../types";
import { Shield, Mail, Lock, User as UserIcon, Eye, EyeOff, AlertTriangle, CheckCircle, Smartphone, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import LiquidOTP from "./LiquidOTP";

interface AuthProps {
  currentUser: User | null;
  onLogin: (email: string, password: string, otp?: string) => Promise<{ success: boolean; error?: string; require2FA?: boolean; requireEmailVerification?: boolean; verificationEmail?: string }> | { success: boolean; error?: string; require2FA?: boolean; requireEmailVerification?: boolean; verificationEmail?: string };
  onRegister: (email: string, username: string, dob: string, gender: string, password?: string, photoFileName?: string) => Promise<{ success: boolean; error?: string; requireEmailVerification?: boolean; verificationEmail?: string }> | { success: boolean; error?: string; requireEmailVerification?: boolean; verificationEmail?: string };
  onForgotPassword: (email: string) => Promise<{ success: boolean; error?: string; resetEmail?: string }> | { success: boolean; error?: string; resetEmail?: string };
  onResetPasswordWithToken: (token: string, newPass: string) => Promise<{ success: boolean; error?: string }> | { success: boolean; error?: string };
  onResendVerification: (email: string) => void;
  resetToken: string | null;
  setResetToken: (token: string | null) => void;
  addSystemLog: (action: string, status: "Success" | "Failed" | "Blocked") => void;
  onEmailOtpLogin?: (email: string) => void;
  onSendEmailOtp?: (email: string, otp: string) => void;
  onPhoneLogin?: (phone: string, otp: string) => Promise<void> | void;
  onSendPhoneOtp?: (phone: string) => Promise<void> | void;
  onGuestLogin?: () => void;
  onGoogleLogin?: () => Promise<void> | void;
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
  onEmailOtpLogin,
  onSendEmailOtp,
  onPhoneLogin,
  onSendPhoneOtp,
  onGuestLogin,
  onGoogleLogin,
  isDarkMode = false,
}: AuthProps) {
  const [view, setView] = useState<"login" | "phoneLogin" | "register" | "forgot" | "reset" | "require2FA" | "verifyEmail" | "passwordResetSent">("login");
  const [verificationEmail, setVerificationEmail] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [username, setUsername] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Not Specified");
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedPhotoName, setSelectedPhotoName] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Phone Login State & Firebase Confirmation Result
  const [phoneCountryCode, setPhoneCountryCode] = useState("+1");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneStep, setPhoneStep] = useState<"enterPhone" | "verifyOtp">("enterPhone");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [phoneCountdown, setPhoneCountdown] = useState(0);

  const fullPhoneNumber = `${phoneCountryCode} ${phoneNumber.trim()}`;

  useEffect(() => {
    return () => {
      // Clear any active recaptcha verifier when unmounting
      clearRecaptchaVerifier();
    };
  }, []);

  useEffect(() => {
    if (phoneCountdown <= 0) return;
    const timer = setInterval(() => {
      setPhoneCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [phoneCountdown]);

  useEffect(() => {
    if (resetToken) {
      setView("reset");
    }
  }, [resetToken]);

  // Google Sign-In with GoogleAuthProvider and signInWithPopup(auth, provider)
  const isGooglePopupActiveRef = useRef(false);

  const handleGoogleLoginClick = async () => {
    if (isGooglePopupActiveRef.current) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    isGooglePopupActiveRef.current = true;

    try {
      if (onGoogleLogin) {
        await onGoogleLogin();
      } else {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: "select_account" });
        await signInWithPopup(auth, provider);
      }
    } catch (err: any) {
      const errCode = err?.code || "";
      let errMsg = "";
      if (errCode === "auth/popup-closed-by-user") {
        errMsg = "The Google sign-in window was closed before completing authentication. Please try again.";
      } else if (errCode === "auth/popup-blocked") {
        errMsg = "The sign-in popup was blocked by your browser. Please allow popups for this site or open the app in a new browser tab.";
      } else if (errCode === "auth/cancelled-popup-request") {
        errMsg = "A sign-in request was already in progress and has been reset. Please click again.";
      } else if (errCode === "auth/unauthorized-domain") {
        errMsg = "This domain is not authorized in your Firebase Authentication settings. Please add this domain to 'Authorized domains' in Firebase Console (Authentication > Settings > Authorized domains).";
      } else if (
        errCode === "auth/internal-error" ||
        (typeof window !== "undefined" && window.self !== window.top && (errCode.includes("internal-error") || err?.message?.includes("iframe") || errCode.includes("network-request-failed")))
      ) {
        errMsg = "Google Sign-In popup could not complete within the embedded iframe environment. Please click the button below to open the application in a new browser tab to sign in with Google, or sign in using Email or Phone login.";
      } else {
        errMsg = err?.message || (typeof err === "string" ? err : "Google Sign-In failed.");
      }
      setErrorMsg(errMsg);
      addSystemLog(`Google Sign-In Notice: ${errCode || errMsg}`, "Blocked");
    } finally {
      isGooglePopupActiveRef.current = false;
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await onLogin(email, password);
      if (res.success) {
        setSuccessMsg("Welcome to Kaviyam Reading! Redirecting...");
      } else if (res.requireEmailVerification) {
        setVerificationEmail(res.verificationEmail || email);
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

  // Phone OTP dispatch using real Firebase signInWithPhoneNumber
  const handleSendPhoneOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSendingOtp) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    let formattedPhone = "";
    try {
      formattedPhone = formatE164PhoneNumber(phoneCountryCode, phoneNumber);
    } catch (err: any) {
      setErrorMsg(err.message || "Please enter a valid phone number.");
      return;
    }

    setIsSendingOtp(true);
    try {
      if (onSendPhoneOtp) {
        await onSendPhoneOtp(formattedPhone);
      } else {
        await sendPhoneOtp(formattedPhone, () => {
          setErrorMsg("reCAPTCHA verification expired. Please request a new SMS code.");
        });
        addSystemLog(`Firebase Phone SMS OTP Dispatched (${formattedPhone})`, "Success");
      }
      setPhoneStep("verifyOtp");
      setPhoneCountdown(30);
      setSuccessMsg(`SMS verification code dispatched to ${formattedPhone}. Enter the 6-digit code to complete sign in.`);
    } catch (err: any) {
      console.error("Firebase Phone Auth error:", err);
      const errCode = err?.code || "";
      let errMsg = "";
      if (errCode === "auth/firebase-app-check-token-is-invalid" || err?.message?.includes("firebase-app-check-token-is-invalid")) {
        errMsg = "SMS verification could not complete because App Check or reCAPTCHA is not configured for this domain in Firebase Console. Please add this domain to Authorized domains in Firebase Console (Authentication > Settings > Authorized domains) or use Email/Password sign in.";
      } else if (errCode === "auth/captcha-check-failed" || err?.message?.includes("captcha-check-failed")) {
        errMsg = "reCAPTCHA verification failed. Please try requesting a new SMS verification code.";
      } else if (errCode === "auth/quota-exceeded" || errCode === "auth/too-many-requests") {
        errMsg = "SMS limit exceeded or too many requests. Please wait a few minutes or sign in with Email/Password.";
      } else if (errCode === "auth/invalid-phone-number") {
        errMsg = "The phone number format is invalid. Please enter a valid number with country code (e.g. +91... or +1...).";
      } else {
        errMsg = err?.message || (typeof err === "string" ? err : "Failed to send SMS verification code.");
      }
      setErrorMsg(errMsg);
      addSystemLog(`Phone OTP Dispatch Failed (${formattedPhone}): ${errCode || errMsg}`, "Failed");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Resend Phone OTP using real Firebase signInWithPhoneNumber
  const handleResendPhoneOtp = async () => {
    if (isSendingOtp) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    let formattedPhone = "";
    try {
      formattedPhone = formatE164PhoneNumber(phoneCountryCode, phoneNumber);
    } catch (err: any) {
      setErrorMsg(err.message || "Please enter a valid phone number.");
      return;
    }

    setIsSendingOtp(true);
    try {
      if (onSendPhoneOtp) {
        await onSendPhoneOtp(formattedPhone);
      } else {
        await sendPhoneOtp(formattedPhone, () => {
          setErrorMsg("reCAPTCHA verification expired. Please request a new SMS code.");
        });
        addSystemLog(`Firebase Phone SMS OTP Resent (${formattedPhone})`, "Success");
      }
      setPhoneCountdown(30);
      setSuccessMsg(`Resent verification code to ${formattedPhone}.`);
    } catch (err: any) {
      console.error("Firebase Resend OTP error:", err);
      const errMsg = err?.message || (typeof err === "string" ? err : "Failed to resend SMS OTP.");
      setErrorMsg(errMsg);
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Verify Phone OTP using confirmationResult.confirm(otp)
  const handleVerifyPhoneOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isVerifyingOtp) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanOtp = phoneOtp.trim();
    if (cleanOtp.length < 6) {
      setErrorMsg("Please enter the complete 6-digit SMS verification code.");
      return;
    }

    let formattedPhone = "";
    try {
      formattedPhone = formatE164PhoneNumber(phoneCountryCode, phoneNumber);
    } catch (_) {
      formattedPhone = `${phoneCountryCode}${phoneNumber.trim()}`;
    }

    setIsVerifyingOtp(true);
    try {
      if (onPhoneLogin) {
        await onPhoneLogin(formattedPhone, cleanOtp);
      } else {
        const userCredential = await verifyPhoneOtp(cleanOtp);
        if (userCredential?.user) {
          addSystemLog(`Firebase Phone Auth Confirmed (${userCredential.user.phoneNumber || userCredential.user.uid})`, "Success");
        }
      }
    } catch (err: any) {
      console.error("Phone OTP Verification error:", err);
      const errMsg = err?.message || (typeof err === "string" ? err : "Invalid SMS verification code. Please check and try again.");
      setErrorMsg(errMsg);
      addSystemLog(`Phone OTP Verification Failed: ${errMsg}`, "Failed");
    } finally {
      setIsVerifyingOtp(false);
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
      setErrorMsg("All account credentials must be provided.");
      return;
    }

    if (registerPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    try {
      const res = await onRegister(email, username, dob, gender, registerPassword, selectedPhotoName);
      if (res.success) {
        setVerificationEmail(res.verificationEmail || email);
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

    try {
      const res = await onForgotPassword(email);
      if (res.success) {
        setResetEmail(res.resetEmail || email);
        setView("passwordResetSent");
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
            {view === "phoneLogin" && "Welcome Back!"}
            {view === "register" && "Synthesize Profile"}
            {view === "forgot" && "Recover Account"}
            {view === "reset" && "Set Secure Password"}
            {view === "require2FA" && "2FA Identity Shield"}
          </h2>
          <p className="text-stone-300 text-xs md:text-sm mt-1.5 font-medium leading-relaxed">
            {view === "login" && "Sign in to continue your reading journey with Kaviyam."}
            {view === "phoneLogin" && "Sign in to continue your reading journey with Kaviyam."}
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
              <span className="font-extrabold text-[#f0c15c] block text-[11px] uppercase tracking-wider">SECURE AUTH:</span>
              <span className="text-stone-300 text-[11px]">
                {view === "phoneLogin"
                  ? "Firebase Phone Authentication with SMS verification code."
                  : "Firebase Authentication enabled with Email/Password & Google Sign-In."}
              </span>
            </div>
          </div>
        </div>

        {/* Login Mode Switcher Tabs */}
        {(view === "login" || view === "phoneLogin") && (
          <div className="flex rounded-2xl p-1.5 mb-5 border border-[#1e3258] bg-[#0c1830] shadow-inner gap-1.5 relative z-10">
            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                setSuccessMsg(null);
                clearRecaptchaVerifier();
                setView("login");
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl font-extrabold text-xs md:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${view === "login"
                ? "bg-gradient-to-r from-[#f0c15c] via-[#f2a93b] to-[#d48c1a] text-stone-950 shadow-md scale-[1.02]"
                : "text-stone-300 hover:text-white hover:bg-[#122347]"
                }`}
              id="tab-login-email"
            >
              <Mail size={15} />
              Email & Password
            </button>
            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                setSuccessMsg(null);
                clearRecaptchaVerifier();
                setView("phoneLogin");
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl font-extrabold text-xs md:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${view === "phoneLogin"
                ? "bg-gradient-to-r from-[#f0c15c] via-[#f2a93b] to-[#d48c1a] text-stone-950 shadow-md scale-[1.02]"
                : "text-stone-300 hover:text-white hover:bg-[#122347]"
                }`}
              id="tab-login-phone"
            >
              <Smartphone size={15} />
              Phone Number
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3.5 bg-red-950/80 border border-red-500/40 text-red-200 text-[11px] rounded-xl flex items-start gap-2 animate-shake" id="auth-error-banner">
            <AlertTriangle size={14} className="mt-0.5 flex-shrink-0 text-red-400" />
            <div className="flex-1">
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
            <motion.form
              key="login-form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              onSubmit={handleLoginSubmit}
              className="space-y-4 text-xs relative z-10"
            >
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

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#f0c15c] via-[#e8a32a] to-[#d48c1a] hover:from-[#f5ca6a] hover:to-[#e09825] text-stone-950 font-extrabold py-3.5 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer text-sm tracking-wide mt-2"
                id="login-submit-btn"
              >
                Authorize Sign In
              </button>

              {/* Divider */}
              <div className="relative my-5 flex items-center justify-center">
                <div className="absolute inset-x-0 h-px bg-[#1e3258]" />
                <span className="relative px-3 text-[10px] font-bold uppercase tracking-widest text-stone-400 bg-[#091122]">
                  OR CONTINUE WITH
                </span>
              </div>

              {/* Google & Guest Mode Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleGoogleLoginClick}
                  className="flex items-center justify-center gap-2 py-3 px-3 border border-[#1e3258] bg-[#0c1830] hover:bg-[#132549] text-stone-100 font-bold rounded-2xl transition duration-200 text-xs md:text-sm shadow-sm cursor-pointer"
                  id="login-google-signin-btn"
                >
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span className="truncate">Google</span>
                </button>

                <button
                  type="button"
                  onClick={onGuestLogin}
                  className="flex items-center justify-center gap-2 py-3 px-3 border border-[#1e3258] bg-[#0c1830] hover:bg-[#132549] text-stone-100 font-bold rounded-2xl transition duration-200 text-xs md:text-sm shadow-sm cursor-pointer"
                  id="guest-signin-btn"
                >
                  <UserIcon size={15} className="text-[#f0c15c] flex-shrink-0" />
                  <span className="truncate">Guest Mode</span>
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
            </motion.form>
          )}

          {view === "verifyEmail" && (
            <motion.div
              key="verify-email"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-5 text-xs relative z-10 text-center"
            >
              <div className="rounded-2xl border border-[#1e3258] bg-[#0d1c38]/80 p-5">
                <Mail size={30} className="mx-auto mb-3 text-[#f0c15c]" />
                <p className="text-stone-200 text-sm leading-relaxed">
                  We have sent you a verification email to <span className="font-bold text-[#f0c15c] break-all">{verificationEmail}</span>. Verify it and log in
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setSuccessMsg(null);
                  setView("login");
                }}
                className="w-full bg-gradient-to-r from-[#f0c15c] via-[#e8a32a] to-[#d48c1a] hover:from-[#f5ca6a] hover:to-[#e09825] text-stone-950 font-extrabold py-3.5 rounded-2xl transition shadow-lg cursor-pointer text-sm"
                id="email-verification-login-btn"
              >
                Login
              </button>
            </motion.div>
          )}

          {view === "passwordResetSent" && (
            <motion.div
              key="password-reset-sent"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-5 text-xs relative z-10 text-center"
            >
              <div className="rounded-2xl border border-[#1e3258] bg-[#0d1c38]/80 p-5">
                <Mail size={30} className="mx-auto mb-3 text-[#f0c15c]" />
                <p className="text-stone-200 text-sm leading-relaxed">
                  We sent you a password change link to <span className="font-bold text-[#f0c15c] break-all">{resetEmail}</span>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setSuccessMsg(null);
                  setView("login");
                }}
                className="w-full bg-gradient-to-r from-[#f0c15c] via-[#e8a32a] to-[#d48c1a] hover:from-[#f5ca6a] hover:to-[#e09825] text-stone-950 font-extrabold py-3.5 rounded-2xl transition shadow-lg cursor-pointer text-sm"
                id="password-reset-signin-btn"
              >
                Sign In
              </button>
            </motion.div>
          )}

          {view === "phoneLogin" && (
            <motion.div
              key="phone-login-form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4 text-xs relative z-10"
            >
              {phoneStep === "enterPhone" ? (
                <form onSubmit={handleSendPhoneOtpSubmit} className="space-y-4">
                  <div>
                    <label className="block font-bold mb-1.5 text-stone-200">
                      Mobile Phone Number
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={phoneCountryCode}
                        onChange={(e) => setPhoneCountryCode(e.target.value)}
                        className="py-3 px-2.5 border border-[#1e3258] bg-[#0a152d] text-stone-100 rounded-xl font-bold focus:outline-none focus:border-[#f0c15c] transition-all text-xs cursor-pointer shadow-sm"
                        id="phone-country-select"
                      >
                        <option value="+91" className="bg-[#0a152d] text-stone-100">🇮🇳 +91 (India)</option>
                        <option value="+1" className="bg-[#0a152d] text-stone-100">🇺🇸 +1 (US/CA)</option>
                        <option value="+44" className="bg-[#0a152d] text-stone-100">🇬🇧 +44 (UK)</option>
                        <option value="+61" className="bg-[#0a152d] text-stone-100">🇦🇺 +61 (Aus)</option>
                        <option value="+81" className="bg-[#0a152d] text-stone-100">🇯🇵 +81 (Japan)</option>
                        <option value="+49" className="bg-[#0a152d] text-stone-100">🇩🇪 +49 (Germany)</option>
                        <option value="+33" className="bg-[#0a152d] text-stone-100">🇫🇷 +33 (France)</option>
                        <option value="+65" className="bg-[#0a152d] text-stone-100">🇸🇬 +65 (SG)</option>
                        <option value="+971" className="bg-[#0a152d] text-stone-100">🇦🇪 +971 (UAE)</option>
                      </select>
                      <div className="relative flex-1">
                        <input
                          type="tel"
                          required
                          placeholder="81234 56789"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full px-4 py-3 border border-[#1e3258] bg-[#0a152d] text-stone-100 placeholder-stone-500 rounded-xl focus:outline-none focus:border-[#f0c15c] transition-all text-xs md:text-sm font-mono tracking-wider"
                          id="phone-number-input"
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-stone-400 mt-2 leading-relaxed">
                      Firebase will dispatch a 6-digit SMS verification code to this phone number.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingOtp}
                    className="w-full bg-gradient-to-r from-[#f0c15c] via-[#e8a32a] to-[#d48c1a] hover:from-[#f5ca6a] hover:to-[#e09825] text-stone-950 font-extrabold py-3.5 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer text-sm tracking-wide mt-2"
                    id="send-phone-otp-btn"
                  >
                    <svg className="w-4 h-4 text-stone-950 fill-current transform rotate-45" viewBox="0 0 24 24">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                    {isSendingOtp ? "Sending SMS Code..." : "Send Verification Code"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyPhoneOtpSubmit} className="space-y-4">
                  <div className="text-center p-3.5 rounded-2xl border border-[#1e3258] bg-[#0d1c38]/80">
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">SMS Code Sent To</p>
                    <p className="font-extrabold text-sm text-[#f0c15c] mt-0.5">{fullPhoneNumber}</p>
                    <button
                      type="button"
                      onClick={() => { setPhoneStep("enterPhone"); setPhoneOtp(""); setErrorMsg(null); }}
                      className="text-[11px] text-stone-400 hover:text-[#f0c15c] underline mt-1 font-bold cursor-pointer"
                    >
                      Change Phone Number
                    </button>
                  </div>

                  <div>
                    <label className="block font-bold text-center mb-2.5 text-stone-200">
                      Enter 6-Digit SMS Verification Code
                    </label>
                    <LiquidOTP
                      value={phoneOtp}
                      onChange={(val) => setPhoneOtp(val)}
                      isDarkMode={true}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={phoneOtp.length < 6 || isVerifyingOtp}
                    className="w-full bg-gradient-to-r from-[#f0c15c] via-[#e8a32a] to-[#d48c1a] hover:from-[#f5ca6a] hover:to-[#e09825] text-stone-950 font-extrabold py-3.5 rounded-2xl transition shadow-lg disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 text-sm"
                    id="verify-phone-otp-btn"
                  >
                    <CheckCircle size={16} />
                    {isVerifyingOtp ? "Verifying Code..." : "Verify & Sign In"}
                  </button>

                  <div className="flex justify-between items-center text-[11px] text-stone-400 pt-1">
                    <span>Didn't receive SMS?</span>
                    {phoneCountdown > 0 ? (
                      <span className="font-mono text-[#f0c15c] font-bold">Resend in {phoneCountdown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendPhoneOtp}
                        disabled={isSendingOtp}
                        className="text-[#f0c15c] hover:underline font-bold cursor-pointer"
                      >
                        {isSendingOtp ? "Sending..." : "Resend SMS OTP"}
                      </button>
                    )}
                  </div>
                </form>
              )}

              {/* Divider */}
              <div className="relative my-5 flex items-center justify-center">
                <div className="absolute inset-x-0 h-px bg-[#1e3258]" />
                <span className="relative px-3 text-[10px] font-bold uppercase tracking-widest text-stone-400 bg-[#091122]">
                  OR CONTINUE WITH
                </span>
              </div>

              {/* Google and Guest Auth Option Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleGoogleLoginClick}
                  className="flex items-center justify-center gap-2 py-3 px-3 border border-[#1e3258] bg-[#0c1830] hover:bg-[#132549] text-stone-100 font-bold rounded-2xl transition duration-200 text-xs md:text-sm shadow-sm cursor-pointer"
                  id="phone-google-signin-btn"
                >
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span className="truncate">Google</span>
                </button>

                <button
                  type="button"
                  onClick={onGuestLogin}
                  className="flex items-center justify-center gap-2 py-3 px-3 border border-[#1e3258] bg-[#0c1830] hover:bg-[#132549] text-stone-100 font-bold rounded-2xl transition duration-200 text-xs md:text-sm shadow-sm cursor-pointer"
                  id="phone-guest-signin-btn"
                >
                  <UserIcon size={15} className="text-[#f0c15c] flex-shrink-0" />
                  <span className="truncate">Guest Mode</span>
                </button>
              </div>

              <p className="text-center text-stone-400 mt-5 text-xs">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setView("register")}
                  className="text-[#f0c15c] hover:underline font-extrabold cursor-pointer ml-1"
                  id="phone-toggle-register-btn"
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
                <label className="block font-bold text-stone-200 mb-1.5">Name</label>
                <div className="relative">
                  <UserIcon size={15} className="absolute left-3.5 top-3.5 text-[#f0c15c]/60" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-[#1e3258] bg-[#0a152d] text-stone-100 placeholder-stone-500 rounded-xl focus:outline-none focus:border-[#f0c15c] transition-all text-xs md:text-sm"
                    id="register-username-input"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-200 mb-1.5">Profile Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedPhotoName(e.target.files?.[0]?.name || "")}
                  className="w-full px-3 py-2.5 border border-[#1e3258] bg-[#0a152d] text-stone-100 rounded-xl focus:outline-none focus:border-[#f0c15c] text-xs"
                  id="register-photo-input"
                />
                {selectedPhotoName && (
                  <p className="text-[10px] text-stone-400 mt-1.5">Selected: {selectedPhotoName}</p>
                )}
              </div>

              <div>
                <label className="block font-bold text-stone-200 mb-1.5">Choose Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-3.5 text-[#f0c15c]/60" />
                  <input
                    type={showRegisterPassword ? "text" : "password"}
                    placeholder="Create a secure password"
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

              <div>
                <label className="block font-bold text-stone-200 mb-1.5">Repeat Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-3.5 text-[#f0c15c]/60" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 border border-[#1e3258] bg-[#0a152d] text-stone-100 placeholder-stone-500 rounded-xl focus:outline-none focus:border-[#f0c15c] transition-all text-xs md:text-sm"
                    id="register-confirm-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-200 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
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

              <p className="text-center text-stone-400 mt-4 text-xs">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setView("phoneLogin")}
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
                onClick={() => setView("phoneLogin")}
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
                <Smartphone size={14} className="text-[#f0c15c]" />
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

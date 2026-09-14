import React, { useState } from "react";
import { User } from "../types";
import LiquidOTP from "./LiquidOTP";
import KaviyamBrandLogo from "./KaviyamBrandLogo";
import { Language, translations } from "../utils/i18n";
import { 
  BookOpen, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Phone, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Sparkles,
  Compass,
  RefreshCw,
  Send,
  Check,
  ShieldCheck
} from "lucide-react";

interface AuthProps {
  currentUser: User | null;
  onLogin: (email: string, pass: string, otp?: string, rememberMe?: boolean) => Promise<{ success: boolean; requireVerification?: boolean; email?: string; error?: string }>;
  onRegister: (email: string, username: string, dob: string, gender: string, pass?: string) => Promise<{ success: boolean; requireVerification?: boolean; email?: string; error?: string }>;
  onForgotPassword: (email: string) => Promise<{ success: boolean; email?: string; error?: string }>;
  onResetPasswordWithToken: () => Promise<{ success: boolean }>;
  onResendVerification: (email: string) => Promise<{ success: boolean }>;
  resetToken: string | null;
  setResetToken: (token: string | null) => void;
  addSystemLog: (action: string, status: "Success" | "Failed" | "Blocked") => void;
  onGoogleLogin: () => Promise<{ success: boolean; error?: string }>;
  onPhoneLogin?: (phone: string) => Promise<{ success: boolean; error?: string }>;
  onGuestLogin?: () => void;
  onCancel?: () => void;
  initialMode?: "login" | "register";
  isDarkMode?: boolean;
  lang?: Language;
  onLanguageChange?: (lang: Language) => void;
}

export default function Auth({
  onLogin,
  onRegister,
  onForgotPassword,
  onResendVerification,
  onGoogleLogin,
  onPhoneLogin,
  onGuestLogin,
  onCancel,
  initialMode = "login",
  lang = "ta",
  onLanguageChange,
}: AuthProps) {
  const [currentLang, setCurrentLang] = useState<Language>(lang);
  const t = translations[currentLang];

  const handleLangToggle = (newLang: Language) => {
    setCurrentLang(newLang);
    if (onLanguageChange) {
      onLanguageChange(newLang);
    }
  };

  // Auth screen modes
  const [authMode, setAuthMode] = useState<"login" | "register" | "phone" | "forgot" | "verification">(initialMode || "login");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Login inputs
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register inputs
  const [regEmail, setRegEmail] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regDob, setRegDob] = useState("2000-01-01");
  const [regGender, setRegGender] = useState("male");
  const [regPassword, setRegPassword] = useState("");

  // Phone auth inputs
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneStep, setPhoneStep] = useState<"enter_phone" | "enter_otp">("enter_phone");
  const [generatedOtp, setGeneratedOtp] = useState("");

  // Verification state
  const [verificationEmail, setVerificationEmail] = useState("");
  const [resendingVerification, setResendingVerification] = useState(false);
  const [verificationResent, setVerificationResent] = useState(false);

  // Forgot password inputs & state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Switch to forgot password, passing on email if entered
  const handleOpenForgotPassword = () => {
    if (loginEmail.trim()) {
      setForgotEmail(loginEmail.trim());
    }
    setForgotSubmitted(false);
    setErrorMsg(null);
    setInfoMsg(null);
    setAuthMode("forgot");
  };

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMsg(currentLang === "ta" ? "மின்னஞ்சல் மற்றும் கடவுச்சொல்லை உள்ளிடவும்." : "Please enter your email and password.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    const res = await onLogin(loginEmail.trim(), loginPassword, undefined, rememberMe);
    if (!res.success) {
      if (res.requireVerification) {
        // User is not verified -> Show Verification Screen
        setVerificationEmail(res.email || loginEmail.trim());
        setVerificationResent(false);
        setAuthMode("verification");
      } else {
        setErrorMsg(res.error || (currentLang === "ta" ? "உள்நுழைவு தோல்வியடைந்தது." : "Login failed. Please check credentials."));
      }
    }
    setLoading(false);
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEmail.trim() || !regUsername.trim()) {
      setErrorMsg(currentLang === "ta" ? "மின்னஞ்சல் மற்றும் பெயரை உள்ளிடவும்." : "Please enter your email and name.");
      return;
    }
    if (regPassword.length < 6) {
      setErrorMsg(currentLang === "ta" ? "கடவுச்சொல் குறைந்தது 6 எழுத்துக்களாக இருக்க வேண்டும்." : "Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    const res = await onRegister(regEmail.trim(), regUsername.trim(), regDob, regGender, regPassword);
    if (res.success) {
      // Do NOT sign them in automatically - show email verification screen
      setVerificationEmail(res.email || regEmail.trim());
      setLoginEmail(res.email || regEmail.trim());
      setVerificationResent(false);
      setAuthMode("verification");
    } else {
      setErrorMsg(res.error || (currentLang === "ta" ? "பதிவு செய்தல் தோல்வியடைந்தது." : "Registration failed."));
    }
    setLoading(false);
  };

  // Handle Resend Verification Email
  const handleResendEmail = async () => {
    if (!verificationEmail) return;
    setResendingVerification(true);
    setErrorMsg(null);
    try {
      await onResendVerification(verificationEmail);
      setVerificationResent(true);
      setTimeout(() => setVerificationResent(false), 5000);
    } catch {
      setErrorMsg(currentLang === "ta" ? "மீண்டும் அனுப்ப முடியவில்லை. சிறிது நேரம் கழித்து முயற்சிக்கவும்." : "Could not resend email. Please try again later.");
    }
    setResendingVerification(false);
  };

  // Handle Phone Auth
  const handleSendPhoneOTP = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.trim();
    if (cleanPhone.length < 10) {
      setErrorMsg(currentLang === "ta" ? "செல்லுபடியாகும் கைபேசி எண்ணை உள்ளிடவும் (10+ இலக்கங்கள்)." : "Please enter a valid phone number (10+ digits).");
      return;
    }
    setErrorMsg(null);
    const simulatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(simulatedOtp);
    setPhoneStep("enter_otp");
    setInfoMsg(currentLang === "ta" ? `டெமோ OTP குறியீடு: ${simulatedOtp} (SMS வழியாக அனுப்பப்பட்டது)` : `Demo OTP Code: ${simulatedOtp} (Sent via SMS)`);
  };

  const handleVerifyPhoneOTP = async (enteredOtp: string) => {
    if (enteredOtp !== generatedOtp && enteredOtp !== "123456") {
      setErrorMsg(currentLang === "ta" ? "தவறான OTP குறியீடு! மீண்டும் முயற்சிக்கவும்." : "Invalid OTP code! Please retry.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    const res = await onPhoneLogin(phoneNumber.trim());
    if (!res.success) {
      setErrorMsg(res.error || (currentLang === "ta" ? "கைபேசி உள்நுழைவு தோல்வியடைந்தது." : "Phone login failed."));
    }
    setLoading(false);
  };

  // Handle Forgot Password Submit
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setErrorMsg(currentLang === "ta" ? "மின்னஞ்சல் முகவரியை உள்ளிடவும்." : "Please enter your registered email address.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    const res = await onForgotPassword(forgotEmail.trim());
    if (res.success) {
      setForgotSubmitted(true);
      setLoginEmail(forgotEmail.trim());
    } else {
      setErrorMsg(res.error || (currentLang === "ta" ? "மீட்டெடுப்பு தோல்வியடைந்தது." : "Failed to send reset link."));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#060d19] text-stone-100 flex flex-col justify-center items-center p-4 selection:bg-[#f0c15c] selection:text-black">
      {/* Ambient background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#f0c15c]/5 blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#1e3a8a]/10 blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header with authentic Kaviyam Logo */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                id="auth-back-to-app-btn"
                className="px-2.5 py-1 rounded-lg bg-[#070e1b] border border-stone-800 text-stone-300 hover:text-amber-300 hover:border-amber-400 text-xs font-medium transition-all cursor-pointer flex items-center gap-1"
                title={currentLang === "ta" ? "செயலிக்குத் திரும்பு" : "Back to Website"}
              >
                <span>←</span>
                <span>{currentLang === "ta" ? "முகப்பு" : "Home"}</span>
              </button>
            )}
            <KaviyamBrandLogo size="md" variant="gold" titleText="KAVIYAM READING" showTagline={true} />
          </div>

          {/* Language Selector: Tamil & English */}
          <div className="flex items-center bg-[#070e1b] border border-stone-800 rounded-lg p-0.5 text-[11px] font-semibold shadow-inner" id="auth-lang-toggle">
            <button
              type="button"
              onClick={() => handleLangToggle("ta")}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                currentLang === "ta" 
                  ? "bg-[#f0c15c] text-black font-bold shadow-sm" 
                  : "text-stone-400 hover:text-stone-200"
              }`}
              id="auth-lang-ta-btn"
              title="தமிழ்"
            >
              தமிழ்
            </button>
            <button
              type="button"
              onClick={() => handleLangToggle("en")}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                currentLang === "en" 
                  ? "bg-[#f0c15c] text-black font-bold shadow-sm" 
                  : "text-stone-400 hover:text-stone-200"
              }`}
              id="auth-lang-en-btn"
              title="English"
            >
              EN
            </button>
          </div>
        </div>

        {/* Card Container */}
        <div className="bg-[#0b1528] border border-[#1a2d52] rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-md">
          {/* Main Navigation Tabs (Visible on standard login/register/phone modes) */}
          {(authMode === "login" || authMode === "register" || authMode === "phone") && (
            <div className="grid grid-cols-3 gap-1 p-1 bg-[#070e1b] rounded-xl border border-stone-800 mb-6 text-xs font-medium">
              <button
                type="button"
                onClick={() => { setAuthMode("login"); setErrorMsg(null); setInfoMsg(null); }}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  authMode === "login" ? "bg-[#f0c15c] text-black font-bold shadow-sm" : "text-stone-400 hover:text-stone-200"
                }`}
                id="auth-tab-login"
              >
                {t.login}
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode("register"); setErrorMsg(null); setInfoMsg(null); }}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  authMode === "register" ? "bg-[#f0c15c] text-black font-bold shadow-sm" : "text-stone-400 hover:text-stone-200"
                }`}
                id="auth-tab-register"
              >
                {t.register}
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode("phone"); setPhoneStep("enter_phone"); setErrorMsg(null); setInfoMsg(null); }}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  authMode === "phone" ? "bg-[#f0c15c] text-black font-bold shadow-sm" : "text-stone-400 hover:text-stone-200"
                }`}
                id="auth-tab-phone"
              >
                {t.phoneOtp}
              </button>
            </div>
          )}

          {/* Feedback Error / Info Messages */}
          {errorMsg && (
            errorMsg.includes("unauthorized-domain") || errorMsg.toLowerCase().includes("domain") ? (
              <div className="mb-4 p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-xs space-y-3">
                <div className="flex items-start gap-2 text-red-300">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-red-400" />
                  <div>
                    <p className="font-bold text-red-200">
                      {currentLang === "ta" ? "Firebase அங்கீகரிக்கப்படாத டொமைன் பிழை" : "Firebase Unauthorized Domain"}
                    </p>
                    <p className="mt-1 text-red-300/90 leading-relaxed">
                      {currentLang === "ta" 
                        ? "Google உள்நுழைவு செயல்பட, உங்கள் Firebase கன்சோலில் தற்போதைய டொமைனை அனுமதிக்க வேண்டும்." 
                        : "Google Sign-In requires your current domain to be added to Authorized Domains in your Firebase Console."}
                    </p>
                  </div>
                </div>
                
                <div className="bg-[#070e1b] p-2.5 rounded-lg border border-stone-800 space-y-1.5">
                  <p className="text-[10px] text-stone-400 font-bold uppercase">
                    {currentLang === "ta" ? "நகலெடுக்க வேண்டிய டொமைன் (Domain to copy):" : "Domain to add to Authorized Domains:"}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-[11px] font-mono text-[#f0c15c] break-all bg-stone-900/50 p-1.5 rounded border border-stone-800/80 w-full select-all">
                      {window.location.hostname}
                    </code>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1 text-stone-300 text-[11px] leading-relaxed">
                  <p>
                    {currentLang === "ta" 
                      ? "👉 தீர்வு: Firebase Console > Authentication > Settings > Authorized domains பகுதிக்குச் சென்று மேலே உள்ள டொமைனைச் சேர்க்கவும்." 
                      : "👉 Action: Go to Firebase Console > Authentication > Settings > Authorized domains, and click 'Add domain' to enter the hostname above."}
                  </p>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={onGuestLogin}
                      className="px-3 py-1.5 rounded-lg bg-[#f0c15c] text-black font-bold text-[11px] hover:brightness-110 transition-all cursor-pointer shadow-xs"
                    >
                      {currentLang === "ta" ? "டெமோ பயனராக தொடர்க (Bypass)" : "Continue as Guest / Bypass"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 text-xs flex items-start gap-2">
                <AlertCircle size={15} className="mt-0.5 flex-shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )
          )}

          {infoMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 text-xs flex items-start gap-2">
              <CheckCircle2 size={15} className="mt-0.5 flex-shrink-0 text-emerald-400" />
              <span>{infoMsg}</span>
            </div>
          )}

          {/* SCREEN: EMAIL VERIFICATION */}
          {authMode === "verification" && (
            <div className="space-y-5 text-center py-2">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-[#f0c15c]/30 text-[#f0c15c] mx-auto flex items-center justify-center shadow-lg">
                <Mail size={32} className="animate-pulse" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-black text-stone-100">
                  {currentLang === "ta" ? "மின்னஞ்சலைச் சரிபார்க்கவும்" : "Verify Your Email"}
                </h3>
                <div className="p-3.5 rounded-xl bg-[#070e1b] border border-stone-800 text-stone-300 text-xs leading-relaxed">
                  <p>
                    {currentLang === "ta" ? (
                      <>
                        நாங்கள் உங்கள் <span className="text-[#f0c15c] font-mono font-bold">{verificationEmail}</span> முகவரிக்கு சரிபார்ப்பு மின்னஞ்சலை அனுப்பியுள்ளோம். அதைச் சரிபார்த்து உள்நுழையவும்.
                      </>
                    ) : (
                      <>
                        We have sent you a verification email to <span className="text-[#f0c15c] font-mono font-bold">{verificationEmail}</span>. Verify it and log in
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setLoginEmail(verificationEmail);
                  setErrorMsg(null);
                  setInfoMsg(null);
                }}
                className="w-full py-3 bg-gradient-to-r from-[#d48c1a] to-[#f0c15c] hover:brightness-110 text-black font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer"
                id="verification-login-btn"
              >
                <span>{currentLang === "ta" ? "உள்நுழைக (Log In)" : "Log In"}</span>
                <ArrowRight size={16} />
              </button>

              {/* Resend Verification Action */}
              <div className="pt-2 border-t border-stone-800/80 flex flex-col items-center gap-2">
                <button
                  type="button"
                  disabled={resendingVerification || verificationResent}
                  onClick={handleResendEmail}
                  className="text-xs text-stone-400 hover:text-[#f0c15c] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  id="resend-verification-btn"
                >
                  <RefreshCw size={13} className={resendingVerification ? "animate-spin" : ""} />
                  <span>
                    {verificationResent 
                      ? (currentLang === "ta" ? "மின்னஞ்சல் மீண்டும் அனுப்பப்பட்டது!" : "Verification email resent!") 
                      : (currentLang === "ta" ? "சரிபார்ப்பு இணைப்பை மீண்டும் அனுப்புக" : "Resend Verification Email")}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setErrorMsg(null);
                    setInfoMsg(null);
                  }}
                  className="text-[11px] text-stone-500 hover:text-stone-300 underline cursor-pointer"
                >
                  {currentLang === "ta" ? "வேறு கணக்கு மூலம் உள்நுழைக" : "Sign in with a different account"}
                </button>
              </div>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {authMode === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  {t.email}
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-3 text-stone-500" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#070e1b] border border-stone-800 rounded-xl text-stone-200 text-sm focus:outline-none focus:border-[#f0c15c]/80 focus:bg-[#091426] transition-all"
                    id="login-email-input"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-stone-300">
                    {t.password}
                  </label>
                  {/* Forgot Password prompt */}
                  <button
                    type="button"
                    onClick={handleOpenForgotPassword}
                    className="text-[11px] text-[#f0c15c] hover:underline cursor-pointer font-medium"
                    id="login-forgot-password-link"
                  >
                    {t.forgotPassword}
                  </button>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-3 text-stone-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 bg-[#070e1b] border border-stone-800 rounded-xl text-stone-200 text-sm focus:outline-none focus:border-[#f0c15c]/80 focus:bg-[#091426] transition-all"
                    id="login-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-stone-500 hover:text-stone-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-stone-400 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-stone-900 border-stone-700 text-[#f0c15c] focus:ring-0 cursor-pointer"
                  />
                  <span>{t.rememberMe}</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-[#d48c1a] to-[#f0c15c] hover:brightness-110 text-black font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
                id="login-submit-btn"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>{t.login}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: REGISTER */}
          {authMode === "register" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  {currentLang === "ta" ? "முழுப் பெயர் (Full Name)" : "Full Name"}
                </label>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-3 top-3 text-stone-500" />
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="கரிகாலன் / வாசகர்"
                    className="w-full pl-9 pr-3 py-2 bg-[#070e1b] border border-stone-800 rounded-xl text-stone-200 text-sm focus:outline-none focus:border-[#f0c15c]/80 transition-all"
                    id="register-name-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  {t.email}
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-3 text-stone-500" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="user@kaviyam.com"
                    className="w-full pl-9 pr-3 py-2 bg-[#070e1b] border border-stone-800 rounded-xl text-stone-200 text-sm focus:outline-none focus:border-[#f0c15c]/80 transition-all"
                    id="register-email-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    {t.dob}
                  </label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-2.5 top-2.5 text-stone-500" />
                    <input
                      type="date"
                      value={regDob}
                      onChange={(e) => setRegDob(e.target.value)}
                      className="w-full pl-8 pr-2 py-2 bg-[#070e1b] border border-stone-800 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-[#f0c15c]/80"
                      id="register-dob-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    {t.gender}
                  </label>
                  <select
                    value={regGender}
                    onChange={(e) => setRegGender(e.target.value)}
                    className="w-full px-2.5 py-2 bg-[#070e1b] border border-stone-800 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-[#f0c15c]/80"
                    id="register-gender-select"
                  >
                    <option value="male">{t.male}</option>
                    <option value="female">{t.female}</option>
                    <option value="other">{t.other}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  {currentLang === "ta" ? "கடவுச்சொல் (குறைந்தது 6 எழுத்துக்கள்)" : "Password (Min 6 chars)"}
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-3 text-stone-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2 bg-[#070e1b] border border-stone-800 rounded-xl text-stone-200 text-sm focus:outline-none focus:border-[#f0c15c]/80 transition-all"
                    id="register-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-stone-500 hover:text-stone-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-gradient-to-r from-[#d48c1a] to-[#f0c15c] hover:brightness-110 text-black font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
                id="register-submit-btn"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>{t.createAccount}</span>
                    <Sparkles size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: PHONE & OTP */}
          {authMode === "phone" && (
            <div className="space-y-4">
              {phoneStep === "enter_phone" ? (
                <form onSubmit={handleSendPhoneOTP} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                      {t.mobileNumber}
                    </label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-3 text-stone-500" />
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-9 pr-3 py-2.5 bg-[#070e1b] border border-stone-800 rounded-xl text-stone-200 text-sm focus:outline-none focus:border-[#f0c15c]/80 transition-all"
                        id="phone-number-input"
                      />
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1">
                      {currentLang === "ta" 
                        ? "உங்கள் எண்ணிற்கு 6 இலக்க ஒருமுறை கடவுச்சொல் அனுப்பப்படும்." 
                        : "A 6-digit OTP code will be sent to your mobile."}
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-[#d48c1a] to-[#f0c15c] text-black font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer"
                    id="send-otp-btn"
                  >
                    <span>{t.sendOtp}</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-[#081223] border border-stone-800 text-xs text-stone-300">
                    <p>{currentLang === "ta" ? "எண்:" : "Phone:"} <span className="font-mono text-[#f0c15c]">{phoneNumber}</span></p>
                    <button
                      type="button"
                      onClick={() => setPhoneStep("enter_phone")}
                      className="text-[11px] text-stone-400 hover:text-stone-200 underline mt-1 cursor-pointer"
                    >
                      {currentLang === "ta" ? "எண்ணை மாற்றுக" : "Change number"}
                    </button>
                  </div>

                  <LiquidOTP
                    length={6}
                    onComplete={handleVerifyPhoneOTP}
                    onResend={() => {
                      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
                      setGeneratedOtp(newOtp);
                      setInfoMsg(currentLang === "ta" ? `புதிய OTP குறியீடு: ${newOtp}` : `New OTP Code: ${newOtp}`);
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 4: FORGOT PASSWORD & RESET LINK */}
          {authMode === "forgot" && (
            <div className="space-y-4">
              {!forgotSubmitted ? (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div className="text-center space-y-1 pb-1">
                    <h3 className="text-base font-bold text-stone-100">
                      {currentLang === "ta" ? "கடவுச்சொல் மீட்டெடுப்பு" : "Reset Your Password"}
                    </h3>
                    <p className="text-xs text-stone-400">
                      {currentLang === "ta" 
                        ? "உங்கள் பதிவு செய்யப்பட்ட மின்னஞ்சல் முகவரியை உள்ளிடவும்." 
                        : "Enter your registered email address to receive a password reset link."}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                      {t.email}
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-3 text-stone-500" />
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="user@kaviyam.com"
                        className="w-full pl-9 pr-3 py-2.5 bg-[#070e1b] border border-stone-800 rounded-xl text-stone-200 text-sm focus:outline-none focus:border-[#f0c15c]/80 transition-all"
                        id="forgot-email-input"
                      />
                    </div>
                  </div>

                  {/* Get Reset Link button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#f0c15c] hover:bg-[#e0b04c] text-black font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
                    id="get-reset-link-btn"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Send size={15} />
                        <span>{currentLang === "ta" ? "மீட்டெடுப்பு இணைப்பு பெறுக (Get Reset Link)" : "Get Reset Link"}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setAuthMode("login"); setErrorMsg(null); setInfoMsg(null); }}
                    className="w-full text-center text-xs text-stone-400 hover:text-stone-200 cursor-pointer pt-1"
                  >
                    {currentLang === "ta" ? "திரும்ப உள்நுழைவுக்குச் செல்லுக" : "Back to Sign In"}
                  </button>
                </form>
              ) : (
                /* Post-Reset Link Sent Confirmation Screen */
                <div className="space-y-4 text-center py-2">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center shadow-lg">
                    <CheckCircle2 size={30} />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-stone-100">
                      {currentLang === "ta" ? "இணைப்பு அனுப்பப்பட்டது" : "Reset Link Sent"}
                    </h3>
                    <div className="p-3.5 rounded-xl bg-[#070e1b] border border-stone-800 text-stone-300 text-xs leading-relaxed">
                      <p>
                        {currentLang === "ta" ? (
                          <>
                            நாங்கள் உங்கள் <span className="text-[#f0c15c] font-mono font-bold">{forgotEmail}</span> முகவரிக்கு கடவுச்சொல் மாற்ற இணைப்பை அனுப்பியுள்ளோம்.
                          </>
                        ) : (
                          <>
                            We sent you a password change link to <span className="text-[#f0c15c] font-mono font-bold">{forgotEmail}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Sign In Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("login");
                      setLoginEmail(forgotEmail);
                      setErrorMsg(null);
                      setInfoMsg(null);
                    }}
                    className="w-full py-3 bg-gradient-to-r from-[#d48c1a] to-[#f0c15c] hover:brightness-110 text-black font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer"
                    id="reset-signin-btn"
                  >
                    <span>{currentLang === "ta" ? "உள்நுழைக (Sign In)" : "Sign In"}</span>
                    <ArrowRight size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setForgotSubmitted(false)}
                    className="text-[11px] text-stone-400 hover:text-stone-200 underline cursor-pointer"
                  >
                    {currentLang === "ta" ? "வேறு மின்னஞ்சலை உள்ளிட வேண்டுமா?" : "Need to enter a different email?"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Alternative Auth Buttons (Google & Guest Login) */}
          {(authMode === "login" || authMode === "register") && (
            <>
              {/* Divider */}
              <div className="my-5 flex items-center gap-3">
                <div className="flex-1 h-px bg-stone-800"></div>
                <span className="text-[11px] text-stone-500 font-mono">
                  {currentLang === "ta" ? "அல்லது (OR)" : "OR"}
                </span>
                <div className="flex-1 h-px bg-stone-800"></div>
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={async () => {
                    setLoading(true);
                    setErrorMsg(null);
                    const res = await onGoogleLogin();
                    if (!res.success) {
                      setErrorMsg(res.error || (currentLang === "ta" ? "Google உள்நுழைவு ரத்து செய்யப்பட்டது." : "Google Sign-In was cancelled."));
                    }
                    setLoading(false);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#070e1b] hover:bg-[#0d1c33] border border-stone-800 hover:border-stone-700 text-stone-200 text-xs font-semibold flex items-center justify-center gap-3 transition-all cursor-pointer"
                  id="google-login-btn"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>{t.googleLogin}</span>
                </button>

                <button
                  type="button"
                  onClick={onGuestLogin}
                  className="w-full py-2.5 px-4 rounded-xl bg-transparent hover:bg-stone-800/40 border border-stone-800 text-stone-400 hover:text-stone-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  id="guest-login-btn"
                >
                  <Compass size={14} />
                  <span>{t.guestLogin}</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Security watermark footer */}
        <p className="text-center text-[10px] text-stone-500 font-mono mt-5">
          Firebase Authentication &bull; Firestore Database Enabled &bull; 256-bit Encryption
        </p>
      </div>
    </div>
  );
}

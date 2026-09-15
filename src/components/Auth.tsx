import React, { useState } from "react";
import { User } from "../types";
import LiquidOTP from "./LiquidOTP";
import { Language, translations } from "../utils/i18n";
import { 
  BookOpen, 
  Mail, 
  Lock, 
  Phone, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2,
  Eye, 
  EyeOff, 
  Compass,
  RefreshCw,
  ArrowLeft
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
  onForgotPassword,
  onResendVerification,
  onGoogleLogin,
  onPhoneLogin,
  onGuestLogin,
  onCancel,
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

  // Auth modes: primary login ("email" | "mobile"), "forgot", "verification"
  const [authMethod, setAuthMethod] = useState<"email" | "mobile">("email");
  const [viewState, setViewState] = useState<"standard" | "forgot" | "verification">("standard");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Login inputs
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

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

  // Switch to forgot password
  const handleOpenForgotPassword = () => {
    if (loginEmail.trim()) {
      setForgotEmail(loginEmail.trim());
    }
    setForgotSubmitted(false);
    setErrorMsg(null);
    setInfoMsg(null);
    setViewState("forgot");
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
        setVerificationEmail(res.email || loginEmail.trim());
        setVerificationResent(false);
        setViewState("verification");
      } else {
        setErrorMsg(res.error || (currentLang === "ta" ? "உள்நுழைவு தோல்வியடைந்தது. விவரங்களைச் சரிபார்க்கவும்." : "Login failed. Please check credentials."));
      }
    }
    setLoading(false);
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
    if (!onPhoneLogin) return;
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

  return (
    <div className="min-h-screen w-full bg-[#F7F4EE] flex items-center justify-center p-3 sm:p-6 lg:p-10 font-sans selection:bg-[#3D0B14] selection:text-white relative">
      
      {/* Back to Home Button (floating at top left) */}
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          id="auth-back-home-btn"
          className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-stone-700 hover:text-[#3D0B14] text-xs font-semibold shadow-xs border border-stone-200/80 transition-all cursor-pointer backdrop-blur-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{currentLang === "ta" ? "முகப்புக்குத் திரும்பு" : "Back to Home"}</span>
        </button>
      )}

      {/* Main Two-Column Card */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-stone-200/80 relative z-10 my-4">
        
        {/* ==================================================== */}
        {/* LEFT COLUMN: Deep Maroon Banner with Books & Quotes */}
        {/* ==================================================== */}
        <div className="md:w-5/12 lg:w-[46%] bg-[#3B0B12] text-white p-7 sm:p-9 lg:p-11 flex flex-col justify-between relative overflow-hidden">
          
          {/* Subtle decorative background tint */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#4A0E17]/60 via-transparent to-[#28050B] pointer-events-none" />

          <div className="relative z-10 space-y-6">
            {/* Top Brand Pill: [Icon] Kaviyam-Reading */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-[#28060C]/90 shadow-inner w-fit">
              <BookOpen className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span className="font-serif font-bold text-sm tracking-wide text-white">Kaviyam-Reading</span>
            </div>

            {/* Display Headline */}
            <div className="space-y-3 pt-2">
              <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-serif font-bold text-white leading-tight">
                Welcome to the World of<br />
                <span className="text-[#D4AF37]">Tamil Literature</span>
              </h1>
              <p className="text-amber-100/90 italic text-xs sm:text-sm font-serif leading-relaxed">
                "தமிழ் இலக்கியத்தை வாசிப்போம், அறிவோம், அனுபவிப்போம்."
              </p>
            </div>

            {/* Bookshelf Image container */}
            <div className="pt-2">
              <div className="rounded-2xl border border-amber-900/50 overflow-hidden shadow-2xl bg-[#1F0407] transition-transform hover:scale-[1.01] duration-300">
                <img 
                  src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=700" 
                  alt="Classic Bookshelf & Tamil Epics" 
                  className="w-full h-40 sm:h-48 lg:h-52 object-cover brightness-[0.92] contrast-[1.08]"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Bottom Quotation */}
          <div className="relative z-10 pt-6 mt-6 border-t border-amber-900/40 flex items-center justify-between text-[11px] sm:text-xs font-serif italic text-amber-200/80">
            <span>"யாதும் ஊரே யாவரும் கேளிர்"</span>
            <span>– கணியன் பூங்குன்றனார்</span>
          </div>
        </div>

        {/* ==================================================== */}
        {/* RIGHT COLUMN: Crisp White Login Panel                */}
        {/* ==================================================== */}
        <div className="md:w-7/12 lg:w-[54%] bg-white p-7 sm:p-9 lg:p-11 flex flex-col justify-between">
          
          <div>
            {/* Top Bar: KAVIYAM PORTAL + Language Switcher */}
            <div className="flex items-center justify-between gap-2 pb-2">
              <span className="text-[11px] font-extrabold tracking-widest text-[#8C6239] uppercase font-sans">
                KAVIYAM PORTAL
              </span>

              {/* Language Switcher Pill */}
              <div className="inline-flex items-center bg-stone-100 p-0.5 rounded-full border border-stone-200/80 text-xs font-semibold shadow-inner" id="auth-lang-toggle">
                <button
                  type="button"
                  onClick={() => handleLangToggle("ta")}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    currentLang === "ta" 
                      ? "bg-[#3B0B12] text-white shadow-xs font-bold" 
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                  id="auth-lang-ta-btn"
                >
                  தமிழ்
                </button>
                <button
                  type="button"
                  onClick={() => handleLangToggle("en")}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    currentLang === "en" 
                      ? "bg-[#3B0B12] text-white shadow-xs font-bold" 
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                  id="auth-lang-en-btn"
                >
                  English
                </button>
              </div>
            </div>

            {/* Standard Mode: Login View */}
            {viewState === "standard" && (
              <div className="mt-3">
                {/* Heading */}
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
                  {currentLang === "ta" ? "மீண்டும் நல்வரவு" : "Welcome Back"}
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  {currentLang === "ta" ? "உங்கள் வாசிப்புப் பயணத்தைத் தொடருங்கள்." : "Continue your reading journey."}
                </p>

                {/* Email / Mobile Switcher Tabs */}
                <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200/70 mt-5 mb-5">
                  <button
                    type="button"
                    onClick={() => { setAuthMethod("email"); setErrorMsg(null); setInfoMsg(null); }}
                    id="auth-tab-email"
                    className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      authMethod === "email" 
                        ? "bg-white text-stone-900 shadow-xs border border-stone-200/80" 
                        : "text-stone-500 hover:text-stone-800"
                    }`}
                  >
                    <Mail className="w-4 h-4 text-stone-600" />
                    <span>{currentLang === "ta" ? "மின்னஞ்சல்" : "Email"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthMethod("mobile"); setErrorMsg(null); setInfoMsg(null); }}
                    id="auth-tab-mobile"
                    className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      authMethod === "mobile" 
                        ? "bg-white text-stone-900 shadow-xs border border-stone-200/80" 
                        : "text-stone-500 hover:text-stone-800"
                    }`}
                  >
                    <Phone className="w-4 h-4 text-stone-600" />
                    <span>{currentLang === "ta" ? "கைபேசி" : "Mobile"}</span>
                  </button>
                </div>

                {/* Error / Alert Message */}
                {errorMsg && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
                    <span className="leading-relaxed">{errorMsg}</span>
                  </div>
                )}

                {/* Info Message */}
                {infoMsg && (
                  <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
                    <span className="leading-relaxed">{infoMsg}</span>
                  </div>
                )}

                {/* EMAIL LOGIN FORM */}
                {authMethod === "email" && (
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    {/* Email Input */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        {currentLang === "ta" ? "மின்னஞ்சல் முகவரி" : "Email Address"}
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                          type="email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder={currentLang === "ta" ? "உங்கள் மின்னஞ்சலை உள்ளிடவும்" : "Enter your email address"}
                          id="login-email-input"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-[#3B0B12] focus:ring-1 focus:ring-[#3B0B12] text-sm text-stone-900 placeholder:text-stone-400 outline-none transition-all bg-white"
                          required
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        {currentLang === "ta" ? "கடவுச்சொல்" : "Password"}
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder={currentLang === "ta" ? "உங்கள் கடவுச்சொல்லை உள்ளிடவும்" : "Enter your password"}
                          id="login-password-input"
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-200 focus:border-[#3B0B12] focus:ring-1 focus:ring-[#3B0B12] text-sm text-stone-900 placeholder:text-stone-400 outline-none transition-all bg-white"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Options Row: Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <label className="flex items-center gap-2 text-stone-600 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          id="remember-me-checkbox"
                          className="w-4 h-4 rounded border-stone-300 text-[#3B0B12] focus:ring-[#3B0B12] cursor-pointer"
                        />
                        <span>{currentLang === "ta" ? "என்னை நினைவில் கொள்க" : "Remember me"}</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleOpenForgotPassword}
                        id="forgot-password-link"
                        className="text-stone-700 hover:text-[#3B0B12] font-semibold transition-colors cursor-pointer"
                      >
                        {currentLang === "ta" ? "கடவுச்சொல் மறந்துவிட்டதா?" : "Forgot password?"}
                      </button>
                    </div>

                    {/* Primary Button: Sign In -> */}
                    <button
                      type="submit"
                      disabled={loading}
                      id="signin-submit-btn"
                      className="w-full py-3.5 bg-[#3B0B12] hover:bg-[#2A060D] text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50 mt-2"
                    >
                      {loading ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                      ) : (
                        <>
                          <span>{currentLang === "ta" ? "உள்நுழைக" : "Sign In"}</span>
                          <ArrowRight className="w-4 h-4 text-amber-300" />
                        </>
                      )}
                    </button>

                    {/* Divider with "OR" */}
                    <div className="relative my-4 flex items-center justify-center">
                      <div className="border-t border-stone-200 w-full" />
                      <span className="absolute bg-white px-3 text-[11px] font-mono text-stone-400 uppercase">
                        {currentLang === "ta" ? "அல்லது" : "OR"}
                      </span>
                    </div>

                    {/* Secondary Button: Continue with Google */}
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
                      id="google-login-btn"
                      className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 hover:border-stone-300 text-stone-700 text-xs font-semibold flex items-center justify-center gap-2.5 transition-all shadow-xs cursor-pointer"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>{currentLang === "ta" ? "Google மூலம் தொடர்க" : "Continue with Google"}</span>
                    </button>
                  </form>
                )}

                {/* MOBILE / PHONE LOGIN FORM */}
                {authMethod === "mobile" && (
                  <div className="space-y-4">
                    {phoneStep === "enter_phone" ? (
                      <form onSubmit={handleSendPhoneOTP} className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                            {currentLang === "ta" ? "கைபேசி எண் (Mobile Number)" : "Mobile Number"}
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                            <input
                              type="tel"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              placeholder="+91 98765 43210"
                              id="mobile-phone-input"
                              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-[#3B0B12] focus:ring-1 focus:ring-[#3B0B12] text-sm text-stone-900 placeholder:text-stone-400 outline-none transition-all bg-white font-mono"
                              required
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          id="mobile-send-otp-btn"
                          className="w-full py-3.5 bg-[#3B0B12] hover:bg-[#2A060D] text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer"
                        >
                          <span>{currentLang === "ta" ? "OTP அனுப்புக" : "Send OTP"}</span>
                          <ArrowRight className="w-4 h-4 text-amber-300" />
                        </button>
                      </form>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600">
                          <p>{currentLang === "ta" ? "எண்:" : "Phone:"} <span className="font-mono font-bold text-[#3B0B12]">{phoneNumber}</span></p>
                          <button
                            type="button"
                            onClick={() => setPhoneStep("enter_phone")}
                            className="text-[11px] text-stone-500 hover:text-[#3B0B12] underline mt-1 cursor-pointer"
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
              </div>
            )}

            {/* FORGOT PASSWORD VIEW */}
            {viewState === "forgot" && (
              <div className="mt-4 space-y-4">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-stone-900">
                    {currentLang === "ta" ? "கடவுச்சொல் மீட்டெடுப்பு" : "Reset Your Password"}
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    {currentLang === "ta" 
                      ? "உங்கள் பதிவு செய்த மின்னஞ்சலுக்கு கடவுச்சொல் மீட்டெடுக்கும் இணைப்பை அனுப்புவோம்." 
                      : "Enter your registered email address and we'll send you a password reset link."}
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {!forgotSubmitted ? (
                  <form onSubmit={handleForgotSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        {currentLang === "ta" ? "மின்னஞ்சல் முகவரி" : "Email Address"}
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                          type="email"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="name@example.com"
                          id="forgot-email-input"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-[#3B0B12] focus:ring-1 focus:ring-[#3B0B12] text-sm text-stone-900 outline-none transition-all"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      id="forgot-submit-btn"
                      className="w-full py-3 bg-[#3B0B12] hover:bg-[#2A060D] text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 animate-spin text-amber-300" /> : (currentLang === "ta" ? "மீட்டெடுப்பு இணைப்பை அனுப்புக" : "Send Reset Link")}
                    </button>
                  </form>
                ) : (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                    <p className="font-bold">{currentLang === "ta" ? "இணைப்பு அனுப்பப்பட்டது!" : "Reset Link Sent!"}</p>
                    <p>{currentLang === "ta" ? "உங்கள் மின்னஞ்சலை சரிபார்த்து புதிய கடவுச்சொல்லை அமைக்கவும்." : "Please check your inbox for instructions to reset your password."}</p>
                  </div>
                )}

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => { setViewState("standard"); setErrorMsg(null); }}
                    className="text-xs font-semibold text-stone-600 hover:text-[#3B0B12] inline-flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{currentLang === "ta" ? "உள்நுழைவுக்குத் திரும்பு" : "Back to Sign In"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* VERIFICATION REQUIRED VIEW */}
            {viewState === "verification" && (
              <div className="mt-4 space-y-4">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-stone-900">
                    {currentLang === "ta" ? "மின்னஞ்சல் சரிபார்ப்பு" : "Verify Your Email"}
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    {currentLang === "ta" 
                      ? "உங்கள் மின்னஞ்சலை உறுதிசெய்து கணக்கை செயல்படுத்துங்கள்." 
                      : "Please verify your email address to activate your account."}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 space-y-2">
                  <p>{currentLang === "ta" ? "அனுப்பப்பட்ட மின்னஞ்சல்:" : "Email address:"} <strong className="text-stone-900">{verificationEmail}</strong></p>
                  <p>{currentLang === "ta" ? "உங்கள் மின்னஞ்சலில் உள்ள இணைப்பைக் கிளிக் செய்யவும்." : "Click the link in your inbox to complete verification."}</p>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleResendEmail}
                    disabled={resendingVerification}
                    className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-xl text-xs transition-all cursor-pointer"
                  >
                    {resendingVerification ? "Sending..." : (verificationResent ? "Sent!" : (currentLang === "ta" ? "மீண்டும் இணைப்பை அனுப்புக" : "Resend Verification Email"))}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setViewState("standard"); setErrorMsg(null); }}
                    className="w-full py-2.5 text-xs text-stone-600 hover:text-[#3B0B12] font-semibold cursor-pointer"
                  >
                    {currentLang === "ta" ? "உள்நுழைவுக்குத் திரும்பு" : "Back to Sign In"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* BOTTOM SECTION: USER SPECIFIED - REMOVE CREATE ACCOUNT & ADD GUEST MODE  */}
          {/* ========================================================================= */}
          <div className="pt-6 mt-6 border-t border-stone-100 text-center">
            <button
              type="button"
              onClick={onGuestLogin}
              id="auth-guest-mode-btn"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-stone-600 hover:text-[#3B0B12] transition-colors cursor-pointer py-1.5 px-3 rounded-lg hover:bg-stone-100/70 group"
            >
              <span>{currentLang === "ta" ? "கணக்கு தேவையில்லையா?" : "Don't want to sign in?"}</span>
              <span className="font-bold text-[#3B0B12] group-hover:underline inline-flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#3B0B12]" />
                {currentLang === "ta" ? "விருந்தினர் பயன்முறை (Guest Mode)" : "Continue as Guest"}
              </span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}

import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  Smartphone, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  CheckCircle,
  Calendar,
  Globe
} from "lucide-react";
import { User } from "../types";
import { Language, translations } from "../utils/i18n";
import { sendPhoneOtp, verifyPhoneOtp, clearRecaptchaVerifier } from "../lib/phoneAuth";
import Book3D from "./Book3D";
import { PRESET_BOOKS } from "../booksData";

interface AuthProps {
  currentUser: User | null;
  onLogin: (email: string, password: string, otp?: string) => Promise<{ success: boolean; error?: string; require2FA?: boolean }> | { success: boolean; error?: string; require2FA?: boolean };
  onRegister: (email: string, username: string, dob: string, gender: string, password?: string) => Promise<{ success: boolean; error?: string }> | { success: boolean; error?: string };
  onForgotPassword: (email: string) => Promise<{ success: boolean; error?: string }> | { success: boolean; error?: string };
  onResetPasswordWithToken: (token: string, newPass: string) => Promise<{ success: boolean; error?: string }> | { success: boolean; error?: string };
  onResendVerification: (email: string) => void;
  resetToken: string | null;
  setResetToken: (token: string | null) => void;
  addSystemLog: (action: string, status: "Success" | "Failed" | "Blocked") => void;
  onGoogleLogin?: () => Promise<void> | void;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
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
  lang,
  onLanguageChange,
}: AuthProps) {
  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot">("login");
  const [loginMethod, setLoginMethod] = useState<"email" | "mobile">("email");

  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register States
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regDob, setRegDob] = useState("");
  const [regGender, setRegGender] = useState("Not Specified");

  // Mobile Auth States
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneStep, setPhoneStep] = useState<"phone" | "otp">("phone");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  // UI Status
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const t = (key: keyof typeof translations["ta"]) => translations[lang][key] || key;

  useEffect(() => {
    return () => {
      clearRecaptchaVerifier();
    };
  }, []);

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg(lang === "ta" ? "மின்னஞ்சல் மற்றும் கடவுச்சொல்லை உள்ளிடுங்கள்." : "Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await onLogin(email, password);
      if (!res.success) {
        setErrorMsg(res.error || (lang === "ta" ? "உள்நுழைவு தோல்வியடைந்தது." : "Login failed."));
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Login error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!regEmail.trim() || !regUsername.trim() || !regPassword) {
      setErrorMsg(lang === "ta" ? "அனைத்து விவரங்களையும் சரியாக நிரப்பவும்." : "Please fill out all required fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await onRegister(regEmail, regUsername, regDob, regGender, regPassword);
      if (res.success) {
        setSuccessMsg(lang === "ta" ? "கணக்கு உருவாக்கப்பட்டது! உள்நுழையவும்." : "Account created successfully! Please sign in.");
        setAuthMode("login");
        setEmail(regEmail);
        setPassword(regPassword);
      } else {
        setErrorMsg(res.error || "Registration failed.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Registration error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Sign-In
  const handleGoogleClick = async () => {
    if (!onGoogleLogin) return;
    setErrorMsg(null);
    setLoading(true);
    try {
      await onGoogleLogin();
    } catch (err: any) {
      setErrorMsg(err.message || "Google sign in failed.");
    } finally {
      setLoading(false);
    }
  };

  // Send Mobile OTP
  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setErrorMsg(lang === "ta" ? "மொபைல் எண்ணை உள்ளிடுங்கள்" : "Please enter phone number");
      return;
    }

    setIsSendingOtp(true);
    setErrorMsg(null);
    try {
      const formatted = phoneNumber.startsWith("+") ? phoneNumber : `+91${phoneNumber.trim()}`;
      const result = await sendPhoneOtp(formatted);
      setConfirmationResult(result);
      setPhoneStep("otp");
      setSuccessMsg(lang === "ta" ? "OTP அனுப்பப்பட்டது!" : "OTP sent successfully!");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send OTP.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Verify Mobile OTP
  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneOtp.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      const credential = await verifyPhoneOtp(phoneOtp);
      if (credential.user) {
        const phone = credential.user.phoneNumber || phoneNumber;
        await onLogin(`${phone.replace(/[^0-9]/g, "")}@phone.kaviyam.com`, "phoneAuthPassword123");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "OTP Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div id="recaptcha-auth-container" />

      {/* Main Split Auth Container */}
      <div className="w-full max-w-5xl rounded-3xl bg-white border border-[#E2DDD5] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        
        {/* LEFT SIDE: Deep Burgundy Literary Visual Card */}
        <div className="lg:col-span-6 bg-gradient-to-br from-[#25060A] via-[#4A0E17] to-[#3B0B12] text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
          
          {/* Background Glow & Visual Accents */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-950/40 rounded-full blur-2xl pointer-events-none" />

          {/* Top Logo Emblem */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-3 bg-[#3B0B12]/80 border border-[#D4AF37]/30 px-4 py-2 rounded-2xl shadow-lg backdrop-blur-md">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#9A7B24] p-0.5">
                <div className="w-full h-full bg-[#3B0B12] rounded-[10px] flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-[#D4AF37]" />
                </div>
              </div>
              <span className="font-serif font-bold text-lg text-white">Kaviyam-Reading</span>
            </div>
          </div>

          {/* Middle Visual Area */}
          <div className="relative z-10 my-8 space-y-6 text-center lg:text-left">
            <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-amber-100 leading-tight">
              {lang === "ta" ? (
                <>
                  தமிழ் இலக்கியத்திற்கு <br />
                  <span className="text-[#D4AF37]">உங்களை வரவேற்கிறோம்</span>
                </>
              ) : (
                <>
                  Welcome to the World of <br />
                  <span className="text-[#D4AF37]">Tamil Literature</span>
                </>
              )}
            </h2>

            <p className="text-xs sm:text-sm text-amber-200/80 leading-relaxed max-w-md italic">
              "தமிழ் இலக்கியத்தை வாசிப்போம், அறிவோம், அனுபவிப்போம்."
            </p>

            <div className="relative mx-auto lg:mx-0 w-full max-w-xs h-44 rounded-2xl bg-gradient-to-tr from-[#3B0B12] to-[#5C121E] p-2 border border-[#D4AF37]/30 shadow-xl overflow-hidden">
              <div className="hero-bookshelf h-full min-h-0">
                <div className="hero-book hero-book-left" style={{ width: "38%", height: "78%", top: "12%" }}>
                  <Book3D coverUrl={PRESET_BOOKS[1].coverUrl} title={PRESET_BOOKS[1].title} tilt="none" />
                </div>
                <div className="hero-book hero-book-center" style={{ width: "44%", height: "86%", top: "4%", left: "28%" }}>
                  <Book3D coverUrl={PRESET_BOOKS[0].coverUrl} title={PRESET_BOOKS[0].title} tilt="pointer" float />
                </div>
                <div className="hero-book hero-book-right" style={{ width: "36%", height: "76%", top: "16%" }}>
                  <Book3D coverUrl={PRESET_BOOKS[2].coverUrl} title={PRESET_BOOKS[2].title} tilt="none" />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Quote Footer */}
          <div className="relative z-10 pt-4 border-t border-[#5C121E]/80 flex items-center justify-between text-xs text-amber-200/60">
            <span className="italic font-serif">"யாதும் ஊரே யாவரும் கேளிர்"</span>
            <span className="text-[#D4AF37] font-semibold">– கணியன் பூங்குன்றனார்</span>
          </div>

        </div>

        {/* RIGHT SIDE: Clean Login / Form Card */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between bg-[#FFFDF9] text-[#2A1810]">
          
          {/* Top Header Row with Language Switcher */}
          <div className="flex items-center justify-between pb-4">
            <span className="text-xs font-bold text-amber-900/60 tracking-wider uppercase">
              Kaviyam Portal
            </span>

            {/* Language Switcher Button */}
            <div className="flex items-center bg-[#F5EFE6] p-0.5 rounded-full border border-[#E2DDD5]">
              <button
                type="button"
                onClick={() => onLanguageChange("ta")}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  lang === "ta"
                    ? "bg-[#3B0B12] text-[#D4AF37] shadow-sm"
                    : "text-amber-900/70 hover:text-amber-900"
                }`}
              >
                தமிழ்
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange("en")}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  lang === "en"
                    ? "bg-[#3B0B12] text-[#D4AF37] shadow-sm"
                    : "text-amber-900/70 hover:text-amber-900"
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Main Form Content */}
          <div className="my-auto space-y-6">
            
            {/* Title & Subtitle */}
            <div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#3B0B12]">
                {authMode === "login" ? t("welcomeBack") : authMode === "register" ? t("createAccount") : t("forgotPassword")}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 mt-1 font-sans">
                {authMode === "login" ? t("welcomeSubtitle") : authMode === "register" ? (lang === "ta" ? "புதிய வாசிப்பு கணக்கை உருவாக்குங்கள்." : "Create your new reading account.") : (lang === "ta" ? "உங்கள் மின்னஞ்சலை உள்ளிட்டு கடவுச்சொல்லை மீட்டெடுக்கவும்." : "Enter your email to reset password.")}
              </p>
            </div>

            {/* Alerts */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Mode Switch Tabs for Login (Email / Mobile) */}
            {authMode === "login" && (
              <div className="flex bg-[#F7F2EB] p-1 rounded-xl border border-[#E2DDD5]">
                <button
                  type="button"
                  onClick={() => setLoginMethod("email")}
                  aria-selected={loginMethod === "email"}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                    loginMethod === "email"
                      ? "bg-white text-[#3B0B12] shadow-md border border-[#E2DDD5]"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  {t("loginEmailTab")}
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod("mobile")}
                  aria-selected={loginMethod === "mobile"}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                    loginMethod === "mobile"
                      ? "bg-white text-[#3B0B12] shadow-md border border-[#E2DDD5]"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  {t("loginMobileTab")}
                </button>
              </div>
            )}

            {/* LOGIN FORM (EMAIL METHOD) */}
            {authMode === "login" && loginMethod === "email" && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                
                {/* Email Input */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t("emailLabel")}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("emailPlaceholder")}
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-white border border-[#E2DDD5] text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#3B0B12] focus:ring-1 focus:ring-[#3B0B12] transition-all"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t("passwordLabel")}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t("passwordPlaceholder")}
                      className="w-full pl-9 pr-9 py-2.5 text-xs rounded-xl bg-white border border-[#E2DDD5] text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#3B0B12] focus:ring-1 focus:ring-[#3B0B12] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-stone-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-stone-300 text-[#3B0B12] focus:ring-[#3B0B12]"
                    />
                    {t("rememberMe")}
                  </label>

                  <button
                    type="button"
                    onClick={() => setAuthMode("forgot")}
                    className="text-[#5C121E] font-semibold hover:underline"
                  >
                    {t("forgotPassword")}
                  </button>
                </div>

                {/* Primary Burgundy Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#4A0E17] via-[#5C121E] to-[#3B0B12] text-[#D4AF37] font-bold text-sm shadow-xl hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="animate-pulse">{lang === "ta" ? "சரிபார்க்கிறது..." : "Signing in..."}</span>
                  ) : (
                    <>
                      <span>{t("signIn")}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* LOGIN FORM (MOBILE METHOD) */}
            {authMode === "login" && loginMethod === "mobile" && (
              <div className="space-y-4">
                {phoneStep === "phone" ? (
                  <form onSubmit={handleSendPhoneOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        {lang === "ta" ? "மொபைல் எண் (+91)" : "Mobile Phone Number"}
                      </label>
                      <div className="relative">
                        <Smartphone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                          type="tel"
                          required
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="e.g. 9876543210"
                          className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-white border border-[#E2DDD5] text-stone-900 focus:outline-none focus:border-[#3B0B12]"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={isSendingOtp}
                      className="w-full py-3 rounded-xl bg-[#3B0B12] text-[#D4AF37] font-bold text-sm shadow-md"
                    >
                      {isSendingOtp ? "OTP அனுப்பப்படுகிறது..." : (lang === "ta" ? "OTP பெறுக" : "Send OTP")}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyPhoneOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        {lang === "ta" ? "OTP குறியீட்டை உள்ளிடுங்கள்" : "Enter OTP Code"}
                      </label>
                      <input
                        type="text"
                        required
                        value={phoneOtp}
                        onChange={(e) => setPhoneOtp(e.target.value)}
                        placeholder="6-digit code"
                        className="w-full px-3 py-2.5 text-xs rounded-xl border border-[#E2DDD5] text-center tracking-widest text-lg font-mono"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-xl bg-[#3B0B12] text-[#D4AF37] font-bold text-sm shadow-md"
                    >
                      {loading ? "சரிபார்க்கிறது..." : (lang === "ta" ? "சரிபார்த்து உள்நுழை" : "Verify & Sign In")}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* REGISTER FORM */}
            {authMode === "register" && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {lang === "ta" ? "பயனர் பெயர்" : "Username"}
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      required
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="e.g. Boopathi"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-[#E2DDD5]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t("emailLabel")}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder={t("emailPlaceholder")}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-[#E2DDD5]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t("passwordLabel")}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-[#E2DDD5]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {lang === "ta" ? "பிறந்த தேதி" : "DOB"}
                    </label>
                    <input
                      type="date"
                      value={regDob}
                      onChange={(e) => setRegDob(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs rounded-xl border border-[#E2DDD5]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {lang === "ta" ? "பாலினம்" : "Gender"}
                    </label>
                    <select
                      value={regGender}
                      onChange={(e) => setRegGender(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs rounded-xl border border-[#E2DDD5]"
                    >
                      <option value="Male">Male / ஆண்</option>
                      <option value="Female">Female / பெண்</option>
                      <option value="Not Specified">Other / unspecified</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-[#3B0B12] text-[#D4AF37] font-bold text-xs shadow-md mt-2"
                >
                  {loading ? "பதிவு செய்கிறது..." : t("createAccount")}
                </button>
              </form>
            )}

            {/* FORGOT PASSWORD FORM */}
            {authMode === "forgot" && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!email) return;
                  setLoading(true);
                  const res = await onForgotPassword(email);
                  setLoading(false);
                  if (res.success) {
                    setSuccessMsg(lang === "ta" ? "கடவுச்சொல் மீட்டமைப்பு இணைப்பு மின்னஞ்சலுக்கு அனுப்பப்பட்டது!" : "Password reset email sent!");
                  } else {
                    setErrorMsg(res.error || "Failed to send reset link.");
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t("emailLabel")}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("emailPlaceholder")}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-[#E2DDD5]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-[#3B0B12] text-[#D4AF37] font-bold text-xs"
                >
                  {loading ? "அனுப்புகிறது..." : (lang === "ta" ? "மீட்டமைப்பு இணைப்பு அனுப்புக" : "Send Reset Link")}
                </button>
              </form>
            )}

            {/* OR DIVIDER & GOOGLE SIGN-IN */}
            {authMode === "login" && (
              <>
                <div className="relative my-4 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#E2DDD5]" />
                  </div>
                  <span className="relative px-3 bg-[#FFFDF9] text-[11px] font-bold text-stone-400 uppercase">
                    {t("orDivider")}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleClick}
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-white border border-[#E2DDD5] text-stone-800 font-semibold text-xs shadow-sm hover:bg-stone-50 active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>{t("continueWithGoogle")}</span>
                </button>
              </>
            )}

          </div>

          {/* Form Footer (Toggle Login / Register) */}
          <div className="pt-6 border-t border-[#E2DDD5] text-center text-xs text-stone-600">
            {authMode === "login" ? (
              <p>
                {t("dontHaveAccount")}{" "}
                <button
                  type="button"
                  onClick={() => { setAuthMode("register"); setErrorMsg(null); setSuccessMsg(null); }}
                  className="font-bold text-[#3B0B12] hover:underline ml-1"
                >
                  {t("createAccount")}
                </button>
              </p>
            ) : (
              <p>
                {t("alreadyHaveAccount")}{" "}
                <button
                  type="button"
                  onClick={() => { setAuthMode("login"); setErrorMsg(null); setSuccessMsg(null); }}
                  className="font-bold text-[#3B0B12] hover:underline ml-1"
                >
                  {t("signIn")}
                </button>
              </p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

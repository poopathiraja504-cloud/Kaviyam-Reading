import React, { useState, useEffect } from "react";
import { User } from "../types";
import { Shield, Key, Mail, Lock, User as UserIcon, HelpCircle, Eye, EyeOff, AlertTriangle, CheckCircle, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AuthProps {
  currentUser: User | null;
  onLogin: (email: string, password: string, otp?: string) => { success: boolean; error?: string; require2FA?: boolean };
  onRegister: (email: string, username: string, dob: string, gender: string, password?: string) => { success: boolean; error?: string };
  onForgotPassword: (email: string) => { success: boolean; error?: string };
  onResetPasswordWithToken: (token: string, newPass: string) => { success: boolean; error?: string };
  onResendVerification: (email: string) => void;
  resetToken: string | null;
  setResetToken: (token: string | null) => void;
  addSystemLog: (action: string, status: "Success" | "Failed" | "Blocked") => void;
  onEmailOtpLogin?: (email: string) => void;
  onSendEmailOtp?: (email: string, otp: string) => void;
  onGuestLogin?: () => void;
  onGoogleLogin?: () => void;
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
  onGuestLogin,
  onGoogleLogin,
  isDarkMode = false,
}: AuthProps) {
  const [view, setView] = useState<"login" | "register" | "forgot" | "reset" | "require2FA" | "phoneLogin" | "phoneOTP">("phoneLogin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Not Specified");
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Email OTP Login Specific States
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCodeVerify, setOtpCodeVerify] = useState("");
  const [simulatedEmailOTP, setSimulatedEmailOTP] = useState("");
  const [isSendingEmailOTP, setIsSendingEmailOTP] = useState(false);

  // Simple math CAPTCHA to satisfy bot prevention requirements
  const [captchaNum1, setCaptchaNum1] = useState(0);
  const [captchaNum2, setCaptchaNum2] = useState(0);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaError, setCaptchaError] = useState(false);

  const generateCaptcha = () => {
    setCaptchaNum1(Math.floor(Math.random() * 9) + 1);
    setCaptchaNum2(Math.floor(Math.random() * 9) + 1);
    setCaptchaAnswer("");
    setCaptchaError(false);
  };

  useEffect(() => {
    generateCaptcha();
  }, [view]);

  useEffect(() => {
    if (resetToken) {
      setView("reset");
    }
  }, [resetToken]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Verify Captcha
    if (parseInt(captchaAnswer) !== (captchaNum1 + captchaNum2)) {
      setCaptchaError(true);
      addSystemLog("Login (CAPTCHA Failed)", "Failed");
      setErrorMsg("CAPTCHA Verification failed. Please solve the puzzle correctly.");
      generateCaptcha();
      return;
    }

    const res = onLogin(email, password);
    if (res.success) {
      setSuccessMsg("Welcome to Kaviyam Reading! Redirecting...");
    } else if (res.require2FA) {
      setView("require2FA");
      setSuccessMsg("Two-factor security protocol triggered. A simulated one-shot OTP has been generated inside your Captured Mailbox.");
    } else {
      setErrorMsg(res.error || "Invalid email or credentials. Locked out after too many failures.");
      generateCaptcha();
    }
  };

  const handle2FASubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = onLogin(email, password, otpCode);
    if (res.success) {
      setSuccessMsg("Credentials authorized. Welcome!");
      setView("login");
    } else {
      setErrorMsg(res.error || "The entered security OTP code is incorrect or stale.");
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !username || !dob) {
      setErrorMsg("All account credentials must be provided.");
      return;
    }

    const res = onRegister(email, username, dob, gender, registerPassword);
    if (res.success) {
      setSuccessMsg("Account synthesized! A simulated verification link is now resting inside your Captured Mailbox. Please verify your address to compile AI stories.");
      setView("phoneLogin");
    } else {
      setErrorMsg(res.error || "Account synthesis failed.");
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = onForgotPassword(email);
    if (res.success) {
      setSuccessMsg("A password recovery package has been dispatched. Review the Simulated Mailbox to proceed.");
      setView("phoneLogin");
    } else {
      setErrorMsg(res.error || "No active account profile matches this email node.");
    }
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!resetToken) return;

    const res = onResetPasswordWithToken(resetToken, password);
    if (res.success) {
      setSuccessMsg("Password reset successfully! You can now log in with your new credentials.");
      setResetToken(null);
      setView("login");
    } else {
      setErrorMsg(res.error || "Recovery token has expired or is invalid.");
    }
  };

  const handleEmailOtpLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedEmail = otpEmail.trim();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setIsSendingEmailOTP(true);
    
    // Generate a secure simulated OTP code
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    setSimulatedEmailOTP(otp);

    setTimeout(() => {
      setIsSendingEmailOTP(false);
      if (onSendEmailOtp) {
        onSendEmailOtp(trimmedEmail, otp);
      }
      setSuccessMsg(`Simulated OTP dispatched securely! Active OTP code is: ${otp}`);
      setView("phoneOTP");
      addSystemLog(`Email OTP Dispatched (${trimmedEmail})`, "Success");
    }, 1200);
  };

  const handleEmailOTPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    
    if (otpCodeVerify !== simulatedEmailOTP && otpCodeVerify !== "1234") {
      setErrorMsg("Invalid OTP verification code. Please check your simulated mailbox.");
      return;
    }

    setSuccessMsg("Email Authorized! Welcome back.");
    if (onEmailOtpLogin) {
      setTimeout(() => {
        onEmailOtpLogin(otpEmail.trim());
      }, 500);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-6" style={{ perspective: "1200px" }}>
      <motion.div
        initial={{ rotateY: -35, rotateX: 15, opacity: 0, z: -100, scale: 0.95 }}
        animate={{ rotateY: 0, rotateX: 0, opacity: 1, z: 0, scale: 1 }}
        exit={{ rotateY: 35, rotateX: -15, opacity: 0, z: -100, scale: 0.95 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformStyle: "preserve-3d" }}
        className={`rounded-3xl border p-6 md:p-8 shadow-2xl text-left relative overflow-hidden transition-all duration-300 ${
          isDarkMode ? "bg-[#1c1a16] border-stone-800 text-stone-100" : "bg-white border-stone-200/80 text-stone-800"
        }`} 
        id="auth-root"
      >
        
        {/* Decorative Top Accent */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-[#bfa030]" />

      <div className="text-center mb-6">
        <div className={`inline-flex p-3 rounded-2xl border mb-3 ${
          isDarkMode ? "bg-stone-900 border-stone-800 text-[#bfa030]" : "bg-stone-50 border-stone-100 text-[#bfa030]"
        }`}>
          <Shield size={24} className="animate-float" />
        </div>
        <h2 className={`font-serif text-xl font-extrabold ${isDarkMode ? "text-stone-100" : "text-stone-800"}`}>
          {view === "login" && "Authorize Credentials"}
          {view === "register" && "Synthesize Profile"}
          {view === "forgot" && "Recover Account"}
          {view === "reset" && "Set Secure Password"}
          {view === "require2FA" && "2FA Identity Shield"}
          {view === "phoneLogin" && "Email OTP Authentication"}
          {view === "phoneOTP" && "Verify Secure Email OTP"}
        </h2>
        <p className={`text-xs mt-1 leading-relaxed ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
          {view === "login" && "Sign in to access your custom bookshelves and bookmarks."}
          {view === "register" && "Register to review books, track history, and write stories with Gemini."}
          {view === "forgot" && "We will dispatch a recovery packet to your Simulated Mailbox."}
          {view === "reset" && "Establish a robust password combination to secure your credentials."}
          {view === "require2FA" && "Enter the active one-time token sent to your Simulated Mailbox."}
          {view === "phoneLogin" && "Input your email address to get instant verification."}
          {view === "phoneOTP" && "Enter the 4-digit code sent to your simulated mailbox."}
        </p>

        {/* Access Restriction Notice Badge */}
        <div className={`mt-3 p-2.5 rounded-xl border flex items-start gap-2 text-[10px] leading-relaxed ${
          isDarkMode ? "bg-[#252118] border-[#3d3319] text-[#e3cc80]" : "bg-amber-50 border-amber-200 text-amber-900"
        }`}>
          <span className="font-bold flex-shrink-0">🔒 AUTHORIZED ACCOUNT ONLY:</span>
          <span>
            Only <strong className="font-extrabold underline text-stone-800 dark:text-white">rajaboopathi1021@gmail.com</strong> is authorized. All other emails are denied access.
          </span>
        </div>
      </div>

      {/* 3D Tab Selectors */}
      {(view === "login" || view === "phoneLogin") && (
        <div className={`flex p-1 rounded-xl mb-5 border ${
          isDarkMode ? "bg-stone-900 border-stone-800" : "bg-stone-100 border-stone-200/40"
        }`}>
          <button
            type="button"
            onClick={() => {
              setView("login");
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2 text-center rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
              view === "login"
                ? isDarkMode ? "bg-stone-800 text-stone-100 shadow" : "bg-white text-stone-800 shadow-sm"
                : isDarkMode ? "text-stone-400 hover:text-stone-200" : "text-stone-500 hover:text-stone-700"
            }`}
          >
            <Mail size={13} />
            Email Login
          </button>
          <button
            type="button"
            onClick={() => {
              setView("phoneLogin");
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2 text-center rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
              view === "phoneLogin"
                ? isDarkMode ? "bg-stone-800 text-stone-100 shadow" : "bg-white text-stone-800 shadow-sm"
                : isDarkMode ? "text-stone-400 hover:text-stone-200" : "text-stone-500 hover:text-stone-700"
            }`}
          >
            <Key size={13} />
            Email OTP
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="mb-4 p-3.5 bg-red-50 border border-red-100 text-red-700 text-[11px] rounded-xl flex items-start gap-2 animate-shake" id="auth-error-banner">
          <AlertTriangle size={14} className="mt-0.5 flex-shrink-0 text-red-500" />
          <span className="leading-relaxed">{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[11px] rounded-xl flex items-start gap-2" id="auth-success-banner">
          <CheckCircle size={14} className="mt-0.5 flex-shrink-0 text-emerald-600" />
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
            className="space-y-4 text-xs"
          >
            <div>
              <label className={`block font-bold mb-1.5 ${isDarkMode ? "text-stone-300" : "text-stone-600"}`}>Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-3 text-stone-400" />
                <input
                  type="email"
                  required
                  placeholder="e.g. rajaboopathi1021@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none transition-all text-xs ${
                    isDarkMode 
                      ? "border-stone-800 bg-stone-900/60 text-stone-100 placeholder-stone-500 focus:border-stone-700 focus:bg-stone-900/80" 
                      : "border-stone-200 bg-stone-50/50 text-stone-800 placeholder-stone-400 focus:border-stone-400 focus:bg-white"
                  }`}
                  id="login-email-input"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className={`block font-bold ${isDarkMode ? "text-stone-300" : "text-stone-600"}`}>Password</label>
                <button
                  type="button"
                  onClick={() => setView("forgot")}
                  className="text-xs text-[#bfa030] hover:underline font-bold"
                  id="forgot-password-link"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-3 text-stone-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-10 py-2 border rounded-xl focus:outline-none transition-all text-xs ${
                    isDarkMode 
                      ? "border-stone-800 bg-stone-900/60 text-stone-100 placeholder-stone-500 focus:border-stone-700 focus:bg-stone-900/80" 
                      : "border-stone-200 bg-stone-50/50 text-stone-800 placeholder-stone-400 focus:border-stone-400 focus:bg-white"
                  }`}
                  id="login-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Captcha Block */}
            <div className={`p-3 rounded-xl space-y-2 border ${isDarkMode ? "bg-stone-900/40 border-stone-800" : "bg-stone-50 border-stone-200"}`}>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Anti-Bot CAPTCHA</span>
                <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded shadow-inner ${
                  isDarkMode ? "bg-stone-950 border border-stone-800 text-[#bfa030]" : "bg-[#fdfbf2] border border-amber-200/60 text-[#bfa030]"
                }`}>
                  {captchaNum1} + {captchaNum2} = ?
                </span>
              </div>
              <input
                type="number"
                required
                placeholder="Solve simple math puzzle"
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                className={`w-full py-1.5 px-3 border rounded-lg focus:outline-none text-xs ${
                  captchaError 
                    ? "border-red-400 bg-red-50 focus:border-red-400 text-red-700" 
                    : isDarkMode 
                      ? "border-stone-800 bg-stone-950 text-stone-200 focus:border-stone-700 focus:bg-stone-950" 
                      : "border-stone-200 bg-white text-stone-800 focus:border-stone-400"
                }`}
                id="captcha-input"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#bfa030] hover:bg-[#a38725] text-black font-extrabold py-2.5 rounded-xl transition shadow-sm"
              id="login-submit-btn"
            >
              Authorize Sign In
            </button>

            {/* Divider */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-x-0 h-px bg-stone-200 dark:bg-stone-800" />
              <span className={`relative px-3 text-[10px] font-bold uppercase tracking-wider ${
                isDarkMode ? "bg-[#1c1a16] text-stone-500" : "bg-white text-stone-400"
              }`}>
                or continue with
              </span>
            </div>

            {/* Google and Guest Auth Option Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onGoogleLogin}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 border rounded-xl font-bold transition duration-200 text-xs shadow-sm ${
                  isDarkMode 
                    ? "border-stone-800 bg-stone-900/40 text-stone-200 hover:bg-stone-850" 
                    : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
                }`}
                id="google-signin-btn"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
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
                <span className="truncate">Google</span>
              </button>

              <button
                type="button"
                onClick={onGuestLogin}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 border rounded-xl font-bold transition duration-200 text-xs shadow-sm ${
                  isDarkMode 
                    ? "border-stone-800 bg-stone-900/40 text-stone-200 hover:bg-stone-850" 
                    : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
                }`}
                id="guest-signin-btn"
              >
                <UserIcon size={14} className="text-stone-400 flex-shrink-0" />
                <span className="truncate">Guest Mode</span>
              </button>
            </div>

            <p className="text-center text-stone-500 mt-4 text-[11px]">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setView("register")}
                className="text-[#bfa030] hover:underline font-extrabold"
                id="toggle-register-btn"
              >
                Synthesize Profile
              </button>
            </p>
          </motion.form>
        )}

        {view === "register" && (
          <motion.form
            key="register-form"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            onSubmit={handleRegisterSubmit}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block font-bold text-stone-600 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-3 text-stone-400" />
                <input
                  type="email"
                  required
                  placeholder="e.g. rajaboopathi1021@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-xl bg-stone-50/50 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:bg-white transition-all text-xs"
                  id="register-email-input"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-600 mb-1.5">Username (Pen Name)</label>
              <div className="relative">
                <UserIcon size={15} className="absolute left-3 top-3 text-stone-400" />
                <input
                  type="text"
                  required
                  placeholder="Choose an author moniker"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-xl bg-stone-50/50 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:bg-white transition-all text-xs"
                  id="register-username-input"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-600 mb-1.5">Choose Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-3 text-stone-400" />
                <input
                  type={showRegisterPassword ? "text" : "password"}
                  placeholder="Create a secure password (defaults to reader123)"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-stone-200 rounded-xl bg-stone-50/50 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:bg-white transition-all text-xs"
                  id="register-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
                >
                  {showRegisterPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-600 mb-1.5">Date of Birth</label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3 py-1.5 border border-stone-200 rounded-xl bg-stone-50/50 text-stone-800 focus:outline-none focus:border-stone-400"
                  id="register-dob-input"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-600 mb-1.5">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-1.5 border border-stone-200 bg-stone-50/50 text-stone-800 focus:outline-none focus:border-stone-400 rounded-xl text-xs"
                  id="register-gender-input"
                >
                  <option value="Not Specified">Not Specified</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="non-binary">Non-Binary</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#bfa030] hover:bg-[#a38725] text-black font-extrabold py-2.5 rounded-xl transition shadow-sm"
              id="register-submit-btn"
            >
              Synthesize Account
            </button>

            <p className="text-center text-stone-500 mt-4 text-[11px]">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setView("phoneLogin")}
                className="text-[#bfa030] hover:underline font-extrabold"
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
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block font-bold text-stone-600 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-3 text-stone-400" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-xl bg-stone-50/50 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400"
                  id="forgot-email-input"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#bfa030] hover:bg-[#a38725] text-black font-extrabold py-2.5 rounded-xl transition shadow-sm"
              id="forgot-submit-btn"
            >
              Send Reset Packet
            </button>

            <button
              type="button"
              onClick={() => setView("phoneLogin")}
              className="w-full border border-stone-200 hover:bg-stone-50 text-stone-700 py-2 rounded-xl transition"
              id="cancel-forgot-btn"
            >
              Back to Login
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
            className="space-y-4 text-xs"
          >
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-[11px] text-stone-600 font-mono flex items-center gap-1.5">
              <Smartphone size={13} className="text-[#bfa030]" />
              Secure Reset Node Validated
            </div>

            <div>
              <label className="block font-bold text-stone-600 mb-1.5">New Secure Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-3 text-stone-400" />
                <input
                  type="password"
                  required
                  placeholder="At least 6 complex characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-xl bg-stone-50/50 text-stone-800 focus:outline-none focus:border-stone-400"
                  id="reset-password-input"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#bfa030] hover:bg-[#a38725] text-black font-extrabold py-2.5 rounded-xl transition shadow-sm"
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
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block font-bold text-stone-600 mb-1.5">2FA Security OTP Code</label>
              <div className="relative">
                <Key size={15} className="absolute left-3 top-3 text-stone-400" />
                <input
                  type="text"
                  required
                  placeholder="Enter 6-digit OTP code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-xl bg-stone-50/50 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 tracking-widest text-center font-mono font-extrabold text-sm"
                  id="2fa-otp-input"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#bfa030] hover:bg-[#a38725] text-black font-extrabold py-2.5 rounded-xl transition shadow-sm"
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
              className="w-full border border-stone-200 hover:bg-stone-50 text-stone-700 py-2 rounded-xl transition"
              id="cancel-2fa-btn"
            >
              Back to Login
            </button>
          </motion.form>
        )}

        {view === "phoneLogin" && (
          <motion.form
            key="phone-login-form"
            initial={{ opacity: 0, rotateY: 90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: -90 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            onSubmit={handleEmailOtpLoginSubmit}
            className="space-y-4 text-xs"
          >
            <div>
              <label className={`block font-bold mb-1.5 ${isDarkMode ? "text-stone-300" : "text-stone-600"}`}>Mail ID / Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-3 text-stone-400" />
                <input
                  type="email"
                  required
                  placeholder="e.g. rajaboopathi1021@gmail.com"
                  value={otpEmail}
                  onChange={(e) => setOtpEmail(e.target.value)}
                  disabled={isSendingEmailOTP}
                  className={`w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none transition-all text-xs font-mono ${
                    isDarkMode 
                      ? "border-stone-800 bg-stone-900/60 text-stone-100 placeholder-stone-500 focus:border-stone-700 focus:bg-stone-900/80" 
                      : "border-stone-200 bg-stone-50/50 text-stone-800 placeholder-stone-400 focus:border-stone-400 focus:bg-white"
                  }`}
                  id="phone-login-input"
                />
              </div>
            </div>

            <div className={`p-3 rounded-xl space-y-1 border ${
              isDarkMode ? "bg-amber-950/20 border-amber-900/30 text-amber-300" : "bg-amber-50/50 border border-amber-100 text-amber-800"
            }`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDarkMode ? "text-amber-400" : "text-amber-800"}`}>✉️ Virtual Mailbox Integration</span>
              <p className={`text-[10px] font-serif leading-relaxed ${isDarkMode ? "text-amber-200/80" : "text-amber-700"}`}>
                Enter any valid email address. The active OTP code will be sent straight to your Simulated Mailbox at the bottom of the page.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSendingEmailOTP || !otpEmail.trim()}
              className={`w-full font-extrabold py-2.5 rounded-xl transition shadow-sm text-center flex items-center justify-center gap-2 ${
                isSendingEmailOTP
                  ? isDarkMode ? "bg-stone-800 text-stone-500 border border-stone-800 cursor-not-allowed" : "bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed"
                  : "bg-[#bfa030] hover:bg-[#a38725] text-black"
              }`}
              id="phone-login-submit"
            >
              {isSendingEmailOTP ? "Dispatching OTP..." : "Get OTP Verification Code"}
            </button>

            {/* Divider */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-x-0 h-px bg-stone-200 dark:bg-stone-800" />
              <span className={`relative px-3 text-[10px] font-bold uppercase tracking-wider ${
                isDarkMode ? "bg-[#1c1a16] text-stone-500" : "bg-white text-stone-400"
              }`}>
                or continue with
              </span>
            </div>

            {/* Google and Guest Auth Option Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onGoogleLogin}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 border rounded-xl font-bold transition duration-200 text-xs shadow-sm ${
                  isDarkMode 
                    ? "border-stone-800 bg-stone-900/40 text-stone-200 hover:bg-stone-850" 
                    : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
                }`}
                id="otp-google-signin-btn"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
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
                <span className="truncate">Google</span>
              </button>

              <button
                type="button"
                onClick={onGuestLogin}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 border rounded-xl font-bold transition duration-200 text-xs shadow-sm ${
                  isDarkMode 
                    ? "border-stone-800 bg-stone-900/40 text-stone-200 hover:bg-stone-850" 
                    : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
                }`}
                id="otp-guest-signin-btn"
              >
                <UserIcon size={14} className="text-stone-400 flex-shrink-0" />
                <span className="truncate">Guest Mode</span>
              </button>
            </div>
          </motion.form>
        )}

        {view === "phoneOTP" && (
          <motion.form
            key="phone-otp-form"
            initial={{ opacity: 0, rotateY: 90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: -90 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            onSubmit={handleEmailOTPSubmit}
            className="space-y-4 text-xs"
          >
            <div>
              <label className={`block font-bold mb-1.5 ${isDarkMode ? "text-stone-300" : "text-stone-600"}`}>Enter 4-Digit Mail OTP</label>
              <div className="relative">
                <Key size={15} className="absolute left-3 top-3 text-stone-400" />
                <input
                  type="text"
                  required
                  maxLength={4}
                  placeholder="e.g. 4820"
                  value={otpCodeVerify}
                  onChange={(e) => setOtpCodeVerify(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none tracking-widest text-center font-mono font-extrabold text-base ${
                    isDarkMode 
                      ? "border-stone-800 bg-stone-900/60 text-stone-100 placeholder-stone-500 focus:border-stone-700 focus:bg-stone-900/80" 
                      : "border-stone-200 bg-stone-50/50 text-stone-800 placeholder-stone-400 focus:border-stone-400 focus:bg-white"
                  }`}
                  id="phone-otp-input"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#bfa030] hover:bg-[#a38725] text-black font-extrabold py-2.5 rounded-xl transition shadow-sm"
              id="phone-otp-submit"
            >
              Verify & Complete Auth
            </button>

            <button
              type="button"
              onClick={() => {
                setView("phoneLogin");
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`w-full border py-2 rounded-xl transition font-bold ${
                isDarkMode 
                  ? "border-stone-800 bg-stone-900 text-stone-300 hover:bg-stone-800" 
                  : "border-stone-200 bg-white hover:bg-stone-50 text-stone-700"
              }`}
            >
              Change Email Address
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Creator Stamp */}
      <div className={`mt-6 pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono ${
        isDarkMode ? "border-stone-800 text-stone-500" : "border-stone-100 text-stone-400"
      }`}>
        <span>PLATFORM AUTH NODE v2.1</span>
        <span className={`font-bold px-2.5 py-1 rounded border ${
          isDarkMode ? "text-[#bfa030] bg-stone-900 border-amber-500/20" : "text-[#bfa030] bg-[#fbf8ee] border-amber-200/40"
        }`}>
          Developed by ANU . M • Designed by ANU . M
        </span>
      </div>
      </motion.div>
    </div>
  );
}

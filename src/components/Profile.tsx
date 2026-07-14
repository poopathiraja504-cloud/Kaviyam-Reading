import { User, SecurityLog } from "../types";
import { User as UserIcon, Shield, ShieldCheck, Award, BookOpen, Clock, Sparkles, MessageSquare, Smartphone, Save, LogOut, CheckCircle, Mail } from "lucide-react";
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface ProfileProps {
  currentUser: User;
  securityLogs: SecurityLog[];
  onUpdateProfile: (updatedProfile: any) => void;
  onChangeEmail: (newEmail: string) => { success: boolean; error?: string };
  onChangePassword: (oldPass: string, newPass: string) => { success: boolean; error?: string };
  onToggle2FA: () => void;
  onClearLogs: () => void;
  onLogout: () => void;
}

export default function Profile({
  currentUser,
  securityLogs,
  onUpdateProfile,
  onChangeEmail,
  onChangePassword,
  onToggle2FA,
  onClearLogs,
  onLogout,
}: ProfileProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "settings" | "security" | "devices">("overview");

  // Profile Edit fields
  const [username, setUsername] = useState(currentUser.username);
  const [profilePhoto, setProfilePhoto] = useState(currentUser.profile.profilePhoto);
  const [bio, setBio] = useState(currentUser.profile.bio);
  const [phoneNumber, setPhoneNumber] = useState(currentUser.profile.phoneNumber || "");
  const [dob, setDob] = useState(currentUser.profile.dob || "");
  const [gender, setGender] = useState(currentUser.profile.gender || "Not Specified");
  const [isPrivate, setIsPrivate] = useState(!currentUser.profile.privacy.publicBookshelf);
  const [isSuccessSave, setIsSuccessSave] = useState(false);

  // Security Credentials Fields
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentPasswordConfirm, setCurrentPasswordConfirm] = useState("");
  const [secErrorMsg, setSecErrorMsg] = useState<string | null>(null);
  const [secSuccessMsg, setSecSuccessMsg] = useState<string | null>(null);

  // Filter security logs related specifically to this User
  const userLogs = securityLogs.filter((log) => log.action.includes(currentUser.email) || log.id === "log-1");

  const is2FAEnabled = currentUser.security.is2FAEnabled;

  // Achievements Configuration
  const achievements = [
    {
      id: "scholarly-reader",
      title: "The Scholar",
      desc: "Unlocked by starting your first literary exploration.",
      icon: <BookOpen size={16} />,
      unlocked: true,
      color: "bg-amber-50 text-amber-700 border-amber-100",
    },
    {
      id: "ai-storysmith",
      title: "Cosmic Weaver",
      desc: "Weave your very first original chapter with Gemini AI.",
      icon: <Sparkles size={16} />,
      unlocked: currentUser.isVerified,
      color: "bg-blue-50 text-blue-700 border-blue-100",
    },
    {
      id: "literary-critic",
      title: "Literary Critic",
      desc: "Post a detailed analytical review on any library novel.",
      icon: <MessageSquare size={16} />,
      unlocked: true,
      color: "bg-emerald-50 text-emerald-700 border-emerald-100",
    },
    {
      id: "fortified-fortress",
      title: "Fortified Vault",
      desc: "Successfully secure your profile with active 2FA parameters.",
      icon: <ShieldCheck size={16} />,
      unlocked: is2FAEnabled,
      color: "bg-purple-50 text-purple-700 border-purple-100",
    }
  ];

  const handleUpdateProfileFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      username,
      profilePhoto,
      bio,
      phoneNumber,
      dob,
      gender,
      privacy: {
        publicBookshelf: !isPrivate,
        showActivity: true,
      }
    });
    setIsSuccessSave(true);
    setTimeout(() => setIsSuccessSave(false), 3000);
  };

  const handleToggle2FAAction = () => {
    onToggle2FA();
  };

  const handleChangeEmailAction = (e: React.FormEvent) => {
    e.preventDefault();
    setSecErrorMsg(null);
    setSecSuccessMsg(null);
    if (!newEmail) return;

    const res = onChangeEmail(newEmail);
    if (res && res.success === false) {
      setSecErrorMsg(res.error || "Failed to initiate email migration.");
    } else {
      setSecSuccessMsg("Email address change initiated! A simulated verification link has been sent to your Captured Mailbox.");
      setNewEmail("");
    }
  };

  const handleChangePasswordAction = (e: React.FormEvent) => {
    e.preventDefault();
    setSecErrorMsg(null);
    setSecSuccessMsg(null);
    if (!newPassword || !currentPasswordConfirm) return;

    const res = onChangePassword(currentPasswordConfirm, newPassword);
    if (res && res.success === false) {
      setSecErrorMsg(res.error || "Password change failed.");
    } else {
      setSecSuccessMsg("Your account password has been updated and re-encrypted successfully.");
      setNewPassword("");
      setCurrentPasswordConfirm("");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left" id="profile-panel-root">
      
      {/* Sidebar Account Navigation */}
      <div className="lg:col-span-3 space-y-4">
        
        {/* User Card */}
        <div className="bg-white rounded-3xl border border-stone-200 p-5 text-center space-y-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-[#bfa030]" />

          <div className="relative inline-block">
            <img
              src={currentUser.profile.profilePhoto}
              alt=""
              className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-stone-100 shadow-sm"
              referrerPolicy="no-referrer"
            />
            {currentUser.isVerified && (
              <span className="absolute bottom-0 right-1 bg-[#bfa030] text-black p-1 rounded-full border-2 border-white" title="Verified Account">
                <CheckCircle size={12} className="fill-current text-white stroke-2" />
              </span>
            )}
          </div>

          <div className="space-y-1">
            <h3 className="font-serif font-bold text-stone-800 text-base">{currentUser.username}</h3>
            <p className="text-[10px] text-stone-400 font-mono font-bold uppercase tracking-wider">{currentUser.email}</p>
          </div>

          <p className="text-xs text-stone-500 line-clamp-2 italic font-serif leading-relaxed px-2">
            "{currentUser.profile.bio || "No biography provided."}"
          </p>

          <div className="pt-4 border-t border-stone-100">
            <button
              onClick={onLogout}
              className="w-full py-2 bg-stone-50 hover:bg-red-50 text-stone-600 hover:text-red-700 text-xs font-bold rounded-xl transition duration-200 flex items-center justify-center gap-1.5 border border-stone-200/60 hover:border-red-100"
              id="profile-logout-btn"
            >
              <LogOut size={13} />
              Sign Out Securely
            </button>
          </div>
        </div>

        {/* Tab Selection Navigation */}
        <nav className="bg-white rounded-2xl border border-stone-200 p-2 space-y-1 shadow-sm">
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold text-left transition ${
              activeTab === "overview" ? "bg-stone-900 text-white" : "text-stone-500 hover:bg-stone-50 hover:text-stone-800"
            }`}
            id="profile-tab-overview"
          >
            <Award size={14} className="text-[#bfa030]" />
            Stats & Milestones
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold text-left transition ${
              activeTab === "settings" ? "bg-stone-900 text-white" : "text-stone-500 hover:bg-stone-50 hover:text-stone-800"
            }`}
            id="profile-tab-settings"
          >
            <UserIcon size={14} />
            Edit Profile Credentials
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold text-left transition ${
              activeTab === "security" ? "bg-stone-900 text-white" : "text-stone-500 hover:bg-stone-50 hover:text-stone-800"
            }`}
            id="profile-tab-security"
          >
            <Shield size={14} />
            Security & MFA Setup
          </button>

          <button
            onClick={() => setActiveTab("devices")}
            className={`w-full flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold text-left transition ${
              activeTab === "devices" ? "bg-stone-900 text-white" : "text-stone-500 hover:bg-stone-50 hover:text-stone-800"
            }`}
            id="profile-tab-devices"
          >
            <Smartphone size={14} />
            Audits & Active Devices
          </button>
        </nav>
      </div>

      {/* Main Settings Display Stage */}
      <div className="lg:col-span-9 bg-white rounded-3xl border border-stone-200 p-6 shadow-sm min-h-[500px]">
        <AnimatePresence mode="wait">
          
          {activeTab === "overview" && (
            <motion.div
              key="profile-overview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Stats Block */}
              <div className="space-y-4">
                <h3 className="font-serif text-base font-bold text-stone-800 border-b border-stone-100 pb-2">
                  My Reading Milestones
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl flex flex-col justify-between">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-stone-400">Hours Reading</span>
                    <p className="text-xl font-serif font-extrabold text-stone-800 mt-2 flex items-center gap-1">
                      <Clock size={16} className="text-[#bfa030]" />
                      4.2h
                    </p>
                  </div>

                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl flex flex-col justify-between">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-stone-400">Chapters Read</span>
                    <p className="text-xl font-serif font-extrabold text-stone-800 mt-2 flex items-center gap-1">
                      <BookOpen size={16} className="text-[#bfa030]" />
                      14
                    </p>
                  </div>

                  <div className="p-4 bg-[#fdfcf5] border border-amber-100 rounded-2xl flex flex-col justify-between">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-700">AI Books Synthed</span>
                    <p className="text-xl font-serif font-extrabold text-amber-800 mt-2 flex items-center gap-1">
                      <Sparkles size={16} className="text-[#bfa030] fill-amber-50" />
                      {currentUser.isVerified ? "1" : "0"}
                    </p>
                  </div>

                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl flex flex-col justify-between">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-stone-400">Critiques Left</span>
                    <p className="text-xl font-serif font-extrabold text-stone-800 mt-2 flex items-center gap-1">
                      <MessageSquare size={16} className="text-[#bfa030]" />
                      3
                    </p>
                  </div>
                </div>
              </div>

              {/* Achievements Grid */}
              <div className="space-y-4 pt-4 border-t border-stone-100">
                <div className="flex items-center gap-2">
                  <Award className="text-[#bfa030]" size={18} />
                  <h3 className="font-serif text-base font-bold text-stone-800">Scholarly Badges & Achievements</h3>
                </div>
                <p className="text-xs text-stone-500 leading-relaxed font-serif">
                  Gather achievements as you expand your mind. Reading preset chapters, generating books with Gemini, and adding security details triggers unlock points.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {achievements.map((ach) => (
                    <div
                      key={ach.id}
                      className={`p-4 rounded-2xl border transition duration-300 flex items-start gap-3 text-left ${
                        ach.unlocked 
                          ? `${ach.color} shadow-sm hover:scale-101` 
                          : "bg-stone-50/50 border-stone-100 text-stone-400 opacity-60"
                      }`}
                    >
                      <div className={`p-2 rounded-xl border flex-shrink-0 ${
                        ach.unlocked ? "bg-white border-stone-200/50 shadow-inner" : "bg-stone-100 border-stone-200"
                      }`}>
                        {ach.icon}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold font-sans">{ach.title}</h4>
                          {ach.unlocked ? (
                            <span className="text-[8px] font-mono tracking-widest font-extrabold uppercase bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded">Unlocked</span>
                          ) : (
                            <span className="text-[8px] font-mono tracking-widest font-extrabold uppercase bg-stone-200 text-stone-600 px-1 py-0.2 rounded">Locked</span>
                          )}
                        </div>
                        <p className="text-[10px] leading-relaxed opacity-90 font-serif">{ach.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}

          {activeTab === "settings" && (
            <motion.div
              key="profile-settings"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h3 className="font-serif text-base font-bold text-stone-800 border-b border-stone-100 pb-2 mb-6">
                Edit Profile Credentials
              </h3>

              {isSuccessSave && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle size={14} />
                  Changes saved successfully! Your credentials have been persisted in local sandbox state.
                </div>
              )}

              <form onSubmit={handleUpdateProfileFormSubmit} className="space-y-5 text-xs text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-stone-600 font-bold mb-1.5">Username</label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 bg-stone-50/50"
                      id="profile-username-input"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-600 font-bold mb-1.5">Profile Photo URL</label>
                    <input
                      type="url"
                      value={profilePhoto}
                      onChange={(e) => setProfilePhoto(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 bg-stone-50/50"
                      id="profile-photo-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-600 font-bold mb-1.5">Biographical Summary</label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 bg-stone-50/50 leading-relaxed font-serif"
                    id="profile-bio-textarea"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-stone-600 font-bold mb-1.5">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 bg-stone-50/50"
                      id="profile-phone-input"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-600 font-bold mb-1.5">Date of Birth</label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 bg-stone-50/50"
                      id="profile-dob-input"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-600 font-bold mb-1.5">Gender Designation</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 bg-stone-50/50 rounded-xl focus:outline-none focus:border-stone-400 text-stone-800"
                      id="profile-gender-select"
                    >
                      <option value="Not Specified">Prefer Not to Say</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Non-Binary">Non-Binary</option>
                    </select>
                  </div>
                </div>

                {/* Privacy Configuration */}
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between">
                  <div className="space-y-0.5 text-left pr-4">
                    <span className="font-bold text-stone-800 block text-xs">Set Profile to Private Mode</span>
                    <span className="text-[10px] text-stone-500 leading-relaxed font-serif">
                      Hides reading bookmarks, completed chapters, and generated novels from other platform members.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="w-4.5 h-4.5 rounded text-stone-900 border-stone-300 focus:ring-stone-900"
                    id="profile-private-checkbox"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="bg-stone-900 hover:bg-stone-800 text-white font-bold px-6 py-2.5 rounded-xl transition shadow-sm flex items-center gap-1.5"
                    id="profile-save-btn"
                  >
                    <Save size={14} />
                    Commit Core Settings
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {activeTab === "security" && (
            <motion.div
              key="profile-security"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <h3 className="font-serif text-base font-bold text-stone-800 border-b border-stone-100 pb-2 mb-2">
                Security & Verification Configuration
              </h3>

              {secErrorMsg && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <span>{secErrorMsg}</span>
                </div>
              )}

              {secSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle size={14} />
                  <span>{secSuccessMsg}</span>
                </div>
              )}

              {/* MFA Indicator */}
              <div className="p-5 bg-stone-50 border border-stone-200 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-left">
                <div className="space-y-1 max-w-lg">
                  <span className="text-[9px] font-mono tracking-wider font-extrabold text-[#bfa030] uppercase block">Identity Shielding</span>
                  <h4 className="font-bold text-xs text-stone-800">Simulated Two-Factor Authentication (2FA)</h4>
                  <p className="text-[10px] text-stone-500 leading-relaxed font-serif">
                    Once enabled, signing in will send a temporary 6-digit verification code directly to your sandbox simulated mailbox inbox, shielding you from password brute-forcing.
                  </p>
                </div>

                <button
                  onClick={handleToggle2FAAction}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm border ${
                    is2FAEnabled
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100"
                      : "bg-[#bfa030] border-[#aa8e28] text-black hover:bg-[#a68b23]"
                  }`}
                  id="toggle-2fa-btn"
                >
                  <ShieldCheck size={14} />
                  {is2FAEnabled ? "Active (Disable)" : "Enable 2FA"}
                </button>
              </div>

              {/* Change Email Credentials */}
              <div className="border border-stone-200 rounded-2xl p-5 text-left space-y-4">
                <div className="flex items-center gap-2 text-stone-800 font-serif font-bold text-xs">
                  <Mail size={14} className="text-[#bfa030]" />
                  Modify Email Address
                </div>

                <form onSubmit={handleChangeEmailAction} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-stone-600 font-bold mb-1">New Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. rajaboopathi@newdomain.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full max-w-md px-3 py-1.5 border border-stone-200 bg-stone-50/50 rounded-xl focus:outline-none focus:border-stone-400 text-stone-800"
                      id="change-email-input"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-stone-900 hover:bg-stone-800 text-white font-bold px-4 py-2 rounded-xl transition"
                    id="submit-change-email"
                  >
                    Send Change Link
                  </button>
                </form>
              </div>

              {/* Change Password Credentials */}
              <div className="border border-stone-200 rounded-2xl p-5 text-left space-y-4">
                <div className="flex items-center gap-2 text-stone-800 font-serif font-bold text-xs">
                  <Shield size={14} className="text-[#bfa030]" />
                  Reset Secure Password
                </div>

                <form onSubmit={handleChangePasswordAction} className="space-y-4 text-xs grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-stone-600 font-bold mb-1">Confirm Current Password</label>
                      <input
                        type="password"
                        required
                        value={currentPasswordConfirm}
                        onChange={(e) => setCurrentPasswordConfirm(e.target.value)}
                        className="w-full px-3 py-1.5 border border-stone-200 bg-stone-50/50 rounded-xl focus:outline-none focus:border-stone-400 text-stone-800"
                        id="confirm-current-password"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-600 font-bold mb-1">New Secure Password</label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-1.5 border border-stone-200 bg-stone-50/50 rounded-xl focus:outline-none focus:border-stone-400 text-stone-800"
                        id="new-password-input"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="bg-stone-900 hover:bg-stone-800 text-white font-bold px-4 py-2.5 rounded-xl transition h-10 w-full sm:max-w-[200px]"
                    id="submit-change-password"
                  >
                    Update Password
                  </button>
                </form>
              </div>

            </motion.div>
          )}

          {activeTab === "devices" && (
            <motion.div
              key="profile-devices"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 text-left"
            >
              <div className="border-b border-[#e8e2cf] pb-2 flex justify-between items-center">
                <div>
                  <h3 className="font-serif text-base font-bold text-stone-800">
                    Account Audit & Activity Logs
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    View recent login events, authenticated IP markers, and sandboxed browser sessions associated with UID: <span className="font-mono text-[10px] font-bold bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">{currentUser.id}</span>
                  </p>
                </div>
                <button
                  onClick={onClearLogs}
                  className="text-xs text-red-500 font-bold hover:underline"
                >
                  Clear History
                </button>
              </div>

              {/* Device logs table */}
              <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white">
                <table className="w-full text-xs text-left">
                  <thead className="bg-stone-50 text-stone-500 font-mono text-[10px] uppercase border-b border-stone-200">
                    <tr>
                      <th className="p-3">Logged Action</th>
                      <th className="p-3">Time</th>
                      <th className="p-3">Device Agent</th>
                      <th className="p-3">IP Node</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-[11px]">
                    {userLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-stone-400 italic font-serif">
                          No local login events captured yet.
                        </td>
                      </tr>
                    ) : (
                      [...userLogs].reverse().map((log) => (
                        <tr key={log.id} className="hover:bg-stone-50 text-stone-700">
                          <td className="p-3 font-semibold text-stone-800">{log.action}</td>
                          <td className="p-3 font-mono text-stone-500">{new Date(log.timestamp).toLocaleString()}</td>
                          <td className="p-3 font-mono text-stone-400">{log.device}</td>
                          <td className="p-3 font-mono text-stone-400">{log.ip}</td>
                          <td className="p-3 text-right">
                            <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 font-mono text-[9px] font-bold border border-emerald-100 rounded">
                              SUCCESS
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-amber-50/40 border border-amber-100 rounded-xl text-xs text-amber-900 leading-relaxed font-serif">
                <strong>Simulated Security Sandbox:</strong> In a production network, this telemetry registers unique cookie identifiers to authorize individual clients. Tap "Sign Out Securely" to immediately terminate active cookies and session states.
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

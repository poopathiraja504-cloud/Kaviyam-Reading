import { User, SecurityLog } from "../types";
import { Shield, ShieldCheck, Mail, ChevronRight, ChevronLeft, Save, LogOut, Smartphone } from "lucide-react";
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import ThreeDVibrationControl from "./ThreeDVibrationControl";

interface ProfileProps {
  currentUser: User;
  securityLogs: SecurityLog[];
  onUpdateProfile: (updatedProfile: any) => void;
  onChangeEmail: (newEmail: string) => { success: boolean; error?: string };
  onChangePassword: (oldPass: string, newPass: string) => { success: boolean; error?: string };
  onToggle2FA: () => void;
  onClearLogs: () => void;
  onLogout: () => void;
  onBackToLibrary?: () => void;
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
  onBackToLibrary,
}: ProfileProps) {
  const [currentView, setCurrentView] = useState<string>("main");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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

  const userLogs = securityLogs.filter((log) => log.action.includes(currentUser.email) || log.id === "log-1");
  const is2FAEnabled = currentUser.security.is2FAEnabled;

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

  const handleChangeEmailAction = (e: React.FormEvent) => {
    e.preventDefault();
    const res = onChangeEmail(newEmail);
    if (res.success) {
      setSecSuccessMsg("Email modification link dispatched to inbox.");
      setSecErrorMsg(null);
      setNewEmail("");
    } else {
      setSecErrorMsg(res.error || "Failed to modify email.");
      setSecSuccessMsg(null);
    }
  };

  const handleChangePasswordAction = (e: React.FormEvent) => {
    e.preventDefault();
    const res = onChangePassword(currentPasswordConfirm, newPassword);
    if (res.success) {
      setSecSuccessMsg("Secure password successfully updated.");
      setSecErrorMsg(null);
      setCurrentPasswordConfirm("");
      setNewPassword("");
    } else {
      setSecErrorMsg(res.error || "Failed to update password.");
      setSecSuccessMsg(null);
    }
  };

  const handleToggle2FAAction = () => {
    onToggle2FA();
    setSecSuccessMsg(is2FAEnabled ? "2FA security parameters deactivated." : "2FA security parameters activated.");
    setSecErrorMsg(null);
    setTimeout(() => setSecSuccessMsg(null), 3000);
  };

  const MenuItem = ({ title, onClick }: { title: string; onClick: () => void }) => (
    <div 
      className="flex items-center justify-between px-4 py-4 cursor-pointer hover:bg-stone-50 active:bg-stone-100 transition border-b border-stone-100/50 last:border-0"
      onClick={onClick}
    >
      <span className="text-[17px] text-stone-900">{title}</span>
      <ChevronRight size={20} className="text-stone-400" />
    </div>
  );

  const renderHeader = (title: string, onBack: () => void) => (
    <header className="h-16 flex items-center justify-between px-4 sticky top-0 bg-white z-10 border-b border-stone-100">
      <button className="p-2 -ml-2 text-stone-900 cursor-pointer" onClick={onBack}>
        <ChevronLeft size={24} strokeWidth={2} />
      </button>
      <h1 className="text-[17px] font-semibold text-stone-900">{title}</h1>
      <div className="w-8" />
    </header>
  );

  const renderMain = () => (
    <div className="w-full max-w-[800px] mx-auto pb-24 bg-white min-h-[calc(100vh-200px)] font-sans text-stone-900 sm:border sm:border-stone-200 sm:rounded-2xl sm:overflow-hidden sm:mt-6 sm:shadow-sm">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-4 sticky top-0 bg-white z-10 border-b border-stone-100">
        <button
          className="p-2 -ml-2 text-stone-900 hover:bg-stone-100 rounded-full transition cursor-pointer"
          onClick={() => {
            if (onBackToLibrary) onBackToLibrary();
          }}
          title="Back to Catalog Library"
          id="profile-back-to-library-btn"
        >
           <ChevronLeft size={24} strokeWidth={2} />
        </button>
        <h1 className="text-[17px] font-semibold text-stone-900">Your account</h1>
        <button
          onClick={() => setShowLogoutModal(true)}
          className="text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 border border-red-200"
          title="Sign Out of Kaviyam"
          id="profile-top-signout-btn"
        >
          <LogOut size={13} />
          <span>Sign Out</span>
        </button>
      </header>

      {/* Profile Card */}
      <div 
        className="px-4 py-6 flex items-center justify-between cursor-pointer hover:bg-stone-50 active:bg-stone-100 transition"
        onClick={() => setCurrentView("profile")}
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center text-2xl font-medium shrink-0 shadow-sm border border-stone-200/50">
            {currentUser.profile.profilePhoto ? (
               <img src={currentUser.profile.profilePhoto} className="w-full h-full rounded-full object-cover" />
            ) : (
               currentUser.username.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h2 className="text-[17px] font-semibold uppercase tracking-tight text-stone-900">{currentUser.username}</h2>
            <p className="text-sm text-stone-500 mt-0.5">View profile</p>
          </div>
        </div>
        <ChevronRight size={24} className="text-stone-400" strokeWidth={1.5} />
      </div>

      <div className="mt-2">
        <h3 className="px-4 text-[15px] font-medium text-stone-900 mb-1">Settings</h3>
        <MenuItem title="3D Vibration & Haptic Feedback" onClick={() => setCurrentView("vibration")} />
        <MenuItem title="Account management" onClick={() => setCurrentView("account")} />
        <MenuItem title="Profile visibility" onClick={() => setCurrentView("placeholder")} />
        <MenuItem title="Reading preferences" onClick={() => setCurrentView("placeholder")} />
        <MenuItem title="Refine your recommendations" onClick={() => setCurrentView("placeholder")} />
        <MenuItem title="Notifications" onClick={() => setCurrentView("placeholder")} />
        <MenuItem title="Privacy and data" onClick={() => setCurrentView("placeholder")} />
        <MenuItem title="Security" onClick={() => setCurrentView("security")} />
        <MenuItem title="Downloads" onClick={() => setCurrentView("placeholder")} />
        <MenuItem title="Favorites and bookmarks" onClick={() => setCurrentView("placeholder")} />
      </div>

      <div className="mt-6 border-t border-stone-100 pt-6">
        <h3 className="px-4 text-[15px] font-medium text-stone-900 mb-1">Support</h3>
        <MenuItem title="Help center" onClick={() => setCurrentView("placeholder")} />
        <MenuItem title="Help & FAQ" onClick={() => setCurrentView("placeholder")} />
        <MenuItem title="Report a problem" onClick={() => setCurrentView("placeholder")} />
        <MenuItem title="Contact Kaviyam Reading" onClick={() => setCurrentView("placeholder")} />
      </div>

      <div className="mt-6 border-t border-stone-100 pt-6">
        <h3 className="px-4 text-[15px] font-medium text-stone-900 mb-1">About</h3>
        <MenuItem title="Terms of service" onClick={() => setCurrentView("placeholder")} />
        <MenuItem title="Privacy policy" onClick={() => setCurrentView("placeholder")} />
        <MenuItem title="About Kaviyam Reading" onClick={() => setCurrentView("placeholder")} />
      </div>

      <div className="mt-6 border-t border-stone-100 pt-4 mb-8">
        <button
          onClick={() => setShowLogoutModal(true)}
          className="w-full text-left text-[17px] text-red-600 hover:bg-red-50/60 active:bg-red-100 transition py-4 px-4 font-bold cursor-pointer flex items-center justify-between"
          id="profile-bottom-logout-btn"
        >
          <span className="flex items-center gap-2">
            <LogOut size={20} className="text-red-600" />
            Log out of Kaviyam Reading
          </span>
          <ChevronRight size={20} className="text-red-400" />
        </button>
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-xs overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
             <div className="p-8 text-center pb-6">
                <h3 className="text-xl font-bold text-stone-900">Log out of Kaviyam Reading?</h3>
             </div>
             <div className="flex border-t border-stone-200">
                <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-4 font-semibold text-stone-600 border-r border-stone-200 hover:bg-stone-50 cursor-pointer transition">Cancel</button>
                <button onClick={onLogout} className="flex-1 py-4 font-bold text-stone-900 hover:bg-stone-50 cursor-pointer transition">Log out</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderProfile = () => (
    <div className="w-full max-w-[800px] mx-auto pb-24 bg-white min-h-[calc(100vh-200px)] sm:border sm:border-stone-200 sm:rounded-2xl sm:overflow-hidden sm:mt-6 sm:shadow-sm">
      {renderHeader("Profile Details", () => setCurrentView("main"))}
      <div className="p-4 sm:p-6">
        <form onSubmit={handleUpdateProfileFormSubmit} className="space-y-5">
          <div>
            <label className="block text-[15px] font-semibold text-stone-900 mb-1.5">Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 text-[17px] text-stone-900 transition-colors" required />
          </div>
          <div>
            <label className="block text-[15px] font-semibold text-stone-900 mb-1.5">Profile Photo URL</label>
            <input type="url" value={profilePhoto} onChange={e => setProfilePhoto(e.target.value)} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 text-[17px] text-stone-900 transition-colors" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-[15px] font-semibold text-stone-900 mb-1.5">Bio</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 text-[17px] text-stone-900 transition-colors"></textarea>
          </div>
          <button type="submit" className="w-full bg-stone-900 hover:bg-stone-800 transition-colors text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer text-[17px] mt-4">
            <Save size={20} /> Save Profile
          </button>
          {isSuccessSave && <p className="text-emerald-600 text-center font-medium mt-2">Profile saved successfully!</p>}
        </form>
      </div>
    </div>
  );

  const renderAccount = () => (
    <div className="w-full max-w-[800px] mx-auto pb-24 bg-white min-h-[calc(100vh-200px)] sm:border sm:border-stone-200 sm:rounded-2xl sm:overflow-hidden sm:mt-6 sm:shadow-sm">
      {renderHeader("Account Management", () => setCurrentView("main"))}
      <div className="p-4 sm:p-6 space-y-8">
        {(secSuccessMsg || secErrorMsg) && (
          <div className={`p-4 rounded-xl text-sm font-medium ${secSuccessMsg ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
            {secSuccessMsg || secErrorMsg}
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-semibold text-stone-900 flex items-center gap-2 text-[17px]"><Mail size={20} className="text-stone-400" /> Modify Email Address</h3>
          <form onSubmit={handleChangeEmailAction} className="space-y-3">
            <input type="email" required placeholder="New Email Address" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 text-[17px]" />
            <button type="submit" className="bg-stone-900 hover:bg-stone-800 transition-colors text-white font-bold px-6 py-3.5 rounded-xl w-full sm:w-auto cursor-pointer text-[17px]">Update Email</button>
          </form>
        </div>

        <div className="space-y-4 pt-8 border-t border-stone-100">
          <h3 className="font-semibold text-stone-900 flex items-center gap-2 text-[17px]"><Shield size={20} className="text-stone-400" /> Change Password</h3>
          <form onSubmit={handleChangePasswordAction} className="space-y-3">
            <input type="password" required placeholder="Current Password" value={currentPasswordConfirm} onChange={e => setCurrentPasswordConfirm(e.target.value)} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 text-[17px]" />
            <input type="password" required placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 text-[17px]" />
            <button type="submit" className="bg-stone-900 hover:bg-stone-800 transition-colors text-white font-bold px-6 py-3.5 rounded-xl w-full sm:w-auto cursor-pointer text-[17px]">Update Password</button>
          </form>
        </div>

        <div className="space-y-4 pt-8 border-t border-stone-100">
          <h3 className="font-semibold text-stone-900 flex items-center gap-2 text-[17px]"><ShieldCheck size={20} className="text-stone-400" /> Two-Factor Authentication</h3>
          <button onClick={handleToggle2FAAction} className={`px-6 py-3.5 rounded-xl font-bold w-full sm:w-auto cursor-pointer transition-colors text-[17px] ${is2FAEnabled ? "bg-emerald-50 text-emerald-800 hover:bg-emerald-100" : "bg-stone-100 text-stone-900 hover:bg-stone-200"}`}>
            {is2FAEnabled ? "Active (Disable 2FA)" : "Enable 2FA"}
          </button>
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="w-full max-w-[800px] mx-auto pb-24 bg-white min-h-[calc(100vh-200px)] sm:border sm:border-stone-200 sm:rounded-2xl sm:overflow-hidden sm:mt-6 sm:shadow-sm">
      {renderHeader("Security & Activity", () => setCurrentView("main"))}
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-stone-900 text-[17px]">Login Activity Logs</h3>
          <button onClick={onClearLogs} className="text-sm text-red-600 font-medium hover:underline cursor-pointer">Clear History</button>
        </div>
        <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-stone-50 text-stone-500 font-medium border-b border-stone-200">
              <tr>
                <th className="p-4">Device/Action</th>
                <th className="p-4 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {userLogs.length === 0 ? (
                <tr>
                  <td colSpan={2} className="p-6 text-center text-stone-400">No recent activity.</td>
                </tr>
              ) : (
                [...userLogs].reverse().map(log => (
                  <tr key={log.id} className="hover:bg-stone-50 transition-colors">
                    <td className="p-4 text-stone-800">
                      <div className="font-medium text-[15px]">{log.action}</div>
                      <div className="text-sm text-stone-500 mt-1">{log.device} • {log.ip}</div>
                    </td>
                    <td className="p-4 text-right text-stone-500 text-[13px] align-top whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderVibration = () => (
    <div className="w-full max-w-[800px] mx-auto pb-24 bg-[#070d18] text-white min-h-[calc(100vh-200px)] sm:border sm:border-stone-800 sm:rounded-2xl sm:overflow-hidden sm:mt-6 sm:shadow-2xl">
      {renderHeader("3D Vibration & Tactile Engine", () => setCurrentView("main"))}
      <div className="p-4 sm:p-6">
        <ThreeDVibrationControl inline />
      </div>
    </div>
  );

  const renderPlaceholder = () => (
    <div className="w-full max-w-[800px] mx-auto pb-24 bg-white min-h-[calc(100vh-200px)] sm:border sm:border-stone-200 sm:rounded-2xl sm:overflow-hidden sm:mt-6 sm:shadow-sm">
      {renderHeader("Settings", () => setCurrentView("main"))}
      <div className="p-12 text-center text-stone-500 flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mb-4 border border-stone-100">
          <span className="text-2xl">🚧</span>
        </div>
        <h3 className="text-lg font-semibold text-stone-900 mb-2">Under Construction</h3>
        <p>This settings section is not yet implemented.</p>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full bg-[#f7f5ed] sm:p-4">
      <AnimatePresence mode="wait">
        {currentView === "main" && <motion.div key="main" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>{renderMain()}</motion.div>}
        {currentView === "vibration" && <motion.div key="vibration" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>{renderVibration()}</motion.div>}
        {currentView === "profile" && <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>{renderProfile()}</motion.div>}
        {currentView === "account" && <motion.div key="account" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>{renderAccount()}</motion.div>}
        {currentView === "security" && <motion.div key="security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>{renderSecurity()}</motion.div>}
        {currentView === "placeholder" && <motion.div key="placeholder" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>{renderPlaceholder()}</motion.div>}
      </AnimatePresence>
    </div>
  );
}

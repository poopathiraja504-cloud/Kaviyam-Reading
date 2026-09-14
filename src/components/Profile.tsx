import React from "react";
import { User as UserIcon, Mail, Phone, Calendar, Shield, CheckCircle, Edit3, Bookmark, Lock, Award, ArrowLeft } from "lucide-react";
import { User } from "../types";
import { Language } from "../utils/i18n";
import { getLevelInfo } from "../services/levelService";

interface ProfileProps {
  currentUser: User | null;
  onSelectTab: (tab: string) => void;
  lang: Language;
}

export default function Profile({ currentUser, onSelectTab, lang }: ProfileProps) {
  if (!currentUser) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-[#E2DDD5] space-y-4 font-sans">
        <UserIcon className="w-12 h-12 text-stone-300 mx-auto" />
        <h3 className="font-serif font-bold text-lg text-stone-800">
          {lang === "ta" ? "உள்நுழையவில்லை" : "Not Logged In"}
        </h3>
        <p className="text-xs text-stone-500">
          {lang === "ta"
            ? "சுயவிவரத்தைக் காண தயவுசெய்து உள்நுழையவும்."
            : "Please sign in to view and manage your profile."}
        </p>
      </div>
    );
  }

  const profile = currentUser.profile;
  const totalXp = currentUser.totalXP || currentUser.totalXp || 0;
  const levelInfo = getLevelInfo(totalXp, lang);

  return (
    <div className="space-y-6 font-sans pb-12 max-w-4xl mx-auto">
      
      {/* Top Navigation / Back Button */}
      <button
        onClick={() => onSelectTab("home")}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-[#3B0B12] text-stone-700 hover:text-white border border-[#E2DDD5] shadow-xs transition-all text-xs font-bold cursor-pointer group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        <span>{lang === "ta" ? "← முகப்பிற்கு திரும்பு (Back)" : "← Back to Home"}</span>
      </button>

      {/* Profile Banner & Info */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E2DDD5] shadow-lg flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative">
          <img
            src={
              profile?.profilePhoto ||
              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"
            }
            alt={currentUser.username}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-amber-300 shadow-md animate-fade-in"
          />
          <div className="absolute -bottom-2 -right-2 bg-amber-500 border-2 border-white text-stone-950 font-bold text-xs w-8 h-8 rounded-full flex items-center justify-center shadow-md">
            {levelInfo.currentLevel}
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-center sm:justify-start gap-2">
            <h2 className="font-serif font-bold text-2xl text-[#3B0B12]">
              {currentUser.username}
            </h2>
            <div className="flex items-center gap-1.5 justify-center sm:justify-start">
              {currentUser.isVerified && (
                <span title="Verified User">
                  <CheckCircle className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                </span>
              )}
              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full uppercase tracking-wider">
                Lvl {levelInfo.currentLevel}: {lang === "ta" ? levelInfo.levelNameTa : levelInfo.levelNameEn}
              </span>
            </div>
          </div>

          <p className="text-xs text-stone-600 italic">
            {profile?.bio || (lang === "ta" ? "தமிழ் இலக்கிய வாசகர்" : "Passionate Reader of Tamil Epics")}
          </p>

          <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-4 text-xs text-stone-500">
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-[#5C121E]" />
              {currentUser.email}
            </span>
            {profile?.phoneNumber && (
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#5C121E]" />
                {profile.phoneNumber}
              </span>
            )}
            {profile?.dob && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#5C121E]" />
                {profile.dob}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Account Settings & Quick Nav */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Dynamic Level & Progression Summary */}
        <div className="p-6 rounded-3xl bg-white border border-[#E2DDD5] space-y-4">
          <h3 className="font-serif font-bold text-base text-[#3B0B12] flex items-center gap-2">
            <Award className="w-4 h-4 text-[#5C121E]" />
            <span>{lang === "ta" ? "எனது வாசிப்பு அந்தஸ்து" : "My Reading Scholar Level"}</span>
          </h3>

          <div className="space-y-3.5">
            <div className="flex justify-between items-baseline">
              <p className="text-xs text-stone-500">{lang === "ta" ? "தற்போதைய நிலை" : "Current Rank"}:</p>
              <h4 className="font-serif font-bold text-[#3B0B12] text-sm">
                Level {levelInfo.currentLevel} – {lang === "ta" ? levelInfo.levelNameTa : levelInfo.levelNameEn}
              </h4>
            </div>

            <div className="flex justify-between items-baseline">
              <p className="text-xs text-stone-500">{lang === "ta" ? "வாசிப்பு சான்றிதழ்" : "Certification Badge"}:</p>
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                {levelInfo.badge}
              </span>
            </div>

            {/* Progress bar inside profile */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-stone-500">
                <span>{totalXp.toLocaleString()} / {levelInfo.nextLevelRequiredXp.toLocaleString()} XP</span>
                <span>{levelInfo.progressPercent}%</span>
              </div>
              <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-300"
                  style={{ width: `${levelInfo.progressPercent}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => onSelectTab("levels")}
              className="w-full text-center py-2 bg-stone-50 hover:bg-[#3B0B12] hover:text-[#D4AF37] border border-[#E2DDD5] transition-all text-xs font-bold rounded-xl"
            >
              📊 {lang === "ta" ? "விவரமான நிலை முன்னேற்றம் காண்க" : "View Detailed Level Progress"}
            </button>
          </div>
        </div>
        
        <div className="p-6 rounded-3xl bg-white border border-[#E2DDD5] space-y-4">
          <h3 className="font-serif font-bold text-base text-[#3B0B12] flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#5C121E]" />
            <span>{lang === "ta" ? "பாதுகாப்பு & கணக்கு வகை" : "Security & Account Info"}</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-stone-100">
              <span className="text-stone-500">Firebase Auth ID:</span>
              <span className="font-mono text-[10px] text-stone-800 truncate max-w-[140px]">
                {currentUser.id}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-stone-100">
              <span className="text-stone-500">{lang === "ta" ? "சரிபார்ப்பு நிலை" : "Email Status"}:</span>
              <span className="font-semibold text-emerald-700">
                {currentUser.isVerified ? "Verified ✅" : "Unverified ⚠️"}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-stone-100">
              <span className="text-stone-500">{lang === "ta" ? "உள்நுழைவு வகை" : "Auth Method"}:</span>
              <span className="font-medium text-stone-800">Firebase Auth</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#E2DDD5] space-y-4">
          <h3 className="font-serif font-bold text-base text-[#3B0B12] flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-[#5C121E]" />
            <span>{lang === "ta" ? "விரைவு வழிப்பாதைகள்" : "Quick Shortcuts"}</span>
          </h3>

          <div className="space-y-2">
            <button
              onClick={() => onSelectTab("mybooks")}
              className="w-full text-left p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 text-xs font-semibold text-stone-800 flex items-center justify-between"
            >
              <span>{lang === "ta" ? "என் புத்தக அலமாரி" : "My Saved Bookshelf"}</span>
              <span>→</span>
            </button>
            <button
              onClick={() => onSelectTab("mailbox")}
              className="w-full text-left p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 text-xs font-semibold text-stone-800 flex items-center justify-between"
            >
              <span>{lang === "ta" ? "அஞ்சல் பெட்டி (Inbox)" : "Notification Mailbox"}</span>
              <span>→</span>
            </button>
            <button
              onClick={() => onSelectTab("settings")}
              className="w-full text-left p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 text-xs font-semibold text-stone-800 flex items-center justify-between"
            >
              <span>{lang === "ta" ? "கணக்கு அமைப்புகள்" : "Account Settings"}</span>
              <span>→</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

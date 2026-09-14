import React from "react";
import { User as UserIcon, Mail, Phone, Calendar, Shield, CheckCircle, Edit3, Bookmark, Lock } from "lucide-react";
import { User } from "../types";
import { Language } from "../utils/i18n";

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

  return (
    <div className="space-y-6 font-sans pb-12 max-w-4xl mx-auto">
      
      {/* Profile Banner & Info */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E2DDD5] shadow-lg flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <img
          src={
            profile?.profilePhoto ||
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"
          }
          alt={currentUser.username}
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-amber-300 shadow-md"
        />

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h2 className="font-serif font-bold text-2xl text-[#3B0B12]">
              {currentUser.username}
            </h2>
            {currentUser.isVerified && (
              <span title="Verified User">
                <CheckCircle className="w-5 h-5 text-emerald-600 fill-emerald-100" />
              </span>
            )}
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

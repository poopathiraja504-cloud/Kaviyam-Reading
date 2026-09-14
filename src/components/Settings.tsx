import React from "react";
import { Globe, Moon, Sun, Shield, Database, Bell, Lock, ArrowLeft } from "lucide-react";
import { Language } from "../utils/i18n";

interface SettingsProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onBack?: () => void;
}

export default function Settings({
  lang,
  onLanguageChange,
  isDarkMode,
  onToggleDarkMode,
  onBack,
}: SettingsProps) {
  return (
    <div className="space-y-6 font-sans pb-12 max-w-4xl mx-auto">
      
      {/* Top Navigation / Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-[#3B0B12] text-stone-700 hover:text-white border border-[#E2DDD5] shadow-xs transition-all text-xs font-bold cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>{lang === "ta" ? "← முகப்பிற்கு திரும்பு (Back)" : "← Back to Home"}</span>
        </button>
      )}

      {/* Header */}
      <div>
        <h2 className="font-serif font-bold text-2xl text-[#3B0B12]">
          {lang === "ta" ? "பயன்பாட்டு அமைப்புகள்" : "Application Settings"}
        </h2>
        <p className="text-xs text-stone-500 mt-1">
          {lang === "ta"
            ? "உங்கள் விருப்பத்திற்கேற்ப வாசிப்பு மற்றும் பாதுகாப்பு அமைப்புகளை மாற்றலாம்"
            : "Customize your language, appearance, and cache storage preferences"}
        </p>
      </div>

      <div className="space-y-4">
        
        {/* Language Selection */}
        <div className="p-6 rounded-3xl bg-white border border-[#E2DDD5] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#5C121E]" />
              <span>{lang === "ta" ? "பயன்பாட்டு மொழி" : "App Language"}</span>
            </h3>
            <p className="text-xs text-stone-500">
              {lang === "ta"
                ? "தளத்தின் இடைமுக மொழியைத் தேர்வு செய்க"
                : "Choose your primary display language"}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-full text-xs font-semibold">
            <button
              onClick={() => onLanguageChange("ta")}
              className={`px-4 py-1.5 rounded-full transition-all ${
                lang === "ta" ? "bg-[#5C121E] text-white shadow-sm" : "text-stone-700"
              }`}
            >
              தமிழ்
            </button>
            <button
              onClick={() => onLanguageChange("en")}
              className={`px-4 py-1.5 rounded-full transition-all ${
                lang === "en" ? "bg-[#5C121E] text-white shadow-sm" : "text-stone-700"
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="p-6 rounded-3xl bg-white border border-[#E2DDD5] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-2">
              {isDarkMode ? <Moon className="w-4 h-4 text-[#5C121E]" /> : <Sun className="w-4 h-4 text-[#5C121E]" />}
              <span>{lang === "ta" ? "வண்ணக் கருப்பொருள் (Theme)" : "Color Atmosphere"}</span>
            </h3>
            <p className="text-xs text-stone-500">
              {lang === "ta"
                ? "பகலும் இரவும் வாசிக்க உகந்த வண்ணம்"
                : "Warm paper light theme optimized for classical reading"}
            </p>
          </div>

          <button
            onClick={onToggleDarkMode}
            className="px-4 py-2 rounded-full bg-stone-100 border border-stone-200 text-xs font-semibold text-stone-800"
          >
            {isDarkMode ? "Dark Theme" : "Light Paper Theme"}
          </button>
        </div>

        {/* Storage / Cache */}
        <div className="p-6 rounded-3xl bg-white border border-[#E2DDD5] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-[#5C121E]" />
              <span>{lang === "ta" ? "உள் சேமிப்பு Cache" : "Local Storage Cache"}</span>
            </h3>
            <p className="text-xs text-stone-500">
              {lang === "ta"
                ? "புத்தகப் புத்தகக்குறிகள் மற்றும் பயனர் தகவல்"
                : "LocalStorage offline persistence active"}
            </p>
          </div>

          <button
            onClick={() => {
              localStorage.clear();
              alert("Local cache cleared!");
            }}
            className="px-4 py-2 rounded-full bg-stone-100 hover:bg-red-50 hover:text-red-700 border border-stone-200 text-xs font-semibold transition-colors"
          >
            {lang === "ta" ? "Cache நீக்குக" : "Clear Cache"}
          </button>
        </div>

      </div>

    </div>
  );
}

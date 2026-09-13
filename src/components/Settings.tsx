import React, { useState } from "react";
import { Settings as SettingsIcon, Globe, Sun, Moon, Volume2, Shield, User, Type } from "lucide-react";
import { Language, translations } from "../utils/i18n";

interface SettingsProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function Settings({
  lang,
  onLanguageChange,
  isDarkMode,
  onToggleDarkMode,
}: SettingsProps) {
  const [fontSize, setFontSize] = useState(18);
  const [ttsSpeed, setTtsSpeed] = useState(1.0);
  const [themeMode, setThemeMode] = useState<"light" | "sepia" | "dark">("sepia");

  const t = (key: keyof typeof translations["ta"]) => translations[lang][key] || key;

  return (
    <div className="space-y-6 font-sans pb-12 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2DDD5] shadow-sm">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#3B0B12] flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-[#D4AF37]" />
            <span>{t("navSettings")}</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            {lang === "ta" ? "உங்கள் பயன்பாட்டு அமைப்புகள் மற்றும் விருப்பங்களை மாற்றிமையுங்கள்" : "Configure platform language, reading theme, typography, and text-to-speech"}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* Language Section */}
        <div className="p-6 rounded-3xl bg-white border border-[#E2DDD5] shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-lg text-[#3B0B12] flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#D4AF37]" />
            <span>{t("languageSetting")}</span>
          </h3>

          <div className="flex items-center gap-4">
            <label
              onClick={() => onLanguageChange("ta")}
              className={`flex-1 p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                lang === "ta" ? "bg-[#3B0B12] text-[#D4AF37] border-[#D4AF37]" : "bg-white text-stone-800 border-[#E2DDD5]"
              }`}
            >
              <span className="font-bold text-sm">தமிழ் (Tamil)</span>
              <div className={`w-4 h-4 rounded-full border-2 ${lang === "ta" ? "border-[#D4AF37] bg-[#D4AF37]" : "border-stone-300"}`} />
            </label>

            <label
              onClick={() => onLanguageChange("en")}
              className={`flex-1 p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                lang === "en" ? "bg-[#3B0B12] text-[#D4AF37] border-[#D4AF37]" : "bg-white text-stone-800 border-[#E2DDD5]"
              }`}
            >
              <span className="font-bold text-sm">English</span>
              <div className={`w-4 h-4 rounded-full border-2 ${lang === "en" ? "border-[#D4AF37] bg-[#D4AF37]" : "border-stone-300"}`} />
            </label>
          </div>
        </div>

        {/* Appearance & Themes Section matching reference settings card */}
        <div className="p-6 rounded-3xl bg-white border border-[#E2DDD5] shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-lg text-[#3B0B12] flex items-center gap-2">
            <Sun className="w-5 h-5 text-[#D4AF37]" />
            <span>{t("appearanceSetting")}</span>
          </h3>

          <div className="grid grid-cols-3 gap-4">
            {[
              { id: "light", label: t("themeLight"), bg: "bg-[#FFFDF9] text-stone-900 border-stone-200" },
              { id: "sepia", label: t("themeSepia"), bg: "bg-[#F4ECD8] text-[#382319] border-amber-300" },
              { id: "dark", label: t("themeDark"), bg: "bg-[#171214] text-[#E6DEC6] border-stone-800" },
            ].map((th) => (
              <button
                key={th.id}
                onClick={() => setThemeMode(th.id as any)}
                className={`p-4 rounded-2xl border font-bold text-xs flex flex-col items-center gap-2 transition-all ${th.bg} ${
                  themeMode === th.id ? "ring-2 ring-[#D4AF37] shadow-md" : ""
                }`}
              >
                <span>{th.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Reading Typography Controls */}
        <div className="p-6 rounded-3xl bg-white border border-[#E2DDD5] shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-lg text-[#3B0B12] flex items-center gap-2">
            <Type className="w-5 h-5 text-[#D4AF37]" />
            <span>{t("readingPreferences")}</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-bold text-stone-700 mb-1">
                <span>{t("fontAdjust")}</span>
                <span>{fontSize}px</span>
              </div>
              <input
                type="range"
                min={14}
                max={28}
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                className="w-full accent-[#3B0B12]"
              />
            </div>
          </div>
        </div>

        {/* Text-to-Speech Settings */}
        <div className="p-6 rounded-3xl bg-white border border-[#E2DDD5] shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-lg text-[#3B0B12] flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-[#D4AF37]" />
            <span>{t("ttsSettings")}</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-bold text-stone-700 mb-1">
                <span>{t("ttsSpeed")}</span>
                <span>{ttsSpeed}x</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={2.0}
                step={0.1}
                value={ttsSpeed}
                onChange={(e) => setTtsSpeed(parseFloat(e.target.value))}
                className="w-full accent-[#3B0B12]"
              />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

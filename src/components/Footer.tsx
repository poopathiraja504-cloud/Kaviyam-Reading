import React from "react";
import { BookOpen, Heart, Globe, Github, Twitter, Facebook } from "lucide-react";
import { Language, translations } from "../utils/i18n";

interface FooterProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  onSelectTab: (tab: string) => void;
}

export default function Footer({ lang, onLanguageChange, onSelectTab }: FooterProps) {
  const t = (key: keyof typeof translations["ta"]) => translations[lang][key] || key;

  return (
    <footer className="bg-[#1D0408] text-amber-100/70 border-t border-[#3B0B12] pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#3B0B12]">
          
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#D4AF37] flex items-center justify-center text-[#1D0408]">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="font-serif font-bold text-white text-lg">Kaviyam-Reading</span>
            </div>
            <p className="text-xs text-amber-200/60 leading-relaxed">
              {t("footerDesc")}
            </p>
            <p className="text-[11px] italic text-[#D4AF37]">
              "யாதும் ஊரே யாவரும் கேளிர்" – கணியன் பூங்குன்றனார்
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-sm font-semibold text-white mb-3 text-[#D4AF37]">
              {t("quickLinks")}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onSelectTab("tamil-library")} className="hover:text-white transition-colors">
                  {t("navTamilLibrary")}
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab("catalog")} className="hover:text-white transition-colors">
                  {t("navCatalogLibrary")}
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab("mybooks")} className="hover:text-white transition-colors">
                  {t("navMyBooks")}
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab("progress")} className="hover:text-white transition-colors">
                  {t("navProgress")}
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab("aifeatures")} className="hover:text-white transition-colors">
                  {t("navAIFeatures")}
                </button>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-serif text-sm font-semibold text-white mb-3 text-[#D4AF37]">
              {lang === "ta" ? "தளம்" : "Platform"}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onSelectTab("about")} className="hover:text-white transition-colors">
                  {t("navAbout")}
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab("settings")} className="hover:text-white transition-colors">
                  {t("navSettings")}
                </button>
              </li>
            </ul>
          </div>

          {/* Language & Connect */}
          <div>
            <h4 className="font-serif text-sm font-semibold text-white mb-3 text-[#D4AF37]">
              {lang === "ta" ? "மொழி & சமூக ஊடகம்" : "Language & Social"}
            </h4>
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => onLanguageChange("ta")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  lang === "ta" ? "bg-[#D4AF37] text-[#1D0408] font-bold" : "bg-[#3B0B12] text-amber-200/70"
                }`}
              >
                தமிழ்
              </button>
              <button
                onClick={() => onLanguageChange("en")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  lang === "en" ? "bg-[#D4AF37] text-[#1D0408] font-bold" : "bg-[#3B0B12] text-amber-200/70"
                }`}
              >
                English
              </button>
            </div>
            <div className="flex items-center gap-3">
              <a href="#" className="p-2 rounded-full bg-[#3B0B12] text-amber-200/60 hover:text-white hover:bg-[#5C121E]">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-[#3B0B12] text-amber-200/60 hover:text-white hover:bg-[#5C121E]">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-[#3B0B12] text-amber-200/60 hover:text-white hover:bg-[#5C121E]">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-amber-200/40 gap-4">
          <p>{t("copyright")}</p>
          <p className="flex items-center gap-1">
            Crafted with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" /> for Tamil literature lovers.
          </p>
        </div>
      </div>
    </footer>
  );
}

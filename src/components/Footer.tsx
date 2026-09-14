import React from "react";
import { Globe, Heart, BookOpen, Shield, Mail } from "lucide-react";
import { Language } from "../utils/i18n";

interface FooterProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  onSelectTab: (tab: string) => void;
}

export default function Footer({ lang, onLanguageChange, onSelectTab }: FooterProps) {
  return (
    <footer className="mt-12 bg-[#F3EFE6] border-t border-[#E2DDD5] text-stone-700 font-sans">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Column 1: Brand */}
        <div className="space-y-3">
          <h3 className="font-serif font-bold text-lg text-[#3B0B12]">
            {lang === "ta" ? "காவியம் வாசிப்பு" : "Kaviyam Reading"}
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            {lang === "ta"
              ? "அழியாப் புகழ்பெற்ற தமிழ் வரலாற்று நாவல்கள் மற்றும் சங்க இலக்கியங்களின் டிஜிட்டல் வாசிப்புத் தளம்."
              : "A modern digital reader dedicated to preserving and celebrating timeless Tamil historical novels and classical epics."}
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div className="space-y-2">
          <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-stone-900">
            {lang === "ta" ? "முக்கிய பக்கங்கள்" : "Quick Links"}
          </h4>
          <ul className="text-xs space-y-1.5 font-medium text-stone-600">
            <li>
              <button onClick={() => onSelectTab("tamil-library")} className="hover:text-[#5C121E]">
                {lang === "ta" ? "தமிழ் நாவல்கள்" : "Tamil Library"}
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab("catalog")} className="hover:text-[#5C121E]">
                {lang === "ta" ? "அனைத்துப் புத்தகங்கள்" : "Full Catalog"}
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab("aifeatures")} className="hover:text-[#5C121E]">
                {lang === "ta" ? "AI வாசிப்பு உதவி" : "AI Assistant"}
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab("help")} className="hover:text-[#5C121E]">
                {lang === "ta" ? "உதவி & FAQ" : "Help & FAQ"}
              </button>
            </li>
          </ul>
        </div>

        {/* Column 3: Platform & Docs */}
        <div className="space-y-2">
          <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-stone-900">
            {lang === "ta" ? "தளத்தின் விபரம்" : "Platform"}
          </h4>
          <ul className="text-xs space-y-1.5 font-medium text-stone-600">
            <li>
              <button onClick={() => onSelectTab("about")} className="hover:text-[#5C121E]">
                {lang === "ta" ? "எங்களைப் பற்றி" : "About Us"}
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab("localdb")} className="hover:text-[#5C121E]">
                {lang === "ta" ? "தரவுத்தள தகவல்" : "Database & Storage"}
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab("settings")} className="hover:text-[#5C121E]">
                {lang === "ta" ? "அமைப்புகள்" : "Settings"}
              </button>
            </li>
          </ul>
        </div>

        {/* Column 4: Language & Support */}
        <div className="space-y-3">
          <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-stone-900">
            {lang === "ta" ? "மொழி" : "Language"}
          </h4>
          <button
            onClick={() => onLanguageChange(lang === "ta" ? "en" : "ta")}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs font-semibold text-stone-800 hover:bg-stone-50 transition-colors"
          >
            <Globe className="w-4 h-4 text-[#5C121E]" />
            <span>{lang === "ta" ? "English-க்கு மாற்றுக" : "Switch to தமிழ்"}</span>
          </button>
        </div>

      </div>

      <div className="border-t border-[#E2DDD5] py-4 text-center text-[11px] text-stone-500 font-sans">
        <p>© 2026 Kaviyam Reading Platform. Crafted for Tamil literature lovers.</p>
      </div>
    </footer>
  );
}

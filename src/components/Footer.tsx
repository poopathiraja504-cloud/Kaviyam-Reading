import React from "react";
import { Globe, ExternalLink, ShieldCheck, FileText, MessageCircle, Github, Linkedin, Twitter, Instagram } from "lucide-react";
import { Language } from "../utils/i18n";

interface FooterProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  onSelectTab: (tab: string) => void;
}

export default function Footer({ lang, onLanguageChange, onSelectTab }: FooterProps) {
  const officialLinks = [
    { label: "LinkedIn Profile", url: "https://www.linkedin.com/in/dharmenthira-boopathi-s-7087563a8", icon: Linkedin },
    { label: "X.com (Twitter)", url: "https://x.com/dharmenthi7gec", icon: Twitter },
    { label: "Instagram", url: "https://www.instagram.com/boopathi.__.08?igsh=MTA5ZTQ2a2k1dmZvZg==", icon: Instagram },
    { label: "GitHub Repository", url: "https://github.com/poopathiraja504-cloud", icon: Github },
    { label: "WhatsApp Community", url: "https://chat.whatsapp.com/DqdVUsDADvCGtGtT65kSLC?s=cl&p=a&mlu=0&ilr=4", icon: MessageCircle },
    { label: "Terms & Conditions", url: "https://www.termsfeed.com/live/40b50cfb-9cf5-4d66-89d3-87c937901dff", icon: FileText },
    { label: "Privacy Policy", url: "https://www.freeprivacypolicy.com/live/020ee704-6e52-4ae5-8fe5-ff246bd18d9d", icon: ShieldCheck },
  ];

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

          {/* Social Icons Quick Row */}
          <div className="pt-2 flex items-center gap-2">
            {officialLinks.slice(0, 5).map((l, i) => {
              const IconComp = l.icon;
              return (
                <a
                  key={i}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white border border-stone-300 hover:bg-[#5C121E] hover:text-white hover:border-[#5C121E] text-stone-700 transition-all shadow-2xs"
                  title={l.label}
                >
                  <IconComp className="w-3.5 h-3.5" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="space-y-2">
          <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-stone-900">
            {lang === "ta" ? "முக்கிய பக்கங்கள்" : "Quick Links"}
          </h4>
          <ul className="text-xs space-y-1.5 font-medium text-stone-600">
            <li>
              <button onClick={() => onSelectTab("tamil-library")} className="hover:text-[#5C121E] cursor-pointer">
                {lang === "ta" ? "தமிழ் நாவல்கள்" : "Tamil Library"}
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab("catalog")} className="hover:text-[#5C121E] cursor-pointer">
                {lang === "ta" ? "அனைத்துப் புத்தகங்கள்" : "Full Catalog"}
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab("aifeatures")} className="hover:text-[#5C121E] cursor-pointer">
                {lang === "ta" ? "AI வாசிப்பு உதவி" : "AI Assistant"}
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab("help")} className="hover:text-[#5C121E] cursor-pointer">
                {lang === "ta" ? "உதவி & FAQ" : "Help & FAQ"}
              </button>
            </li>
          </ul>
        </div>

        {/* Column 3: Platform & Docs */}
        <div className="space-y-2">
          <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-stone-900">
            {lang === "ta" ? "தளத்தின் விபரம் & விதிமுறைகள்" : "Platform & Legal"}
          </h4>
          <ul className="text-xs space-y-1.5 font-medium text-stone-600">
            <li>
              <button onClick={() => onSelectTab("about")} className="hover:text-[#5C121E] cursor-pointer">
                {lang === "ta" ? "எங்களைப் பற்றி" : "About Us"}
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab("links")} className="hover:text-[#5C121E] cursor-pointer">
                {lang === "ta" ? "பழைய இணைப்புகள் & ஆவணங்கள்" : "Old Links & Docs"}
              </button>
            </li>
            <li>
              <a
                href="https://www.termsfeed.com/live/40b50cfb-9cf5-4d66-89d3-87c937901dff"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#5C121E] flex items-center gap-1"
              >
                <span>{lang === "ta" ? "விதிமுறைகள் (Terms)" : "Terms & Conditions"}</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </a>
            </li>
            <li>
              <a
                href="https://www.freeprivacypolicy.com/live/020ee704-6e52-4ae5-8fe5-ff246bd18d9d"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#5C121E] flex items-center gap-1"
              >
                <span>{lang === "ta" ? "தனியுரிமை (Privacy Policy)" : "Privacy Policy"}</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </a>
            </li>
          </ul>
        </div>

        {/* Column 4: Language & Community */}
        <div className="space-y-3">
          <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-stone-900">
            {lang === "ta" ? "மொழி & சமூகம்" : "Language & Community"}
          </h4>
          <button
            onClick={() => onLanguageChange(lang === "ta" ? "en" : "ta")}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs font-semibold text-stone-800 hover:bg-stone-50 transition-colors cursor-pointer"
          >
            <Globe className="w-4 h-4 text-[#5C121E]" />
            <span>{lang === "ta" ? "English-க்கு மாற்றுக" : "Switch to தமிழ்"}</span>
          </button>

          <a
            href="https://chat.whatsapp.com/DqdVUsDADvCGtGtT65kSLC?s=cl&p=a&mlu=0&ilr=4"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{lang === "ta" ? "வாட்ஸ்அப் குழுவில் இணைக" : "Join WhatsApp Group"}</span>
          </a>
        </div>

      </div>

      <div className="border-t border-[#E2DDD5] py-4 px-6 text-center text-[11px] text-stone-500 font-sans flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto gap-2">
        <p>© 2026 Kaviyam Reading Platform. Crafted for Tamil literature lovers.</p>
        <div className="flex items-center gap-3">
          <a href="https://github.com/poopathiraja504-cloud" target="_blank" rel="noopener noreferrer" className="hover:underline">GitHub</a>
          <span>&bull;</span>
          <a href="https://www.linkedin.com/in/dharmenthira-boopathi-s-7087563a8" target="_blank" rel="noopener noreferrer" className="hover:underline">LinkedIn</a>
          <span>&bull;</span>
          <a href="https://x.com/dharmenthi7gec" target="_blank" rel="noopener noreferrer" className="hover:underline">X.com</a>
        </div>
      </div>
    </footer>
  );
}


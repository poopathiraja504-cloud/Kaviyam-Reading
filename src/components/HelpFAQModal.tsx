import React, { useState } from "react";
import { Language } from "../utils/i18n";
import { 
  HelpCircle, 
  BookOpen, 
  Volume2, 
  Sparkles, 
  Layers, 
  X, 
  Mail, 
  Copy, 
  Check, 
  ExternalLink, 
  MessageSquare,
  ShieldCheck,
  Share2,
  FileText,
  Linkedin,
  Twitter,
  Instagram,
  Github,
  MessageCircle,
  Lock
} from "lucide-react";

interface HelpFAQModalProps {
  lang: Language;
  onClose: () => void;
}

export default function HelpFAQModal({ lang, onClose }: HelpFAQModalProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const supportEmail = "poopathiraja504@gmail.com";

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(supportEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const faqs = [
    {
      q: lang === "ta" ? "காவியம் தளத்தில் நாவல்களை எவ்வாறு வாசிப்பது?" : "How do I read Tamil classical novels on Kaviyam?",
      a: lang === "ta" ? "நூலகத்திலிருந்து விரும்பும் நாவலைத் தேர்வு செய்து 'வாசிக்க (Read Book)' என்பதைக் கிளிக் செய்யவும். பக்கங்களை மாற்ற அம்புக்குறிகளை அல்லது விசைப்பலகை விசைகளைப் பயன்படுத்தலாம்." : "Select any classic novel from the Library Catalog and click 'Read Book'. You can navigate chapters smoothly using the navigation buttons.",
      icon: BookOpen,
    },
    {
      q: lang === "ta" ? "ஒலி வாசிப்பான் (Tamil TTS Voice) எவ்வாறு செயல்படுகிறது?" : "How does the Tamil Text-to-Speech voice reader work?",
      a: lang === "ta" ? "வாசிப்புப் பக்கத்தின் மேற்பகுதியில் உள்ள 'ஒலி வாசிப்பான்' பொத்தானை அழுத்தினால், உரை தானாகவே தூய தமிழ் உச்சரிப்பில் வாசிக்கப்படும்." : "Click the Voice Reader button at the top of the reading page to have chapters narrated aloud with smooth Tamil vocal synthesis.",
      icon: Volume2,
    },
    {
      q: lang === "ta" ? "வடிவமைப்புகள் மற்றும் பின்னணி சுவரொட்டிகளை எவ்வாறு மாற்றுவது?" : "How do I customize templates & wallpapers?",
      a: lang === "ta" ? "மேல் பட்டியில் உள்ள 'Templates' அல்லது 'Wallpapers' என்பதைக் கிளிக் செய்து, உங்களுக்குப் பிடித்த வடிவமைப்பைத் தேர்வு செய்து 'Apply' அழுத்தவும்." : "Click 'Templates' or 'Wallpapers' in the top navigation bar, choose your preferred design theme, and click 'Apply'.",
      icon: Layers,
    },
    {
      q: lang === "ta" ? "AI வாசிப்புத் தோழனை எவ்வாறு பயன்படுத்துவது?" : "How to use the Kaviyam AI Reading Companion?",
      a: lang === "ta" ? "மேல் பட்டியில் உள்ள 'AI தோழன் (Companion)' என்பதைக் கிளிக் செய்து, கதையின் கதாப்பாத்திரங்கள், வரலாற்றுப் பின்னணி அல்லது சங்க இலக்கிய வரிகள் குறித்த சந்தேகங்களைக் கேட்கலாம்." : "Switch to the Companion tab to ask questions about story characters, Chola history, or classical Tamil literary context.",
      icon: Sparkles,
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0b162c] border border-[#f0c15c]/40 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleIn">
        {/* Modal Header */}
        <div className="p-5 bg-[#081123] border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#f0c15c]/10 text-[#f0c15c]">
              <HelpCircle size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-100">
                {lang === "ta" ? "காவியம் உதவி & வழிகாட்டி (Help & Support)" : "Kaviyam Reading Guide & Support"}
              </h3>
              <p className="text-[11px] text-stone-400">
                {lang === "ta" ? "அடிக்கடி கேட்கப்படும் கேள்விகள் மற்றும் தொடர்பு" : "Help, FAQs & Official Support Contact"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800/60 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Dedicated Help & Support Contact Card (poopathiraj@gmail.com) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#122244] to-[#0a1428] border border-[#f0c15c]/40 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black text-[#f0c15c]">
                <Mail size={16} />
                <span>{lang === "ta" ? "உதவி & நேரடித் தொடர்பு (Help & Support)" : "Official Help & Support"}</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#f0c15c]/20 text-[#f0c15c] border border-[#f0c15c]/30">
                Direct Contact
              </span>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              {lang === "ta" 
                ? "காவியம் தளம் தொடர்பான கருத்துக்கள், நாவல் பதிவேற்றங்கள் அல்லது சந்தேகங்களுக்கு எங்களை நேரடியாகத் தொடர்பு கொள்ளவும்:"
                : "For inquiries, classic novel additions, or technical assistance, contact our dedicated support team directly:"}
            </p>

            <div className="p-3 bg-[#060c18] border border-stone-800 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#f0c15c]/10 text-[#f0c15c] flex items-center justify-center flex-shrink-0">
                  <Mail size={15} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-stone-400 block">Support Gmail</span>
                  <a 
                    href={`mailto:${supportEmail}?subject=Kaviyam%20Reading%20Support%20Inquiry`}
                    className="text-xs font-mono font-bold text-[#f0c15c] hover:underline truncate block"
                  >
                    {supportEmail}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="px-2.5 py-1.5 rounded-lg bg-[#0f2144] hover:bg-[#1a356b] text-stone-200 text-xs font-medium flex items-center gap-1 transition-all border border-stone-700 cursor-pointer"
                  title="Copy email address"
                >
                  {copiedEmail ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copiedEmail ? "Copied!" : "Copy"}</span>
                </button>
                <a
                  href={`mailto:${supportEmail}?subject=Kaviyam%20Reading%20Support%20Inquiry`}
                  className="px-3 py-1.5 rounded-lg bg-[#f0c15c] hover:bg-[#e0b04c] text-black text-xs font-bold flex items-center gap-1 transition-all shadow cursor-pointer"
                >
                  <ExternalLink size={12} />
                  <span>Send Mail</span>
                </a>
              </div>
            </div>
          </div>

          {/* Social Networks & WhatsApp Community */}
          <div className="p-4 rounded-2xl bg-[#09152b] border border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <Share2 size={15} />
                <span>{lang === "ta" ? "சமூக வலைத்தளங்கள் & வாசகர் குழு (Social & Community)" : "Social Media & Community Channels"}</span>
              </div>
              <span className="text-[10px] font-mono text-stone-400">Official</span>
            </div>

            {/* WhatsApp Group Highlight Card */}
            <div className="p-3 bg-emerald-950/30 border border-emerald-800/50 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={16} />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-emerald-200">
                    {lang === "ta" ? "காவியம் WhatsApp வாசகர் குழு" : "Kaviyam WhatsApp Readers Group"}
                  </h5>
                  <p className="text-[10px] text-stone-400">
                    {lang === "ta" ? "தினசரி வாசிப்புப் பகிர்வுகள் & நாவல் விவாதங்கள்" : "Join daily discussions & reading recommendations"}
                  </p>
                </div>
              </div>
              <a
                href="https://chat.whatsapp.com/DqdVUsDADvCGtGtT65kSLC?s=cl&p=a&mlu=0&ilr=4"
                target="_blank"
                rel="noreferrer noopener"
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1 transition-all shadow cursor-pointer flex-shrink-0"
              >
                <span>Join</span>
                <ExternalLink size={12} />
              </a>
            </div>

            {/* Social Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <a
                href="https://www.linkedin.com/in/dharmenthira-boopathi-s-7087563a8"
                target="_blank"
                rel="noreferrer noopener"
                className="p-2.5 rounded-xl bg-[#060c18] border border-stone-800 hover:border-sky-500/50 text-stone-300 hover:text-white flex items-center gap-2 transition-all text-xs"
              >
                <Linkedin size={14} className="text-sky-400 flex-shrink-0" />
                <span className="truncate">LinkedIn</span>
              </a>

              <a
                href="https://x.com/dharmenthi7gec"
                target="_blank"
                rel="noreferrer noopener"
                className="p-2.5 rounded-xl bg-[#060c18] border border-stone-800 hover:border-stone-400 text-stone-300 hover:text-white flex items-center gap-2 transition-all text-xs"
              >
                <Twitter size={14} className="text-stone-200 flex-shrink-0" />
                <span className="truncate">X (Twitter)</span>
              </a>

              <a
                href="https://www.instagram.com/boopathi.__.08?igsh=MTA5ZTQ2a2k1dmZvZg=="
                target="_blank"
                rel="noreferrer noopener"
                className="p-2.5 rounded-xl bg-[#060c18] border border-stone-800 hover:border-pink-500/50 text-stone-300 hover:text-white flex items-center gap-2 transition-all text-xs"
              >
                <Instagram size={14} className="text-pink-400 flex-shrink-0" />
                <span className="truncate">Instagram</span>
              </a>

              <a
                href="https://github.com/poopathiraja504-cloud"
                target="_blank"
                rel="noreferrer noopener"
                className="p-2.5 rounded-xl bg-[#060c18] border border-stone-800 hover:border-purple-500/50 text-stone-300 hover:text-white flex items-center gap-2 transition-all text-xs"
              >
                <Github size={14} className="text-purple-400 flex-shrink-0" />
                <span className="truncate">GitHub</span>
              </a>
            </div>
          </div>

          {/* Legal Policies & Compliance */}
          <div className="p-4 rounded-2xl bg-[#081224] border border-stone-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                <FileText size={15} />
                <span>{lang === "ta" ? "சட்ட விதிமுறைகள் & தனியுரிமை (Legal Policies)" : "Terms of Service & Privacy Policy"}</span>
              </div>
              <span className="text-[10px] font-mono text-stone-400">Verified</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <a
                href="https://www.termsfeed.com/live/40b50cfb-9cf5-4d66-89d3-87c937901dff"
                target="_blank"
                rel="noreferrer noopener"
                className="p-2.5 rounded-xl bg-[#060c18] border border-stone-800/90 hover:border-indigo-500/50 text-stone-200 hover:text-white flex items-center justify-between gap-2 transition-all text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText size={13} className="text-indigo-400 flex-shrink-0" />
                  <span className="truncate">{lang === "ta" ? "விதிமுறைகள் & நிபந்தனைகள்" : "Terms & Conditions"}</span>
                </div>
                <ExternalLink size={12} className="text-stone-500 flex-shrink-0" />
              </a>

              <a
                href="https://www.freeprivacypolicy.com/live/020ee704-6e52-4ae5-8fe5-ff246bd18d9d"
                target="_blank"
                rel="noreferrer noopener"
                className="p-2.5 rounded-xl bg-[#060c18] border border-stone-800/90 hover:border-indigo-500/50 text-stone-200 hover:text-white flex items-center justify-between gap-2 transition-all text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Lock size={13} className="text-indigo-400 flex-shrink-0" />
                  <span className="truncate">{lang === "ta" ? "தனியுரிமைக் கொள்கை" : "Privacy Policy"}</span>
                </div>
                <ExternalLink size={12} className="text-stone-500 flex-shrink-0" />
              </a>
            </div>
          </div>

          {/* FAQs List */}
          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              {lang === "ta" ? "அடிக்கடி கேட்கப்படும் கேள்விகள் (FAQs)" : "Frequently Asked Questions"}
            </h4>
            {faqs.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="p-4 rounded-2xl bg-[#081224] border border-stone-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#f0c15c]">
                    <Icon size={14} />
                    <h4>{item.q}</h4>
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed pl-6">
                    {item.a}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#060c18] border-t border-stone-800/80 flex items-center justify-between gap-3">
          <a
            href={`mailto:${supportEmail}`}
            className="text-xs text-stone-400 hover:text-[#f0c15c] flex items-center gap-1.5 transition-colors"
          >
            <Mail size={13} />
            <span>{supportEmail}</span>
          </a>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#f0c15c] text-black font-extrabold text-xs transition-colors cursor-pointer shadow-md"
          >
            {lang === "ta" ? "சரி (Close)" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}

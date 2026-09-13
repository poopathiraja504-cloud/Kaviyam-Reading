import React, { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp, BookOpen, Bookmark, Sparkles, Volume2, Globe, UserCheck, ShieldCheck, Mail, Send } from "lucide-react";

export default function Feedback() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const faqItems = [
    {
      category: "getting-started",
      question: "1. Getting Started / தொடங்குதல்",
      answer: "Welcome to Kaviyam-Reading! You can browse books on the Home Dashboard, explore ancient and modern Tamil literature in the Tamil Library (/tamil-library), or search for specific titles in the Catalog Library (/catalog)."
    },
    {
      category: "reading",
      question: "2. How to Read / வாசிப்பது எப்படி",
      answer: "Click on any book card and select 'Start Reading' or 'Read Now'. The distraction-free Reader workspace allows you to adjust font size (A- / A+), switch themes (Light, Sepia, Dark), navigate chapters, and listen via Text-to-Speech."
    },
    {
      category: "add-books",
      question: "3. How to Add Books / புத்தகங்கள் சேர்ப்பது எப்படி",
      answer: "Use the 'Search & Fetch Novel' feature on the Tamil Library page or Dashboard. Type any Tamil classic or modern novel name (e.g. Sivagamiyin Sabatham), and our Gemini AI backend will retrieve and compile the chapters automatically into your library."
    },
    {
      category: "bookmarks",
      question: "4. How to Use Bookmarks / குறிப்புகள் பயன்படுத்துவது எப்படி",
      answer: "Click the Bookmark icon on any book card or inside the Reader top toolbar. All saved titles will appear under 'My Books' (/my-books) and inside your Profile."
    },
    {
      category: "progress",
      question: "5. Reading Progress / வாசிப்பு முன்னேற்றம்",
      answer: "Track your reading streak, total hours read, chapters completed, and monthly goals on the Progress Dashboard (/progress)."
    },
    {
      category: "tts",
      question: "6. Text-to-Speech / குரல் வாசிப்பு",
      answer: "Inside the Reader workspace or top toolbar, click the Audio/TTS button to listen to any chapter narrated in clear Tamil or English. You can adjust playback speed in Settings."
    },
    {
      category: "ai-features",
      question: "7. AI Features / AI அம்சங்கள்",
      answer: "Navigate to AI Features (/ai-features) or click the Sparkles icon inside the Reader to get instant chapter summaries, Tamil dictionary word explanations, Q&A, and bilingual translations powered by Google Gemini."
    },
    {
      category: "language",
      question: "8. Language Settings / மொழி அமைப்புகள்",
      answer: "Click the 'தமிழ் | English' pill switcher in the top Header or inside Settings (/settings). All UI labels, navigation buttons, and descriptions will dynamically switch and persist in your browser."
    },
    {
      category: "account",
      question: "9. Account & Login / கணக்கு & உள்நுழைவு",
      answer: "Sign in with Email/Password, Mobile SMS OTP, or Google Sign-In. You can manage your profile, security logs, 2FA, and saved preferences under Profile Settings (/profile)."
    }
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <div className="space-y-8 font-sans pb-12 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-[#3B0B12] via-[#4A0E17] to-[#5C121E] text-white p-8 rounded-3xl border border-[#D4AF37]/30 shadow-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 text-xs font-semibold">
          <HelpCircle className="w-4 h-4" />
          <span>Help & Support Center</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-white">
          Help & Frequently Asked Questions (FAQ)
        </h1>
        <p className="text-xs sm:text-sm text-amber-100/80 max-w-2xl">
          Find answers to common questions about reading Tamil novels, bookmarking, AI features, language switching, and account security.
        </p>
      </div>

      {/* Accordion List */}
      <div className="p-6 rounded-3xl bg-white border border-[#E2DDD5] shadow-sm space-y-3">
        <h2 className="font-serif font-bold text-xl text-[#3B0B12] mb-4">
          Frequently Asked Questions
        </h2>

        {faqItems.map((item, idx) => {
          const isExpanded = expandedIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-[#E2DDD5] overflow-hidden transition-all"
            >
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                className="w-full p-4 text-left font-serif font-bold text-stone-900 text-sm sm:text-base flex items-center justify-between bg-[#FDFBF7] hover:bg-[#F7F2EB] transition-colors"
              >
                <span>{item.question}</span>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-[#3B0B12]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-stone-400" />
                )}
              </button>

              {isExpanded && (
                <div className="p-4 bg-white text-xs sm:text-sm text-stone-700 leading-relaxed border-t border-[#E2DDD5] font-sans">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Contact Support Form */}
      <div className="p-6 rounded-3xl bg-white border border-[#E2DDD5] shadow-sm space-y-4">
        <h2 className="font-serif font-bold text-xl text-[#3B0B12] flex items-center gap-2">
          <Mail className="w-5 h-5 text-[#D4AF37]" />
          <span>Contact Support / பின்னூட்டம்</span>
        </h2>

        {submitted ? (
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            ✓ Thank you! Your feedback/question has been submitted successfully.
          </div>
        ) : (
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Boopathi"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E2DDD5]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Your Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="boopathi@example.com"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E2DDD5]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Message / Query</label>
              <textarea
                rows={3}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we help you?"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E2DDD5]"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#3B0B12] text-[#D4AF37] font-bold text-xs shadow-md hover:brightness-110 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Query</span>
            </button>
          </form>
        )}
      </div>

    </div>
  );
}

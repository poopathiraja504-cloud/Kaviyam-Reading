import React, { useState } from "react";
import { HelpCircle, MessageSquare, Send, CheckCircle, ChevronDown, BookOpen } from "lucide-react";

export default function Feedback() {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const faqs = [
    {
      q: "Kaviyam Reading தளத்தில் பொன்னியின் செல்வன் முழுமையாகக் கிடைக்குமா?",
      a: "ஆம், பொன்னியின் செல்வனின் அனைத்து 5 பாகங்களும் (அத்தியாயங்கள் 1-293) தமிழ் மற்றும் ஆங்கில விளக்கவுரையுடன் வாசிக்கக் கிடைக்கின்றன.",
    },
    {
      q: "AI வாசிப்புத் தோழன் (Gemini Companion) எவ்வாறு இயங்குகிறது?",
      a: "AI Companion என்பது தமிழ் நாவலின் கதாபாத்திரங்கள், அத்தியாயக் கதைகள், மற்றும் வரலாற்று உண்மைகளை உடனடியாக பகுப்பாய்வு செய்து விளக்கும் நவீன AI உதவியாளராகும்.",
    },
    {
      q: "ஆடியோ புத்தக வசதி (Audio Reader / TTS) உள்ளதா?",
      a: "ஆம், நீங்கள் புத்தக அத்தியாய வாசிப்பில் உள்ள ஸ்பீக்கர் பொத்தானை அழுத்தி உரையை குரல் வடிவில் கேட்கலாம்.",
    },
    {
      q: "எனது வாசிப்பு முன்னேற்றம் எவ்வாறு சேமிக்கப்படுகிறது?",
      a: "Firebase Auth மற்றும் Browser LocalStorage மூலம் உங்கள் புத்தகக்குறிகள் மற்றும் வாசிப்பு தரவுகள் பாதுகாப்பாக சேமிக்கப்படுகின்றன.",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", message: "" });
    }, 3000);
  };

  return (
    <div className="space-y-8 font-sans pb-12 max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <h2 className="font-serif font-bold text-2xl text-[#3B0B12]">
          உதவி மையம் & அடிக்கடி கேட்கப்படும் கேள்விகள் (Help & FAQ)
        </h2>
        <p className="text-xs text-stone-500 mt-1">
          Kaviyam Reading தளத்தைப் பற்றிய சந்தேகங்கள் மற்றும் உங்கள் கருத்துக்கள்
        </p>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-3">
        <h3 className="font-serif font-bold text-base text-[#3B0B12] flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#5C121E]" />
          <span>அடிக்கடி கேட்கப்படும் கேள்விகள் (Frequently Asked Questions)</span>
        </h3>

        <div className="space-y-2">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white border border-[#E2DDD5] shadow-sm overflow-hidden transition-all"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full text-left p-4 font-serif font-bold text-sm text-stone-900 flex items-center justify-between hover:bg-stone-50"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-stone-500 transition-transform ${
                    activeFaq === idx ? "rotate-180" : ""
                  }`}
                />
              </button>

              {activeFaq === idx && (
                <div className="px-4 pb-4 text-xs text-stone-600 font-sans leading-relaxed border-t border-stone-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Feedback / Contact Form */}
      <div className="p-6 rounded-3xl bg-white border border-[#E2DDD5] shadow-lg space-y-4">
        <h3 className="font-serif font-bold text-base text-[#3B0B12] flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#5C121E]" />
          <span>உங்கள் கருத்துக்களை / ஆலோசனைகளை அனுப்புக</span>
        </h3>

        {submitted ? (
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>நன்றி! உங்கள் கருத்து வெற்றிகரமாக பெறப்பட்டது.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="உங்கள் பெயர்"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-[#5C121E]"
              />
              <input
                type="email"
                required
                placeholder="மின்னஞ்சல் முகவரி"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-[#5C121E]"
              />
            </div>

            <textarea
              required
              rows={4}
              placeholder="உங்கள் செய்தியை இங்கு பதிவிடவும்..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-[#5C121E]"
            />

            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#5C121E] hover:bg-[#3B0B12] text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>கருத்து அனுப்புக</span>
            </button>
          </form>
        )}
      </div>

    </div>
  );
}

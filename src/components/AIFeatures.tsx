import React, { useState } from "react";
import { Sparkles, FileText, HelpCircle, Globe, BookOpen, Send, CheckCircle } from "lucide-react";
import { Language, translations } from "../utils/i18n";

interface AIFeaturesProps {
  lang: Language;
}

export default function AIFeatures({ lang }: AIFeaturesProps) {
  const [prompt, setPrompt] = useState("");
  const [activeTool, setActiveTool] = useState<string>("summarize");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const t = (key: keyof typeof translations["ta"]) => translations[lang][key] || key;

  const tools = [
    { id: "summarize", title: t("aiSummarize"), icon: FileText, desc: "Get concise Tamil summaries of chapters" },
    { id: "explain", title: t("aiExplainWords"), icon: BookOpen, desc: "Deep Tamil dictionary definitions & context" },
    { id: "ask", title: t("aiAskBook"), icon: HelpCircle, desc: "Ask any question about Tamil literature" },
    { id: "translate", title: t("aiTamilEnglish"), icon: Globe, desc: "Bilingual Tamil ↔ English literary translation" },
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch("/api/gemini/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `[Tool: ${activeTool}] Language: ${lang}. User Request: ${prompt}`,
        }),
      });
      const data = await res.json();
      setResponse(data.result || "Generated analysis response.");
    } catch (err: any) {
      setResponse("AI Service Notice: Please ensure server API key is configured.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans pb-12 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-[#3B0B12] via-[#4A0E17] to-[#5C121E] text-white p-8 rounded-3xl border border-[#D4AF37]/30 shadow-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-amber-200 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          <span>{lang === "ta" ? "ஜெமினி AI நுட்பம்" : "Powered by Google Gemini"}</span>
        </div>
        <h1 className="font-serif text-3xl font-extrabold text-white">
          {t("aiAssistantTitle")}
        </h1>
        <p className="text-xs sm:text-sm text-amber-100/80 max-w-2xl">
          {t("aiSubtitle")}
        </p>
      </div>

      {/* Tool Selector Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isActive
                  ? "bg-[#3B0B12] text-white border-[#D4AF37] shadow-lg"
                  : "bg-white text-stone-800 border-[#E2DDD5] hover:border-[#D4AF37]"
              }`}
            >
              <Icon className={`w-5 h-5 mb-2 ${isActive ? "text-[#D4AF37]" : "text-[#5C121E]"}`} />
              <h3 className="font-serif font-bold text-sm">{tool.title}</h3>
              <p className="text-[11px] opacity-70 mt-0.5">{tool.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Interactive Prompt Form */}
      <div className="p-6 rounded-3xl bg-white border border-[#E2DDD5] shadow-sm space-y-4">
        <form onSubmit={handleGenerate} className="space-y-4">
          <label className="block text-xs font-bold text-stone-700">
            {lang === "ta" ? "உங்கள் கேள்வியை அல்லது உரைப்பகுதியை உள்ளிடுங்கள்:" : "Enter your passage or request:"}
          </label>

          <div className="relative">
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t("aiPromptPlaceholder")}
              className="w-full p-4 text-xs rounded-2xl bg-[#FDFBF7] border border-[#E2DDD5] text-stone-900 focus:outline-none focus:border-[#3B0B12]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#4A0E17] to-[#3B0B12] text-[#D4AF37] font-bold text-xs shadow-md hover:brightness-110 flex items-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? "ஆராய்கிறது..." : t("aiGenerate")}</span>
          </button>
        </form>

        {/* AI Output Card */}
        {response && (
          <div className="p-6 rounded-2xl bg-[#F7F2EB] border border-[#D4AF37]/30 space-y-2">
            <span className="text-xs font-bold text-[#3B0B12] uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-[#D4AF37]" />
              {lang === "ta" ? "AI பகுப்பாய்வு முடிவு" : "AI Analysis Output"}
            </span>
            <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-sans whitespace-pre-line">
              {response}
            </p>
          </div>
        )}
      </div>

    </div>
  );
}

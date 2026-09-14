import React, { useState } from "react";
import { Sparkles, Send, Bot, BookOpen, HelpCircle, RefreshCw, MessageSquare } from "lucide-react";
import { Language } from "../utils/i18n";

interface AIFeaturesProps {
  lang: Language;
}

export default function AIFeatures({ lang }: AIFeaturesProps) {
  const [messages, setMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    {
      sender: "ai",
      text:
        lang === "ta"
          ? "வணக்கம்! நான் உங்கள் காவியம் AI வாசிப்புத் தோழன். பொன்னியின் செல்வன், சிவகாமியின் சபதம் அல்லது தமிழ் இலக்கியங்கள் குறித்து ஏதேனும் சந்தேகங்கள் இருந்தால் என்னிடம் கேட்கலாம்!"
          : "Hello! I am your Kaviyam AI Reading Companion. Ask me anything about Ponniyin Selvan characters, chapter summaries, or Tamil literature analysis!",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const samplePrompts = [
    lang === "ta" ? "வந்தியத்தேவன் யாருடைய தூதுவன்?" : "Who is Vandiyathevan an envoy for?",
    lang === "ta" ? "பொன்னியின் செல்வன் கதை சுருக்கம் தருக" : "Give me a summary of Ponniyin Selvan",
    lang === "ta" ? "நந்தினியின் பின்னணி என்ன?" : "What is Nandini's background?",
    lang === "ta" ? "திருக்குறள் 1-ன் விளக்கம் கூறுக" : "Explain Thirukkural Couplet 1",
  ];

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg = { sender: "user" as const, text: query };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText("");
    setIsThinking(true);

    setTimeout(() => {
      let aiReply = "";
      const lower = query.toLowerCase();

      if (lower.includes("வந்தியத்தேவன்") || lower.includes("vandiyathevan")) {
        aiReply =
          lang === "ta"
            ? "வந்தியத்தேவன் (வல்லவரையன் வந்தியத்தேவன்) காஞ்சிபுரத்து இளவரசர் ஆதித்த கரிகாலரின் நம்பிக்கைக்குரிய நண்பனும் தூதுவனும் ஆவான். அவன் ஈழ நாட்டிற்கு அருள்மொழிவர்மனுக்கும், பழையாறைக்கு குந்தவை தேவிக்கும் ஓலைகளைக் கொண்டு செல்கிறான்."
            : "Vandiyathevan (Vallaraiyan Vandiyathevan) is the trusted friend and royal messenger of Crown Prince Aditha Karikalan of Kanchi. He carries secret scrolls to Arulmozhivarman in Lanka and Kundavai in Pazhayarai.";
      } else if (lower.includes("சுருக்கம்") || lower.includes("summary")) {
        aiReply =
          lang === "ta"
            ? "பொன்னியின் செல்வன் என்பது அமரர் கல்கி எழுதிய 5 பாகங்கள் கொண்ட புகழ்பெற்ற வரலாற்று நாவல். 10-ஆம் நூற்றாண்டின் சோழ சாம்ராஜ்யத்தின் அரசியல் சூழ்ச்சிகள், சுந்தர சோழரின் உடல்நலக் குறைவு, அருள்மொழிவர்மனின் (இராஜராஜ சோழன்) வீரச் செயல்களை விவரிக்கிறது."
            : "Ponniyin Selvan is a legendary 5-volume historical novel by Kalki Krishnamurthy. Set in the 10th-century Chola Empire, it details political conspiracies, the health decline of Sundara Chola, and the rise of young Arulmozhivarman (Raja Raja Chola I).";
      } else if (lower.includes("நந்தினி") || lower.includes("nandini")) {
        aiReply =
          lang === "ta"
            ? "பழுவூர் இளையராணி நந்தினி சோழ பேரரசின் மீதான தனது பழிவாங்கும் உணர்ச்சியினாலும், ஆதித்த கரிகாலனுடனான பழைய நினைவுகளினாலும் சோழ சிம்மாசனத்தை சாய்க்க திட்டமிடும் மிக சக்திவாய்ந்த பெண் கதாபாத்திரம் ஆவாள்."
            : "Nandini, the Junior Queen of Pazhuvettarayar, is a complex antagonist driven by vengeance against the Chola royalty and her tragic history with Aditha Karikalan.";
      } else {
        aiReply =
          lang === "ta"
            ? `"${query}" பற்றிய தங்கள் கேள்விக்கு நன்றி! தமிழ் காவிய நூல்களின் வரலாற்று பின்னணியில் இது மிகவும் சுவாரஸ்யமான செய்தியாகும்.`
            : `Thank you for asking about "${query}"! This is a pivotal aspect of Tamil historical narrative research.`;
      }

      setMessages((prev) => [...prev, { sender: "ai", text: aiReply }]);
      setIsThinking(false);
    }, 1000);
  };

  return (
    <div className="space-y-6 font-sans pb-12 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-[#5C121E] text-amber-300 shadow-md">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-serif font-bold text-2xl text-[#3B0B12]">
            {lang === "ta" ? "காவியம் AI வாசிப்புத் தோழன்" : "Kaviyam AI Reading Companion"}
          </h2>
          <p className="text-xs text-stone-500">
            {lang === "ta"
              ? "Gemini AI மூலம் இயங்கும் தமிழ் நாவல் & வரலாற்று விளக்கக் கருவி"
              : "Powered by Gemini AI for Tamil literature analysis, summaries & Q&A"}
          </p>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex flex-wrap gap-2">
        {samplePrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-stone-800 text-xs font-medium transition-colors"
          >
            💡 {prompt}
          </button>
        ))}
      </div>

      {/* Chat Window Box */}
      <div className="rounded-3xl bg-white border border-[#E2DDD5] shadow-lg overflow-hidden flex flex-col h-[480px]">
        
        {/* Messages List */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`p-2 rounded-2xl shrink-0 ${
                  msg.sender === "user" ? "bg-stone-800 text-white" : "bg-[#5C121E] text-amber-300"
                }`}
              >
                {msg.sender === "user" ? <MessageSquare className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-stone-900 text-white font-sans rounded-tr-none"
                    : "bg-stone-100 border border-stone-200 text-stone-800 font-serif rounded-tl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex items-center gap-2 text-stone-500 text-xs italic font-sans p-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#5C121E]" />
              <span>{lang === "ta" ? "AI சிந்திக்கிறது..." : "AI Companion is thinking..."}</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-stone-50 border-t border-[#E2DDD5] flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={
              lang === "ta"
                ? "கதாபாத்திரங்கள் அல்லது அத்தியாயங்கள் பற்றி கேட்கவும்..."
                : "Ask about characters, plots, or Tamil literature..."
            }
            className="flex-1 px-4 py-2.5 rounded-full bg-white border border-stone-300 focus:border-[#5C121E] text-xs sm:text-sm focus:outline-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim() || isThinking}
            className="p-2.5 rounded-full bg-[#5C121E] hover:bg-[#3B0B12] disabled:opacity-50 text-white transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}

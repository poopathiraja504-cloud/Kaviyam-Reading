import React, { useState } from "react";
import { Language, translations } from "../utils/i18n";
import { TemplateItem } from "../types";
import { 
  Search, 
  Sparkles, 
  Check, 
  Eye, 
  Heart, 
  Layout, 
  Monitor, 
  Smartphone, 
  BookOpen, 
  Palette, 
  X,
  Layers
} from "lucide-react";

interface TemplatesViewProps {
  lang: Language;
  currentTheme?: string;
  onApplyTheme: (themeClass: string, templateName: string) => void;
  onClose?: () => void;
}

export const TEMPLATES_DATA: TemplateItem[] = [
  {
    id: "template-classic-ivory",
    name: "Classic Ivory Reader",
    nameTa: "மரபு தந்தம் வாசிப்பான் (Classic Ivory)",
    category: "Reading Page",
    description: "A bright, clean ivory layout focused purely on text legibility and minimal distractions.",
    descriptionTa: "கண்களுக்கு இதமான தந்த நிற பின்னணியில் வாசிப்புக்கு மட்டுமே முக்கியத்துவம் அளிக்கும் எழில்மிகு வடிவம்.",
    previewImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    themeClass: "theme-ivory",
    bgColor: "#FAF7F2",
    accentColor: "#8D5B4C",
    isPopular: true,
  },
  {
    id: "template-midnight-deep",
    name: "Midnight Deep Library",
    nameTa: "அர்த்தசாம கடல் நூலகம் (Midnight Deep)",
    category: "Home Page",
    description: "A dark theme using deep navy and gold accents for late-night reading sessions.",
    descriptionTa: "இரவு நேர வாசிப்பிற்கு ஏற்ற ஆழ்ந்த நீலமும் தங்க வண்ணமும் கலந்த கம்பீரமான நூலக வடிவம்.",
    previewImage: "https://images.unsplash.com/photo-1507842229451-7f01be7a50d2?auto=format&fit=crop&w=800&q=80",
    themeClass: "theme-midnight",
    bgColor: "#070E1C",
    accentColor: "#F0C15C",
    isPopular: true,
  },
  {
    id: "template-ancient-palm-leaf",
    name: "Ancient Palm Leaf Motif",
    nameTa: "பண்டைத் தமிழ் ஓலைச்சுவடி மரபு",
    category: "Tamil Library",
    description: "Incorporate subtle textures of ancient Tamil palm leaf manuscripts into the UI.",
    descriptionTa: "சங்ககால ஓலைச்சுவடிகளின் நுட்பமான இயற்கை வண்ணங்களையும் பழங்கால கல்வெட்டு நேர்த்தியையும் கொண்ட வடிவம்.",
    previewImage: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
    themeClass: "theme-palm-leaf",
    bgColor: "#1A1510",
    accentColor: "#D48C1A",
    isPopular: true,
  },
  {
    id: "template-chola-imperial",
    name: "Chola Imperial Gold & Crimson",
    nameTa: "சோழப் பேரரசு செம்மொழி தங்கம்",
    category: "Library",
    description: "Rich terracotta, regal crimson, and imperial gold inspired by Ponniyin Selvan and Thanjavur art.",
    descriptionTa: "பொன்னியின் செல்வன் மற்றும் தஞ்சைப் பெருவுடையார் ஆலய மாண்பை நினைவூட்டும் சோழர் காலப் பொன்வண்ண வடிவம்.",
    previewImage: "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=800&q=80",
    themeClass: "theme-chola",
    bgColor: "#140A07",
    accentColor: "#E09A38",
  },
  {
    id: "template-sangam-minimal",
    name: "Modern Sangam Minimalist",
    nameTa: "நவீன சங்க இலக்கிய எளிய வடிவம்",
    category: "Book Details",
    description: "Generous whitespace, refined Tamil typography, and modern cards for book overviews.",
    descriptionTa: "சங்க இலக்கியப் பாடல்களை நேர்த்தியான எழுத்துருவில் ரசிக்க உதவும் எளிய நவீன இடைமுகம்.",
    previewImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
    themeClass: "theme-sangam",
    bgColor: "#0B132B",
    accentColor: "#48CAE4",
  },
  {
    id: "template-cozy-parchment",
    name: "Cozy Vintage Parchment",
    nameTa: "பழைய காகித வாசிப்பு மடல்",
    category: "Reading Page",
    description: "Warm sepia tones imitating vintage printed paperback paperbacks for zero eye fatigue.",
    descriptionTa: "பழைய அச்சுப் புத்தகங்களின் காகித நிறத்தில் கண் சோர்வின்றி மணிநேரங்கள் வாசிக்க உதவும் மென்மையான செபியா வடிவம்.",
    previewImage: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80",
    themeClass: "theme-sepia",
    bgColor: "#231C16",
    accentColor: "#E2A478",
  },
  {
    id: "template-mobile-pocket",
    name: "Pocket Tamil Scroll Layout",
    nameTa: "கைபேசி விரைவு வாசிப்பு வடிவம்",
    category: "Mobile Layout",
    description: "Optimized single-thumb scrolling layout designed specifically for mobile screens.",
    descriptionTa: "கைபேசிகளில் ஒற்றைக் கை விரலால் மிக எளிதாகப் பக்கங்களை மாற்ற உதவும் பிரத்யேக வடிவமைப்பு.",
    previewImage: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80",
    themeClass: "theme-mobile",
    bgColor: "#080F1E",
    accentColor: "#38BDF8",
  },
  {
    id: "template-editorial-profile",
    name: "Tamil Scholar Profile Dashboard",
    nameTa: "தமிழ் ஆய்வாளர் சுயவிவர வடிவம்",
    category: "Profile",
    description: "Detailed scholarly profile layout displaying reading statistics and book collections.",
    descriptionTa: "வாசிப்புப் புள்ளிவிவரங்கள், வாசித்த நூல்கள் மற்றும் தனிப்பயன் குறிப்புகளைக் காட்டும் ஆய்வாளர் தளம்.",
    previewImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80",
    themeClass: "theme-scholar",
    bgColor: "#091426",
    accentColor: "#F0C15C",
  },
  {
    id: "template-auth-gateway",
    name: "Royal Palace Auth Portal",
    nameTa: "அரண்மனை உள்நுழைவு தளம்",
    category: "Login Page",
    description: "Grand entrance gateway featuring gold filigree borders and secure authentication forms.",
    descriptionTa: "தங்க நுண்கலை வேலைப்பாடுகளுடன் கூடிய கம்பீரமான பாதுகாப்பு உள்நுழைவு பக்கம்.",
    previewImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    themeClass: "theme-palace",
    bgColor: "#0A1120",
    accentColor: "#F59E0B",
  }
];

const CATEGORIES = [
  "All",
  "Home Page",
  "Reading Page",
  "Book Details",
  "Login Page",
  "Profile",
  "Library",
  "Tamil Library",
  "Mobile Layout",
] as const;

export default function TemplatesView({
  lang,
  currentTheme = "theme-midnight",
  onApplyTheme,
  onClose,
}: TemplatesViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeApplied, setActiveApplied] = useState<string>(currentTheme);
  const [likedTemplates, setLikedTemplates] = useState<string[]>(["template-midnight-deep"]);
  const [previewingTemplate, setPreviewingTemplate] = useState<TemplateItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedTemplates((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleApply = (tpl: TemplateItem) => {
    setActiveApplied(tpl.themeClass);
    onApplyTheme(tpl.themeClass, tpl.name);
    setToastMessage(lang === "ta" ? `"${tpl.nameTa || tpl.name}" வடிவம் செயல்படுத்தப்பட்டது!` : `Applied "${tpl.name}" template successfully!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredTemplates = TEMPLATES_DATA.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(q) ||
      (item.nameTa && item.nameTa.toLowerCase().includes(q)) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-gradient-to-r from-[#172b50] to-[#0d1a33] border border-[#f0c15c] text-[#f0c15c] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold animate-bounce">
          <Sparkles size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner - Matching 5th Screenshot */}
      <div className="text-center space-y-3 pt-2">
        <div className="inline-flex items-center justify-center gap-2.5 text-2xl sm:text-3xl font-black text-stone-100">
          <Monitor className="text-[#f0c15c]" size={30} />
          <span>Kaviyam</span>
          <span className="bg-gradient-to-r from-[#e5a93b] via-[#f5cf75] to-[#c98722] bg-clip-text text-transparent font-serif italic">
            Templates
          </span>
        </div>
        <p className="text-xs sm:text-sm text-stone-300 max-w-lg mx-auto font-sans leading-relaxed">
          {lang === "ta"
            ? "உங்கள் காவியம் வாசிப்பு அனுபவத்திற்கு ஏற்ற எழில்மிகு வடிவமைப்பைத் தேர்வு செய்யுங்கள்."
            : "Choose a beautiful design layout for your Kaviyam Reading experience."}
        </p>
      </div>

      {/* Search Bar matching screenshot */}
      <div className="max-w-xl mx-auto">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-3.5 text-stone-400" />
          <input
            type="text"
            placeholder={lang === "ta" ? "வடிவமைப்புகளைத் தேடுக..." : "Search templates..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#081224] border border-stone-800 rounded-full text-xs sm:text-sm text-stone-100 placeholder-stone-400 focus:outline-none focus:border-[#f0c15c] shadow-inner"
          />
        </div>
      </div>

      {/* Category Pills matching screenshot */}
      <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none px-2">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? "bg-black text-white shadow-md border border-stone-700"
                  : "bg-[#091426] text-stone-300 hover:text-white border border-stone-800/80 hover:border-stone-700"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Templates Grid matching 5th screenshot */}
      {filteredTemplates.length === 0 ? (
        <div className="p-12 text-center bg-[#091426] border border-stone-800 rounded-3xl text-stone-400">
          <p className="text-sm font-semibold">
            {lang === "ta" ? "பொருத்தமான வடிவமைப்பு எதுவும் கிடைக்கவில்லை." : "No templates matched your search."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((tpl) => {
            const isApplied = activeApplied === tpl.themeClass;
            const isLiked = likedTemplates.includes(tpl.id);
            const displayName = lang === "ta" && tpl.nameTa ? tpl.nameTa : tpl.name;
            const displayDesc = lang === "ta" && tpl.descriptionTa ? tpl.descriptionTa : tpl.description;

            return (
              <div
                key={tpl.id}
                className="bg-[#091426] border border-[#172744] hover:border-[#f0c15c]/50 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between transition-all duration-300 group"
              >
                {/* Image Container with Preview and Like Button */}
                <div className="relative h-56 w-full overflow-hidden bg-stone-900 group">
                  <img
                    src={tpl.previewImage}
                    alt={tpl.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#091426] via-transparent to-black/20" />

                  {/* Heart / Like Button */}
                  <button
                    onClick={(e) => toggleLike(tpl.id, e)}
                    className="absolute top-3.5 right-3.5 p-2 rounded-full bg-white/80 hover:bg-white text-stone-800 hover:text-red-500 shadow-md backdrop-blur transition-colors cursor-pointer"
                    title="Bookmark Template"
                  >
                    <Heart
                      size={15}
                      fill={isLiked ? "#EF4444" : "none"}
                      className={isLiked ? "text-red-500" : ""}
                    />
                  </button>

                  {/* Center Preview Button Overlay */}
                  <button
                    onClick={() => setPreviewingTemplate(tpl)}
                    className="absolute inset-0 m-auto w-28 h-10 rounded-xl bg-black/70 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity duration-200 border border-stone-600 shadow-lg cursor-pointer"
                  >
                    <Eye size={14} />
                    <span>{lang === "ta" ? "முன்னோட்டம்" : "Preview"}</span>
                  </button>
                </div>

                {/* Card Content Area */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] font-mono font-black text-[#f0c15c] tracking-widest uppercase block mb-1">
                      {tpl.category}
                    </span>
                    <h3 className="text-lg font-serif font-black text-stone-100 group-hover:text-[#f0c15c] transition-colors leading-snug">
                      {displayName}
                    </h3>
                    <p className="text-xs text-stone-300 mt-2 leading-relaxed line-clamp-3">
                      {displayDesc}
                    </p>
                  </div>

                  {/* Apply Template Button */}
                  <div className="pt-3">
                    <button
                      onClick={() => handleApply(tpl)}
                      className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                        isApplied
                          ? "bg-emerald-500 text-white shadow-emerald-500/20"
                          : "bg-black hover:bg-stone-900 text-white border border-stone-800 hover:border-[#f0c15c]/40"
                      }`}
                    >
                      {isApplied ? (
                        <>
                          <Check size={15} />
                          <span>{lang === "ta" ? "செயலில் உள்ளது (Active)" : "Applied Template"}</span>
                        </>
                      ) : (
                        <span>{lang === "ta" ? "வடிவமைப்பை செயல்படுத்து" : "Apply Template"}</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Fullscreen Template Preview Modal */}
      {previewingTemplate && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b162c] border border-[#f0c15c]/50 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-[#081123] border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layout size={18} className="text-[#f0c15c]" />
                <h3 className="text-sm font-bold text-stone-100">{previewingTemplate.name}</h3>
              </div>
              <button
                onClick={() => setPreviewingTemplate(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <img
                src={previewingTemplate.previewImage}
                alt={previewingTemplate.name}
                className="w-full h-72 object-cover rounded-2xl shadow-lg border border-stone-800"
              />
              <div>
                <span className="text-xs text-[#f0c15c] font-bold uppercase tracking-wider">{previewingTemplate.category}</span>
                <p className="text-xs text-stone-300 mt-1 leading-relaxed">{previewingTemplate.description}</p>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setPreviewingTemplate(null)}
                  className="px-4 py-2 rounded-xl text-xs text-stone-400 hover:text-stone-200"
                >
                  {lang === "ta" ? "மூடு" : "Close"}
                </button>
                <button
                  onClick={() => {
                    handleApply(previewingTemplate);
                    setPreviewingTemplate(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#f0c15c] text-black font-extrabold text-xs shadow-md"
                >
                  {lang === "ta" ? "இப்போதே செயல்படுத்து" : "Apply This Template"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from "react";
import { Language } from "../utils/i18n";
import { WallpaperItem } from "../types";
import { 
  Image as ImageIcon, 
  Download, 
  Check, 
  Sparkles, 
  Eye, 
  X, 
  UploadCloud, 
  Search,
  Maximize2
} from "lucide-react";

interface WallpapersViewProps {
  lang: Language;
  currentWallpaper?: string;
  onApplyWallpaper: (url: string, title: string) => void;
  onClose?: () => void;
}

export const WALLPAPERS_DATA: WallpaperItem[] = [
  {
    id: "wall-brihadeeswarar",
    title: "Thanjavur Brihadeeswarar Temple Dusk",
    titleTa: "தஞ்சைப் பெருவுடையார் ஆலயம் - அந்திப் பொன்மாலை",
    category: "Architecture",
    imageUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1920&q=85",
    thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
    resolution: "4K Ultra HD",
    downloads: 4120,
  },
  {
    id: "wall-ancient-library",
    title: "Midnight Royal Literary Archive",
    titleTa: "அரச நூலகப் புத்தக அடுக்குகள்",
    category: "Bookshelf",
    imageUrl: "https://images.unsplash.com/photo-1507842229451-7f01be7a50d2?auto=format&fit=crop&w=1920&q=85",
    thumbnailUrl: "https://images.unsplash.com/photo-1507842229451-7f01be7a50d2?auto=format&fit=crop&w=800&q=80",
    resolution: "4K Ultra HD",
    downloads: 3890,
  },
  {
    id: "wall-palm-leaf-art",
    title: "Sangam Palm Leaf & Quill Study",
    titleTa: "சங்க இலக்கிய ஓலைச்சுவடியும் எழுத்தாணியும்",
    category: "Manuscript",
    imageUrl: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1920&q=85",
    thumbnailUrl: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80",
    resolution: "Full HD 1080p",
    downloads: 2750,
  },
  {
    id: "wall-madurai-gopuram",
    title: "Madurai Meenakshi Celestial Towers",
    titleTa: "மதுரை மீனாட்சி அம்மன் கோபுரம்",
    category: "Heritage",
    imageUrl: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=1920&q=85",
    thumbnailUrl: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=800&q=80",
    resolution: "4K Ultra HD",
    downloads: 5120,
  },
  {
    id: "wall-chola-bronze",
    title: "Chola Nataraja & Sacred Bronze Sculptures",
    titleTa: "சோழர் கால நடராஜர் வெண்கலச் சிற்பம்",
    category: "Imperial",
    imageUrl: "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1920&q=85",
    thumbnailUrl: "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=800&q=80",
    resolution: "4K Ultra HD",
    downloads: 3410,
  },
  {
    id: "wall-cauvery-river",
    title: "Ponni River Waters of Chola Kingdom",
    titleTa: "பொன்னி நதி அலைகள் - காவிரி",
    category: "Nature",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=85",
    thumbnailUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    resolution: "4K Ultra HD",
    downloads: 1980,
  }
];

export default function WallpapersView({
  lang,
  currentWallpaper,
  onApplyWallpaper,
  onClose,
}: WallpapersViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeWall, setActiveWall] = useState<string>(currentWallpaper || "");
  const [previewWall, setPreviewWall] = useState<WallpaperItem | null>(null);
  const [customList, setCustomList] = useState<WallpaperItem[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const categories = ["All", "Architecture", "Bookshelf", "Manuscript", "Heritage", "Imperial", "Nature"];

  const handleApply = (wall: WallpaperItem) => {
    setActiveWall(wall.imageUrl);
    onApplyWallpaper(wall.imageUrl, wall.title);
    setToastMsg(lang === "ta" ? `"${wall.titleTa || wall.title}" பின்னணியாக அமைக்கப்பட்டது!` : `Set "${wall.title}" as active wallpaper!`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const url = reader.result as string;
        const newWall: WallpaperItem = {
          id: `custom-wall-${Date.now()}`,
          title: file.name.replace(/\.[^/.]+$/, ""),
          titleTa: "தனிப்பயன் பதிவேற்றம்",
          category: "Heritage",
          imageUrl: url,
          thumbnailUrl: url,
          resolution: "Custom User Image",
          downloads: 1,
        };
        setCustomList((prev) => [newWall, ...prev]);
        handleApply(newWall);
      };
      reader.readAsDataURL(file);
    }
  };

  const allWallpapers = [...customList, ...WALLPAPERS_DATA];
  const filtered = allWallpapers.filter(
    (w) => selectedCategory === "All" || w.category === selectedCategory
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-16">
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-gradient-to-r from-[#172b50] to-[#0d1a33] border border-[#f0c15c] text-[#f0c15c] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold animate-bounce">
          <Sparkles size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="text-center space-y-3 pt-2">
        <div className="inline-flex items-center justify-center gap-2.5 text-2xl sm:text-3xl font-black text-stone-100">
          <ImageIcon className="text-[#f0c15c]" size={30} />
          <span>Kaviyam</span>
          <span className="bg-gradient-to-r from-[#e5a93b] via-[#f5cf75] to-[#c98722] bg-clip-text text-transparent font-serif italic">
            Wallpapers &amp; Themes
          </span>
        </div>
        <p className="text-xs sm:text-sm text-stone-300 max-w-lg mx-auto leading-relaxed">
          {lang === "ta"
            ? "காவியம் நாவல் வாசிப்பிற்குப் பொருத்தமான எழில்மிகு தமிழ் கலாச்சார மற்றும் நூலகப் பின்னணி சுவரொட்டிகள்."
            : "Immerse yourself in classical Tamil heritage and cozy reading sanctuary wallpapers."}
        </p>
      </div>

      {/* Upload & Category Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#081224] p-3 rounded-2xl border border-stone-800">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#f0c15c] text-black font-extrabold shadow-sm"
                  : "bg-[#050b16] text-stone-400 hover:text-stone-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <label className="px-4 py-2 bg-[#0e1d38] hover:bg-[#152a50] border border-[#f0c15c]/40 text-[#f0c15c] text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-sm transition-all whitespace-nowrap">
          <UploadCloud size={14} />
          <span>{lang === "ta" ? "சொந்தப் பின்னணி பதிவேற்று" : "Upload Custom Wallpaper"}</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleCustomUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((wall) => {
          const isSelected = activeWall === wall.imageUrl;
          const displayTitle = lang === "ta" && wall.titleTa ? wall.titleTa : wall.title;

          return (
            <div
              key={wall.id}
              className="bg-[#091426] border border-[#182a4d] hover:border-[#f0c15c]/60 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between group transition-all"
            >
              <div className="relative h-56 w-full overflow-hidden bg-stone-900">
                <img
                  src={wall.thumbnailUrl}
                  alt={wall.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#091426] via-transparent to-black/30" />

                <span className="absolute top-3 left-3 text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/60 text-[#f0c15c] border border-stone-700/50 backdrop-blur">
                  {wall.resolution}
                </span>

                <button
                  onClick={() => setPreviewWall(wall)}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-black/50 hover:bg-black text-stone-200 hover:text-white backdrop-blur transition-all cursor-pointer"
                  title="Full Screen Preview"
                >
                  <Maximize2 size={14} />
                </button>
              </div>

              <div className="p-5 flex flex-col justify-between flex-1 space-y-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#f0c15c] uppercase">
                    {wall.category}
                  </span>
                  <h4 className="text-sm font-bold text-stone-100 group-hover:text-[#f0c15c] transition-colors mt-0.5">
                    {displayTitle}
                  </h4>
                </div>

                <div className="pt-2 flex items-center justify-between gap-2 border-t border-stone-800">
                  <a
                    href={wall.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="p-2 rounded-xl bg-[#060c18] hover:bg-stone-800 text-stone-400 hover:text-white text-xs flex items-center gap-1 transition-colors"
                    title="Download HD Wallpaper"
                  >
                    <Download size={14} />
                  </a>

                  <button
                    onClick={() => handleApply(wall)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-emerald-500 text-white shadow-md"
                        : "bg-[#f0c15c] hover:bg-[#e0b04c] text-black font-extrabold shadow-sm"
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check size={14} />
                        <span>{lang === "ta" ? "செயலில் உள்ளது" : "Active"}</span>
                      </>
                    ) : (
                      <span>{lang === "ta" ? "பின்னணியாக வை" : "Set as Background"}</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Fullscreen Modal */}
      {previewWall && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-5xl w-full bg-[#081123] border border-[#f0c15c]/40 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-[#050b18] flex items-center justify-between border-b border-stone-800">
              <h3 className="text-sm font-bold text-stone-100">{previewWall.title}</h3>
              <button
                onClick={() => setPreviewWall(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-black">
              <img
                src={previewWall.imageUrl}
                alt={previewWall.title}
                className="max-h-[70vh] w-auto rounded-xl object-contain shadow-2xl"
              />
            </div>
            <div className="p-4 bg-[#050b18] flex items-center justify-end gap-3 border-t border-stone-800">
              <button
                onClick={() => setPreviewWall(null)}
                className="px-4 py-2 text-xs text-stone-400 hover:text-white"
              >
                {lang === "ta" ? "மூடு" : "Close"}
              </button>
              <button
                onClick={() => {
                  handleApply(previewWall);
                  setPreviewWall(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#f0c15c] text-black font-extrabold text-xs shadow-md"
              >
                {lang === "ta" ? "இப்போதே பின்னணியாக வை" : "Apply as Background"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

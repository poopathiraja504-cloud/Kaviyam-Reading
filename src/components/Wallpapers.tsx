import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Heart, Download, Check, Maximize2, X, Monitor, Smartphone, Layout } from "lucide-react";
import { Wallpaper } from "../types";
import { db, auth } from "../firebase";
import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";

const MOCK_WALLPAPERS: Wallpaper[] = [
  {
    id: "w1",
    title: "Ancient Tamil Literature",
    description: "A beautiful depiction of ancient Tamil scripts on palm leaves.",
    imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=1200",
    category: "Ancient Tamil",
    tags: ["tamil", "literature", "palm leaves"],
    featured: true,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "w2",
    title: "Majestic Temple",
    description: "Golden hour lighting on a classic Dravidian temple architecture.",
    imageUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=1200",
    category: "Temple",
    tags: ["temple", "architecture", "gold"],
    featured: true,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "w3",
    title: "Dark Library",
    description: "A moody, cinematic library with warm lighting.",
    imageUrl: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=1200",
    category: "Dark Library",
    tags: ["library", "dark", "books"],
    featured: false,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "w4",
    title: "Minimal Reading",
    description: "Clean aesthetic with an open book and coffee.",
    imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=1200",
    category: "Minimal",
    tags: ["minimal", "book", "coffee"],
    featured: false,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const CATEGORIES = ["All", "Tamil Literature", "Temple", "Nature", "Ancient Tamil", "Classical", "Dark Library", "Reading", "Minimal", "Festival"];

export default function Wallpapers({ currentUser }: { currentUser: any }) {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [appliedWallpaper, setAppliedWallpaper] = useState<string | null>(null);
  const [previewWallpaper, setPreviewWallpaper] = useState<Wallpaper | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWallpapers = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "wallpapers"));
        const fetchedWallpapers = querySnapshot.docs.map(doc => doc.data() as Wallpaper);
        if (fetchedWallpapers.length > 0) {
          setWallpapers(fetchedWallpapers.filter(w => w.active));
        } else {
          setWallpapers(MOCK_WALLPAPERS);
        }

        if (currentUser) {
          try {
            const prefDoc = await getDoc(doc(db, "userPreferences", currentUser.id));
            if (prefDoc.exists()) {
              setAppliedWallpaper(prefDoc.data().wallpaperId || null);
              setFavorites(prefDoc.data().favoriteWallpapers || []);
            }
          } catch {
            const localW = localStorage.getItem(`kaviyam_wallpaper_${currentUser.id}`);
            if (localW) setAppliedWallpaper(localW);
          }
        }
      } catch (error) {
        setWallpapers(MOCK_WALLPAPERS);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWallpapers();
  }, [currentUser]);

  const handleApply = async (wallpaper: Wallpaper) => {
    setAppliedWallpaper(wallpaper.id);
    if (currentUser) {
      localStorage.setItem(`kaviyam_wallpaper_${currentUser.id}`, wallpaper.id);
    }
    window.dispatchEvent(new CustomEvent('kaviyam_wallpaper_changed', { detail: wallpaper.imageUrl }));

    if (currentUser) {
      try {
        await setDoc(doc(db, "userPreferences", currentUser.id), {
          wallpaperId: wallpaper.id
        }, { merge: true });
      } catch (error) {
        console.warn("Could not save wallpaper preference to Firestore:", error);
      }
    }
  };

  const toggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavorites = favorites.includes(id) ? favorites.filter(f => f !== id) : [...favorites, id];
    setFavorites(newFavorites);
    if (currentUser) {
      try {
        await setDoc(doc(db, "userPreferences", currentUser.id), {
          favoriteWallpapers: newFavorites
        }, { merge: true });
      } catch (error) {
        console.error("Error saving favorites:", error);
      }
    }
  };

  const filteredWallpapers = wallpapers.filter(w => {
    const matchesSearch = w.title.toLowerCase().includes(searchQuery.toLowerCase()) || w.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || w.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-stone-900 mb-3 tracking-tight flex items-center justify-center gap-3">
          <Layout className="text-[#d4af37]" size={32} />
          Kaviyam <span className="text-[#d4af37]">Wallpapers</span>
        </h1>
        <p className="text-stone-500 font-serif max-w-xl mx-auto text-sm">
          Transform your reading experience with beautiful literary backgrounds.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="mb-8 space-y-4">
        <div className="relative max-w-md mx-auto">
          <Search size={16} className="absolute left-3 top-3 text-stone-400" />
          <input
            type="text"
            placeholder="Search wallpapers by title or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 placeholder-stone-400 text-sm focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all shadow-sm"
          />
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-2">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === category
                  ? "bg-stone-900 text-white shadow-md"
                  : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d4af37]" />
        </div>
      ) : filteredWallpapers.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-stone-200">
          <p className="text-stone-500 font-serif">No wallpapers found matching your criteria.</p>
          <button 
            onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
            className="mt-4 px-4 py-2 bg-stone-100 text-stone-700 rounded-lg text-sm font-semibold hover:bg-stone-200 transition"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredWallpapers.map(wallpaper => (
            <motion.div
              key={wallpaper.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-lg transition-all group cursor-pointer"
              onClick={() => setPreviewWallpaper(wallpaper)}
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-stone-100">
                <img
                  src={wallpaper.imageUrl}
                  alt={wallpaper.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <button
                  onClick={(e) => toggleFavorite(wallpaper.id, e)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40 transition opacity-0 group-hover:opacity-100"
                >
                  <Heart size={16} className={favorites.includes(wallpaper.id) ? "fill-[#d4af37] text-[#d4af37]" : ""} />
                </button>

                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-between">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApply(wallpaper);
                    }}
                    className="bg-[#d4af37] hover:bg-[#c29d2b] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                  >
                    {appliedWallpaper === wallpaper.id ? (
                      <><Check size={12} /> Applied</>
                    ) : (
                      'Apply'
                    )}
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setPreviewWallpaper(wallpaper); }}
                    className="p-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg text-white transition"
                  >
                    <Maximize2 size={14} />
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                <span className="text-[9px] uppercase tracking-wider font-mono text-[#d4af37] font-bold block mb-1">
                  {wallpaper.category}
                </span>
                <h3 className="font-serif font-bold text-stone-800 text-sm truncate">
                  {wallpaper.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {previewWallpaper && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setPreviewWallpaper(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full bg-stone-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
              onClick={e => e.stopPropagation()}
            >
              {/* Image Section */}
              <div className="w-full md:w-2/3 h-[50vh] md:h-[80vh] relative bg-black">
                <img
                  src={previewWallpaper.imageUrl}
                  alt={previewWallpaper.title}
                  className="w-full h-full object-contain"
                />
              </div>
              
              {/* Info Section */}
              <div className="w-full md:w-1/3 p-6 md:p-8 flex flex-col">
                <button 
                  onClick={() => setPreviewWallpaper(null)}
                  className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white bg-white/10 rounded-full transition"
                >
                  <X size={20} />
                </button>
                
                <span className="inline-block px-2.5 py-1 bg-stone-800 text-[#d4af37] text-[10px] uppercase font-mono font-bold tracking-wider rounded-md w-fit mb-4">
                  {previewWallpaper.category}
                </span>
                
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-2">
                  {previewWallpaper.title}
                </h2>
                
                <p className="text-stone-400 text-sm leading-relaxed mb-6 flex-grow">
                  {previewWallpaper.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-8">
                  {previewWallpaper.tags.map(tag => (
                    <span key={tag} className="text-xs text-stone-500 bg-stone-800 px-2 py-1 rounded-md">
                      #{tag}
                    </span>
                  ))}
                </div>
                
                <div className="space-y-3 mt-auto">
                  <button
                    onClick={() => handleApply(previewWallpaper)}
                    className="w-full py-3 bg-[#d4af37] hover:bg-[#c29d2b] text-black font-extrabold rounded-xl transition shadow-[0_0_15px_rgba(212,175,55,0.3)] flex items-center justify-center gap-2"
                  >
                    {appliedWallpaper === previewWallpaper.id ? (
                      <><Check size={18} /> Active Wallpaper</>
                    ) : (
                      'Apply to Kaviyam Reading'
                    )}
                  </button>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={(e) => toggleFavorite(previewWallpaper.id, e)}
                      className="flex-1 py-3 bg-stone-800 hover:bg-stone-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 text-sm"
                    >
                      <Heart size={16} className={favorites.includes(previewWallpaper.id) ? "fill-[#d4af37] text-[#d4af37]" : ""} />
                      {favorites.includes(previewWallpaper.id) ? 'Saved' : 'Save'}
                    </button>
                    <a
                      href={previewWallpaper.imageUrl}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-3 bg-stone-800 hover:bg-stone-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 text-sm"
                    >
                      <Download size={16} />
                      Download
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

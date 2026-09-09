import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Heart, Maximize2, X, Check, MonitorSmartphone } from "lucide-react";
import { Template } from "../types";
import { db, auth } from "../firebase";
import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";

const MOCK_TEMPLATES: Template[] = [
  {
    id: "t1",
    title: "Classic Ivory Reader",
    description: "A bright, clean ivory layout focused purely on text legibility and minimal distractions.",
    imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=1200",
    category: "Reading Page",
    tags: ["classic", "ivory", "clean", "reading"],
    featured: true,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "t2",
    title: "Midnight Deep Library",
    description: "A dark theme using deep navy and gold accents for late-night reading sessions.",
    imageUrl: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=1200",
    category: "Home Page",
    tags: ["dark mode", "midnight", "library", "home"],
    featured: true,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "t3",
    title: "Ancient Palm Leaf Motif",
    description: "Incorporate subtle textures of ancient Tamil palm leaf manuscripts into the UI.",
    imageUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=1200",
    category: "Tamil Library",
    tags: ["tamil", "palm leaf", "ancient", "library"],
    featured: false,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const CATEGORIES = ["All", "Home Page", "Reading Page", "Book Details", "Login Page", "Profile", "Library", "Tamil Library", "Mobile Layout"];

export default function Templates({ currentUser }: { currentUser: any }) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [appliedTemplate, setAppliedTemplate] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "templates"));
        const fetchedTemplates = querySnapshot.docs.map(doc => doc.data() as Template);
        if (fetchedTemplates.length > 0) {
          setTemplates(fetchedTemplates.filter(t => t.active));
        } else {
          setTemplates(MOCK_TEMPLATES);
        }

        if (currentUser && auth.currentUser) {
          const prefDoc = await getDoc(doc(db, "userPreferences", currentUser.id));
          if (prefDoc.exists()) {
            setAppliedTemplate(prefDoc.data().templateId || null);
            const favs = prefDoc.data().favoriteTemplates || [];
            setFavorites(favs);
          }
        }
      } catch (error) {
        console.error("Error fetching templates:", error);
        setTemplates(MOCK_TEMPLATES);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTemplates();
  }, [currentUser]);

  const handleApply = async (template: Template) => {
    setAppliedTemplate(template.id);
    if (currentUser) {
      try {
        await setDoc(doc(db, "userPreferences", currentUser.id), {
          templateId: template.id
        }, { merge: true });
        
        window.dispatchEvent(new CustomEvent('kaviyam_template_changed', { detail: template.id }));
      } catch (error) {
        console.error("Error saving template preference:", error);
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
          favoriteTemplates: newFavorites
        }, { merge: true });
      } catch (error) {
        console.error("Error saving favorites:", error);
      }
    }
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-stone-900 mb-3 tracking-tight flex items-center justify-center gap-3">
          <MonitorSmartphone className="text-[#d4af37]" size={32} />
          Kaviyam <span className="text-[#d4af37]">Templates</span>
        </h1>
        <p className="text-stone-500 font-serif max-w-xl mx-auto text-sm">
          Choose a beautiful design layout for your Kaviyam Reading experience.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="mb-8 space-y-4">
        <div className="relative max-w-md mx-auto">
          <Search size={16} className="absolute left-3 top-3 text-stone-400" />
          <input
            type="text"
            placeholder="Search templates..."
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
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-stone-200">
          <p className="text-stone-500 font-serif">No templates found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(template => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-lg transition-all group flex flex-col cursor-pointer"
              onClick={() => setPreviewTemplate(template)}
            >
              <div className="relative aspect-video bg-stone-100 overflow-hidden">
                <img
                  src={template.imageUrl}
                  alt={template.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setPreviewTemplate(template); }}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-white text-sm font-semibold transition flex items-center gap-2"
                  >
                    <Maximize2 size={16} /> Preview
                  </button>
                </div>

                <button
                  onClick={(e) => toggleFavorite(template.id, e)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-md shadow-sm text-stone-400 hover:text-red-500 transition"
                >
                  <Heart size={16} className={favorites.includes(template.id) ? "fill-red-500 text-red-500" : ""} />
                </button>
              </div>
              
              <div className="p-5 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-mono text-[#d4af37] font-bold block mb-1">
                      {template.category}
                    </span>
                    <h3 className="font-serif font-bold text-stone-800 text-lg">
                      {template.title}
                    </h3>
                  </div>
                </div>
                
                <p className="text-stone-500 text-xs leading-relaxed mb-5 flex-grow">
                  {template.description}
                </p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApply(template);
                  }}
                  className={`w-full py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 ${
                    appliedTemplate === template.id 
                      ? "bg-stone-100 text-[#d4af37] border border-[#d4af37]/30"
                      : "bg-stone-900 text-white hover:bg-stone-800"
                  }`}
                >
                  {appliedTemplate === template.id ? (
                    <><Check size={16} /> Applied</>
                  ) : (
                    'Apply Template'
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {previewTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-stone-900/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
            onClick={() => setPreviewTemplate(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative max-w-6xl w-full h-full max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center px-6 py-4 border-b border-stone-100">
                <div>
                  <h2 className="font-serif text-xl font-bold text-stone-800">{previewTemplate.title}</h2>
                  <p className="text-stone-500 text-xs">{previewTemplate.category}</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleApply(previewTemplate)}
                    className="px-6 py-2 bg-[#d4af37] hover:bg-[#c29d2b] text-white font-bold rounded-lg transition text-sm flex items-center gap-2 shadow-sm"
                  >
                    {appliedTemplate === previewTemplate.id ? (
                      <><Check size={14} /> Applied</>
                    ) : (
                      'Apply Template'
                    )}
                  </button>
                  <button 
                    onClick={() => setPreviewTemplate(null)}
                    className="p-2 text-stone-400 hover:text-stone-800 bg-stone-50 hover:bg-stone-100 rounded-full transition"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              <div className="flex-grow bg-stone-100 p-4 md:p-8 overflow-y-auto flex items-center justify-center">
                <div className="max-w-4xl w-full mx-auto shadow-xl rounded-xl overflow-hidden border border-stone-200 bg-white">
                  <img
                    src={previewTemplate.imageUrl}
                    alt={previewTemplate.title}
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

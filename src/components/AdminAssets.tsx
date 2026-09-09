import React, { useState, useEffect } from "react";
import { Upload, X, Check, Image as ImageIcon, Layout, Trash2 } from "lucide-react";
import { db, storage } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Wallpaper, Template } from "../types";

export default function AdminAssets() {
  const [activeTab, setActiveTab] = useState<"wallpapers" | "templates">("wallpapers");
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [wSnap, tSnap] = await Promise.all([
        getDocs(collection(db, "wallpapers")),
        getDocs(collection(db, "templates"))
      ]);
      setWallpapers(wSnap.docs.map(d => ({ id: d.id, ...d.data() } as Wallpaper)));
      setTemplates(tSnap.docs.map(d => ({ id: d.id, ...d.data() } as Template)));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !category) return alert("Please fill required fields and select an image");

    setUploading(true);
    try {
      const path = `${activeTab}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);

      const newItem = {
        title,
        description,
        category,
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        imageUrl: url,
        featured: false,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, activeTab), newItem);
      
      if (activeTab === "wallpapers") {
        setWallpapers([{ id: docRef.id, ...newItem } as Wallpaper, ...wallpapers]);
      } else {
        setTemplates([{ id: docRef.id, ...newItem } as Template, ...templates]);
      }
      
      setShowUpload(false);
      resetForm();
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload asset.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, type: "wallpapers" | "templates") => {
    if (!confirm("Delete this asset?")) return;
    try {
      await deleteDoc(doc(db, type, id));
      if (type === "wallpapers") setWallpapers(wallpapers.filter(w => w.id !== id));
      else setTemplates(templates.filter(t => t.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("");
    setTags("");
    setFile(null);
  };

  const items = activeTab === "wallpapers" ? wallpapers : templates;

  return (
    <div className="bg-white rounded-2xl border border-[#e8e2cf] p-6 shadow-sm text-left">
      <div className="flex justify-between items-center mb-6 border-b border-[#e8e2cf] pb-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-stone-800 flex items-center gap-2">
            <ImageIcon className="text-[#d4af37]" size={20} />
            Asset Manager
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">Manage wallpapers and templates.</p>
        </div>
        
        <div className="flex gap-2">
          <div className="flex bg-stone-100 p-1 rounded-lg mr-4">
            <button
              onClick={() => setActiveTab("wallpapers")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${activeTab === "wallpapers" ? "bg-white shadow-sm" : "text-stone-500"}`}
            >
              Wallpapers
            </button>
            <button
              onClick={() => setActiveTab("templates")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${activeTab === "templates" ? "bg-white shadow-sm" : "text-stone-500"}`}
            >
              Templates
            </button>
          </div>
          <button 
            onClick={() => setShowUpload(true)}
            className="bg-stone-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-stone-800 transition"
          >
            Upload New
          </button>
        </div>
      </div>

      {showUpload && (
        <form onSubmit={handleUpload} className="bg-stone-50 p-6 rounded-xl border border-stone-200 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-serif font-bold text-lg">Upload {activeTab === "wallpapers" ? "Wallpaper" : "Template"}</h3>
            <button type="button" onClick={() => setShowUpload(false)} className="text-stone-400 hover:text-stone-700"><X size={20}/></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              required
              type="text"
              placeholder="Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="p-2 border rounded-lg bg-white"
            />
            <input
              required
              type="text"
              placeholder="Category (e.g., Home Page, Dark Library)"
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="p-2 border rounded-lg bg-white"
            />
            <input
              type="text"
              placeholder="Tags (comma separated)"
              value={tags}
              onChange={e => setTags(e.target.value)}
              className="p-2 border rounded-lg bg-white md:col-span-2"
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="p-2 border rounded-lg bg-white md:col-span-2 h-20"
            />
            <input
              required
              type="file"
              accept="image/*"
              onChange={e => setFile(e.target.files?.[0] || null)}
              className="p-2 border rounded-lg bg-white md:col-span-2"
            />
          </div>
          <button 
            disabled={uploading}
            type="submit" 
            className="mt-4 bg-[#d4af37] text-white px-6 py-2 rounded-lg font-bold w-full hover:bg-[#c29d2b] transition disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Save Asset"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-10">Loading assets...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map(item => (
            <div key={item.id} className="border rounded-xl overflow-hidden bg-stone-50 group">
              <div className="aspect-video relative overflow-hidden bg-black">
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover opacity-80" />
                <button 
                  onClick={() => handleDelete(item.id, activeTab)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="p-3">
                <div className="text-[10px] text-[#d4af37] font-bold uppercase">{item.category}</div>
                <div className="font-semibold text-sm truncate">{item.title}</div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="col-span-full text-center py-8 text-stone-500 italic">
              No {activeTab} uploaded yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

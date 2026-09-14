import React, { useState, useEffect } from "react";
import { ProjectLink } from "../types";
import { Language, translations } from "../utils/i18n";
import { 
  fetchAllProjectLinks, 
  uploadProjectLink, 
  deleteProjectLink,
  clearAllProjectLinks 
} from "../services/linksService";
import { 
  ExternalLink, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  Search, 
  ShieldCheck, 
  FileCode2, 
  BookOpen, 
  Globe, 
  Layers, 
  Sparkles,
  X,
  UploadCloud,
  Eye,
  Code,
  Link2,
  Newspaper,
  GraduationCap,
  Share2,
  FileText
} from "lucide-react";

interface LinksManagerProps {
  lang: Language;
  onClose?: () => void;
  addSystemLog?: (action: string, status: "Success" | "Failed" | "Blocked") => void;
}

export default function LinksManager({ lang, onClose, addSystemLog }: LinksManagerProps) {
  const t = translations[lang];
  const [links, setLinks] = useState<ProjectLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Upload modal / form state
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formTitleTa, setFormTitleTa] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formCategory, setFormCategory] = useState<ProjectLink["category"]>("novel");
  const [formDescription, setFormDescription] = useState("");
  const [formDescriptionTa, setFormDescriptionTa] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // In-app Code / Doc Viewer Modal State
  const [viewingFile, setViewingFile] = useState<{ title: string; url: string; content?: string } | null>(null);
  const [fileContentLoading, setFileContentLoading] = useState(false);
  const [fileCopied, setFileCopied] = useState(false);

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    setLoading(true);
    try {
      const data = await fetchAllProjectLinks();
      setLinks(data);
    } catch (e) {
      console.error("Failed to load links:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (url: string, id: string) => {
    const fullUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenFileViewer = async (item: ProjectLink) => {
    if (item.url.startsWith("http")) {
      window.open(item.url, "_blank", "noopener,noreferrer");
      return;
    }

    setViewingFile({
      title: item.title,
      url: item.url,
      content: undefined
    });
    setFileContentLoading(true);

    try {
      const res = await fetch(item.url);
      if (res.ok) {
        const text = await res.text();
        setViewingFile({
          title: item.title,
          url: item.url,
          content: text
        });
      } else {
        setViewingFile({
          title: item.title,
          url: item.url,
          content: `// Error loading content from ${item.url}\n// HTTP Status: ${res.status}`
        });
      }
    } catch (err: any) {
      setViewingFile({
        title: item.title,
        url: item.url,
        content: `// Failed to fetch content: ${err?.message || "Unknown error"}`
      });
    } finally {
      setFileContentLoading(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formUrl.trim()) {
      setErrorMsg(lang === "ta" ? "தலைப்பு மற்றும் URL அவசியமாகும்." : "Title and URL are required.");
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const uploaded = await uploadProjectLink({
        title: formTitle.trim(),
        titleTa: formTitleTa.trim() || formTitle.trim(),
        url: formUrl.trim(),
        category: formCategory,
        description: formDescription.trim(),
        descriptionTa: formDescriptionTa.trim() || formDescription.trim(),
      });

      setLinks((prev) => [uploaded, ...prev]);
      setSuccessMsg(lang === "ta" ? "இணைப்பு வெற்றிகரமாகப் பதிவேற்றப்பட்டது!" : "Link uploaded successfully!");
      setFormTitle("");
      setFormTitleTa("");
      setFormUrl("");
      setFormDescription("");
      setFormDescriptionTa("");
      setShowUploadForm(false);
      if (addSystemLog) {
        addSystemLog(`Uploaded project link: ${formTitle.trim()} (${formUrl.trim()})`, "Success");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(lang === "ta" ? `"${title}" இணைப்பை நீக்க விரும்புகிறீர்களா?` : `Remove "${title}" link?`)) {
      return;
    }
    await deleteProjectLink(id);
    setLinks((prev) => prev.filter((l) => l.id !== id));
    if (addSystemLog) {
      addSystemLog(`Removed project link: ${title}`, "Success");
    }
  };

  const handleClearAll = async () => {
    if (!confirm(lang === "ta" ? "அனைத்து இணைப்புகளையும் நீக்க விரும்புகிறீர்களா?" : "Are you sure you want to remove all links?")) {
      return;
    }
    await clearAllProjectLinks();
    setLinks([]);
    if (addSystemLog) {
      addSystemLog("Cleared all project links", "Success");
    }
  };

  const getCategoryBadge = (category: ProjectLink["category"]) => {
    switch (category) {
      case "app":
        return { label: t.categories.app, color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30", icon: Globe };
      case "security":
        return { label: t.categories.security, color: "bg-amber-500/10 text-amber-400 border-amber-500/30", icon: ShieldCheck };
      case "api":
        return { label: t.categories.api, color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30", icon: FileCode2 };
      case "archive":
        return { label: t.categories.archive, color: "bg-purple-500/10 text-purple-400 border-purple-500/30", icon: Layers };
      case "novel":
        return { label: t.categories.novel, color: "bg-[#f0c15c]/10 text-[#f0c15c] border-[#f0c15c]/30", icon: BookOpen };
      case "education":
        return { label: t.categories.education, color: "bg-sky-500/10 text-sky-400 border-sky-500/30", icon: GraduationCap };
      case "news":
        return { label: t.categories.news, color: "bg-rose-500/10 text-rose-400 border-rose-500/30", icon: Newspaper };
      case "social":
        return { label: t.categories.social, color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30", icon: Share2 };
      case "legal":
        return { label: t.categories.legal, color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30", icon: FileText };
      default:
        return { label: t.categories.custom, color: "bg-stone-700/30 text-stone-300 border-stone-600", icon: Globe };
    }
  };

  const filteredLinks = links.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      item.title.toLowerCase().includes(q) ||
      (item.titleTa && item.titleTa.toLowerCase().includes(q)) ||
      item.url.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0c1830] via-[#0f2142] to-[#0a1428] border border-[#1b2f57] rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-radial from-[#f0c15c]/10 to-transparent pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0c15c]/10 border border-[#f0c15c]/30 text-[#f0c15c] text-xs font-semibold mb-2">
              <Sparkles size={13} />
              <span>{t.totalLinks}: {links.length}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-100 tracking-wide">
              {t.allLinksTitle}
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-2xl leading-relaxed">
              {t.allLinksSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d48c1a] to-[#f0c15c] hover:brightness-110 text-black font-extrabold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
              id="upload-link-toggle-btn"
            >
              {showUploadForm ? <X size={15} /> : <Plus size={15} />}
              <span>{showUploadForm ? (lang === "ta" ? "படிவத்தை மூடு" : "Close Form") : t.uploadNewLink}</span>
            </button>

            {links.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-3 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 text-red-300 hover:text-red-100 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Remove all links"
              >
                <Trash2 size={13} />
                <span>{lang === "ta" ? "அனைத்தையும் நீக்கு" : "Remove All"}</span>
              </button>
            )}

            {onClose && (
              <button
                onClick={onClose}
                className="px-3 py-2.5 rounded-xl bg-[#091426] border border-stone-800 text-stone-300 hover:text-white text-xs transition-colors cursor-pointer"
              >
                {lang === "ta" ? "நூலகம் திரும்பு" : "Back"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Upload New Link Form (collapsible) */}
      {showUploadForm && (
        <form onSubmit={handleUploadSubmit} className="bg-[#0b162c] border border-[#f0c15c]/40 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <h3 className="text-sm font-bold text-[#f0c15c] flex items-center gap-2">
              <UploadCloud size={16} />
              <span>{t.uploadNewLink}</span>
            </h3>
            <span className="text-[11px] text-stone-400 font-mono">Firestore /links &amp; Local Persistence</span>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/60 text-red-300 text-xs">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs">
              {successMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                {t.linkTitle} (English / General) *
              </label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Tamil Sangam Poetry Collection"
                className="w-full px-3.5 py-2.5 bg-[#060c18] border border-stone-800 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-[#f0c15c]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                {t.linkTitle} (தமிழ் தலைப்பு)
              </label>
              <input
                type="text"
                value={formTitleTa}
                onChange={(e) => setFormTitleTa(e.target.value)}
                placeholder="எ.கா: சங்க இலக்கிய பாடல்கள் தொகுப்பு"
                className="w-full px-3.5 py-2.5 bg-[#060c18] border border-stone-800 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-[#f0c15c]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                {t.linkUrl} *
              </label>
              <input
                type="text"
                required
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                placeholder="https://example.com/novel"
                className="w-full px-3.5 py-2.5 bg-[#060c18] border border-stone-800 rounded-xl text-stone-200 text-xs font-mono focus:outline-none focus:border-[#f0c15c]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                {t.linkCategory}
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-[#060c18] border border-stone-800 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-[#f0c15c]"
              >
                <option value="novel">{t.categories.novel}</option>
                <option value="archive">{t.categories.archive}</option>
                <option value="education">{t.categories.education}</option>
                <option value="news">{t.categories.news}</option>
                <option value="social">{t.categories.social}</option>
                <option value="legal">{t.categories.legal}</option>
                <option value="app">{t.categories.app}</option>
                <option value="security">{t.categories.security}</option>
                <option value="api">{t.categories.api}</option>
                <option value="custom">{t.categories.custom}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              {t.linkDescription}
            </label>
            <textarea
              rows={2}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder={lang === "ta" ? "இந்த இணைப்பு பற்றிய சுருக்கமான குறிப்பு..." : "Brief notes regarding this link or literature..."}
              className="w-full px-3.5 py-2 bg-[#060c18] border border-stone-800 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-[#f0c15c]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowUploadForm(false)}
              className="px-4 py-2 rounded-xl text-xs text-stone-400 hover:text-stone-200 cursor-pointer"
            >
              {lang === "ta" ? "ரத்து" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2.5 rounded-xl bg-[#f0c15c] hover:bg-[#d6a540] text-black font-extrabold text-xs flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <UploadCloud size={15} />
                  <span>{t.saveLink}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#081223] border border-stone-800/80 p-3 rounded-2xl">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === "all" ? "bg-[#f0c15c] text-black shadow-sm" : "bg-[#060c18] text-stone-400 hover:text-stone-200"
            }`}
          >
            {t.allCategories} ({links.length})
          </button>
          {(["novel", "archive", "education", "news", "social", "legal", "app", "security", "api"] as const).map((cat) => {
            const count = links.filter((l) => l.category === cat).length;
            if (count === 0 && selectedCategory !== cat && !["novel", "archive", "education", "news", "social", "legal"].includes(cat)) {
              return null;
            }
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat ? "bg-[#f0c15c] text-black shadow-sm" : "bg-[#060c18] text-stone-400 hover:text-stone-200"
                }`}
              >
                {t.categories[cat]} ({count})
              </button>
            );
          })}
        </div>

        {/* Search Field */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            placeholder={lang === "ta" ? "இணைப்புகளைத் தேடுக..." : "Filter links..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#060c18] border border-stone-800 rounded-xl text-xs text-stone-200 focus:outline-none focus:border-[#f0c15c]"
          />
        </div>
      </div>

      {/* Links Grid */}
      {loading ? (
        <div className="p-12 text-center text-stone-400">
          <div className="w-8 h-8 border-2 border-[#f0c15c] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs font-mono">{lang === "ta" ? "இணைப்புகள் ஏற்றப்படுகின்றன..." : "Loading links..."}</p>
        </div>
      ) : filteredLinks.length === 0 ? (
        <div className="p-12 text-center bg-[#091326] border border-stone-800 rounded-3xl text-stone-400 space-y-3">
          <Link2 size={32} className="mx-auto text-[#f0c15c]/60" />
          <p className="text-sm font-semibold text-stone-200">
            {lang === "ta" ? "இணைப்புகள் எதுவும் இல்லை" : "No custom links in repository"}
          </p>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            {lang === "ta" 
              ? "புதிய தமிழ் நாவல் அல்லது மின்னூலக இணைய முகவரிகளைச் சேர்க்க 'புதிய இணைப்பு' என்பதை அழுத்தவும்."
              : "Click 'Upload New Link' to add custom Tamil literature websites or document links."}
          </p>
          <button
            type="button"
            onClick={() => setShowUploadForm(true)}
            className="px-4 py-2 bg-[#f0c15c] text-black font-bold text-xs rounded-xl shadow cursor-pointer hover:bg-[#e0b04c] inline-flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>{t.uploadNewLink}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLinks.map((item) => {
            const badge = getCategoryBadge(item.category);
            const Icon = badge.icon;
            const displayTitle = lang === "ta" && item.titleTa ? item.titleTa : item.title;
            const displayDesc = lang === "ta" && item.descriptionTa ? item.descriptionTa : item.description;
            const isLocalOrCode = !item.url.startsWith("http");

            return (
              <div
                key={item.id}
                className="bg-[#091426] border border-[#172744] hover:border-[#f0c15c]/50 rounded-2xl p-5 shadow-md flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${badge.color}`}>
                      <Icon size={12} />
                      <span>{badge.label}</span>
                    </span>

                    <button
                      onClick={() => handleDelete(item.id, displayTitle)}
                      title={lang === "ta" ? "இணைப்பை நீக்கு" : "Remove Link"}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <h4 className="text-sm font-bold text-stone-100 group-hover:text-[#f0c15c] transition-colors">
                    {displayTitle}
                  </h4>

                  {displayDesc && (
                    <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">
                      {displayDesc}
                    </p>
                  )}

                  <div className="mt-3 p-2 bg-[#050a14] border border-stone-900 rounded-xl flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-stone-300 truncate max-w-[260px]">
                      {item.url}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopy(item.url, item.id)}
                        title={t.copyLink}
                        className="p-1.5 rounded-lg bg-[#0b172a] hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors cursor-pointer flex-shrink-0"
                      >
                        {copiedId === item.id ? (
                          <Check size={13} className="text-emerald-400" />
                        ) : (
                          <Copy size={13} />
                        )}
                      </button>
                      {isLocalOrCode && (
                        <button
                          onClick={() => handleOpenFileViewer(item)}
                          title="View Code / Content"
                          className="p-1.5 rounded-lg bg-[#0b172a] hover:bg-stone-800 text-stone-400 hover:text-[#f0c15c] transition-colors cursor-pointer flex-shrink-0"
                        >
                          <Eye size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-stone-500 font-mono">
                    {new Date(item.uploadedAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-2">
                    {isLocalOrCode ? (
                      <button
                        onClick={() => handleOpenFileViewer(item)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#f0c15c] hover:bg-[#d6a540] text-black font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                      >
                        <Code size={13} />
                        <span>{lang === "ta" ? "காண்க / திற" : "View / Open"}</span>
                      </button>
                    ) : (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 rounded-xl bg-[#f0c15c] hover:bg-[#d6a540] text-black font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <span>{t.openLink}</span>
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* In-App Code / File Content Viewer Modal */}
      {viewingFile && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b162c] border border-[#f0c15c]/50 rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-[#081123] border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode2 size={18} className="text-[#f0c15c]" />
                <div>
                  <h3 className="text-sm font-bold text-stone-100">{viewingFile.title}</h3>
                  <p className="text-[11px] font-mono text-stone-400">{viewingFile.url}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {viewingFile.content && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(viewingFile.content || "");
                      setFileCopied(true);
                      setTimeout(() => setFileCopied(false), 2000);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#0d1e3d] hover:bg-[#132c5a] text-stone-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-stone-700"
                  >
                    {fileCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{fileCopied ? (lang === "ta" ? "நகலெடுக்கப்பட்டது" : "Copied") : (lang === "ta" ? "நகலெடு" : "Copy Code")}</span>
                  </button>
                )}
                <button
                  onClick={() => setViewingFile(null)}
                  className="p-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto bg-[#040812] text-stone-200 font-mono text-xs leading-relaxed">
              {fileContentLoading ? (
                <div className="p-12 text-center text-stone-400">
                  <div className="w-8 h-8 border-2 border-[#f0c15c] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p>Loading content...</p>
                </div>
              ) : (
                <pre className="whitespace-pre-wrap select-text">{viewingFile.content}</pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

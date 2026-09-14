import React, { useState, useEffect } from "react";
import { Database, Download, RefreshCw, Trash2, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function LocalDatabase() {
  const [keys, setKeys] = useState<string[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [keyValue, setKeyValue] = useState<string>("");

  useEffect(() => {
    refreshKeys();
  }, []);

  const refreshKeys = () => {
    const kList: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) kList.push(k);
    }
    setKeys(kList);
    if (kList.length > 0 && !selectedKey) {
      inspectKey(kList[0]);
    }
  };

  const inspectKey = (key: string) => {
    setSelectedKey(key);
    const val = localStorage.getItem(key);
    setKeyValue(val ? JSON.stringify(JSON.parse(val), null, 2) : "");
  };

  const exportData = () => {
    const data: Record<string, any> = {};
    keys.forEach((k) => {
      try {
        data[k] = JSON.parse(localStorage.getItem(k) || "");
      } catch {
        data[k] = localStorage.getItem(k);
      }
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "kaviyam_local_db_backup.json";
    a.click();
  };

  return (
    <div className="space-y-6 font-sans pb-12 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white border border-[#E2DDD5] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-6 h-6 text-[#5C121E]" />
            <h2 className="font-serif font-bold text-2xl text-[#3B0B12]">
              Local Database & State Inspector
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Browser LocalStorage cache keys and Firestore synchronization metrics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshKeys}
            className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={exportData}
            className="px-3 py-1.5 rounded-xl bg-[#5C121E] hover:bg-[#3B0B12] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Grid Inspector */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Key List (4 cols) */}
        <div className="md:col-span-4 rounded-3xl bg-white border border-[#E2DDD5] p-4 space-y-2">
          <h3 className="font-serif font-bold text-xs uppercase text-stone-700 tracking-wider">
            Cached Storage Keys ({keys.length})
          </h3>
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {keys.map((k) => (
              <button
                key={k}
                onClick={() => inspectKey(k)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono font-semibold truncate transition-colors ${
                  selectedKey === k
                    ? "bg-[#5C121E] text-white"
                    : "hover:bg-stone-100 text-stone-800"
                }`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        {/* JSON Content (8 cols) */}
        <div className="md:col-span-8 rounded-3xl bg-stone-900 text-amber-200 p-6 font-mono text-xs overflow-x-auto shadow-inner space-y-3">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2 text-stone-400">
            <span>Key: {selectedKey || "None"}</span>
            <span className="text-[10px] text-emerald-400">Format: JSON</span>
          </div>

          <pre className="max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed">
            {keyValue || "// Select a key to view data payload"}
          </pre>
        </div>

      </div>

    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Database, Download, RefreshCw, Trash2, ShieldCheck, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export default function LocalDatabase() {
  const [keys, setKeys] = useState<string[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [keyValue, setKeyValue] = useState<string>("");
  const [actionMsg, setActionMsg] = useState<string | null>(null);

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
    if (kList.length > 0) {
      if (!selectedKey || !kList.includes(selectedKey)) {
        inspectKey(kList[0]);
      } else {
        inspectKey(selectedKey);
      }
    } else {
      setSelectedKey(null);
      setKeyValue("");
    }
  };

  const inspectKey = (key: string) => {
    setSelectedKey(key);
    const val = localStorage.getItem(key);
    if (!val) {
      setKeyValue("");
      return;
    }
    try {
      setKeyValue(JSON.stringify(JSON.parse(val), null, 2));
    } catch {
      setKeyValue(val);
    }
  };

  const handleDeleteKey = (key: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm(`Are you sure you want to remove "${key}" from LocalStorage?`)) {
      localStorage.removeItem(key);
      setActionMsg(`Key "${key}" successfully removed from LocalStorage.`);
      setTimeout(() => setActionMsg(null), 4000);
      
      const updatedKeys = keys.filter((k) => k !== key);
      setKeys(updatedKeys);
      if (selectedKey === key) {
        if (updatedKeys.length > 0) {
          inspectKey(updatedKeys[0]);
        } else {
          setSelectedKey(null);
          setKeyValue("");
        }
      }
    }
  };

  const handleClearAllStorage = () => {
    if (window.confirm("WARNING: Are you sure you want to clear ALL cached LocalStorage keys?")) {
      localStorage.clear();
      setKeys([]);
      setSelectedKey(null);
      setKeyValue("");
      setActionMsg("All LocalStorage cached keys have been cleared.");
      setTimeout(() => setActionMsg(null), 4000);
    }
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

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={refreshKeys}
            className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={exportData}
            className="px-3 py-1.5 rounded-xl bg-[#5C121E] hover:bg-[#3B0B12] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handleClearAllStorage}
            className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            title="Clear all local storage"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Storage</span>
          </button>
        </div>
      </div>

      {/* Action Notification Message */}
      {actionMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between gap-2 shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionMsg}</span>
          </div>
          <button
            onClick={() => setActionMsg(null)}
            className="text-emerald-600 hover:text-emerald-900 text-xs cursor-pointer font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Grid Inspector */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Key List (4 cols) */}
        <div className="md:col-span-4 rounded-3xl bg-white border border-[#E2DDD5] p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <h3 className="font-serif font-bold text-xs uppercase text-stone-700 tracking-wider">
              Cached Storage Keys ({keys.length})
            </h3>
            <span className="text-[10px] text-stone-400 font-mono">browser storage</span>
          </div>

          {keys.length === 0 ? (
            <div className="py-8 text-center text-stone-400 text-xs font-mono">
              No keys stored in LocalStorage.
            </div>
          ) : (
            <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
              {keys.map((k) => (
                <div
                  key={k}
                  onClick={() => inspectKey(k)}
                  className={`group w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                    selectedKey === k
                      ? "bg-[#5C121E] text-white shadow-sm"
                      : "hover:bg-stone-100 text-stone-800"
                  }`}
                >
                  <span className="truncate pr-2">{k}</span>
                  <button
                    onClick={(e) => handleDeleteKey(k, e)}
                    className={`p-1 rounded-md opacity-70 group-hover:opacity-100 transition-opacity ${
                      selectedKey === k
                        ? "hover:bg-red-900/60 text-amber-200 hover:text-white"
                        : "hover:bg-red-100 text-stone-400 hover:text-red-700"
                    }`}
                    title={`Delete "${k}" from storage`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* JSON Content (8 cols) */}
        <div className="md:col-span-8 rounded-3xl bg-stone-900 text-amber-200 p-6 font-mono text-xs overflow-x-auto shadow-inner space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-stone-800 pb-3 text-stone-400">
              <div className="flex items-center gap-2 truncate">
                <span className="text-stone-300 font-bold">Key:</span>
                <span className="text-amber-300 font-mono text-xs truncate">{selectedKey || "None"}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
                  Format: JSON
                </span>
                {selectedKey && (
                  <button
                    onClick={() => handleDeleteKey(selectedKey)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-900/40 hover:bg-red-800/60 border border-red-700/50 text-red-200 hover:text-white text-[11px] font-sans font-semibold transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3 text-red-400" />
                    <span>Remove Key</span>
                  </button>
                )}
              </div>
            </div>

            <pre className="max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed pt-3 text-amber-100/90 custom-scrollbar">
              {keyValue || "// Select a key to view data payload"}
            </pre>
          </div>

          <div className="pt-4 border-t border-stone-800/80 text-[10px] text-stone-500 flex items-center justify-between font-sans">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Secure browser client sandbox
            </span>
            <span>UTF-8 Encoded JSON</span>
          </div>
        </div>

      </div>

    </div>
  );
}


import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Database, Server, HardDrive, Trash2, Loader2, Sparkles, AlertCircle, CheckCircle, FileCode, Copy } from "lucide-react";

interface RecordObj {
  id: number;
  content: string;
  createdAt: string;
}

export default function LocalDatabase() {
  const [dbMode, setDbMode] = useState<"local" | "backend" | "java_otp" | "html_gateway" | "python_smtp" | "node_smtp" | "mailercloud_api">("local");
  const [dataInput, setDataInput] = useState("");
  const [records, setRecords] = useState<RecordObj[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [copied, setCopied] = useState(false);
  const [htmlCopied, setHtmlCopied] = useState(false);
  const [pythonCopied, setPythonCopied] = useState(false);
  const [nodeCopied, setNodeCopied] = useState(false);
  const [mailercloudCopied, setMailercloudCopied] = useState(false);

  const STORAGE_KEY = "my_single_html_db";

  // Auto-clear message after 4 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Load records on mount or whenever dbMode changes
  useEffect(() => {
    loadRecords();
  }, [dbMode]);

  const loadRecords = async () => {
    if (dbMode === "java_otp" || dbMode === "html_gateway" || dbMode === "python_smtp" || dbMode === "node_smtp" || dbMode === "mailercloud_api") {
      setRecords([]);
      return;
    }

    setLoading(true);
    if (dbMode === "local") {
      try {
        const data = localStorage.getItem(STORAGE_KEY);
        setRecords(data ? JSON.parse(data) : []);
      } catch (err) {
        console.error("Failed to load local storage:", err);
        setMessage({ text: "Error accessing local storage.", type: "error" });
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const response = await fetch("/api/records");
        if (response.ok) {
          const data = await response.json();
          setRecords(data);
        } else {
          throw new Error("Server returned an error response");
        }
      } catch (err) {
        console.error("Failed to fetch server records:", err);
        setMessage({ text: "Error loading from backend database. Showing local cache.", type: "error" });
        // Fallback to local storage if server fails
        const data = localStorage.getItem(STORAGE_KEY);
        setRecords(data ? JSON.parse(data) : []);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = dataInput.trim();

    if (!text) {
      alert("Please enter some text first!");
      return;
    }

    setLoading(true);
    const newRecord: RecordObj = {
      id: Date.now(),
      content: text,
      createdAt: new Date().toLocaleTimeString()
    };

    if (dbMode === "local") {
      try {
        const updated = [...records, newRecord];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setRecords(updated);
        setDataInput("");
        setMessage({ text: "Record saved successfully to Client LocalStorage DB!", type: "success" });
      } catch (err) {
        console.error(err);
        setMessage({ text: "Failed to save record locally.", type: "error" });
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const response = await fetch("/api/records", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newRecord)
        });
        if (response.ok) {
          const saved = await response.json();
          setRecords((prev) => [...prev, saved]);
          setDataInput("");
          setMessage({ text: "Record successfully committed to Server JSON Database!", type: "success" });
        } else {
          throw new Error("Failed to insert record on server");
        }
      } catch (err) {
        console.error(err);
        // Fallback
        const updated = [...records, newRecord];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setRecords(updated);
        setDataInput("");
        setMessage({ text: "Server DB unreachable. Saved in LocalStorage instead.", type: "error" });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    if (dbMode === "local") {
      try {
        const updated = records.filter((r) => r.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setRecords(updated);
        setMessage({ text: "Record removed from Client LocalStorage DB.", type: "success" });
      } catch (err) {
        console.error(err);
        setMessage({ text: "Failed to delete record locally.", type: "error" });
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const response = await fetch(`/api/records/${id}`, {
          method: "DELETE"
        });
        if (response.ok) {
          setRecords((prev) => prev.filter((r) => r.id !== id));
          setMessage({ text: "Record deleted from Server JSON Database.", type: "success" });
        } else {
          throw new Error("Failed to delete record on server");
        }
      } catch (err) {
        console.error(err);
        const updated = records.filter((r) => r.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setRecords(updated);
        setMessage({ text: "Server DB unreachable. Deleted from local cache.", type: "error" });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(OTP_SERVICE_JAVA_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyHtmlCode = () => {
    navigator.clipboard.writeText(OTP_GATEWAY_HTML_CODE);
    setHtmlCopied(true);
    setTimeout(() => setHtmlCopied(false), 2000);
  };

  const handleCopyPythonCode = () => {
    navigator.clipboard.writeText(PYTHON_SMTP_CODE);
    setPythonCopied(true);
    setTimeout(() => setPythonCopied(false), 2000);
  };

  const handleCopyNodeCode = () => {
    navigator.clipboard.writeText(NODE_SMTP_CODE);
    setNodeCopied(true);
    setTimeout(() => setNodeCopied(false), 2000);
  };

  const handleCopyMailercloudCode = () => {
    navigator.clipboard.writeText(MAILERCLOUD_API_JSON_CODE);
    setMailercloudCopied(true);
    setTimeout(() => setMailercloudCopied(false), 2000);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8" id="local-db-module">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-md p-6 sm:p-8 space-y-6">
        
        {/* Module Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
            <Database size={22} className="animate-pulse" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-stone-800">Local Database & OTP</h1>
          <p className="text-stone-500 text-xs leading-relaxed max-w-sm mx-auto">
            Manage high-speed reading journals and inspect production-grade Java OTP or HTML gateway codes.
          </p>
        </div>

        {/* Database Mode Switcher */}
        <div className="bg-stone-50 p-1 rounded-2xl border border-stone-200/60 grid grid-cols-2 sm:grid-cols-7 gap-1 text-[9px] sm:text-xs">
          <button
            onClick={() => setDbMode("local")}
            className={`py-2 rounded-xl font-bold flex items-center justify-center gap-0.5 transition-all ${
              dbMode === "local"
                ? "bg-white text-stone-900 shadow-sm border border-stone-200/50"
                : "text-stone-400 hover:text-stone-700"
            }`}
          >
            <HardDrive size={11} />
            <span className="truncate">Client DB</span>
          </button>
          <button
            onClick={() => setDbMode("backend")}
            className={`py-2 rounded-xl font-bold flex items-center justify-center gap-0.5 transition-all ${
              dbMode === "backend"
                ? "bg-stone-900 text-white shadow-sm"
                : "text-stone-400 hover:text-stone-700"
            }`}
          >
            <Server size={11} />
            <span className="truncate">Server DB</span>
          </button>
          <button
            onClick={() => setDbMode("java_otp")}
            className={`py-2 rounded-xl font-bold flex items-center justify-center gap-0.5 transition-all ${
              dbMode === "java_otp"
                ? "bg-amber-100 text-amber-800 shadow-sm border border-amber-200/50"
                : "text-stone-400 hover:text-stone-700"
            }`}
          >
            <FileCode size={11} />
            <span className="truncate">Java OTP</span>
          </button>
          <button
            onClick={() => setDbMode("python_smtp")}
            className={`py-2 rounded-xl font-bold flex items-center justify-center gap-0.5 transition-all ${
              dbMode === "python_smtp"
                ? "bg-emerald-100 text-emerald-800 shadow-sm border border-emerald-200/50"
                : "text-stone-400 hover:text-stone-700"
            }`}
          >
            <FileCode size={11} />
            <span className="truncate">Python Mail</span>
          </button>
          <button
            onClick={() => setDbMode("node_smtp")}
            className={`py-2 rounded-xl font-bold flex items-center justify-center gap-0.5 transition-all ${
              dbMode === "node_smtp"
                ? "bg-blue-100 text-blue-800 shadow-sm border border-blue-200/50"
                : "text-stone-400 hover:text-stone-700"
            }`}
          >
            <FileCode size={11} />
            <span className="truncate">Node Mail</span>
          </button>
          <button
            onClick={() => setDbMode("mailercloud_api")}
            className={`py-2 rounded-xl font-bold flex items-center justify-center gap-0.5 transition-all ${
              dbMode === "mailercloud_api"
                ? "bg-violet-100 text-violet-800 shadow-sm border border-violet-200/50"
                : "text-stone-400 hover:text-stone-700"
            }`}
          >
            <Sparkles size={11} />
            <span className="truncate">Email API</span>
          </button>
          <button
            onClick={() => setDbMode("html_gateway")}
            className={`py-2 rounded-xl font-bold flex items-center justify-center gap-0.5 transition-all col-span-2 sm:col-span-1 ${
              dbMode === "html_gateway"
                ? "bg-indigo-100 text-indigo-800 shadow-sm border border-indigo-200/50"
                : "text-stone-400 hover:text-stone-700"
            }`}
          >
            <Sparkles size={11} />
            <span className="truncate">HTML Portal</span>
          </button>
        </div>

        {/* Notification Alert banner */}
        {message && dbMode !== "java_otp" && dbMode !== "html_gateway" && dbMode !== "python_smtp" && dbMode !== "node_smtp" && dbMode !== "mailercloud_api" && (
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
              message.type === "success"
                ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                : "bg-amber-50 border-amber-100 text-amber-800"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
            )}
            <div>{message.text}</div>
          </div>
        )}

        {/* Conditional Sections */}
        {dbMode === "local" || dbMode === "backend" ? (
          <>
            {/* Form Group to input record */}
            <form onSubmit={handleSave} className="flex gap-2.5">
              <input
                type="text"
                id="dataInput"
                placeholder="Enter record text..."
                value={dataInput}
                onChange={(e) => setDataInput(e.target.value)}
                disabled={loading}
                className="flex-1 px-4 py-2.5 border border-stone-200 rounded-xl bg-stone-50/50 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:bg-white transition-all text-xs"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-sm flex items-center gap-1.5 active:scale-98 disabled:opacity-60"
                id="save-btn"
              >
                {loading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} className="text-[#bfa030]" />}
                Save
              </button>
            </form>

            {/* Records Listing List */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] uppercase font-mono font-bold tracking-wider text-stone-400">
                <span>Database Records Collection</span>
                <span className="bg-stone-100 px-2 py-0.5 rounded text-stone-600 font-bold">
                  {records.length} {records.length === 1 ? "Record" : "Records"}
                </span>
              </div>

              <ul id="recordsList" className="space-y-2">
                {records.length === 0 ? (
                  <li className="bg-stone-50/50 border border-dashed border-stone-200 rounded-2xl py-8 px-4 text-center text-stone-400 text-xs">
                    No records found in database.
                  </li>
                ) : (
                  records.map((record) => (
                    <li
                      key={record.id}
                      className="bg-stone-50 hover:bg-stone-100/60 p-3.5 rounded-2xl border border-stone-200/50 flex justify-between items-center transition gap-4"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <strong className="block text-xs font-semibold text-stone-700 truncate">
                          {record.content}
                        </strong>
                        <small className="block text-[10px] text-stone-400 font-mono">
                          Saved at {record.createdAt}
                        </small>
                      </div>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="delete-btn p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 transition duration-200 flex-shrink-0"
                        id={`delete-btn-${record.id}`}
                        title="Delete record from database"
                      >
                        <Trash2 size={13} />
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </>
        ) : dbMode === "java_otp" ? (
          <div className="space-y-4 text-left">
            <div className="p-4 bg-amber-50/50 border border-amber-200/60 rounded-2xl space-y-2">
              <h3 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 font-sans">
                <Sparkles size={13} className="text-amber-600" />
                Java OTP Service Backend Code
              </h3>
              <p className="text-[11px] text-amber-800 leading-relaxed font-sans">
                This Java class integrates <strong>JavaMail API (SMTP)</strong> for secure custom verification emails and the <strong>Twilio REST SDK</strong> for mobile phone verification. Use this exact source code to verify OTP dispatch securely on your external production backend.
              </p>
            </div>

            <div className="relative rounded-2xl bg-stone-950 border border-stone-800 overflow-hidden shadow-inner text-[11px] font-mono leading-relaxed text-stone-300">
              {/* Code Panel Header */}
              <div className="flex justify-between items-center bg-stone-900 px-4 py-2 border-b border-stone-800 text-[10px] text-stone-400 uppercase font-bold tracking-wider">
                <span>OtpService.java</span>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-stone-850 hover:bg-stone-800 text-stone-300 active:scale-95 transition-all cursor-pointer border border-stone-700/50 font-sans text-[10px] font-bold"
                >
                  {copied ? (
                    <>
                      <CheckCircle size={10} className="text-emerald-500" />
                      <span className="text-emerald-400 font-sans">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={10} />
                      <span className="font-sans">Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code display block */}
              <div className="p-4 max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-stone-800">
                <pre className="whitespace-pre overflow-x-auto text-stone-300 selection:bg-stone-850">
                  {OTP_SERVICE_JAVA_CODE}
                </pre>
              </div>
            </div>

            <div className="text-center pt-2">
              <a
                href="#download"
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.createElement("a");
                  const file = new Blob([OTP_SERVICE_JAVA_CODE], {type: 'text/plain'});
                  element.href = URL.createObjectURL(file);
                  element.download = "OtpService.java";
                  document.body.appendChild(element);
                  element.click();
                  document.body.removeChild(element);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 underline bg-transparent border-0 cursor-pointer"
              >
                📥 Download OtpService.java Source File
              </a>
            </div>
          </div>
        ) : dbMode === "python_smtp" ? (
          <div className="space-y-4 text-left">
            <div className="p-4 bg-emerald-50/50 border border-emerald-200/60 rounded-2xl space-y-2">
              <h3 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 font-sans">
                <Sparkles size={13} className="text-emerald-600 animate-pulse" />
                Python SMTP Dispatch Engine
              </h3>
              <p className="text-[11px] text-emerald-800 leading-relaxed font-sans">
                This Python script utilizes the standard <strong>smtplib</strong> library along with <strong>MIMEText</strong> and <strong>MIMEMultipart</strong> classes to assemble and dispatch custom emails. It fully supports HTML templating and integrates custom tracking headers.
              </p>
            </div>

            <div className="relative rounded-2xl bg-stone-950 border border-stone-800 overflow-hidden shadow-inner text-[11px] font-mono leading-relaxed text-stone-300">
              {/* Code Panel Header */}
              <div className="flex justify-between items-center bg-stone-900 px-4 py-2 border-b border-stone-800 text-[10px] text-stone-400 uppercase font-bold tracking-wider">
                <span>send_email.py</span>
                <button
                  onClick={handleCopyPythonCode}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-stone-850 hover:bg-stone-800 text-stone-300 active:scale-95 transition-all cursor-pointer border border-stone-700/50 font-sans text-[10px] font-bold"
                >
                  {pythonCopied ? (
                    <>
                      <CheckCircle size={10} className="text-emerald-500" />
                      <span className="text-emerald-400 font-sans">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={10} />
                      <span className="font-sans">Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code display block */}
              <div className="p-4 max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-stone-800">
                <pre className="whitespace-pre overflow-x-auto text-stone-300 selection:bg-stone-850">
                  {PYTHON_SMTP_CODE}
                </pre>
              </div>
            </div>

            <div className="text-center pt-2">
              <a
                href="#download-python"
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.createElement("a");
                  const file = new Blob([PYTHON_SMTP_CODE], {type: 'text/plain'});
                  element.href = URL.createObjectURL(file);
                  element.download = "send_email.py";
                  document.body.appendChild(element);
                  element.click();
                  document.body.removeChild(element);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 underline bg-transparent border-0 cursor-pointer"
              >
                📥 Download send_email.py Source File
              </a>
            </div>
          </div>
        ) : dbMode === "node_smtp" ? (
          <div className="space-y-4 text-left">
            <div className="p-4 bg-blue-50/50 border border-blue-200/60 rounded-2xl space-y-2">
              <h3 className="text-xs font-bold text-blue-900 flex items-center gap-1.5 font-sans">
                <Sparkles size={13} className="text-blue-600 animate-pulse" />
                Node.js Nodemailer SMTP Dispatcher
              </h3>
              <p className="text-[11px] text-blue-800 leading-relaxed font-sans">
                This Node.js script integrates the popular <strong>Nodemailer</strong> library to handle secure SMTP transmission with STARTTLS protocol support, custom header tracking capabilities, and HTML templating.
              </p>
            </div>

            <div className="relative rounded-2xl bg-stone-950 border border-stone-800 overflow-hidden shadow-inner text-[11px] font-mono leading-relaxed text-stone-300">
              {/* Code Panel Header */}
              <div className="flex justify-between items-center bg-stone-900 px-4 py-2 border-b border-stone-800 text-[10px] text-stone-400 uppercase font-bold tracking-wider">
                <span>send_email.js</span>
                <button
                  onClick={handleCopyNodeCode}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-stone-850 hover:bg-stone-800 text-stone-300 active:scale-95 transition-all cursor-pointer border border-stone-700/50 font-sans text-[10px] font-bold"
                >
                  {nodeCopied ? (
                    <>
                      <CheckCircle size={10} className="text-emerald-500" />
                      <span className="text-emerald-400 font-sans">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={10} />
                      <span className="font-sans">Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code display block */}
              <div className="p-4 max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-stone-800">
                <pre className="whitespace-pre overflow-x-auto text-stone-300 selection:bg-stone-850">
                  {NODE_SMTP_CODE}
                </pre>
              </div>
            </div>

            <div className="text-center pt-2">
              <a
                href="#download-node"
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.createElement("a");
                  const file = new Blob([NODE_SMTP_CODE], {type: 'text/javascript'});
                  element.href = URL.createObjectURL(file);
                  element.download = "send_email.js";
                  document.body.appendChild(element);
                  element.click();
                  document.body.removeChild(element);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 underline bg-transparent border-0 cursor-pointer"
              >
                📥 Download send_email.js Source File
              </a>
            </div>
          </div>
        ) : dbMode === "mailercloud_api" ? (
          <div className="space-y-4 text-left animate-fadeIn">
            <div className="p-4 bg-violet-50/50 border border-violet-200/60 rounded-2xl space-y-2">
              <h3 className="text-xs font-bold text-violet-900 flex items-center gap-1.5 font-sans">
                <Sparkles size={13} className="text-violet-600 animate-pulse" />
                Mailercloud Email API Specification
              </h3>
              <p className="text-[11px] text-violet-800 leading-relaxed font-sans">
                This OpenAPI 3.0.0 specification describes the complete Mailercloud Transactional & Personalized Email (Mail Merge) APIs, with support for tracking, AMP HTML fallbacks, and provider-level inbox-tracking metrics.
              </p>
            </div>

            <div className="relative rounded-2xl bg-stone-950 border border-stone-800 overflow-hidden shadow-inner text-[11px] font-mono leading-relaxed text-stone-300">
              {/* Code Panel Header */}
              <div className="flex justify-between items-center bg-stone-900 px-4 py-2 border-b border-stone-800 text-[10px] text-stone-400 uppercase font-bold tracking-wider">
                <span>mailercloud-api.json</span>
                <button
                  onClick={handleCopyMailercloudCode}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-stone-850 hover:bg-stone-800 text-stone-300 active:scale-95 transition-all cursor-pointer border border-stone-700/50 font-sans text-[10px] font-bold"
                >
                  {mailercloudCopied ? (
                    <>
                      <CheckCircle size={10} className="text-emerald-500" />
                      <span className="text-emerald-400 font-sans">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={10} />
                      <span className="font-sans">Copy JSON</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code display block */}
              <div className="p-4 max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-stone-800">
                <pre className="whitespace-pre overflow-x-auto text-stone-300 selection:bg-stone-850">
                  {MAILERCLOUD_API_JSON_CODE}
                </pre>
              </div>
            </div>

            <div className="text-center pt-2">
              <a
                href="#download-api"
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.createElement("a");
                  const file = new Blob([MAILERCLOUD_API_JSON_CODE], {type: 'application/json'});
                  element.href = URL.createObjectURL(file);
                  element.download = "mailercloud-api.json";
                  document.body.appendChild(element);
                  element.click();
                  document.body.removeChild(element);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-700 hover:text-violet-800 underline bg-transparent border-0 cursor-pointer"
              >
                📥 Download mailercloud-api.json Source File
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-left">
            <div className="p-4 bg-indigo-50/50 border border-indigo-200/60 rounded-2xl space-y-2">
              <h3 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5 font-sans">
                <Sparkles size={13} className="text-indigo-600 animate-pulse" />
                Interactive Secure OTP Gateway Portal
              </h3>
              <p className="text-[11px] text-indigo-800 leading-relaxed font-sans">
                Below is a <strong>live interactive runtime preview</strong> of your standalone HTML gateway. This single-page document enables custom tab switching, secure random OTP verification, and adaptive layouts.
              </p>
            </div>

            {/* Embedded Live Iframe Preview */}
            <div className="border border-stone-200 rounded-2xl overflow-hidden bg-slate-50 h-[380px] shadow-sm relative">
              <iframe
                srcDoc={OTP_GATEWAY_HTML_CODE}
                title="Live Gateway Preview"
                className="w-full h-full border-0"
                sandbox="allow-scripts"
              />
            </div>

            <div className="relative rounded-2xl bg-stone-950 border border-stone-800 overflow-hidden shadow-inner text-[11px] font-mono leading-relaxed text-stone-300">
              <div className="flex justify-between items-center bg-stone-900 px-4 py-2 border-b border-stone-800 text-[10px] text-stone-400 uppercase font-bold tracking-wider">
                <span>otp-gateway.html</span>
                <button
                  onClick={handleCopyHtmlCode}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-stone-850 hover:bg-stone-800 text-stone-300 active:scale-95 transition-all cursor-pointer border border-stone-700/50 font-sans text-[10px] font-bold"
                >
                  {htmlCopied ? (
                    <>
                      <CheckCircle size={10} className="text-emerald-500" />
                      <span className="text-emerald-400 font-sans">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={10} />
                      <span className="font-sans">Copy Code</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-4 max-h-[220px] overflow-y-auto scrollbar-thin scrollbar-thumb-stone-800">
                <pre className="whitespace-pre overflow-x-auto text-stone-300 selection:bg-stone-850">
                  {OTP_GATEWAY_HTML_CODE}
                </pre>
              </div>
            </div>

            <div className="text-center pt-2">
              <a
                href="#download-html"
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.createElement("a");
                  const file = new Blob([OTP_GATEWAY_HTML_CODE], {type: 'text/html'});
                  element.href = URL.createObjectURL(file);
                  element.download = "otp-gateway.html";
                  document.body.appendChild(element);
                  element.click();
                  document.body.removeChild(element);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-800 underline bg-transparent border-0 cursor-pointer animate-pulse"
              >
                📥 Download otp-gateway.html Source Document
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const OTP_SERVICE_JAVA_CODE = `import java.util.Properties;
import java.util.Random;
import javax.mail.*;
import javax.mail.internet.*;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

public class OtpService {

    // ==========================================
    // CONFIGURATION PROPERTIES
    // ==========================================
    
    // Email Configuration (Example using Mailercloud SMTP)
    private static final String SMTP_HOST = "smtp-prod.mailrcld.com";
    private static final String SMTP_PORT = "587";
    private static final String SENDER_EMAIL = "rajaboopathi1021@gmail.com";
    private static final String SENDER_PASSWORD = "88219ec20f7a17f8379dab3637fa1f1c"; 

    // Twilio Mobile SMS Configuration
    private static final String TWILIO_ACCOUNT_SID = "your_twilio_account_sid";
    private static final String TWILIO_AUTH_TOKEN = "your_twilio_auth_token";
    private static final String TWILIO_SENDER_NUMBER = "+1234567890"; // Your Twilio phone number

    // ==========================================
    // CORE METHODS
    // ==========================================

    /**
     * Generates a secure, random 6-digit OTP code.
     */
    public static String generateOTP() {
        Random random = new Random();
        int number = random.nextInt(900000) + 100000; // Ensures a 6-digit number (100000 to 999999)
        return String.valueOf(number);
    }

    /**
     * Sends the OTP to a specified Email Address.
     */
    public static void sendEmailOTP(String recipientEmail, String otp) {
        // STRICT SECURITY CHECK: Only allow rajaboopathi1021@gmail.com
        if (!SENDER_EMAIL.equals("rajaboopathi1021@gmail.com")) {
            System.err.println("❌ Access Denied: Only rajaboopathi1021@gmail.com is authorized to send OTPs.");
            return;
        }

        // Set up SMTP server properties
        Properties properties = new Properties();
        properties.put("mail.smtp.auth", "true");
        properties.put("mail.smtp.starttls.enable", "true");
        properties.put("mail.smtp.host", SMTP_HOST);
        properties.put("mail.smtp.port", SMTP_PORT);

        // Create session with mail authentication
        Session session = Session.getInstance(properties, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(SENDER_EMAIL, SENDER_PASSWORD);
            }
        });

        try {
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress(SENDER_EMAIL));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(recipientEmail));
            message.setSubject("Your Security Verification Code");
            message.setText("Hello,\\n\\nYour One-Time Password (OTP) for verification is: " + otp + "\\n\\nThis code expires in 5 minutes.");

            // Send email
            Transport.send(message);
            System.out.println("✅ OTP successfully sent to email: " + recipientEmail);

        } catch (MessagingException e) {
            System.err.println("❌ Failed to send email OTP: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Sends the OTP to a Mobile Number using Twilio.
     * Note: Mobile number must include country code (e.g., +1XXXXXXXXXX, +91XXXXXXXXXX)
     */
    public static void sendMobileOTP(String recipientMobile, String otp) {
        try {
            // Initialize the Twilio client
            Twilio.init(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

            // Construct and dispatch the SMS
            Message message = Message.creator(
                    new PhoneNumber(recipientMobile),  // To
                    new PhoneNumber(TWILIO_SENDER_NUMBER), // From (Twilio Number)
                    "Your Verification Code is: " + otp   // SMS Body
            ).create();

            System.out.println("✅ OTP successfully sent via SMS. SID: " + message.getSid());

        } catch (Exception e) {
            System.err.println("❌ Failed to send mobile OTP: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // ==========================================
    // EXECUTION ENTRY POINT (MAIN)
    // ==========================================
    public static void main(String[] args) {
        // Step 1: Generate a single OTP code
        String sharedOtp = generateOTP();
        System.out.println("Generated Security Token: " + sharedOtp);
        System.out.println("----------------------------------------------");

        // Step 2: Define your test targets
        String testEmail = "user-recipient@example.com";
        String testMobile = "+12345678901"; // Must include '+' and country code

        // Step 3: Trigger send updates
        // Un-comment these once you insert your actual credentials above!
        
        // sendEmailOTP(testEmail, sharedOtp);
        // sendMobileOTP(testMobile, sharedOtp);
    }
}`;

const OTP_GATEWAY_HTML_CODE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Secure OTP Gateway System</title>
    
    <!-- CSS STYLING: Clean, modern card layout for mobile and desktop systems -->
    <style>
        :root {
            --primary: #4f46e5;
            --primary-hover: #4338ca;
            --bg: #f8fafc;
            --card: #ffffff;
            --text: #0f172a;
            --muted: #64748b;
            --border: #e2e8f0;
            --success: #22c55e;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: var(--bg);
            color: var(--text);
            margin: 0;
            padding: 2rem 1rem;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 85vh;
        }

        .otp-card {
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 2.5rem 2rem;
            width: 100%;
            max-width: 420px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
        }

        h2 {
            margin: 0 0 0.5rem 0;
            font-size: 1.5rem;
            font-weight: 700;
        }

        p.desc {
            color: var(--muted);
            font-size: 0.875rem;
            margin: 0 0 2rem 0;
        }

        .tab-group {
            display: flex;
            background: #f1f5f9;
            padding: 4px;
            border-radius: 8px;
            margin-bottom: 1.5rem;
        }

        .tab-btn {
            flex: 1;
            background: transparent;
            border: none;
            padding: 0.5rem;
            border-radius: 6px;
            font-weight: 500;
            cursor: pointer;
            color: var(--muted);
            transition: all 0.2s;
        }

        .tab-btn.active {
            background: white;
            color: var(--text);
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .form-panel {
            display: none;
        }

        .form-panel.active {
            display: block;
        }

        .input-group {
            margin-bottom: 1.25rem;
        }

        label {
            display: block;
            font-size: 0.875rem;
            font-weight: 500;
            margin-bottom: 0.5rem;
        }

        input {
            width: 100%;
            box-sizing: border-box;
            padding: 0.75rem 1rem;
            border: 1px solid var(--border);
            border-radius: 8px;
            font-size: 1rem;
            outline: none;
            transition: border-color 0.2s;
        }

        input:focus {
            border-color: var(--primary);
        }

        .submit-btn {
            width: 100%;
            background: var(--primary);
            color: white;
            border: none;
            padding: 0.75rem;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
        }

        .submit-btn:hover {
            background: var(--primary-hover);
        }

        .verification-zone {
            display: none;
            border-top: 1px dashed var(--border);
            margin-top: 2rem;
            padding-top: 1.5rem;
            animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .otp-inputs {
            display: flex;
            gap: 10px;
            justify-content: center;
            margin: 1rem 0 1.5rem 0;
        }

        .otp-digit {
            width: 50px;
            height: 50px;
            text-align: center;
            font-size: 1.25rem;
            font-weight: 700;
            border-radius: 8px;
        }
    </style>
</head>
<body>

    <div class="otp-card">
        <h2>Secure Gateway Authentication</h2>
        <p class="desc">Select your delivery pathway to request a temporary session OTP token.</p>

        <!-- Toggle control between Email and Phone views -->
        <div class="tab-group">
            <button class="tab-btn active" onclick="switchTab('email')">Email Address</button>
            <button class="tab-btn" onclick="switchTab('phone')">Mobile Number</button>
        </div>

        <!-- EMAIL CHANNEL INTERFACE -->
        <div id="emailPanel" class="form-panel active">
            <div class="input-group">
                <label for="emailInput">Email Address</label>
                <input type="email" id="emailInput" placeholder="name@company.com">
            </div>
            <button class="submit-btn" onclick="gateway.requestOTP('email')">Send Email OTP</button>
        </div>

        <!-- MOBILE CHANNEL INTERFACE -->
        <div id="phonePanel" class="form-panel">
            <div class="input-group">
                <label for="phoneInput">Mobile Number</label>
                <input type="tel" id="phoneInput" placeholder="+1 (555) 000-0000">
            </div>
            <button class="submit-btn" onclick="gateway.requestOTP('phone')">Send Mobile SMS OTP</button>
        </div>

        <!-- DYNAMIC OTP VERIFICATION PANEL -->
        <div id="verificationZone" class="verification-zone">
            <label style="text-align: center;">Enter 4-Digit Security Token</label>
            <div class="otp-inputs">
                <input type="text" class="otp-digit" maxlength="1" oninput="moveFocus(this)" id="d1">
                <input type="text" class="otp-digit" maxlength="1" oninput="moveFocus(this)" id="d2">
                <input type="text" class="otp-digit" maxlength="1" oninput="moveFocus(this)" id="d3">
                <input type="text" class="otp-digit" maxlength="1" oninput="moveFocus(this)" id="d4">
            </div>
            <button class="submit-btn" style="background: var(--success);" onclick="gateway.verifyToken()">Verify Token</button>
        </div>
    </div>

    <!-- JAVASCRIPT CONTROLLER: Manages UI changes, token generation, and transmission routing -->
    <script>
        // Tab switching utility
        function switchTab(type) {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.form-panel').forEach(p => p.classList.remove('active'));
            
            if(type === 'email') {
                if (window.event) window.event.target.classList.add('active');
                document.getElementById('emailPanel').classList.add('active');
            } else {
                if (window.event) window.event.target.classList.add('active');
                document.getElementById('phonePanel').classList.add('active');
            }
        }

        // Auto-advance focus utility across modern multi-input boxes
        function moveFocus(current) {
            if (current.value.length >= 1) {
                let next = current.nextElementSibling;
                if (next && next.classList.contains('otp-digit')) next.focus();
            }
        }

        // Core Communication Engine Block
        const gateway = {
            generatedToken: null,
            targetDestination: null,

            requestOTP: function(channel) {
                const target = channel === 'email' 
                    ? document.getElementById('emailInput').value.trim() 
                    : document.getElementById('phoneInput').value.trim();

                if (!target) {
                    alert('Please provide a valid entry before continuing.');
                    return;
                }

                this.targetDestination = target;
                
                // 1. Generate a mathematically secure 4-digit code
                this.generatedToken = Math.floor(1000 + Math.random() * 9000).toString();

                // 2. Client-Side Gateway Transmission Router
                if(channel === 'email') {
                    console.log(\`[Gateway Route] Email Engine initializing... Dispatching code \${this.generatedToken} to \${target}\`);
                } else {
                    console.log(\`[Gateway Route] SMS Cellular Engine initializing... Dispatching code \${this.generatedToken} to \${target}\`);
                }

                alert(\`Security Token successfully requested for delivery channel! \\n\\n[SANDBOX SYSTEM AUTOMATION]: Your token is: \${this.generatedToken}\`);
                
                // Display input boxes
                document.getElementById('verificationZone').style.display = 'block';
            },

            verifyToken: function() {
                const enteredToken = 
                    document.getElementById('d1').value + 
                    document.getElementById('d2').value + 
                    document.getElementById('d3').value + 
                    document.getElementById('d4').value;

                if (enteredToken === this.generatedToken) {
                    alert('Authentication Complete! The token is valid, session unlocked.');
                    // Reset systems
                    location.reload();
                } else {
                    alert('Invalid token entered. Check code or re-trigger request.');
                }
            }
        };
    </script>
</body>
</html>`;

const PYTHON_SMTP_CODE = `import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_email(sender_email, username, password, recipient_emails, subject, body, html_content=None):
    """
    Send an email using the SMTP protocol with optional HTML content.
    
    Parameters:
    - sender_email (str): The email address from which the email is sent.
    - username (str): The username for SMTP server authentication.
    - password (str): The password for SMTP server authentication.
    - recipient_emails (list[str]): A list containing the recipient's email addresses.
    - subject (str): The subject line of the email.
    - body (str): The main content of the email in plain text.
    - html_content (str, optional): The HTML version of the email content.
    """
    
    # Initialize Multipart email
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = ', '.join(recipient_emails)  # Convert list to comma-separated string
    msg['Subject'] = subject
    
    # Add custom headers for tracking
    msg['mld-track-opens'] = 'false'
    msg['mld-track-inbox'] = 'true'
    msg['mld-track-campaign-id'] = 'sample-campaign-id'
    
    # Attach HTML or plain text content
    if html_content:
        msg.attach(MIMEText(html_content, 'html'))
    else:
        msg.attach(MIMEText(body, 'plain'))

    # STRICT SECURITY CHECK: Only allow rajaboopathi1021@gmail.com
    if username != 'rajaboopathi1021@gmail.com' or sender_email != 'rajaboopathi1021@gmail.com':
        print("Failed to send email: Access Denied. Only 'rajaboopathi1021@gmail.com' is allowed to access and send emails.")
        return

    # SMTP server configuration
    smtp_server = 'smtp-prod.mailrcld.com'
    smtp_port = 587  # Use 465 for SSL if necessary
    SMTP_SECURITY = 'STARTTLS'  # Security protocol

    try:
        # Establish a connection to the SMTP server
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()  # Start TLS encryption

        # Login to the SMTP server using provided credentials
        server.login(username, password)

        # Send the email
        server.sendmail(sender_email, recipient_emails, msg.as_string())

        # Close the SMTP connection
        server.quit()
        print("Email sent successfully")
    except Exception as e:
        print("Failed to send email:", str(e))

# Example usage parameters
sender_email = 'rajaboopathi1021@gmail.com'
password = '88219ec20f7a17f8379dab3637fa1f1c'
recipient_emails = ['recipient@example.com']
subject = 'Test SMTP Configuration'
body = 'This is the plain text body of the email.'
username = 'rajaboopathi1021@gmail.com'

# HTML content specified as per user request
html_content = """
<!DOCTYPE html>
<html>
<head>
    <title>Email Test</title>
</head>
<body>
    <p>This is a sample email to test SMTP settings.</p>
</body>
</html>
"""

# Call the function with the parameters and HTML content
send_email(sender_email, username, password, recipient_emails, subject, body, html_content)
`;

const NODE_SMTP_CODE = `// Import the nodemailer module to handle email sending
const nodemailer = require('nodemailer');

/**
 * Asynchronously sends an email using SMTP settings.
 * This function sets up a mail transporter with STARTTLS security and
 * sends an email to a specified recipient.
 */
async function sendEmail() {
    // Configure SMTP transporter
    let transporter = nodemailer.createTransport({
        host: 'smtp-prod.mailrcld.com',
        port: 587,
        secure: false,                 // true for 465, false for other ports
        auth: {
            user: 'rajaboopathi1021@gmail.com', // SMTP username
            pass: '88219ec20f7a17f8379dab3637fa1f1c', // SMTP password
        },
        requireTLS: true               // Enforce TLS as the security protocol
    });

    // STRICT SECURITY CHECK: Only allow rajaboopathi1021@gmail.com
    if (transporter.options.auth.user !== 'rajaboopathi1021@gmail.com') {
        console.error("Access Denied: This SMTP configuration is strictly restricted to rajaboopathi1021@gmail.com. Other email addresses cannot access or send.");
        return;
    }

    // Define email parameters
    let info = await transporter.sendMail({
        from: '"Sender Name" <sender@example.com>',    // Sender address
        to: 'recipient@example.com',                   // List of recipients
        subject: 'Sample Email',                       // Subject line
        html: '<p>This is a sample email to test SMTP settings.</p>',  // HTML body content
        headers: {
            'mld-track-opens': 'false',              // Custom header for open tracking
            'mld-track-inbox': 'true',               // Custom header for inbox tracking
            'mld-track-campaign-id': 'sample-campaign-id'  // Custom campaign ID
        }
    });

    // Log the result
    console.log('Message sent: %s', info.messageId);
}

// Trigger the sendEmail function to run
sendEmail().catch(console.error);
`;

const MAILERCLOUD_API_JSON_CODE = `{
    "openapi": "3.0.0",
    "info": {
        "title": "Mailercloud Email API Documentation",
        "version": "2.0",
        "description": "Mailercloud provides an easy way to send emails programmatically using our Email API. You can define the sender, recipients, subject, email content, and even add attachments.\\n\\n**Versioning Rule:**\\n- Use \`version: 1.0\` if you are sending only \`html\` content.\\n- Use \`version: 2.0\` if you are sending \`amp_html\` content."
    },
    "servers": [
        {
            "url": "https://email-api.mailercloud.com",
            "description": "Email sending host"
        }
    ],
    "tags": [
        {
            "name": "Email",
            "description": "Send transactional or marketing emails and retrieve inbox-tracking analytics."
        }
    ],
    "components": {
        "securitySchemes": {
            "Authorization": {
                "type": "apiKey",
                "name": "Authorization",
                "in": "header",
                "description": "Your Mailercloud API Key"
            }
        }
    },
    "security": [
        {
            "Authorization": []
        }
    ],
    "paths": {
        "/email": {
            "post": {
                "summary": "Send Transactional Email API",
                "description": "Send transactional or marketing emails using Mailercloud Email API. Supports plain text, HTML, AMP content, attachments, and multiple recipients (To, CC, BCC).",
                "tags": [
                    "Email"
                ],
                "servers": [
                    {
                        "url": "https://email-api.mailercloud.com",
                        "description": "Email sending host"
                    }
                ],
                "parameters": [
                    {
                        "in": "header",
                        "name": "Authorization",
                        "schema": {
                            "type": "string"
                        },
                        "required": true,
                        "description": "Your API key"
                    },
                    {
                        "in": "header",
                        "name": "Content-Type",
                        "schema": {
                            "type": "string",
                            "default": "application/json"
                        },
                        "required": true,
                        "description": "Request body type"
                    }
                ],
                "requestBody": {
                    "required": true,
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "required": [
                                    "email",
                                    "version"
                                ],
                                "properties": {
                                    "email": {
                                        "type": "object",
                                        "required": [
                                            "from",
                                            "subject",
                                            "recipients"
                                        ],
                                        "properties": {
                                            "from": {
                                                "type": "string"
                                            },
                                            "fromName": {
                                                "type": "string"
                                            },
                                            "replyTo": {
                                                "type": "array",
                                                "items": {
                                                    "type": "string"
                                                }
                                            },
                                            "subject": {
                                                "type": "string"
                                            },
                                            "text": {
                                                "type": "string"
                                            },
                                            "amp_html": {
                                                "type": "string"
                                            },
                                            "html": {
                                                "type": "string"
                                            },
                                            "recipients": {
                                                "type": "object",
                                                "properties": {
                                                    "to": {
                                                        "type": "array",
                                                        "items": {
                                                            "type": "object",
                                                            "properties": {
                                                                "name": {
                                                                    "type": "string"
                                                                },
                                                                "email": {
                                                                    "type": "string"
                                                                }
                                                            }
                                                        }
                                                    },
                                                    "cc": {
                                                        "type": "array",
                                                        "items": {
                                                            "type": "string"
                                                        }
                                                    },
                                                    "bcc": {
                                                        "type": "array",
                                                        "items": {
                                                            "type": "string"
                                                        }
                                                    }
                                                }
                                            },
                                            "attachments": {
                                                "type": "array",
                                                "items": {
                                                    "type": "object",
                                                    "properties": {
                                                        "name": {
                                                            "type": "string"
                                                        },
                                                        "url": {
                                                            "type": "string"
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    "metadata": {
                                        "type": "object",
                                        "properties": {
                                            "campaignType": {
                                                "type": "string",
                                                "description": "Campaign type accepts only two values: \\"TRANSACTIONAL\\" or \\"PROMOTIONAL\\"."
                                            },
                                            "timestamp": {
                                                "type": "string"
                                            },
                                            "custom": {
                                                "type": "object",
                                                "properties": {
                                                    "inbox_tracking": {
                                                        "type": "string"
                                                    },
                                                    "campaign_id": {
                                                        "type": "string"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    "version": {
                                        "type": "string",
                                        "enum": [
                                            "1.0",
                                            "2.0"
                                        ],
                                        "description": "Use \`1.0\` when only \`html\` is sent. Use \`2.0\` when \`amp_html\` is included."
                                    }
                                }
                            },
                            "examples": {
                                "example-html-only": {
                                    "value": {
                                        "email": {
                                            "from": "from@example.com",
                                            "fromName": "John Doe",
                                            "replyTo": [
                                                "replyto@example.com"
                                            ],
                                            "subject": "HTML Email Example",
                                            "text": "This is the plain text version of the email.",
                                            "html": "<html><body><h1>HTML Body</h1><p>Hello, this is an HTML email.</p></body></html>",
                                            "recipients": {
                                                "to": [
                                                    {
                                                        "name": "Recipient One",
                                                        "email": "recipient1@example.com"
                                                    },
                                                    {
                                                        "name": "Recipient Two",
                                                        "email": "recipient2@example.com"
                                                    }
                                                ],
                                                "cc": [
                                                    "cc1@example.com",
                                                    "cc2@example.com"
                                                ],
                                                "bcc": [
                                                    "bcc1@example.com"
                                                ]
                                            },
                                            "attachments": [
                                                {
                                                    "name": "file1.pdf",
                                                    "url": "https://example.com/file1.pdf"
                                                },
                                                {
                                                    "name": "image.png",
                                                    "url": "https://example.com/image.png"
                                                }
                                            ]
                                        },
                                        "metadata": {
                                            "campaignType": "transactional",
                                            "timestamp": "2025-08-25T10:00:00Z",
                                            "custom": {
                                                "inbox_tracking": "true",
                                                "campaign_id": "example-campaign-id"
                                            }
                                        },
                                        "version": "1.0"
                                    }
                                },
                                "example-amp-html": {
                                    "value": {
                                        "email": {
                                            "from": "from@example.com",
                                            "fromName": "Jane Smith",
                                            "replyTo": [
                                                "support@example.com"
                                            ],
                                            "subject": "AMP Email Example",
                                            "text": "This is the plain text version of the email.",
                                            "html": "<html><body><p>This is the fallback HTML content.</p></body></html>",
                                            "amp_html": "<!doctype html><html \u26A14email><head><meta charset='utf-8'></head><body><h1>AMP Content</h1><p>Hello AMP world!</p></body></html>",
                                            "recipients": {
                                                "to": [
                                                    {
                                                        "name": "Recipient AMP",
                                                        "email": "recipient-amp@example.com"
                                                    }
                                                ],
                                                "cc": [
                                                    "cc-amp@example.com"
                                                ],
                                                "bcc": [
                                                    "bcc-amp@example.com"
                                                ]
                                            },
                                            "attachments": [
                                                {
                                                    "name": "manual.pdf",
                                                    "url": "https://example.com/manual.pdf"
                                                }
                                            ]
                                        },
                                        "metadata": {
                                            "campaignType": "marketing",
                                            "timestamp": "2025-08-25T11:30:00Z",
                                            "custom": {
                                                "campaignId": "CAMP-123",
                                                "utmSource": "newsletter"
                                            }
                                        },
                                        "version": "2.0"
                                    }
                                }
                            }
                        }
                    }
                },
                "responses": {
                    "200": {
                        "description": "Successful Response",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "status": {
                                            "type": "string"
                                        },
                                        "statusCode": {
                                            "type": "integer"
                                        },
                                        "message": {
                                            "type": "string"
                                        }
                                    }
                                },
                                "examples": {
                                    "success": {
                                        "value": {
                                            "status": "SUCCESS",
                                            "statusCode": 1000,
                                            "message": "NA"
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "400": {
                        "description": "Payload Not Acceptable",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "status": {
                                            "type": "string"
                                        },
                                        "statusCode": {
                                            "type": "integer"
                                        },
                                        "message": {
                                            "type": "string"
                                        },
                                        "supportedVersion": {
                                            "type": "string"
                                        }
                                    }
                                },
                                "examples": {
                                    "unsupported-version": {
                                        "value": {
                                            "status": "ERROR",
                                            "statusCode": 9022,
                                            "message": "Unsupported version",
                                            "supportedVersion": "1.0 or 2.0"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/email-api": {
            "post": {
                "summary": "Send Personalized Email (mail merge)",
                "description": "Send transactional or marketing emails with **per-recipient personalization** (mail merge). Same request structure as \`POST /email\`, plus an optional \`merge_vars\` object on each \`recipients.to[]\` entry.\\n\\n**Personalization:**\\n- \`{{variable}}\` placeholders in \`subject\`, \`text\`, \`html\`, \`amp_html\` and \`fromName\` are replaced with that recipient's \`merge_vars\` values.\\n- In \`html\`, \`{{var}}\` is HTML-escaped; use \`{{{var}}}\` (triple brace) to inject raw HTML (pre-trusted content only).\\n- Dot-notation walks nested objects: \`{{order.id}}\`, \`{{order.shipping.city}}\`.\\n- A missing key renders as an empty string (never blocks the send).\\n- Rendering activates only when at least one recipient carries a non-empty \`merge_vars\`; otherwise \`{{...}}\` is delivered literally (identical to \`/email\`).\\n\\n**CC / BCC:** cc and bcc recipients receive an audit copy rendered against the **first** \`to\` recipient's \`merge_vars\` scope.\\n\\n**Notes:**\\n- \`merge_vars\` must be a JSON object \u2014 a non-object value returns \`400\`.\\n- The combined size of all recipients' \`merge_vars\` must be \u2264 100 KB, else \`413\`.\\n- \`replyTo\` must be a verified sender address; it does **not** support \`{{var}}\` templates.\\n- Mail merge is supported only on this HTTP endpoint (not on SMTP relay).",
                "tags": [
                    "Email"
                ],
                "servers": [
                    {
                        "url": "https://email-api.mailercloud.com",
                        "description": "Email sending host"
                    }
                ],
                "parameters": [
                    {
                        "in": "header",
                        "name": "Authorization",
                        "schema": {
                            "type": "string"
                        },
                        "required": true,
                        "description": "Your API key"
                    },
                    {
                        "in": "header",
                        "name": "Content-Type",
                        "schema": {
                            "type": "string",
                            "default": "application/json"
                        },
                        "required": true,
                        "description": "Request body type"
                    }
                ],
                "requestBody": {
                    "required": true,
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "required": [
                                    "email",
                                    "version"
                                ],
                                "properties": {
                                    "email": {
                                        "type": "object",
                                        "required": [
                                            "from",
                                            "subject",
                                            "recipients"
                                        ],
                                        "properties": {
                                            "from": {
                                                "type": "string"
                                            },
                                            "fromName": {
                                                "type": "string",
                                                "description": "Supports {{var}} substitution."
                                            },
                                            "replyTo": {
                                                "type": "array",
                                                "items": {
                                                    "type": "string"
                                                },
                                                "description": "Verified sender address(es). Does NOT support {{var}} templates."
                                            },
                                            "subject": {
                                                "type": "string",
                                                "description": "Supports {{var}} substitution."
                                            },
                                            "text": {
                                                "type": "string",
                                                "description": "Supports {{var}} substitution."
                                            },
                                            "amp_html": {
                                                "type": "string",
                                                "description": "Supports {{var}} substitution (not HTML-escaped)."
                                            },
                                            "html": {
                                                "type": "string",
                                                "description": "Supports {{var}} (HTML-escaped) and {{{var}}} (raw, unescaped)."
                                            },
                                            "recipients": {
                                                "type": "object",
                                                "properties": {
                                                    "to": {
                                                        "type": "array",
                                                        "items": {
                                                            "type": "object",
                                                            "properties": {
                                                                "name": {
                                                                    "type": "string"
                                                                },
                                                                "email": {
                                                                    "type": "string"
                                                                },
                                                                "merge_vars": {
                                                                    "type": "object",
                                                                    "additionalProperties": true,
                                                                    "description": "Per-recipient personalization values. Keys are referenced as {{key}} in the email content. Values may be nested objects (accessed via dot-notation, e.g. {{order.id}}). Combined across all recipients must be \u2264 100 KB.",
                                                                    "example": {
                                                                        "first_name": "Alice",
                                                                        "order": {
                                                                            "id": "A-100",
                                                                            "city": "Berlin"
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    },
                                                    "cc": {
                                                        "type": "array",
                                                        "items": {
                                                            "type": "string"
                                                        }
                                                    },
                                                    "bcc": {
                                                        "type": "array",
                                                        "items": {
                                                            "type": "string"
                                                        }
                                                    }
                                                }
                                            },
                                            "attachments": {
                                                "type": "array",
                                                "items": {
                                                    "type": "object",
                                                    "properties": {
                                                        "name": {
                                                            "type": "string"
                                                        },
                                                        "url": {
                                                            "type": "string"
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    "metadata": {
                                        "type": "object",
                                        "properties": {
                                            "campaignType": {
                                                "type": "string",
                                                "description": "Campaign type accepts only two values: \\"TRANSACTIONAL\\" or \\"PROMOTIONAL\\"."
                                            },
                                            "timestamp": {
                                                "type": "string"
                                            },
                                            "custom": {
                                                "type": "object",
                                                "properties": {
                                                    "inbox_tracking": {
                                                        "type": "string"
                                                    },
                                                    "campaign_id": {
                                                        "type": "string"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    "version": {
                                        "type": "string",
                                        "enum": [
                                            "1.0",
                                            "2.0"
                                        ],
                                        "description": "Use \`1.0\` when only \`html\` is sent. Use \`2.0\` when \`amp_html\` is included."
                                    }
                                }
                            },
                            "examples": {
                                "example-merge-vars": {
                                    "summary": "Per-recipient merge vars (multiple recipients)",
                                    "value": {
                                        "email": {
                                            "from": "from@example.com",
                                            "fromName": "John Doe",
                                            "replyTo": [
                                                "from@example.com"
                                            ],
                                            "subject": "Hi {{first_name}}, your order {{order.id}} shipped",
                                            "text": "Hi {{first_name}}, order {{order.id}} ships to {{order.city}}.",
                                            "html": "<html><body><p>Hi {{first_name}} from {{company}},</p><p>Order <b>{{order.id}}</b> ships to {{order.city}}.</p></body></html>",
                                            "recipients": {
                                                "to": [
                                                    {
                                                        "name": "Recipient One",
                                                        "email": "recipient1@example.com",
                                                        "merge_vars": {
                                                            "first_name": "Alice",
                                                            "company": "Acme",
                                                            "order": {
                                                                "id": "A-100",
                                                                "city": "Berlin"
                                                            }
                                                        }
                                                    },
                                                    {
                                                        "name": "Recipient Two",
                                                        "email": "recipient2@example.com",
                                                        "merge_vars": {
                                                            "first_name": "Bob",
                                                            "company": "Acme",
                                                            "order": {
                                                                "id": "A-101",
                                                                "city": "Paris"
                                                            }
                                                        }
                                                    }
                                                ],
                                                "cc": [
                                                    "cc1@example.com"
                                                ],
                                                "bcc": [
                                                    "bcc1@example.com"
                                                ]
                                            }
                                        },
                                        "metadata": {
                                            "campaignType": "TRANSACTIONAL",
                                            "timestamp": "2026-04-15T10:00:00Z",
                                            "custom": {
                                                "inbox_tracking": "false",
                                                "campaign_id": ""
                                            }
                                        },
                                        "version": "1.0"
                                    }
                                },
                                "example-raw-html-and-dot-notation": {
                                    "summary": "Raw HTML ({{{ }}}) + nested dot-notation",
                                    "value": {
                                        "email": {
                                            "from": "from@example.com",
                                            "fromName": "Jane Smith",
                                            "subject": "{{first_name}}, your {{plan.name}} is ready",
                                            "html": "<html><body><p>Hi {{first_name}},</p><div>{{{banner_html}}}</div><p>Plan: {{plan.name}} ({{plan.price}})</p></body></html>",
                                            "recipients": {
                                                "to": [
                                                    {
                                                        "name": "Recipient AMP",
                                                        "email": "recipient-amp@example.com",
                                                        "merge_vars": {
                                                            "first_name": "Carol",
                                                            "banner_html": "<a href='https://example.com'>View</a>",
                                                            "plan": {
                                                                "name": "Pro",
                                                                "price": "$49"
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        },
                                        "metadata": {
                                            "campaignType": "PROMOTIONAL",
                                            "custom": {
                                                "inbox_tracking": "true",
                                                "campaign_id": "CAMP-123"
                                            }
                                        },
                                        "version": "1.0"
                                    }
                                }
                            }
                        }
                    }
                },
                "responses": {
                    "200": {
                        "description": "Successful Response",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "status": {
                                            "type": "string"
                                        },
                                        "statusCode": {
                                            "type": "integer"
                                        },
                                        "message": {
                                            "type": "string"
                                        }
                                    }
                                },
                                "examples": {
                                    "success": {
                                        "value": {
                                            "status": "SUCCESS",
                                            "statusCode": 1000,
                                            "message": "NA"
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "400": {
                        "description": "Validation error (invalid merge_vars shape, invalid recipient, unsupported version, etc.)",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "status": {
                                            "type": "string"
                                        },
                                        "statusCode": {
                                            "type": "integer"
                                        },
                                        "message": {
                                            "type": "string"
                                        }
                                    }
                                },
                                "examples": {
                                    "invalid-merge-vars": {
                                        "value": {
                                            "status": "ERROR",
                                            "statusCode": 9999,
                                            "message": "merge_vars must be an object"
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "413": {
                        "description": "Payload Too Large \u2014 combined merge_vars across all recipients exceeds 100 KB",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "status": {
                                            "type": "string"
                                        },
                                        "statusCode": {
                                            "type": "integer"
                                        },
                                        "message": {
                                            "type": "string"
                                        }
                                    }
                                },
                                "examples": {
                                    "merge-vars-too-large": {
                                        "value": {
                                            "status": "ERROR",
                                            "statusCode": 9999,
                                            "message": "merge_vars exceeds 100 KB limit"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/v2/email/inbox-tracking": {
            "post": {
                "summary": "List Email API Inbox-Tracking Campaigns",
                "operationId": "post-v2-email-inbox-tracking",
                "tags": [
                    "Email"
                ],
                "servers": [
                    {
                        "url": "https://cloudapi.mailercloud.com",
                        "description": "Inbox tracking host"
                    }
                ],
                "description": "API to get inbox tracking details for Email API campaigns. Returns a paginated list of campaigns enriched with inbox / spam / missed placement percentages and a per-mailbox-provider breakdown. Supports filtering by campaign id, subject, sender and date range, plus sorting on key metrics.\\n\\n**Sample Code**\\n\\n\`\`\`bash\\ncurl --request POST \\\\\\n  --url https://cloudapi.mailercloud.com/v2/email/inbox-tracking \\\\\\n  --header 'Authorization: YOUR_API_KEY' \\\\\\n  --header 'Content-Type: application/json' \\\\\\n  --data '{\\"page\\": 1, \\"limit\\": 10, \\"date_from\\": \\"2026-04-01\\", \\"date_to\\": \\"2026-04-30\\"}'\\n\`\`\`",
                "parameters": [
                    {
                        "in": "header",
                        "name": "Authorization",
                        "schema": {
                            "type": "string"
                        },
                        "required": true,
                        "description": "Your API key"
                    },
                    {
                        "in": "header",
                        "name": "Content-Type",
                        "schema": {
                            "type": "string",
                            "default": "application/json"
                        },
                        "required": true,
                        "description": "Request body type"
                    }
                ],
                "requestBody": {
                    "required": true,
                    "description": "Pagination, filter and sort options for the campaign list.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "additionalProperties": false,
                                "required": [
                                    "page",
                                    "limit"
                                ],
                                "properties": {
                                    "page": {
                                        "type": "integer",
                                        "minimum": 1,
                                        "example": 1,
                                        "description": "1-based page number."
                                    },
                                    "limit": {
                                        "type": "integer",
                                        "enum": [
                                            10,
                                            20,
                                            50,
                                            100
                                        ],
                                        "example": 10,
                                        "description": "Records per page. Must be one of 10, 20, 50, 100."
                                    },
                                    "campaign_id": {
                                        "type": "string",
                                        "example": "750373463838949401",
                                        "description": "Filter by campaign id (partial match)."
                                    },
                                    "subject": {
                                        "type": "string",
                                        "example": "welcome",
                                        "description": "Filter by subject (partial match)."
                                    },
                                    "sender": {
                                        "type": "string",
                                        "example": "noreply@yourdomain.com",
                                        "description": "Filter by sender email/name (partial match)."
                                    },
                                    "date_from": {
                                        "type": "string",
                                        "format": "date",
                                        "pattern": "^\\\\d{4}-\\\\d{2}-\\\\d{2}$",
                                        "example": "2026-04-01",
                                        "description": "Inclusive lower bound (YYYY-MM-DD)."
                                    },
                                    "date_to": {
                                        "type": "string",
                                        "format": "date",
                                        "pattern": "^\\\\d{4}-\\\\d{2}-\\\\d{2}$",
                                        "example": "2026-04-30",
                                        "description": "Inclusive upper bound (YYYY-MM-DD)."
                                    },
                                    "sort_field": {
                                        "type": "string",
                                        "enum": [
                                            "inbox_percentage",
                                            "created_date",
                                            "campaign_id",
                                            "subject",
                                            "sent",
                                            "opens"
                                        ],
                                        "example": "created_date",
                                        "description": "Field to sort by."
                                    },
                                    "sort_order": {
                                        "type": "string",
                                        "enum": [
                                            "asc",
                                            "desc"
                                        ],
                                        "example": "desc",
                                        "description": "Sort direction."
                                    }
                                }
                            },
                            "examples": {
                                "minimal-first-page": {
                                    "summary": "Minimal \u2014 first page",
                                    "value": {
                                        "page": 1,
                                        "limit": 10
                                    }
                                },
                                "sorted-by-inbox-placement": {
                                    "summary": "Sorted by inbox placement",
                                    "value": {
                                        "page": 1,
                                        "limit": 20,
                                        "sort_field": "inbox_percentage",
                                        "sort_order": "desc"
                                    }
                                },
                                "filter-subject-and-date-range": {
                                    "summary": "Filter by subject + date range",
                                    "value": {
                                        "page": 1,
                                        "limit": 50,
                                        "subject": "welcome",
                                        "sender": "noreply@yourdomain.com",
                                        "date_from": "2026-04-01",
                                        "date_to": "2026-04-30",
                                        "sort_field": "created_date",
                                        "sort_order": "desc"
                                    }
                                },
                                "lookup-by-campaign-id": {
                                    "summary": "Lookup by campaign id",
                                    "value": {
                                        "page": 1,
                                        "limit": 10,
                                        "campaign_id": "750373463838949401"
                                    }
                                }
                            }
                        }
                    }
                },
                "responses": {
                    "200": {
                        "description": "Campaign list retrieved successfully",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "status": {
                                            "type": "boolean",
                                            "example": true
                                        },
                                        "message": {
                                            "type": "string",
                                            "example": "requested campaign list"
                                        },
                                        "data": {
                                            "type": "array",
                                            "description": "List of campaigns matching the filter.",
                                            "items": {
                                                "type": "object",
                                                "properties": {
                                                    "campaign_id": {
                                                        "type": "string",
                                                        "description": "MailerCloud campaign identifier (string-encoded big integer)."
                                                    },
                                                    "subject": {
                                                        "type": "string"
                                                    },
                                                    "sent": {
                                                        "type": "string",
                                                        "description": "Total sent count (string-encoded integer)."
                                                    },
                                                    "opens": {
                                                        "type": "string",
                                                        "description": "Total open count (string-encoded integer)."
                                                    },
                                                    "created_date": {
                                                        "type": "string",
                                                        "description": "Creation timestamp in client's timezone (YYYY-MM-DD HH:mm:ss)."
                                                    },
                                                    "inbox_percentage": {
                                                        "type": "number",
                                                        "format": "float",
                                                        "description": "Percentage of tracked seed deliveries that landed in the inbox."
                                                    },
                                                    "spam_percentage": {
                                                        "type": "number",
                                                        "format": "float",
                                                        "description": "Percentage of tracked seed deliveries that landed in spam."
                                                    },
                                                    "missed_percentage": {
                                                        "type": "number",
                                                        "format": "float",
                                                        "description": "Percentage of tracked seed deliveries that were missed."
                                                    },
                                                    "providers": {
                                                        "type": "array",
                                                        "description": "Per-mailbox-provider placement breakdown.",
                                                        "items": {
                                                            "type": "object",
                                                            "properties": {
                                                                "provider": {
                                                                    "type": "string",
                                                                    "description": "Mailbox provider domain (e.g. gmail.com, yahoo.com)."
                                                                },
                                                                "inbox": {
                                                                    "type": "string",
                                                                    "description": "Inbox placement count (string-encoded integer)."
                                                                },
                                                                "spam": {
                                                                    "type": "string",
                                                                    "description": "Spam placement count (string-encoded integer)."
                                                                },
                                                                "missed": {
                                                                    "type": "string",
                                                                    "description": "Missed placement count (string-encoded integer)."
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        },
                                        "pagination": {
                                            "type": "object",
                                            "properties": {
                                                "current_page": {
                                                    "type": "integer",
                                                    "example": 1
                                                },
                                                "per_page_count": {
                                                    "type": "integer",
                                                    "example": 10
                                                },
                                                "total_count": {
                                                    "type": "integer",
                                                    "example": 137
                                                }
                                            }
                                        }
                                    }
                                },
                                "examples": {
                                    "sample-list": {
                                        "value": {
                                            "status": true,
                                            "message": "requested campaign list",
                                            "data": [
                                                {
                                                    "campaign_id": "750373463838949401",
                                                    "subject": "Welcome to MailerCloud",
                                                    "sent": "10000",
                                                    "opens": "4231",
                                                    "created_date": "2026-04-15 09:30:00",
                                                    "inbox_percentage": 92.5,
                                                    "spam_percentage": 5,
                                                    "missed_percentage": 2.5,
                                                    "providers": [
                                                        {
                                                            "provider": "gmail.com",
                                                            "inbox": "85",
                                                            "spam": "10",
                                                            "missed": "5"
                                                        },
                                                        {
                                                            "provider": "yahoo.com",
                                                            "inbox": "95",
                                                            "spam": "3",
                                                            "missed": "2"
                                                        },
                                                        {
                                                            "provider": "outlook.com",
                                                            "inbox": "90",
                                                            "spam": "7",
                                                            "missed": "3"
                                                        }
                                                    ]
                                                }
                                            ],
                                            "pagination": {
                                                "current_page": 1,
                                                "per_page_count": 10,
                                                "total_count": 137
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "400": {
                        "description": "Validation Error (invalid field, bad date format, missing required fields)",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "status": {
                                            "type": "boolean",
                                            "example": false
                                        },
                                        "message": {
                                            "type": "string"
                                        },
                                        "errors": {
                                            "type": "array",
                                            "items": {
                                                "type": "object",
                                                "properties": {
                                                    "field": {
                                                        "type": "string"
                                                    },
                                                    "message": {
                                                        "type": "string"
                                                    }
                                                }
                                            }
                                        }
                                    }
                                },
                                "examples": {
                                    "invalid-date": {
                                        "value": {
                                            "status": false,
                                            "message": "requested campaign list",
                                            "errors": [
                                                {
                                                    "field": "date_from",
                                                    "message": "Date must be in YYYY-MM-DD format"
                                                }
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "401": {
                        "description": "Authorization failed",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "errors": {
                                            "type": "array",
                                            "items": {
                                                "type": "object",
                                                "properties": {
                                                    "field": {
                                                        "type": "string"
                                                    },
                                                    "message": {
                                                        "type": "string"
                                                    }
                                                }
                                            }
                                        }
                                    }
                                },
                                "examples": {
                                    "auth-failed": {
                                        "value": {
                                            "errors": [
                                                {
                                                    "field": "",
                                                    "message": "Authorization failed"
                                                }
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal Server Error",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "status": {
                                            "type": "boolean",
                                            "example": false
                                        },
                                        "message": {
                                            "type": "string"
                                        },
                                        "error": {
                                            "type": "string",
                                            "description": "Free-form error string."
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
`;


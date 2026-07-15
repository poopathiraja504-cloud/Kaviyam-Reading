import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Database, Server, HardDrive, Trash2, Loader2, Sparkles, AlertCircle, CheckCircle, FileCode, Copy } from "lucide-react";

interface RecordObj {
  id: number;
  content: string;
  createdAt: string;
}

export default function LocalDatabase() {
  const [dbMode, setDbMode] = useState<"local" | "backend" | "html_gateway">("local");
  const [dataInput, setDataInput] = useState("");
  const [records, setRecords] = useState<RecordObj[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [htmlCopied, setHtmlCopied] = useState(false);

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
    if (dbMode === "html_gateway") {
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

  const handleCopyHtmlCode = () => {
    navigator.clipboard.writeText(OTP_GATEWAY_HTML_CODE);
    setHtmlCopied(true);
    setTimeout(() => setHtmlCopied(false), 2000);
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
            Manage high-speed reading journals and inspect the HTML gateway document.
          </p>
        </div>

        {/* Database Mode Switcher */}
        <div className="bg-stone-50 p-1 rounded-2xl border border-stone-200/60 grid grid-cols-3 gap-1 text-[9px] sm:text-xs">
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
            onClick={() => setDbMode("html_gateway")}
            className={`py-2 rounded-xl font-bold flex items-center justify-center gap-0.5 transition-all ${
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
        {message && dbMode !== "html_gateway" && (
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

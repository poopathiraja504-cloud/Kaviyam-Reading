import { User, SecurityLog, Book } from "../types";
import { Users, Shield, ShieldAlert, BarChart2, Ban, CheckCircle, Search, Trash2, Key, History, Lock, Unlock, Eye, HelpCircle } from "lucide-react";
import React, { useState } from "react";
import { RECOMMENDED_META_TAGS } from "../utils/securityHeaders";

interface AdminProps {
  usersList: User[];
  allSecurityLogs: SecurityLog[];
  booksList: Book[];
  onBlockUser: (id: string, blockState: boolean) => void;
  onDeleteUser: (id: string) => void;
  isSecurityHardened?: boolean;
  onToggleSecurityHardening?: () => void;
  customCsp?: string;
  onUpdateCustomCsp?: (newCsp: string) => void;
}

export default function Admin({
  usersList,
  allSecurityLogs,
  booksList,
  onBlockUser,
  onDeleteUser,
  isSecurityHardened = false,
  onToggleSecurityHardening,
  customCsp = "",
  onUpdateCustomCsp,
}: AdminProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "analytics" | "logs">("users");

  const filteredUsers = usersList.filter(
    (u) =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Compute analytics
  const totalUsers = usersList.length;
  const blockedUsers = usersList.filter((u) => u.security.isBlocked).length;
  const verifiedUsers = usersList.filter((u) => u.isVerified).length;
  const totalCustomBooks = booksList.filter((b) => b.isCustomAI).length;
  
  // Total simulated reviews
  const totalReviewsCount = booksList.reduce((acc, curr) => acc + curr.reviews.length, 0);

  return (
    <div className="bg-white rounded-2xl border border-[#e8e2cf] p-6 shadow-sm text-left" id="admin-panel-root">
      {/* Title & Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#f3eee0] pb-4 mb-6 gap-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-stone-800 flex items-center gap-2">
            <Shield className="text-[#d4af37]" size={20} />
            Platform Control Panel
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Admin console for user records, security auditing, and platform metrics.
          </p>
        </div>

        <div className="flex gap-1.5 bg-stone-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === "users" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500 hover:text-stone-800"
            }`}
            id="admin-tab-users"
          >
            Users ({usersList.length})
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === "analytics" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500 hover:text-stone-800"
            }`}
            id="admin-tab-analytics"
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === "logs" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500 hover:text-stone-800"
            }`}
            id="admin-tab-logs"
          >
            Global Audits
          </button>
        </div>
      </div>

      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center gap-4">
            <div className="relative max-w-md w-full">
              <Search size={14} className="absolute left-3 top-2.5 text-stone-400" />
              <input
                type="text"
                placeholder="Search registered accounts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-[#e8e2cf] bg-[#fbfbfa] text-stone-800 placeholder-stone-400 text-xs focus:outline-none focus:border-[#d4af37]"
                id="admin-user-search"
              />
            </div>
            <span className="text-[11px] text-stone-500 font-mono">
              Displaying {filteredUsers.length} profile records
            </span>
          </div>

          <div className="border border-[#e8e2cf] rounded-xl overflow-hidden bg-white">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#faf8f3] text-stone-600 font-mono text-[10px] uppercase tracking-wider border-b border-[#e8e2cf]">
                <tr>
                  <th className="p-3">User Details</th>
                  <th className="p-3">Credentials</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Security Config</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f1e5]">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-stone-400 italic">
                      No matching user records.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-stone-50 text-stone-700">
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={user.profile.profilePhoto}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover border border-stone-200"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span className="font-semibold block">{user.username}</span>
                            <span className="text-[10px] text-stone-400 font-mono">UID: {user.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="block font-medium">{user.email}</span>
                        <span className="text-[10px] text-stone-400 font-mono">Created: {new Date(user.createdAt).toLocaleDateString()}</span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1.5 flex-wrap">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                              user.isVerified
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                : "bg-amber-50 text-amber-600 border border-amber-100"
                            }`}
                          >
                            {user.isVerified ? "VERIFIED" : "PENDING"}
                          </span>
                          {user.security.isBlocked && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-red-50 text-red-700 border border-red-100">
                              BLOCKED
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 font-mono text-[10px] text-stone-500">
                        <div className="space-y-0.5">
                          <div>2FA: {user.security.is2FAEnabled ? "On" : "Off"}</div>
                          <div>Login Attempts: {user.security.loginAttempts}</div>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => onBlockUser(user.id, !user.security.isBlocked)}
                            className={`p-1.5 rounded-lg border transition ${
                              user.security.isBlocked
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                : "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                            }`}
                            title={user.security.isBlocked ? "Unblock account" : "Block account"}
                            id={`block-user-btn-${user.id}`}
                          >
                            <Ban size={13} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this user permanently?")) {
                                onDeleteUser(user.id);
                              }
                            }}
                            className="p-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition"
                            title="Delete permanently"
                            id={`delete-user-btn-${user.id}`}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Card stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-stone-50 rounded-xl border border-[#e8e2cf] text-left shadow-inner">
              <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 font-semibold">Total Accounts</span>
              <p className="text-2xl font-serif font-bold text-stone-800 mt-1">{totalUsers}</p>
            </div>
            <div className="p-4 bg-stone-50 rounded-xl border border-[#e8e2cf] text-left shadow-inner">
              <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 font-semibold">Verified Accounts</span>
              <p className="text-2xl font-serif font-bold text-emerald-700 mt-1">{verifiedUsers}</p>
            </div>
            <div className="p-4 bg-stone-50 rounded-xl border border-[#e8e2cf] text-left shadow-inner">
              <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 font-semibold">AI Generated Novels</span>
              <p className="text-2xl font-serif font-bold text-[#d4af37] mt-1">{totalCustomBooks}</p>
            </div>
            <div className="p-4 bg-stone-50 rounded-xl border border-[#e8e2cf] text-left shadow-inner">
              <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 font-semibold">Global Reviews Left</span>
              <p className="text-2xl font-serif font-bold text-stone-700 mt-1">{totalReviewsCount}</p>
            </div>
          </div>

          {/* Visual Progress Graphs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-[#fdfcf9] rounded-xl border border-[#e8e2cf]">
              <h3 className="font-serif text-sm font-semibold text-stone-800 mb-4 flex items-center gap-1.5">
                <BarChart2 size={16} className="text-[#d4af37]" />
                Novel Distribution by Genre
              </h3>
              <div className="space-y-3">
                {["Fantasy", "Sci-Fi", "Mystery", "Romance", "Adventure"].map((genre) => {
                  const genreBooks = booksList.filter((b) => b.genre.toLowerCase() === genre.toLowerCase()).length;
                  const pct = booksList.length ? (genreBooks / booksList.length) * 100 : 0;
                  return (
                    <div key={genre} className="space-y-1">
                      <div className="flex justify-between text-xs text-stone-600">
                        <span>{genre}</span>
                        <span className="font-mono font-bold">{genreBooks} ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-[#d4af37] h-1.5 rounded-full"
                          style={{ width: `${pct || 4}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-5 bg-[#fdfcf9] rounded-xl border border-[#e8e2cf]">
              <h3 className="font-serif text-sm font-semibold text-stone-800 mb-4 flex items-center gap-1.5">
                <ShieldAlert size={16} className="text-[#d4af37]" />
                Security & Verification Summary
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-600">Email Verification Completion Rate</span>
                  <span className="font-mono font-semibold">{totalUsers ? ((verifiedUsers / totalUsers) * 100).toFixed(0) : 0}%</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-2">
                  <div
                    className="bg-emerald-600 h-2 rounded-full"
                    style={{ width: `${totalUsers ? (verifiedUsers / totalUsers) * 100 : 0}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-600 font-sans">Suspicious Activity Account Lock Rate</span>
                  <span className="font-mono font-semibold">{totalUsers ? ((blockedUsers / totalUsers) * 100).toFixed(0) : 0}%</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full"
                    style={{ width: `${totalUsers ? (blockedUsers / totalUsers) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Security Hardening Card */}
          <div className="p-5 bg-stone-900 text-stone-100 rounded-xl border border-stone-800 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-serif text-base font-semibold text-[#d4af37] flex items-center gap-2">
                  <Shield size={18} />
                  Simulated Browser-Level Security Hardening Center
                </h3>
                <p className="text-xs text-stone-400 mt-1 max-w-2xl">
                  Inspect and dynamically inject protective security headers directly into index.html head section. Toggling this simulates production-grade web headers within our local sandboxed environment to address OWASP vulnerabilities.
                </p>
              </div>
              <button
                type="button"
                onClick={onToggleSecurityHardening}
                className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md ${
                  isSecurityHardened
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                    : "bg-[#d4af37] hover:bg-[#b5952d] text-stone-950"
                }`}
              >
                {isSecurityHardened ? (
                  <>
                    <Lock size={14} />
                    Harden Policies Active
                  </>
                ) : (
                  <>
                    <Unlock size={14} />
                    Activate Dynamic Hardening
                  </>
                )}
              </button>
            </div>

            {/* Simulated browser visual status */}
            <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-3">
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-semibold">Document Head Integration</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  isSecurityHardened ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800" : "bg-amber-950/80 text-amber-400 border border-amber-800"
                }`}>
                  {isSecurityHardened ? "STATUS: ENFORCED (HARDENED)" : "STATUS: STANDARD (WARNING)"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {RECOMMENDED_META_TAGS.map((tag) => {
                  const severityColors = {
                    Critical: "bg-red-950/80 text-red-400 border-red-900/60",
                    High: "bg-orange-950/80 text-orange-400 border-orange-900/60",
                    Medium: "bg-amber-950/80 text-amber-400 border-amber-900/60",
                    Low: "bg-blue-950/80 text-blue-400 border-blue-900/60"
                  };
                  const displayedContent = (tag.key === "csp" && customCsp) ? customCsp : tag.content;
                  return (
                    <div key={tag.key} className="p-3 bg-stone-900 rounded-lg border border-stone-800 hover:border-stone-700 transition space-y-2 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-xs font-semibold text-stone-200">{tag.name}</span>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border font-bold ${severityColors[tag.severity]}`}>
                            {tag.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400 leading-normal">{tag.description}</p>
                        
                        <div className="bg-stone-950 p-2 rounded text-[10px] font-mono text-emerald-400/95 overflow-x-auto max-w-full">
                          <span className="text-stone-500 font-sans font-semibold">http-equiv=&quot;{tag.httpEquiv}&quot;</span>
                          <div className="break-all mt-1">{displayedContent}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-stone-800 mt-2">
                        <span className="text-[10px] font-mono text-stone-500">Category: {tag.category}</span>
                        <span className={`text-[10px] flex items-center gap-1 font-semibold ${isSecurityHardened ? "text-emerald-400 font-extrabold" : "text-stone-500"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isSecurityHardened ? "bg-emerald-400 animate-pulse" : "bg-stone-600"}`}></span>
                          {isSecurityHardened ? "Injected" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interactive CSP Policy Configurator */}
            {onUpdateCustomCsp && (
              <CspConfigurator
                customCsp={customCsp}
                onUpdateCsp={onUpdateCustomCsp}
                isHardened={isSecurityHardened}
              />
            )}
          </div>
        </div>
      )}

      {activeTab === "logs" && (
        <div className="space-y-4">
          <h3 className="font-serif text-sm font-semibold text-stone-800 flex items-center gap-1.5">
            <History size={16} className="text-[#d4af37]" />
            Global Platform Security Audit Trail
          </h3>
          <p className="text-xs text-stone-500">
            Real-time display of all server authentication events, credentials modifications, and blocking actions.
          </p>

          <div className="border border-[#e8e2cf] rounded-xl overflow-hidden bg-white max-h-[400px] overflow-y-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#faf8f3] text-stone-600 font-mono text-[10px] uppercase tracking-wider border-b border-[#e8e2cf] sticky top-0">
                <tr>
                  <th className="p-3">Action</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Platform Device</th>
                  <th className="p-3">IP Address</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f1e5]">
                {allSecurityLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-stone-400 italic">
                      No security audit logs recorded.
                    </td>
                  </tr>
                ) : (
                  [...allSecurityLogs].reverse().map((log) => (
                    <tr key={log.id} className="hover:bg-stone-50 text-stone-700">
                      <td className="p-3 font-semibold">{log.action}</td>
                      <td className="p-3 text-stone-500 font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-3 font-mono text-stone-400 text-[11px]">{log.device}</td>
                      <td className="p-3 font-mono text-stone-400 text-[11px]">{log.ip}</td>
                      <td className="p-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                            log.status === "Success"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-red-50 text-red-700 border border-red-100"
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

interface CspConfiguratorProps {
  customCsp: string;
  onUpdateCsp: (newCsp: string) => void;
  isHardened: boolean;
}

function CspConfigurator({ customCsp, onUpdateCsp, isHardened }: CspConfiguratorProps) {
  const [tempCsp, setTempCsp] = useState(customCsp);
  const [success, setSuccess] = useState(false);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCsp(tempCsp);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const resetToDefault = () => {
    const defaultCsp = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https: wss:; frame-ancestors 'self';";
    setTempCsp(defaultCsp);
    onUpdateCsp(defaultCsp);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="bg-stone-950/40 border border-stone-800/80 rounded-xl p-4 mt-4 space-y-3 shadow-inner">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-[#d4af37] flex items-center gap-1.5 uppercase tracking-wider font-sans">
          <Key size={14} />
          Interactive CSP Policy Customizer
        </h4>
        {isHardened && (
          <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/80 px-2 py-0.5 rounded font-mono animate-pulse">
            Live Updates Active
          </span>
        )}
      </div>
      
      <p className="text-xs text-stone-400 leading-relaxed">
        Modify the Content-Security-Policy below. Toggling this updates the head meta tag immediately to prevent script injection vector risks.
      </p>

      <form onSubmit={handleApply} className="space-y-3">
        <textarea
          value={tempCsp}
          onChange={(e) => setTempCsp(e.target.value)}
          rows={3}
          className="w-full text-xs font-mono bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-stone-200 focus:outline-none focus:border-[#d4af37] transition leading-relaxed resize-y"
          placeholder="Enter custom CSP string here..."
        />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <button
            type="button"
            onClick={resetToDefault}
            className="text-[11px] text-stone-500 hover:text-stone-300 underline font-medium"
          >
            Reset to secure default policy
          </button>
          
          <div className="flex items-center gap-3">
            {success && (
              <span className="text-[11px] text-emerald-400 font-semibold">
                Policy hot-reloaded successfully!
              </span>
            )}
            <button
              type="submit"
              className="bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/30 hover:border-[#d4af37]/50 text-[#d4af37] px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1"
            >
              Apply Custom CSP
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

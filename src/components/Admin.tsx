import React, { useState } from "react";
import { Shield, Users, BookOpen, Lock, AlertTriangle, CheckCircle, Ban, Trash2 } from "lucide-react";
import { User, Book, SecurityLog } from "../types";

interface AdminProps {
  usersList: User[];
  allSecurityLogs: SecurityLog[];
  booksList: Book[];
  onBlockUser: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  isSecurityHardened: boolean;
  onToggleSecurityHardening: () => void;
  customCsp: string;
  onUpdateCustomCsp: (csp: string) => void;
}

export default function Admin({
  usersList,
  allSecurityLogs,
  booksList,
  onBlockUser,
  onDeleteUser,
  isSecurityHardened,
  onToggleSecurityHardening,
  customCsp,
  onUpdateCustomCsp,
}: AdminProps) {
  const [activeTab, setActiveTab] = useState<"users" | "security" | "books">("users");

  return (
    <div className="space-y-6 font-sans pb-12 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-[#3B0B12] text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-amber-400" />
            <h2 className="font-serif font-bold text-2xl text-amber-50">
              Kaviyam Admin Security Control Panel
            </h2>
          </div>
          <p className="text-xs text-stone-300 mt-1">
            System management, security hardening, user audit, and CSP header policies
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSecurityHardening}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-md ${
              isSecurityHardened
                ? "bg-emerald-500 text-white"
                : "bg-amber-500 text-stone-950 hover:bg-amber-400"
            }`}
          >
            {isSecurityHardened ? "Security Hardened ✅" : "Enable Hardening 🔒"}
          </button>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex gap-2 border-b border-[#E2DDD5] pb-2">
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === "users" ? "bg-[#5C121E] text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
          }`}
        >
          Users Management ({usersList.length})
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === "security" ? "bg-[#5C121E] text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
          }`}
        >
          Security Audit Logs ({allSecurityLogs.length})
        </button>
        <button
          onClick={() => setActiveTab("books")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === "books" ? "bg-[#5C121E] text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
          }`}
        >
          Books Inventory ({booksList.length})
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="rounded-3xl bg-white border border-[#E2DDD5] shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Email</th>
                <th className="p-4">Verified</th>
                <th className="p-4">Auth Method</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {usersList.map((u) => (
                <tr key={u.id} className="hover:bg-stone-50">
                  <td className="p-4 font-semibold text-stone-900 flex items-center gap-2">
                    <img
                      src={
                        u.profile?.profilePhoto ||
                        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"
                      }
                      alt={u.username}
                      className="w-7 h-7 rounded-full object-cover border"
                    />
                    <span>{u.username}</span>
                  </td>
                  <td className="p-4 text-stone-600 font-mono text-[11px]">{u.email}</td>
                  <td className="p-4 font-semibold">
                    {u.isVerified ? (
                      <span className="text-emerald-600">Verified</span>
                    ) : (
                      <span className="text-amber-600">Pending</span>
                    )}
                  </td>
                  <td className="p-4 text-stone-500">Firebase Auth</td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => onBlockUser(u.id)}
                      className="p-1.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold"
                      title="Block User"
                    >
                      <Ban className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Security Logs Tab */}
      {activeTab === "security" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-[#E2DDD5] space-y-2">
            <h4 className="font-bold text-xs text-stone-900">Content Security Policy (CSP) Policy</h4>
            <input
              type="text"
              value={customCsp}
              onChange={(e) => onUpdateCustomCsp(e.target.value)}
              className="w-full p-2 bg-stone-50 border rounded text-xs font-mono"
            />
          </div>

          <div className="rounded-3xl bg-white border border-[#E2DDD5] shadow-sm p-4 space-y-2">
            <h4 className="font-bold text-xs text-stone-900">Audit Logs</h4>
            {allSecurityLogs.length === 0 ? (
              <p className="text-xs text-stone-500 py-4">No critical security flags detected.</p>
            ) : (
              <div className="space-y-2">
                {allSecurityLogs.map((log, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-stone-50 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-stone-900">{log.action}</span>
                      <p className="text-[10px] text-stone-500">{log.timestamp}</p>
                    </div>
                    <span className="font-mono text-[10px] text-stone-600">{log.ip || "127.0.0.1"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Books Tab */}
      {activeTab === "books" && (
        <div className="rounded-3xl bg-white border border-[#E2DDD5] p-6 space-y-4">
          <h4 className="font-bold text-sm text-[#3B0B12]">System Books Directory ({booksList.length})</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {booksList.map((b) => (
              <div key={b.id} className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex items-center gap-3">
                <img src={b.coverUrl} alt={b.title} className="w-10 h-14 object-cover rounded shadow" />
                <div>
                  <p className="font-bold text-stone-900">{b.title}</p>
                  <p className="text-[10px] text-stone-500">{b.author}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

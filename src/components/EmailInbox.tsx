import { SimulatedEmail } from "../types";
import { Mail, MailOpen, Trash2, Search, ExternalLink, Calendar, Shield, Inbox } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface EmailInboxProps {
  emails: SimulatedEmail[];
  onReadEmail: (id: string) => void;
  onDeleteEmail: (id: string) => void;
  onTriggerLink: (linkAction: string, params: any) => void;
}

export default function EmailInbox({ emails, onReadEmail, onDeleteEmail, onTriggerLink }: EmailInboxProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEmails = emails.filter(
    (email) =>
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedEmail = emails.find((e) => e.id === selectedId);

  // Helper to extract links from simulated body and make them clickable buttons
  const parseSimulatedLinks = (body: string) => {
    // Looks for patterns like [Action: ResetPassword; token=1234] or [Action: VerifyEmail; email=test@test.com]
    const linkRegex = /\[Action:\s*([a-zA-Z0-9]+);\s*([^\]]+)\]/g;
    const matches = [...body.matchAll(linkRegex)];

    if (matches.length === 0) return null;

    return matches.map((match, idx) => {
      const action = match[1];
      const paramStr = match[2];
      const params: any = {};
      
      paramStr.split(";").forEach((pair) => {
        const [k, v] = pair.split("=").map((s) => s.trim());
        if (k && v) params[k] = v;
      });

      let btnLabel = "Click Action Link";
      if (action === "VerifyEmail") btnLabel = "Verify Email Address";
      if (action === "ResetPassword") btnLabel = "Reset Password";

      return (
        <button
          key={idx}
          onClick={() => {
            onTriggerLink(action, params);
            // Mark as read
            if (selectedId) onReadEmail(selectedId);
          }}
          className="mt-4 flex items-center gap-2 bg-[#d4af37] hover:bg-[#c19b2e] text-black font-semibold px-4 py-2 rounded-lg text-sm transition shadow-sm border border-[#bfa030]"
          id={`email-action-btn-${idx}`}
        >
          <ExternalLink size={16} />
          {btnLabel}
        </button>
      );
    });
  };

  // Format clean body without raw markdown links
  const getCleanBody = (body: string) => {
    return body.replace(/\[Action:\s*[a-zA-Z0-9]+;\s*[^\]]+\]/g, "");
  };

  return (
    <div className="bg-[#fdfcf7] min-h-[500px] rounded-xl border border-[#e8e2cf] overflow-hidden grid grid-cols-1 md:grid-cols-12 shadow-sm" id="email-inbox-root">
      {/* List Panel */}
      <div className="md:col-span-5 border-r border-[#e8e2cf] flex flex-col h-[600px] bg-white">
        <div className="p-4 border-b border-[#e8e2cf] bg-[#fcfbfa]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-serif text-lg font-semibold text-stone-800 flex items-center gap-2">
              <Inbox size={18} className="text-[#d4af37]" />
              Simulated Mailbox
            </h3>
            <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-mono">
              {emails.filter((e) => !e.read).length} unread
            </span>
          </div>
          <p className="text-xs text-stone-500 mb-3 leading-relaxed">
            This workspace sandbox captures all simulated outbound verification, alert, and newsletter emails.
          </p>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search captured emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-[#e8e2cf] bg-[#fbfbfa] text-stone-800 placeholder-stone-400 text-xs focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
              id="email-search-input"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#f5f1e5]">
          {filteredEmails.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-stone-400 h-full">
              <Mail size={32} className="stroke-1 mb-2 text-stone-300" />
              <p className="text-xs font-serif">No messages captured</p>
              <p className="text-[10px] text-center mt-1">Try signing up, changing credentials, or triggering alerts.</p>
            </div>
          ) : (
            filteredEmails.map((email) => {
              const isSelected = email.id === selectedId;
              return (
                <div
                  key={email.id}
                  onClick={() => {
                    setSelectedId(email.id);
                    onReadEmail(email.id);
                  }}
                  className={`p-3 cursor-pointer transition text-left relative ${
                    isSelected ? "bg-[#fdfcf5]" : "hover:bg-[#fbfbfa]"
                  } ${!email.read ? "border-l-4 border-l-[#d4af37]" : ""}`}
                  id={`email-item-${email.id}`}
                >
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <span className="text-[10px] uppercase tracking-wider font-mono bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">
                      {email.category}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      {new Date(email.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h4 className={`text-xs font-medium text-stone-800 line-clamp-1 ${!email.read ? "font-semibold" : ""}`}>
                    {email.subject}
                  </h4>
                  <p className="text-[11px] text-stone-500 line-clamp-2 mt-1">
                    {getCleanBody(email.body)}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Reader Panel */}
      <div className="md:col-span-7 flex flex-col h-[600px] bg-[#fdfbf7]">
        {selectedEmail ? (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-[#e8e2cf] bg-white flex justify-between items-center">
              <div>
                <h3 className="font-serif text-sm font-semibold text-stone-800">
                  {selectedEmail.subject}
                </h3>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-stone-500 font-mono">
                  <span>To: {selectedEmail.recipient || "rajaboopathi1021@gmail.com"}</span>
                  <span>•</span>
                  <span>{new Date(selectedEmail.sentAt).toLocaleString()}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  onDeleteEmail(selectedEmail.id);
                  setSelectedId(null);
                }}
                className="text-stone-400 hover:text-red-600 p-1.5 hover:bg-stone-50 rounded-lg transition"
                title="Delete email"
                id="delete-email-btn"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 p-6 overflow-y-auto bg-[#faf8f2]">
              <div className="bg-white rounded-xl border border-[#e8e2cf] p-6 shadow-sm max-w-xl mx-auto">
                {/* Brand Header */}
                <div className="flex items-center justify-between border-b border-[#f3eee0] pb-4 mb-4">
                  <span className="font-serif font-bold text-stone-800 tracking-tight text-sm flex items-center gap-1.5">
                    📖 <span className="text-[#d4af37]">Kaviyam</span> Reading
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono flex items-center gap-1">
                    <Shield size={10} /> Secure Service Mail
                  </span>
                </div>

                {/* Email Content */}
                <div className="text-xs text-stone-700 leading-relaxed space-y-3 whitespace-pre-line font-serif">
                  {getCleanBody(selectedEmail.body)}
                </div>

                {/* Interactive Action Buttons */}
                {parseSimulatedLinks(selectedEmail.body)}

                {/* Brand Footer */}
                <div className="border-t border-[#f3eee0] pt-4 mt-6 text-center">
                  <p className="text-[10px] text-stone-400 font-sans leading-relaxed">
                    This is an automated system email from Kaviyam Reading Platform.<br />
                    Built securely in AI Studio Sandbox.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-stone-400 p-8">
            <MailOpen size={36} className="stroke-1 mb-2 text-stone-300 animate-pulse" />
            <p className="text-xs font-serif">No message selected</p>
            <p className="text-[10px] text-center mt-1">Select an email from the left sidebar to read or activate action links.</p>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { Language, translations } from "../utils/i18n";
import { AppNotification } from "../types";
import { 
  Bell, 
  Check, 
  CheckCheck, 
  BookOpen, 
  Sparkles, 
  Trash2, 
  X, 
  Layers,
  ShieldCheck
} from "lucide-react";

interface NotificationsModalProps {
  lang: Language;
  onClose: () => void;
  onSelectNotification?: (actionUrl?: string) => void;
}

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-1",
    title: "New Chapters Added: Ponniyin Selvan",
    titleTa: "பொன்னியின் செல்வன்: புதிய அத்தியாயங்கள் சேர்க்கப்பட்டன",
    message: "Chapters 1 to 5 of Kalki's iconic Ponniyin Selvan are now available in Tamil with voice narration.",
    messageTa: "கல்கியின் அமர காவியமான பொன்னியின் செல்வனின் முதல் 5 அத்தியாயங்கள் ஒலி வாசிப்புடன் இணைக்கப்பட்டுள்ளன.",
    time: "10m ago",
    category: "novel",
    read: false,
  },
  {
    id: "notif-2",
    title: "Daily Reading Streak Maintained!",
    titleTa: "வாசிப்பு இலக்கு சாதனை!",
    message: "Congratulations! You read for 25 minutes today. Keep exploring classical Tamil literature.",
    messageTa: "வாழ்த்துக்கள்! இன்று 25 நிமிடங்கள் தமிழ் நூல்களை வாசித்து புதிய சாதனை படைத்துள்ளீர்கள்.",
    time: "2h ago",
    category: "reading",
    read: false,
  },
  {
    id: "notif-3",
    title: "Kaviyam Templates & Themes Live",
    titleTa: "புதிய காவியம் வடிவங்கள் & பின்னணிகள் அறிமுகம்",
    message: "Try the new Classic Ivory Reader and Midnight Deep Library design templates now.",
    messageTa: "காவியம் வாசிப்பு தளத்தில் புதிய வடிவமைப்புகள் மற்றும் சோழர் காலப் பின்னணிகளைப் பயன்படுத்திப் பாருங்கள்.",
    time: "1d ago",
    category: "system",
    read: true,
  },
  {
    id: "notif-4",
    title: "Tamil Sangam Poetry Digest Available",
    titleTa: "சங்க இலக்கியச் சாரல் வெளியீடு",
    message: "Read selected verses from Kurunthokai and Natrinai with contemporary translations.",
    messageTa: "குறுந்தொகை, நற்றிணைப் பாடல்களின் எளிய உரைத் தொகுப்பு நூலகத்தில் கிடைக்கிறது.",
    time: "2d ago",
    category: "community",
    read: true,
  }
];

export default function NotificationsModal({
  lang,
  onClose,
  onSelectNotification,
}: NotificationsModalProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const stored = localStorage.getItem("kaviyam_notifications");
      return stored ? JSON.parse(stored) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const saveNotifications = (updated: AppNotification[]) => {
    setNotifications(updated);
    try {
      localStorage.setItem("kaviyam_notifications", JSON.stringify(updated));
    } catch {}
  };

  const markAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  const deleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notifications.filter((n) => n.id !== id);
    saveNotifications(updated);
  };

  const toggleRead = (id: string) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: !n.read } : n
    );
    saveNotifications(updated);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0b162c] border border-[#f0c15c]/40 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scaleIn">
        {/* Header */}
        <div className="p-5 bg-[#081123] border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#f0c15c]/10 text-[#f0c15c] border border-[#f0c15c]/20">
              <Bell size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-stone-100">
                  {lang === "ta" ? "அறிவிப்புகள்" : "Notifications"}
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-black">
                    {unreadCount} {lang === "ta" ? "புதியவை" : "New"}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-400">
                {lang === "ta" ? "நூல்கள் & வாசிப்புத் தகவல்கள்" : "Novel updates & reading activity"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="px-2.5 py-1 rounded-lg bg-[#0f2142] hover:bg-[#173266] text-stone-300 hover:text-white text-[11px] font-medium flex items-center gap-1 border border-stone-700 cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck size={13} className="text-[#f0c15c]" />
                <span>{lang === "ta" ? "அனைத்தும் வாசிக்கப்பட்டது" : "Mark All Read"}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800/60 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-stone-400">
              <Bell size={32} className="mx-auto mb-2 opacity-30 text-[#f0c15c]" />
              <p className="text-xs font-semibold">{lang === "ta" ? "அறிவிப்புகள் எதுவும் இல்லை." : "No notifications yet."}</p>
            </div>
          ) : (
            notifications.map((item) => {
              const displayTitle = lang === "ta" && item.titleTa ? item.titleTa : item.title;
              const displayMsg = lang === "ta" && item.messageTa ? item.messageTa : item.message;

              return (
                <div
                  key={item.id}
                  onClick={() => toggleRead(item.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    item.read
                      ? "bg-[#070e1c]/60 border-stone-800/80 text-stone-400 hover:border-stone-700"
                      : "bg-[#0c1933] border-[#f0c15c]/40 text-stone-200 shadow-md hover:border-[#f0c15c]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0">
                      {!item.read ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#f0c15c] shadow-[0_0_8px_#f0c15c]"></div>
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-stone-700"></div>
                      )}
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold ${!item.read ? "text-stone-100" : "text-stone-300"}`}>
                        {displayTitle}
                      </h4>
                      <p className="text-[11px] text-stone-400 mt-1 leading-relaxed">
                        {displayMsg}
                      </p>
                      <span className="text-[10px] font-mono text-stone-400 mt-1.5 inline-block">
                        {item.time}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => deleteNotification(item.id, e)}
                    className="p-1 rounded-lg text-stone-400 hover:text-red-400 hover:bg-red-950/40 transition-colors flex-shrink-0"
                    title="Dismiss"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#060c18] border-t border-stone-800/80 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-[#0e1d38] hover:bg-[#152a50] text-[#f0c15c] text-xs font-bold transition-colors cursor-pointer"
          >
            {lang === "ta" ? "சரி (Close)" : "Done"}
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { User } from "../types";
import { 
  updateUserProfile, 
  deleteUserAccount, 
  DEFAULT_AVATARS 
} from "../services/userService";
import { 
  User as UserIcon, 
  Mail, 
  Camera, 
  FileText, 
  Calendar, 
  Phone, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  Database, 
  ShieldCheck, 
  Sparkles,
  UploadCloud,
  ChevronLeft,
  Bell,
  BookOpen,
  Sliders,
  Lock,
  Volume2,
  Palette,
  Clock,
  Share2,
  Linkedin,
  Twitter,
  Instagram,
  Github,
  MessageCircle,
  ExternalLink
} from "lucide-react";

interface ProfileViewProps {
  currentUser: User;
  onProfileUpdated: (updatedUser: User) => void;
  onAccountDeleted: () => void;
  onClose: () => void;
  addSystemLog: (action: string, status: "Success" | "Failed" | "Blocked") => void;
}

export default function ProfileView({
  currentUser,
  onProfileUpdated,
  onAccountDeleted,
  onClose,
  addSystemLog,
}: ProfileViewProps) {
  // Active wizard step: 1 = Personal Details, 2 = Reading Preferences, 3 = Notifications, 4 = Account & Security
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [copiedPath, setCopiedPath] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states for editing profile
  const [formData, setFormData] = useState({
    name: currentUser.name || currentUser.username || "",
    email: currentUser.email || "",
    photoFileName: currentUser.photoFileName || "avatar_tamil_scholar.png",
    phone: currentUser.phone || "",
    bio: currentUser.bio || "தமிழ் இலக்கிய ஆர்வலர் (Tamil Literature Enthusiast)",
    dob: currentUser.dob || currentUser.profile?.dob || "",
    gender: currentUser.gender || currentUser.profile?.gender || "Not Specified",
    avatarUrl: currentUser.avatarUrl || "",
  });

  // Reading Preferences State (Step 2)
  const [prefTheme, setPrefTheme] = useState<string>("theme-midnight");
  const [prefFontSize, setPrefFontSize] = useState<string>("medium");
  const [prefVoiceSpeed, setPrefVoiceSpeed] = useState<number>(1.0);
  const [prefDualGloss, setPrefDualGloss] = useState<boolean>(true);

  // Notification Options State (Step 3)
  const [notifNovelReleases, setNotifNovelReleases] = useState<boolean>(true);
  const [notifChapterAlerts, setNotifChapterAlerts] = useState<boolean>(true);
  const [notifDailyReminder, setNotifDailyReminder] = useState<boolean>(true);
  const [notifLiteratureDigest, setNotifLiteratureDigest] = useState<boolean>(false);
  const [notifSoundEffects, setNotifSoundEffects] = useState<boolean>(true);

  const firestoreDocPath = `/users/${currentUser.id || currentUser.uid}`;

  const handleCopyPath = () => {
    navigator.clipboard.writeText(firestoreDocPath);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);
  };

  const handleCopyUid = () => {
    navigator.clipboard.writeText(currentUser.id || currentUser.uid || "");
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          photoFileName: file.name,
          avatarUrl: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSaveSuccessMsg(null);

    if (!formData.name.trim()) {
      setErrorMsg("Name is a required profile field.");
      return;
    }
    if (!formData.photoFileName.trim()) {
      setErrorMsg("Photo file name is required.");
      return;
    }

    setIsSaving(true);
    try {
      const updatedUser = await updateUserProfile(currentUser.id || currentUser.uid || "", {
        name: formData.name.trim(),
        username: formData.name.trim(),
        email: formData.email.trim(),
        photoFileName: formData.photoFileName.trim(),
        avatarUrl: formData.avatarUrl,
        phone: formData.phone.trim(),
        bio: formData.bio.trim(),
        dob: formData.dob,
        gender: formData.gender,
      });

      onProfileUpdated(updatedUser);
      setIsEditing(false);
      setSaveSuccessMsg("சுயவிவரம் வெற்றிகரமாகப் புதுப்பிக்கப்பட்டது! (Profile updated in Firestore)");
      addSystemLog(`Updated Firestore profile /users/${currentUser.id}: ${formData.name}`, "Success");
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to update profile record in Firestore.");
      addSystemLog(`Failed to update Firestore profile: ${currentUser.id}`, "Failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText.trim().toUpperCase() !== "DELETE") {
      setErrorMsg("Please type 'DELETE' to confirm account deletion.");
      return;
    }

    setIsDeleting(true);
    setErrorMsg(null);

    try {
      const targetUid = currentUser.id || currentUser.uid || "";
      addSystemLog(`Deleting account & Firestore document: /users/${targetUid}`, "Success");
      await deleteUserAccount(targetUid);
      setShowDeleteModal(false);
      onAccountDeleted();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to delete account from Firestore and Auth.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Top Breadcrumb & Return Action - Note: raw database badge removed cleanly */}
      <div className="flex items-center justify-between">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-xs text-stone-300 hover:text-[#f0c15c] transition-colors font-semibold cursor-pointer px-3.5 py-2 rounded-xl bg-[#091326] border border-[#1b2f57]"
        >
          <ChevronLeft size={16} />
          <span>நூலகத்திற்குத் திரும்பு (Back to Library)</span>
        </button>
      </div>

      {/* Notifications */}
      {saveSuccessMsg && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 rounded-2xl flex items-center gap-3 text-xs shadow-lg">
          <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
          <span className="font-medium">{saveSuccessMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-950/80 border border-red-500/50 text-red-200 rounded-2xl flex items-center gap-3 text-xs shadow-lg">
          <AlertTriangle size={18} className="text-red-400 flex-shrink-0" />
          <span className="font-medium">{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="ml-auto text-red-300 hover:text-white">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Main Profile Container */}
      <div className="bg-[#091326] border border-[#1a2d52] rounded-3xl overflow-hidden shadow-2xl">
        {/* Profile Header Banner */}
        <div className="h-32 bg-gradient-to-r from-[#142342] via-[#1a3360] to-[#0f1c36] p-6 relative flex items-end justify-between border-b border-[#1b315b]">
          <div className="flex items-center gap-2 text-xs font-mono text-[#f0c15c]">
            <Database size={14} />
            <span>Document: <strong className="text-white">{firestoreDocPath}</strong></span>
          </div>

          <button
            onClick={handleCopyPath}
            title="Copy document path"
            className="px-2.5 py-1 rounded-lg bg-black/40 hover:bg-black/60 text-stone-300 hover:text-white text-[11px] font-mono flex items-center gap-1 backdrop-blur transition-all border border-stone-700/50"
          >
            {copiedPath ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            <span>{copiedPath ? "Copied!" : "Copy Path"}</span>
          </button>
        </div>

        {/* Profile Details Header */}
        <div className="px-6 pt-4 pb-6 border-b border-stone-800/80">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 mb-4">
            {/* User Avatar with Photo File Name Badge */}
            <div className="flex items-end gap-4">
              <div className="relative group">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-[#0e1c36] border-4 border-[#091326] shadow-2xl flex items-center justify-center text-[#f0c15c]">
                  {formData.avatarUrl ? (
                    <img
                      src={formData.avatarUrl}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#f0c15c] to-[#d48c1a] flex items-center justify-center text-stone-950 font-black text-3xl">
                      {currentUser.name ? currentUser.name[0].toUpperCase() : "U"}
                    </div>
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-1 right-1 p-1.5 bg-[#f0c15c] text-black rounded-lg cursor-pointer hover:bg-white transition-all shadow-md">
                    <Camera size={14} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-stone-100">
                    {currentUser.name || currentUser.username}
                  </h2>
                  <span className="p-1 rounded-full bg-[#f0c15c]/20 text-[#f0c15c]" title="Authenticated Reader">
                    <ShieldCheck size={16} />
                  </span>
                </div>
                <p className="text-xs text-stone-400 font-mono mt-0.5">{currentUser.email}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#0e1e3b] border border-[#1d3766] text-[#d6a540] flex items-center gap-1">
                    <FileText size={10} />
                    photoFileName: <strong>{currentUser.photoFileName || "avatar_tamil_scholar.png"}</strong>
                  </span>
                  {currentUser.isVerified && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
              {!isEditing ? (
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setActiveStep(1);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#f0c15c] hover:bg-[#e0b04c] text-stone-950 font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
                  id="edit-profile-btn"
                >
                  <Edit3 size={14} />
                  <span>சுயவிவரத்தைத் திருத்து (Edit Profile)</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setErrorMsg(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <X size={14} />
                  <span>ரத்துசெய் (Cancel)</span>
                </button>
              )}
            </div>
          </div>

          {/* STEP-BY-STEP OPTIONS STEPPER (Requirement 1 & Image 1) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-6">
            <button
              onClick={() => setActiveStep(1)}
              className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                activeStep === 1
                  ? "bg-[#0f2144] border-[#f0c15c] text-white shadow-md"
                  : "bg-[#060c18] border-stone-800/80 text-stone-400 hover:text-stone-200"
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold mb-1">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  activeStep === 1 ? "bg-[#f0c15c] text-black" : "bg-stone-800 text-stone-300"
                }`}>1</span>
                <span>தகவல்கள்</span>
              </div>
              <p className="text-[10px] text-stone-400 truncate">Personal Details</p>
            </button>

            <button
              onClick={() => setActiveStep(2)}
              className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                activeStep === 2
                  ? "bg-[#0f2144] border-[#f0c15c] text-white shadow-md"
                  : "bg-[#060c18] border-stone-800/80 text-stone-400 hover:text-stone-200"
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold mb-1">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  activeStep === 2 ? "bg-[#f0c15c] text-black" : "bg-stone-800 text-stone-300"
                }`}>2</span>
                <span>வாசிப்பு அமைப்புகள்</span>
              </div>
              <p className="text-[10px] text-stone-400 truncate">Reading Preferences</p>
            </button>

            <button
              onClick={() => setActiveStep(3)}
              className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                activeStep === 3
                  ? "bg-[#0f2144] border-[#f0c15c] text-white shadow-md"
                  : "bg-[#060c18] border-stone-800/80 text-stone-400 hover:text-stone-200"
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold mb-1">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  activeStep === 3 ? "bg-[#f0c15c] text-black" : "bg-stone-800 text-stone-300"
                }`}>3</span>
                <span>அறிவிப்புகள்</span>
              </div>
              <p className="text-[10px] text-stone-400 truncate">Notification Options</p>
            </button>

            <button
              onClick={() => setActiveStep(4)}
              className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                activeStep === 4
                  ? "bg-[#0f2144] border-[#f0c15c] text-white shadow-md"
                  : "bg-[#060c18] border-stone-800/80 text-stone-400 hover:text-stone-200"
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold mb-1">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  activeStep === 4 ? "bg-[#f0c15c] text-black" : "bg-stone-800 text-stone-300"
                }`}>4</span>
                <span>பாதுகாப்பு &amp; கணக்கு</span>
              </div>
              <p className="text-[10px] text-stone-400 truncate">Account &amp; Security</p>
            </button>
          </div>
        </div>

        {/* STEP CONTENT BODIES */}
        <div className="p-6">
          {/* STEP 1: PERSONAL DETAILS (VIEW OR EDIT) */}
          {activeStep === 1 && (
            <div>
              {!isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Field: Full Name */}
                    <div className="bg-[#0c1830] p-4 rounded-2xl border border-[#192f57]">
                      <div className="flex items-center gap-2 text-[11px] font-mono text-[#d6a540] mb-1">
                        <UserIcon size={13} />
                        <span>FIELD: name</span>
                      </div>
                      <p className="text-sm font-bold text-stone-100">{currentUser.name || currentUser.username || "—"}</p>
                    </div>

                    {/* Field: Email */}
                    <div className="bg-[#0c1830] p-4 rounded-2xl border border-[#192f57]">
                      <div className="flex items-center gap-2 text-[11px] font-mono text-[#d6a540] mb-1">
                        <Mail size={13} />
                        <span>FIELD: email</span>
                      </div>
                      <p className="text-sm font-bold text-stone-100 font-mono">{currentUser.email || "—"}</p>
                    </div>

                    {/* Field: Photo File Name */}
                    <div className="bg-[#0c1830] p-4 rounded-2xl border border-[#192f57]">
                      <div className="flex items-center gap-2 text-[11px] font-mono text-[#d6a540] mb-1">
                        <Camera size={13} />
                        <span>FIELD: photoFileName</span>
                      </div>
                      <p className="text-sm font-bold text-stone-100 font-mono text-[#f0c15c]">
                        {currentUser.photoFileName || "avatar_tamil_scholar.png"}
                      </p>
                    </div>

                    {/* Field: UID */}
                    <div className="bg-[#0c1830] p-4 rounded-2xl border border-[#192f57] flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-[#d6a540] mb-1">
                          <Database size={13} />
                          <span>FIELD: uid (Document ID)</span>
                        </div>
                        <p className="text-xs font-bold text-stone-300 font-mono truncate max-w-[220px]">
                          {currentUser.id || currentUser.uid}
                        </p>
                      </div>
                      <button
                        onClick={handleCopyUid}
                        title="Copy UID"
                        className="p-1.5 rounded-lg bg-[#070e1c] hover:bg-stone-800 text-stone-400 hover:text-white"
                      >
                        {copiedUid ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      </button>
                    </div>

                    {/* Field: Phone */}
                    <div className="bg-[#0c1830] p-4 rounded-2xl border border-[#192f57]">
                      <div className="flex items-center gap-2 text-[11px] font-mono text-[#d6a540] mb-1">
                        <Phone size={13} />
                        <span>FIELD: phone</span>
                      </div>
                      <p className="text-sm font-bold text-stone-100">{currentUser.phone || "Not provided"}</p>
                    </div>

                    {/* Field: DOB & Gender */}
                    <div className="bg-[#0c1830] p-4 rounded-2xl border border-[#192f57]">
                      <div className="flex items-center gap-2 text-[11px] font-mono text-[#d6a540] mb-1">
                        <Calendar size={13} />
                        <span>FIELDS: dob &amp; gender</span>
                      </div>
                      <p className="text-sm font-bold text-stone-100">
                        {currentUser.dob || currentUser.gender ? `${currentUser.dob || "—"} (${currentUser.gender || "—"})` : "— (Not Specified)"}
                      </p>
                    </div>
                  </div>

                  {/* Bio Field */}
                  <div className="bg-[#0c1830] p-4 rounded-2xl border border-[#192f57]">
                    <div className="flex items-center gap-2 text-[11px] font-mono text-[#d6a540] mb-1">
                      <FileText size={13} />
                      <span>FIELD: bio</span>
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      {currentUser.bio || "தமிழ் இலக்கிய ஆர்வலர் (Tamil Literature Enthusiast)"}
                    </p>
                  </div>
                </div>
              ) : (
                /* EDIT FORM */
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-[#060c18] border border-stone-800 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-[#f0c15c]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1">Email Address</label>
                      <input
                        type="email"
                        disabled
                        value={formData.email}
                        className="w-full px-3.5 py-2.5 bg-[#060c18] border border-stone-800 rounded-xl text-stone-400 text-xs font-mono opacity-80 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1">Photo File Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.photoFileName}
                        onChange={(e) => setFormData({ ...formData, photoFileName: e.target.value })}
                        placeholder="avatar_tamil_scholar.png"
                        className="w-full px-3.5 py-2.5 bg-[#060c18] border border-stone-800 rounded-xl text-stone-100 text-xs font-mono focus:outline-none focus:border-[#f0c15c]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 9876543210"
                        className="w-full px-3.5 py-2.5 bg-[#060c18] border border-stone-800 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-[#f0c15c]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">Biography</label>
                    <textarea
                      rows={3}
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="w-full px-3.5 py-2 bg-[#060c18] border border-stone-800 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-[#f0c15c]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 rounded-xl text-xs text-stone-400 hover:text-stone-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-5 py-2.5 rounded-xl bg-[#f0c15c] text-black font-extrabold text-xs flex items-center gap-2 shadow-md cursor-pointer"
                    >
                      {isSaving ? "Saving..." : "Save Profile to Firestore"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* STEP 2: READING PREFERENCES */}
          {activeStep === 2 && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-[#0c1830] border border-[#192f57] space-y-4">
                <h4 className="text-xs font-bold text-[#f0c15c] flex items-center gap-2">
                  <Palette size={15} />
                  <span>இயல்புநிலை வாசிப்பு நிறம் (Default Reading Theme)</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: "theme-midnight", label: "Midnight Deep", bg: "#070E1C", text: "#FFFFFF" },
                    { id: "theme-ivory", label: "Classic Ivory", bg: "#FAF7F2", text: "#1A1A1A" },
                    { id: "theme-sepia", label: "Warm Sepia", bg: "#2B2118", text: "#F3E5D8" },
                    { id: "theme-chola", label: "Chola Imperial", bg: "#140A07", text: "#F0C15C" },
                  ].map((thm) => (
                    <button
                      key={thm.id}
                      onClick={() => setPrefTheme(thm.id)}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        prefTheme === thm.id ? "border-[#f0c15c] bg-[#112344]" : "border-stone-800 bg-[#060c18]"
                      }`}
                    >
                      <div>
                        <span className="text-xs font-bold block text-stone-100">{thm.label}</span>
                        <span className="text-[10px] text-stone-400">Preset Theme</span>
                      </div>
                      {prefTheme === thm.id && <Check size={14} className="text-[#f0c15c]" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0c1830] border border-[#192f57] space-y-4">
                <h4 className="text-xs font-bold text-[#f0c15c] flex items-center gap-2">
                  <Volume2 size={15} />
                  <span>தமிழ் குரல் வழி வாசிப்பான் வேகம் (TTS Voice Narration Speed)</span>
                </h4>
                <div className="flex items-center gap-4">
                  {[0.75, 1.0, 1.25, 1.5].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setPrefVoiceSpeed(speed)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        prefVoiceSpeed === speed ? "bg-[#f0c15c] text-black" : "bg-[#060c18] text-stone-300 border border-stone-800"
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0c1830] border border-[#192f57] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-stone-100">சங்க இலக்கியச் சொற்களுக்கான தமிழ்-ஆங்கில விளக்கம்</h4>
                  <p className="text-[11px] text-stone-400 mt-0.5">Show ancient Tamil contextual meaning popup on word tap</p>
                </div>
                <button
                  onClick={() => setPrefDualGloss(!prefDualGloss)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    prefDualGloss ? "bg-[#f0c15c]" : "bg-stone-700"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-black absolute top-0.5 transition-transform ${
                    prefDualGloss ? "left-6" : "left-1"
                  }`} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: NOTIFICATION OPTIONS (Requirement 1) */}
          {activeStep === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#0c1830] border border-[#192f57] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-stone-100">புதிய நாவல் வெளியீடுகள் (Novel Releases)</h4>
                  <p className="text-[11px] text-stone-400 mt-0.5">Notify when classic novels or historical archives are added</p>
                </div>
                <button
                  onClick={() => setNotifNovelReleases(!notifNovelReleases)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    notifNovelReleases ? "bg-[#f0c15c]" : "bg-stone-700"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-black absolute top-0.5 transition-transform ${
                    notifNovelReleases ? "left-6" : "left-1"
                  }`} />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#0c1830] border border-[#192f57] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-stone-100">புதிய அத்தியாய எச்சரிக்கை (Chapter Updates)</h4>
                  <p className="text-[11px] text-stone-400 mt-0.5">Get notified when new chapters are uploaded for bookmarked books</p>
                </div>
                <button
                  onClick={() => setNotifChapterAlerts(!notifChapterAlerts)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    notifChapterAlerts ? "bg-[#f0c15c]" : "bg-stone-700"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-black absolute top-0.5 transition-transform ${
                    notifChapterAlerts ? "left-6" : "left-1"
                  }`} />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#0c1830] border border-[#192f57] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-stone-100">தினசரி வாசிப்பு நினைவூட்டல் (Daily Reading Reminder)</h4>
                  <p className="text-[11px] text-stone-400 mt-0.5">Maintain your daily reading streak with gentle alerts</p>
                </div>
                <button
                  onClick={() => setNotifDailyReminder(!notifDailyReminder)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    notifDailyReminder ? "bg-[#f0c15c]" : "bg-stone-700"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-black absolute top-0.5 transition-transform ${
                    notifDailyReminder ? "left-6" : "left-1"
                  }`} />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#0c1830] border border-[#192f57] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-stone-100">தமிழ் இலக்கியச் செய்திகள் (Tamil Literature Digest)</h4>
                  <p className="text-[11px] text-stone-400 mt-0.5">Weekly curated insights, author biographies, and literary trivia</p>
                </div>
                <button
                  onClick={() => setNotifLiteratureDigest(!notifLiteratureDigest)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    notifLiteratureDigest ? "bg-[#f0c15c]" : "bg-stone-700"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-black absolute top-0.5 transition-transform ${
                    notifLiteratureDigest ? "left-6" : "left-1"
                  }`} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: ACCOUNT & SECURITY */}
          {activeStep === 4 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#0c1830] border border-[#192f57] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#f0c15c]">
                  <Database size={15} />
                  <span>Firestore Cloud Database Status</span>
                </div>
                <p className="text-xs text-stone-300">
                  Your profile document is synced in Firestore at <code className="text-[#f0c15c] font-mono">/users/{currentUser.id || currentUser.uid}</code>. All bookmarks, annotations, and reading settings are backed up to the cloud.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#102244] to-[#0a152b] border border-[#f0c15c]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#f0c15c]">
                    <ShieldCheck size={16} />
                    <span>உதவி & ஆதரவு (Help & Official Support)</span>
                  </div>
                  <span className="text-[10px] font-mono text-stone-400">Direct Support</span>
                </div>
                <p className="text-xs text-stone-300">
                  For novel additions, issues, or feedback, reach out directly to our administrator:
                </p>
                <div className="flex items-center justify-between p-3 bg-[#060c18] border border-stone-800 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Mail size={15} className="text-[#f0c15c]" />
                    <span className="text-xs font-mono font-bold text-stone-200">poopathiraja504@gmail.com</span>
                  </div>
                  <a
                    href="mailto:poopathiraja504@gmail.com?subject=Kaviyam%20Profile%20Help%20Inquiry"
                    className="px-3 py-1.5 rounded-lg bg-[#f0c15c] text-black font-bold text-xs hover:bg-[#e0b04c] transition-colors"
                  >
                    Contact Support
                  </a>
                </div>
              </div>

              {/* Social Channels & WhatsApp Group */}
              <div className="p-4 rounded-2xl bg-[#09162e] border border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <Share2 size={16} />
                    <span>சமூக வலைத்தளங்கள் & வாசகர் குழு (Social & Community)</span>
                  </div>
                  <span className="text-[10px] font-mono text-stone-400">Connect</span>
                </div>

                {/* WhatsApp Group Quick Access */}
                <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <MessageCircle size={16} />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-emerald-200">WhatsApp Literature Group</h5>
                      <p className="text-[10px] text-stone-400">Join daily reading discussions & updates</p>
                    </div>
                  </div>
                  <a
                    href="https://chat.whatsapp.com/DqdVUsDADvCGtGtT65kSLC?s=cl&p=a&mlu=0&ilr=4"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1 transition-all"
                  >
                    <span>Join</span>
                    <ExternalLink size={12} />
                  </a>
                </div>

                {/* Social Badges Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <a
                    href="https://www.linkedin.com/in/dharmenthira-boopathi-s-7087563a8"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="p-2.5 rounded-xl bg-[#060c18] border border-stone-800 hover:border-sky-500/50 text-stone-300 hover:text-white flex items-center gap-2 text-xs"
                  >
                    <Linkedin size={14} className="text-sky-400" />
                    <span>LinkedIn</span>
                  </a>
                  <a
                    href="https://x.com/dharmenthi7gec"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="p-2.5 rounded-xl bg-[#060c18] border border-stone-800 hover:border-stone-400 text-stone-300 hover:text-white flex items-center gap-2 text-xs"
                  >
                    <Twitter size={14} className="text-stone-200" />
                    <span>X.com</span>
                  </a>
                  <a
                    href="https://www.instagram.com/boopathi.__.08?igsh=MTA5ZTQ2a2k1dmZvZg=="
                    target="_blank"
                    rel="noreferrer noopener"
                    className="p-2.5 rounded-xl bg-[#060c18] border border-stone-800 hover:border-pink-500/50 text-stone-300 hover:text-white flex items-center gap-2 text-xs"
                  >
                    <Instagram size={14} className="text-pink-400" />
                    <span>Instagram</span>
                  </a>
                  <a
                    href="https://github.com/poopathiraja504-cloud"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="p-2.5 rounded-xl bg-[#060c18] border border-stone-800 hover:border-purple-500/50 text-stone-300 hover:text-white flex items-center gap-2 text-xs"
                  >
                    <Github size={14} className="text-purple-400" />
                    <span>GitHub</span>
                  </a>
                </div>
              </div>

              {/* Legal & Policy References */}
              <div className="p-4 rounded-2xl bg-[#081224] border border-stone-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                    <FileText size={16} />
                    <span>சட்ட ஆவணங்கள் (Terms & Privacy Policies)</span>
                  </div>
                  <span className="text-[10px] font-mono text-stone-400">Compliance</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <a
                    href="https://www.termsfeed.com/live/40b50cfb-9cf5-4d66-89d3-87c937901dff"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="p-2.5 rounded-xl bg-[#060c18] border border-stone-800 hover:border-indigo-500/50 text-stone-300 hover:text-white flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <FileText size={13} className="text-indigo-400" />
                      <span>Terms & Conditions</span>
                    </div>
                    <ExternalLink size={12} className="text-stone-500" />
                  </a>
                  <a
                    href="https://www.freeprivacypolicy.com/live/020ee704-6e52-4ae5-8fe5-ff246bd18d9d"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="p-2.5 rounded-xl bg-[#060c18] border border-stone-800 hover:border-indigo-500/50 text-stone-300 hover:text-white flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Lock size={13} className="text-indigo-400" />
                      <span>Privacy Policy</span>
                    </div>
                    <ExternalLink size={12} className="text-stone-500" />
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-red-950/30 border border-red-800/40 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-red-300">
                  <Trash2 size={15} />
                  <span>கணக்கை நிரந்தரமாக நீக்கு (Delete Account)</span>
                </div>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Permanently deletes your account and removes your document record from Firestore.
                </p>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 rounded-xl bg-red-900/60 hover:bg-red-800 text-red-200 text-xs font-bold transition-colors cursor-pointer border border-red-700/50"
                >
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b162c] border border-red-700/60 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-red-300">Confirm Account Deletion</h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              Type <strong className="text-white font-mono">DELETE</strong> below to confirm.
            </p>
            <input
              type="text"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder="DELETE"
              className="w-full px-3.5 py-2.5 bg-[#050a14] border border-stone-800 rounded-xl text-stone-100 text-xs font-mono"
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-xs text-stone-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmationText.trim().toUpperCase() !== "DELETE"}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

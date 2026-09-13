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
  ChevronLeft
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
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [copiedPath, setCopiedPath] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states for editing
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
      // Set the photo file name to the uploaded file name
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
      setSaveSuccessMsg("Profile document in Firestore (/users) updated successfully!");
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
      {/* Top Breadcrumb & Return Action */}
      <div className="flex items-center justify-between">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-xs text-stone-300 hover:text-[#f0c15c] transition-colors font-semibold cursor-pointer px-3 py-1.5 rounded-xl bg-[#091326] border border-[#1b2f57]"
        >
          <ChevronLeft size={16} />
          <span>நூலகத்திற்குத் திரும்பு (Back to Library)</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 flex items-center gap-1.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Firestore Collection: /users
          </span>
        </div>
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

      {/* Main Profile Card */}
      <div className="bg-[#091326] border border-[#1a2d52] rounded-3xl overflow-hidden shadow-2xl">
        {/* Profile Header Banner */}
        <div className="h-32 bg-gradient-to-r from-[#142342] via-[#1a3360] to-[#0f1c36] p-6 relative flex items-end justify-between border-b border-[#1b315b]">
          <div className="flex items-center gap-2 text-xs font-mono text-[#f0c15c]">
            <Database size={14} />
            <span>Firestore Document: <strong className="text-white">{firestoreDocPath}</strong></span>
          </div>

          <button
            onClick={handleCopyPath}
            title="Copy Firestore document path"
            className="px-2.5 py-1 rounded-lg bg-black/40 hover:bg-black/60 text-stone-300 hover:text-white text-[11px] font-mono flex items-center gap-1 backdrop-blur transition-all border border-stone-700/50"
          >
            {copiedPath ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            <span>{copiedPath ? "Copied!" : "Copy Path"}</span>
          </button>
        </div>

        {/* Profile Details Container */}
        <div className="px-6 pb-8 pt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 mb-6">
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
                  onClick={() => setIsEditing(true)}
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

          {/* VIEW MODE: Read-Only Document Fields */}
          {!isEditing ? (
            <div className="space-y-6">
              {/* Document Overview Grid */}
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
                  <p className="text-sm font-bold text-[#f0c15c] font-mono">
                    {currentUser.photoFileName || "avatar_tamil_scholar.png"}
                  </p>
                </div>

                {/* Field: UID */}
                <div className="bg-[#0c1830] p-4 rounded-2xl border border-[#192f57]">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#d6a540] mb-1">
                    <div className="flex items-center gap-2">
                      <Database size={13} />
                      <span>FIELD: uid (Document ID)</span>
                    </div>
                    <button
                      onClick={handleCopyUid}
                      className="text-stone-400 hover:text-stone-200 transition-colors"
                      title="Copy UID"
                    >
                      {copiedUid ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    </button>
                  </div>
                  <p className="text-xs font-mono text-stone-300 truncate">{currentUser.id || currentUser.uid}</p>
                </div>

                {/* Field: Phone */}
                <div className="bg-[#0c1830] p-4 rounded-2xl border border-[#192f57]">
                  <div className="flex items-center gap-2 text-[11px] font-mono text-[#d6a540] mb-1">
                    <Phone size={13} />
                    <span>FIELD: phone</span>
                  </div>
                  <p className="text-sm font-medium text-stone-200">{currentUser.phone || "Not provided"}</p>
                </div>

                {/* Field: Date of Birth & Gender */}
                <div className="bg-[#0c1830] p-4 rounded-2xl border border-[#192f57]">
                  <div className="flex items-center gap-2 text-[11px] font-mono text-[#d6a540] mb-1">
                    <Calendar size={13} />
                    <span>FIELDS: dob &amp; gender</span>
                  </div>
                  <p className="text-sm font-medium text-stone-200">
                    {currentUser.dob || currentUser.profile?.dob || "—"} ({currentUser.gender || currentUser.profile?.gender || "Not Specified"})
                  </p>
                </div>
              </div>

              {/* Bio block */}
              <div className="bg-[#0c1830] p-4 rounded-2xl border border-[#192f57]">
                <div className="flex items-center gap-2 text-[11px] font-mono text-[#d6a540] mb-2">
                  <FileText size={13} />
                  <span>FIELD: bio (பயனர் சுயவிவரக் குறிப்பு)</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  {currentUser.bio || "தமிழ் நாவல்கள் மற்றும் அழியாப் புகழ்பெற்ற காவியங்களை வாசிக்கும் தீவிர வாசகர்."}
                </p>
              </div>

              {/* Timestamps Info Bar */}
              <div className="p-4 bg-[#081020] rounded-2xl border border-stone-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-stone-400">
                <div>
                  <span>பதிவுசெய்யப்பட்ட தேதி (createdAt): </span>
                  <strong className="text-stone-300">
                    {currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleString() : "Recently registered"}
                  </strong>
                </div>
                <div>
                  <span>கடைசியாக புதுப்பிக்கப்பட்டது (updatedAt): </span>
                  <strong className="text-stone-300">
                    {currentUser.updatedAt ? new Date(currentUser.updatedAt).toLocaleString() : "Up to date"}
                  </strong>
                </div>
              </div>
            </div>
          ) : (
            /* EDIT MODE: Form To Edit Profile Information in Firestore */
            <form onSubmit={handleSaveProfile} className="space-y-6" id="edit-profile-form">
              <div className="p-4 bg-[#0c1a36] border border-[#1e3a6c] rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#f0c15c]">சுயவிவரத் திருத்தம் (Editing Profile Document)</h3>
                  <p className="text-[11px] text-stone-400">Updates will be committed directly to Firestore at {firestoreDocPath}.</p>
                </div>
                <span className="text-xs font-mono text-stone-400 bg-black/40 px-2.5 py-1 rounded-lg">LIVE FIRESTORE</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Edit Name */}
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1.5">
                    பெயர் (Name) <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-2.5 bg-[#060c18] border border-stone-800 rounded-xl text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-[#f0c15c]"
                    id="profile-name-input"
                  />
                </div>

                {/* Edit Email */}
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1.5">
                    மின்னஞ்சல் (Email) <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full px-4 py-2.5 bg-[#060c18] border border-stone-800 rounded-xl text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-[#f0c15c]"
                    id="profile-email-input"
                  />
                </div>

                {/* Edit Photo File Name */}
                <div className="md:col-span-2 space-y-3">
                  <label className="block text-xs font-bold text-stone-300">
                    புகைப்படக் கோப்புப் பெயர் (photoFileName) <span className="text-amber-400">*</span>
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                      <Camera size={15} className="absolute left-3.5 top-3 text-stone-500" />
                      <input
                        type="text"
                        required
                        value={formData.photoFileName}
                        onChange={(e) => setFormData({ ...formData, photoFileName: e.target.value })}
                        placeholder="e.g. avatar_tamil_scholar.png"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#060c18] border border-stone-800 rounded-xl text-xs sm:text-sm font-mono text-[#f0c15c] focus:outline-none focus:border-[#f0c15c]"
                        id="profile-photo-filename-input"
                      />
                    </div>

                    {/* Upload button */}
                    <label className="w-full sm:w-auto px-4 py-2.5 bg-[#0e1d3a] hover:bg-[#152a54] text-stone-200 border border-stone-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors">
                      <UploadCloud size={15} />
                      <span>Choose Local File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Preset Avatars quick selection */}
                  <div>
                    <span className="text-[11px] text-stone-400 block mb-1.5">அல்லது முன்னிருப்பு அவதார்களைத் தேர்வுசெய்யவும் (Quick Avatar Presets):</span>
                    <div className="flex flex-wrap items-center gap-2">
                      {DEFAULT_AVATARS.map((av) => (
                        <button
                          key={av.fileName}
                          type="button"
                          onClick={() => setFormData({ ...formData, photoFileName: av.fileName })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                            formData.photoFileName === av.fileName
                              ? "bg-[#f0c15c] text-black font-bold shadow"
                              : "bg-[#0c1830] text-stone-400 border border-stone-800 hover:text-stone-200"
                          }`}
                        >
                          {av.fileName} ({av.title.split("(")[0]})
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Edit Phone */}
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1.5">
                    தொலைபேசி எண் (Phone Number)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full px-4 py-2.5 bg-[#060c18] border border-stone-800 rounded-xl text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-[#f0c15c]"
                    id="profile-phone-input"
                  />
                </div>

                {/* Edit Date of Birth */}
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1.5">
                    பிறந்த தேதி (Date of Birth)
                  </label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#060c18] border border-stone-800 rounded-xl text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-[#f0c15c]"
                    id="profile-dob-input"
                  />
                </div>

                {/* Edit Gender */}
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1.5">
                    பாலினம் (Gender)
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#060c18] border border-stone-800 rounded-xl text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-[#f0c15c]"
                    id="profile-gender-select"
                  >
                    <option value="Not Specified">குறிப்பிடப்படவில்லை (Not Specified)</option>
                    <option value="Male">ஆண் (Male)</option>
                    <option value="Female">பெண் (Female)</option>
                    <option value="Other">மற்றவை (Other)</option>
                  </select>
                </div>

                {/* Edit Bio */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-stone-300 mb-1.5">
                    சுயவிவரக் குறிப்பு (Biography)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself or your reading interests..."
                    className="w-full px-4 py-2.5 bg-[#060c18] border border-stone-800 rounded-xl text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-[#f0c15c] leading-relaxed"
                    id="profile-bio-textarea"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs transition-colors cursor-pointer"
                >
                  ரத்துசெய் (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#f0c15c] hover:bg-[#e0b04c] text-stone-950 font-bold text-xs flex items-center gap-2 shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                  id="save-profile-btn"
                >
                  <Save size={14} />
                  <span>{isSaving ? "சேமிக்கிறது... (Saving)" : "மாற்றங்களைச் சேமி (Save to Firestore)"}</span>
                </button>
              </div>
            </form>
          )}

          {/* DANGER ZONE: Delete Account */}
          <div className="mt-12 pt-6 border-t border-red-950/80">
            <div className="bg-red-950/20 border border-red-900/50 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-red-300 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-400" />
                  <span>கணக்கை நீக்குதல் (Delete Account &amp; Firestore Data)</span>
                </h4>
                <p className="text-xs text-red-200/80 mt-1">
                  Permanently erase your document at <strong>{firestoreDocPath}</strong>, credentials, and all reading bookmarks from Kaviyam Reading.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(true);
                  setDeleteConfirmationText("");
                  setErrorMsg(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md flex-shrink-0"
                id="init-delete-account-btn"
              >
                <Trash2 size={14} />
                <span>கணக்கை நீக்கு (Delete Account)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="max-w-md w-full bg-[#0c1424] border border-red-700/60 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-950/90 border border-red-500/50 flex items-center justify-center text-red-400 mx-auto">
              <Trash2 size={24} />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-stone-100">Are you absolutely sure?</h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                This action is irreversible. It will delete your user document at:
              </p>
              <div className="p-2 bg-[#060a12] border border-red-900/60 rounded-xl text-xs font-mono text-[#f0c15c] mt-2">
                {firestoreDocPath}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="block text-xs text-stone-300">
                To confirm, please type <strong className="text-red-400 font-mono">DELETE</strong> in the box below:
              </label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="w-full px-4 py-2.5 bg-[#060a12] border border-stone-800 rounded-xl text-xs text-stone-100 text-center font-mono font-bold focus:outline-none focus:border-red-500"
                autoFocus
                id="delete-account-confirm-input"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold cursor-pointer"
              >
                ரத்துசெய் (Cancel)
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmationText.trim().toUpperCase() !== "DELETE"}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
                id="confirm-delete-account-btn"
              >
                <Trash2 size={14} />
                <span>{isDeleting ? "Deleting..." : "Permanently Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

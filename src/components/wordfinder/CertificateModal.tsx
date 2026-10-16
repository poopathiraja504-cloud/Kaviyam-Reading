import React, { useRef, useEffect, useState } from "react";
import { Download, X, Award, CheckCircle, FileText, ShieldCheck } from "lucide-react";
import {
  CertificateParams,
  renderCertificateOnCanvas,
  downloadCertificateAsPng,
  downloadCertificateAsPdf,
} from "../../utils/certificateDrawer";
import { Language } from "../../utils/i18n";

export interface CertificateModalProps extends CertificateParams {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

export default function CertificateModal({
  isOpen,
  onClose,
  participantName,
  activityType,
  activityTitle,
  wordsFound = "5/5",
  completionTime = "01:45",
  score = "100",
  percentage = "100%",
  completionDate,
  certificateId,
  userId,
  lang = "ta",
}: CertificateModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const certParams: CertificateParams = {
    participantName,
    activityType,
    activityTitle,
    wordsFound,
    completionTime,
    score,
    percentage,
    completionDate,
    certificateId,
    userId,
    lang,
  };

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      renderCertificateOnCanvas(canvasRef.current, certParams);
    }
  }, [
    isOpen,
    participantName,
    activityType,
    activityTitle,
    wordsFound,
    completionTime,
    score,
    percentage,
    completionDate,
    certificateId,
    userId,
    lang,
  ]);

  const handleDownloadPng = async () => {
    await downloadCertificateAsPng(certParams);
    setDownloadSuccess(
      lang === "ta"
        ? "PNG சான்றிதழ் வெற்றிகரமாகப் பதிவிறக்கப்பட்டது!"
        : "PNG Certificate downloaded successfully!"
    );
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  const handleDownloadPdf = async () => {
    await downloadCertificateAsPdf(certParams);
    setDownloadSuccess(
      lang === "ta"
        ? "PDF சான்றிதழ் வெற்றிகரமாகப் பதிவிறக்கப்பட்டது!"
        : "PDF Certificate downloaded successfully!"
    );
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  if (!isOpen) return null;

  const isTamil = lang === "ta";
  const activityLabel = isTamil
    ? activityType === "Word Finder"
      ? "சொல் வேட்டை"
      : "வினாடி வினா"
    : activityType;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl border border-[#D4AF37] max-w-4xl w-full p-4 sm:p-6 shadow-2xl flex flex-col space-y-4 my-auto">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm ${
                activityType === "Word Finder" ? "bg-emerald-800" : "bg-[#0F284E]"
              }`}
            >
              <Award className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  {isTamil ? `${activityLabel} அதிகாரப்பூர்வ விருது` : `${activityLabel} Official Award`}
                </span>
                <span className="text-xs font-mono font-bold text-stone-500">
                  {certificateId}
                </span>
              </div>
              <h3 className="font-serif font-black text-base sm:text-lg text-[#3B0B12] leading-tight mt-0.5">
                {activityTitle}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Canvas Preview */}
        <div className="w-full overflow-hidden rounded-2xl border border-stone-300 shadow-inner bg-[#FBF9F3] flex items-center justify-center p-1.5 sm:p-2">
          <canvas
            ref={canvasRef}
            className="w-full h-auto max-h-[56vh] object-contain rounded-xl shadow-md"
          />
        </div>

        {/* Feedback Alert */}
        {downloadSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-bold animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{downloadSuccess}</span>
          </div>
        )}

        {/* Action Buttons: View, Download PDF, Download PNG */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 border-t border-stone-100">
          <div className="text-xs text-stone-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-sans font-medium">
              {isTamil
                ? "அங்கீகரிக்கப்பட்டது: எஸ். தர்மேந்திர பூபதி, நிறுவனர், காவியம் வாசிப்பு இணையம்"
                : "Approved by S. Dharmenthira Boopathi, Founder, Kaviyam Reading Website"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Download Certificate PDF */}
            <button
              onClick={handleDownloadPdf}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-stone-300 hover:border-stone-400 bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4 text-rose-600" />
              <span>{isTamil ? "✅ PDF பதிவிறக்கு" : "✅ Download Certificate PDF"}</span>
            </button>

            {/* Download Certificate PNG */}
            <button
              onClick={handleDownloadPng}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold text-xs shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isTamil ? "✅ PNG பதிவிறக்கு" : "✅ Download Certificate PNG"}</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-colors cursor-pointer"
            >
              {isTamil ? "மூடுக" : "Close"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

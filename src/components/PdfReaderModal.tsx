import React, { useState } from "react";
import { FileText, Download, ExternalLink, X, BookOpen, Sparkles } from "lucide-react";
import { Book } from "../types";
import { Language, translations } from "../utils/i18n";

interface PdfReaderModalProps {
  book: Book;
  onClose: () => void;
  lang: Language;
}

export default function PdfReaderModal({ book, onClose, lang }: PdfReaderModalProps) {
  const [zoom, setZoom] = useState<number>(100);
  const t = (key: keyof typeof translations["ta"]) => translations[lang][key] || key;

  const defaultPdfUrl = book.pdfUrl || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-between font-sans">
      
      {/* PDF Viewer Header */}
      <header className="h-16 bg-[#1D0408] border-b border-[#3B0B12] px-4 sm:px-6 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#3B0B12] text-[#D4AF37] border border-[#5C121E]">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-sm sm:text-base text-amber-100 truncate max-w-xs sm:max-w-md">
              {book.title}
            </h3>
            <span className="text-[10px] text-amber-200/60 uppercase tracking-wider font-semibold block">
              {lang === "ta" ? "PDF வடிவில் நூல்" : "PDF Book Edition"} • {book.author}
            </span>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom Level Controls */}
          <div className="hidden sm:flex items-center bg-white/10 rounded-xl px-2 py-1 border border-white/10 text-xs text-amber-100 space-x-2">
            <button
              onClick={() => setZoom(Math.max(50, zoom - 25))}
              className="px-2 py-0.5 rounded hover:bg-white/20 font-bold"
            >
              -
            </button>
            <span className="font-mono text-[11px] text-amber-300">{zoom}%</span>
            <button
              onClick={() => setZoom(Math.min(200, zoom + 25))}
              className="px-2 py-0.5 rounded hover:bg-white/20 font-bold"
            >
              +
            </button>
          </div>

          {/* Download PDF */}
          <a
            href={defaultPdfUrl}
            download={`${book.id}.pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-xl bg-[#D4AF37] text-[#3B0B12] text-xs font-bold hover:brightness-110 flex items-center gap-1.5 shadow-md"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{lang === "ta" ? "பதிவிறக்கு PDF" : "Download PDF"}</span>
          </a>

          {/* Open in New Tab */}
          <a
            href={defaultPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-white/10 text-amber-200 hover:bg-white/20 text-xs font-semibold"
            title="Open PDF in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          {/* Close Modal */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-red-950/60 text-red-200 hover:bg-red-900 border border-red-800/40 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* PDF View Body */}
      <main className="flex-1 bg-[#120305] p-2 sm:p-6 overflow-auto flex justify-center items-center relative">
        <div
          style={{ width: `${zoom}%`, maxWidth: "100%", height: "100%" }}
          className="transition-all duration-200 h-full flex flex-col items-center justify-center"
        >
          <iframe
            src={`${defaultPdfUrl}#toolbar=1&navpanes=0`}
            title={book.title}
            className="w-full h-full rounded-2xl border border-[#3B0B12] shadow-2xl bg-white"
          />
        </div>
      </main>

      {/* Footer Banner */}
      <footer className="h-10 bg-[#1D0408] border-t border-[#3B0B12] px-6 flex items-center justify-between text-[11px] text-amber-200/60">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>{lang === "ta" ? "காவியம் தமிழ் டிஜிட்டல் நூலகம் - PDF பார்வை" : "Kaviyam Digital Library - Interactive PDF Viewer"}</span>
        </div>
        <span className="hidden sm:inline font-mono">PDF Standard • 100% Free Access</span>
      </footer>

    </div>
  );
}

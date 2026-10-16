import React, { useState, useEffect, useRef, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { Book } from "../types";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Download,
  X,
  RotateCw,
  FileText,
  Layers,
  BookOpen,
  Volume2,
  VolumeX,
  RefreshCw,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";

// Configure local worker to prevent network failures or CORS issues
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

interface PDFModalViewerProps {
  book: Book;
  onClose: () => void;
  onDownload: (book: Book) => void;
  isDark?: boolean;
}

export const PDFModalViewer: React.FC<PDFModalViewerProps> = ({
  book,
  onClose,
  onDownload,
  isDark = true,
}) => {
  const [numPages, setNumPages] = useState<number>(book.pageCount || 1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [rotation, setRotation] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showThumbnails, setShowThumbnails] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"canvas" | "article">("canvas");
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfDocRef = useRef<any>(null);
  const renderTaskRef = useRef<any>(null);

  // Load PDF Document
  const loadPdf = useCallback(async () => {
    if (!book.pdfUrl) {
      setViewMode("article");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setLoadError(null);

      // Cancel any ongoing render
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      const loadingTask = pdfjsLib.getDocument({
        url: book.pdfUrl,
        cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/cmaps/",
        cMapPacked: true,
      });

      const pdf = await loadingTask.promise;
      pdfDocRef.current = pdf;
      setNumPages(pdf.numPages);
      setCurrentPage(1);
      setIsLoading(false);
    } catch (err: any) {
      console.warn("PDF.js loading failed or fallback required:", err);
      setLoadError(
        "PDF கோப்பை ஏற்றுவதில் தாமதம் ஏற்பட்டுள்ளது. நீங்கள் கீழே உள்ள வாசிப்பு முறையில் படிக்கலாம் அல்லது நேரடியாக PDF பதிவிறக்கலாம்."
      );
      setIsLoading(false);
      // Fallback automatically to article view so user never faces a dead screen
      setViewMode("article");
    }
  }, [book.pdfUrl]);

  useEffect(() => {
    loadPdf();
    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [loadPdf]);

  // Render Page to Canvas
  const renderPage = useCallback(
    async (pageNum: number) => {
      if (!pdfDocRef.current || !canvasRef.current || viewMode !== "canvas") return;

      try {
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const page = await pdfDocRef.current.getPage(pageNum);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) return;

        const viewport = page.getViewport({ scale, rotation });
        const pixelRatio = window.devicePixelRatio || 1;

        // Set dimensions for high-DPI crystal-clear text rendering
        canvas.width = Math.floor(viewport.width * pixelRatio);
        canvas.height = Math.floor(viewport.height * pixelRatio);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
          enableWebGL: true,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;
        await renderTask.promise;
      } catch (err: any) {
        if (err?.name !== "RenderingCancelledException") {
          console.error("Canvas render error:", err);
        }
      }
    },
    [scale, rotation, viewMode]
  );

  useEffect(() => {
    if (!isLoading && pdfDocRef.current && viewMode === "canvas") {
      renderPage(currentPage);
    }
  }, [currentPage, scale, rotation, isLoading, viewMode, renderPage]);

  // Navigation handlers
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3.0));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setScale(1.2);
    setRotation(0);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.warn("Fullscreen request error:", err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => {
        console.warn("Exit fullscreen error:", err);
      });
      setIsFullscreen(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else {
          onClose();
        }
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        handlePrevPage();
      } else if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        handleNextPage();
      } else if (e.key === "+" || e.key === "=") {
        handleZoomIn();
      } else if (e.key === "-") {
        handleZoomOut();
      } else if (e.key === "0") {
        handleResetZoom();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, numPages, onClose]);

  // Text to speech for current article
  const toggleSpeech = () => {
    if (!("speechSynthesis" in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const chapter = book.chapters[currentPage - 1] || book.chapters[0];
      const textToRead = chapter
        ? `${chapter.chapterTitle}. ${chapter.content}`
        : `${book.title}. ${book.description}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = "ta-IN";
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const currentChapter = book.chapters[currentPage - 1];

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${book.title} PDF Viewer`}
      className={`fixed inset-0 z-50 flex flex-col backdrop-blur-2xl transition-colors duration-200 select-none ${
        isDark ? "bg-slate-950/95 text-slate-100" : "bg-stone-900/90 text-stone-100"
      }`}
    >
      {/* Top Header & Toolbar */}
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/20 bg-slate-900/90 px-3 sm:px-6 py-2.5 shadow-md">
        {/* Left: Book Meta & Close */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:border-amber-400 hover:bg-slate-700 hover:text-amber-300 transition-colors"
            title="மூடு (Close)"
            aria-label="Close PDF Viewer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">திரும்பு</span>
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-400/30">
                {book.issueNumber || "இதழ்"}
              </span>
              <h2 className="truncate text-xs sm:text-sm font-bold text-slate-100" title={book.title}>
                {book.title}
              </h2>
            </div>
            <p className="hidden md:block truncate text-[11px] text-slate-400">
              {book.publisher || book.author}
            </p>
          </div>
        </div>

        {/* Center: Page Controls & Zoom */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border border-slate-700 bg-slate-800/80 p-0.5">
            <button
              onClick={() => setViewMode("canvas")}
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                viewMode === "canvas"
                  ? "bg-amber-500 text-slate-950 font-bold"
                  : "text-slate-300 hover:text-white"
              }`}
              title="PDF காட்சி முறை (PDF Canvas)"
            >
              <FileText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">PDF</span>
            </button>
            <button
              onClick={() => setViewMode("article")}
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                viewMode === "article"
                  ? "bg-amber-500 text-slate-950 font-bold"
                  : "text-slate-300 hover:text-white"
              }`}
              title="வாசிப்பு முறை (Tamil Reader View)"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">கட்டுரை</span>
            </button>
          </div>

          {/* Page Selector */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2 py-1 text-xs">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="rounded p-0.5 text-slate-300 hover:text-amber-400 disabled:opacity-30 disabled:cursor-not-allowed"
              title="முந்தைய பக்கம் (Previous Page)"
              aria-label="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="font-semibold text-amber-300 min-w-[20px] text-center">
              {currentPage}
            </span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-400">{numPages}</span>

            <button
              onClick={handleNextPage}
              disabled={currentPage >= numPages}
              className="rounded p-0.5 text-slate-300 hover:text-amber-400 disabled:opacity-30 disabled:cursor-not-allowed"
              title="அடுத்த பக்கம் (Next Page)"
              aria-label="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Zoom controls (only in Canvas mode) */}
          {viewMode === "canvas" && (
            <div className="hidden sm:flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-1.5 py-1">
              <button
                onClick={handleZoomOut}
                disabled={scale <= 0.6}
                className="rounded p-1 text-slate-300 hover:text-amber-400 disabled:opacity-30"
                title="சிறிதாக்கு (Zoom Out)"
                aria-label="Zoom Out"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="px-1 text-[11px] font-semibold text-slate-300">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={scale >= 2.5}
                className="rounded p-1 text-slate-300 hover:text-amber-400 disabled:opacity-30"
                title="பெரிதாக்கு (Zoom In)"
                aria-label="Zoom In"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleRotate}
                className="rounded p-1 text-slate-300 hover:text-amber-400"
                title="சுழற்று (Rotate)"
                aria-label="Rotate Page"
              >
                <RotateCw className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Thumbnails Drawer Toggle */}
          <button
            onClick={() => setShowThumbnails(!showThumbnails)}
            className={`hidden sm:flex items-center gap-1 rounded-lg border px-2 py-1 text-xs transition-colors ${
              showThumbnails
                ? "border-amber-400 bg-amber-400/20 text-amber-300"
                : "border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white"
            }`}
            title="பக்கங்கள் சிறுபடம் (Thumbnails)"
          >
            <Layers className="h-3.5 w-3.5" />
            <span className="hidden md:inline">பக்கங்கள்</span>
          </button>

          {/* Audio Listen in Article View */}
          {viewMode === "article" && (
            <button
              onClick={toggleSpeech}
              className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-medium transition-colors ${
                isSpeaking
                  ? "border-emerald-400 bg-emerald-500/20 text-emerald-300"
                  : "border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white"
              }`}
              title={isSpeaking ? "நிறுத்து (Stop Speech)" : "கேட்க (Listen to Tamil Text)"}
            >
              {isSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{isSpeaking ? "நிறுத்து" : "கேட்க"}</span>
            </button>
          )}
        </div>

        {/* Right: Download PDF & Fullscreen */}
        <div className="flex items-center gap-2">
          {/* Prominent Download Button */}
          <button
            onClick={() => onDownload(book)}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-1.5 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 active:scale-95 transition-all"
            title={`${book.title} முழு PDF பதிவிறக்கம் செய்க`}
          >
            <Download className="h-3.5 w-3.5" />
            <span>PDF பதிவிறக்கு</span>
            {book.fileSize && (
              <span className="hidden sm:inline opacity-80 text-[10px]">({book.fileSize})</span>
            )}
          </button>

          <button
            onClick={handleToggleFullscreen}
            className="hidden sm:flex rounded-lg border border-slate-700 bg-slate-800/80 p-1.5 text-slate-300 hover:text-amber-400 transition-colors"
            title={isFullscreen ? "முழுத்திரையை நீக்கு (Exit Fullscreen)" : "முழுத்திரை (Fullscreen)"}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>

          <button
            onClick={onClose}
            className="rounded-lg border border-slate-700 bg-slate-800/80 p-1.5 text-slate-400 hover:bg-rose-500 hover:text-white transition-colors"
            title="மூடு (Exit)"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Thumbnails Sidebar / Drawer */}
        {showThumbnails && (
          <aside className="w-48 sm:w-56 flex-shrink-0 border-r border-slate-800 bg-slate-900/90 p-3 overflow-y-auto z-10 transition-all">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400">பக்கங்கள் ({numPages})</span>
              <button
                onClick={() => setShowThumbnails(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: numPages }, (_, i) => i + 1).map((pNum) => (
                <button
                  key={pNum}
                  onClick={() => setCurrentPage(pNum)}
                  className={`flex flex-col items-center p-1.5 rounded-lg border text-center transition-all ${
                    currentPage === pNum
                      ? "border-amber-400 bg-amber-500/20 text-amber-300 shadow-sm"
                      : "border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <div className="h-20 w-14 rounded bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-[10px] text-slate-500">
                    பக்கம் {pNum}
                  </div>
                  <span className="mt-1 text-[11px] font-semibold">{pNum}</span>
                </button>
              ))}
            </div>
          </aside>
        )}

        {/* Center Reader Area */}
        <main className="flex-1 flex flex-col items-center justify-center overflow-auto p-2 sm:p-6 bg-slate-950/80">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <RefreshCw className="h-8 w-8 animate-spin text-amber-400" />
              <p className="text-sm font-medium text-slate-300">
                இதழ் பக்கங்கள் ஏற்றப்படுகின்றன... தயவுசெய்து காத்திருக்கவும்.
              </p>
            </div>
          ) : viewMode === "canvas" ? (
            <div className="flex flex-col items-center">
              {/* PDF Canvas with High Quality Shadow */}
              <div className="relative rounded-lg shadow-2xl shadow-black/80 ring-1 ring-slate-800 bg-white">
                <canvas ref={canvasRef} className="block max-w-full" />
              </div>

              {/* Floating Quick Navigation in Canvas Mode */}
              <div className="mt-4 flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/90 px-4 py-1.5 shadow-xl backdrop-blur-md">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage <= 1}
                  className="rounded-full p-1 text-slate-300 hover:bg-slate-800 hover:text-amber-400 disabled:opacity-30"
                  title="முந்தைய பக்கம்"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-semibold text-slate-200">
                  பக்கம் <span className="text-amber-400 font-bold">{currentPage}</span> / {numPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage >= numPages}
                  className="rounded-full p-1 text-slate-300 hover:bg-slate-800 hover:text-amber-400 disabled:opacity-30"
                  title="அடுத்த பக்கம்"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Enhanced Tamil Article Reader View */
            <div className="w-full max-w-3xl rounded-2xl border border-amber-500/20 bg-slate-900/95 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
              {/* Article Header */}
              <div className="mb-6 border-b border-amber-500/20 pb-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-amber-400">
                    பக்கம் {currentPage} / {numPages}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{book.monthYear}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-amber-300 font-serif leading-relaxed">
                  {currentChapter ? currentChapter.chapterTitle : book.title}
                </h3>
              </div>

              {/* Article Content */}
              <div className="prose prose-invert max-w-none text-slate-200 leading-loose text-base sm:text-lg space-y-4">
                {currentChapter ? (
                  currentChapter.content.split("\n\n").map((para, idx) => (
                    <p key={idx} className="whitespace-pre-line text-slate-300">
                      {para}
                    </p>
                  ))
                ) : (
                  <p className="text-slate-300 leading-relaxed">{book.description}</p>
                )}
              </div>

              {/* Table of contents quick jumps */}
              {book.tableOfContents && (
                <div className="mt-8 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
                    இதழின் பொருளடக்கம் (Table of Contents)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {book.tableOfContents.map((item) => (
                      <button
                        key={item.page}
                        onClick={() => setCurrentPage(item.page)}
                        className={`text-left p-2 rounded-lg border transition-colors ${
                          currentPage === item.page
                            ? "border-amber-400 bg-amber-400/10 text-amber-300 font-bold"
                            : "border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                        }`}
                      >
                        <span className="text-amber-500 font-semibold mr-1.5">பக்கம் {item.page}:</span>
                        {item.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer navigation */}
              <div className="mt-8 flex items-center justify-between border-t border-slate-800 pt-4">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage <= 1}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:border-amber-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                  முந்தைய பக்கம்
                </button>

                <button
                  onClick={() => onDownload(book)}
                  className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:underline"
                >
                  <Download className="h-4 w-4" />
                  முழு PDF பதிவிறக்கு
                </button>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage >= numPages}
                  className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  அடுத்த பக்கம்
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PDFModalViewer;

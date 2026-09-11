import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, CheckCircle, X } from "lucide-react";

interface WelcomeToastProps {
  message: string | null;
  onClose: () => void;
  duration?: number; // duration in ms, default 4500
}

export default function WelcomeToast({ message, onClose, duration = 4500 }: WelcomeToastProps) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, onClose, duration]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-[92%] sm:w-auto max-w-lg mx-auto"
          role="alert"
          aria-live="polite"
        >
          <div className="relative overflow-hidden bg-[#0c1830]/95 backdrop-blur-xl border border-[#f0c15c]/60 rounded-2xl p-4 sm:px-5 sm:py-3.5 text-stone-100 shadow-[0_12px_36px_rgba(0,0,0,0.45),0_0_20px_rgba(240,193,92,0.15)] flex items-center justify-between gap-3">
            
            {/* Left Glow Accent */}
            <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-gradient-to-b from-[#f5ca6a] via-[#f0c15c] to-[#d48c1a]" />

            {/* Icon + Content */}
            <div className="flex items-center gap-3 pl-1 pr-2">
              <div className="w-9 h-9 rounded-xl bg-[#f0c15c]/15 border border-[#f0c15c]/40 text-[#f0c15c] flex items-center justify-center flex-shrink-0 shadow-inner">
                <BookOpen size={18} className="animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#f0c15c] font-bold">
                  Kaviyam Reading
                </span>
                <p className="text-xs sm:text-sm font-semibold text-stone-100 leading-snug">
                  {message}
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800/60 rounded-lg transition cursor-pointer flex-shrink-0"
              title="Close notification"
              aria-label="Close notification"
            >
              <X size={16} />
            </button>

            {/* Animated Bottom Timer Bar */}
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: duration / 1000, ease: "linear" }}
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f0c15c] origin-left"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

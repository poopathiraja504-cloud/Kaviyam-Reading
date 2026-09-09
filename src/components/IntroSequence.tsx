import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import closedBookImg from "../assets/images/intro_closed_book.jpg";
import openBookImg from "../assets/images/intro_open_book.jpg";

export default function IntroSequence({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // Phase 0: 0.0 - 1.5s (Closed book on table)
    const t1 = setTimeout(() => setPhase(1), 1500); 
    // Phase 1: 1.5 - 3.0s (Book slowly opens, soft warm golden light)
    const t2 = setTimeout(() => setPhase(2), 3000); 
    // Phase 2: 3.0 - 4.5s (Pages turn, golden light brighter, main focus)
    const t3 = setTimeout(() => setPhase(3), 4500); 
    // Phase 3: 4.5 - 6.0s (Transition to dark library background, golden glow in center, logo emblem appears)
    const t4 = setTimeout(() => setPhase(4), 6000); 
    // Phase 4: 6.0 - 7.2s (Kaviyam Reading & tagline text appears)
    const t5 = setTimeout(() => setPhase(5), 7200); 
    // Phase 5: 7.2 - 8.0s (Hold logo screen)
    // 8.0s (Trigger exit transition, unmounting component with a 2-second fade)
    const t6 = setTimeout(() => onComplete(), 8000); 

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 2, ease: "easeInOut" } }}
      className="fixed inset-0 z-[9999] bg-[#050b14] overflow-hidden flex items-center justify-center"
    >
      {/* 0.0 - 1.5s: Closed Book Scene */}
      <motion.img
        src={closedBookImg}
        initial={{ scale: 1, opacity: 1 }}
        animate={{ 
          scale: 1.05, 
          opacity: phase < 1 ? 0.7 : 0 
        }}
        transition={{ duration: 1.5, ease: "linear" }}
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* 1.5 - 4.5s: Open Book & Glow Scene */}
      <motion.img
        src={openBookImg}
        initial={{ scale: 1.05, opacity: 0 }}
        animate={{ 
          scale: phase >= 3 ? 1.15 : 1.1, 
          opacity: phase >= 1 && phase < 3 ? 0.7 : (phase >= 3 ? 0.2 : 0) // fades out slightly for logo phase 3
        }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark Navy Overlay for text contrast */}
      <div className="absolute inset-0 bg-[#050b14]/50 mix-blend-multiply pointer-events-none" />

      {/* Golden Light Glow Engine */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: phase >= 1 && phase < 3 ? 0.7 : (phase >= 3 ? 0.4 : 0), 
          scale: phase >= 2 ? 1.2 : 1 
        }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div className="w-[120vw] h-[120vw] md:w-[60vw] md:h-[60vw] rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.4)_0%,rgba(5,11,20,0)_60%)] blur-[60px] mix-blend-screen" />
      </motion.div>

      {/* Floating Dust Particles */}
      <AnimatePresence>
        {phase >= 1 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            transition={{ duration: 1.5 }}
            className="absolute inset-0 overflow-hidden pointer-events-none z-10"
          >
            {[...Array(40)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 0, 
                  y: "60%", 
                  x: `${Math.random() * 100}%`,
                  scale: Math.random() * 0.5 + 0.5
                }}
                animate={{ 
                  opacity: [0, 1, 0], 
                  y: "-20%",
                  x: `${Math.random() * 100}%`
                }}
                transition={{ 
                  duration: 3 + Math.random() * 3, 
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "linear"
                }}
                className="absolute bottom-1/2 w-1 h-1 bg-[#ffdf73] rounded-full blur-[1px] shadow-[0_0_8px_2px_rgba(212,175,55,0.8)]"
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Typography & Logo Sequence */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center mt-12 w-full px-4">
        <AnimatePresence>
          {phase >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="flex flex-col items-center"
            >
              {/* Logo Emblem (4.5s) */}
              <div className="mb-6 relative">
                <div className="absolute inset-0 bg-[#d4af37] blur-[30px] opacity-30 rounded-full" />
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#d4af37] relative z-10 drop-shadow-[0_0_15px_rgba(212,175,55,0.8)]">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
              </div>

              {/* Title Text (6.0s) */}
              <AnimatePresence>
                {phase >= 4 && (
                  <motion.h1 
                    initial={{ opacity: 0, filter: "blur(10px)", y: 10 }}
                    animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="font-serif text-5xl md:text-7xl font-bold tracking-tight text-[#fdfbf7] drop-shadow-2xl"
                  >
                    Kaviyam <span className="text-[#d4af37]">Reading</span>
                  </motion.h1>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Subtitle (6.0s) */}
        <AnimatePresence>
          {phase >= 4 && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.4 }}
              className="text-[#e8e2cf] font-serif text-sm md:text-lg tracking-wide mt-6 drop-shadow-lg"
            >
              Books bring new worlds, new thoughts, new you.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Skip Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        onClick={onComplete}
        className="absolute bottom-8 right-8 text-[#e8e2cf]/40 hover:text-[#d4af37] font-mono text-[10px] tracking-[0.2em] uppercase transition-colors z-30 cursor-pointer px-4 py-2"
      >
        Skip
      </motion.button>
    </motion.div>
  );
}

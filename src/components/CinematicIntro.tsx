import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  X, 
  Sparkles, 
  BookOpen, 
  ChevronRight,
  Maximize2
} from "lucide-react";
import KaviyamBrandLogo from "./KaviyamBrandLogo";

interface CinematicIntroProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export default function CinematicIntro({ isOpen, onClose, onComplete }: CinematicIntroProps) {
  const [time, setTime] = useState<number>(0); // 0 to 10 seconds
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Storyboard timeline scenes definition
  const scenes = [
    { id: 0, timeRange: [0, 1], name: "0–1s", label: "Dark Vintage Library", desc: "Antique book on wooden table, warm candlelight, floating dust" },
    { id: 1, timeRange: [1, 2], name: "1–2s", label: "The First Spark", desc: "Book opens automatically, golden glow shines from pages" },
    { id: 2, timeRange: [2, 3], name: "2–3s", label: "Magical Page Turning", desc: "Book opens wider, slow-motion page flip, glowing sparks" },
    { id: 3, timeRange: [3, 4], name: "3–4s", label: "Light Trails & 'Kaviyam'", desc: "Macro camera push-in, light trails emerge, 'Kaviyam' title floats" },
    { id: 4, timeRange: [4, 5], name: "4–5s", label: "Logo & Brand Reveal", desc: "Golden book logo appears above title, atmospheric glow" },
    { id: 5, timeRange: [5, 6], name: "5–6s", label: "Full Identity & Tagline", desc: "'Kaviyam Reading' with 'Books bring new worlds, new thoughts, new you.'" },
    { id: 6, timeRange: [6, 7], name: "6–7s", label: "Library Camera Flight", desc: "Cinematic movement through library, bookshelves softly blurred" },
    { id: 7, timeRange: [7, 8], name: "7–8s", label: "Breeze & Open Pages", desc: "Return to open glowing book, pages move gently in breeze" },
    { id: 8, timeRange: [8, 9], name: "8–9s", label: "Cinematic Pull-Back", desc: "Camera pulls back, library visible, particles fade" },
    { id: 9, timeRange: [9, 10], name: "9–10s", label: "Final Title Screen", desc: "Pristine brand screen, golden glow & fade to dark" },
  ];

  // Sound Synthesizer via Web Audio API for rich cinematic sound
  const playCinematicSound = (timeSec: number) => {
    if (isMuted) return;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Page turn sound triggers at ~1.2s and ~2.2s and ~7.2s
      if ((Math.abs(timeSec - 1.2) < 0.05) || (Math.abs(timeSec - 2.2) < 0.05) || (Math.abs(timeSec - 7.2) < 0.05)) {
        const bufferSize = ctx.sampleRate * 0.15;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = 1200;
        filter.Q.value = 1.2;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start();
      }

      // Shimmer chime at ~2.0s & ~4.2s
      if (Math.abs(timeSec - 2.0) < 0.05 || Math.abs(timeSec - 4.2) < 0.05) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }

      // Logo Reveal Warm Whoosh at ~4.5s
      if (Math.abs(timeSec - 4.5) < 0.05) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(110, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.8);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.8);
      }
    } catch {
      // Audio context fallback safeguard
    }
  };

  // Main playback timer loop
  useEffect(() => {
    if (!isOpen) return;

    let lastTimestamp = performance.now();

    const loop = (now: number) => {
      const delta = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      if (isPlaying) {
        setTime((prevTime) => {
          const next = prevTime + delta;
          if (next >= 10) {
            setIsPlaying(false);
            if (onComplete) onComplete();
            return 10;
          }
          return next;
        });
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, isPlaying, onComplete]);

  // Sync active scene index based on time
  useEffect(() => {
    const idx = scenes.findIndex((s) => time >= s.timeRange[0] && time < s.timeRange[1]);
    if (idx !== -1) {
      setActiveSceneIndex(idx);
    } else if (time >= 10) {
      setActiveSceneIndex(9);
    }
    playCinematicSound(time);
  }, [time]);

  // Particle Canvas Background Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener("resize", handleResize);

    // Particle definition
    const particleCount = 85;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 0.5,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: -Math.random() * 0.6 - 0.2,
      opacity: Math.random() * 0.7 + 0.2,
      color: Math.random() > 0.3 ? "#F59E0B" : "#FDE68A",
    }));

    let animationId: number;

    const renderCanvas = () => {
      ctx.clearRect(0, 0, width, height);

      // Render dark mysterious library gradient
      const bgGrad = ctx.createRadialGradient(
        width / 2,
        height * 0.6,
        50,
        width / 2,
        height / 2,
        Math.max(width, height)
      );

      // Intensity of golden ambient light varies with scene (peaks around 3-6s)
      const lightIntensity = Math.min(1, Math.max(0.15, Math.sin((time / 10) * Math.PI) * 1.2));

      bgGrad.addColorStop(0, `rgba(180, 115, 20, ${0.22 * lightIntensity})`);
      bgGrad.addColorStop(0.4, `rgba(20, 30, 45, ${0.8 + 0.1 * (1 - lightIntensity)})`);
      bgGrad.addColorStop(1, "#080C14");

      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Volumetric golden light beam from open book center (around 1.5s to 8.5s)
      if (time >= 1 && time <= 8.8) {
        const beamAlpha = Math.sin(((time - 1) / 7.8) * Math.PI) * 0.35;
        const beamGrad = ctx.createLinearGradient(width / 2, height * 0.7, width / 2, 0);
        beamGrad.addColorStop(0, `rgba(251, 191, 36, ${beamAlpha * 1.5})`);
        beamGrad.addColorStop(0.5, `rgba(245, 158, 11, ${beamAlpha * 0.8})`);
        beamGrad.addColorStop(1, "rgba(245, 158, 11, 0)");

        ctx.beginPath();
        ctx.moveTo(width * 0.25, height);
        ctx.lineTo(width * 0.4, 0);
        ctx.lineTo(width * 0.6, 0);
        ctx.lineTo(width * 0.75, height);
        ctx.closePath();
        ctx.fillStyle = beamGrad;
        ctx.fill();
      }

      // Draw floating golden magical particles
      particles.forEach((p) => {
        p.y += p.speedY * (1 + (time > 2 && time < 8 ? 0.8 : 0));
        p.x += p.speedX + Math.sin(p.y * 0.02) * 0.2;

        if (p.y < -10) p.y = height + 10;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (time > 2 && time < 5 ? 1.4 : 1), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity * (0.4 + 0.6 * lightIntensity);
        ctx.shadowColor = "#F59E0B";
        ctx.shadowBlur = p.size * 4;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      });

      animationId = requestAnimationFrame(renderCanvas);
    };

    renderCanvas();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [time]);

  if (!isOpen) return null;

  // Scene calculations for camera transforms and 3D effects
  const progress = Math.min(1, Math.max(0, time / 10));

  // Camera zoom factor simulation
  let zoomScale = 1;
  let bookOpenAngle = 0; // 0 to 180 degrees
  let pageFlipAngle = 0; // 0 to 180 degrees
  let logoOpacity = 0;
  let titleScale = 0.9;

  if (time < 1) {
    // 0-1s: Slow push toward closed book
    zoomScale = 1 + time * 0.15;
    bookOpenAngle = 0;
  } else if (time < 2) {
    // 1-2s: Book begins opening (0 to 45 deg)
    zoomScale = 1.15 + (time - 1) * 0.15;
    bookOpenAngle = (time - 1) * 45;
  } else if (time < 3) {
    // 2-3s: Book opens wide (45 to 160 deg), pages flip
    zoomScale = 1.30 + (time - 2) * 0.2;
    bookOpenAngle = 45 + (time - 2) * 115;
    pageFlipAngle = (time - 2) * 180;
  } else if (time < 4) {
    // 3-4s: Macro view into glowing open book, title 'Kaviyam' floats
    zoomScale = 1.5 + (time - 3) * 0.25;
    bookOpenAngle = 160;
    pageFlipAngle = 180;
  } else if (time < 5) {
    // 4-5s: Smooth transition to Kaviyam logo reveal
    zoomScale = 1.75 - (time - 4) * 0.35;
    bookOpenAngle = 160;
    logoOpacity = (time - 4);
    titleScale = 0.9 + (time - 4) * 0.1;
  } else if (time < 6) {
    // 5-6s: Full title & tagline visible
    zoomScale = 1.4;
    logoOpacity = 1;
    titleScale = 1;
  } else if (time < 7) {
    // 6-7s: Camera flight through library
    zoomScale = 1.4 + Math.sin((time - 6) * Math.PI) * 0.08;
    logoOpacity = 1;
    titleScale = 1;
  } else if (time < 8) {
    // 7-8s: Return to open book with breeze
    zoomScale = 1.4 + (time - 7) * 0.1;
    bookOpenAngle = 160;
    pageFlipAngle = Math.sin((time - 7) * Math.PI * 2) * 20;
    logoOpacity = 0.8;
  } else if (time < 9) {
    // 8-9s: Camera pulls back
    zoomScale = 1.5 - (time - 8) * 0.4;
    bookOpenAngle = 160;
    logoOpacity = 0.9;
  } else {
    // 9-10s: Final title screen with dark fade
    zoomScale = 1.1;
    logoOpacity = 1;
    titleScale = 1;
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#080C14] text-white flex flex-col justify-between overflow-hidden select-none font-serif">
      
      {/* Background Interactive Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Top Bar Controls */}
      <div className="relative z-20 px-4 sm:px-8 py-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3">
          <span className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-mono font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>10S CINEMATIC INTRO</span>
          </span>
          <span className="text-xs text-amber-200/70 hidden sm:inline font-sans">
            Kaviyam Reading Luxury Brand Reveal
          </span>
        </div>

        <div className="flex items-center gap-2 font-sans">
          {/* Mute Toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-stone-300 hover:text-white transition-all text-xs flex items-center gap-1.5 cursor-pointer"
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4 text-amber-300" />}
            <span className="hidden md:inline">{isMuted ? "Muted" : "Audio On"}</span>
          </button>

          {/* Replay */}
          <button
            onClick={() => {
              setTime(0);
              setIsPlaying(true);
            }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-stone-300 hover:text-white transition-all text-xs flex items-center gap-1.5 cursor-pointer"
            title="Replay Intro"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden md:inline">Replay</span>
          </button>

          {/* Close / Skip */}
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-bold text-xs shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Enter App</span>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CENTER CINEMATIC STAGE */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden">
        
        {/* Animated Scene Wrapper applying Cinematic Camera Zoom */}
        <div 
          className="relative w-full max-w-4xl aspect-[16/9] flex items-center justify-center transition-transform duration-300 ease-out"
          style={{ transform: `scale(${zoomScale})` }}
        >

          {/* ==================== SCENE 0-3s & 7-8s: THE ANTIQUE BOOK ON TABLE ==================== */}
          {(time < 4 || (time >= 7 && time < 9)) && (
            <div className="absolute inset-0 flex items-center justify-center">
              
              {/* Background Vintage Library Environment */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0a06] via-[#121824] to-[#080C14] rounded-3xl overflow-hidden border border-amber-900/30 shadow-2xl">
                
                {/* Background Library Bookshelves & Candle Light Flicker */}
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_30%,#f59e0b_0%,transparent_50%)] animate-pulse" />
                
                {/* Vintage Wooden Table Top */}
                <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-[#1b120c] to-[#2c1c13] border-t border-amber-900/40 shadow-inner flex items-center justify-center">
                  
                  {/* Subtle Candle Shadow */}
                  <div className="w-96 h-12 bg-amber-500/10 rounded-full blur-xl" />
                </div>

                {/* Closed / Opening Antique Black & Gold Book */}
                <div className="relative z-10 mt-12 flex flex-col items-center">
                  
                  {/* Book 3D Structure */}
                  <div className="relative w-64 sm:w-80 h-40 sm:h-48 perspective-1000">
                    
                    {/* Golden Magical Radiation from between pages */}
                    {bookOpenAngle > 5 && (
                      <div 
                        className="absolute inset-0 bg-gradient-to-t from-amber-400 via-amber-300 to-transparent blur-md rounded-full transition-opacity duration-300"
                        style={{ opacity: Math.min(1, bookOpenAngle / 60) }}
                      />
                    )}

                    {/* Book Left Page Base */}
                    <div className={`absolute left-0 top-0 w-1/2 h-full bg-[#1A120B] border-2 border-[#D4AF37] rounded-l-xl shadow-2xl flex items-center justify-center p-4 transition-all duration-300 ${bookOpenAngle > 0 ? "rotate-y-[-10deg]" : ""}`}>
                      {bookOpenAngle > 10 ? (
                        <div className="w-full h-full bg-[#FAF4E8] rounded-l-md p-3 text-[8px] text-stone-800 font-serif leading-relaxed opacity-90 shadow-inner overflow-hidden">
                          <p className="font-bold text-[#3B0B12] mb-1">காவியம் வாசிப்பு - அத்தியாயம் 1</p>
                          <p className="opacity-75">புத்தகங்கள் புதிய உலகங்களை, புதிய எண்ணங்களை, புதிய உங்களை உருவாக்குகின்றன.</p>
                        </div>
                      ) : (
                        <div className="text-center space-y-1">
                          <div className="w-8 h-8 mx-auto border border-[#D4AF37] rounded-full flex items-center justify-center text-[#D4AF37] text-xs font-bold">K</div>
                          <span className="block text-[8px] tracking-widest text-[#D4AF37] font-serif uppercase">Kaviyam</span>
                        </div>
                      )}
                    </div>

                    {/* Book Right Page (Flipping Cover) */}
                    <div 
                      className="absolute right-0 top-0 w-1/2 h-full bg-[#1A120B] border-2 border-[#D4AF37] rounded-r-xl shadow-2xl origin-left transition-transform duration-500 ease-in-out flex items-center justify-center p-4"
                      style={{ 
                        transform: `rotateY(${-bookOpenAngle}deg)`,
                        transformStyle: "preserve-3d"
                      }}
                    >
                      {bookOpenAngle > 90 ? (
                        <div className="w-full h-full bg-[#FAF4E8] rounded-r-md p-3 text-[8px] text-stone-800 font-serif leading-relaxed opacity-90 shadow-inner overflow-hidden transform scale-x-[-1]">
                          <p className="font-bold text-[#3B0B12] mb-1">The Magic of Books</p>
                          <p className="opacity-75">Books bring new worlds, new thoughts, new you.</p>
                        </div>
                      ) : (
                        <div className="text-center space-y-1">
                          <div className="w-8 h-8 mx-auto border border-[#D4AF37] rounded-full flex items-center justify-center text-[#D4AF37] text-xs font-bold">K</div>
                          <span className="block text-[8px] tracking-widest text-[#D4AF37] font-serif uppercase">Reading</span>
                        </div>
                      )}
                    </div>

                    {/* Floating Page Flip Effect (2s - 3s) */}
                    {time >= 2 && time < 3.5 && (
                      <div 
                        className="absolute left-1/2 top-0 w-1/2 h-full bg-[#FFFBF2] border border-[#D4AF37]/50 rounded-r-md origin-left transition-transform duration-300 opacity-80 shadow-lg"
                        style={{ transform: `rotateY(${-pageFlipAngle}deg)` }}
                      />
                    )}

                  </div>

                  {/* Table Reflection */}
                  <div className="w-64 sm:w-80 h-6 bg-gradient-to-b from-amber-500/20 to-transparent rounded-full blur-sm mt-1" />
                </div>

              </div>
            </div>
          )}

          {/* ==================== SCENE 3-4s: LIGHT TRAILS & "KAVIYAM" EMERGENCE ==================== */}
          {time >= 3 && time < 5 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center space-y-4">
              <div className="animate-fade-in transition-all duration-700">
                <span className="text-amber-400 text-xs font-sans font-bold tracking-[0.4em] uppercase block mb-2 opacity-80">
                  LITERARY REALM
                </span>
                <h1 className="font-serif font-black text-5xl sm:text-7xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 drop-shadow-[0_10px_25px_rgba(245,158,11,0.5)]">
                  Kaviyam
                </h1>
                <div className="w-32 h-0.5 mx-auto mt-3 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
              </div>
            </div>
          )}

          {/* ==================== SCENE 4-10s: FULL BRAND REVEAL & TAGLINE ==================== */}
          {time >= 4 && (
            <div 
              className="absolute inset-0 flex flex-col items-center justify-center z-30 text-center px-4 transition-all duration-1000"
              style={{ opacity: logoOpacity, transform: `scale(${titleScale})` }}
            >
              {/* Radial Golden Atmospheric Glow Background */}
              <div className="absolute w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />

              <div className="relative z-10 space-y-5">
                
                {/* Official Golden Book Logo Emblem */}
                <div className="inline-block drop-shadow-[0_0_35px_rgba(245,158,11,0.6)] transform transition-transform duration-700 hover:scale-105">
                  <KaviyamBrandLogo size="xl" variant="gold" showWordmark={false} />
                </div>

                {/* Title */}
                <div className="space-y-1">
                  <h1 className="font-serif font-black text-4xl sm:text-6xl tracking-wider text-amber-200 drop-shadow-[0_4px_15px_rgba(0,0,0,0.8)]">
                    Kaviyam Reading
                  </h1>
                  <p className="text-xs sm:text-sm font-serif italic text-amber-300/90 tracking-wide font-medium max-w-lg mx-auto leading-relaxed">
                    "Books bring new worlds, new thoughts, new you."
                  </p>
                </div>

                {/* Tamil Translation Badge */}
                <div className="pt-2">
                  <span className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[#FDE68A] text-xs font-serif tracking-widest">
                    புத்தகங்கள் புதிய உலகங்களை, புதிய எண்ணங்களை, புதிய உங்களை உருவாக்குகின்றன.
                  </span>
                </div>

                {/* Final 9-10s Call to Action */}
                {time >= 8.5 && (
                  <div className="pt-4 animate-fade-in">
                    <button
                      onClick={onClose}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#F59E0B] to-[#B87333] text-black font-serif font-bold text-sm shadow-xl hover:brightness-110 transition-all flex items-center gap-2 mx-auto cursor-pointer group"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Start Reading Journey</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                )}

              </div>
            </div>
          )}

        </div>

      </div>

      {/* BOTTOM TIMELINE CONTROLLER (0s to 10s Scrubber) */}
      <div className="relative z-20 px-4 sm:px-8 py-5 bg-gradient-to-t from-black via-black/90 to-transparent space-y-3">
        
        {/* Storyboard 10-Second Step Tabs */}
        <div className="hidden lg:grid grid-cols-10 gap-1.5 max-w-5xl mx-auto">
          {scenes.map((scene, idx) => {
            const isActive = activeSceneIndex === idx;
            const isPassed = time >= scene.timeRange[1];

            return (
              <button
                key={scene.id}
                onClick={() => {
                  setTime(scene.timeRange[0]);
                  setIsPlaying(true);
                }}
                className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                  isActive
                    ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-md scale-105"
                    : isPassed
                    ? "bg-stone-900/80 border-amber-900/40 text-amber-200/60 hover:border-amber-500/40"
                    : "bg-stone-900/40 border-stone-800 text-stone-500 hover:border-stone-700"
                }`}
              >
                <span className="block font-mono text-[9px] font-bold text-amber-400">{scene.name}</span>
                <span className="block font-serif text-[10px] font-bold truncate">{scene.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrub Bar & Media Controls */}
        <div className="max-w-4xl mx-auto flex items-center gap-3 sm:gap-4">
          
          {/* Play / Pause Toggle */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold shadow-lg transition-all cursor-pointer shrink-0"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          {/* Time Scrubber Slider */}
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-amber-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
                {scenes[activeSceneIndex]?.label} ({scenes[activeSceneIndex]?.name})
              </span>
              <span className="text-stone-400">
                {time.toFixed(1)}s / 10.0s
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={10}
              step={0.05}
              value={time}
              onChange={(e) => {
                setTime(parseFloat(e.target.value));
              }}
              className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Quick Scene Skip */}
          <div className="shrink-0 text-right font-sans">
            <button
              onClick={() => {
                const nextTime = Math.min(10, Math.floor(time) + 1);
                setTime(nextTime);
              }}
              className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
            >
              +1s Step
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}

import React, { useState, useEffect } from "react";
import { 
  triggerHaptic, 
  getHapticSettings, 
  saveHapticSettings, 
  HapticSettings, 
  HapticPatternType,
  playTactileSound
} from "../utils/haptics";
import { Volume2, VolumeX, Sparkles, Sliders, Smartphone, Check, Play, Zap, Shield, X, Radio } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ThreeDVibrationControlProps {
  isOpen?: boolean;
  onClose?: () => void;
  inline?: boolean;
}

export const ThreeDVibrationControl: React.FC<ThreeDVibrationControlProps> = ({
  isOpen = false,
  onClose,
  inline = false,
}) => {
  const [settings, setSettings] = useState<HapticSettings>(getHapticSettings());
  const [activeShockwave, setActiveShockwave] = useState<HapticPatternType | null>(null);
  const [testLog, setTestLog] = useState<string>("3D Vibration Engine Ready");

  useEffect(() => {
    const handleVibrationEvent = (e: any) => {
      if (e?.detail?.patternType) {
        setActiveShockwave(e.detail.patternType);
        setTimeout(() => setActiveShockwave(null), 600);
      }
    };
    window.addEventListener("kaviyam-3d-vibration", handleVibrationEvent);
    return () => window.removeEventListener("kaviyam-3d-vibration", handleVibrationEvent);
  }, []);

  const updateSettings = (newPartial: Partial<HapticSettings>) => {
    const updated = saveHapticSettings(newPartial);
    setSettings(updated);
    triggerHaptic("selection");
  };

  const handleTestPattern = (pattern: HapticPatternType, label: string) => {
    triggerHaptic(pattern);
    playTactileSound(320, 50);
    setTestLog(`Dispatched 3D Vibration: ${label}`);
  };

  const content = (
    <div className={`space-y-5 text-stone-100 ${inline ? "" : "p-6"}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#f0c15c] to-[#d48c1a] text-stone-950 flex items-center justify-center font-bold shadow-[0_0_15px_rgba(240,193,92,0.3)]">
            <Smartphone size={18} className="animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-stone-100 flex items-center gap-2">
              <span>3D Tactile & Vibration Engine</span>
              <span className="text-[10px] bg-[#f0c15c]/20 text-[#f0c15c] px-2 py-0.5 rounded-full font-mono border border-[#f0c15c]/40">
                ACTIVE
              </span>
            </h3>
            <p className="text-[11px] text-stone-400">
              Multi-dimensional haptic feedback & 3D tactile responsiveness
            </p>
          </div>
        </div>
        {onClose && !inline && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Main Toggle Switch */}
      <div className="bg-[#0b1424] border border-stone-800 rounded-xl p-4 flex items-center justify-between shadow-inner">
        <div className="space-y-0.5">
          <span className="font-semibold text-xs text-stone-200 block">3D Haptic Vibration</span>
          <p className="text-[10px] text-stone-400">
            Vibrate device on page flips, button clicks, and interactions
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => updateSettings({ enabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f0c15c]"></div>
        </label>
      </div>

      {/* Vibration Intensity Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-stone-300 flex items-center justify-between">
          <span>Vibration Intensity</span>
          <span className="text-[10px] font-mono text-[#f0c15c] capitalize">{settings.intensity}</span>
        </label>
        <div className="grid grid-cols-4 gap-2">
          {(["soft", "medium", "intense", "extreme"] as const).map((level) => (
            <button
              key={level}
              onClick={() => updateSettings({ intensity: level })}
              className={`py-2 px-1 rounded-lg text-[11px] font-semibold capitalize border transition-all cursor-pointer text-center ${
                settings.intensity === level
                  ? "bg-[#f0c15c] text-stone-950 border-[#f0c15c] shadow-[0_0_12px_rgba(240,193,92,0.3)] font-bold"
                  : "bg-[#0a101d] text-stone-300 border-stone-800 hover:border-stone-700"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Audio Tactile Toggle */}
      <div className="bg-[#0b1424] border border-stone-800 rounded-xl p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {settings.soundEffects ? (
            <Volume2 size={16} className="text-[#f0c15c]" />
          ) : (
            <VolumeX size={16} className="text-stone-500" />
          )}
          <div>
            <span className="font-semibold text-xs text-stone-200 block">Tactile Audio Feedback</span>
            <p className="text-[10px] text-stone-400">Synthesize subtle audio pulse with vibration</p>
          </div>
        </div>
        <button
          onClick={() => updateSettings({ soundEffects: !settings.soundEffects })}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
            settings.soundEffects
              ? "bg-[#f0c15c]/20 text-[#f0c15c] border-[#f0c15c]/40"
              : "bg-stone-900 text-stone-500 border-stone-800"
          }`}
        >
          {settings.soundEffects ? "Enabled" : "Muted"}
        </button>
      </div>

      {/* Interactive 3D Vibration Testing Console */}
      <div className="space-y-2 pt-1 border-t border-stone-800/80">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
            <Zap size={14} className="text-[#f0c15c]" />
            3D Vibration Patterns Test
          </span>
          <span className="text-[10px] font-mono text-stone-400">{testLog}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            { id: "3d-pageflip", label: "3D Page Flip", pattern: "3d-pageflip" as HapticPatternType },
            { id: "3d-pulse", label: "3D Pulse Wave", pattern: "3d-pulse" as HapticPatternType },
            { id: "spatial-heartbeat", label: "Spatial Heartbeat", pattern: "spatial-heartbeat" as HapticPatternType },
            { id: "tactile-click", label: "Tactile Click", pattern: "tactile-click" as HapticPatternType },
            { id: "heavy", label: "Heavy Impact", pattern: "heavy" as HapticPatternType },
            { id: "success", label: "Success Ripple", pattern: "success" as HapticPatternType },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleTestPattern(item.pattern, item.label)}
              className="group relative overflow-hidden bg-[#0a1120] hover:bg-[#121f38] border border-stone-800 hover:border-[#f0c15c]/50 p-2.5 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="space-y-0.5">
                <span className="text-xs font-medium text-stone-200 group-hover:text-[#f0c15c] transition-colors block">
                  {item.label}
                </span>
                <span className="text-[9px] font-mono text-stone-500 block">Tap to Vibrate</span>
              </div>
              <Play size={12} className="text-stone-500 group-hover:text-[#f0c15c] transition-colors" />

              {/* Shockwave visual effect when triggered */}
              {activeShockwave === item.pattern && (
                <motion.div
                  initial={{ scale: 0, opacity: 0.8 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 bg-[#f0c15c]/30 rounded-xl pointer-events-none"
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  if (inline) {
    return content;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="w-full max-w-md bg-[#070d18] border border-stone-800 rounded-2xl shadow-2xl overflow-hidden"
          >
            {content}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ThreeDVibrationControl;

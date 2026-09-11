// 3D Vibration & Spatial Haptic Engine
// Provides multi-pattern tactile vibration support via Web Vibrate API with 3D visual impulse dispatching

export type HapticPatternType = 
  | "light"
  | "medium"
  | "heavy"
  | "selection"
  | "success"
  | "error"
  | "3d-pageflip"
  | "3d-pulse"
  | "spatial-heartbeat"
  | "tactile-click";

export interface HapticSettings {
  enabled: boolean;
  intensity: "soft" | "medium" | "intense" | "extreme";
  soundEffects: boolean;
  threeDTiltEnabled: boolean;
}

const DEFAULT_SETTINGS: HapticSettings = {
  enabled: true,
  intensity: "medium",
  soundEffects: true,
  threeDTiltEnabled: true,
};

export const getHapticSettings = (): HapticSettings => {
  try {
    const stored = localStorage.getItem("kaviyam_3d_haptic_settings");
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.warn("Error reading haptic settings:", e);
  }
  return DEFAULT_SETTINGS;
};

export const saveHapticSettings = (settings: Partial<HapticSettings>) => {
  try {
    const current = getHapticSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem("kaviyam_3d_haptic_settings", JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn("Error saving haptic settings:", e);
    return getHapticSettings();
  }
};

// Vibration patterns in milliseconds [vibrate, pause, vibrate, pause...]
const PATTERNS: Record<HapticPatternType, number[]> = {
  light: [12],
  medium: [25],
  heavy: [50],
  selection: [8],
  success: [15, 30, 25, 40, 35],
  error: [60, 40, 60, 40, 80],
  "3d-pageflip": [8, 15, 20, 10, 30, 15, 8],
  "3d-pulse": [30, 20, 50, 20, 80, 30, 40],
  "spatial-heartbeat": [40, 60, 80, 100, 30],
  "tactile-click": [18, 10, 12],
};

// Intensity multipliers
const INTENSITY_MULTIPLIERS = {
  soft: 0.6,
  medium: 1.0,
  intense: 1.5,
  extreme: 2.2,
};

/**
  Trigger physical 3D vibration feedback on supported devices and dispatch custom UI pulse events
 */
export const triggerHaptic = (patternType: HapticPatternType = "medium") => {
  const settings = getHapticSettings();
  if (!settings.enabled) return;

  const multiplier = INTENSITY_MULTIPLIERS[settings.intensity] || 1.0;
  const basePattern = PATTERNS[patternType] || [20];
  const scaledPattern = basePattern.map((dur) => Math.max(1, Math.round(dur * multiplier)));

  // 1. Hardware device vibration if supported
  if (typeof window !== "undefined" && "navigator" in window && typeof navigator.vibrate === "function") {
    try {
      navigator.vibrate(scaledPattern);
    } catch (e) {
      // Ignore vibration error if blocked by browser policy
    }
  }

  // 2. Dispatch custom window event for 3D visual shockwave/ripple animations
  if (typeof window !== "undefined") {
    const event = new CustomEvent("kaviyam-3d-vibration", {
      detail: {
        patternType,
        pattern: scaledPattern,
        intensity: settings.intensity,
        timestamp: Date.now(),
      },
    });
    window.dispatchEvent(event);
  }
};

/**
  Optional audio click synthesizer for tactile multi-sensory depth
 */
export const playTactileSound = (frequency: number = 220, durationMs: number = 30) => {
  const settings = getHapticSettings();
  if (!settings.enabled || !settings.soundEffects) return;

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000);
  } catch (_) {
    // Audio context may be restricted before user gesture
  }
};

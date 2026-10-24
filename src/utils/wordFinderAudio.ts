// Web Audio API Synthesizer for Word Finder sounds (No external MP3 files needed)
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playAudioEffect(type: "select" | "found" | "hint" | "win" | "complete" | "error" | string): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "select") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.08);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === "found") {
      // Pleasant double chime (C5 -> G5)
      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(783.99, now + 0.12);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === "hint") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(659.25, now); // E5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === "win" || type === "complete") {
      // Glorious celebratory chord sequence
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "triangle";
        o.frequency.setValueAtTime(freq, now + i * 0.09);
        g.gain.setValueAtTime(0.15, now + i * 0.09);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.4);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(now + i * 0.09);
        o.stop(now + i * 0.09 + 0.4);
      });
    } else if (type === "error") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.15);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  } catch (_) {
    // Audio context may be restricted before user gesture
  }
}

export const playSound: ((type: string) => void) & {
  wordFound: () => void;
  letterTap: () => void;
  invalidWord: () => void;
  victory: () => void;
  hint: () => void;
  select: () => void;
  complete: () => void;
  error: () => void;
} = Object.assign(
  (type: string) => playAudioEffect(type),
  {
    wordFound: () => playAudioEffect("found"),
    letterTap: () => playAudioEffect("select"),
    invalidWord: () => playAudioEffect("error"),
    victory: () => playAudioEffect("win"),
    hint: () => playAudioEffect("hint"),
    select: () => playAudioEffect("select"),
    complete: () => playAudioEffect("complete"),
    error: () => playAudioEffect("error"),
  }
);

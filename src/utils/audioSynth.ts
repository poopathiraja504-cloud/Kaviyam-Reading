class AudioSynthManager {
  private audioCtx: AudioContext | null = null;
  public currentMood: string = "off";
  private activeNodes: { oscs: OscillatorNode[]; gain: GainNode; noise?: AudioNode; interval?: any } | null = null;
  private mainVolumeNode: GainNode | null = null;
  private volume: number = 0.5;

  constructor() {}

  private initContext() {
    if (!this.audioCtx) {
      // @ts-ignore
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
        this.mainVolumeNode = this.audioCtx.createGain();
        this.mainVolumeNode.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
        this.mainVolumeNode.connect(this.audioCtx.destination);
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume().catch((err) => console.warn("Failed to resume AudioContext", err));
    }
  }

  public setVolume(val: number) {
    this.volume = val;
    if (this.mainVolumeNode && this.audioCtx) {
      this.mainVolumeNode.gain.setValueAtTime(val, this.audioCtx.currentTime);
    }
  }

  public stop() {
    if (this.activeNodes) {
      if (this.activeNodes.interval) {
        clearInterval(this.activeNodes.interval);
      }
      this.activeNodes.oscs.forEach(osc => {
        try { osc.stop(); } catch(e){}
      });
      if (this.activeNodes.noise) {
        if (this.activeNodes.noise instanceof AudioBufferSourceNode) {
          try { this.activeNodes.noise.stop(); } catch(e){}
        }
      }
      try { this.activeNodes.gain.disconnect(); } catch(e){}
      this.activeNodes = null;
    }
    this.currentMood = "off";
  }

  public playMood(mood: string) {
    this.stop();
    if (mood === "off") return;
    
    this.initContext();
    if (!this.audioCtx || !this.mainVolumeNode) return;

    this.currentMood = mood;

    const gainNode = this.audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.01, this.audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.4, this.audioCtx.currentTime + 1.5); // Soft fade-in
    gainNode.connect(this.mainVolumeNode);

    const oscs: OscillatorNode[] = [];
    let noise: AudioNode | undefined = undefined;
    let interval: any = undefined;

    if (mood === "drone") {
      // Rich Zen Meditation Drone (C-G-C-E chord)
      const freqs = [130.81, 196.00, 261.63, 329.63]; // C3, G3, C4, E4
      freqs.forEach((f, idx) => {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const oscGain = this.audioCtx.createGain();
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, this.audioCtx.currentTime);
        osc.detune.setValueAtTime((idx - 1.5) * 6, this.audioCtx.currentTime); // Chorus effect

        oscGain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
        
        // Very slow LFO for wave modulation
        const lfo = this.audioCtx.createOscillator();
        const lfoGain = this.audioCtx.createGain();
        lfo.frequency.value = 0.08 + idx * 0.04;
        lfoGain.gain.value = 0.04;
        lfo.connect(lfoGain);
        lfoGain.connect(oscGain.gain);
        lfo.start();
        oscs.push(lfo);

        osc.connect(oscGain);
        oscGain.connect(gainNode);
        osc.start();
        oscs.push(osc);
      });
    } else if (mood === "bell") {
      // Periodical Eastern Temple Chimes with bell harmonics (FM Synthesis)
      const triggerBell = () => {
        if (!this.audioCtx || this.currentMood !== "bell") return;
        const now = this.audioCtx.currentTime;
        
        const carrier = this.audioCtx.createOscillator();
        const modulator = this.audioCtx.createOscillator();
        const modGain = this.audioCtx.createGain();
        const bellGain = this.audioCtx.createGain();

        // Selected Pentatonic scale frequencies for harmonious bell chimes
        const pentatonic = [523.25, 587.33, 659.25, 783.99, 880.00]; // C5, D5, E5, G5, A5
        const randomFreq = pentatonic[Math.floor(Math.random() * pentatonic.length)];

        carrier.type = "sine";
        carrier.frequency.setValueAtTime(randomFreq, now);

        modulator.type = "sine";
        modulator.frequency.setValueAtTime(randomFreq * 1.618, now); // Golden ratio harmonic
        modGain.gain.setValueAtTime(randomFreq * 0.7, now);

        bellGain.gain.setValueAtTime(0.001, now);
        bellGain.gain.exponentialRampToValueAtTime(0.14, now + 0.04); // Strike
        bellGain.gain.exponentialRampToValueAtTime(0.001, now + 5.5); // Decay

        modulator.connect(modGain);
        modGain.connect(carrier.frequency);
        carrier.connect(bellGain);
        bellGain.connect(gainNode);

        modulator.start(now);
        carrier.start(now);
        
        modulator.stop(now + 5.6);
        carrier.stop(now + 5.6);
      };

      triggerBell();
      interval = setInterval(triggerBell, 6500);
    } else if (mood === "wind") {
      // Atmospheric Bamboo Flute Ragas
      const ragaFreqs = [293.66, 329.63, 392.00, 440.00, 493.88, 587.33]; // D4, E4, G4, A4, B4, D5
      
      const playFluteNote = () => {
        if (!this.audioCtx || this.currentMood !== "wind") return;
        const now = this.audioCtx.currentTime;
        
        const osc = this.audioCtx.createOscillator();
        const filter = this.audioCtx.createBiquadFilter();
        const noteGain = this.audioCtx.createGain();

        const f = ragaFreqs[Math.floor(Math.random() * ragaFreqs.length)];
        
        osc.type = "triangle";
        osc.frequency.setValueAtTime(f, now);

        // Gentle breathy vibrato
        const vibrato = this.audioCtx.createOscillator();
        const vibratoGain = this.audioCtx.createGain();
        vibrato.frequency.value = 4.8 + Math.random() * 0.6;
        vibratoGain.gain.value = f * 0.012;
        vibrato.connect(vibratoGain);
        vibratoGain.connect(osc.frequency);
        vibrato.start(now);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(750, now);
        filter.Q.setValueAtTime(1.2, now);

        noteGain.gain.setValueAtTime(0.001, now);
        noteGain.gain.linearRampToValueAtTime(0.07, now + 1.1); // Slow swelling attack
        noteGain.gain.linearRampToValueAtTime(0.07, now + 2.3);
        noteGain.gain.linearRampToValueAtTime(0.001, now + 4.2); // Slow breath release

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(gainNode);

        osc.start(now);
        
        vibrato.stop(now + 4.3);
        osc.stop(now + 4.3);
      };

      playFluteNote();
      interval = setInterval(playFluteNote, 4800);
    } else if (mood === "rain") {
      // Gentle Pink Noise Rain loop simulation
      const bufferSize = this.audioCtx.sampleRate * 2;
      const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.1; 
        b6 = white * 0.115926;
      }

      const noiseSource = this.audioCtx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 950;

      noiseSource.connect(filter);
      filter.connect(gainNode);
      noiseSource.start();
      noise = noiseSource;

      // Fast randomized raindrops cracking
      const triggerRaindrop = () => {
        if (!this.audioCtx || this.currentMood !== "rain") return;
        const now = this.audioCtx.currentTime;
        const drop = this.audioCtx.createOscillator();
        const dropGain = this.audioCtx.createGain();

        drop.type = "sine";
        drop.frequency.setValueAtTime(1400 + Math.random() * 700, now);
        
        dropGain.gain.setValueAtTime(0.003 + Math.random() * 0.004, now);
        dropGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

        drop.connect(dropGain);
        dropGain.connect(gainNode);
        drop.start(now);
        drop.stop(now + 0.045);
      };

      interval = setInterval(() => {
        const triggers = Math.floor(Math.random() * 4) + 1;
        for (let t = 0; t < triggers; t++) {
          setTimeout(triggerRaindrop, Math.random() * 800);
        }
      }, 450);
    }

    this.activeNodes = {
      oscs,
      gain: gainNode,
      noise,
      interval
    };
  }
}

export const audioSynth = new AudioSynthManager();

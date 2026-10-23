import { SoundPackId, SoundEngineOptions } from '@/types/sound';
import { SWITCH_PROFILES } from './sound-profiles';

type KeyCategory = 'default' | 'space' | 'enter' | 'backspace' | 'tab' | 'modifier';

// Mapping key codes to approximate keyboard positions (x in 0..1 range) for stereo panning
const KEY_PAN_MAP: Record<string, number> = {
  // Far Left
  Escape: -0.35,
  Backquote: -0.32,
  Tab: -0.32,
  CapsLock: -0.32,
  ShiftLeft: -0.35,
  ControlLeft: -0.35,
  AltLeft: -0.28,
  MetaLeft: -0.3,
  Digit1: -0.3,
  Digit2: -0.25,
  KeyQ: -0.28,
  KeyA: -0.28,
  KeyZ: -0.28,

  // Left-Center
  Digit3: -0.2,
  Digit4: -0.15,
  KeyW: -0.2,
  KeyE: -0.15,
  KeyS: -0.2,
  KeyD: -0.15,
  KeyX: -0.2,
  KeyC: -0.15,

  // Center
  Digit5: -0.08,
  Digit6: 0.05,
  KeyR: -0.08,
  KeyT: -0.03,
  KeyY: 0.03,
  KeyU: 0.08,
  KeyF: -0.08,
  KeyG: -0.02,
  KeyH: 0.02,
  KeyJ: 0.08,
  KeyV: -0.08,
  KeyB: -0.02,
  KeyN: 0.03,
  KeyM: 0.08,
  Space: 0.0,

  // Right-Center
  Digit7: 0.12,
  Digit8: 0.18,
  KeyI: 0.15,
  KeyO: 0.2,
  KeyK: 0.15,
  KeyL: 0.2,
  Comma: 0.15,
  Period: 0.2,

  // Far Right
  Digit9: 0.22,
  Digit0: 0.26,
  Minus: 0.3,
  Equal: 0.33,
  Backspace: 0.35,
  BracketLeft: 0.25,
  BracketRight: 0.29,
  Backslash: 0.33,
  Semicolon: 0.25,
  Quote: 0.3,
  Enter: 0.35,
  NumpadEnter: 0.35,
  Slash: 0.25,
  ShiftRight: 0.35,
  ArrowLeft: 0.25,
  ArrowDown: 0.28,
  ArrowUp: 0.28,
  ArrowRight: 0.33
};

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private deskmatFilter: BiquadFilterNode | null = null;
  private stabilizerFilter: BiquadFilterNode | null = null;

  private bufferCache: Map<string, AudioBuffer> = new Map();
  private packLoading: Map<SoundPackId, Promise<void>> = new Map();
  private loadedPacks: Set<SoundPackId> = new Set();

  private activePack: SoundPackId = 's1';
  private options: SoundEngineOptions = {
    volume: 0.75,
    pitchShift: 1.0,
    stereoSpread: true,
    playKeyUp: true,
    deskmatResonance: true
  };

  private pressTimestamps: Map<string, number> = new Map();
  private lastKeystrokeTime: number = 0;
  private consecutiveFastHits: number = 0;

  constructor() {
    // Lazy AudioContext initialization on first user interaction
  }

  public getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.options.volume;

      // Realtime Analyser for visualizer
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.8;

      // Deskmat Acoustic Resonance Filter (mild low-end warmth + softened harsh transients)
      this.deskmatFilter = this.ctx.createBiquadFilter();
      this.deskmatFilter.type = 'lowshelf';
      this.deskmatFilter.frequency.value = 180;
      this.deskmatFilter.gain.value = this.options.deskmatResonance ? 3 : 0;

      // Spacebar stabilizer sub-bass resonance filter
      this.stabilizerFilter = this.ctx.createBiquadFilter();
      this.stabilizerFilter.type = 'peaking';
      this.stabilizerFilter.frequency.value = 110;
      this.stabilizerFilter.Q.value = 1.8;
      this.stabilizerFilter.gain.value = 4.5;

      // Routing: source -> [pan] -> [deskmat] -> masterGain -> analyser -> destination
      this.deskmatFilter.connect(this.masterGain);
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public getAnalyser(): AnalyserNode | null {
    this.getAudioContext();
    return this.analyser;
  }

  public setPack(packId: SoundPackId): Promise<void> {
    this.activePack = packId;
    return this.preloadPack(packId);
  }

  public getActivePack(): SoundPackId {
    return this.activePack;
  }

  public updateOptions(opts: Partial<SoundEngineOptions>) {
    this.options = { ...this.options, ...opts };
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.options.volume, this.ctx?.currentTime || 0);
    }
    if (this.deskmatFilter) {
      this.deskmatFilter.gain.setValueAtTime(this.options.deskmatResonance ? 3 : 0, this.ctx?.currentTime || 0);
    }
  }

  public getOptions(): SoundEngineOptions {
    return { ...this.options };
  }

  public async preloadPack(packId: SoundPackId): Promise<void> {
    if (this.loadedPacks.has(packId)) return;
    if (this.packLoading.has(packId)) return this.packLoading.get(packId);

    const ctx = this.getAudioContext();
    if (!ctx) return;

    const promise = (async () => {
      const profile = SWITCH_PROFILES[packId];
      const files = profile ? profile.sampleFiles : ['20.mp3', '21.mp3', '22.mp3', '23.mp3', '24.mp3', '57.mp3', '28.mp3'];
      
      // Also load backspace/tab if available
      const filesToLoad = Array.from(new Set([...files, '14.mp3', '15.mp3']));

      await Promise.all(
        filesToLoad.map(async (file) => {
          const cacheKey = `${packId}/${file}`;
          if (this.bufferCache.has(cacheKey)) return;

          try {
            const resp = await fetch(`/sounds/${packId}/${file}`);
            if (!resp.ok) return;
            const arrayBuf = await resp.arrayBuffer();
            const decoded = await ctx.decodeAudioData(arrayBuf);
            this.bufferCache.set(cacheKey, decoded);
          } catch {
            // Fallback gracefully
          }
        })
      );

      this.loadedPacks.add(packId);
      this.packLoading.delete(packId);
    })();

    this.packLoading.set(packId, promise);
    return promise;
  }

  private pickSampleFile(code: string, packId: SoundPackId): string {
    const isPack1To4 = ['s1', 's2', 's3', 's4'].includes(packId);

    if (code === 'Space') {
      return isPack1To4 ? '57.mp3' : '201.mp3';
    }
    if (code === 'Enter' || code === 'NumpadEnter') {
      return isPack1To4 ? '28.mp3' : '301.mp3';
    }
    if (code === 'Backspace') {
      if (isPack1To4 && this.bufferCache.has(`${packId}/14.mp3`)) {
        return '14.mp3';
      }
      return isPack1To4 ? '24.mp3' : '1.mp3';
    }
    if (code === 'Tab') {
      if (isPack1To4 && this.bufferCache.has(`${packId}/15.mp3`)) {
        return '15.mp3';
      }
      return isPack1To4 ? '21.mp3' : '2.mp3';
    }

    // Default regular alphanumerics
    if (isPack1To4) {
      const candidates = ['20.mp3', '21.mp3', '22.mp3', '23.mp3', '24.mp3'];
      return candidates[Math.floor(Math.random() * candidates.length)];
    } else {
      const candidates = ['1.mp3', '2.mp3', '3.mp3', '4.mp3', '5.mp3'];
      return candidates[Math.floor(Math.random() * candidates.length)];
    }
  }

  /**
   * Handle keydown: Plays mechanical bottom-out actuation
   */
  public triggerKeyDown(code: string = 'KeyF', customPack?: SoundPackId): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const pack = customPack || this.activePack;
    if (!this.loadedPacks.has(pack)) {
      this.preloadPack(pack);
    }

    const now = Date.now();
    this.pressTimestamps.set(code, now);

    // Keystroke velocity / speed detection
    const interval = now - this.lastKeystrokeTime;
    this.lastKeystrokeTime = now;

    if (interval < 140) {
      this.consecutiveFastHits = Math.min(this.consecutiveFastHits + 1, 12);
    } else {
      this.consecutiveFastHits = Math.max(0, this.consecutiveFastHits - 2);
    }

    const filename = this.pickSampleFile(code, pack);
    let buffer = this.bufferCache.get(`${pack}/${filename}`);

    // If specific file not ready yet, pick any buffer from this pack
    if (!buffer) {
      for (const [k, v] of this.bufferCache.entries()) {
        if (k.startsWith(`${pack}/`)) {
          buffer = v;
          break;
        }
      }
    }
    if (!buffer) return;

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    // Organic micro-pitch randomization (±3-5%)
    // Fast bursts get slightly crisper pitch; slow heavy hits get deeper resonance
    const fastMultiplier = 1 + (this.consecutiveFastHits * 0.008);
    const randomVariation = 0.97 + (Math.random() * 0.06);
    source.playbackRate.value = this.options.pitchShift * randomVariation * fastMultiplier;

    // Node chain creation
    let lastNode: AudioNode = source;

    // Stereo spatial panning
    if (this.options.stereoSpread && typeof ctx.createStereoPanner === 'function') {
      const panNode = ctx.createStereoPanner();
      const targetPan = KEY_PAN_MAP[code] ?? (Math.random() * 0.2 - 0.1);
      panNode.pan.setValueAtTime(targetPan, ctx.currentTime);
      lastNode.connect(panNode);
      lastNode = panNode;
    }

    // Spacebar stabilizer low-end resonance
    if (code === 'Space' && this.stabilizerFilter) {
      lastNode.connect(this.stabilizerFilter);
      this.stabilizerFilter.connect(this.deskmatFilter || this.masterGain!);
    } else {
      lastNode.connect(this.deskmatFilter || this.masterGain!);
    }

    source.start(0);
  }

  /**
   * Handle keyup: Plays mechanical switch stem return / upstroke
   * Especially distinct when long-pressed or released after a hold!
   */
  public triggerKeyUp(code: string = 'KeyF', customPack?: SoundPackId): void {
    if (!this.options.playKeyUp) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const pressTime = this.pressTimestamps.get(code) || 0;
    const holdDuration = Date.now() - pressTime;
    this.pressTimestamps.delete(code);

    // Only play distinct upstroke if held longer than quick tap (>90ms)
    // or with subtle nuance
    const pack = customPack || this.activePack;
    const filename = this.pickSampleFile(code, pack);
    const buffer = this.bufferCache.get(`${pack}/${filename}`);
    if (!buffer) return;

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    // Switch return: stem hits upper housing, producing a lighter, crisper, higher sound
    const upstrokePitch = (holdDuration > 150 ? 1.35 : 1.25) * (0.97 + Math.random() * 0.06);
    source.playbackRate.value = this.options.pitchShift * upstrokePitch;

    // Release envelope: shorter, softer transient
    const releaseGain = ctx.createGain();
    const releaseVol = holdDuration > 200 ? 0.35 : 0.2;
    releaseGain.gain.setValueAtTime(releaseVol, ctx.currentTime);
    releaseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    source.connect(releaseGain);

    if (this.options.stereoSpread && typeof ctx.createStereoPanner === 'function') {
      const panNode = ctx.createStereoPanner();
      panNode.pan.setValueAtTime(KEY_PAN_MAP[code] ?? 0, ctx.currentTime);
      releaseGain.connect(panNode);
      panNode.connect(this.masterGain!);
    } else {
      releaseGain.connect(this.masterGain!);
    }

    source.start(0);
  }
}

// Global Singleton
let soundEngineInstance: SoundEngine | null = null;

export function getSoundEngine(): SoundEngine {
  if (!soundEngineInstance) {
    soundEngineInstance = new SoundEngine();
  }
  return soundEngineInstance;
}

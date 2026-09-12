import { GameState } from './state';
import type { MusicTheme } from './config';

/**
 * Everything is synthesised with the Web Audio API — no audio files, no
 * autoplay. The context is not created until the player's first gesture.
 */
class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private ambienceGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private musicGen = 0;
  private theme: MusicTheme = 'explore';
  private started = false;

  /** Call from any real user gesture (pointerdown / keydown). */
  unlock(): void {
    if (this.started) return;
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    try {
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = GameState.settings.muted ? 0 : 0.5;
      this.master.connect(this.ctx.destination);
      this.started = true;
      this.startAmbience();
      this.startMysteryTheme();
    } catch {
      this.started = false;
    }
  }

  setMuted(muted: boolean): void {
    GameState.settings.muted = muted;
    GameState.saveSettings();
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(muted ? 0 : 0.5, this.ctx.currentTime, 0.05);
    }
  }

  get muted(): boolean {
    return GameState.settings.muted;
  }

  /* ---------------------------------------------------------------- */

  private noiseBuffer(seconds: number): AudioBuffer | null {
    if (!this.ctx) return null;
    const len = Math.floor(this.ctx.sampleRate * seconds);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  /** Rolling stock rumble + rain hiss, looping forever under everything. */
  private startAmbience(): void {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    this.ambienceGain = ctx.createGain();
    this.ambienceGain.gain.value = 0.12;
    this.ambienceGain.connect(this.master);

    const buf = this.noiseBuffer(3);
    if (!buf) return;

    // Low rumble.
    const rumble = ctx.createBufferSource();
    rumble.buffer = buf;
    rumble.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 150;
    const rg = ctx.createGain();
    rg.gain.value = 0.35;
    rumble.connect(lp).connect(rg).connect(this.ambienceGain);
    rumble.start();

    // Bogie clatter, roughly every 1.1 s.
    const tick = () => {
      if (!this.ctx) return;
      this.clack();
      window.setTimeout(tick, 1000 + Math.random() * 260);
    };
    window.setTimeout(tick, 900);
  }

  private clack(): void {
    if (!this.ctx || !this.ambienceGain) return;
    const ctx = this.ctx;
    const buf = this.noiseBuffer(0.09);
    if (!buf) return;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 220;
    bp.Q.value = 1.4;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.14, ctx.currentTime + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.09);
    src.connect(bp).connect(g).connect(this.ambienceGain);
    src.start();
    src.stop(ctx.currentTime + 0.1);
  }

  /* ---------------------------------------------------------------- */

  private tone(
    freq: number,
    dur: number,
    type: OscillatorType = 'square',
    vol = 0.14,
    delay = 0,
    slideTo?: number,
  ): void {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  blip(): void {
    this.tone(620, 0.045, 'square', 0.05);
  }

  select(): void {
    this.tone(440, 0.06, 'square', 0.09);
    this.tone(660, 0.07, 'square', 0.07, 0.05);
  }

  back(): void {
    this.tone(330, 0.08, 'triangle', 0.09);
    this.tone(220, 0.1, 'triangle', 0.07, 0.05);
  }

  page(): void {
    if (!this.ctx || !this.master) return;
    const buf = this.noiseBuffer(0.14);
    if (!buf) return;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const hp = this.ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 1800;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.12, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.14);
    src.connect(hp).connect(g).connect(this.master);
    src.start();
  }

  evidence(): void {
    this.tone(784, 0.1, 'triangle', 0.12);
    this.tone(1047, 0.14, 'triangle', 0.11, 0.09);
    this.tone(1319, 0.22, 'triangle', 0.09, 0.19);
  }

  contradiction(): void {
    this.tone(180, 0.35, 'sawtooth', 0.14, 0, 90);
    this.tone(1200, 0.16, 'square', 0.1, 0.02);
    this.tone(900, 0.5, 'sawtooth', 0.08, 0.16, 300);
  }

  wrong(): void {
    this.tone(200, 0.2, 'square', 0.11, 0, 140);
  }

  correct(): void {
    [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.16, 'triangle', 0.1, i * 0.08));
  }

  door(): void {
    if (!this.ctx || !this.master) return;
    const buf = this.noiseBuffer(0.3);
    if (!buf) return;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 900;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.1, this.ctx.currentTime + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.3);
    src.connect(bp).connect(g).connect(this.master);
    src.start();
  }

  /** Wind, coupling clank, and footsteps while walking between carriages. */
  crossing(): void {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const buf = this.noiseBuffer(2.4);
    if (buf) {
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 780;
      bp.Q.value = 0.7;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.09, ctx.currentTime + 0.2);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.2);
      src.connect(bp).connect(g).connect(this.master);
      src.start();
    }
    this.tone(90, 0.28, 'sine', 0.07, 0.12, 70);
    for (let i = 0; i < 6; i++) {
      window.setTimeout(() => this.step(), 280 + i * 360);
    }
  }

  duckMusic(level: number): void {
    if (!this.musicGain || !this.ctx) return;
    this.musicGain.gain.setTargetAtTime(Math.max(0, level) * 0.28, this.ctx.currentTime, 0.12);
  }

  setTheme(theme: MusicTheme): void {
    if (this.theme === theme) return;
    this.theme = theme;
    if (!this.musicGain || !this.ctx) return;
    this.musicGen += 1;
    const lift = theme === 'explore' ? 0.22 : theme === 'credits' ? 0.2 : 0.3;
    this.musicGain.gain.setTargetAtTime(lift, this.ctx.currentTime, 0.25);
    this.playMysteryPhrase(this.musicGen);
  }

  chime(): void {
    [1047, 880, 698].forEach((f, i) => this.tone(f, 0.5, 'sine', 0.1, i * 0.22));
  }

  step(): void {
    this.tone(120 + Math.random() * 30, 0.04, 'triangle', 0.04);
  }

  /** Low sustained pad for Mind Reconstruction. */
  reconEnter(): void {
    this.duckMusic(0.28);
    this.tone(147, 1.2, 'sine', 0.09);
    this.tone(220, 1.4, 'sine', 0.07, 0.1);
    this.tone(294, 1.6, 'sine', 0.05, 0.2);
  }

  reconLeave(): void {
    this.duckMusic(1);
  }

  /* ---------------------------------------------------------------- */
  /* Mystery theme                                                     */
  /* ---------------------------------------------------------------- */

  private startMysteryTheme(): void {
    if (!this.ctx || !this.master || this.musicGain) return;
    const ctx = this.ctx;
    this.musicGain = ctx.createGain();
    this.musicGain.gain.value = 0;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1650;
    this.musicGain.connect(lp).connect(this.master);
    this.musicGain.gain.setTargetAtTime(0.18, ctx.currentTime, 1.4);

    this.musicGen += 1;
    this.playMysteryPhrase(this.musicGen);
  }

  private playMysteryPhrase(gen: number): void {
    if (!this.ctx || !this.musicGain || gen !== this.musicGen) return;
    const ctx = this.ctx;
    const t0 = ctx.currentTime + 0.02;
    const note = (at: number, freq: number, dur: number, vol: number, type: OscillatorType = 'triangle') => {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0 + at);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t0 + at);
      g.gain.exponentialRampToValueAtTime(vol, t0 + at + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + at + dur);
      osc.connect(g).connect(this.musicGain!);
      osc.start(t0 + at);
      osc.stop(t0 + at + dur + 0.05);
    };

    const hit = (at: number, freq: number, dur: number, vol: number) => note(at, freq, dur, vol, 'sine');

    let wait = 9200;
    if (this.theme === 'cinematic') {
      wait = 7200;
      for (let i = 0; i < 14; i++) hit(i * 0.5, 55, 0.12, 0.055);
      const melody: [number, number, number, number][] = [
        [0.0, 440, 0.28, 0.07],
        [0.5, 523.25, 0.28, 0.065],
        [1.0, 659.25, 0.45, 0.07],
        [1.5, 783.99, 0.7, 0.06],
        [2.25, 659.25, 0.28, 0.06],
        [2.75, 587.33, 0.28, 0.058],
        [3.25, 440, 0.5, 0.065],
        [4.0, 349.23, 0.28, 0.06],
        [4.5, 392, 0.28, 0.06],
        [5.0, 523.25, 0.7, 0.07],
        [5.75, 440, 0.9, 0.068],
      ];
      for (const row of melody) note(...row);
      note(0.0, 110, 3.4, 0.04, 'sine');
      note(3.4, 98, 3.4, 0.038, 'sine');
    } else if (this.theme === 'finale') {
      wait = 8000;
      const melody: [number, number, number, number][] = [
        [0.0, 523.25, 0.6, 0.06],
        [0.7, 659.25, 0.6, 0.058],
        [1.4, 783.99, 1.1, 0.055],
        [2.6, 880, 0.45, 0.05],
        [3.1, 783.99, 0.45, 0.05],
        [3.6, 659.25, 1.0, 0.055],
        [4.8, 587.33, 0.5, 0.05],
        [5.4, 523.25, 1.8, 0.06],
      ];
      for (const row of melody) note(...row);
      note(0.0, 130.81, 4, 0.036, 'sine');
      note(4.0, 146.83, 3.6, 0.034, 'sine');
    } else if (this.theme === 'credits') {
      wait = 10000;
      const melody: [number, number, number, number][] = [
        [0.0, 329.63, 1.1, 0.05],
        [1.2, 392, 1.1, 0.045],
        [2.5, 440, 1.4, 0.05],
        [4.1, 523.25, 1.2, 0.048],
        [5.5, 493.88, 1.0, 0.042],
        [6.7, 440, 2.2, 0.05],
      ];
      for (const row of melody) note(...row);
      note(0.0, 164.81, 4.8, 0.03, 'sine');
      note(5.0, 146.83, 4.6, 0.028, 'sine');
    } else {
      const melody: [number, number, number, number][] = [
        [0.0, 440, 0.72, 0.055],
        [0.9, 523.25, 0.55, 0.05],
        [1.55, 659.25, 1.15, 0.048],
        [2.85, 587.33, 0.38, 0.048],
        [3.28, 523.25, 0.38, 0.045],
        [3.72, 440, 0.95, 0.05],
        [4.8, 392, 0.42, 0.045],
        [5.28, 349.23, 0.42, 0.042],
        [5.78, 329.63, 0.95, 0.05],
        [6.85, 261.63, 0.5, 0.045],
        [7.45, 220, 1.5, 0.055],
      ];
      for (const row of melody) note(...row);
      note(0.0, 220, 2.5, 0.03, 'sine');
      note(2.7, 174.61, 2.0, 0.028, 'sine');
      note(4.8, 164.81, 1.9, 0.028, 'sine');
      note(6.85, 110, 2.2, 0.03, 'sine');
    }

    window.setTimeout(() => this.playMysteryPhrase(gen), wait);
  }
}

export const Audio = new AudioEngine();

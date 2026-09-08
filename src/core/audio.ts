import { GameState } from './state';

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
    this.ambienceGain.gain.value = 0.32;
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
    rg.gain.value = 0.9;
    rumble.connect(lp).connect(rg).connect(this.ambienceGain);
    rumble.start();

    // Rain hiss.
    const hiss = ctx.createBufferSource();
    hiss.buffer = buf;
    hiss.loop = true;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 3200;
    const hg = ctx.createGain();
    hg.gain.value = 0.06;
    hiss.connect(hp).connect(hg).connect(this.ambienceGain);
    hiss.start();

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
    this.musicGain.gain.setTargetAtTime(Math.max(0, level) * 0.22, this.ctx.currentTime, 0.12);
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
    this.musicGain.gain.setTargetAtTime(0.22, ctx.currentTime, 1.4);

    const drone = (freq: number, vol: number) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = vol;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.07 + freq / 4000;
      const lfoG = ctx.createGain();
      lfoG.gain.value = vol * 0.35;
      lfo.connect(lfoG).connect(g.gain);
      osc.connect(g).connect(this.musicGain!);
      osc.start();
      lfo.start();
    };
    drone(110, 0.11);
    drone(164.81, 0.055);
    drone(220, 0.03);

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

    // A-minor music-box line. Quiet enough to sit under rain and rumble.
    const melody: [number, number, number, number][] = [
      [0.0, 440, 0.72, 0.05],
      [0.9, 523.25, 0.55, 0.045],
      [1.55, 659.25, 1.15, 0.04],
      [2.85, 587.33, 0.38, 0.042],
      [3.28, 523.25, 0.38, 0.04],
      [3.72, 440, 0.95, 0.045],
      [4.8, 392, 0.42, 0.04],
      [5.28, 349.23, 0.42, 0.038],
      [5.78, 329.63, 0.95, 0.044],
      [6.85, 261.63, 0.5, 0.04],
      [7.45, 220, 1.5, 0.048],
    ];
    for (const [at, f, d, v] of melody) note(at, f, d, v);

    const harmony: [number, number, number][] = [
      [0.0, 220, 2.5],
      [2.7, 174.61, 2.0],
      [4.8, 164.81, 1.9],
      [6.85, 110, 2.2],
    ];
    for (const [at, f, d] of harmony) note(at, f, d, 0.028, 'sine');

    window.setTimeout(() => this.playMysteryPhrase(gen), 9200);
  }
}

export const Audio = new AudioEngine();

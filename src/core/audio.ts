import { GameState } from './state';

/**
 * Everything is synthesised with the Web Audio API — no audio files, no
 * autoplay. The context is not created until the player's first gesture.
 */
class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private ambienceGain: GainNode | null = null;
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

  chime(): void {
    [1047, 880, 698].forEach((f, i) => this.tone(f, 0.5, 'sine', 0.1, i * 0.22));
  }

  step(): void {
    this.tone(120 + Math.random() * 30, 0.04, 'triangle', 0.04);
  }

  /** Low sustained pad for Mind Reconstruction. */
  reconEnter(): void {
    this.tone(147, 1.2, 'sine', 0.09);
    this.tone(220, 1.4, 'sine', 0.07, 0.1);
    this.tone(294, 1.6, 'sine', 0.05, 0.2);
  }
}

export const Audio = new AudioEngine();

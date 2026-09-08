import Phaser from 'phaser';

export type Ctx = CanvasRenderingContext2D;

/**
 * Creates (or reuses) a canvas-backed texture and hands a 2D context to `draw`.
 * All artwork in this game is generated this way — no external image files.
 */
export function makeTexture(
  scene: Phaser.Scene,
  key: string,
  w: number,
  h: number,
  draw: (ctx: Ctx) => void,
): void {
  if (scene.textures.exists(key)) return;
  const canvasTexture = scene.textures.createCanvas(key, w, h);
  if (!canvasTexture) return;
  const ctx = canvasTexture.getContext();
  ctx.imageSmoothingEnabled = false;
  draw(ctx);
  canvasTexture.refresh();
}

/**
 * Same as makeTexture but slices the result into a spritesheet.
 */
export function makeSheet(
  scene: Phaser.Scene,
  key: string,
  frameW: number,
  frameH: number,
  frames: number,
  draw: (ctx: Ctx) => void,
): void {
  if (scene.textures.exists(key)) return;
  const canvasTexture = scene.textures.createCanvas(key, frameW * frames, frameH);
  if (!canvasTexture) return;
  const ctx = canvasTexture.getContext();
  ctx.imageSmoothingEnabled = false;
  draw(ctx);
  canvasTexture.refresh();
  const tex = scene.textures.get(key);
  for (let i = 0; i < frames; i++) {
    tex.add(i, 0, i * frameW, 0, frameW, frameH);
  }
}

/** Fill a 1px-aligned rectangle. */
export function px(ctx: Ctx, x: number, y: number, w: number, h: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

/** Deterministic pseudo-random so generated art is identical every run. */
export function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Scatter single-pixel noise inside a rect for a hand-dithered look. */
export function speckle(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  density: number,
  seed: number,
): void {
  const r = rng(seed);
  const count = Math.floor(w * h * density);
  ctx.fillStyle = color;
  for (let i = 0; i < count; i++) {
    ctx.fillRect(x + Math.floor(r() * w), y + Math.floor(r() * h), 1, 1);
  }
}

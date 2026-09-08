import Phaser from 'phaser';
import { P } from './palette';
import { makeSheet, makeTexture, px, rng, speckle, type Ctx } from './pixel';
import { CHARACTERS } from '../data/characters';
import { EVIDENCE } from '../data/evidence';
import type { Character, Emotion } from '../data/types';

export const CHAR_FRAME_W = 16;
export const CHAR_FRAME_H = 24;

const ORI: Character['palette'] = {
  skin: '#f2cfa8',
  hair: '#2b1f14',
  coat: '#7b3a3a',
  coatDark: '#552626',
  accent: '#e8d9b8',
};

const ORI_FACE: Character['face'] = { hairStyle: 'short', height: 'small' };

/* ================================================================== */
/* Tiles and atmosphere                                                */
/* ================================================================== */

function floorTile(ctx: Ctx, base: string, mid: string, dark: string, seed: number): void {
  px(ctx, 0, 0, 16, 16, base);
  for (let y = 0; y < 16; y += 4) px(ctx, 0, y, 16, 1, mid);
  px(ctx, 0, 0, 1, 16, dark);
  speckle(ctx, 0, 0, 16, 16, dark, 0.06, seed);
  speckle(ctx, 0, 0, 16, 16, mid, 0.04, seed + 7);
}

export function buildWorldTextures(scene: Phaser.Scene): void {
  makeTexture(scene, 'floor_passenger', 16, 16, (c) => floorTile(c, '#3d2536', '#4a2d42', '#2a1826', 11));
  makeTexture(scene, 'floor_dining', 16, 16, (c) => floorTile(c, P.wood1, P.wood2, P.wood0, 23));
  makeTexture(scene, 'floor_sleeper', 16, 16, (c) => floorTile(c, '#2b2740', '#35304f', '#1d1a2e', 31));
  makeTexture(scene, 'floor_baggage', 16, 16, (c) => floorTile(c, '#2a2c33', '#343740', '#1b1d23', 41));

  makeTexture(scene, 'wall_panel', 16, 16, (c) => {
    px(c, 0, 0, 16, 16, P.wood1);
    px(c, 0, 0, 16, 2, P.wood2);
    px(c, 0, 14, 16, 2, P.wood0);
    px(c, 7, 0, 1, 16, P.wood0);
    px(c, 8, 0, 1, 16, P.wood2);
    speckle(c, 0, 0, 16, 16, P.wood0, 0.05, 5);
  });

  // Night scenery scrolling past the windows.
  makeTexture(scene, 'scenery', 320, 40, (c) => {
    const r = rng(99);
    // Sky band gradient, dithered.
    px(c, 0, 0, 320, 40, P.night1);
    px(c, 0, 0, 320, 12, P.night2);
    speckle(c, 0, 0, 320, 16, P.night3, 0.05, 3);
    // Far hills.
    c.fillStyle = P.night2;
    for (let x = 0; x < 320; x++) {
      const h = 8 + Math.round(4 * Math.sin(x / 26) + 3 * Math.sin(x / 9 + 1.7));
      c.fillRect(x, 40 - h - 8, 1, h + 8);
    }
    // Near hills.
    c.fillStyle = P.night0;
    for (let x = 0; x < 320; x++) {
      const h = 6 + Math.round(3 * Math.sin(x / 15 + 2.2) + 2 * Math.sin(x / 5));
      c.fillRect(x, 40 - h, 1, h);
    }
    // Telegraph poles.
    for (let x = 12; x < 320; x += 54) {
      px(c, x, 6, 1, 26, '#0c1020');
      px(c, x - 3, 8, 7, 1, '#0c1020');
    }
    // Rare lit windows in distant farmhouses.
    for (let i = 0; i < 5; i++) {
      const x = Math.floor(r() * 300) + 6;
      px(c, x, 26, 6, 5, '#0b0e1a');
      px(c, x + 1, 27, 2, 2, P.amber3);
    }
  });

  // Diagonal rain, tiled over the glass.
  makeTexture(scene, 'rain', 64, 64, (c) => {
    const r = rng(1234);
    for (let i = 0; i < 46; i++) {
      const x = Math.floor(r() * 64);
      const y = Math.floor(r() * 64);
      const len = 4 + Math.floor(r() * 7);
      c.fillStyle = r() > 0.6 ? 'rgba(190,215,255,0.42)' : 'rgba(140,170,220,0.24)';
      for (let k = 0; k < len; k++) c.fillRect((x + k) % 64, (y + k * 2) % 64, 1, 1);
    }
  });

  // Water running down the inside of the glass.
  makeTexture(scene, 'streak', 64, 64, (c) => {
    const r = rng(777);
    for (let i = 0; i < 10; i++) {
      const x = Math.floor(r() * 64);
      const y = Math.floor(r() * 40);
      const len = 8 + Math.floor(r() * 22);
      c.fillStyle = 'rgba(200,225,255,0.16)';
      c.fillRect(x, y, 1, len);
      c.fillStyle = 'rgba(230,245,255,0.3)';
      c.fillRect(x, y + len - 2, 1, 2);
    }
  });

  // Soft amber lamp pool.
  makeTexture(scene, 'lampglow', 96, 96, (c) => {
    const g = c.createRadialGradient(48, 48, 2, 48, 48, 48);
    g.addColorStop(0, 'rgba(255,214,140,0.40)');
    g.addColorStop(0.45, 'rgba(230,170,80,0.16)');
    g.addColorStop(1, 'rgba(230,170,80,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, 96, 96);
  });

  makeTexture(scene, 'vignette', 240, 135, (c) => {
    const g = c.createRadialGradient(120, 67, 30, 120, 67, 140);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(0.62, 'rgba(3,5,12,0.30)');
    g.addColorStop(1, 'rgba(3,5,12,0.86)');
    c.fillStyle = g;
    c.fillRect(0, 0, 240, 135);
  });

  makeTexture(scene, 'grain', 128, 128, (c) => {
    speckle(c, 0, 0, 128, 128, 'rgba(255,255,255,0.05)', 0.10, 61);
    speckle(c, 0, 0, 128, 128, 'rgba(0,0,0,0.07)', 0.10, 83);
  });

  makeTexture(scene, 'spark', 6, 6, (c) => {
    px(c, 2, 0, 2, 6, 'rgba(255,230,170,0.9)');
    px(c, 0, 2, 6, 2, 'rgba(255,230,170,0.9)');
    px(c, 2, 2, 2, 2, '#fff6dd');
  });

  makeTexture(scene, 'dust', 3, 3, (c) => {
    px(c, 1, 0, 1, 3, 'rgba(245,215,142,0.55)');
    px(c, 0, 1, 3, 1, 'rgba(245,215,142,0.55)');
  });

  // World-space interact key. A sprite, not Phaser Text — Text + backgroundColor
  // ghosts under camera zoom and round-pixels.
  makeTexture(scene, 'prompt_e', 9, 9, (c) => {
    px(c, 0, 0, 9, 9, P.ink);
    px(c, 1, 1, 7, 7, P.amber4);
    px(c, 1, 1, 7, 1, P.paper);
    px(c, 3, 2, 4, 1, P.ink);
    px(c, 3, 3, 1, 4, P.ink);
    px(c, 3, 4, 3, 1, P.ink);
    px(c, 3, 6, 4, 1, P.ink);
  });

  makeTexture(scene, 'glint', 7, 7, (c) => {
    px(c, 3, 0, 1, 7, P.amber4);
    px(c, 0, 3, 7, 1, P.amber4);
    px(c, 3, 2, 1, 3, P.paper);
    px(c, 2, 3, 3, 1, P.paper);
  });
}

/* ================================================================== */
/* Character sprites                                                   */
/* ================================================================== */

type Dir = 0 | 1 | 2 | 3; // down, left, right, up

function drawCharFrame(
  ctx: Ctx,
  ox: number,
  dir: Dir,
  step: number,
  pal: Character['palette'],
  face: Character['face'],
): void {
  const small = face.height === 'small';
  const tall = face.height === 'tall';
  const top = small ? 4 : tall ? 0 : 2;
  const headY = top + 3;
  const bodyY = headY + 7;
  const legY = bodyY + (tall ? 9 : 8);
  const legEnd = 22;

  // Ground shadow.
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(ox + 4, 21, 8, 2);
  ctx.fillRect(ox + 3, 22, 10, 1);

  // Legs (walk cycle swings one forward).
  const swing = step === 1 ? 1 : step === 2 ? -1 : 0;
  px(ctx, ox + 5, legY, 2, legEnd - legY + (swing > 0 ? 1 : 0), P.slate0);
  px(ctx, ox + 9, legY, 2, legEnd - legY + (swing < 0 ? 1 : 0), P.slate0);
  px(ctx, ox + 5, legEnd, 3, 1, P.ink);
  px(ctx, ox + 9, legEnd, 3, 1, P.ink);

  // Coat / torso.
  px(ctx, ox + 4, bodyY, 8, legY - bodyY, pal.coat);
  px(ctx, ox + 4, bodyY, 8, 1, pal.accent);
  px(ctx, ox + 4, legY - 2, 8, 2, pal.coatDark);
  px(ctx, ox + 11, bodyY, 1, legY - bodyY, pal.coatDark);

  // Arms.
  const armY = bodyY + 1;
  if (dir === 1) {
    px(ctx, ox + 3, armY + (swing > 0 ? 1 : 0), 2, 5, pal.coatDark);
  } else if (dir === 2) {
    px(ctx, ox + 11, armY + (swing > 0 ? 1 : 0), 2, 5, pal.coatDark);
  } else {
    px(ctx, ox + 3, armY, 1, 5, pal.coatDark);
    px(ctx, ox + 12, armY, 1, 5, pal.coatDark);
  }

  // Head.
  px(ctx, ox + 5, headY, 6, 7, pal.skin);
  px(ctx, ox + 5, headY + 6, 6, 1, '#00000022');

  // Hair.
  const h = pal.hair;
  switch (face.hairStyle) {
    case 'bun':
      px(ctx, ox + 5, headY - 1, 6, 3, h);
      px(ctx, ox + 4, headY, 1, 4, h);
      px(ctx, ox + 11, headY, 1, 4, h);
      if (dir !== 3) px(ctx, ox + 6, headY - 3, 4, 2, h);
      break;
    case 'short':
      px(ctx, ox + 5, headY - 1, 6, 3, h);
      px(ctx, ox + 4, headY, 1, 3, h);
      px(ctx, ox + 11, headY, 1, 3, h);
      break;
    case 'slick':
      px(ctx, ox + 5, headY - 1, 6, 2, h);
      px(ctx, ox + 10, headY + 1, 1, 3, h);
      break;
    case 'cap':
      px(ctx, ox + 4, headY - 2, 8, 3, P.night3);
      px(ctx, ox + 4, headY + 1, 8, 1, P.amber3);
      break;
  }

  // Face detail only when looking towards or across the camera.
  if (dir === 0) {
    px(ctx, ox + 6, headY + 3, 1, 2, P.ink);
    px(ctx, ox + 9, headY + 3, 1, 2, P.ink);
  } else if (dir === 1) {
    px(ctx, ox + 6, headY + 3, 1, 2, P.ink);
  } else if (dir === 2) {
    px(ctx, ox + 9, headY + 3, 1, 2, P.ink);
  }

  if (face.scarf) px(ctx, ox + 4, bodyY - 1, 8, 2, P.red);
}

function sheetKey(id: string): string {
  return `char_${id}`;
}

export function buildCharacterSheets(scene: Phaser.Scene): void {
  const all: { id: string; pal: Character['palette']; face: Character['face'] }[] = [
    { id: 'ori', pal: ORI, face: ORI_FACE },
    ...CHARACTERS.map((c) => ({ id: c.id, pal: c.palette, face: c.face })),
  ];
  for (const entry of all) {
    makeSheet(scene, sheetKey(entry.id), CHAR_FRAME_W, CHAR_FRAME_H, 12, (ctx) => {
      for (let dir = 0; dir < 4; dir++) {
        for (let step = 0; step < 3; step++) {
          drawCharFrame(ctx, (dir * 3 + step) * CHAR_FRAME_W, dir as Dir, step, entry.pal, entry.face);
        }
      }
    });
  }
}

export function charTexture(id: string): string {
  return sheetKey(id);
}

export function frameFor(dir: Dir, step: number): number {
  return dir * 3 + step;
}

/* ================================================================== */
/* Portraits                                                           */
/* ================================================================== */

const EMOTIONS: Emotion[] = [
  'neutral',
  'hesitant',
  'defensive',
  'relieved',
  'avoidant',
  'alarmed',
  'warm',
  'sullen',
  'sad',
];

function drawPortrait(ctx: Ctx, pal: Character['palette'], face: Character['face'], emo: Emotion): void {
  const W = 64;
  const H = 64;
  ctx.clearRect(0, 0, W, H);

  // Backing plate so the portrait reads against any dialogue box.
  px(ctx, 0, 0, W, H, P.slate0);
  px(ctx, 0, 0, W, 1, P.slate2);
  px(ctx, 0, H - 1, W, 1, P.ink);
  speckle(ctx, 0, 0, W, H, '#00000033', 0.05, 17);

  const lift = face.height === 'small' ? 3 : face.height === 'tall' ? -1 : 1;

  // Shoulders.
  const shW = face.height === 'tall' ? 52 : face.height === 'small' ? 40 : 46;
  px(ctx, (W - shW) / 2, 50 + lift, shW, 14, pal.coat);
  px(ctx, (W - shW) / 2, 50 + lift, shW, 2, pal.accent);
  px(ctx, (W - shW) / 2, 52 + lift, 2, 12, pal.coatDark);
  px(ctx, (W + shW) / 2 - 2, 52 + lift, 2, 12, pal.coatDark);

  // Neck.
  px(ctx, 28, 44 + lift, 8, 8, pal.skin);
  px(ctx, 28, 44 + lift, 8, 2, '#00000033');

  // Head.
  const hx = 18;
  const hy = 12 + lift;
  const hw = 28;
  const hh = 34;
  px(ctx, hx + 2, hy, hw - 4, hh, pal.skin);
  px(ctx, hx, hy + 4, 2, hh - 10, pal.skin);
  px(ctx, hx + hw - 2, hy + 4, 2, hh - 10, pal.skin);
  px(ctx, hx + 4, hy + hh, hw - 8, 2, pal.skin);
  // Shading down the right side.
  px(ctx, hx + hw - 5, hy + 4, 3, hh - 6, '#00000022');

  // Hair.
  const h = pal.hair;
  switch (face.hairStyle) {
    case 'bun':
      px(ctx, hx, hy - 4, hw, 10, h);
      px(ctx, hx - 1, hy + 2, 3, 16, h);
      px(ctx, hx + hw - 2, hy + 2, 3, 16, h);
      px(ctx, hx + 8, hy - 9, 12, 6, h);
      px(ctx, hx + 10, hy - 10, 8, 2, h);
      break;
    case 'short':
      px(ctx, hx, hy - 4, hw, 9, h);
      px(ctx, hx - 1, hy + 2, 3, 20, h);
      px(ctx, hx + hw - 2, hy + 2, 3, 20, h);
      px(ctx, hx + 4, hy + 4, 8, 2, h);
      break;
    case 'slick':
      px(ctx, hx, hy - 3, hw, 7, h);
      px(ctx, hx + hw - 4, hy + 3, 4, 10, h);
      px(ctx, hx + 2, hy + 3, 10, 2, h);
      break;
    case 'cap':
      px(ctx, hx - 2, hy - 6, hw + 4, 9, P.night3);
      px(ctx, hx - 4, hy + 2, hw + 8, 3, P.night2);
      px(ctx, hx + 2, hy - 3, hw - 4, 2, P.amber3);
      px(ctx, hx + 1, hy + 3, 3, 8, h);
      px(ctx, hx + hw - 4, hy + 3, 3, 8, h);
      break;
  }

  // Eyes.
  const eyeY = hy + 16;
  const lx = hx + 6;
  const rx = hx + hw - 12;
  const drawEye = (x: number, shape: 'open' | 'narrow' | 'wide' | 'closed' | 'aside') => {
    px(ctx, x, eyeY - 1, 6, 6, P.white);
    if (shape === 'closed') {
      px(ctx, x, eyeY - 1, 6, 6, pal.skin);
      px(ctx, x, eyeY + 2, 6, 1, P.ink);
      return;
    }
    let pupilX = x + 2;
    if (shape === 'aside') pupilX = x + 3;
    const pupilH = shape === 'narrow' ? 2 : shape === 'wide' ? 5 : 4;
    const pupilY = shape === 'wide' ? eyeY - 1 : eyeY;
    px(ctx, pupilX, pupilY, 2, pupilH, P.ink);
    if (shape === 'narrow') {
      px(ctx, x, eyeY - 1, 6, 2, pal.skin);
      px(ctx, x, eyeY + 3, 6, 2, pal.skin);
    }
    px(ctx, pupilX, pupilY, 1, 1, P.white);
  };

  const drawBrow = (x: number, tilt: number, thick = 2) => {
    for (let i = 0; i < 7; i++) {
      px(ctx, x + i, eyeY - 5 + Math.round((i / 6) * tilt), 1, thick, pal.hair);
    }
  };

  const mouthY = hy + 26;
  const mouth = (kind: 'line' | 'smile' | 'frown' | 'open' | 'small' | 'flat') => {
    switch (kind) {
      case 'line':
        px(ctx, hx + 11, mouthY, 6, 1, '#8a4a44');
        break;
      case 'smile':
        px(ctx, hx + 10, mouthY, 8, 1, '#8a4a44');
        px(ctx, hx + 9, mouthY - 1, 1, 1, '#8a4a44');
        px(ctx, hx + 18, mouthY - 1, 1, 1, '#8a4a44');
        break;
      case 'frown':
        px(ctx, hx + 10, mouthY + 1, 8, 1, '#8a4a44');
        px(ctx, hx + 9, mouthY, 1, 1, '#8a4a44');
        px(ctx, hx + 18, mouthY, 1, 1, '#8a4a44');
        break;
      case 'open':
        px(ctx, hx + 11, mouthY - 1, 6, 5, '#4a1f22');
        px(ctx, hx + 12, mouthY, 4, 2, '#7a3336');
        break;
      case 'small':
        px(ctx, hx + 12, mouthY, 4, 1, '#8a4a44');
        break;
      case 'flat':
        px(ctx, hx + 10, mouthY, 8, 1, '#7a4038');
        break;
    }
  };

  switch (emo) {
    case 'neutral':
      drawEye(lx, 'open');
      drawEye(rx, 'open');
      drawBrow(lx, 0);
      drawBrow(rx, 0);
      mouth('line');
      break;
    case 'warm':
      drawEye(lx, 'narrow');
      drawEye(rx, 'narrow');
      drawBrow(lx, -1);
      drawBrow(rx, 1);
      mouth('smile');
      px(ctx, hx + 3, eyeY + 6, 5, 2, '#00000018');
      break;
    case 'hesitant':
      drawEye(lx, 'aside');
      drawEye(rx, 'aside');
      drawBrow(lx, 2);
      drawBrow(rx, -2);
      mouth('small');
      break;
    case 'defensive':
      drawEye(lx, 'narrow');
      drawEye(rx, 'narrow');
      drawBrow(lx, -3, 3);
      drawBrow(rx, 3, 3);
      mouth('frown');
      break;
    case 'avoidant':
      drawEye(lx, 'aside');
      drawEye(rx, 'closed');
      drawBrow(lx, 1);
      drawBrow(rx, 1);
      mouth('flat');
      // Sweat bead.
      px(ctx, hx + hw + 1, hy + 8, 2, 3, '#9fd4ff');
      px(ctx, hx + hw + 1, hy + 11, 2, 1, '#dff0ff');
      break;
    case 'alarmed':
      drawEye(lx, 'wide');
      drawEye(rx, 'wide');
      drawBrow(lx, 3);
      drawBrow(rx, -3);
      mouth('open');
      px(ctx, hx + hw + 1, hy + 5, 2, 4, '#9fd4ff');
      break;
    case 'relieved':
      drawEye(lx, 'closed');
      drawEye(rx, 'closed');
      drawBrow(lx, 1);
      drawBrow(rx, -1);
      mouth('smile');
      break;
    case 'sullen':
      drawEye(lx, 'narrow');
      drawEye(rx, 'narrow');
      drawBrow(lx, -2, 3);
      drawBrow(rx, 2, 3);
      mouth('flat');
      px(ctx, hx + 2, hy + 22, hw - 4, 6, '#00000018');
      break;
    case 'sad':
      drawEye(lx, 'open');
      drawEye(rx, 'open');
      drawBrow(lx, 3);
      drawBrow(rx, -3);
      mouth('frown');
      break;
  }

  if (face.glasses) {
    px(ctx, lx - 1, eyeY - 2, 8, 8, P.slate3);
    px(ctx, rx - 1, eyeY - 2, 8, 8, P.slate3);
    px(ctx, lx, eyeY - 1, 6, 6, 'rgba(180,220,255,0.10)');
    px(ctx, rx, eyeY - 1, 6, 6, 'rgba(180,220,255,0.10)');
    px(ctx, lx + 7, eyeY + 1, rx - lx - 7, 1, P.slate3);
  }
  if (face.scarf) px(ctx, 18, 48 + lift, 28, 4, P.red);
}

export function portraitKey(id: string, emo: Emotion): string {
  return `pt_${id}_${emo}`;
}

export function buildPortraits(scene: Phaser.Scene): void {
  const all: { id: string; pal: Character['palette']; face: Character['face'] }[] = [
    { id: 'ori', pal: ORI, face: ORI_FACE },
    ...CHARACTERS.map((c) => ({ id: c.id, pal: c.palette, face: c.face })),
  ];
  for (const entry of all) {
    for (const emo of EMOTIONS) {
      makeTexture(scene, portraitKey(entry.id, emo), 64, 64, (ctx) =>
        drawPortrait(ctx, entry.pal, entry.face, emo),
      );
    }
  }
}

/* ================================================================== */
/* Evidence icons                                                      */
/* ================================================================== */

type IconKind = (typeof EVIDENCE)[number]['icon'];

function drawIcon(ctx: Ctx, kind: IconKind): void {
  ctx.clearRect(0, 0, 16, 16);
  switch (kind) {
    case 'ticket':
      px(ctx, 1, 4, 14, 8, P.paper);
      px(ctx, 1, 4, 14, 1, P.white);
      px(ctx, 3, 6, 8, 1, P.slate1);
      px(ctx, 3, 8, 6, 1, P.slate1);
      px(ctx, 11, 6, 3, 4, P.red);
      px(ctx, 1, 11, 14, 1, P.paperDim);
      break;
    case 'coat':
      px(ctx, 5, 2, 6, 2, P.slate3);
      px(ctx, 3, 4, 10, 10, '#7b8296');
      px(ctx, 3, 4, 10, 1, '#9aa1b5');
      px(ctx, 7, 4, 2, 10, '#5c6274');
      px(ctx, 4, 7, 1, 1, '#5c6274');
      px(ctx, 11, 9, 1, 1, '#5c6274');
      break;
    case 'hat':
      px(ctx, 5, 3, 6, 5, '#4a4436');
      px(ctx, 2, 8, 12, 2, '#5b5442');
      px(ctx, 5, 7, 6, 1, P.amber2);
      px(ctx, 2, 10, 12, 1, '#3a3529');
      break;
    case 'cane':
      px(ctx, 9, 3, 2, 11, P.wood2);
      px(ctx, 6, 2, 5, 2, P.slate3);
      px(ctx, 6, 2, 3, 1, P.white);
      px(ctx, 9, 13, 2, 2, P.ink);
      break;
    case 'dust':
      px(ctx, 4, 5, 8, 7, '#3a3a2a');
      speckle(ctx, 4, 5, 8, 7, '#e8dfa8', 0.5, 4);
      px(ctx, 3, 12, 10, 1, '#22221a');
      break;
    case 'ladder':
      px(ctx, 3, 2, 2, 12, P.slate2);
      px(ctx, 11, 2, 2, 12, P.slate2);
      px(ctx, 3, 4, 10, 1, P.slate3);
      px(ctx, 3, 8, 10, 1, P.slate3);
      px(ctx, 3, 12, 10, 1, P.slate3);
      px(ctx, 11, 2, 3, 2, P.red);
      break;
    case 'notice':
      px(ctx, 2, 2, 12, 12, P.paper);
      px(ctx, 2, 2, 12, 2, P.amber2);
      px(ctx, 4, 6, 8, 1, P.slate1);
      px(ctx, 4, 8, 8, 1, P.slate1);
      px(ctx, 4, 10, 5, 1, P.slate1);
      break;
    case 'footprint':
      px(ctx, 5, 3, 5, 6, '#5a6a8a');
      px(ctx, 6, 9, 3, 3, '#5a6a8a');
      px(ctx, 4, 2, 2, 2, '#41506c');
      px(ctx, 10, 4, 2, 2, '#41506c');
      px(ctx, 2, 13, 12, 1, P.slate1);
      break;
    case 'cufflink':
      px(ctx, 4, 5, 8, 6, P.slate3);
      px(ctx, 5, 6, 6, 4, '#c9d2e8');
      px(ctx, 6, 7, 4, 2, P.slate2);
      px(ctx, 3, 7, 1, 2, P.slate3);
      px(ctx, 12, 7, 1, 2, P.slate3);
      break;
    case 'seal':
      px(ctx, 4, 4, 8, 8, P.red);
      px(ctx, 5, 5, 6, 6, '#a83530');
      px(ctx, 6, 6, 4, 4, P.redSoft);
      px(ctx, 3, 7, 10, 1, '#2a1c14');
      break;
    case 'tin':
      px(ctx, 2, 5, 12, 8, '#6f7c5a');
      px(ctx, 2, 4, 12, 2, '#8a986f');
      px(ctx, 4, 8, 3, 3, P.amber3);
      px(ctx, 8, 9, 3, 3, P.amber2);
      px(ctx, 2, 12, 12, 1, '#4a5340');
      break;
    case 'book':
      px(ctx, 3, 2, 10, 12, '#3f5a7a');
      px(ctx, 3, 2, 2, 12, '#2c4159');
      px(ctx, 6, 5, 5, 1, P.amber4);
      px(ctx, 6, 7, 5, 1, P.amber3);
      px(ctx, 12, 2, 1, 12, P.paper);
      break;
    case 'receipt':
      px(ctx, 4, 1, 8, 13, P.paper);
      px(ctx, 5, 4, 6, 1, P.slate1);
      px(ctx, 5, 6, 6, 1, P.slate1);
      px(ctx, 5, 8, 4, 1, P.slate1);
      px(ctx, 4, 13, 8, 1, P.paperDim);
      px(ctx, 7, 0, 2, 3, P.slate2);
      break;
  }
}

export function iconKey(kind: string): string {
  return `icon_${kind}`;
}

export function buildIcons(scene: Phaser.Scene): void {
  const kinds = new Set(EVIDENCE.map((e) => e.icon));
  for (const k of kinds) makeTexture(scene, iconKey(k), 16, 16, (ctx) => drawIcon(ctx, k));
  makeTexture(scene, iconKey('unknown'), 16, 16, (ctx) => {
    px(ctx, 3, 3, 10, 10, P.slate1);
    px(ctx, 7, 5, 2, 5, P.slate3);
    px(ctx, 7, 11, 2, 2, P.slate3);
  });
}

/* ================================================================== */
/* UI plates                                                           */
/* ================================================================== */

export function buildUiTextures(scene: Phaser.Scene): void {
  // A 9-slice-ish panel drawn at final size; simple and crisp.
  makeTexture(scene, 'panel_edge', 8, 8, (c) => {
    px(c, 0, 0, 8, 8, P.slate0);
    px(c, 0, 0, 8, 1, P.slate2);
    px(c, 0, 7, 8, 1, P.ink);
  });

  makeTexture(scene, 'title_emblem', 64, 64, (c) => {
    // A pocket watch over crossed rails.
    px(c, 8, 34, 48, 3, P.slate2);
    px(c, 8, 40, 48, 3, P.slate2);
    for (let x = 10; x < 56; x += 8) px(c, x, 32, 3, 13, P.wood1);
    px(c, 22, 8, 20, 22, P.amber2);
    px(c, 24, 10, 16, 18, P.amber4);
    px(c, 26, 12, 12, 14, P.paper);
    px(c, 31, 14, 2, 6, P.ink);
    px(c, 32, 19, 5, 2, P.ink);
    px(c, 29, 4, 6, 4, P.amber1);
    px(c, 30, 2, 4, 3, P.amber2);
  });
}

export function buildAllArt(scene: Phaser.Scene): void {
  buildWorldTextures(scene);
  buildCharacterSheets(scene);
  buildPortraits(scene);
  buildIcons(scene);
  buildUiTextures(scene);
}

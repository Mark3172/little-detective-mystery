import Phaser from 'phaser';
import { FONT } from '../core/config';
import { P, toInt } from '../core/palette';
import { Audio } from '../core/audio';

export interface PanelOpts {
  fill?: string;
  border?: string;
  shadow?: string;
  alpha?: number;
}

/** A flat pixel panel: 1px light top edge, 1px dark bottom edge, no rounding. */
export function panel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  w: number,
  h: number,
  opts: PanelOpts = {},
): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  const fill = toInt(opts.fill ?? P.slate0);
  const border = toInt(opts.border ?? P.slate2);
  const shadow = toInt(opts.shadow ?? P.ink);
  g.fillStyle(shadow, (opts.alpha ?? 0.96) * 0.9);
  g.fillRect(x + 3, y + 3, w, h);
  g.fillStyle(fill, opts.alpha ?? 0.96);
  g.fillRect(x, y, w, h);
  g.fillStyle(border, 1);
  g.fillRect(x, y, w, 2);
  g.fillRect(x, y, 2, h);
  g.fillStyle(shadow, 1);
  g.fillRect(x, y + h - 2, w, 2);
  g.fillRect(x + w - 2, y, 2, h);
  return g;
}

export function label(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  size = 16,
  color: string = P.paper,
  wrap?: number,
): Phaser.GameObjects.Text {
  const t = scene.add.text(x, y, text, {
    fontFamily: FONT,
    fontSize: `${size}px`,
    color,
    wordWrap: wrap ? { width: wrap } : undefined,
    lineSpacing: Math.round(size * 0.35),
  });
  t.setResolution(1);
  return t;
}

export interface ButtonOpts {
  size?: number;
  fill?: string;
  hover?: string;
  color?: string;
  align?: 'left' | 'center';
  disabled?: boolean;
  badge?: string;
}

export interface Button {
  container: Phaser.GameObjects.Container;
  setLabel(text: string): void;
  setDisabled(v: boolean): void;
  destroy(): void;
}

export function button(
  scene: Phaser.Scene,
  x: number,
  y: number,
  w: number,
  h: number,
  text: string,
  onClick: () => void,
  opts: ButtonOpts = {},
): Button {
  const size = opts.size ?? 16;
  const baseFill = opts.fill ?? P.slate1;
  const hoverFill = opts.hover ?? P.slate2;
  let disabled = opts.disabled ?? false;

  const container = scene.add.container(x, y);
  const g = scene.add.graphics();
  const txt = scene.add.text(opts.align === 'center' ? w / 2 : 14, h / 2, text, {
    fontFamily: FONT,
    fontSize: `${size}px`,
    color: opts.color ?? P.paper,
    wordWrap: { width: w - 26 },
    lineSpacing: 2,
  });
  txt.setResolution(1);
  txt.setOrigin(opts.align === 'center' ? 0.5 : 0, 0.5);
  container.add([g, txt]);

  const paint = (fill: string) => {
    g.clear();
    g.fillStyle(toInt(P.ink), 0.85);
    g.fillRect(2, 2, w, h);
    g.fillStyle(toInt(disabled ? P.slate0 : fill), 1);
    g.fillRect(0, 0, w, h);
    g.fillStyle(toInt(disabled ? P.slate1 : P.slate3), 1);
    g.fillRect(0, 0, w, 2);
    g.fillRect(0, 0, 2, h);
    g.fillStyle(toInt(P.ink), 1);
    g.fillRect(0, h - 2, w, 2);
    g.fillRect(w - 2, 0, 2, h);
    if (opts.badge) {
      g.fillStyle(toInt(P.red), 1);
      g.fillRect(w - 14, 6, 8, 8);
    }
  };
  paint(baseFill);
  txt.setColor(disabled ? P.slate2 : (opts.color ?? P.paper));

  const zone = scene.add.zone(0, 0, w, h).setOrigin(0, 0).setInteractive({ useHandCursor: true });
  container.add(zone);

  zone.on('pointerover', () => {
    if (disabled) return;
    paint(hoverFill);
    Audio.blip();
  });
  zone.on('pointerout', () => paint(baseFill));
  zone.on('pointerdown', () => {
    if (disabled) return;
    paint(P.amber1);
  });
  zone.on('pointerup', () => {
    if (disabled) return;
    paint(hoverFill);
    Audio.select();
    onClick();
  });

  return {
    container,
    setLabel(next: string) {
      txt.setText(next);
    },
    setDisabled(v: boolean) {
      disabled = v;
      txt.setColor(v ? P.slate2 : (opts.color ?? P.paper));
      paint(baseFill);
    },
    destroy() {
      container.destroy(true);
    },
  };
}

/** Reveals text one character at a time; returns a controller that can skip. */
export function typewriter(
  scene: Phaser.Scene,
  textObj: Phaser.GameObjects.Text,
  full: string,
  msPerChar = 18,
  onDone?: () => void,
): { skip(): void; done(): boolean; destroy(): void } {
  let i = 0;
  let finished = false;
  textObj.setText('');
  const timer = scene.time.addEvent({
    delay: msPerChar,
    loop: true,
    callback: () => {
      i++;
      textObj.setText(full.slice(0, i));
      if (i % 3 === 0) Audio.blip();
      if (i >= full.length) {
        finished = true;
        timer.remove();
        onDone?.();
      }
    },
  });
  return {
    skip() {
      if (finished) return;
      finished = true;
      timer.remove();
      textObj.setText(full);
      onDone?.();
    },
    done: () => finished,
    destroy() {
      timer.remove();
    },
  };
}

/** Full-screen dim used behind every overlay scene. */
export function scrim(scene: Phaser.Scene, w: number, h: number, alpha = 0.72): Phaser.GameObjects.Rectangle {
  return scene.add.rectangle(0, 0, w, h, toInt(P.night0), alpha).setOrigin(0, 0);
}

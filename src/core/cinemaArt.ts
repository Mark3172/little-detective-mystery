import type Phaser from 'phaser';
import { GAME_W } from './config';
import { P, toInt } from './palette';
import { makeTexture, px } from './pixel';
export function buildCinemaTextures(scene: Phaser.Scene): void {
  makeTexture(scene, 'cine_plat', 16, 16, (c) => {
    px(c, 0, 0, 16, 16, '#2a2834');
    px(c, 0, 0, 16, 1, '#3a3848');
    px(c, 0, 15, 16, 1, '#1a1820');
    px(c, 4, 6, 1, 1, '#4a4458');
    px(c, 11, 10, 1, 1, '#22202c');
  });

  makeTexture(scene, 'cine_lamp', 16, 48, (c) => {
    px(c, 7, 10, 2, 38, '#3a3a44');
    px(c, 6, 46, 4, 2, '#2a2a32');
    px(c, 4, 2, 8, 10, P.amber3);
    px(c, 5, 3, 6, 8, P.amber4);
    px(c, 6, 4, 4, 6, P.paper);
    px(c, 3, 2, 10, 2, '#4a4436');
  });

  makeTexture(scene, 'cine_house', 40, 28, (c) => {
    px(c, 6, 10, 28, 16, '#2a2230');
    px(c, 4, 8, 32, 4, '#3a2a28');
    px(c, 16, 2, 8, 8, '#3a2a28');
    px(c, 18, 0, 4, 4, '#2a1c1c');
    px(c, 12, 14, 6, 6, '#1a1420');
    px(c, 22, 14, 6, 6, '#1a1420');
    px(c, 24, 16, 2, 2, P.amber2);
    px(c, 18, 20, 4, 6, '#1a1420');
  });

  makeTexture(scene, 'cine_steam', 24, 24, (c) => {
    px(c, 8, 10, 8, 8, '#d8d4cc55');
    px(c, 4, 6, 6, 6, '#d8d4cc44');
    px(c, 12, 4, 7, 7, '#d8d4cc33');
  });

  makeTexture(scene, 'cine_case', 16, 8, (c) => {
    px(c, 1, 2, 14, 5, '#3a2a18');
    px(c, 1, 2, 14, 1, '#6a5030');
    px(c, 6, 3, 4, 2, P.amber3);
    px(c, 0, 6, 16, 2, '#2a1c10');
  });

  makeTexture(scene, 'cine_rail', 32, 8, (c) => {
    px(c, 0, 3, 32, 2, '#4a4450');
    px(c, 0, 6, 32, 1, '#2a2830');
    px(c, 4, 1, 2, 6, '#3a3428');
    px(c, 20, 1, 2, 6, '#3a3428');
  });
}

function cineText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  size: number,
  color: string,
  wrap?: number,
): Phaser.GameObjects.Text {
  const t = scene.add.text(x, y, text, {
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: `${size}px`,
    color,
    align: 'center',
    wordWrap: wrap ? { width: wrap } : undefined,
    lineSpacing: 6,
    padding: { x: 4, y: 2 },
  });
  t.setResolution(2);
  return t;
}

export function captionBar(
  scene: Phaser.Scene,
  y: number,
  title: string,
  body: string,
): { root: Phaser.GameObjects.Container; title: Phaser.GameObjects.Text; body: Phaser.GameObjects.Text } {
  const root = scene.add.container(0, 0);
  const bar = scene.add.rectangle(0, y - 8, GAME_W, 96, toInt(P.night0), 0.88).setOrigin(0, 0);
  const rule = scene.add.rectangle(GAME_W / 2, y + 30, 160, 1, toInt(P.amber3), 0.7);
  const t = cineText(scene, GAME_W / 2, y + 6, title, 15, P.amber4);
  t.setOrigin(0.5, 0);
  const b = cineText(scene, GAME_W / 2, y + 38, body, 16, P.paper, 760);
  b.setOrigin(0.5, 0);
  root.add([bar, rule, t, b]);
  return { root, title: t, body: b };
}

export function drawTrainSide(scene: Phaser.Scene, y: number, cars = 4): Phaser.GameObjects.Container {
  const c = scene.add.container(0, 0);
  const g = scene.add.graphics();
  const carW = 208;
  const gap = 10;
  const h = 108;
  const start = 36;

  g.fillStyle(toInt('#1a1620'), 1);
  g.fillRect(20, y + h - 6, GAME_W - 40, 10);

  for (let i = 0; i < cars; i++) {
    const x = start + i * (carW + gap);
    const engine = i === 0;
    g.fillStyle(toInt(engine ? '#241820' : '#2a1c1c'), 1);
    g.fillRect(x, y + 14, carW, h - 20);
    g.fillStyle(toInt('#3a2824'), 1);
    g.fillRect(x, y + 8, carW, 10);
    g.fillStyle(toInt(P.amber2), 0.55);
    g.fillRect(x + 4, y + 10, carW - 8, 2);
    g.fillStyle(toInt('#121018'), 1);
    g.fillRect(x, y + h - 8, carW, 8);

    if (engine) {
      g.fillStyle(toInt('#1c1418'), 1);
      g.fillRect(x + 8, y - 8, 22, 22);
      g.fillRect(x + 14, y - 22, 10, 16);
      g.fillStyle(toInt('#4a3a30'), 1);
      g.fillRect(x + 4, y + 28, 28, 48);
    }

    const doorX = x + (engine ? 42 : 10);
    g.fillStyle(toInt('#1a1218'), 1);
    g.fillRect(doorX, y + 30, 18, 52);
    g.fillStyle(toInt(P.amber3), 0.35);
    g.fillRect(doorX + 4, y + 36, 10, 14);

    const win0 = doorX + 28;
    for (let w = 0; w < 3; w++) {
      const wx = win0 + w * 42;
      g.fillStyle(toInt(P.amber3), 1);
      g.fillRect(wx, y + 28, 32, 26);
      g.fillStyle(toInt(P.amber4), 0.3);
      g.fillRect(wx + 3, y + 31, 26, 20);
    }

    g.fillStyle(toInt('#2a2a32'), 1);
    g.fillCircle(x + 28, y + h, 9);
    g.fillCircle(x + carW - 28, y + h, 9);
    g.fillStyle(toInt('#121018'), 1);
    g.fillCircle(x + 28, y + h, 4);
    g.fillCircle(x + carW - 28, y + h, 4);
  }
  c.add(g);
  return c;
}

export function drawCanopy(scene: Phaser.Scene): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  g.fillStyle(toInt('#1a1624'), 1);
  g.fillRect(0, 130, GAME_W, 18);
  g.fillStyle(toInt('#2a2434'), 1);
  g.fillRect(0, 124, GAME_W, 8);
  for (let x = 80; x < GAME_W; x += 160) {
    g.fillStyle(toInt('#3a3444'), 1);
    g.fillRect(x, 148, 10, 200);
    g.fillStyle(toInt('#2a2434'), 1);
    g.fillRect(x - 8, 148, 26, 8);
  }
  return g;
}

export function drawCoachInterior(scene: Phaser.Scene, layer: Phaser.GameObjects.Container): void {
  const g = scene.add.graphics();
  g.fillStyle(toInt('#1c1420'), 1);
  g.fillRect(60, 120, 840, 280);
  g.fillStyle(toInt(P.wood0), 1);
  g.fillRect(80, 140, 800, 240);
  g.fillStyle(toInt(P.wood1), 1);
  g.fillRect(90, 150, 780, 220);
  g.fillStyle(toInt('#2a1c18'), 1);
  g.fillRect(90, 150, 780, 14);
  g.fillStyle(toInt(P.night2), 1);
  g.fillRect(118, 172, 210, 96);
  g.fillStyle(toInt(P.glass), 0.5);
  g.fillRect(126, 180, 194, 80);
  g.fillStyle(toInt(P.amber3), 0.18);
  g.fillRect(126, 180, 194, 80);
  for (let i = 0; i < 4; i++) {
    const sx = 360 + i * 92;
    g.fillStyle(toInt(P.velvet1), 1);
    g.fillRect(sx, 252, 74, 52);
    g.fillStyle(toInt(P.wood2), 1);
    g.fillRect(sx, 242, 74, 12);
    g.fillStyle(toInt(P.velvet0), 1);
    g.fillRect(sx + 6, 258, 62, 16);
  }
  g.fillStyle(toInt(P.amber1), 0.28);
  g.fillCircle(220, 310, 90);
  g.fillStyle(toInt(P.amber3), 1);
  g.fillCircle(220, 168, 6);
  layer.add(g);
}

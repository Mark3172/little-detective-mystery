import Phaser from 'phaser';
import { GAME_H, GAME_W, SCENE } from '../core/config';
import { P, toInt } from '../core/palette';
import { button, label } from '../ui/kit';
import { GameState, hasSavedGame } from '../core/state';
import { Audio } from '../core/audio';
import { stopGameplay } from '../core/flow';
import { DIFFICULTIES, DIFFICULTY_INFO } from '../core/difficulty';
import type { Difficulty } from '../data/types';

export class TitleScene extends Phaser.Scene {
  private rain?: Phaser.GameObjects.TileSprite;
  private scenery?: Phaser.GameObjects.TileSprite;
  private menuRoot!: Phaser.GameObjects.Container;
  private overlay?: Phaser.GameObjects.Container;

  constructor() {
    super(SCENE.title);
  }

  create(): void {
    Audio.setTheme('cinematic');
    this.cameras.main.setBackgroundColor(P.night0);

    this.add.rectangle(0, 0, GAME_W, GAME_H, toInt(P.night1)).setOrigin(0, 0);
    this.scenery = this.add
      .tileSprite(0, GAME_H - 260, GAME_W, 160, 'scenery')
      .setOrigin(0, 0)
      .setScale(1, 1.6)
      .setAlpha(0.55);

    this.add.rectangle(0, GAME_H - 150, GAME_W, 150, toInt(P.night0)).setOrigin(0, 0);
    for (let x = 40; x < GAME_W; x += 150) {
      this.add.rectangle(x, GAME_H - 120, 96, 54, toInt(P.amber1), 0.5).setOrigin(0, 0);
      this.add.rectangle(x + 4, GAME_H - 116, 88, 46, toInt(P.amber3), 0.22).setOrigin(0, 0);
    }

    this.rain = this.add.tileSprite(0, 0, GAME_W, GAME_H, 'rain').setOrigin(0, 0).setAlpha(0.5);

    const emblem = this.add.image(GAME_W / 2, 118, 'title_emblem').setScale(2);
    this.tweens.add({ targets: emblem, y: 124, duration: 2600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    this.menuRoot = this.add.container(0, 0);

    const t1 = label(this, GAME_W / 2, 178, 'MIDNIGHT EXPRESS', 36, P.amber4);
    t1.setOrigin(0.5, 0);
    const t2 = label(this, GAME_W / 2, 226, 'The Passenger Who Never Arrived', 18, P.paperDim);
    t2.setOrigin(0.5, 0);
    const t3 = label(this, GAME_W / 2, 254, 'A case for Ori Calder, aged 13', 14, P.slate3);
    t3.setOrigin(0.5, 0);
    this.menuRoot.add([t1, t2, t3]);

    const bw = 320;
    const bx = GAME_W / 2 - bw / 2;
    let by = hasSavedGame() ? 298 : 318;

    if (hasSavedGame()) {
      const cont = button(this, bx, by, bw, 44, 'CONTINUE', () => {
        Audio.unlock();
        if (GameState.load()) {
          stopGameplay(this, SCENE.title);
          this.scene.start(SCENE.train, { prologue: false });
        } else this.showDifficulty();
      }, { align: 'center', fill: P.amber1, hover: P.amber2 });
      this.menuRoot.add(cont.container);
      by += 56;
    }

    const neu = button(this, bx, by, bw, 40, 'NEW GAME', () => {
      if (hasSavedGame()) this.showOverwrite();
      else this.showDifficulty();
    }, { align: 'center' });
    this.menuRoot.add(neu.container);
    by += 48;

    const cred = button(this, bx, by, bw, 40, 'CREDITS', () => {
      Audio.unlock();
      stopGameplay(this, SCENE.ending);
      this.scene.start(SCENE.ending, { creditsOnly: true });
    }, { align: 'center' });
    this.menuRoot.add(cred.container);
    by += 48;

    const mute = button(
      this,
      bx,
      by,
      bw,
      36,
      GameState.settings.muted ? 'SOUND: OFF' : 'SOUND: ON',
      () => {
        Audio.unlock();
        Audio.setMuted(!Audio.muted);
        mute.setLabel(Audio.muted ? 'SOUND: OFF' : 'SOUND: ON');
      },
      { align: 'center', size: 14 },
    );
    this.menuRoot.add(mute.container);

    const hint = label(
      this,
      GAME_W / 2,
      GAME_H - 48,
      'WASD move   ·   E interact   ·   J notebook   ·   R reconstruct   ·   Esc pause',
      13,
      P.slate3,
      820,
    );
    hint.setOrigin(0.5, 0);
    this.menuRoot.add(hint);

    this.input.once('pointerdown', () => Audio.unlock());
    this.input.keyboard?.once('keydown', () => Audio.unlock());
  }

  private closeOverlay(): void {
    this.overlay?.destroy(true);
    this.overlay = undefined;
    this.menuRoot.setVisible(true);
  }

  private openOverlay(): Phaser.GameObjects.Container {
    this.closeOverlay();
    this.menuRoot.setVisible(false);
    const layer = this.add.container(0, 0).setDepth(80);
    const dim = this.add
      .rectangle(0, 0, GAME_W, GAME_H, toInt(P.night0), 1)
      .setOrigin(0, 0)
      .setInteractive();
    layer.add(dim);
    this.overlay = layer;
    return layer;
  }

  private startNew(difficulty: Difficulty): void {
    Audio.unlock();
    GameState.reset();
    GameState.setDifficulty(difficulty);
    GameState.clearSave();
    stopGameplay(this, SCENE.title);
    this.scene.start(SCENE.opening);
  }

  private showOverwrite(): void {
    const layer = this.openOverlay();
    const box = this.add.graphics();
    box.fillStyle(toInt(P.slate0), 1);
    box.fillRect(GAME_W / 2 - 250, 190, 500, 180);
    box.fillStyle(toInt(P.red), 1);
    box.fillRect(GAME_W / 2 - 250, 190, 500, 3);
    const msg = label(
      this,
      GAME_W / 2,
      230,
      'A saved case already exists.\nStarting a new game erases it.',
      17,
      P.paper,
      440,
    );
    msg.setOrigin(0.5, 0);
    const yes = button(this, GAME_W / 2 - 226, 310, 214, 40, 'ERASE AND START', () => {
      this.showDifficulty();
    }, { align: 'center', fill: '#5c2f3f', hover: '#7d4054' });
    const no = button(this, GAME_W / 2 + 12, 310, 214, 40, 'CANCEL', () => this.closeOverlay(), {
      align: 'center',
    });
    layer.add([box, msg, yes.container, no.container]);
  }

  private showDifficulty(): void {
    const layer = this.openOverlay();
    const title = label(this, GAME_W / 2, 70, 'HOW HARD IS THIS CASE?', 22, P.amber4);
    title.setOrigin(0.5, 0.5);
    layer.add(title);

    DIFFICULTIES.forEach((d, i) => {
      const info = DIFFICULTY_INFO[d];
      const y = 120 + i * 96;
      const b = button(this, GAME_W / 2 - 220, y, 440, 44, info.label, () => {
        this.closeOverlay();
        this.startNew(d);
      }, {
        align: 'center',
        fill: d === 'easy' ? P.amber1 : undefined,
        hover: d === 'easy' ? P.amber2 : undefined,
      });
      const s = label(this, GAME_W / 2, y + 56, info.blurb, 14, P.paperDim, 640);
      s.setOrigin(0.5, 0);
      layer.add([b.container, s]);
    });

    const cancel = button(this, GAME_W / 2 - 120, 430, 240, 36, 'CANCEL', () => this.closeOverlay(), {
      align: 'center',
      size: 14,
    });
    layer.add(cancel.container);
  }

  update(_time: number, delta: number): void {
    if (this.rain) {
      this.rain.tilePositionX += delta * 0.22;
      this.rain.tilePositionY += delta * 0.55;
    }
    if (this.scenery) this.scenery.tilePositionX += delta * 0.06;
  }
}

import Phaser from 'phaser';
import { GAME_H, GAME_W, SCENE } from '../core/config';
import { P, toInt } from '../core/palette';
import { button, label } from '../ui/kit';
import { GameState, hasSavedGame } from '../core/state';
import { Audio } from '../core/audio';
import { stopGameplay } from '../core/flow';

export class TitleScene extends Phaser.Scene {
  private rain?: Phaser.GameObjects.TileSprite;
  private scenery?: Phaser.GameObjects.TileSprite;

  constructor() {
    super(SCENE.title);
  }

  create(): void {
    Audio.setTheme('cinematic');
    this.cameras.main.setBackgroundColor(P.night0);

    // Layered night backdrop.
    this.add.rectangle(0, 0, GAME_W, GAME_H, toInt(P.night1)).setOrigin(0, 0);
    this.scenery = this.add
      .tileSprite(0, GAME_H - 260, GAME_W, 160, 'scenery')
      .setOrigin(0, 0)
      .setScale(1, 1.6)
      .setAlpha(0.55);

    // Carriage silhouette band.
    this.add.rectangle(0, GAME_H - 150, GAME_W, 150, toInt(P.night0)).setOrigin(0, 0);
    for (let x = 40; x < GAME_W; x += 150) {
      this.add.rectangle(x, GAME_H - 120, 96, 54, toInt(P.amber1), 0.5).setOrigin(0, 0);
      this.add.rectangle(x + 4, GAME_H - 116, 88, 46, toInt(P.amber3), 0.22).setOrigin(0, 0);
    }

    this.rain = this.add.tileSprite(0, 0, GAME_W, GAME_H, 'rain').setOrigin(0, 0).setAlpha(0.5);

    const emblem = this.add.image(GAME_W / 2, 118, 'title_emblem').setScale(2);
    this.tweens.add({ targets: emblem, y: 124, duration: 2600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    const t1 = label(this, 0, 178, 'MIDNIGHT EXPRESS', 44, P.amber4);
    t1.setX(GAME_W / 2 - t1.width / 2);
    const t2 = label(this, 0, 230, 'The Passenger Who Never Arrived', 22, P.paperDim);
    t2.setX(GAME_W / 2 - t2.width / 2);
    const t3 = label(this, 0, 262, 'A case for Ori Calder, aged thirteen', 14, P.slate3);
    t3.setX(GAME_W / 2 - t3.width / 2);

    const bw = 320;
    const bx = GAME_W / 2 - bw / 2;
    let by = 312;

    const startNew = () => {
      Audio.unlock();
      GameState.reset();
      GameState.clearSave();
      stopGameplay(this, SCENE.title);
      this.scene.start(SCENE.opening);
    };

    if (hasSavedGame()) {
      button(this, bx, by, bw, 44, 'CONTINUE', () => {
        Audio.unlock();
        if (GameState.load()) {
          stopGameplay(this, SCENE.title);
          this.scene.start(SCENE.train, { prologue: false });
        } else startNew();
      }, { align: 'center', fill: P.amber1, hover: P.amber2 });
      by += 56;
    }

    button(this, bx, by, bw, 44, 'NEW GAME', () => {
      if (hasSavedGame()) {
        this.confirmOverwrite(startNew);
      } else {
        startNew();
      }
    }, { align: 'center' });
    by += 56;

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

    const hint = label(
      this,
      0,
      GAME_H - 42,
      'WASD / Arrows move   ·   E or Space interact   ·   J notebook   ·   R reconstruct   ·   Esc pause',
      13,
      P.slate3,
    );
    hint.setX(GAME_W / 2 - hint.width / 2);

    this.input.once('pointerdown', () => Audio.unlock());
    this.input.keyboard?.once('keydown', () => Audio.unlock());
  }

  private confirmOverwrite(onYes: () => void): void {
    const dim = this.add.rectangle(0, 0, GAME_W, GAME_H, toInt(P.night0), 0.8).setOrigin(0, 0).setDepth(50);
    const box = this.add.graphics().setDepth(51);
    box.fillStyle(toInt(P.slate0), 1);
    box.fillRect(GAME_W / 2 - 250, 200, 500, 170);
    box.fillStyle(toInt(P.red), 1);
    box.fillRect(GAME_W / 2 - 250, 200, 500, 3);

    const msg = label(this, GAME_W / 2 - 226, 228, 'A saved case already exists.\nStarting a new game erases it.', 17, P.paper, 452);
    msg.setDepth(52);

    const yes = button(this, GAME_W / 2 - 226, 306, 214, 40, 'ERASE AND START', () => onYes(), {
      align: 'center',
      fill: '#5c2f3f',
      hover: '#7d4054',
    });
    const no = button(this, GAME_W / 2 + 12, 306, 214, 40, 'CANCEL', () => {
      dim.destroy();
      box.destroy();
      msg.destroy();
      yes.destroy();
      no.destroy();
    }, { align: 'center' });
    yes.container.setDepth(52);
    no.container.setDepth(52);
  }

  update(_time: number, delta: number): void {
    if (this.rain) {
      this.rain.tilePositionX += delta * 0.22;
      this.rain.tilePositionY += delta * 0.55;
    }
    if (this.scenery) this.scenery.tilePositionX += delta * 0.06;
  }
}

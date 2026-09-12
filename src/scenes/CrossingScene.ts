import Phaser from 'phaser';
import { GAME_H, GAME_W, SCENE } from '../core/config';
import { P, toInt } from '../core/palette';
import { label } from '../ui/kit';
import { Audio } from '../core/audio';
import { charTexture, frameFor } from '../core/art';
import type { AreaId } from '../data/types';

/**
 * Interactive walk between two cars. The player moves Ori, grabs the rail
 * when the cars jerk, looks around, then opens the next door.
 */
export class CrossingScene extends Phaser.Scene {
  private fromName = '';
  private toName = '';
  private dest!: AreaId;
  private side: 'left' | 'right' = 'right';
  private ori!: Phaser.GameObjects.Sprite;
  private rain?: Phaser.GameObjects.TileSprite;
  private cap!: Phaser.GameObjects.Text;
  private keys: Record<string, Phaser.Input.Keyboard.Key> = {};
  private dir = 1;
  private ready = false;
  private done = false;
  private lurching = false;
  private grabbed = false;
  private railGlow?: Phaser.GameObjects.Rectangle;

  constructor() {
    super({ key: SCENE.crossing });
  }

  init(data: { from: string; to: string; dest: AreaId; side: 'left' | 'right' }): void {
    this.fromName = data.from;
    this.toName = data.to;
    this.dest = data.dest;
    this.side = data.side;
    this.ready = false;
    this.done = false;
    this.lurching = false;
    this.grabbed = false;
  }

  create(): void {
    Audio.unlock();
    Audio.door();
    Audio.crossing();
    Audio.duckMusic(0.35);
    this.cameras.main.setBackgroundColor(P.night0);

    this.add.rectangle(0, 0, GAME_W, GAME_H, toInt(P.night1)).setOrigin(0, 0);
    this.rain = this.add.tileSprite(0, 0, GAME_W, GAME_H, 'rain').setOrigin(0, 0).setAlpha(0.75);

    this.add.rectangle(0, 0, 200, GAME_H, toInt('#1a1420')).setOrigin(0, 0);
    this.add.rectangle(GAME_W, 0, 200, GAME_H, toInt('#1a1420')).setOrigin(1, 0);
    this.add.rectangle(GAME_W / 2, 390, 560, 70, toInt('#2a2430')).setOrigin(0.5);
    this.add.rectangle(GAME_W / 2, 348, 520, 8, toInt('#6a5a40')).setOrigin(0.5);
    this.railGlow = this.add.rectangle(GAME_W / 2, 348, 520, 16, toInt(P.amber3), 0).setOrigin(0.5);
    this.railGlow.setInteractive({ useHandCursor: true });
    this.railGlow.on('pointerdown', () => this.grabRail());

    const lamp = this.add.rectangle(GAME_W / 2, 70, 12, 22, toInt(P.amber4));
    const glow = this.add.image(GAME_W / 2, 118, 'lampglow').setScale(1.8).setAlpha(0.5);
    this.tweens.add({ targets: [lamp, glow], y: '+=7', duration: 700, yoyo: true, repeat: -1 });

    const title = label(this, GAME_W / 2, 36, `${this.fromName}  →  ${this.toName}`, 18, P.amber4);
    title.setOrigin(0.5, 0.5);


    this.cap = label(
      this,
      GAME_W / 2,
      478,
      'A / D walk   ·   Space holds the rail   ·   Open the next door',
      14,
      P.paper,
      700,
    );
    this.cap.setOrigin(0.5, 0.5);

    const walkRight = this.side === 'right';
    this.dir = walkRight ? 1 : -1;
    this.ori = this.add
      .sprite(walkRight ? 230 : GAME_W - 230, 386, charTexture('ori'), frameFor(walkRight ? 2 : 1, 0))
      .setOrigin(0.5, 1)
      .setScale(3);

    this.addSpot(GAME_W / 2 - 40, 40, 80, 90, 'The lamp swings. Rain hits the glass between the cars.');
    this.addSpot(GAME_W / 2 - 50, 300, 100, 70, 'The coupling clanks. The next car is only a few steps away.');
    this.addSpot(80, 80, 120, 160, 'Cold air and rain. Nobody could stand out here for long.');
    this.addSpot(GAME_W - 200, 80, 120, 160, 'Dark fields rush past the gap. The train does not slow.');

    const farDoorX = walkRight ? GAME_W - 210 : 210;
    const far = this.add.zone(walkRight ? GAME_W - 200 : 0, 180, 200, 240).setOrigin(0, 0);
    far.setInteractive({ useHandCursor: true });
    far.on('pointerdown', () => this.tryDoor(farDoorX));

    this.keys = (this.input.keyboard?.addKeys('W,A,S,D,E,SPACE,LEFT,RIGHT') ?? {}) as Record<
      string,
      Phaser.Input.Keyboard.Key
    >;
    this.input.keyboard?.on('keydown-SPACE', () => {
      if (this.lurching) this.grabRail();
      else this.tryDoor(farDoorX);
    });
    this.input.keyboard?.on('keydown-E', () => this.tryDoor(farDoorX));

    this.tweens.add({
      targets: this.cameras.main,
      scrollX: 4,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.time.delayedCall(500, () => {
      this.ready = true;
    });
    this.time.delayedCall(1600, () => this.startLurch());

  }

  update(_t: number, delta: number): void {
    if (this.rain) {
      this.rain.tilePositionX += delta * 0.35;
      this.rain.tilePositionY += delta * 0.7;
    }
    if (this.done || !this.ori) return;

    let vx = 0;
    if (this.keys.A?.isDown || this.keys.LEFT?.isDown) vx -= 1;
    if (this.keys.D?.isDown || this.keys.RIGHT?.isDown) vx += 1;
    if (vx !== 0 && !this.lurching) {
      this.ori.x = Phaser.Math.Clamp(this.ori.x + vx * 0.22 * delta, 220, GAME_W - 220);
      const walk = vx > 0 ? 'ori_walk_right' : 'ori_walk_left';
      if (this.anims.exists(walk)) this.ori.play(walk, true);
    } else if (!this.lurching) {
      this.ori.anims.stop();
      this.ori.setFrame(frameFor(this.dir > 0 ? 2 : 1, 0));
    }
  }

  private addSpot(x: number, y: number, w: number, h: number, text: string): void {
    const z = this.add.zone(x, y, w, h).setOrigin(0, 0).setInteractive({ useHandCursor: true });
    z.on('pointerdown', () => {
      if (this.done) return;
      Audio.select();
      this.cap.setText(text);
    });
  }

  private startLurch(): void {
    if (this.done) return;
    this.lurching = true;
    this.grabbed = false;
    this.cap.setText('The cars jerk! Hold the rail — Space or click the bar.');
    this.railGlow?.setFillStyle(toInt(P.amber3), 0.45);
    Audio.door();
    this.cameras.main.shake(280, 0.006);
    this.time.delayedCall(1400, () => {
      if (this.done) return;
      this.lurching = false;
      this.railGlow?.setFillStyle(toInt(P.amber3), 0);
      if (this.grabbed) {
        this.cap.setText('You hold on. Walk to the next door.');
        Audio.chime();
      } else {
        this.ori.x = Phaser.Math.Clamp(this.ori.x - this.dir * 90, 220, GAME_W - 220);
        this.cap.setText('You slip back a step. Walk again, then open the door.');
        Audio.wrong();
      }
    });
  }

  private grabRail(): void {
    if (!this.lurching || this.grabbed) return;
    this.grabbed = true;
    Audio.blip();
    this.cap.setText('You grab the rail. Hold until it settles.');
  }

  private tryDoor(farX: number): void {
    if (this.done || !this.ready || this.lurching) return;
    if (Math.abs(this.ori.x - farX) > 70) {
      this.cap.setText('Walk closer to the next door first.');
      return;
    }
    this.finish();
  }

  private finish(): void {
    if (this.done) return;
    this.done = true;
    Audio.door();
    Audio.duckMusic(1);
    this.cameras.main.fadeOut(360, 5, 7, 15);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.game.events.emit('crossing-finished', { dest: this.dest, side: this.side });
      this.scene.stop();
    });
  }
}

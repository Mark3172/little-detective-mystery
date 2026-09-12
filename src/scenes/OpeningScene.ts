import Phaser from 'phaser';
import { GAME_H, GAME_W, SCENE } from '../core/config';
import { P, toInt } from '../core/palette';
import { button, label } from '../ui/kit';
import { Audio } from '../core/audio';
import { stopGameplay } from '../core/flow';
import { charTexture, frameFor } from '../core/art';

/**
 * Interactive opening film. Hotspots and choices are flavour — they do not
 * change the case. Ends by boarding the Meridian.
 */
export class OpeningScene extends Phaser.Scene {
  private layer!: Phaser.GameObjects.Container;
  private rain?: Phaser.GameObjects.TileSprite;
  private scenery?: Phaser.GameObjects.TileSprite;
  private step = 0;
  private busy = false;

  constructor() {
    super({ key: SCENE.opening });
  }

  create(): void {
    Audio.unlock();
    Audio.setTheme('cinematic');
    this.cameras.main.setBackgroundColor(P.night0);
    this.add.rectangle(0, 0, GAME_W, GAME_H, toInt(P.night1)).setOrigin(0, 0);
    this.scenery = this.add
      .tileSprite(0, GAME_H - 220, GAME_W, 140, 'scenery')
      .setOrigin(0, 0)
      .setAlpha(0.7);
    this.rain = this.add.tileSprite(0, 0, GAME_W, GAME_H, 'rain').setOrigin(0, 0).setAlpha(0.55);
    this.layer = this.add.container(0, 0);

    const skip = button(this, GAME_W - 168, 16, 148, 32, 'SKIP ▸', () => this.board(), {
      align: 'center',
      size: 13,
    });
    skip.container.setDepth(80);

    this.input.keyboard?.on('keydown-SPACE', () => this.advance());
    this.input.keyboard?.on('keydown-ENTER', () => this.advance());

    this.playStep();
  }

  update(_t: number, delta: number): void {
    if (this.rain) {
      this.rain.tilePositionX += delta * 0.28;
      this.rain.tilePositionY += delta * 0.62;
    }
    if (this.scenery) this.scenery.tilePositionX += delta * 0.08;
  }

  private clearLayer(): void {
    this.layer.removeAll(true);
    this.busy = false;
  }

  private advance(): void {
    if (this.busy) return;
    this.step += 1;
    this.playStep();
  }

  private card(title: string, sub: string, hint = 'Space / click to continue'): void {
    this.clearLayer();
    const t = label(this, GAME_W / 2, 210, title, 36, P.amber4);
    t.setOrigin(0.5, 0.5);
    const s = label(this, GAME_W / 2, 262, sub, 18, P.paperDim, 700);
    s.setOrigin(0.5, 0.5);
    const h = label(this, GAME_W / 2, 470, hint, 13, P.slate3);
    h.setOrigin(0.5, 0.5);
    this.layer.add([t, s, h]);
    this.bindContinue();
  }

  private bindContinue(): void {
    const zone = this.add.zone(0, 0, GAME_W, GAME_H).setOrigin(0, 0).setInteractive();
    this.layer.add(zone);
    zone.on('pointerdown', () => this.advance());
  }

  private playStep(): void {
    switch (this.step) {
      case 0:
        this.card('MARKY PRESENTS', 'A night train. A missing name. Forty seconds of dark.');
        Audio.chime();
        break;
      case 1:
        this.stationLook();
        break;
      case 2:
        this.seatChoice();
        break;
      case 3:
        this.card(
          'FERROW TUNNEL — AHEAD',
          'A notice by the door: the lights will go out for 38 to 42 seconds. This is normal.',
        );
        break;
      case 4:
        this.blackoutBeat();
        break;
      case 5:
        this.card(
          'SLEEPER COMPARTMENT 4',
          'The door will not open. Staff force it. A coat. A hat. A cane. An unmade bed. And no passenger.',
        );
        Audio.contradiction();
        break;
      case 6:
        this.titleSlam();
        break;
      default:
        this.board();
    }
  }

  private stationLook(): void {
    this.clearLayer();
    this.busy = true;
    const band = this.add.rectangle(0, GAME_H - 150, GAME_W, 150, toInt(P.night0)).setOrigin(0, 0);
    this.layer.add(band);
    for (let x = 50; x < GAME_W; x += 160) {
      const win = this.add.rectangle(x, GAME_H - 118, 88, 48, toInt(P.amber1), 0.55).setOrigin(0, 0);
      this.layer.add(win);
    }
    const clock = label(this, GAME_W / 2, 56, 'ALDERMERE JUNCTION  ·  21:04', 20, P.amber4);
    clock.setOrigin(0.5, 0.5);
    const cap = label(
      this,
      GAME_W / 2,
      96,
      'The Meridian is already making steam. Look closer — the film will wait.',
      16,
      P.paperDim,
      720,
    );
    cap.setOrigin(0.5, 0.5);
    this.layer.add([clock, cap]);

    const found: string[] = [];
    const addSpot = (x: number, y: number, w: number, h: number, name: string, text: string) => {
      const z = this.add.zone(x, y, w, h).setOrigin(0, 0).setInteractive({ useHandCursor: true });
      const rim = this.add.rectangle(x + w / 2, y + h / 2, w, h).setStrokeStyle(1, toInt(P.amber3), 0.45);
      this.layer.add([rim, z]);
      z.on('pointerdown', () => {
        if (found.includes(name)) return;
        found.push(name);
        Audio.select();
        cap.setText(text);
        if (found.length >= 2) {
          this.time.delayedCall(900, () => {
            this.busy = false;
            this.advance();
          });
        }
      });
    };
    addSpot(48, GAME_H - 126, 120, 70, 'train', 'Warm windows. Somebody is already sitting very still in Coach B.');
    addSpot(GAME_W / 2 - 70, 200, 140, 80, 'sky', 'Hard rain. The tunnel is still an hour west, and it does not care who you are.');
    const hint = label(this, GAME_W / 2, 470, 'Click the train  ·  Click the dark country', 13, P.slate3);
    hint.setOrigin(0.5, 0.5);
    this.layer.add(hint);
  }

  private seatChoice(): void {
    this.clearLayer();
    this.busy = true;
    const ori = this.add
      .sprite(GAME_W / 2 - 40, 300, charTexture('ori'), frameFor(3, 0))
      .setOrigin(0.5, 1)
      .setScale(3);
    this.layer.add(ori);
    const cap = label(this, GAME_W / 2, 80, 'Seat 9, Coach B. Your science-fair folder is still closed.', 18, P.paper, 700);
    cap.setOrigin(0.5, 0.5);
    this.layer.add(cap);
    const pick = (line: string) => {
      Audio.select();
      cap.setText(line);
      this.time.delayedCall(1100, () => {
        this.busy = false;
        this.advance();
      });
    };
    const a = button(this, GAME_W / 2 - 310, 400, 290, 44, 'WATCH THE RAIN', () =>
      pick('The window shows the country you are leaving. You decide to notice everything.'),
    { align: 'center' });
    const b = button(this, GAME_W / 2 + 20, 400, 290, 44, 'OPEN THE NOTEBOOK', () =>
      pick('Case fourteen. Blank page. You write the time, then the word tunnel, then you wait.'),
    { align: 'center' });
    this.layer.add([a.container, b.container]);
  }

  private blackoutBeat(): void {
    this.clearLayer();
    this.busy = true;
    const dark = this.add.rectangle(0, 0, GAME_W, GAME_H, toInt(P.night0), 0.2).setOrigin(0, 0);
    this.layer.add(dark);
    const clock = label(this, GAME_W / 2, 120, '23:52:14', 40, P.amber4);
    clock.setOrigin(0.5, 0.5);
    const cap = label(this, GAME_W / 2, 180, 'The lights go out. Stay ready.', 18, P.paperDim, 640);
    cap.setOrigin(0.5, 0.5);
    this.layer.add([clock, cap]);
    this.tweens.add({ targets: dark, fillAlpha: 0.92, duration: 500 });
    Audio.contradiction();

    const hold = button(this, GAME_W / 2 - 160, 360, 320, 48, 'KEEP YOUR EYES OPEN', () => {
      hold.setDisabled(true);
      cap.setText('In the dark: a door that does not sound like a lock. A breath. Soft shoes.');
      clock.setText('23:52:40');
      Audio.door();
      this.time.delayedCall(1400, () => {
        this.tweens.add({ targets: dark, fillAlpha: 0.15, duration: 400 });
        clock.setText('23:52:56');
        cap.setText('The lights return. Someone down the train is already shouting for a key.');
        Audio.chime();
        this.time.delayedCall(1300, () => {
          this.busy = false;
          this.advance();
        });
      });
    }, { align: 'center', fill: P.amber1, hover: P.amber2 });
    this.layer.add(hold.container);
  }

  private titleSlam(): void {
    this.clearLayer();
    this.busy = true;
    const t = label(this, GAME_W / 2, 200, 'MIDNIGHT EXPRESS', 48, P.amber4);
    t.setOrigin(0.5, 0.5).setAlpha(0);
    const s = label(this, GAME_W / 2, 258, 'The Passenger Who Never Arrived', 22, P.paper);
    s.setOrigin(0.5, 0.5).setAlpha(0);
    const o = label(this, GAME_W / 2, 310, 'A case for Ori Calder, aged thirteen', 16, P.slate3);
    o.setOrigin(0.5, 0.5).setAlpha(0);
    this.layer.add([t, s, o]);
    this.tweens.add({ targets: t, alpha: 1, y: 190, duration: 500, ease: 'Back.easeOut' });
    this.tweens.add({ targets: s, alpha: 1, duration: 500, delay: 220 });
    this.tweens.add({ targets: o, alpha: 1, duration: 500, delay: 400 });
    Audio.evidence();
    this.time.delayedCall(2200, () => {
      this.busy = false;
      this.board();
    });
  }

  private board(): void {
    this.input.keyboard?.removeAllListeners();
    stopGameplay(this, SCENE.opening);
    this.scene.start(SCENE.train, { prologue: false, briefing: true });
  }
}

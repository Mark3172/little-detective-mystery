import Phaser from 'phaser';
import { GAME_H, GAME_W, SCENE } from '../core/config';
import { P, toInt } from '../core/palette';
import { button, label } from '../ui/kit';
import { Audio } from '../core/audio';
import { stopGameplay } from '../core/flow';
import { charTexture, frameFor } from '../core/art';
import { captionBar, drawCanopy, drawCoachInterior, drawTrainSide } from '../core/cinemaArt';

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
    const emblem = this.add.image(GAME_W / 2, 150, 'title_emblem').setScale(2);
    const train = drawTrainSide(this, 330);
    train.setAlpha(0.85);
    const t = label(this, GAME_W / 2, 210, title, 32, P.amber4);
    t.setOrigin(0.5, 0.5);
    const s = label(this, GAME_W / 2, 258, sub, 16, P.paperDim, 640);
    s.setOrigin(0.5, 0.5);
    const h = label(this, GAME_W / 2, 490, hint, 13, P.slate3);
    h.setOrigin(0.5, 0.5);
    this.layer.add([emblem, train, t, s, h]);
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
    this.layer.add(drawCanopy(this));
    const plat = this.add.tileSprite(0, 348, GAME_W, 192, 'cine_plat').setOrigin(0, 0);
    const train = drawTrainSide(this, 248);
    const steam = this.add.image(70, 230, 'cine_steam').setScale(2).setAlpha(0.7);
    this.tweens.add({ targets: steam, y: 210, alpha: 0.2, duration: 1800, yoyo: true, repeat: -1 });
    const bar = captionBar(
      this,
      16,
      'ALDERMERE JUNCTION  ·  21:04',
      'The Meridian is already making steam. Click the train, then the hills.',
    );
    this.layer.add([plat, train, steam, bar.root]);

    const found: string[] = [];
    const addSpot = (x: number, y: number, w: number, h: number, name: string, text: string) => {
      const z = this.add.zone(x, y, w, h).setOrigin(0, 0).setInteractive({ useHandCursor: true });
      const glint = this.add.image(x + w / 2, y + 12, 'glint').setScale(1.4);
      this.tweens.add({ targets: glint, alpha: 0.3, duration: 700, yoyo: true, repeat: -1 });
      this.layer.add([glint, z]);
      z.on('pointerdown', () => {
        if (found.includes(name)) return;
        found.push(name);
        Audio.select();
        bar.body.setText(text);
        glint.setTint(toInt(P.slate3));
        if (found.length >= 2) {
          this.time.delayedCall(900, () => {
            this.busy = false;
            this.advance();
          });
        }
      });
    };
    addSpot(40, 248, GAME_W - 80, 120, 'train', 'Warm windows. Somebody is already sitting very still in Coach B.');
    addSpot(200, 150, 560, 80, 'sky', 'Hard rain. The tunnel is still an hour west.');
  }

  private seatChoice(): void {
    this.clearLayer();
    this.busy = true;
    drawCoachInterior(this, this.layer);
    const ori = this.add
      .sprite(420, 300, charTexture('ori'), frameFor(3, 0))
      .setOrigin(0.5, 1)
      .setScale(3);
    this.layer.add(ori);
    const cap = label(this, GAME_W / 2, 56, 'Seat 9, Coach B. Your science-fair folder is still closed.', 16, P.paper, 700);
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
    drawCoachInterior(this, this.layer);
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
    const emblem = this.add.image(GAME_W / 2, 118, 'title_emblem').setScale(1.8).setAlpha(0);
    const t = label(this, GAME_W / 2, 210, 'MIDNIGHT EXPRESS', 48, P.amber4);
    t.setOrigin(0.5, 0.5).setAlpha(0);
    const s = label(this, GAME_W / 2, 268, 'The Passenger Who Never Arrived', 22, P.paper);
    s.setOrigin(0.5, 0.5).setAlpha(0);
    const o = label(this, GAME_W / 2, 318, 'A case for Ori Calder, aged thirteen', 16, P.slate3);
    o.setOrigin(0.5, 0.5).setAlpha(0);
    const train = drawTrainSide(this, 360);
    train.setAlpha(0.5);
    this.layer.add([train, emblem, t, s, o]);
    this.tweens.add({ targets: emblem, alpha: 1, duration: 400 });
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

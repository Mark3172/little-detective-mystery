import Phaser from 'phaser';
import { GAME_H, GAME_W, SCENE } from '../core/config';
import { P, toInt } from '../core/palette';
import { button, label, panel, typewriter } from '../ui/kit';
import { Audio } from '../core/audio';
import { GameState } from '../core/state';
import { EPILOGUE } from '../data/story';
import { ENCORE, TWIST } from '../data/cinematic';
import { charTexture, frameFor } from '../core/art';
import { captionBar, drawTrainSide } from '../core/cinemaArt';
import { speakerName, speakerPortrait } from '../core/speaker';
import { stopGameplay } from '../core/flow';
import type { Line } from '../data/types';

export class EndingScene extends Phaser.Scene {
  private wrongCount = 0;
  private creditsOnly = false;
  private layer!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: SCENE.ending });
  }

  init(data: { wrongCount?: number; creditsOnly?: boolean }): void {
    this.wrongCount = data?.wrongCount ?? 0;
    this.creditsOnly = !!data?.creditsOnly;
  }

  create(): void {
    this.cameras.main.setBackgroundColor(P.night0);
    this.layer = this.add.container(0, 0);
    if (this.creditsOnly) {
      Audio.setTheme('credits');
      this.playCreditsMarky(true);
      return;
    }
    GameState.setFlag('case_solved');
    GameState.save();
    Audio.setTheme('finale');
    this.playReveal();
  }

  /* ---------------------------------------------------------------- */
  /* The animated reveal: forty seconds, replayed for real             */
  /* ---------------------------------------------------------------- */

  private playReveal(): void {
    const skip = label(this, GAME_W - 230, GAME_H - 34, 'Space / click to skip ▸', 13, P.slate2);
    const jump = () => {
      this.tweens.killAll();
      this.time.removeAllEvents();
      this.layer.destroy(true);
      skip.destroy();
      this.layer = this.add.container(0, 0);
      this.playEpilogue();
    };
    this.input.keyboard?.once('keydown-SPACE', jump);
    this.input.once('pointerdown', jump);

    const night = this.add.rectangle(0, 0, GAME_W, GAME_H, toInt(P.night1)).setOrigin(0, 0);
    const hills = this.add.tileSprite(0, 160, GAME_W, 140, 'scenery').setOrigin(0, 0).setAlpha(0.55);
    const rain = this.add.tileSprite(0, 0, GAME_W, GAME_H, 'rain').setOrigin(0, 0).setAlpha(0.28);
    const rails = this.add.tileSprite(0, 338, GAME_W, 16, 'cine_rail').setOrigin(0, 0);
    this.layer.add([night, hills, rain, rails]);
    this.tweens.add({ targets: rain, tilePositionY: 900, duration: 9000, repeat: -1 });

    const carY = 210;
    const carW = 280;
    const cars = ['SLEEPER', 'DINING', 'PASSENGER'];
    const xs = [640, 340, 40];
    cars.forEach((name, i) => {
      const g = this.add.graphics();
      g.fillStyle(toInt('#1c1420'), 1);
      g.fillRect(xs[i], carY, carW - 8, 130);
      g.fillStyle(toInt(P.wood0), 1);
      g.fillRect(xs[i] + 4, carY + 8, carW - 16, 114);
      g.fillStyle(toInt(P.amber3), 1);
      for (let wx = xs[i] + 18; wx < xs[i] + carW - 36; wx += 48) {
        g.fillRect(wx, carY + 18, 32, 22);
        g.fillStyle(toInt(P.amber4), 0.28);
        g.fillRect(wx + 2, carY + 20, 28, 18);
        g.fillStyle(toInt(P.amber3), 1);
      }
      g.fillStyle(toInt('#121018'), 1);
      g.fillRect(xs[i], carY + 122, carW - 8, 8);
      this.layer.add(g);
      this.layer.add(label(this, xs[i] + 10, carY + 138, name, 12, P.slate3));
    });

    const clock = label(this, GAME_W / 2, 60, '23:52:10', 34, P.amber4);
    clock.setOrigin(0.5, 0.5);
    const caption = label(this, GAME_W / 2, 108, 'Room 4. One passenger, in a coat that does not fit.', 16, P.paperDim);
    caption.setOrigin(0.5, 0.5);
    this.layer.add([clock, caption]);

    // "Mr. Ren" — a tall grey shape.
    const ren = this.add.rectangle(760, carY + 108, 18, 46, toInt('#7b8296')).setOrigin(0.5, 1);
    const renHat = this.add.rectangle(760, carY + 62, 26, 6, toInt('#4a4436')).setOrigin(0.5, 0.5);
    this.layer.add([ren, renHat]);

    const nadia = this.add
      .sprite(760, carY + 108, charTexture('nadia'), frameFor(1, 0))
      .setOrigin(0.5, 1)
      .setScale(1.9)
      .setAlpha(0);
    this.layer.add(nadia);

    const dark = this.add.rectangle(0, 0, GAME_W, GAME_H, toInt(P.night0), 0).setOrigin(0, 0);
    this.layer.add(dark);

    const step = (delay: number, fn: () => void) => this.time.delayedCall(delay, fn);

    step(1400, () => {
      clock.setText('23:52:14');
      caption.setText('Ferrow Tunnel. Every light on the train goes out.');
      Audio.contradiction();
      this.tweens.add({ targets: dark, fillAlpha: 0.94, duration: 400 });
    });

    step(2600, () => {
      clock.setText('23:52:20');
      caption.setText('The coat comes off. The bed ladder goes into the door track.');
      ren.setVisible(false);
      renHat.setVisible(false);
      nadia.setAlpha(1);
    });

    step(3900, () => {
      clock.setText('23:52:30');
      caption.setText('The coat goes into the laundry basket, six metres down the hall.');
      const coat = this.add.rectangle(700, carY + 96, 14, 12, toInt('#7b8296'));
      this.layer.add(coat);
      this.tweens.add({ targets: coat, x: 660, y: carY + 104, duration: 500, alpha: 0 });
      this.tweens.add({ targets: nadia, x: 660, duration: 700 });
    });

    step(5200, () => {
      clock.setText('23:52:40');
      caption.setText('One car forward. She stops at the dining counter to breathe.');
      this.tweens.add({ targets: nadia, x: 470, duration: 1100, ease: 'Sine.easeInOut' });
      nadia.setFrame(frameFor(1, 1));
    });

    step(6600, () => {
      clock.setText('23:52:56');
      caption.setText('The lights come back. Ilse sees a small shape, and guesses.');
      this.tweens.add({ targets: dark, fillAlpha: 0, duration: 500 });
      Audio.chime();
    });

    step(8000, () => {
      clock.setText('23:55:00');
      caption.setText('Seat twelve. Reading. Three passengers will remember it.');
      this.tweens.add({ targets: nadia, x: 150, duration: 1200, ease: 'Sine.easeInOut' });
    });

    step(9600, () => {
      clock.setText('00:10:00');
      caption.setText('Room 4 will not open. There was never anybody inside it to find.');
      const slam = label(this, GAME_W / 2, GAME_H - 96, 'A. REN — NO SUCH PASSENGER', 30, P.redSoft);
      slam.setOrigin(0.5, 0.5).setScale(2.4).setAlpha(0);
      slam.setShadow(0, 0, P.red, 16, true, true);
      this.layer.add(slam);
      Audio.contradiction();
      this.cameras.main.shake(400, 0.01);
      this.tweens.add({ targets: slam, scale: 1, alpha: 1, duration: 320, ease: 'Back.easeIn' });
    });

    step(12200, () => {
      this.layer.destroy(true);
      skip.destroy();
      this.layer = this.add.container(0, 0);
      this.playEpilogue();
    });
  }

  /* ---------------------------------------------------------------- */
  /* Epilogue                                                          */
  /* ---------------------------------------------------------------- */

  private playEpilogue(): void {
    const queue: Line[] = [...EPILOGUE];
    const night = this.add.rectangle(0, 0, GAME_W, GAME_H, toInt(P.night1)).setOrigin(0, 0);
    const hills = this.add.tileSprite(0, 180, GAME_W, 140, 'scenery').setOrigin(0, 0).setAlpha(0.5);
    const train = drawTrainSide(this, 200);
    train.setAlpha(0.28);
    const plat = this.add.tileSprite(0, 348, GAME_W, 192, 'cine_plat').setOrigin(0, 0).setAlpha(0.7);
    const bg = this.add.tileSprite(0, 0, GAME_W, GAME_H, 'rain').setOrigin(0, 0).setAlpha(0.28);
    this.layer.add([night, hills, train, plat, bg]);
    this.tweens.add({ targets: bg, tilePositionY: 4000, tilePositionX: 1600, duration: 40000, repeat: -1 });

    const box = panel(this, 60, 300, GAME_W - 120, 190, { fill: P.slate0, border: P.amber2 });
    const portrait = this.add.image(150, 372, speakerPortrait('ori')).setScale(2.2);
    const nameT = label(this, 250, 320, '', 16, P.amber4);
    const bodyT = label(this, 250, 350, '', 19, P.paper, GAME_W - 340);
    const arrow = label(this, GAME_W - 100, 456, '▼', 18, P.amber3);
    this.tweens.add({ targets: arrow, y: 461, duration: 600, yoyo: true, repeat: -1 });
    this.layer.add([box, portrait, nameT, bodyT, arrow]);

    let typer: ReturnType<typeof typewriter> | undefined;

    const next = () => {
      if (typer && !typer.done()) {
        typer.skip();
        return;
      }
      const line = queue.shift();
      if (!line) {
        this.playTwist();
        return;
      }
      portrait.setVisible(true);
      portrait.setTexture(speakerPortrait(line.speaker, line.emotion ?? 'neutral'));
      nameT.setText(speakerName(line.speaker).toUpperCase());
      bodyT
        .setColor(line.speaker === 'ori' ? P.amber4 : line.speaker === 'narrator' ? P.paperDim : P.paper)
        .setFontStyle('normal');
      typer = typewriter(this, bodyT, line.text, 16);
    };

    this.input.keyboard?.on('keydown-SPACE', next);
    this.input.keyboard?.on('keydown-ENTER', next);
    this.input.on('pointerdown', next);
    next();
  }

  /* ---------------------------------------------------------------- */

  private playLines(queueIn: Line[], onDone: () => void): void {
    this.input.keyboard?.removeAllListeners();
    this.input.removeAllListeners();
    this.layer.destroy(true);
    this.layer = this.add.container(0, 0);
    const queue = [...queueIn];
    const night = this.add.rectangle(0, 0, GAME_W, GAME_H, toInt(P.night1)).setOrigin(0, 0);
    const hills = this.add.tileSprite(0, 180, GAME_W, 140, 'scenery').setOrigin(0, 0).setAlpha(0.5);
    const train = drawTrainSide(this, 200);
    train.setAlpha(0.28);
    const plat = this.add.tileSprite(0, 348, GAME_W, 192, 'cine_plat').setOrigin(0, 0).setAlpha(0.7);
    const bg = this.add.tileSprite(0, 0, GAME_W, GAME_H, 'rain').setOrigin(0, 0).setAlpha(0.28);
    this.layer.add([night, hills, train, plat, bg]);
    this.tweens.add({ targets: bg, tilePositionY: 4000, tilePositionX: 1600, duration: 40000, repeat: -1 });
    const box = panel(this, 60, 300, GAME_W - 120, 190, { fill: P.slate0, border: P.amber2 });
    const portrait = this.add.image(150, 372, speakerPortrait('ori')).setScale(2.2);
    const nameT = label(this, 250, 320, '', 16, P.amber4);
    const bodyT = label(this, 250, 350, '', 19, P.paper, GAME_W - 340);
    const arrow = label(this, GAME_W - 100, 456, '▼', 18, P.amber3);
    this.tweens.add({ targets: arrow, y: 461, duration: 600, yoyo: true, repeat: -1 });
    this.layer.add([box, portrait, nameT, bodyT, arrow]);
    let typer: ReturnType<typeof typewriter> | undefined;
    const next = () => {
      if (typer && !typer.done()) {
        typer.skip();
        return;
      }
      const line = queue.shift();
      if (!line) {
        onDone();
        return;
      }
      portrait.setVisible(true);
      portrait.setTexture(speakerPortrait(line.speaker, line.emotion ?? 'neutral'));
      nameT.setText(speakerName(line.speaker).toUpperCase());
      bodyT
        .setColor(line.speaker === 'ori' ? P.amber4 : line.speaker === 'narrator' ? P.paperDim : P.paper)
        .setFontStyle('normal');
      typer = typewriter(this, bodyT, line.text, 16);
    };
    this.input.keyboard?.on('keydown-SPACE', next);
    this.input.keyboard?.on('keydown-ENTER', next);
    this.input.on('pointerdown', next);
    next();
  }

  private playTwist(): void {
    this.input.keyboard?.removeAllListeners();
    this.input.removeAllListeners();
    this.layer.destroy(true);
    this.layer = this.add.container(0, 0);
    Audio.setTheme('cinematic');

    const bg = this.add.rectangle(0, 0, GAME_W, GAME_H, toInt(P.night1)).setOrigin(0, 0);
    const hills = this.add.tileSprite(0, 180, GAME_W, 140, 'scenery').setOrigin(0, 0).setAlpha(0.85);
    const house = this.add.image(720, 248, 'cine_house').setScale(3).setOrigin(0.5, 1);
    const rain = this.add.tileSprite(0, 0, GAME_W, GAME_H, 'rain').setOrigin(0, 0).setAlpha(0.45);
    const train = drawTrainSide(this, 200);
    train.setAlpha(0.35);
    const plat = this.add.tileSprite(0, 348, GAME_W, 192, 'cine_plat').setOrigin(0, 0);
    const edge = this.add.rectangle(0, 348, GAME_W, 4, toInt(P.amber2), 0.55).setOrigin(0, 0);
    const lamp = this.add.image(GAME_W / 2, 348, 'cine_lamp').setScale(3).setOrigin(0.5, 1);
    const glow = this.add.image(GAME_W / 2, 250, 'lampglow').setScale(2.8).setAlpha(0.55);
    const nadia = this.add.sprite(400, 360, charTexture('nadia'), frameFor(2, 0)).setOrigin(0.5, 1).setScale(3);
    const gran = this.add.sprite(560, 360, charTexture('marta'), frameFor(1, 0)).setOrigin(0.5, 1).setScale(3);
    const vcase = this.add.image(590, 356, 'cine_case').setScale(2.4).setOrigin(0.5, 1);
    const bar = captionBar(
      this,
      8,
      'THE TWIST',
      'Someone is already under the lamp. Click the house, Gran, and Nadia.',
    );
    this.layer.add([bg, hills, house, rain, train, plat, edge, glow, lamp, nadia, gran, vcase, bar.root]);
    this.tweens.add({ targets: rain, tilePositionY: 800, duration: 8000, repeat: -1 });
    this.tweens.add({ targets: [lamp, glow], y: '+=5', duration: 900, yoyo: true, repeat: -1 });

    const found: string[] = [];
    const spot = (x: number, y: number, w: number, h: number, id: string, text: string) => {
      const z = this.add.zone(x, y, w, h).setOrigin(0, 0).setInteractive({ useHandCursor: true });
      const glint = this.add.image(x + w / 2, y + 8, 'glint').setScale(1.3);
      this.tweens.add({ targets: glint, alpha: 0.25, duration: 700, yoyo: true, repeat: -1 });
      this.layer.add([glint, z]);
      z.on('pointerdown', () => {
        if (found.includes(id)) return;
        found.push(id);
        Audio.select();
        bar.body.setText(text);
        glint.setTint(toInt(P.slate3));
        if (found.length >= 2) {
          this.time.delayedCall(800, () => this.playLines(TWIST, () => this.showMenu()));
        }
      });
    };
    spot(670, 200, 100, 70, 'lamp', 'The kitchen light on the hill is dark. She is not up there.');
    spot(520, 280, 80, 90, 'gran', 'Marta Vell. Retired steward. She has been on this platform since the tunnel.');
    spot(360, 280, 80, 90, 'nadia', 'Nadia is not surprised. She was walking toward this lamp the whole night.');
  }

  private playEncore(): void {
    Audio.setTheme('finale');
    this.playLines(ENCORE, () => this.playCreditsMarky());
  }

  private playCreditsMarky(fromTitle = false): void {
    this.input.keyboard?.removeAllListeners();
    this.input.removeAllListeners();
    this.layer.destroy(true);
    this.layer = this.add.container(0, 0);
    Audio.setTheme('credits');

    const night = this.add.rectangle(0, 0, GAME_W, GAME_H, toInt(P.night1)).setOrigin(0, 0);
    const train = drawTrainSide(this, 360);
    train.setAlpha(0.4);
    const bg = this.add.tileSprite(0, 0, GAME_W, GAME_H, 'rain').setOrigin(0, 0).setAlpha(0.22);
    this.layer.add([night, train, bg]);
    this.tweens.add({ targets: bg, tilePositionY: 6000, duration: 50000, repeat: -1 });

    const lines = [
      ['MARKY', 56, P.amber4],
      ['presents', 18, P.slate3],
      ['MIDNIGHT EXPRESS', 32, P.paper],
      ['The Passenger Who Never Arrived', 18, P.paperDim],
      ['', 16, P.slate3],
      ['A game by Marky', 20, P.amber3],
      ['Story, pixels, night trains', 16, P.slate3],
      ['Ori Calder and the forty seconds', 16, P.slate3],
      ['Generated locally. No studio but this one.', 14, P.slate2],
    ] as const;

    const roll = this.add.container(0, GAME_H);
    this.layer.add(roll);
    let y = 0;
    for (const [text, size, color] of lines) {
      if (!text) {
        y += 28;
        continue;
      }
      const t = label(this, GAME_W / 2, y, text, size, color);
      t.setOrigin(0.5, 0.5);
      roll.add(t);
      y += size + 18;
    }

    let closed = false;
    const done = () => {
      if (closed) return;
      closed = true;
      this.tweens.killAll();
      if (fromTitle) {
        stopGameplay(this, SCENE.title);
        this.scene.start(SCENE.title);
      } else {
        this.showMenu(true);
      }
    };

    this.tweens.add({
      targets: roll,
      y: -y - 40,
      duration: 14000,
      ease: 'Linear',
      onComplete: () => done(),
    });

    const skip = label(this, GAME_W / 2, GAME_H - 28, 'Space / click to finish ▸', 13, P.slate2);
    skip.setOrigin(0.5, 0.5);
    this.layer.add(skip);
    this.input.keyboard?.once('keydown-SPACE', done);
    this.input.once('pointerdown', done);
  }

  private showMenu(fromCredits = false): void {
    this.input.keyboard?.removeAllListeners();
    this.input.removeAllListeners();
    this.layer.destroy(true);
    this.layer = this.add.container(0, 0);

    const night = this.add.rectangle(0, 0, GAME_W, GAME_H, toInt(P.night1)).setOrigin(0, 0);
    const train = drawTrainSide(this, 400);
    train.setAlpha(0.35);
    const bg = this.add.tileSprite(0, 0, GAME_W, GAME_H, 'rain').setOrigin(0, 0).setAlpha(0.25);
    this.layer.add([night, train, bg]);
    this.tweens.add({ targets: bg, tilePositionY: 4000, duration: 40000, repeat: -1 });

    const t = label(this, GAME_W / 2, 110, 'CASE CLOSED', 46, P.amber4);
    t.setOrigin(0.5, 0.5);
    const s = label(this, GAME_W / 2, 158, 'The Passenger Who Never Arrived', 20, P.paperDim);
    s.setOrigin(0.5, 0.5);
    this.layer.add([t, s]);

    const mins = Math.floor(GameState.playedMs / 60000);
    const stats = [
      `Evidence filed: ${GameState.evidence.length} of 14`,
      `Statements recorded: ${GameState.statements.length}`,
      `Contradictions proved: 3 of 3`,
      `Wrong accusations: ${this.wrongCount}`,
      `Time aboard: ${mins} minute${mins === 1 ? '' : 's'}`,
    ];
    const box = panel(this, GAME_W / 2 - 260, 200, 520, 180, { fill: P.slate0, border: P.slate2 });
    this.layer.add(box);
    stats.forEach((line, i) => {
      const l = label(this, GAME_W / 2 - 232, 220 + i * 30, line, 16, P.paper);
      this.layer.add(l);
    });

    const b1 = button(this, GAME_W / 2 - 260, 396, 250, 40, 'PLAY AGAIN', () => {
      GameState.reset();
      GameState.clearSave();
      stopGameplay(this, SCENE.opening);
      this.scene.start(SCENE.opening);
    }, { align: 'center', fill: P.amber1, hover: P.amber2 });
    const b2 = button(this, GAME_W / 2 + 10, 396, 250, 40, 'TITLE SCREEN', () => {
      stopGameplay(this, SCENE.title);
      this.scene.start(SCENE.title);
    }, { align: 'center' });
    this.layer.add([b1.container, b2.container]);

    if (!fromCredits) {
      const b3 = button(this, GAME_W / 2 - 260, 444, 250, 36, 'ONE LAST SCENE', () => this.playEncore(), {
        align: 'center',
        size: 14,
      });
      const b4 = button(this, GAME_W / 2 + 10, 444, 250, 36, 'CREDITS — MARKY', () => this.playCreditsMarky(), {
        align: 'center',
        size: 14,
      });
      this.layer.add([b3.container, b4.container]);
    }

    const note = label(
      this,
      GAME_W / 2,
      508,
      fromCredits ? 'A MARKY picture.' : 'Optional: one last kitchen, or the MARKY credits.',
      12,
      P.slate2,
    );
    note.setOrigin(0.5, 0.5);
    this.layer.add(note);
  }
}

import Phaser from 'phaser';
import { GAME_H, GAME_W, SCENE } from '../core/config';
import { P, toInt } from '../core/palette';
import { button, label, panel, typewriter } from '../ui/kit';
import { Audio } from '../core/audio';
import { GameState } from '../core/state';
import { EPILOGUE } from '../data/story';
import { charTexture, frameFor, portraitKey } from '../core/art';
import { CHARACTERS_BY_ID } from '../data/characters';
import { stopGameplay } from '../core/flow';
import type { Line } from '../data/types';

export class EndingScene extends Phaser.Scene {
  private wrongCount = 0;
  private layer!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: SCENE.ending });
  }

  init(data: { wrongCount?: number }): void {
    this.wrongCount = data?.wrongCount ?? 0;
  }

  create(): void {
    this.cameras.main.setBackgroundColor(P.night0);
    this.layer = this.add.container(0, 0);
    GameState.setFlag('case_solved');
    GameState.save();
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

    // A cut-away of three carriages.
    const carY = 210;
    const carW = 280;
    const cars = ['SLEEPER', 'DINING', 'PASSENGER'];
    const xs = [640, 340, 40];
    cars.forEach((name, i) => {
      const g = this.add.graphics();
      g.fillStyle(toInt(P.wood0), 1);
      g.fillRect(xs[i], carY, carW, 130);
      g.fillStyle(toInt('#3a2a1c'), 1);
      g.fillRect(xs[i] + 4, carY + 4, carW - 8, 122);
      g.fillStyle(toInt(P.night1), 1);
      for (let wx = xs[i] + 18; wx < xs[i] + carW - 30; wx += 52) g.fillRect(wx, carY + 14, 34, 22);
      this.layer.add(g);
      this.layer.add(label(this, xs[i] + 10, carY + 138, name, 12, P.slate3));
    });

    const clock = label(this, GAME_W / 2, 60, '23:52:10', 34, P.amber4);
    clock.setOrigin(0.5, 0.5);
    const caption = label(this, GAME_W / 2, 108, 'Compartment 4. One passenger, in a coat that does not fit.', 16, P.paperDim);
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
      caption.setText('Ferrow Tunnel. Neutral section. Every light on the train dies.');
      Audio.contradiction();
      this.tweens.add({ targets: dark, fillAlpha: 0.94, duration: 400 });
    });

    step(2600, () => {
      clock.setText('23:52:20');
      caption.setText('The coat comes off. The bunk ladder goes into the door track.');
      ren.setVisible(false);
      renHat.setVisible(false);
      nadia.setAlpha(1);
    });

    step(3900, () => {
      clock.setText('23:52:30');
      caption.setText('The coat goes into the linen hamper, six metres down the vestibule.');
      const coat = this.add.rectangle(700, carY + 96, 14, 12, toInt('#7b8296'));
      this.layer.add(coat);
      this.tweens.add({ targets: coat, x: 660, y: carY + 104, duration: 500, alpha: 0 });
      this.tweens.add({ targets: nadia, x: 660, duration: 700 });
    });

    step(5200, () => {
      clock.setText('23:52:40');
      caption.setText('One carriage forward. She stops at the dining counter to breathe.');
      this.tweens.add({ targets: nadia, x: 470, duration: 1100, ease: 'Sine.easeInOut' });
      nadia.setFrame(frameFor(1, 1));
    });

    step(6600, () => {
      clock.setText('23:52:56');
      caption.setText('The lights come back. Ilse sees a small shape, and assumes.');
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
      caption.setText('Compartment 4 will not open. There was never anybody inside it to find.');
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
    const bg = this.add.tileSprite(0, 0, GAME_W, GAME_H, 'rain').setOrigin(0, 0).setAlpha(0.28);
    this.layer.add(bg);
    this.tweens.add({ targets: bg, tilePositionY: 4000, tilePositionX: 1600, duration: 40000, repeat: -1 });

    const box = panel(this, 60, 300, GAME_W - 120, 190, { fill: P.slate0, border: P.amber2 });
    const portrait = this.add.image(150, 372, portraitKey('ori', 'neutral')).setScale(2.2);
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
        this.showCredits();
        return;
      }
      if (line.speaker === 'narrator') {
        portrait.setVisible(false);
        nameT.setText('');
        bodyT.setColor(P.paperDim).setFontStyle('italic');
      } else {
        portrait.setVisible(true);
        portrait.setTexture(portraitKey(line.speaker, line.emotion ?? 'neutral'));
        nameT.setText(
          (line.speaker === 'ori' ? 'Ori Calder' : CHARACTERS_BY_ID[line.speaker].name).toUpperCase(),
        );
        bodyT.setColor(line.speaker === 'ori' ? P.amber4 : P.paper).setFontStyle('normal');
      }
      typer = typewriter(this, bodyT, line.text, 16);
    };

    this.input.keyboard?.on('keydown-SPACE', next);
    this.input.keyboard?.on('keydown-ENTER', next);
    this.input.on('pointerdown', next);
    next();
  }

  /* ---------------------------------------------------------------- */

  private showCredits(): void {
    this.input.keyboard?.removeAllListeners();
    this.input.removeAllListeners();
    this.layer.destroy(true);
    this.layer = this.add.container(0, 0);

    const bg = this.add.tileSprite(0, 0, GAME_W, GAME_H, 'rain').setOrigin(0, 0).setAlpha(0.25);
    this.layer.add(bg);
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

    const b1 = button(this, GAME_W / 2 - 260, 410, 250, 46, 'PLAY AGAIN', () => {
      GameState.reset();
      GameState.clearSave();
      stopGameplay(this, SCENE.train);
      this.scene.start(SCENE.train, { prologue: true });
    }, { align: 'center', fill: P.amber1, hover: P.amber2 });
    const b2 = button(this, GAME_W / 2 + 10, 410, 250, 46, 'TITLE SCREEN', () => {
      stopGameplay(this, SCENE.title);
      this.scene.start(SCENE.title);
    }, { align: 'center' });
    this.layer.add([b1.container, b2.container]);

    const note = label(
      this,
      GAME_W / 2,
      484,
      'Original case, cast, art and audio generated locally. No external assets.',
      12,
      P.slate2,
    );
    note.setOrigin(0.5, 0.5);
    this.layer.add(note);
  }
}

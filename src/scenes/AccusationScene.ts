import Phaser from 'phaser';
import { GAME_H, GAME_W, SCENE } from '../core/config';
import { P, toInt } from '../core/palette';
import { button, label, panel, type Button } from '../ui/kit';
import { Audio } from '../core/audio';
import { GameState } from '../core/state';
import { FINAL_QUESTIONS } from '../data/case';
import { portraitKey } from '../core/art';
import { stopGameplay } from '../core/flow';

export class AccusationScene extends Phaser.Scene {
  private index = 0;
  private buttons: Button[] = [];
  private transient: Phaser.GameObjects.GameObject[] = [];
  private rain?: Phaser.GameObjects.TileSprite;
  private wrongCount = 0;

  constructor() {
    super({ key: SCENE.accusation });
  }

  create(): void {
    this.index = 0;
    this.wrongCount = 0;
    this.buttons = [];
    this.transient = [];

    this.cameras.main.setBackgroundColor(P.night0);
    this.add.rectangle(0, 0, GAME_W, GAME_H, toInt(P.night1)).setOrigin(0, 0);
    this.rain = this.add.tileSprite(0, 0, GAME_W, GAME_H, 'rain').setOrigin(0, 0).setAlpha(0.35);

    // The four of them, lined up in the dining carriage.
    const ids = ['bram', 'ilse', 'kass', 'nadia'];
    ids.forEach((id, i) => {
      const img = this.add.image(150 + i * 222, 118, portraitKey(id, i === 3 ? 'hesitant' : 'defensive'));
      img.setScale(1.7).setAlpha(0.85);
      this.tweens.add({ targets: img, y: 114, duration: 1800 + i * 220, yoyo: true, repeat: -1 });
    });
    label(this, 40, 20, 'VASKAYA TERMINUS — FINAL APPROACH', 14, P.amber3);

    this.renderQuestion();
  }

  private clearTransient(): void {
    this.transient.forEach((o) => o.destroy());
    this.transient = [];
    this.buttons.forEach((b) => b.destroy());
    this.buttons = [];
  }

  private renderQuestion(): void {
    this.clearTransient();
    const q = FINAL_QUESTIONS[this.index];

    const box = panel(this, 40, 200, GAME_W - 80, 300, { fill: P.slate0, border: P.amber2 });
    this.transient.push(box);
    this.transient.push(label(this, 60, 214, `QUESTION ${this.index + 1} OF ${FINAL_QUESTIONS.length}`, 12, P.slate3));
    this.transient.push(label(this, 60, 234, q.prompt, 22, P.amber4, GAME_W - 130));

    let y = 288;
    for (const opt of q.options) {
      const b = button(this, 60, y, GAME_W - 160, 46, opt.text, () => this.answer(opt.id), { size: 14 });
      this.buttons.push(b);
      y += 52;
    }
  }

  private answer(optId: string): void {
    const q = FINAL_QUESTIONS[this.index];
    const opt = q.options.find((o) => o.id === optId)!;
    if (opt.correct) {
      Audio.correct();
      this.cameras.main.flash(220, 220, 190, 120);
      this.index++;
      if (this.index >= FINAL_QUESTIONS.length) {
        this.time.delayedCall(320, () => {
          stopGameplay(this);
          this.scene.start(SCENE.ending, { wrongCount: this.wrongCount });
        });
        return;
      }
      this.time.delayedCall(260, () => this.renderQuestion());
      return;
    }

    // Wrong: explain what is unsupported, then let them try again.
    this.wrongCount++;
    Audio.wrong();
    this.cameras.main.shake(240, 0.008);
    this.clearTransient();

    const box = panel(this, 40, 200, GAME_W - 80, 300, { fill: '#2a1130', border: '#c8453f' });
    this.transient.push(box);
    this.transient.push(label(this, 60, 218, 'THAT DOES NOT HOLD', 20, '#e5726c'));
    this.transient.push(label(this, 60, 252, `You said: "${opt.text}"`, 14, P.slate3, GAME_W - 140));
    this.transient.push(
      label(this, 60, 316, opt.rebuttal ?? 'The evidence does not support that.', 18, P.paper, GAME_W - 140),
    );
    this.transient.push(
      label(this, 60, 420, 'Nothing is lost. Look at it again.', 14, P.paperDim),
    );
    this.buttons.push(
      button(this, GAME_W - 320, 436, 240, 44, 'TRY AGAIN', () => this.renderQuestion(), {
        align: 'center',
        fill: P.amber1,
        hover: P.amber2,
      }),
    );
  }

  update(_t: number, delta: number): void {
    if (this.rain) {
      this.rain.tilePositionX += delta * 0.2;
      this.rain.tilePositionY += delta * 0.5;
    }
    GameState.playedMs += delta;
  }
}

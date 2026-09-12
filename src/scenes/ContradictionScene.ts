import Phaser from 'phaser';
import { GAME_H, GAME_W, SCENE } from '../core/config';
import { P, toInt } from '../core/palette';
import { label } from '../ui/kit';
import { Audio } from '../core/audio';
import { GameState } from '../core/state';
import { CONTRADICTIONS_BY_ID } from '../data/case';
import { EVIDENCE_BY_ID } from '../data/evidence';
import { CHARACTERS_BY_ID } from '../data/characters';
import { iconKey, portraitKey } from '../core/art';

/**
 * The dramatic beat: statement, shattering CONTRADICTION slam, evidence,
 * conclusion. Fully scripted, three seconds of theatre, then back to dialogue.
 */
export class ContradictionScene extends Phaser.Scene {
  private id!: string;

  constructor() {
    super({ key: SCENE.contradiction });
  }

  init(data: { id: string }): void {
    this.id = data.id;
  }

  create(): void {
    const c = CONTRADICTIONS_BY_ID[this.id];
    if (!c) {
      this.finish();
      return;
    }
    const ev = EVIDENCE_BY_ID[c.evidenceId];
    const who = CHARACTERS_BY_ID[c.characterId];

    this.add.rectangle(0, 0, GAME_W, GAME_H, toInt(P.night0), 0.94).setOrigin(0, 0);

    // Beat 1 — the claim, in their own words.
    const portrait = this.add.image(150, 250, portraitKey(who.id, 'defensive')).setScale(3).setAlpha(0);
    const quote = label(this, 300, 190, `"${c.quote}"`, 24, P.paperDim, 600);
    quote.setAlpha(0);
    const whoLabel = label(this, 300, 150, `${who.name.toUpperCase()} — ${who.role}`, 14, P.slate3);
    whoLabel.setAlpha(0);

    this.tweens.add({ targets: [portrait, quote, whoLabel], alpha: 1, duration: 380 });

    // Beat 2 — the slam.
    this.time.delayedCall(1300, () => {
      Audio.contradiction();
      this.cameras.main.shake(420, 0.014);
      this.cameras.main.flash(200, 200, 60, 50);

      // Cracks across the quote.
      const shards = this.add.graphics().setDepth(20);
      shards.lineStyle(3, toInt(P.red), 0.9);
      for (let i = 0; i < 14; i++) {
        const x = 280 + Math.random() * 620;
        const y = 150 + Math.random() * 120;
        shards.beginPath();
        shards.moveTo(x, y);
        shards.lineTo(x + (Math.random() - 0.5) * 200, y + (Math.random() - 0.5) * 160);
        shards.strokePath();
      }
      this.tweens.add({ targets: quote, alpha: 0.28, duration: 300 });
      this.tweens.add({ targets: shards, alpha: 0, duration: 1500, delay: 400 });

      const slam = label(this, GAME_W / 2, 250, 'CONTRADICTION', 42, P.redSoft);
      slam.setOrigin(0.5, 0.5).setScale(3).setAlpha(0).setDepth(30);
      slam.setShadow(0, 0, P.red, 18, true, true);
      this.tweens.add({ targets: slam, scale: 1, alpha: 1, duration: 260, ease: 'Back.easeIn' });
      this.tweens.add({ targets: slam, y: 130, scale: 0.62, duration: 500, delay: 620, ease: 'Cubic.easeInOut' });

      const strike = this.add.rectangle(300, 202, 0, 4, toInt(P.red)).setOrigin(0, 0.5).setDepth(31);
      this.tweens.add({ targets: strike, width: 600, duration: 420, delay: 300 });
    });

    // Beat 3 — the evidence.
    this.time.delayedCall(2400, () => {
      Audio.evidence();
      const card = this.add.container(GAME_W + 200, 300).setDepth(40);
      const g = this.add.graphics();
      g.fillStyle(toInt(P.ink), 0.95);
      g.fillRect(6, 6, 620, 120);
      g.fillStyle(toInt(P.slate0), 1);
      g.fillRect(0, 0, 620, 120);
      g.fillStyle(toInt(P.amber3), 1);
      g.fillRect(0, 0, 620, 3);
      g.fillRect(0, 0, 3, 120);
      const icon = this.add.image(44, 60, iconKey(ev.icon)).setScale(3);
      const t1 = label(this, 88, 16, ev.name.toUpperCase(), 18, P.amber4);
      const t2 = label(this, 88, 44, c.proof, 16, P.paper, 510);
      card.add([g, icon, t1, t2]);
      this.tweens.add({ targets: card, x: 170, duration: 420, ease: 'Cubic.easeOut' });
    });

    // Beat 4 — the conclusion.
    this.time.delayedCall(3500, () => {
      const conc = label(this, 170, 452, c.conclusion, 20, P.violet3, 620);
      conc.setAlpha(0);
      this.tweens.add({ targets: conc, alpha: 1, duration: 400 });
      const title = label(this, 170, 424, `▸ ${c.title.toUpperCase()}`, 13, P.slate3);
      title.setAlpha(0);
      this.tweens.add({ targets: title, alpha: 1, duration: 400 });

      const go = label(this, GAME_W - 300, GAME_H - 44, 'Space / click to continue', 14, P.slate3);
      this.tweens.add({ targets: go, alpha: 0.3, duration: 700, yoyo: true, repeat: -1 });

      const proceed = () => this.finish();
      this.input.keyboard?.once('keydown-SPACE', proceed);
      this.input.keyboard?.once('keydown-ENTER', proceed);
      this.input.keyboard?.once('keydown-E', proceed);
      this.input.once('pointerdown', proceed);
    });
  }

  private finish(): void {
    const c = CONTRADICTIONS_BY_ID[this.id];
    this.scene.stop();
    if (!c) {
      this.scene.resume(SCENE.train);
      this.game.events.emit('overlay-closed');
      return;
    }
    GameState.setFlag(`overturned_${c.statementId}`);
    const effects = {
      ...(c.effects ?? {}),
      flags: [...(c.effects?.flags ?? []), `${c.id}_done`],
    };
    this.scene.launch(SCENE.dialogue, { mode: 'lines', lines: c.aftermath, effects });
  }
}

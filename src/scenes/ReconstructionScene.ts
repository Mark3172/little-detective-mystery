import Phaser from 'phaser';
import { GAME_H, GAME_W, SCENE } from '../core/config';
import { P, toInt } from '../core/palette';
import { button, label, panel, type Button } from '../ui/kit';
import { GameState } from '../core/state';
import { Audio } from '../core/audio';
import { charTexture, frameFor } from '../core/art';
import { CHARACTERS } from '../data/characters';
import {
  CARRIAGE_ORDER,
  CONFLICT_RULES,
  MOMENTS,
  SOLUTION,
  TRAVEL_CONFLICT_MESSAGE,
} from '../data/case';
import { AREA_NAMES } from '../data/areas';
import { stopGameplay } from '../core/flow';
import type { AreaId, CharacterId, MomentId } from '../data/types';

interface Slot {
  charId: CharacterId;
  moment: MomentId;
  btn: Button;
}

const CAR_Y = 92;
const CAR_W = 210;
const CAR_H = 84;
const CAR_GAP = 18;
const CAR_X0 = 42;

const GRID_Y = 214;
const ROW_H = 50;
const NAME_W = 168;
const COL_W = 232;
const COL_X0 = CAR_X0 + NAME_W + 12;

export class ReconstructionScene extends Phaser.Scene {
  private slots: Slot[] = [];
  private active: { charId: CharacterId; moment: MomentId } | null = null;
  private silhouettes = new Map<CharacterId, Phaser.GameObjects.Sprite>();
  private carriageZones: Phaser.GameObjects.Rectangle[] = [];
  private statusText!: Phaser.GameObjects.Text;
  private playBtn!: Button;
  private busy = false;
  private feedback: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super({ key: SCENE.reconstruction });
  }

  create(): void {
    this.slots = [];
    this.silhouettes.clear();
    this.carriageZones = [];
    this.feedback = [];
    this.busy = false;
    this.active = null;

    Audio.reconEnter();
    this.cameras.main.setBackgroundColor(P.indigo0);
    this.add.rectangle(0, 0, GAME_W, GAME_H, toInt(P.indigo0), 1).setOrigin(0, 0);

    // Drifting violet haze.
    for (let i = 0; i < 3; i++) {
      const haze = this.add
        .image(GAME_W / 2, 160 + i * 120, 'lampglow')
        .setDisplaySize(GAME_W * 1.2, 340)
        .setTint(toInt(P.violet1))
        .setAlpha(0.14)
        .setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: haze, alpha: 0.05, duration: 3200 + i * 700, yoyo: true, repeat: -1 });
    }

    label(this, CAR_X0, 20, 'MIND RECONSTRUCTION', 24, P.violet3);
    const badge = label(this, CAR_X0, 50, ' THEORY — NOT A RECORDING ', 12, P.indigo0);
    badge.setBackgroundColor(P.violet2).setPadding(6, 3, 6, 3);
    label(this, CAR_X0 + 300, 24, 'Place each witness where your evidence puts them.', 14, P.violet2);
    label(this, CAR_X0 + 300, 44, 'Click a slot, then click a carriage. Nothing here is proof until it survives the replay.', 12, '#7d6fb0');

    this.buildCarriages();
    this.buildGrid();

    this.statusText = label(this, CAR_X0, GAME_H - 118, '', 15, P.violet3, GAME_W - 100);

    this.playBtn = button(this, CAR_X0, GAME_H - 62, 260, 40, 'PLAY THE THEORY', () => this.playTheory(), {
      align: 'center',
      fill: P.violet0,
      hover: P.violet1,
      color: P.violet3,
    });
    button(this, CAR_X0 + 276, GAME_H - 62, 170, 40, 'CLEAR', () => this.clearGrid(), {
      align: 'center',
      fill: P.indigo2,
      hover: P.violet0,
      color: P.violet3,
    });
    button(this, GAME_W - 210, GAME_H - 62, 168, 40, 'LEAVE THEORY', () => this.close(), {
      align: 'center',
      fill: P.indigo2,
      hover: P.violet0,
      color: P.violet3,
    });

    this.input.keyboard?.on('keydown-ESC', () => this.close());
    this.input.keyboard?.on('keydown-R', () => this.close());

    this.refreshStatus();

    if (GameState.has('recon_solved')) {
      this.time.delayedCall(80, () => this.succeed(true));
    }
  }

  /* ---------------------------------------------------------------- */

  private carriageX(area: AreaId): number {
    return CAR_X0 + CARRIAGE_ORDER.indexOf(area) * (CAR_W + CAR_GAP);
  }

  private buildCarriages(): void {
    CARRIAGE_ORDER.forEach((area, i) => {
      const x = CAR_X0 + i * (CAR_W + CAR_GAP);
      const g = this.add.graphics();
      g.fillStyle(toInt(P.indigo1), 1);
      g.fillRect(x, CAR_Y, CAR_W, CAR_H);
      g.fillStyle(toInt(P.violet0), 1);
      g.fillRect(x, CAR_Y, CAR_W, 2);
      g.fillRect(x, CAR_Y + CAR_H - 2, CAR_W, 2);
      g.fillStyle(toInt(P.indigo2), 1);
      for (let wx = x + 12; wx < x + CAR_W - 20; wx += 34) g.fillRect(wx, CAR_Y + 8, 22, 14);
      // Coupling.
      if (i < CARRIAGE_ORDER.length - 1) {
        g.fillStyle(toInt(P.violet0), 0.7);
        g.fillRect(x + CAR_W, CAR_Y + CAR_H / 2 - 2, CAR_GAP, 4);
      }
      label(this, x + 10, CAR_Y + CAR_H - 20, AREA_NAMES[area].replace(' Carriage', '').toUpperCase(), 12, P.violet2);

      const zone = this.add.rectangle(x, CAR_Y, CAR_W, CAR_H).setOrigin(0, 0).setInteractive({ useHandCursor: true });
      zone.setFillStyle(toInt(P.violet1), 0.001);
      zone.on('pointerover', () => zone.setFillStyle(toInt(P.violet1), 0.16));
      zone.on('pointerout', () => zone.setFillStyle(toInt(P.violet1), 0.001));
      zone.on('pointerdown', () => this.assignActive(area));
      this.carriageZones.push(zone);
    });
  }

  private buildGrid(): void {
    // Column headers.
    MOMENTS.forEach((m, j) => {
      const x = COL_X0 + j * COL_W;
      label(this, x, GRID_Y - 34, m.label.toUpperCase(), 13, P.violet3);
      label(this, x, GRID_Y - 18, m.clock, 12, '#7d6fb0');
    });

    CHARACTERS.forEach((c, i) => {
      const y = GRID_Y + i * ROW_H;
      const sil = this.add
        .sprite(CAR_X0 + 16, y + 40, charTexture(c.id), frameFor(0, 0))
        .setOrigin(0.5, 1)
        .setScale(1.4)
        .setTint(toInt(P.violet2))
        .setAlpha(0.75);
      this.silhouettes.set(c.id, sil);
      label(this, CAR_X0 + 34, y + 12, c.name.split(' ')[0].toUpperCase(), 14, P.violet3);

      MOMENTS.forEach((m, j) => {
        const x = COL_X0 + j * COL_W;
        const current = GameState.getRecon(c.id, m.id);
        const b = button(
          this,
          x,
          y,
          COL_W - 16,
          38,
          current ? AREA_NAMES[current] : '— select —',
          () => this.selectSlot(c.id, m.id),
          {
            size: 14,
            align: 'center',
            fill: current ? P.violet0 : P.indigo1,
            hover: P.violet1,
            color: current ? P.violet3 : '#7d6fb0',
          },
        );
        this.slots.push({ charId: c.id, moment: m.id, btn: b });
      });
    });
  }

  private redrawSlot(charId: CharacterId, moment: MomentId): void {
    const slot = this.slots.find((s) => s.charId === charId && s.moment === moment);
    if (!slot) return;
    const v = GameState.getRecon(charId, moment);
    slot.btn.setLabel(v ? AREA_NAMES[v] : '— select —');
  }

  private selectSlot(charId: CharacterId, moment: MomentId): void {
    if (this.busy) return;
    this.active = { charId, moment };
    const c = CHARACTERS.find((x) => x.id === charId)!;
    const m = MOMENTS.find((x) => x.id === moment)!;
    this.statusText.setColor(P.violet3);
    this.statusText.setText(`Where was ${c.name} ${m.label.toLowerCase()} (${m.clock})?  Click a carriage above.`);
    this.slots.forEach((s) => {
      const on = s.charId === charId && s.moment === moment;
      s.btn.container.setAlpha(on ? 1 : 0.75);
    });
    this.carriageZones.forEach((z) => this.tweens.add({ targets: z, fillAlpha: 0.1, duration: 200, yoyo: true, repeat: 2 }));
  }

  private assignActive(area: AreaId): void {
    if (this.busy || !this.active) {
      if (!this.active) {
        this.statusText.setColor('#7d6fb0');
        this.statusText.setText('Choose a slot below first, then pick the carriage.');
      }
      return;
    }
    Audio.select();
    GameState.setRecon(this.active.charId, this.active.moment, area);
    this.redrawSlot(this.active.charId, this.active.moment);
    this.active = null;
    this.slots.forEach((s) => s.btn.container.setAlpha(1));
    GameState.save();
    this.refreshStatus();
  }

  private clearGrid(): void {
    GameState.recon = {};
    this.slots.forEach((s) => s.btn.setLabel('— select —'));
    this.clearFeedback();
    this.refreshStatus();
  }

  /* ---------------------------------------------------------------- */

  private missingPrereqs(): string[] {
    const gaps: string[] = [];
    if (!GameState.has('ilse_told_truth'))
      gaps.push('I still do not know what Ilse was really doing behind her counter.');
    if (!GameState.hasEvidence('receipt'))
      gaps.push('Nothing places Mr. Kass anywhere specific before the tunnel.');
    if (!GameState.hasEvidence('ticket_nadia') || !GameState.hasEvidence('ticket_ren'))
      gaps.push('I have no paper trail connecting anyone to Compartment 4.');
    if (!GameState.has('know_nadia_seen'))
      gaps.push('Nobody has confirmed where Nadia was once the lights came back.');
    return gaps;
  }

  private filled(): boolean {
    return CHARACTERS.every((c) => MOMENTS.every((m) => !!GameState.getRecon(c.id, m.id)));
  }

  private refreshStatus(): void {
    const gaps = this.missingPrereqs();
    if (gaps.length > 0) {
      this.playBtn.setDisabled(true);
      this.statusText.setColor('#c58ba0');
      this.statusText.setText(`GAPS IN THE RECORD — ${gaps[0]}`);
      return;
    }
    if (!this.filled()) {
      this.playBtn.setDisabled(true);
      this.statusText.setColor('#7d6fb0');
      this.statusText.setText('Twelve slots. Fill them all, then play the theory.');
      return;
    }
    this.playBtn.setDisabled(false);
    this.statusText.setColor(P.violet3);
    this.statusText.setText('The night is assembled. Play it and see whether it survives the evidence.');
  }

  /* ---------------------------------------------------------------- */

  private clearFeedback(): void {
    this.feedback.forEach((o) => o.destroy());
    this.feedback = [];
  }

  private async playTheory(): Promise<void> {
    if (this.busy) return;
    this.busy = true;
    this.clearFeedback();
    this.active = null;

    for (let i = 0; i < MOMENTS.length; i++) {
      const m = MOMENTS[i];
      const caption = label(this, GAME_W / 2, CAR_Y - 44, `${m.label.toUpperCase()}  ·  ${m.clock}`, 20, P.violet3);
      caption.setOrigin(0.5, 0.5).setAlpha(0);
      this.tweens.add({ targets: caption, alpha: 1, duration: 220 });
      this.feedback.push(caption);

      // Darken the whole diagram for the blackout beat.
      if (m.id === 'blackout') {
        const dark = this.add.rectangle(CAR_X0 - 6, CAR_Y - 6, GAME_W - 70, CAR_H + 12, toInt(P.indigo0), 0).setOrigin(0, 0);
        this.feedback.push(dark);
        this.tweens.add({ targets: dark, fillAlpha: 0.62, duration: 300, yoyo: true, hold: 900 });
      }

      CHARACTERS.forEach((c, idx) => {
        const area = GameState.getRecon(c.id, m.id)!;
        const sil = this.silhouettes.get(c.id)!;
        const tx = this.carriageX(area) + 34 + (idx % 4) * 42;
        this.tweens.add({
          targets: sil,
          x: tx,
          y: CAR_Y + CAR_H - 10,
          scale: 1.5,
          duration: 620,
          ease: 'Sine.easeInOut',
        });
      });

      Audio.blip();
      await this.wait(1150);
      this.tweens.add({ targets: caption, alpha: 0, duration: 200 });
    }

    await this.wait(320);
    this.evaluate();
    this.busy = false;
  }

  private wait(ms: number): Promise<void> {
    return new Promise((res) => this.time.delayedCall(ms, () => res()));
  }

  /* ---------------------------------------------------------------- */

  private conflicts(): string[] {
    const out: string[] = [];
    for (const rule of CONFLICT_RULES) {
      if (rule.requiresEvidence && !rule.requiresEvidence.every((e) => GameState.hasEvidence(e))) continue;
      if (rule.requiresFlags && !GameState.hasAll(rule.requiresFlags)) continue;
      const placed = GameState.getRecon(rule.when.characterId, rule.when.moment);
      if (!placed) continue;
      const hit =
        (rule.when.area && placed === rule.when.area) || (rule.when.notArea && placed !== rule.when.notArea);
      if (hit) {
        const who = CHARACTERS.find((c) => c.id === rule.when.characterId)!.name;
        out.push(`${who}: ${rule.message}`);
      }
    }

    // Travel time across the blackout.
    if (GameState.hasEvidence('neutral_section')) {
      for (const c of CHARACTERS) {
        const before = GameState.getRecon(c.id, 'before');
        const black = GameState.getRecon(c.id, 'blackout');
        const after = GameState.getRecon(c.id, 'after');
        const gap = (a?: AreaId, b?: AreaId) =>
          a && b ? Math.abs(CARRIAGE_ORDER.indexOf(a) - CARRIAGE_ORDER.indexOf(b)) : 0;
        if (gap(before, black) >= 3 || gap(black, after) >= 3) {
          out.push(`${c.name}: ${TRAVEL_CONFLICT_MESSAGE}`);
        }
      }
    }

    if (GameState.hasEvidence('corridor')) {
      const crowded = CHARACTERS.filter((c) => GameState.getRecon(c.id, 'blackout') === 'sleeper');
      if (crowded.length >= 2) {
        out.push('Only one small pair of prints crossed that wet corridor. Two people cannot both have been in the sleeper during the blackout.');
      }
    }
    return [...new Set(out)];
  }

  private matchesSolution(): boolean {
    return CHARACTERS.every((c) =>
      MOMENTS.every((m) => GameState.getRecon(c.id, m.id) === SOLUTION[c.id][m.id]),
    );
  }

  private evaluate(): void {
    const conflicts = this.conflicts();
    if (conflicts.length === 0 && this.matchesSolution()) {
      this.succeed();
      return;
    }

    Audio.wrong();
    this.cameras.main.shake(200, 0.006);

    const list = conflicts.length > 0 ? conflicts.slice(0, 4) : this.softFeedback();
    const h = 60 + list.length * 30;
    const g = panel(this, CAR_X0, GAME_H - 132 - h, GAME_W - 84, h, {
      fill: '#2a1130',
      border: '#c8453f',
    });
    this.feedback.push(g);
    this.feedback.push(
      label(this, CAR_X0 + 16, GAME_H - 122 - h, conflicts.length > 0 ? 'THE THEORY BREAKS' : 'THE THEORY HOLDS TOGETHER — BUT IT IS NOT THE NIGHT', 15, '#e5726c'),
    );
    list.forEach((msg, i) => {
      this.feedback.push(label(this, CAR_X0 + 16, GAME_H - 96 - h + i * 30, `✕ ${msg}`, 14, P.paper, GAME_W - 130));
    });
    this.statusText.setColor('#c58ba0');
    this.statusText.setText('Adjust the slots and play it again. Nothing is lost by being wrong.');
  }

  /**
   * When no gated rule fires but the grid is still not the truth, say so
   * without naming the answer — and only about people the player can place.
   */
  private softFeedback(): string[] {
    const out: string[] = [];
    for (const c of CHARACTERS) {
      for (const m of MOMENTS) {
        if (GameState.getRecon(c.id, m.id) !== SOLUTION[c.id][m.id]) {
          out.push(`${c.name} ${m.label.toLowerCase()}: this does not fit the rest of what I know.`);
          break;
        }
      }
    }
    return out.slice(0, 4);
  }

  private succeed(already = false): void {
    this.clearFeedback();
    if (!already) {
      Audio.correct();
      this.cameras.main.flash(400, 120, 90, 220);
    }
    GameState.setFlag('recon_solved');
    GameState.setObjective('Name the passenger who never arrived.');
    GameState.save();

    const g = panel(this, CAR_X0, GAME_H - 220, GAME_W - 84, 150, {
      fill: P.indigo2,
      border: P.violet2,
    });
    this.feedback.push(g);
    this.feedback.push(label(this, CAR_X0 + 20, GAME_H - 204, 'THE NIGHT HOLDS', 20, P.violet3));
    this.feedback.push(
      label(
        this,
        CAR_X0 + 20,
        GAME_H - 172,
        'Every witness sits exactly where the evidence puts them — and one of them is in two places at once, if you believe her ticket.',
        16,
        P.paper,
        GAME_W - 140,
      ),
    );
    const go = button(this, GAME_W - 320, GAME_H - 116, 258, 40, 'NAME THE PASSENGER ▸', () => {
      Audio.reconLeave();
      stopGameplay(this);
      this.scene.start(SCENE.accusation);
    }, { align: 'center', fill: P.violet0, hover: P.violet1, color: P.violet3 });
    this.feedback.push(go.container);
    this.statusText.setText('');
  }

  private close(): void {
    if (this.busy) return;
    Audio.back();
    Audio.reconLeave();
    GameState.save();
    this.scene.stop();
    this.scene.resume(SCENE.train);
    this.game.events.emit('overlay-closed');
  }
}

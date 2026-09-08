import Phaser from 'phaser';
import { GAME_H, GAME_W, SCENE } from '../core/config';
import { P, toInt } from '../core/palette';
import { label } from '../ui/kit';
import { GameState } from '../core/state';
import { Audio } from '../core/audio';
import { EVIDENCE_BY_ID } from '../data/evidence';
import { iconKey, charTexture, frameFor } from '../core/art';
import type { Stop } from '../data/story';
import type { Area } from '../data/areas';

/**
 * Minimal diegetic HUD: a promptline, a small stop indicator, drop-in toasts,
 * and touch controls. Deliberately not a dashboard.
 */
export class HudScene extends Phaser.Scene {
  private root!: Phaser.GameObjects.Container;
  private promptText!: Phaser.GameObjects.Text;
  private promptKey!: Phaser.GameObjects.Text;
  private promptKeyBg!: Phaser.GameObjects.Rectangle;
  private stopText!: Phaser.GameObjects.Text;
  private areaText!: Phaser.GameObjects.Text;
  private objectiveText!: Phaser.GameObjects.Text;
  private toastQueue: { title: string; body: string; icon: string }[] = [];
  private toastBusy = false;
  private touchRoot?: Phaser.GameObjects.Container;
  private stickBase?: Phaser.GameObjects.Arc;
  private stickKnob?: Phaser.GameObjects.Arc;
  private stickId: number | null = null;
  private notebookDot!: Phaser.GameObjects.Rectangle;
  private reconCue!: Phaser.GameObjects.Text;
  private crossingRoot?: Phaser.GameObjects.Container;

  constructor() {
    super({ key: SCENE.hud, active: false });
  }

  create(): void {
    this.root = this.add.container(0, 0);

    // Vignette + film grain sell the "inside a dark carriage" feel.
    const vig = this.add.image(GAME_W / 2, GAME_H / 2, 'vignette').setDisplaySize(GAME_W, GAME_H);
    vig.setAlpha(0.9);
    const grain = this.add.tileSprite(0, 0, GAME_W, GAME_H, 'grain').setOrigin(0, 0).setAlpha(0.055);
    this.tweens.add({
      targets: grain,
      tilePositionX: 128,
      tilePositionY: 128,
      duration: 900,
      repeat: -1,
    });
    this.root.add([vig, grain]);

    // Top-left: carriage name, current stop.
    this.areaText = label(this, 20, 16, '', 15, P.amber4);
    this.stopText = label(this, 20, 36, '', 12, P.slate3);
    this.objectiveText = label(this, 20, GAME_H - 30, '', 12, P.paperDim, GAME_W - 300);
    this.root.add([this.areaText, this.stopText, this.objectiveText]);

    // Bottom-centre interaction prompt. Rectangle + text, not Text.backgroundColor
    // (that canvas fill can ghost when the prompt toggles).
    this.promptKeyBg = this.add.rectangle(0, GAME_H - 84, 22, 22, toInt(P.amber4));
    this.promptKey = label(this, 0, GAME_H - 92, 'E', 15, P.ink);
    this.promptKey.setOrigin(0.5, 0);
    this.promptText = label(this, 0, GAME_H - 90, '', 16, P.paper);
    this.promptKeyBg.setInteractive({ useHandCursor: true });
    this.promptKey.setInteractive({ useHandCursor: true });
    this.promptText.setInteractive({ useHandCursor: true });
    const emitInteract = () => this.game.events.emit('hud-interact');
    this.promptKeyBg.on('pointerdown', emitInteract);
    this.promptKey.on('pointerdown', emitInteract);
    this.promptText.on('pointerdown', emitInteract);
    this.root.add([this.promptKeyBg, this.promptKey, this.promptText]);
    this.setPrompt(null);

    // Notebook cue — clickable so mouse / tap users do not need the key.
    const nb = label(this, GAME_W - 132, 18, '[J] NOTEBOOK', 12, P.slate3);
    nb.setInteractive({ useHandCursor: true });
    nb.on('pointerdown', () => this.game.events.emit('hud-notebook'));
    this.notebookDot = this.add.rectangle(GAME_W - 22, 22, 8, 8, toInt(P.red)).setVisible(false);
    this.reconCue = label(this, GAME_W - 168, 38, '[R] RECONSTRUCT', 12, P.violet2);
    this.reconCue.setInteractive({ useHandCursor: true });
    this.reconCue.on('pointerdown', () => this.game.events.emit('hud-recon'));
    this.root.add([nb, this.notebookDot, this.reconCue]);
    this.tweens.add({ targets: this.notebookDot, alpha: 0.25, duration: 500, yoyo: true, repeat: -1 });

    this.refresh();

    const g = this.game.events;
    g.on('prompt', this.setPrompt, this);
    g.on('area-changed', this.onArea, this);
    g.on('overlay-open', this.hide, this);
    g.on('overlay-closed', this.show, this);
    g.on('crossing', this.onCrossing, this);
    g.on('crossing-done', this.onCrossingDone, this);
    GameState.events.on('evidence', this.onEvidence, this);
    GameState.events.on('statement', this.onStatement, this);
    GameState.events.on('station', this.onStation, this);
    GameState.events.on('objective', this.refresh, this);
    GameState.events.on('flag', this.refresh, this);

    this.events.once('shutdown', () => {
      g.off('prompt', this.setPrompt, this);
      g.off('area-changed', this.onArea, this);
      g.off('overlay-open', this.hide, this);
      g.off('overlay-closed', this.show, this);
      g.off('crossing', this.onCrossing, this);
      g.off('crossing-done', this.onCrossingDone, this);
      GameState.events.off('evidence', this.onEvidence, this);
      GameState.events.off('statement', this.onStatement, this);
      GameState.events.off('station', this.onStation, this);
      GameState.events.off('objective', this.refresh, this);
      GameState.events.off('flag', this.refresh, this);
    });

    this.buildTouchControls();
  }

  /* ---------------------------------------------------------------- */

  private hide(): void {
    this.root.setVisible(false);
    this.touchRoot?.setVisible(false);
  }

  private show(): void {
    this.root.setVisible(true);
    if (GameState.settings.touch) this.touchRoot?.setVisible(true);
    this.refresh();
  }

  private refresh(): void {
    const stop = GameState.currentStop();
    this.stopText.setText(`STOP ${stop.index} OF 6  ·  ${stop.name.toUpperCase()}`);
    this.objectiveText.setText(`▸ ${GameState.objective}`);
    this.notebookDot.setVisible(GameState.unread.size > 0);
    this.reconCue?.setVisible(GameState.has('ready_for_reconstruction'));
  }

  private onArea(area: Area): void {
    this.areaText.setText(area.name.toUpperCase());
    this.refresh();
    this.flashCaption(area.name, area.subtitle);
  }

  private onCrossing(info: { from: string; to: string; side: 'left' | 'right' }): void {
    this.crossingRoot?.destroy(true);
    const c = this.add.container(0, 0).setAlpha(0).setDepth(2000);
    const dim = this.add.rectangle(0, 0, GAME_W, GAME_H, toInt(P.night0), 1).setOrigin(0, 0);
    const rain = this.add.tileSprite(0, 0, GAME_W, GAME_H, 'rain').setOrigin(0, 0).setAlpha(0.7);
    const leftCar = this.add.rectangle(0, 0, 210, GAME_H, toInt(P.night1)).setOrigin(0, 0);
    const rightCar = this.add.rectangle(GAME_W, 0, 210, GAME_H, toInt(P.night1)).setOrigin(1, 0);
    const gap = this.add.rectangle(GAME_W / 2, GAME_H / 2 + 40, 140, 8, toInt(P.slate0)).setOrigin(0.5);
    const rail = this.add.rectangle(GAME_W / 2, GAME_H / 2 + 52, 220, 2, toInt(P.amber1), 0.45).setOrigin(0.5);
    const lamp = this.add.rectangle(GAME_W / 2, 88, 10, 16, toInt(P.amber4));
    const glow = this.add.image(GAME_W / 2, 130, 'lampglow').setScale(1.6).setAlpha(0.45);
    const title = label(this, 0, 168, 'BETWEEN CARRIAGES', 26, P.amber4);
    title.setX(GAME_W / 2 - title.width / 2);
    const sub = label(this, 0, 208, `Walking through to ${info.to}`, 16, P.paperDim);
    sub.setX(GAME_W / 2 - sub.width / 2);
    const from = label(this, 28, GAME_H / 2 - 10, info.from.toUpperCase(), 12, P.slate3);
    const to = label(this, GAME_W - 28, GAME_H / 2 - 10, info.to.toUpperCase(), 12, P.slate3);
    to.setOrigin(1, 0);

    const walkRight = info.side === 'right';
    const ori = this.add.sprite(walkRight ? 230 : GAME_W - 230, GAME_H / 2 + 36, charTexture('ori'), frameFor(walkRight ? 2 : 1, 0));
    ori.setOrigin(0.5, 1).setScale(3);
    const walkKey = walkRight ? 'ori_walk_right' : 'ori_walk_left';
    if (this.anims.exists(walkKey)) ori.play(walkKey);

    c.add([dim, rain, glow, leftCar, rightCar, gap, rail, lamp, title, sub, from, to, ori]);
    this.crossingRoot = c;

    this.tweens.add({ targets: c, alpha: 1, duration: 280 });
    this.tweens.add({
      targets: rain,
      tilePositionX: 90,
      tilePositionY: 140,
      duration: 2800,
      repeat: -1,
    });
    this.tweens.add({ targets: [lamp, glow], y: '+=8', duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.tweens.add({
      targets: ori,
      x: walkRight ? GAME_W - 230 : 230,
      duration: 2600,
      ease: 'Sine.easeInOut',
    });
  }

  private onCrossingDone(): void {
    const c = this.crossingRoot;
    if (!c) return;
    this.tweens.add({
      targets: c,
      alpha: 0,
      duration: 420,
      onComplete: () => {
        c.destroy(true);
        if (this.crossingRoot === c) this.crossingRoot = undefined;
      },
    });
  }

  private setPrompt(text: string | null): void {
    const visible = !!text;
    this.promptKey.setVisible(visible);
    this.promptKeyBg.setVisible(visible);
    this.promptText.setVisible(visible);
    if (!text) return;
    this.promptText.setText(text);
    const total = 22 + 10 + this.promptText.width;
    const x0 = GAME_W / 2 - total / 2;
    this.promptKeyBg.setPosition(x0 + 11, GAME_H - 84);
    this.promptKey.setPosition(x0 + 11, GAME_H - 92);
    this.promptText.setX(x0 + 22 + 10);
  }

  /* ---------------------------------------------------------------- */

  private onEvidence(id: string): void {
    const e = EVIDENCE_BY_ID[id];
    if (!e) return;
    Audio.evidence();
    this.toastQueue.push({ title: 'EVIDENCE FILED', body: e.name, icon: iconKey(e.icon) });
    this.pumpToasts();
    this.refresh();
  }

  private onStatement(): void {
    this.toastQueue.push({ title: 'STATEMENT RECORDED', body: 'Notebook updated', icon: iconKey('notice') });
    this.pumpToasts();
  }

  private pumpToasts(): void {
    if (this.toastBusy) return;
    const next = this.toastQueue.shift();
    if (!next) return;
    this.toastBusy = true;

    const w = 330;
    const x = GAME_W - w - 20;
    const c = this.add.container(x + 40, 74).setAlpha(0);
    const g = this.add.graphics();
    g.fillStyle(toInt(P.ink), 0.9);
    g.fillRect(3, 3, w, 54);
    g.fillStyle(toInt(P.slate0), 1);
    g.fillRect(0, 0, w, 54);
    g.fillStyle(toInt(P.amber3), 1);
    g.fillRect(0, 0, w, 2);
    g.fillRect(0, 0, 3, 54);
    const icon = this.add.image(30, 27, next.icon).setScale(2);
    const t1 = label(this, 56, 10, next.title, 11, P.amber3);
    const t2 = label(this, 56, 26, next.body, 15, P.paper, w - 70);
    c.add([g, icon, t1, t2]);

    this.tweens.add({
      targets: c,
      x,
      alpha: 1,
      duration: 260,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(1900, () => {
          this.tweens.add({
            targets: c,
            alpha: 0,
            x: x + 30,
            duration: 240,
            onComplete: () => {
              c.destroy(true);
              this.toastBusy = false;
              this.pumpToasts();
            },
          });
        });
      },
    });
  }

  private onStation(stop: Stop): void {
    Audio.chime();
    this.flashCaption(`APPROACHING ${stop.name.toUpperCase()}`, stop.announcement, 3400);
    this.refresh();
  }

  private flashCaption(title: string, sub: string, hold = 2100): void {
    const c = this.add.container(GAME_W / 2, 118).setAlpha(0);
    const t1 = label(this, 0, 0, title.toUpperCase(), 26, P.amber4);
    t1.setOrigin(0.5, 0.5);
    const t2 = label(this, 0, 30, sub, 14, P.paperDim);
    t2.setOrigin(0.5, 0.5);
    const bar = this.add.rectangle(0, -22, Math.max(t1.width, t2.width) + 60, 2, toInt(P.amber2), 0.8);
    const bar2 = this.add.rectangle(0, 48, Math.max(t1.width, t2.width) + 60, 2, toInt(P.amber2), 0.8);
    c.add([bar, bar2, t1, t2]);
    this.tweens.add({
      targets: c,
      alpha: 1,
      y: 110,
      duration: 340,
      onComplete: () =>
        this.time.delayedCall(hold, () =>
          this.tweens.add({ targets: c, alpha: 0, y: 96, duration: 340, onComplete: () => c.destroy(true) }),
        ),
    });
  }

  /* ---------------------------------------------------------------- */
  /* Touch controls                                                    */
  /* ---------------------------------------------------------------- */

  private buildTouchControls(): void {
    const enabled = GameState.settings.touch || 'ontouchstart' in window;
    this.touchRoot = this.add.container(0, 0).setVisible(enabled);
    if (!enabled) return;
    GameState.settings.touch = true;

    const baseX = 120;
    const baseY = GAME_H - 120;
    this.stickBase = this.add.circle(baseX, baseY, 62, toInt(P.slate0), 0.35).setStrokeStyle(2, toInt(P.slate2), 0.6);
    this.stickKnob = this.add.circle(baseX, baseY, 26, toInt(P.amber2), 0.55);
    this.touchRoot.add([this.stickBase, this.stickKnob]);

    const stickZone = this.add.zone(0, GAME_H - 260, GAME_W / 2, 260).setOrigin(0, 0).setInteractive();
    this.touchRoot.add(stickZone);
    stickZone.on('pointerdown', (p: Phaser.Input.Pointer) => {
      this.stickId = p.id;
      this.stickBase!.setPosition(p.x, p.y);
      this.stickKnob!.setPosition(p.x, p.y);
    });
    stickZone.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (this.stickId !== p.id || !p.isDown) return;
      const dx = p.x - this.stickBase!.x;
      const dy = p.y - this.stickBase!.y;
      const d = Math.min(Math.hypot(dx, dy), 62);
      const a = Math.atan2(dy, dx);
      this.stickKnob!.setPosition(this.stickBase!.x + Math.cos(a) * d, this.stickBase!.y + Math.sin(a) * d);
      const mag = d / 62;
      this.game.events.emit('hud-move', { x: Math.cos(a) * mag, y: Math.sin(a) * mag });
    });
    const release = (p: Phaser.Input.Pointer) => {
      if (this.stickId !== p.id) return;
      this.stickId = null;
      this.stickBase!.setPosition(baseX, baseY);
      this.stickKnob!.setPosition(baseX, baseY);
      this.game.events.emit('hud-move', { x: 0, y: 0 });
    };
    stickZone.on('pointerup', release);
    stickZone.on('pointerupoutside', release);
    stickZone.on('pointerout', release);

    const mkBtn = (x: number, y: number, r: number, text: string, ev: string, color: string) => {
      const circle = this.add.circle(x, y, r, toInt(color), 0.5).setStrokeStyle(2, toInt(P.paper), 0.5);
      const t = label(this, x, y, text, r > 40 ? 20 : 14, P.paper);
      t.setOrigin(0.5, 0.5);
      circle.setInteractive({ useHandCursor: true });
      circle.on('pointerdown', () => {
        circle.setAlpha(0.9);
        Audio.unlock();
        this.game.events.emit(ev);
      });
      circle.on('pointerup', () => circle.setAlpha(1));
      this.touchRoot!.add([circle, t]);
    };

    mkBtn(GAME_W - 110, GAME_H - 110, 48, 'E', 'hud-interact', P.amber2);
    mkBtn(GAME_W - 210, GAME_H - 76, 32, 'J', 'hud-notebook', P.slate1);
    mkBtn(GAME_W - 178, GAME_H - 180, 32, 'R', 'hud-recon', P.violet0);
    mkBtn(GAME_W - 40, GAME_H - 210, 28, 'II', 'hud-pause', P.slate1);
  }
}

import Phaser from 'phaser';
import { GAME_H, GAME_W, SCENE } from '../core/config';
import { P } from '../core/palette';
import { button, label, panel, scrim } from '../ui/kit';
import { Audio } from '../core/audio';
import { stopGameplay } from '../core/flow';
import { GameState } from '../core/state';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE.pause });
  }

  create(): void {
    scrim(this, GAME_W, GAME_H, 0.82);
    const w = 460;
    const h = 400;
    const x = GAME_W / 2 - w / 2;
    const y = GAME_H / 2 - h / 2;
    panel(this, x, y, w, h, { fill: P.slate0, border: P.amber2 });

    const t = label(this, x + 28, y + 24, 'THE TRAIN WAITS', 24, P.amber4);
    this.add.existing(t);
    label(this, x + 28, y + 56, `Stop ${GameState.currentStop().index} of 6 — ${GameState.currentStop().name}`, 13, P.slate3);

    let by = y + 92;
    const bw = w - 56;

    button(this, x + 28, by, bw, 44, 'RESUME', () => this.close(), { align: 'center', fill: P.amber1, hover: P.amber2 });
    by += 54;

    const mute = button(this, x + 28, by, bw, 40, Audio.muted ? 'SOUND: OFF' : 'SOUND: ON', () => {
      Audio.setMuted(!Audio.muted);
      mute.setLabel(Audio.muted ? 'SOUND: OFF' : 'SOUND: ON');
    }, { align: 'center', size: 15 });
    by += 50;

    const touch = button(
      this,
      x + 28,
      by,
      bw,
      40,
      GameState.settings.touch ? 'TOUCH CONTROLS: ON' : 'TOUCH CONTROLS: OFF',
      () => {
        GameState.settings.touch = !GameState.settings.touch;
        GameState.saveSettings();
        touch.setLabel(GameState.settings.touch ? 'TOUCH CONTROLS: ON' : 'TOUCH CONTROLS: OFF');
        this.scene.stop(SCENE.hud);
        this.scene.launch(SCENE.hud);
        this.game.events.emit('overlay-open');
      },
      { align: 'center', size: 15 },
    );
    by += 50;

    button(this, x + 28, by, bw, 40, 'SAVE AND QUIT TO TITLE', () => {
      GameState.save();
      stopGameplay(this, SCENE.title);
      this.scene.start(SCENE.title);
    }, { align: 'center', size: 15 });
    by += 50;

    button(this, x + 28, by, bw, 40, 'RESTART CASE (ERASES SAVE)', () => this.confirmRestart(), {
      align: 'center',
      size: 15,
      fill: '#5c2f3f',
      hover: '#7d4054',
    });

    label(
      this,
      x + 28,
      y + h - 44,
      'WASD move · E interact · J notebook · R reconstruct · M mute · Esc back',
      12,
      P.slate2,
      bw,
    );

    this.input.keyboard?.on('keydown-ESC', () => this.close());
  }

  private confirmRestart(): void {
    const w = 420;
    const x = GAME_W / 2 - w / 2;
    panel(this, x, 180, w, 180, { fill: '#2a1130', border: '#c8453f' }).setDepth(60);
    const t = label(this, x + 22, 200, 'Erase this case and start over?', 18, P.paper, w - 44);
    t.setDepth(61);
    const yes = button(this, x + 22, 280, 180, 44, 'ERASE', () => {
      GameState.reset();
      GameState.clearSave();
      stopGameplay(this);
      this.scene.start(SCENE.train, { prologue: true });
    }, { align: 'center', fill: '#5c2f3f', hover: '#7d4054' });
    const no = button(this, x + 218, 280, 180, 44, 'KEEP PLAYING', () => this.scene.restart(), {
      align: 'center',
    });
    yes.container.setDepth(61);
    no.container.setDepth(61);
  }

  private close(): void {
    Audio.back();
    GameState.save();
    this.scene.stop();
    this.scene.resume(SCENE.train);
    this.game.events.emit('overlay-closed');
  }
}

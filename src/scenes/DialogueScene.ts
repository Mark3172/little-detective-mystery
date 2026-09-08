import Phaser from 'phaser';
import { GAME_H, GAME_W, SCENE } from '../core/config';
import { P, toInt } from '../core/palette';
import { button, label, panel, scrim, typewriter, type Button } from '../ui/kit';
import { GameState } from '../core/state';
import { Audio } from '../core/audio';
import { portraitKey, iconKey } from '../core/art';
import { CHARACTERS_BY_ID } from '../data/characters';
import { EVIDENCE_BY_ID } from '../data/evidence';
import type { Character, Effects, Emotion, Line, Topic } from '../data/types';

interface DialoguePayload {
  mode: 'lines' | 'interview';
  lines?: Line[];
  effects?: Effects;
  charId?: string;
  /** Shown after returning from a contradiction. */
  resumeMenu?: boolean;
}

const BOX_X = 24;
const BOX_Y = 348;
const BOX_W = GAME_W - 48;
const BOX_H = 172;
const TEXT_X = BOX_X + 190;
const TEXT_W = BOX_W - 230;

export class DialogueScene extends Phaser.Scene {
  private payload!: DialoguePayload;
  private character?: Character;
  private portrait!: Phaser.GameObjects.Image;
  private namePlate!: Phaser.GameObjects.Text;
  private bodyText!: Phaser.GameObjects.Text;
  private nextArrow!: Phaser.GameObjects.Text;
  private typer?: ReturnType<typeof typewriter>;
  private queue: Line[] = [];
  private pendingEffects?: Effects;
  private buttons: Button[] = [];
  private menuMode: 'none' | 'topics' | 'present' = 'none';
  private page = 0;
  private pendingContradiction?: string;
  private hintLine!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: SCENE.dialogue });
  }

  init(data: DialoguePayload): void {
    this.payload = data;
    this.character = data.charId ? CHARACTERS_BY_ID[data.charId] : undefined;
    this.queue = [];
    this.buttons = [];
    this.menuMode = 'none';
    this.page = 0;
    this.pendingContradiction = undefined;
    this.pendingEffects = undefined;
  }

  create(): void {
    scrim(this, GAME_W, GAME_H, 0.55);
    panel(this, BOX_X, BOX_Y, BOX_W, BOX_H, { fill: P.slate0, border: P.amber2 });

    // Portrait frame.
    const pf = this.add.graphics();
    pf.fillStyle(toInt(P.ink), 1);
    pf.fillRect(BOX_X + 16, BOX_Y - 42, 152, 152);
    pf.fillStyle(toInt(P.slate1), 1);
    pf.fillRect(BOX_X + 20, BOX_Y - 38, 144, 144);

    this.portrait = this.add.image(BOX_X + 92, BOX_Y + 34, portraitKey('ori', 'neutral'));
    this.portrait.setScale(2.25);

    this.namePlate = label(this, BOX_X + 190, BOX_Y - 26, '', 17, P.amber4);
    this.bodyText = label(this, TEXT_X, BOX_Y + 22, '', 19, P.paper, TEXT_W);
    this.nextArrow = label(this, BOX_X + BOX_W - 42, BOX_Y + BOX_H - 34, '▼', 18, P.amber3);
    this.nextArrow.setVisible(false);
    this.tweens.add({ targets: this.nextArrow, y: this.nextArrow.y + 5, duration: 620, yoyo: true, repeat: -1 });

    this.hintLine = label(this, BOX_X + 4, BOX_Y + BOX_H + 8, 'Space / click to continue   ·   Esc to close', 12, P.slate2);

    this.input.keyboard?.on('keydown-SPACE', this.advance, this);
    this.input.keyboard?.on('keydown-E', this.advance, this);
    this.input.keyboard?.on('keydown-ENTER', this.advance, this);
    this.input.keyboard?.on('keydown-ESC', this.onEscape, this);
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      // Clicks on buttons are handled by their own zones.
      if (this.menuMode === 'none' && p.y > BOX_Y - 60) this.advance();
    });

    if (this.payload.mode === 'lines') {
      this.pendingEffects = this.payload.effects;
      this.pendingContradiction = this.payload.effects?.contradiction;
      this.play(this.payload.lines ?? []);
    } else if (this.character) {
      const met = `met_${this.character.id}`;
      if (!GameState.has(met)) {
        GameState.setFlag(met);
        this.play(this.character.greeting, () => this.showTopics());
      } else {
        this.showTopics();
      }
    }
  }

  /* ---------------------------------------------------------------- */

  private onDone?: () => void;

  private play(lines: Line[], onDone?: () => void): void {
    this.clearButtons();
    this.menuMode = 'none';
    this.hintLine.setText('Space / click to continue   ·   Esc to close');
    this.queue = [...lines];
    this.onDone = onDone;
    this.nextLine();
  }

  private nextLine(): void {
    const line = this.queue.shift();
    if (!line) {
      this.finishLines();
      return;
    }
    const speaker = line.speaker;
    const emo: Emotion = line.emotion ?? 'neutral';

    if (speaker === 'narrator') {
      this.portrait.setVisible(false);
      this.namePlate.setText('');
      this.bodyText.setColor(P.paperDim);
      this.bodyText.setFontStyle('italic');
    } else {
      this.portrait.setVisible(true);
      this.portrait.setTexture(portraitKey(speaker, emo));
      const name = speaker === 'ori' ? 'Ori Calder' : CHARACTERS_BY_ID[speaker]?.name ?? speaker;
      this.namePlate.setText(name.toUpperCase());
      this.bodyText.setColor(speaker === 'ori' ? P.amber4 : P.paper);
      this.bodyText.setFontStyle('normal');
      // A small nudge so the portrait feels alive on every line.
      this.portrait.setScale(2.18);
      this.tweens.add({ targets: this.portrait, scale: 2.25, duration: 140, ease: 'Back.easeOut' });
    }

    if (line.punch) {
      this.cameras.main.shake(180, 0.006);
      Audio.contradiction();
    }

    this.nextArrow.setVisible(false);
    this.typer?.destroy();
    this.typer = typewriter(this, this.bodyText, line.text, line.punch ? 26 : 16, () => {
      this.nextArrow.setVisible(true);
    });
  }

  private advance(): void {
    if (this.menuMode !== 'none') return;
    if (this.typer && !this.typer.done()) {
      this.typer.skip();
      return;
    }
    this.nextLine();
  }

  private finishLines(): void {
    const fx = this.pendingEffects;
    this.pendingEffects = undefined;
    if (fx) GameState.applyEffects(fx);

    if (this.pendingContradiction) {
      const id = this.pendingContradiction;
      this.pendingContradiction = undefined;
      this.scene.stop();
      this.scene.launch(SCENE.contradiction, { id });
      return;
    }

    if (this.onDone) {
      const cb = this.onDone;
      this.onDone = undefined;
      cb();
      return;
    }

    if (this.payload.mode === 'interview') this.showTopics();
    else this.close();
  }

  /* ---------------------------------------------------------------- */
  /* Menus                                                             */
  /* ---------------------------------------------------------------- */

  private clearButtons(): void {
    this.buttons.forEach((b) => b.destroy());
    this.buttons = [];
  }

  private availableTopics(): Topic[] {
    if (!this.character) return [];
    return this.character.topics.filter((t) => {
      if (t.once && GameState.usedTopics.has(t.id)) return false;
      if (t.hiddenWhenFlags?.some((f) => GameState.has(f))) return false;
      if (!GameState.hasAll(t.requiresFlags)) return false;
      if (t.requiresEvidence && !t.requiresEvidence.every((e) => GameState.hasEvidence(e))) return false;
      return true;
    });
  }

  private showTopics(): void {
    if (!this.character) {
      this.close();
      return;
    }
    this.clearButtons();
    this.menuMode = 'topics';
    this.nextArrow.setVisible(false);
    this.typer?.destroy();
    this.portrait.setVisible(true);
    this.portrait.setTexture(portraitKey(this.character.id, 'neutral'));
    this.namePlate.setText(`${this.character.name.toUpperCase()}  ·  ${this.character.role}`);
    this.bodyText.setText('');
    this.hintLine.setText('Click a question   ·   Esc to walk away');

    const topics = this.availableTopics();
    const perPage = 3;
    const pages = Math.max(1, Math.ceil(topics.length / perPage));
    this.page = Math.min(this.page, pages - 1);
    const slice = topics.slice(this.page * perPage, this.page * perPage + perPage);

    let y = BOX_Y + 12;
    for (const t of slice) {
      const b = button(this, TEXT_X, y, TEXT_W, 34, `${t.revisit ? '↻ ' : '· '}${t.label}`, () => this.askTopic(t), {
        size: 15,
        fill: t.revisit ? '#3a2b46' : P.slate1,
        hover: t.revisit ? '#55406a' : P.slate2,
        color: t.revisit ? P.violet3 : P.paper,
      });
      this.buttons.push(b);
      y += 38;
    }
    if (slice.length === 0) {
      this.bodyText.setColor(P.slate3);
      this.bodyText.setText('(Nothing more to ask right now. Find something first.)');
    }

    const rowY = BOX_Y + BOX_H - 44;
    const evCount = GameState.evidence.length;
    this.buttons.push(
      button(this, TEXT_X, rowY, 250, 32, `PRESENT EVIDENCE (${evCount})`, () => this.showPresent(), {
        size: 14,
        align: 'center',
        fill: P.amber1,
        hover: P.amber2,
        disabled: evCount === 0,
      }),
    );
    if (pages > 1) {
      this.buttons.push(
        button(this, TEXT_X + 262, rowY, 150, 32, `MORE (${this.page + 1}/${pages})`, () => {
          this.page = (this.page + 1) % pages;
          this.showTopics();
        }, { size: 14, align: 'center' }),
      );
    }
    this.buttons.push(
      button(this, BOX_X + BOX_W - 140, rowY, 120, 32, 'LEAVE', () => this.close(), {
        size: 14,
        align: 'center',
      }),
    );
  }

  private askTopic(t: Topic): void {
    GameState.markTopicUsed(t.id);
    this.pendingEffects = t.effects;
    this.pendingContradiction = t.effects?.contradiction;
    this.play(t.lines);
  }

  private showPresent(): void {
    if (!this.character) return;
    this.clearButtons();
    this.menuMode = 'present';
    this.bodyText.setColor(P.paperDim);
    this.bodyText.setFontStyle('normal');
    this.bodyText.setText('Which piece of evidence?');
    this.hintLine.setText('Pick an item to show them   ·   Esc to go back');

    const ids = GameState.evidence;
    const perPage = 4;
    const pages = Math.max(1, Math.ceil(ids.length / perPage));
    this.page = Math.min(this.page, pages - 1);
    const slice = ids.slice(this.page * perPage, this.page * perPage + perPage);

    const colW = (TEXT_W - 12) / 2;
    slice.forEach((id, i) => {
      const e = EVIDENCE_BY_ID[id];
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = TEXT_X + col * (colW + 12);
      const y = BOX_Y + 34 + row * 36;
      const b = button(this, x, y, colW, 32, e.name, () => this.presentEvidence(id), { size: 14 });
      const icon = this.add.image(colW - 18, 16, iconKey(e.icon)).setScale(1.4);
      b.container.add(icon);
      this.buttons.push(b);
    });

    const rowY = BOX_Y + BOX_H - 44;
    if (pages > 1) {
      this.buttons.push(
        button(this, TEXT_X, rowY, 150, 32, `MORE (${this.page + 1}/${pages})`, () => {
          this.page = (this.page + 1) % pages;
          this.showPresent();
        }, { size: 14, align: 'center' }),
      );
    }
    this.buttons.push(
      button(this, BOX_X + BOX_W - 140, rowY, 120, 32, 'BACK', () => {
        this.page = 0;
        this.showTopics();
      }, { size: 14, align: 'center' }),
    );
  }

  private presentEvidence(id: string): void {
    if (!this.character) return;
    const match = this.character.presents.find((p) => p.evidenceId === id);
    this.page = 0;
    if (!match) {
      this.play([
        { speaker: 'ori', emotion: 'neutral', text: `About this — ${EVIDENCE_BY_ID[id].name}.` },
        ...this.character.presentMiss,
      ]);
      return;
    }
    if (match.effects?.contradiction === 'c2') {
      if (!GameState.hasEvidence('seal') || !GameState.hasEvidence('cufflink')) {
        this.play([
          { speaker: 'ori', emotion: 'neutral', text: 'Your left sleeve is empty, Mr. Kass. I found something that belongs in it.' },
          { speaker: 'kass', emotion: 'defensive', text: 'Laundry. I already said.' },
          { speaker: 'ori', emotion: 'neutral', text: '(The cufflink and the crate seal together. One without the other is just a lost button.)' },
        ]);
        return;
      }
    }
    // Contradiction III needs all three costume items before it fires.
    if (match.effects?.contradiction === 'c3') {
      const needed = ['hat', 'coat', 'cane'];
      const missing = needed.filter((n) => !GameState.hasEvidence(n));
      if (missing.length > 0) {
        this.play([
          { speaker: 'ori', emotion: 'neutral', text: 'The hat band is stamped 54.' },
          { speaker: 'nadia', emotion: 'neutral', text: 'Hats come in sizes. That is how hats work.' },
          { speaker: 'ori', emotion: 'neutral', text: '(One measurement is a coincidence. I need the coat and the cane too.)' },
        ]);
        return;
      }
    }
    this.pendingEffects = match.effects;
    this.pendingContradiction = match.effects?.contradiction;
    this.play(match.lines);
  }

  /* ---------------------------------------------------------------- */

  private onEscape(): void {
    Audio.back();
    if (this.menuMode === 'present') {
      this.page = 0;
      this.showTopics();
      return;
    }
    if (this.menuMode === 'topics') {
      this.close();
      return;
    }
    // Mid-speech: fast-forward rather than skipping content.
    if (this.typer && !this.typer.done()) this.typer.skip();
    else this.nextLine();
  }

  private close(): void {
    this.typer?.destroy();
    this.clearButtons();
    GameState.save();
    this.scene.stop();
    this.scene.resume(SCENE.train);
    this.game.events.emit('overlay-closed');
  }
}

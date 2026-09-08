import Phaser from 'phaser';
import { GAME_H, GAME_W, SCENE } from '../core/config';
import { P, toInt } from '../core/palette';
import { button, label, panel, scrim, type Button } from '../ui/kit';
import { GameState } from '../core/state';
import { Audio } from '../core/audio';
import { iconKey, portraitKey } from '../core/art';
import { EVIDENCE, EVIDENCE_BY_ID } from '../data/evidence';
import { CHARACTERS } from '../data/characters';
import { STATEMENTS_BY_ID, TIMELINE } from '../data/case';
import { HINTS } from '../data/story';

type Tab = 'evidence' | 'suspects' | 'statements' | 'timeline' | 'case';

const TABS: { id: Tab; label: string }[] = [
  { id: 'evidence', label: 'EVIDENCE' },
  { id: 'suspects', label: 'SUSPECTS' },
  { id: 'statements', label: 'STATEMENTS' },
  { id: 'timeline', label: 'TIMELINE' },
  { id: 'case', label: 'THE CASE' },
];

const PX = 40;
const PY = 34;
const PW = GAME_W - 80;
const PH = GAME_H - 68;
const CX = PX + 210;
const CW = PW - 240;

export class NotebookScene extends Phaser.Scene {
  private tab: Tab = 'evidence';
  private content: Phaser.GameObjects.GameObject[] = [];
  private buttons: Button[] = [];
  private tabButtons: Button[] = [];
  private page = 0;
  private selectedEvidence: string | null = null;
  private hintsShown = 0;

  constructor() {
    super({ key: SCENE.notebook });
  }

  create(): void {
    this.content = [];
    this.buttons = [];
    this.tabButtons = [];
    this.page = 0;
    this.selectedEvidence = null;
    this.hintsShown = 0;

    scrim(this, GAME_W, GAME_H, 0.86);
    panel(this, PX, PY, PW, PH, { fill: '#171d2e', border: P.amber2 });

    const title = label(this, PX + 20, PY + 14, "ORI'S NOTEBOOK", 20, P.amber4);
    const sub = label(this, PX + 20, PY + 40, 'Case 14 — The Passenger Who Never Arrived', 12, P.slate3);
    this.add.existing(title);
    this.add.existing(sub);
    this.add.rectangle(PX + 196, PY + 8, 2, PH - 16, toInt(P.slate1)).setOrigin(0, 0);

    let y = PY + 78;
    for (const t of TABS) {
      const b = button(this, PX + 16, y, 168, 36, t.label, () => {
        this.tab = t.id;
        this.page = 0;
        this.selectedEvidence = null;
        Audio.page();
        this.render();
      }, { size: 14 });
      this.tabButtons.push(b);
      y += 42;
    }

    button(this, PX + 16, PY + PH - 54, 168, 36, 'CLOSE  [J]', () => this.close(), { size: 14, align: 'center' });

    this.input.keyboard?.on('keydown-J', () => this.close());
    this.input.keyboard?.on('keydown-ESC', () => this.close());

    GameState.unread.clear();
    this.render();
  }

  /* ---------------------------------------------------------------- */

  private clear(): void {
    this.content.forEach((o) => o.destroy());
    this.content = [];
    this.buttons.forEach((b) => b.destroy());
    this.buttons = [];
  }

  private add2(o: Phaser.GameObjects.GameObject): void {
    this.content.push(o);
  }

  private header(text: string, sub?: string): number {
    this.add2(label(this, CX, PY + 20, text, 20, P.paper));
    if (sub) this.add2(label(this, CX, PY + 46, sub, 12, P.slate3, CW));
    return PY + 74;
  }

  private pager(total: number, perPage: number, y: number): number {
    const pages = Math.max(1, Math.ceil(total / perPage));
    this.page = Math.min(this.page, pages - 1);
    if (pages > 1) {
      this.buttons.push(
        button(this, CX, y, 130, 30, '◂ PREV', () => {
          this.page = (this.page - 1 + pages) % pages;
          this.render();
        }, { size: 13, align: 'center' }),
      );
      this.buttons.push(
        button(this, CX + 142, y, 130, 30, 'NEXT ▸', () => {
          this.page = (this.page + 1) % pages;
          this.render();
        }, { size: 13, align: 'center' }),
      );
      this.add2(label(this, CX + 288, y + 7, `page ${this.page + 1} / ${pages}`, 13, P.slate3));
    }
    return this.page * perPage;
  }

  private render(): void {
    this.clear();
    this.tabButtons.forEach((b, i) => b.setDisabled(TABS[i].id === this.tab));
    switch (this.tab) {
      case 'evidence':
        this.renderEvidence();
        break;
      case 'suspects':
        this.renderSuspects();
        break;
      case 'statements':
        this.renderStatements();
        break;
      case 'timeline':
        this.renderTimeline();
        break;
      case 'case':
        this.renderCase();
        break;
    }
  }

  /* ---------------------------------------------------------------- */

  private renderEvidence(): void {
    const owned = GameState.evidence;
    const y0 = this.header(
      `EVIDENCE  ${owned.length} / ${EVIDENCE.length}`,
      'Everything found so far, and what it actually proves.',
    );

    if (this.selectedEvidence) {
      const e = EVIDENCE_BY_ID[this.selectedEvidence];
      this.add2(this.add.image(CX + 34, y0 + 34, iconKey(e.icon)).setScale(4));
      this.add2(label(this, CX + 84, y0 + 6, e.name.toUpperCase(), 20, P.amber4, CW - 90));
      this.add2(label(this, CX + 84, y0 + 34, e.description, 15, P.paper, CW - 100));
      const meaningY = y0 + 118;
      this.add2(this.add.rectangle(CX, meaningY - 12, CW - 20, 2, toInt(P.slate1)).setOrigin(0, 0));
      this.add2(label(this, CX, meaningY, 'WHAT IT MEANS', 12, P.slate3));
      this.add2(label(this, CX, meaningY + 20, e.meaning, 17, P.violet3, CW - 30));
      this.buttons.push(
        button(this, CX, PY + PH - 56, 180, 32, '◂ BACK TO LIST', () => {
          this.selectedEvidence = null;
          this.render();
        }, { size: 13, align: 'center' }),
      );
      return;
    }

    if (owned.length === 0) {
      this.add2(label(this, CX, y0, 'Nothing yet. Look at the amber glints in each carriage.', 16, P.slate3, CW));
      return;
    }

    const perPage = 8;
    const start = this.pager(owned.length, perPage, PY + PH - 56);
    const slice = owned.slice(start, start + perPage);
    const colW = (CW - 20) / 2;
    slice.forEach((id, i) => {
      const e = EVIDENCE_BY_ID[id];
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = CX + col * (colW + 16);
      const y = y0 + row * 58;
      const b = button(this, x, y, colW, 50, `${e.name}`, () => {
        this.selectedEvidence = id;
        Audio.page();
        this.render();
      }, { size: 14 });
      const icon = this.add.image(colW - 26, 25, iconKey(e.icon)).setScale(1.8);
      b.container.add(icon);
      this.buttons.push(b);
    });
  }

  private renderSuspects(): void {
    const y0 = this.header('SUSPECTS', 'Four witnesses. Four different midnights.');
    let y = y0;
    for (const c of CHARACTERS) {
      const met = GameState.has(`met_${c.id}`);
      this.add2(this.add.image(CX + 30, y + 30, portraitKey(c.id, met ? 'neutral' : 'neutral')).setScale(0.95).setAlpha(met ? 1 : 0.3));
      this.add2(label(this, CX + 74, y + 2, met ? `${c.name}  ·  ${c.role}, ${c.age}` : '??? · unidentified', 16, met ? P.amber4 : P.slate2));
      if (met) {
        this.add2(label(this, CX + 74, y + 24, c.profile, 13, P.paperDim, CW - 90));
        let ry = y + 24 + 32;
        for (const rev of c.profileReveals ?? []) {
          if (!GameState.has(rev.flag)) continue;
          this.add2(label(this, CX + 74, ry, `▸ ${rev.text}`, 13, P.violet3, CW - 90));
          ry += 30;
        }
        y = Math.max(y + 96, ry + 6);
      } else {
        y += 78;
      }
    }
  }

  private renderStatements(): void {
    const ids = GameState.statements;
    const y0 = this.header('STATEMENTS', 'Struck-through entries have been disproved by evidence.');
    if (ids.length === 0) {
      this.add2(label(this, CX, y0, 'No statements recorded yet. Ask the witnesses where they were.', 16, P.slate3, CW));
      return;
    }
    const perPage = 4;
    const start = this.pager(ids.length, perPage, PY + PH - 56);
    let y = y0;
    for (const id of ids.slice(start, start + perPage)) {
      const s = STATEMENTS_BY_ID[id];
      if (!s) continue;
      const overturned = GameState.has(`overturned_${id}`);
      const who = CHARACTERS.find((c) => c.id === s.characterId)!;
      this.add2(label(this, CX, y, `${who.name.toUpperCase()} — ${s.summary}`, 15, overturned ? P.red : P.amber4, CW - 20));
      const quote = label(this, CX, y + 24, s.quote, 14, overturned ? P.slate2 : P.paper, CW - 30);
      this.add2(quote);
      if (overturned) {
        this.add2(
          this.add.rectangle(CX, y + 32, Math.min(CW - 30, quote.width), 2, toInt(P.red), 0.8).setOrigin(0, 0),
        );
        this.add2(label(this, CX, y + 24 + quote.height + 4, 'DISPROVED', 12, P.red));
        y += 24 + quote.height + 34;
      } else {
        y += 24 + quote.height + 22;
      }
    }
  }

  private renderTimeline(): void {
    const y0 = this.header('TIMELINE', 'Only what has actually been established.');
    let y = y0;
    for (const t of TIMELINE) {
      if (t.requiresFlag && !GameState.has(t.requiresFlag)) continue;
      this.add2(this.add.rectangle(CX + 4, y + 6, 3, 24, toInt(P.amber2)).setOrigin(0, 0));
      this.add2(label(this, CX + 18, y, t.time, 15, P.amber4));
      this.add2(label(this, CX + 90, y, t.text, 14, P.paper, CW - 110));
      y += 36;
    }
  }

  private renderCase(): void {
    const stop = GameState.currentStop();
    const y0 = this.header('THE CASE', `Stop ${stop.index} of 6 — next station ${stop.name}.`);
    this.add2(label(this, CX, y0, 'CURRENT OBJECTIVE', 12, P.slate3));
    this.add2(label(this, CX, y0 + 20, GameState.objective, 19, P.amber4, CW - 30));

    this.add2(this.add.rectangle(CX, y0 + 92, CW - 20, 2, toInt(P.slate1)).setOrigin(0, 0));
    this.add2(label(this, CX, y0 + 106, 'STUCK?', 12, P.slate3));
    this.add2(
      label(
        this,
        CX,
        y0 + 126,
        'Hints are optional and revealed one at a time. Nothing expires; no witness leaves the train.',
        13,
        P.paperDim,
        CW - 30,
      ),
    );

    const hint = HINTS.find((h) => h.requiresFlagsAbsent.some((f) => !GameState.has(f)));
    let hy = y0 + 176;
    for (let i = 0; i < this.hintsShown && hint; i++) {
      this.add2(label(this, CX, hy, `▸ ${hint.text}`, 15, P.violet3, CW - 30));
      hy += 60;
      break;
    }
    if (hint && this.hintsShown === 0) {
      this.buttons.push(
        button(this, CX, hy, 240, 34, 'REVEAL A HINT', () => {
          this.hintsShown = 1;
          this.render();
        }, { size: 14, align: 'center', fill: '#3a2b46', hover: '#55406a' }),
      );
    } else if (!hint) {
      this.add2(label(this, CX, hy, 'Everything you need is already in the notebook.', 15, P.slate3, CW - 30));
    }

    this.add2(
      label(
        this,
        CX,
        PY + PH - 96,
        'Controls: WASD / arrows move · E or Space interact · J notebook · R reconstruction · Esc pause · M mute',
        12,
        P.slate2,
        CW - 30,
      ),
    );
  }

  /* ---------------------------------------------------------------- */

  private close(): void {
    Audio.back();
    GameState.save();
    this.scene.stop();
    this.scene.resume(SCENE.train);
    this.game.events.emit('overlay-closed');
  }
}

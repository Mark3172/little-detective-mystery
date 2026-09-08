import Phaser from 'phaser';
import { SAVE_KEY, SETTINGS_KEY } from './config';
import { STOPS } from '../data/story';
import type { AreaId, CharacterId, Effects, MomentId } from '../data/types';

export interface ReconAssignment {
  [character: string]: Partial<Record<MomentId, AreaId>>;
}

interface SaveShape {
  version: 1;
  flags: string[];
  evidence: string[];
  statements: string[];
  unlockedTopics: string[];
  usedTopics: string[];
  usedInteractables: Record<string, number>;
  stopIndex: number;
  area: AreaId;
  x: number;
  y: number;
  objective: string;
  recon: ReconAssignment;
  playedMs: number;
}

export interface Settings {
  muted: boolean;
  touch: boolean;
}

const DEFAULT_OBJECTIVE = 'Speak to all four witnesses about the blackout.';

/**
 * All mutable progress lives here. Scenes read it and call mutators;
 * nothing else owns story state.
 */
class GameStateClass {
  readonly events = new Phaser.Events.EventEmitter();

  flags = new Set<string>();
  evidence: string[] = [];
  statements: string[] = [];
  unlockedTopics = new Set<string>();
  usedTopics = new Set<string>();
  /** interactable id -> number of completed passes */
  usedInteractables: Record<string, number> = {};
  stopIndex = 1;
  area: AreaId = 'sleeper';
  x = 300;
  y = 170;
  objective = DEFAULT_OBJECTIVE;
  recon: ReconAssignment = {};
  playedMs = 0;

  /** Evidence ids the player has not yet opened in the notebook. */
  unread = new Set<string>();

  settings: Settings = { muted: false, touch: false };

  /* ---------------------------------------------------------------- */

  reset(): void {
    this.flags.clear();
    this.evidence = [];
    this.statements = [];
    this.unlockedTopics.clear();
    this.usedTopics.clear();
    this.usedInteractables = {};
    this.stopIndex = 1;
    this.area = 'sleeper';
    this.x = 300;
    this.y = 170;
    this.objective = DEFAULT_OBJECTIVE;
    this.recon = {};
    this.playedMs = 0;
    this.unread.clear();
    this.events.emit('changed');
  }

  /* ---------------------------------------------------------------- */

  has(flag: string): boolean {
    return this.flags.has(flag);
  }

  hasAll(flags?: string[]): boolean {
    if (!flags || flags.length === 0) return true;
    return flags.every((f) => this.flags.has(f));
  }

  hasEvidence(id: string): boolean {
    return this.evidence.includes(id);
  }

  setFlag(flag: string): void {
    if (this.flags.has(flag)) return;
    this.flags.add(flag);
    this.events.emit('flag', flag);
    this.checkMilestones();
  }

  addEvidence(id: string): boolean {
    if (this.evidence.includes(id)) return false;
    this.evidence.push(id);
    this.flags.add(`ev_${id}`);
    this.unread.add(id);
    this.events.emit('evidence', id);
    this.checkMilestones();
    return true;
  }

  addStatement(id: string): boolean {
    if (this.statements.includes(id)) return false;
    this.statements.push(id);
    this.flags.add(`st_${id}`);
    this.events.emit('statement', id);
    return true;
  }

  applyEffects(fx?: Effects): void {
    if (!fx) return;
    fx.evidence?.forEach((e) => this.addEvidence(e));
    fx.statements?.forEach((s) => this.addStatement(s));
    fx.flags?.forEach((f) => this.setFlag(f));
    fx.unlockTopics?.forEach((t) => this.unlockedTopics.add(t));
    if (fx.objective) this.setObjective(fx.objective);
    this.checkMilestones();
  }

  setObjective(text: string): void {
    this.objective = text;
    this.events.emit('objective', text);
  }

  markTopicUsed(id: string): void {
    this.usedTopics.add(id);
    this.checkMilestones();
  }

  interactPass(id: string): number {
    return this.usedInteractables[id] ?? 0;
  }

  bumpInteract(id: string): void {
    this.usedInteractables[id] = this.interactPass(id) + 1;
  }

  /* ---------------------------------------------------------------- */

  /** Derived flags and the six-stop counter. Safe to call often. */
  checkMilestones(): void {
    const interviewed = ['bram', 'ilse', 'kass', 'nadia'].every((c) =>
      this.flags.has(`interviewed_${c}`),
    );
    if (interviewed && !this.flags.has('interviewed_all')) {
      this.flags.add('interviewed_all');
      this.events.emit('flag', 'interviewed_all');
    }

    let target = 1;
    for (const stop of STOPS) {
      if (!stop.milestoneFlag) continue;
      if (this.flags.has(stop.milestoneFlag)) target = Math.max(target, stop.index);
    }
    if (target > this.stopIndex) {
      this.stopIndex = target;
      const stop = STOPS.find((s) => s.index === target);
      if (stop) {
        this.setObjective(stop.objective);
        this.events.emit('station', stop);
      }
    }
  }

  currentStop() {
    return STOPS.find((s) => s.index === this.stopIndex) ?? STOPS[0];
  }

  /* ---------------------------------------------------------------- */

  toJSON(): SaveShape {
    return {
      version: 1,
      flags: [...this.flags],
      evidence: [...this.evidence],
      statements: [...this.statements],
      unlockedTopics: [...this.unlockedTopics],
      usedTopics: [...this.usedTopics],
      usedInteractables: { ...this.usedInteractables },
      stopIndex: this.stopIndex,
      area: this.area,
      x: this.x,
      y: this.y,
      objective: this.objective,
      recon: this.recon,
      playedMs: this.playedMs,
    };
  }

  save(): void {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.toJSON()));
    } catch {
      /* storage unavailable — the game still plays, it just will not persist. */
    }
  }

  static hasSave(): boolean {
    try {
      return !!localStorage.getItem(SAVE_KEY);
    } catch {
      return false;
    }
  }

  load(): boolean {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw) as SaveShape;
      if (data.version !== 1) return false;
      this.reset();
      data.flags.forEach((f) => this.flags.add(f));
      this.evidence = [...data.evidence];
      this.statements = [...data.statements];
      data.unlockedTopics.forEach((t) => this.unlockedTopics.add(t));
      data.usedTopics.forEach((t) => this.usedTopics.add(t));
      this.usedInteractables = { ...data.usedInteractables };
      this.stopIndex = data.stopIndex;
      this.area = data.area;
      this.x = data.x;
      this.y = data.y;
      this.objective = data.objective || DEFAULT_OBJECTIVE;
      this.recon = data.recon ?? {};
      this.playedMs = data.playedMs ?? 0;
      this.events.emit('changed');
      return true;
    } catch {
      return false;
    }
  }

  clearSave(): void {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      /* ignore */
    }
  }

  /* ---------------------------------------------------------------- */

  loadSettings(): void {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) this.settings = { ...this.settings, ...JSON.parse(raw) };
    } catch {
      /* ignore */
    }
    if (!('ontouchstart' in window)) return;
    this.settings.touch = this.settings.touch || window.matchMedia('(pointer: coarse)').matches;
  }

  saveSettings(): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    } catch {
      /* ignore */
    }
  }

  /* ---------------------------------------------------------------- */

  getRecon(c: CharacterId, m: MomentId): AreaId | undefined {
    return this.recon[c]?.[m];
  }

  setRecon(c: CharacterId, m: MomentId, area: AreaId): void {
    if (!this.recon[c]) this.recon[c] = {};
    this.recon[c][m] = area;
  }
}

export const GameState = new GameStateClass();
export const hasSavedGame = () => GameStateClass.hasSave();

/**
 * Shared story data types.
 *
 * Everything in `src/data` is pure content: no Phaser imports, no scene logic.
 * Scenes read this data; they never hard-code story facts.
 */

export type AreaId = 'passenger' | 'dining' | 'sleeper' | 'baggage';

export type CharacterId = 'bram' | 'ilse' | 'kass' | 'nadia';

export type Emotion =
  | 'neutral'
  | 'hesitant'
  | 'defensive'
  | 'relieved'
  | 'avoidant'
  | 'alarmed'
  | 'warm'
  | 'sullen'
  | 'sad';

/** Who is speaking a line. `ori` is the player character, `narrator` is unattributed prose. */
export type SpeakerId = CharacterId | 'ori' | 'narrator';

export interface Line {
  speaker: SpeakerId;
  text: string;
  emotion?: Emotion;
  /** Optional screen shake / emphasis cue handled by the dialogue scene. */
  punch?: boolean;
}

/** Side effects a dialogue topic or examine action can produce. */
export interface Effects {
  evidence?: string[];
  statements?: string[];
  flags?: string[];
  /** Topic ids (namespaced `char.topic`) that become selectable. */
  unlockTopics?: string[];
  /** Launches a scripted contradiction sequence by id. */
  contradiction?: string;
  /** Notebook objective text to switch to. */
  objective?: string;
}

export interface Topic {
  id: string;
  label: string;
  /** Hidden until every listed flag is set. */
  requiresFlags?: string[];
  /** Hidden until every listed evidence id is collected. */
  requiresEvidence?: string[];
  /** Hidden once any listed flag is set (used to retire stale questions). */
  hiddenWhenFlags?: string[];
  /** Shown only once, then retired automatically. */
  once?: boolean;
  lines: Line[];
  effects?: Effects;
  /** Marks the topic in the menu as a re-ask after a contradiction. */
  revisit?: boolean;
}

export interface PresentResponse {
  evidenceId: string;
  lines: Line[];
  effects?: Effects;
  /** True when this is the intended breakthrough for the character. */
  breakthrough?: boolean;
}

export interface Character {
  id: CharacterId;
  name: string;
  role: string;
  age: number;
  /** One-line notebook summary, updated as flags are set. */
  profile: string;
  /** Extra profile paragraphs unlocked by flags. */
  profileReveals?: { flag: string; text: string }[];
  home: AreaId;
  /** World position within the home area. */
  x: number;
  y: number;
  /** Palette used to build the sprite and portrait. */
  palette: {
    skin: string;
    hair: string;
    coat: string;
    coatDark: string;
    accent: string;
  };
  /** Portrait geometry knobs so each face reads differently at 48x48. */
  face: {
    hairStyle: 'bun' | 'short' | 'slick' | 'cap';
    glasses?: boolean;
    scarf?: boolean;
    height: 'tall' | 'medium' | 'small';
  };
  greeting: Line[];
  topics: Topic[];
  presents: PresentResponse[];
  /** Fallback when presenting irrelevant evidence. */
  presentMiss: Line[];
}

export interface Evidence {
  id: string;
  name: string;
  /** Short notebook description. */
  description: string;
  /** The deduction this item supports, shown in the notebook. */
  meaning: string;
  /** Icon key drawn procedurally by the texture factory. */
  icon:
    | 'ticket'
    | 'coat'
    | 'hat'
    | 'cane'
    | 'dust'
    | 'ladder'
    | 'notice'
    | 'footprint'
    | 'cufflink'
    | 'seal'
    | 'tin'
    | 'book'
    | 'receipt';
  area: AreaId;
  essential: boolean;
}

export interface Statement {
  id: string;
  characterId: CharacterId;
  /** Short headline used in menus. */
  summary: string;
  /** The witness's words as recorded. */
  quote: string;
  /** Set once a contradiction has overturned it. */
  overturnedBy?: string;
}

export interface TimelineEntry {
  id: string;
  time: string;
  text: string;
  /** Flag that reveals the entry. */
  requiresFlag?: string;
}

/** A scripted three-beat CONTRADICTION reveal. */
export interface Contradiction {
  id: string;
  title: string;
  characterId: CharacterId;
  /** Statement id that gets struck through. */
  statementId: string;
  /** Evidence that disproves it. */
  evidenceId: string;
  quote: string;
  proof: string;
  conclusion: string;
  aftermath: Line[];
  effects?: Effects;
}

/* ------------------------------------------------------------------ */
/* Mind Reconstruction                                                 */
/* ------------------------------------------------------------------ */

export type MomentId = 'before' | 'blackout' | 'after';

export interface Moment {
  id: MomentId;
  label: string;
  clock: string;
}

export interface ConflictRule {
  id: string;
  /** Rule only fires if the player has collected all of these. */
  requiresEvidence?: string[];
  requiresFlags?: string[];
  /** Fires when this suspect is placed in this area at this moment. */
  when: { characterId: CharacterId; moment: MomentId; area?: AreaId; notArea?: AreaId };
  message: string;
}

export interface FinalQuestion {
  id: string;
  prompt: string;
  options: { id: string; text: string; correct?: boolean; rebuttal?: string }[];
}

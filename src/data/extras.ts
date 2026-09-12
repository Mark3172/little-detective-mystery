import type { AreaId, Character, Difficulty, Effects, Line } from './types';

export interface ExtraPerson {
  id: string;
  name: string;
  role: string;
  area: AreaId;
  x: number;
  y: number;
  difficulties: Difficulty[];
  palette: Character['palette'];
  face: Character['face'];
  lines: Line[];
  exhaustedLines: Line[];
  effects?: Effects;
}

/** Side people. They are not suspects. The case truth does not change. */
export const EXTRA_PEOPLE: ExtraPerson[] = [
  {
    id: 'pell',
    name: 'Mrs. Pell',
    role: 'Knitting in Coach B',
    area: 'passenger',
    x: 360,
    y: 200,
    difficulties: ['easy'],
    palette: { skin: '#e8c4a0', hair: '#c8b48a', coat: '#5a3d55', coatDark: '#3d2840', accent: '#d4a0b0' },
    face: { hairStyle: 'bun', height: 'small' },
    lines: [
      { speaker: 'narrator', text: 'An old woman knits a long grey scarf. She smiles like she has been waiting to talk.' },
      { speaker: 'ori', emotion: 'neutral', text: 'Did you see the girl in seat twelve tonight?' },
      { speaker: 'narrator', text: '"Yes. Reading. She was there at five to twelve. I checked my watch because I envied her quiet."' },
      { speaker: 'narrator', text: '"And I saw her buy two tickets at Aldermere. One after the other. Same window."' },
      { speaker: 'ori', emotion: 'neutral', text: '(Two tickets. One girl. That is a lot of help.)' },
    ],
    effects: { flags: ['know_nadia_seen'] },
    exhaustedLines: [
      { speaker: 'narrator', text: 'Mrs. Pell keeps knitting. "Look at wet floors, dear. They keep secrets."' },
    ],
  },
  {
    id: 'holt',
    name: 'Mr. Holt',
    role: 'Late supper, dining car',
    area: 'dining',
    x: 150,
    y: 200,
    difficulties: ['normal'],
    palette: { skin: '#c9a07a', hair: '#3a342c', coat: '#4a5a48', coatDark: '#2c382c', accent: '#c4b070' },
    face: { hairStyle: 'short', glasses: true, height: 'medium' },
    lines: [
      { speaker: 'narrator', text: 'A thin man in a green coat finishes cold soup. He talks like he bills by the minute.' },
      { speaker: 'ori', emotion: 'neutral', text: 'Where was everyone when the lights died?' },
      { speaker: 'narrator', text: '"The manager with the violin talk? He paid for cocoa, then went toward the last car. Camera out."' },
      { speaker: 'narrator', text: '"The cook stayed. She was counting coins. She thought I could not see."' },
      { speaker: 'narrator', text: '"The girl in twelve? After the lights, she was back in her seat. Before that? I was not watching her."' },
      { speaker: 'ori', emotion: 'neutral', text: '(Kass left for the last car. Ilse stayed. Nadia was in twelve after the lights.)' },
    ],
    effects: { flags: ['know_nadia_seen'] },
    exhaustedLines: [
      { speaker: 'narrator', text: 'Mr. Holt taps his bowl. "I sell cloth. I do not sell alibis."' },
    ],
  },
  {
    id: 'quinn',
    name: 'Porter Quinn',
    role: 'Night porter',
    area: 'sleeper',
    x: 520,
    y: 176,
    difficulties: ['hard'],
    palette: { skin: '#8d6a4a', hair: '#1c1c22', coat: '#3e2a22', coatDark: '#241610', accent: '#8a6a3a' },
    face: { hairStyle: 'slick', height: 'tall' },
    lines: [
      { speaker: 'narrator', text: 'A porter leans on a broom like it owes him money.' },
      { speaker: 'ori', emotion: 'neutral', text: 'Did you see the missing passenger?' },
      { speaker: 'narrator', text: '"Tall man. Grey coat. I saw him at the door gap. He jumped at Saltmarsh. Gone."' },
      { speaker: 'ori', emotion: 'neutral', text: 'This train did not stop between 23:20 and 00:20.' },
      { speaker: 'narrator', text: 'He shrugs. "Then I saw a ghost. Or you heard what you wanted. Staff talk, kid."' },
      { speaker: 'ori', emotion: 'neutral', text: '(That story is wrong. He wants me to chase a man who never left.)' },
    ],
    exhaustedLines: [
      { speaker: 'narrator', text: 'Quinn looks at his broom. "I already told you. Jump. Saltmarsh. End of it."' },
    ],
  },
];

export const EXTRA_BY_ID = Object.fromEntries(EXTRA_PEOPLE.map((p) => [p.id, p]));

export function extrasFor(difficulty: Difficulty, area?: AreaId): ExtraPerson[] {
  return EXTRA_PEOPLE.filter(
    (p) => p.difficulties.includes(difficulty) && (area ? p.area === area : true),
  );
}

import type { Difficulty } from '../data/types';

export const DIFFICULTIES: Difficulty[] = ['easy', 'normal', 'hard'];

export const DIFFICULTY_INFO: Record<
  Difficulty,
  { label: string; blurb: string }
> = {
  easy: {
    label: 'EASY',
    blurb: 'Clues shine. Mrs. Pell helps. Hints stay on.',
  },
  normal: {
    label: 'NORMAL',
    blurb: 'Some clues hide. Talk to Mr. Holt. Hints stay on.',
  },
  hard: {
    label: 'HARD',
    blurb: 'Most clues hide. Quinn may lie. No hints.',
  },
};

export function difficultyLabel(d: Difficulty): string {
  return DIFFICULTY_INFO[d].label;
}

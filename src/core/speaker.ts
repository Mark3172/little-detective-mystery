import { portraitKey } from './art';
import { CHARACTERS_BY_ID } from '../data/characters';
import type { Emotion, SpeakerId } from '../data/types';

export const NARRATOR_NAME = 'Marky';

export function speakerName(speaker: SpeakerId): string {
  if (speaker === 'ori') return 'Ori Calder';
  if (speaker === 'narrator') return NARRATOR_NAME;
  return CHARACTERS_BY_ID[speaker]?.name ?? speaker;
}

export function speakerPortrait(speaker: SpeakerId, emotion: Emotion = 'neutral'): string {
  return portraitKey(speaker === 'narrator' ? 'narrator' : speaker, emotion);
}

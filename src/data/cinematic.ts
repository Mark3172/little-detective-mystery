import type { Line } from './types';

/** Short briefing after the opening film, once Ori is on the train. */
export const OPENING_BRIEF: Line[] = [
  { speaker: 'ori', emotion: 'neutral', text: 'Four people were awake. All four tell me a different story.' },
  { speaker: 'ori', emotion: 'neutral', text: 'One story is true. I have until Vaskaya to find out which.' },
  { speaker: 'narrator', text: 'WASD or arrows to move. E or Space to talk. J for the notebook.' },
];

export const TWIST: Line[] = [
  { speaker: 'narrator', text: 'HOLLOWMERE PLATFORM — 01:44' },
  { speaker: 'narrator', text: 'A woman is already under the lamp. Violin case. Grey bun. She did not come from a kitchen.' },
  { speaker: 'narrator', text: 'She has been on this platform since the train was still in the tunnel.' },
  { speaker: 'nadia', emotion: 'warm', text: 'Gran.' },
  { speaker: 'ori', emotion: 'alarmed', text: 'The light on the hill. You said she leaves it on every Tuesday, just in case.' },
  { speaker: 'nadia', emotion: 'relieved', text: 'That was the story for the guard. The light means she is already here. We wrote that down years ago.' },
  { speaker: 'narrator', text: 'Marta Vell. She used to work this night train. She is retired now.' },
  { speaker: 'ori', emotion: 'neutral', text: 'Rule 12(b). You did not just read that on a sign in the baggage car.' },
  { speaker: 'nadia', emotion: 'hesitant', text: 'She told it as a bedtime rule. If you ever need a platform, child, make them count names.' },
  { speaker: 'narrator', text: 'Inside The Wandering Ren, under the first line, a second line in the same pencil:' },
  { speaker: 'narrator', text: '"Tuesday trains. I will be under the lamp, not in the kitchen."' },
  { speaker: 'ori', emotion: 'neutral', text: 'So the missing passenger was not only tonight. You two made him up together.' },
  { speaker: 'nadia', emotion: 'warm', text: 'He leaves every town before anyone can keep him. That is what the book is for.' },
  { speaker: 'ori', emotion: 'neutral', text: '(The case is still true. The costume. The 40 seconds. The basket. The twist is that home was waiting on purpose.)' },
];

export const ENCORE: Line[] = [
  { speaker: 'narrator', text: 'HOLLOWMERE — THE HILL — 06:10' },
  { speaker: 'narrator', text: 'A kitchen that stayed awake all night. Toast. Pine from an open violin case on the table.' },
  { speaker: 'nadia', emotion: 'warm', text: 'She says you can stay for breakfast if your science fair can wait one more hour.' },
  { speaker: 'ori', emotion: 'neutral', text: 'The science fair can wait. Case fourteen still needs a last sentence.' },
  { speaker: 'narrator', text: 'Marta sets down two cups. She does not ask how you knew. She asks if the floor was still wet.' },
  { speaker: 'ori', emotion: 'neutral', text: 'It was. That is how I knew who was not there.' },
  { speaker: 'narrator', text: 'Outside, the 06:40 local train stops and does not take anyone important away.' },
  { speaker: 'ori', emotion: 'neutral', text: 'Note on the side: some cases end in a kitchen. Write it down anyway.' },
];

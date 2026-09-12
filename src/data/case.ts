import type {
  ConflictRule,
  Contradiction,
  FinalQuestion,
  Moment,
  Statement,
  TimelineEntry,
  AreaId,
  CharacterId,
  MomentId,
} from './types';

/* ------------------------------------------------------------------ */
/* Recorded statements                                                 */
/* ------------------------------------------------------------------ */

export const STATEMENTS: Statement[] = [
  {
    id: 'bram_patrol',
    characterId: 'bram',
    summary: 'Says he walked the sleep-car hall during the dark',
    quote:
      '"I was walking past the sleep rooms from 11:45. In the dark I heard Room 4 lock. That small click. I know that sound."',
  },
  {
    id: 'bram_sleeping',
    characterId: 'bram',
    summary: 'Was asleep in the baggage room — second night of work',
    quote:
      '"I sat down in the back room at 10:30. I woke at 12:05 with cold tea. Two hours gone. That is all."',
  },
  {
    id: 'ilse_galley',
    characterId: 'ilse',
    summary: 'Says the dining car was empty and she was in the back kitchen',
    quote: '"Empty. Kitchen door shut, radio on. I saw no one until the lights came back."',
  },
  {
    id: 'ilse_figure',
    characterId: 'ilse',
    summary: 'Saw a small person at the counter during the dark',
    quote:
      '"There was someone at the counter in the dark. Small — no taller than my shoulder. And they smelled like pine, like a violin case."',
  },
  {
    id: 'kass_knocking',
    characterId: 'kass',
    summary: 'Says he was knocking at Room 4',
    quote: '"I was outside Room 4 the whole time, knocking. Ren would not answer. Talent scouts never do."',
  },
  {
    id: 'kass_crate',
    characterId: 'kass',
    summary: 'Admits he was opening the violin box in the baggage car',
    quote: '"Fine. The box. The violin is worth money and I owe money. I opened it. That is all I opened."',
  },
  {
    id: 'nadia_seat',
    characterId: 'nadia',
    summary: 'Says she never left seat 12',
    quote: '"I was reading. I did not move all night. But I saw him get on — tall, bent over, grey coat, red scarf, silver cane."',
  },
  {
    id: 'nadia_truth',
    characterId: 'nadia',
    summary: 'Admits she was "A. Ren"',
    quote: '"There was never a Mr. Ren. There was just me, and a coat, and 40 seconds of dark."',
  },
];

export const STATEMENTS_BY_ID: Record<string, Statement> = Object.fromEntries(
  STATEMENTS.map((s) => [s.id, s]),
);

/* ------------------------------------------------------------------ */
/* Timeline                                                            */
/* ------------------------------------------------------------------ */

export const TIMELINE: TimelineEntry[] = [
  { id: 't1', time: '21:10', text: 'The Meridian leaves Aldermere Junction. Room 4 is booked to "A. Ren".' },
  { id: 't2', time: '23:40', text: 'Ilse washes the sleep-car hall. The floor is left wet.', requiresFlag: 'know_mop' },
  { id: 't3', time: '23:47', text: 'A hot chocolate is sold at the dining counter, signed T.K.', requiresFlag: 'ev_receipt' },
  { id: 't4', time: '23:50', text: 'The wax seal on the tour box is broken and pressed back down.', requiresFlag: 'ev_seal' },
  { id: 't5', time: '23:52', text: 'Ferrow Tunnel. The lights go out for about forty seconds.' },
  { id: 't6', time: '23:52', text: 'A small person stands at the dining counter in the dark, smelling like pine.', requiresFlag: 'ilse_told_truth' },
  { id: 't7', time: '23:53', text: 'The lights come back. The train is out of the tunnel.' },
  { id: 't8', time: '23:55', text: 'Nadia Vell is seen reading in seat 12.', requiresFlag: 'know_nadia_seen' },
  { id: 't9', time: '00:05', text: 'Bram wakes in the baggage room with cold tea and two lost hours.', requiresFlag: 'bram_told_truth' },
  { id: 't10', time: '00:10', text: 'Room 4 will not open. Staff force it. Nobody is inside.' },
];

/* ------------------------------------------------------------------ */
/* Contradictions                                                      */
/* ------------------------------------------------------------------ */

export const CONTRADICTIONS: Contradiction[] = [
  {
    id: 'c1',
    title: 'The Hall With No Big Footprints',
    characterId: 'bram',
    statementId: 'bram_patrol',
    evidenceId: 'corridor',
    quote: 'I was walking past the sleep rooms from 11:45.',
    proof:
      'That floor was washed at 23:40 and it is still wet. It has one small pair of footprints. Your boots are big and have nails.',
    conclusion: 'No conductor boots walked that hall tonight. Bram Oyelaran was never there.',
    aftermath: [
      { speaker: 'bram', emotion: 'defensive', text: 'That floor proves nothing. Floors dry.' },
      { speaker: 'ori', emotion: 'neutral', text: 'It is still wet. I checked with the back of my hand.' },
      { speaker: 'bram', emotion: 'hesitant', text: '...' },
      { speaker: 'bram', emotion: 'sad', text: 'Second night of work. I sat down for one minute in the baggage room.' },
      { speaker: 'bram', emotion: 'sad', text: 'I woke at 12:05. Cold tea. Two hours gone.' },
      { speaker: 'ori', emotion: 'neutral', text: 'Sleeping is not the same as hiding a passenger, Mr. Oyelaran.' },
      { speaker: 'bram', emotion: 'relieved', text: 'Nine weeks until I retire, kid. Nine weeks. I would have said anything.' },
    ],
    effects: {
      statements: ['bram_sleeping'],
      flags: ['bram_told_truth', 'know_mop'],
      objective: 'Two people said they were in the sleep-car hall. Only one small pair of footprints is there.',
    },
  },
  {
    id: 'c2',
    title: 'The Cufflink Behind the Crate',
    characterId: 'kass',
    statementId: 'kass_knocking',
    evidenceId: 'cufflink',
    quote: 'I was outside Room 4 the whole time, knocking.',
    proof:
      'Then explain this. Silver, with T.K. on it, behind the tour box — two cars the other way, and the seal just broken.',
    conclusion: 'Teodor Kass spent the dark in the baggage car with his hand inside a box.',
    aftermath: [
      { speaker: 'kass', emotion: 'defensive', text: 'Cufflinks move. Anyone could drop one.' },
      { speaker: 'ori', emotion: 'neutral', text: 'Your left sleeve is held with a paperclip.' },
      { speaker: 'kass', emotion: 'alarmed', text: '...' },
      { speaker: 'kass', emotion: 'sullen', text: 'Fine. The box. The violin is worth money and I owe money.' },
      { speaker: 'kass', emotion: 'sullen', text: 'I opened it to take a photo of the label. That is all I opened.' },
      { speaker: 'ori', emotion: 'neutral', text: "It's her grandmother's violin." },
      { speaker: 'kass', emotion: 'sullen', text: 'It is money I can borrow against. Write that in your little book.' },
    ],
    effects: {
      statements: ['kass_crate'],
      flags: ['kass_told_truth'],
      objective: 'Nobody honest was in the sleep-car hall. So who wore the coat?',
    },
  },
  {
    id: 'c3',
    title: 'The Coat That Fit No Grown Man',
    characterId: 'nadia',
    statementId: 'nadia_seat',
    evidenceId: 'hat',
    quote: 'Tall, bent over, grey coat, red scarf, silver cane.',
    proof:
      'The hat size is 54 — a small head. The coat was sewn smaller with new thread. The cane was cut short and the rubber tip has never touched a floor.',
    conclusion:
      '"Mr. Ren" was a costume made for someone about 1.55 metres tall who never leaned on that cane.',
    aftermath: [
      { speaker: 'nadia', emotion: 'hesitant', text: "That's... a lot of measuring for one coat." },
      { speaker: 'ori', emotion: 'neutral', text: 'You described him better than anyone on this train. Nobody else got past "grey".' },
      { speaker: 'nadia', emotion: 'avoidant', text: 'I have a good memory.' },
      { speaker: 'ori', emotion: 'neutral', text: 'You have a good imagination. That is different. The coat knows it.' },
      { speaker: 'nadia', emotion: 'hesitant', text: '...Ask me again at Hollowmere.' },
    ],
    effects: {
      evidence: ['book'],
      flags: ['know_costume', 'ready_for_reconstruction'],
      objective: 'The coat fits a small person. Rebuild the dark — press R.',
    },
  },
];

export const CONTRADICTIONS_BY_ID: Record<string, Contradiction> = Object.fromEntries(
  CONTRADICTIONS.map((c) => [c.id, c]),
);

/* ------------------------------------------------------------------ */
/* Mind Reconstruction                                                 */
/* ------------------------------------------------------------------ */

export const MOMENTS: Moment[] = [
  { id: 'before', label: 'Before the tunnel', clock: '23:47' },
  { id: 'blackout', label: 'During the blackout', clock: '23:52' },
  { id: 'after', label: 'After the lights return', clock: '23:53' },
];

export const RECON_AREAS: AreaId[] = ['passenger', 'dining', 'sleeper', 'baggage'];

export const SOLUTION: Record<CharacterId, Record<MomentId, AreaId>> = {
  bram: { before: 'baggage', blackout: 'baggage', after: 'baggage' },
  ilse: { before: 'dining', blackout: 'dining', after: 'dining' },
  kass: { before: 'dining', blackout: 'baggage', after: 'baggage' },
  nadia: { before: 'sleeper', blackout: 'dining', after: 'passenger' },
};

/**
 * Conflict rules. Each is gated behind evidence the player must already hold,
 * so the mode can never surface a fact the player has not discovered.
 */
export const CONFLICT_RULES: ConflictRule[] = [
  {
    id: 'bram_sleeper',
    requiresEvidence: ['corridor'],
    when: { characterId: 'bram', moment: 'before', area: 'sleeper' },
    message: 'The hall floor was washed at 23:40. There are no big boot prints.',
  },
  {
    id: 'bram_sleeper_2',
    requiresEvidence: ['corridor'],
    when: { characterId: 'bram', moment: 'blackout', area: 'sleeper' },
    message: 'One small pair of footprints crossed that wet floor. A conductor\'s boots left none.',
  },
  {
    id: 'bram_sleeper_3',
    requiresEvidence: ['corridor'],
    when: { characterId: 'bram', moment: 'after', area: 'sleeper' },
    message: 'Still no boot prints on the wet hall floor.',
  },
  {
    id: 'kass_sleeper_blackout',
    requiresEvidence: ['cufflink'],
    when: { characterId: 'kass', moment: 'blackout', area: 'sleeper' },
    message: 'His cufflink was behind the box in the baggage car.',
  },
  {
    id: 'kass_sleeper_after',
    requiresEvidence: ['cufflink'],
    when: { characterId: 'kass', moment: 'after', area: 'sleeper' },
    message: 'He was still in the baggage car, pressing a broken seal back down.',
  },
  {
    id: 'kass_baggage_before',
    requiresEvidence: ['receipt'],
    when: { characterId: 'kass', moment: 'before', area: 'baggage' },
    message: 'A hot chocolate receipt puts him at the dining counter at 23:47, signed T.K.',
  },
  {
    id: 'ilse_not_dining_1',
    requiresEvidence: ['tin'],
    when: { characterId: 'ilse', moment: 'before', notArea: 'dining' },
    message: 'Her cash tin and her letter were open behind the dining counter all night.',
  },
  {
    id: 'ilse_not_dining_2',
    requiresEvidence: ['tin'],
    when: { characterId: 'ilse', moment: 'blackout', notArea: 'dining' },
    message: 'Ilse never left the counter. She was counting coins in the dark.',
  },
  {
    id: 'nadia_passenger_blackout',
    requiresFlags: ['ilse_told_truth'],
    when: { characterId: 'nadia', moment: 'blackout', area: 'passenger' },
    message: 'Ilse saw a small person at the dining counter during the dark, smelling like pine.',
  },
  {
    id: 'nadia_before',
    requiresEvidence: ['ticket_ren', 'ticket_nadia'],
    when: { characterId: 'nadia', moment: 'before', notArea: 'sleeper' },
    message: 'Numbers 4416 and 4417, one minute apart, same window. The person who bought both was in Room 4.',
  },
  {
    id: 'nadia_after',
    requiresFlags: ['know_nadia_seen'],
    when: { characterId: 'nadia', moment: 'after', notArea: 'passenger' },
    message: 'Three passengers saw her reading in seat 12 at 23:55.',
  },
  {
    id: 'ilse_not_dining_3',
    requiresEvidence: ['tin'],
    when: { characterId: 'ilse', moment: 'after', notArea: 'dining' },
    message: 'Ilse was still at the counter when the lights came back. She never left.',
  },
];

/** Carriage order, used for travel-time conflicts. */
export const CARRIAGE_ORDER: AreaId[] = ['passenger', 'dining', 'sleeper', 'baggage'];

export const TRAVEL_CONFLICT_MESSAGE =
  'Nobody walks that many cars in forty seconds of total dark.';

/* ------------------------------------------------------------------ */
/* Final accusation                                                    */
/* ------------------------------------------------------------------ */

export const FINAL_QUESTIONS: FinalQuestion[] = [
  {
    id: 'q_who',
    prompt: 'Who was the passenger who never arrived?',
    options: [
      {
        id: 'a',
        text: 'Nadia Vell, wearing a costume. "A. Ren" never got on, because "A. Ren" was never a real person.',
        correct: true,
      },
      {
        id: 'b',
        text: 'A real old passenger who got off at Saltmarsh Halt.',
        rebuttal:
          'The train did not stop between 23:20 and 00:20, and the coat that man was said to wear was changed to fit someone 1.55 m tall.',
      },
      {
        id: 'c',
        text: 'Teodor Kass, travelling under a second name.',
        rebuttal:
          'Kass is 1.86 m and his cufflink puts him behind a box in the baggage car during the dark. He could not be in the coat and at the box at the same time.',
      },
      {
        id: 'd',
        text: 'Conductor Oyelaran, hiding a lost master key.',
        rebuttal:
          'He was asleep in the baggage room, and no big boots walked the wet hall. Also the hat size is 54; his cap is size 60.',
      },
    ],
  },
  {
    id: 'q_lock',
    prompt: 'How did Room 4 come to look locked?',
    options: [
      {
        id: 'a',
        text: 'The bed ladder was jammed into the sliding door track from inside, and the stiff spring pulled the door shut onto it.',
        correct: true,
      },
      {
        id: 'b',
        text: 'The conductor locked it with his master key and forgot.',
        rebuttal: 'The lock was not used. The damage is a scratch in the floor track that matches the bent ladder hook.',
      },
      {
        id: 'c',
        text: 'It was locked from inside and the passenger left through the window.',
        rebuttal: 'The window catch is painted shut and the paint is not broken. And the door was never locked — it was jammed.',
      },
      {
        id: 'd',
        text: 'There is a service hatch between rooms.',
        rebuttal: 'There is no hatch. Room 4 has four solid walls, and the clues never needed one.',
      },
    ],
  },
  {
    id: 'q_how',
    prompt: 'How was the disappearance set up?',
    options: [
      {
        id: 'a',
        text: 'During the 40-second lights-out: costume off, door jammed, coat into the laundry basket, one car forward to the dining counter.',
        correct: true,
      },
      {
        id: 'b',
        text: 'The passenger hid inside the luggage box in the baggage car.',
        rebuttal: 'The box holds a violin and was sealed until Kass broke it at 23:50. Nobody fits in it, and it is four cars away.',
      },
      {
        id: 'c',
        text: 'The passenger swapped clothes with the conductor.',
        rebuttal: 'The conductor was asleep two cars away, and his uniform is size 60 while the coat is 54.',
      },
      {
        id: 'd',
        text: 'The passenger walked the whole length of the train to the passenger car during the dark.',
        rebuttal: 'Forty seconds is not enough for four cars in the dark — and Ilse saw the person stop at her counter.',
      },
    ],
  },
  {
    id: 'q_why',
    prompt: 'Why did four people remember four different nights?',
    options: [
      {
        id: 'a',
        text: 'None of them really saw "Ren" — only a coat, a hat, a shape — and each made up an old man to match the name. Three then lied about where they were, to hide a secret that had nothing to do with the missing passenger.',
        correct: true,
      },
      {
        id: 'b',
        text: 'They were all working together to cover it up.',
        rebuttal: 'Their lies do not match. People in a plan agree on a story. These four never did.',
      },
      {
        id: 'c',
        text: 'The dark made them lose track of time.',
        rebuttal: 'The dark lasted forty seconds and happens every trip. It explains the chance, not four different faces.',
      },
      {
        id: 'd',
        text: 'One of them is lying and the other three are honest.',
        rebuttal: 'Three separate lies are proven: a walk with no footprints, a knock that was really a box, and an empty dining car that was not empty.',
      },
    ],
  },
];

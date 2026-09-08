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
    summary: 'Patrolled the sleeper corridor through the blackout',
    quote:
      '"I was walking the sleeper corridor from a quarter to twelve. In the dark I heard Compartment 4 lock — that little brass click, plain as anything."',
  },
  {
    id: 'bram_sleeping',
    characterId: 'bram',
    summary: 'Was asleep in the baggage nook — second shift running',
    quote:
      '"I sat down in the nook at half ten. Woke at five past midnight with cold tea in my hand and two hours gone. That\'s the whole of it."',
  },
  {
    id: 'ilse_galley',
    characterId: 'ilse',
    summary: 'Claims the dining car was empty and she was in the galley',
    quote: '"Empty. Galley door shut, radio on. I never saw a soul until the lights came back."',
  },
  {
    id: 'ilse_figure',
    characterId: 'ilse',
    summary: 'Saw a small figure at the counter during the blackout',
    quote:
      '"There was someone at the counter in the dark. Small — my shoulder, no taller. And the smell of pine off them, like a violin case."',
  },
  {
    id: 'kass_knocking',
    characterId: 'kass',
    summary: 'Claims he was knocking at Compartment 4',
    quote: '"I was outside Compartment 4 the whole time, knocking. Ren wouldn\'t answer. Rival scouts never do."',
  },
  {
    id: 'kass_crate',
    characterId: 'kass',
    summary: 'Admits he was opening the violin crate in the baggage carriage',
    quote: '"Fine. The crate. The instrument is an asset and I am a man with creditors. I opened it. That is all I opened."',
  },
  {
    id: 'nadia_seat',
    characterId: 'nadia',
    summary: 'Claims she never left seat 12',
    quote: '"I was reading. I didn\'t move all night. But I saw him board — tall, stooped, grey coat, red scarf, silver-topped cane."',
  },
  {
    id: 'nadia_truth',
    characterId: 'nadia',
    summary: 'Admits she was "A. Ren"',
    quote: '"There was never a Mr. Ren. There was just me, and a coat, and forty seconds of dark."',
  },
];

export const STATEMENTS_BY_ID: Record<string, Statement> = Object.fromEntries(
  STATEMENTS.map((s) => [s.id, s]),
);

/* ------------------------------------------------------------------ */
/* Timeline                                                            */
/* ------------------------------------------------------------------ */

export const TIMELINE: TimelineEntry[] = [
  { id: 't1', time: '21:10', text: 'The Meridian leaves Aldermere Junction. Compartment 4 is booked to "A. Ren".' },
  { id: 't2', time: '23:40', text: 'Ilse mops the sleeper corridor. The floor is left wet.', requiresFlag: 'know_mop' },
  { id: 't3', time: '23:47', text: 'A cocoa is sold at the dining counter, initialled T.K.', requiresFlag: 'ev_receipt' },
  { id: 't4', time: '23:50', text: 'The wax seal on the tour-company crate is broken and re-pressed.', requiresFlag: 'ev_seal' },
  { id: 't5', time: '23:52', text: 'Ferrow Tunnel. Neutral section. Every light dies for about forty seconds.' },
  { id: 't6', time: '23:52', text: 'A small figure stands at the dining counter in the dark, smelling of pine rosin.', requiresFlag: 'ilse_told_truth' },
  { id: 't7', time: '23:53', text: 'The lights return. The train is out of the tunnel.' },
  { id: 't8', time: '23:55', text: 'Nadia Vell is seen reading in seat 12.', requiresFlag: 'know_nadia_seen' },
  { id: 't9', time: '00:05', text: 'Bram wakes in the baggage nook with cold tea and two lost hours.', requiresFlag: 'bram_told_truth' },
  { id: 't10', time: '00:10', text: 'Compartment 4 will not open. Staff force it. Nobody is inside.' },
];

/* ------------------------------------------------------------------ */
/* Contradictions                                                      */
/* ------------------------------------------------------------------ */

export const CONTRADICTIONS: Contradiction[] = [
  {
    id: 'c1',
    title: 'The Corridor That Kept No Footprints',
    characterId: 'bram',
    statementId: 'bram_patrol',
    evidenceId: 'corridor',
    quote: 'I was walking the sleeper corridor from a quarter to twelve.',
    proof:
      'That floor was mopped at 23:40 and it is still damp. It holds one small pair of prints. Your boots are size 45 and hobnailed.',
    conclusion: 'Nobody in conductor\'s boots crossed that corridor tonight. Bram Oyelaran was never there.',
    aftermath: [
      { speaker: 'bram', emotion: 'defensive', text: "That floor proves nothing. Floors dry." },
      { speaker: 'ori', emotion: 'neutral', text: "It's still damp. I checked with the back of my hand." },
      { speaker: 'bram', emotion: 'hesitant', text: '...' },
      { speaker: 'bram', emotion: 'sad', text: "Second shift running. I sat down for one minute in the baggage nook." },
      { speaker: 'bram', emotion: 'sad', text: "Woke at five past midnight. Cold tea. Two hours gone out of my life." },
      { speaker: 'ori', emotion: 'neutral', text: "Sleeping isn't the same as vanishing a passenger, Mr. Oyelaran." },
      { speaker: 'bram', emotion: 'relieved', text: "Nine weeks to my pension, lad. Nine weeks. I'd have said anything." },
    ],
    effects: {
      statements: ['bram_sleeping'],
      flags: ['bram_told_truth', 'know_mop'],
      objective: 'Two witnesses put themselves in the sleeper corridor. Only one small pair of prints crossed it.',
    },
  },
  {
    id: 'c2',
    title: 'The Cufflink Behind the Crate',
    characterId: 'kass',
    statementId: 'kass_knocking',
    evidenceId: 'cufflink',
    quote: 'I was outside Compartment 4 the whole time, knocking.',
    proof:
      'Then explain this. Silver, engraved T.K., lying behind the tour-company crate — two carriages the other way, with the seal freshly broken.',
    conclusion: 'Teodor Kass spent the blackout in the baggage carriage with his hand inside a crate.',
    aftermath: [
      { speaker: 'kass', emotion: 'defensive', text: "Cufflinks travel. Anyone could drop one." },
      { speaker: 'ori', emotion: 'neutral', text: "Your left sleeve is pinned with a paperclip." },
      { speaker: 'kass', emotion: 'alarmed', text: "..." },
      { speaker: 'kass', emotion: 'sullen', text: "Fine. The crate. The instrument is an asset and I am a man with creditors." },
      { speaker: 'kass', emotion: 'sullen', text: "I opened it to photograph the label for an appraiser. That is all I opened." },
      { speaker: 'ori', emotion: 'neutral', text: "It's her grandmother's violin." },
      { speaker: 'kass', emotion: 'sullen', text: "It is collateral. Write that in your little book if it pleases you." },
    ],
    effects: {
      statements: ['kass_crate'],
      flags: ['kass_told_truth'],
      objective: 'Nobody credible was in the sleeper corridor. So who wore the coat?',
    },
  },
  {
    id: 'c3',
    title: 'The Coat That Fit Nobody',
    characterId: 'nadia',
    statementId: 'nadia_seat',
    evidenceId: 'hat',
    quote: 'Tall, stooped, grey coat, red scarf, silver-topped cane.',
    proof:
      'The hat band is stamped 54 — a small head. The coat has both shoulder seams taken in with new thread. The cane was sawn short and its rubber tip has never touched a floor.',
    conclusion:
      '"Mr. Ren" was a costume built for someone about 1.55 metres tall who never once leaned on that cane.',
    aftermath: [
      { speaker: 'nadia', emotion: 'hesitant', text: "That's... a lot of measuring for one coat." },
      { speaker: 'ori', emotion: 'neutral', text: "You described him better than anyone on this train. Nobody else got past 'grey'." },
      { speaker: 'nadia', emotion: 'avoidant', text: "I have a good memory." },
      { speaker: 'ori', emotion: 'neutral', text: "You have a good imagination. There's a difference, and the coat knows it." },
      { speaker: 'nadia', emotion: 'hesitant', text: "...Ask me again at Hollowmere." },
    ],
    effects: {
      evidence: ['book'],
      flags: ['know_costume', 'ready_for_reconstruction'],
      objective: 'The coat fits a small person. Reconstruct the blackout — press R at the sleeper compartment.',
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
    message: 'The corridor floor was mopped at 23:40 and holds no hobnailed boot prints.',
  },
  {
    id: 'bram_sleeper_2',
    requiresEvidence: ['corridor'],
    when: { characterId: 'bram', moment: 'blackout', area: 'sleeper' },
    message: 'One small pair of prints crossed that wet floor. A conductor\'s boots left none.',
  },
  {
    id: 'bram_sleeper_3',
    requiresEvidence: ['corridor'],
    when: { characterId: 'bram', moment: 'after', area: 'sleeper' },
    message: 'Still no boot prints on the damp corridor floor.',
  },
  {
    id: 'kass_sleeper_blackout',
    requiresEvidence: ['cufflink'],
    when: { characterId: 'kass', moment: 'blackout', area: 'sleeper' },
    message: 'His cufflink was lying behind the crate in the baggage carriage.',
  },
  {
    id: 'kass_sleeper_after',
    requiresEvidence: ['cufflink'],
    when: { characterId: 'kass', moment: 'after', area: 'sleeper' },
    message: 'He was still in the baggage carriage, re-pressing a broken seal.',
  },
  {
    id: 'kass_baggage_before',
    requiresEvidence: ['receipt'],
    when: { characterId: 'kass', moment: 'before', area: 'baggage' },
    message: 'A cocoa docket puts him at the dining counter at 23:47, initialled T.K.',
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
    message: 'Ilse saw a small figure at the dining counter during the blackout, smelling of pine rosin.',
  },
  {
    id: 'nadia_before',
    requiresEvidence: ['ticket_ren', 'ticket_nadia'],
    when: { characterId: 'nadia', moment: 'before', notArea: 'sleeper' },
    message: 'Serials 4416 and 4417, one minute apart, same window. The buyer of both was in Compartment 4.',
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
  'Nobody crosses that many carriage lengths in forty seconds of total darkness.';

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
        text: 'Nadia Vell, wearing a costume. "A. Ren" never boarded because "A. Ren" never existed.',
        correct: true,
      },
      {
        id: 'b',
        text: 'A real elderly passenger who slipped off at Saltmarsh Halt.',
        rebuttal:
          'The train did not stop between 23:20 and 00:20, and the coat that man supposedly wore was altered to fit someone 1.55 m tall.',
      },
      {
        id: 'c',
        text: 'Teodor Kass, travelling under a second name.',
        rebuttal:
          'Kass is 1.86 m and his cufflink puts him behind a crate in the baggage carriage during the blackout. He could not be in the coat and in the crate at once.',
      },
      {
        id: 'd',
        text: 'Conductor Oyelaran, hiding a lost master key.',
        rebuttal:
          'He was asleep in the baggage nook, and no hobnailed boots crossed the damp corridor. Also the hat band is size 54; his cap is size 60.',
      },
    ],
  },
  {
    id: 'q_lock',
    prompt: 'How did Compartment 4 come to look locked?',
    options: [
      {
        id: 'a',
        text: 'The fold-down bunk ladder was wedged into the sliding door track from inside, and the stiff replacement spring pulled the door shut onto it.',
        correct: true,
      },
      {
        id: 'b',
        text: 'The conductor locked it with his master key and forgot.',
        rebuttal: 'The lock cylinder is untouched. The damage is a gouge in the floor track that matches the bent ladder hook.',
      },
      {
        id: 'c',
        text: 'It was locked from inside and the passenger left through the window.',
        rebuttal: 'The window catch is painted shut and the paint is unbroken. And the door was never locked at all — it was jammed.',
      },
      {
        id: 'd',
        text: 'There is a service hatch between compartments.',
        rebuttal: 'There is no hatch. Compartment 4 has four solid walls, and the evidence never needed one.',
      },
    ],
  },
  {
    id: 'q_how',
    prompt: 'How was the disappearance staged?',
    options: [
      {
        id: 'a',
        text: 'During the 40-second neutral-section blackout: costume off, door jammed, coat into the linen hamper, one carriage forward to the dining counter.',
        correct: true,
      },
      {
        id: 'b',
        text: 'The passenger hid inside the luggage crate in the baggage carriage.',
        rebuttal: 'The crate holds a violin and was sealed until Kass broke it at 23:50. Nobody fits in it, and it is four carriage lengths away.',
      },
      {
        id: 'c',
        text: 'The passenger swapped clothes with the conductor.',
        rebuttal: 'The conductor was asleep two carriages away, and his uniform is size 60 to the coat\'s 54.',
      },
      {
        id: 'd',
        text: 'The passenger walked the whole length of the train to the passenger carriage during the blackout.',
        rebuttal: 'Forty seconds does not cover four carriage lengths in the dark — and Ilse saw the figure stop at her counter.',
      },
    ],
  },
  {
    id: 'q_why',
    prompt: 'Why did four witnesses remember four different nights?',
    options: [
      {
        id: 'a',
        text: 'None of them ever saw "Ren" properly — only a coat, a brim, a shape — and each invented an old man to fit the name. Three then lied about their own position to hide a secret that had nothing to do with the disappearance.',
        correct: true,
      },
      {
        id: 'b',
        text: 'They were all working together to cover it up.',
        rebuttal: 'Their lies contradict each other. Conspirators agree on a story; these four never did.',
      },
      {
        id: 'c',
        text: 'The blackout confused their sense of time.',
        rebuttal: 'The blackout lasted forty seconds and happens every run. It explains opportunity, not four different descriptions of a face.',
      },
      {
        id: 'd',
        text: 'One of them is lying and the other three are honest.',
        rebuttal: 'Three separate lies are proven: a patrol with no footprints, a knock that was really a crate, and an empty dining car that was not empty.',
      },
    ],
  },
];

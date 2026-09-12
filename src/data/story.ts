import type { Line } from './types';

export interface Stop {
  index: number;
  name: string;
  /** Announcement played when the counter advances to this stop. */
  announcement: string;
  /** Milestone flag that advances the counter to this stop. */
  milestoneFlag?: string;
  objective: string;
}

export const STOPS: Stop[] = [
  {
    index: 1,
    name: 'Aldermere Junction',
    announcement: 'Leaving Aldermere Junction. Next stop, Kestrel Bridge.',
    objective: 'Talk to all four people about the dark.',
  },
  {
    index: 2,
    name: 'Kestrel Bridge',
    announcement: 'Now coming to Kestrel Bridge. The Meridian will not stay long.',
    milestoneFlag: 'interviewed_all',
    objective: 'Four people. Four stories. Search the cars for real proof.',
  },
  {
    index: 3,
    name: 'Ferrow Tunnel Halt',
    announcement: 'Now coming to Ferrow Tunnel Halt. Watch the lights in the tunnel.',
    milestoneFlag: 'c1_done',
    objective: 'The conductor was asleep. So who was in the sleep-car hall?',
  },
  {
    index: 4,
    name: 'Saltmarsh Halt',
    announcement: 'Now coming to Saltmarsh Halt. Rain all the way to the last stop.',
    milestoneFlag: 'c2_done',
    objective: 'Nobody honest was in that hall. Find out who the coat really fits.',
  },
  {
    index: 5,
    name: 'Hollowmere',
    announcement: 'Now coming to Hollowmere. Hollowmere. This is Hollowmere.',
    milestoneFlag: 'c3_done',
    objective: 'Rebuild the dark. Press R.',
  },
  {
    index: 6,
    name: 'Vaskaya Terminus',
    announcement: 'Last stop. Vaskaya Terminus. This train ends here.',
    milestoneFlag: 'recon_solved',
    objective: 'Name the passenger who never got here.',
  },
];

export const PROLOGUE: Line[] = [
  { speaker: 'narrator', text: 'THE VASKAYA MERIDIAN — 00:14' },
  { speaker: 'narrator', text: 'Rain slides sideways on the windows. Six cars of warm light move through the dark.' },
  { speaker: 'narrator', text: 'Twenty-two minutes ago the train went into Ferrow Tunnel. Every light died for 40 seconds.' },
  { speaker: 'narrator', text: 'When the lights came back, Sleep Room 4 would not open.' },
  { speaker: 'narrator', text: 'Staff forced the door. A coat. A hat. A cane. An unmade bed.' },
  { speaker: 'narrator', text: 'And no passenger.' },
  { speaker: 'ori', emotion: 'neutral', text: 'Ori Calder. Thirteen. I was going to a science fair. I will miss it now.' },
  { speaker: 'ori', emotion: 'neutral', text: 'Four people were awake tonight. All four tell me a different story.' },
  { speaker: 'ori', emotion: 'neutral', text: 'One story is true. I have until Vaskaya to find out which.' },
  { speaker: 'narrator', text: 'WASD or arrows to move. E or Space to talk. J for the notebook.' },
];

export const HINTS: { requiresFlagsAbsent: string[]; text: string }[] = [
  {
    requiresFlagsAbsent: ['interviewed_all'],
    text: 'Four people: Nadia and Mr. Kass in the passenger car, Ilse in the dining car, Conductor Oyelaran by Room 4. Ask each about the dark.',
  },
  {
    requiresFlagsAbsent: ['ev_corridor'],
    text: 'Ilse washed the sleep-car floor at 23:40. A wet floor keeps footprints. Go look.',
  },
  {
    requiresFlagsAbsent: ['c1_done'],
    text: 'The conductor says he walked that hall. Show him the footprints. Open the notebook with J, choose Present, and pick the footprints.',
  },
  {
    requiresFlagsAbsent: ['baggage_unlocked'],
    text: 'Nobody has searched the last car. Ask Conductor Oyelaran for a key.',
  },
  {
    requiresFlagsAbsent: ['ev_cufflink'],
    text: 'Something small and metal fell behind the tour box in the baggage car.',
  },
  {
    requiresFlagsAbsent: ['c2_done'],
    text: 'Mr. Kass says he was knocking at Room 4. His left sleeve says no. Show him the cufflink.',
  },
  {
    requiresFlagsAbsent: ['ev_tin'],
    text: 'Ilse changes the subject when you ask about the counter. Look behind it.',
  },
  {
    requiresFlagsAbsent: ['ilse_told_truth'],
    text: 'Ilse is hiding her savings, not a crime. Show her the cash tin and she will tell you what she really saw.',
  },
  {
    requiresFlagsAbsent: ['ev_coat'],
    text: 'The laundry basket near the sleep rooms has grey threads on the lid.',
  },
  {
    requiresFlagsAbsent: ['c3_done'],
    text: 'The hat, the coat and the cane all fit the same small person. Show the hat to Nadia Vell.',
  },
  {
    requiresFlagsAbsent: ['know_nadia_seen'],
    text: 'The two passengers sleeping under one coat were awake at 11:55. Ask them about seat 12.',
  },
  {
    requiresFlagsAbsent: ['ev_receipt'],
    text: 'Ilse keeps every receipt on a spike at the dining counter. One of them has a time.',
  },
  {
    requiresFlagsAbsent: ['recon_solved'],
    text: 'Press R to rebuild the night. Put each person where your proof says they were, at each of the three times.',
  },
];

export const EPILOGUE: Line[] = [
  { speaker: 'narrator', text: 'HOLLOWMERE — 01:40' },
  { speaker: 'narrator', text: 'The train stops. Rule 12(b). All passengers must get off for a name check.' },
  { speaker: 'nadia', emotion: 'relieved', text: 'You could have said it in front of the guard. You said it to me first.' },
  { speaker: 'ori', emotion: 'neutral', text: 'It felt like your night to hear it.' },
  { speaker: 'nadia', emotion: 'warm', text: 'There is a kitchen light on the hill. She leaves it on every Tuesday, just in case.' },
  { speaker: 'narrator', text: '—' },
  { speaker: 'narrator', text: 'NADIA VELL gets off at Hollowmere with a violin case. No manager.' },
  { speaker: 'narrator', text: 'The railway writes A. Ren as a no-show. That is what he always was. She writes to the company herself.' },
  { speaker: 'narrator', text: '—' },
  { speaker: 'narrator', text: 'TEODOR KASS is reported for opening a sealed box.' },
  { speaker: 'kass', emotion: 'sullen', text: 'A Perrot & Sons, 1897. I only wanted a photo of the label.' },
  { speaker: 'narrator', text: 'The box goes down the steps with its owner. He rides on to Vaskaya alone, holding papers nobody needs.' },
  { speaker: 'narrator', text: '—' },
  { speaker: 'narrator', text: 'BRAM OYELARAN tells the office about the double shift, in his own writing.' },
  { speaker: 'bram', emotion: 'relieved', text: 'Turns out they blame the work plan, not the man. Thirty-one years and I never asked.' },
  { speaker: 'narrator', text: '—' },
  { speaker: 'narrator', text: 'ILSE PERROT quits at the last stop and posts her school letter the same morning.' },
  { speaker: 'ilse', emotion: 'relieved', text: 'Cormery, in the autumn. Take the last cinnamon roll. You earned a stale cake.' },
  { speaker: 'narrator', text: '—' },
  { speaker: 'narrator', text: 'ORI CALDER writes it down on the 04:20 train, in pencil, under a bad lamp.' },
  { speaker: 'ori', emotion: 'neutral', text: 'Case fourteen. The Passenger Who Never Arrived.' },
  { speaker: 'ori', emotion: 'neutral', text: 'Note on the side: not every missing person is a crime. Some people are just going home.' },
];

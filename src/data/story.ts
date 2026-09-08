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
    announcement: 'Departing Aldermere Junction. Next stop, Kestrel Bridge.',
    objective: 'Speak to all four witnesses about the blackout.',
  },
  {
    index: 2,
    name: 'Kestrel Bridge',
    announcement: 'Now approaching Kestrel Bridge. The Meridian will not be stopping long.',
    milestoneFlag: 'interviewed_all',
    objective: 'Four accounts, four different nights. Search the carriages for something solid.',
  },
  {
    index: 3,
    name: 'Ferrow Tunnel Halt',
    announcement: 'Now approaching Ferrow Tunnel Halt. Mind the lighting through the tunnel.',
    milestoneFlag: 'c1_done',
    objective: 'The conductor was asleep. So who was in the sleeper corridor?',
  },
  {
    index: 4,
    name: 'Saltmarsh Halt',
    announcement: 'Now approaching Saltmarsh Halt. Rain expected all the way to the terminus.',
    milestoneFlag: 'c2_done',
    objective: 'Nobody credible was in that corridor. Find out who the coat actually fits.',
  },
  {
    index: 5,
    name: 'Hollowmere',
    announcement: 'Now approaching Hollowmere. Hollowmere, this is Hollowmere.',
    milestoneFlag: 'c3_done',
    objective: 'Reconstruct the blackout. Press R.',
  },
  {
    index: 6,
    name: 'Vaskaya Terminus',
    announcement: 'Final approach. Vaskaya Terminus. This service terminates here.',
    milestoneFlag: 'recon_solved',
    objective: 'Name the passenger who never arrived.',
  },
];

export const PROLOGUE: Line[] = [
  { speaker: 'narrator', text: 'THE VASKAYA MERIDIAN — 00:14' },
  { speaker: 'narrator', text: 'Rain runs sideways on the windows. Six carriages of amber light dragged through a black country.' },
  { speaker: 'narrator', text: 'Twenty-two minutes ago the train went into Ferrow Tunnel and every lamp on board died for forty seconds.' },
  { speaker: 'narrator', text: 'When they came back, Sleeper Compartment 4 would not open.' },
  { speaker: 'narrator', text: 'Staff levered the door. A coat. A hat. A cane. An unmade bunk.' },
  { speaker: 'narrator', text: 'And no passenger.' },
  { speaker: 'ori', emotion: 'neutral', text: 'Ori Calder. Thirteen. Riding to a science fair I am now definitely going to miss.' },
  { speaker: 'ori', emotion: 'neutral', text: 'Four people were awake tonight. All four of them are telling me a different midnight.' },
  { speaker: 'ori', emotion: 'neutral', text: 'One of those midnights is real. I have until Vaskaya to find out which.' },
  { speaker: 'narrator', text: 'WASD or arrows to move. E or Space to interact. J for the notebook.' },
];

export const HINTS: { requiresFlagsAbsent: string[]; text: string }[] = [
  {
    requiresFlagsAbsent: ['interviewed_all'],
    text: 'Four witnesses: Nadia and Mr. Kass in the passenger carriage, Ilse in the dining car, Conductor Oyelaran by Compartment 4. Ask each about the blackout.',
  },
  {
    requiresFlagsAbsent: ['ev_corridor'],
    text: 'Ilse mopped the sleeper corridor at 23:40. A damp floor keeps a record. Go and read it.',
  },
  {
    requiresFlagsAbsent: ['c1_done'],
    text: 'The conductor says he walked that corridor. Show him what the floor says. Open the notebook with J, choose Present, and pick the footprints.',
  },
  {
    requiresFlagsAbsent: ['baggage_unlocked'],
    text: 'The last carriage has never been searched. Ask Conductor Oyelaran for a key.',
  },
  {
    requiresFlagsAbsent: ['ev_cufflink'],
    text: 'Something small and metal went down the back of the tour-company crate in the baggage carriage.',
  },
  {
    requiresFlagsAbsent: ['c2_done'],
    text: 'Mr. Kass says he was knocking at Compartment 4. His left sleeve says otherwise. Present the cufflink.',
  },
  {
    requiresFlagsAbsent: ['ev_tin'],
    text: 'Ilse changes the subject whenever the counter comes up. Look behind it.',
  },
  {
    requiresFlagsAbsent: ['ilse_told_truth'],
    text: 'Ilse is protecting her savings, not a criminal. Present the cash tin and she will tell you what she really saw.',
  },
  {
    requiresFlagsAbsent: ['ev_coat'],
    text: 'The linen hamper in the sleeper vestibule has grey fibres caught on the lid.',
  },
  {
    requiresFlagsAbsent: ['c3_done'],
    text: 'The hat, the coat and the cane all describe the same small person. Present the hat to Nadia Vell.',
  },
  {
    requiresFlagsAbsent: ['know_nadia_seen'],
    text: 'The two passengers dozing under one coat in the passenger carriage were awake at five to twelve. Ask them about seat twelve.',
  },
  {
    requiresFlagsAbsent: ['ev_receipt'],
    text: 'Ilse keeps every docket on a spike at the dining counter. One of them is timed.',
  },
  {
    requiresFlagsAbsent: ['recon_solved'],
    text: 'Press R to enter Mind Reconstruction. Place each witness where your evidence puts them, at each of the three moments.',
  },
];

export const EPILOGUE: Line[] = [
  { speaker: 'narrator', text: 'HOLLOWMERE — 01:40' },
  { speaker: 'narrator', text: 'The Meridian holds at the platform. Notice 12(b). All passengers to disembark for roll call.' },
  { speaker: 'nadia', emotion: 'relieved', text: 'You could have said it in front of the guard. You said it in front of me first.' },
  { speaker: 'ori', emotion: 'neutral', text: 'It seemed like your night to hear it.' },
  { speaker: 'nadia', emotion: 'warm', text: "There's a kitchen light on up the hill. She leaves it on every Tuesday in case." },
  { speaker: 'narrator', text: '—' },
  { speaker: 'narrator', text: 'NADIA VELL steps down at Hollowmere with a violin case and no manager.' },
  { speaker: 'narrator', text: 'The railway files A. Ren as a no-show, which is precisely what he always was. She writes to the agency herself, in her own words, at her own desk.' },
  { speaker: 'narrator', text: '—' },
  { speaker: 'narrator', text: 'TEODOR KASS is reported to the line for breaking a seal on stored property.' },
  { speaker: 'kass', emotion: 'sullen', text: 'A Perrot & Sons, 1897. I only ever wanted to photograph the label.' },
  { speaker: 'narrator', text: 'The crate goes down the steps with its owner. He rides on to Vaskaya alone, holding papers nobody needs.' },
  { speaker: 'narrator', text: '—' },
  { speaker: 'narrator', text: 'BRAM OYELARAN tells the depot about the double shift in his own handwriting.' },
  { speaker: 'bram', emotion: 'relieved', text: 'Turns out the roster gets disciplined, not the man. Thirty-one years and I never once asked.' },
  { speaker: 'narrator', text: '—' },
  { speaker: 'narrator', text: 'ILSE PERROT hands in her notice at the terminus and posts her acceptance the same morning.' },
  { speaker: 'ilse', emotion: 'relieved', text: 'Cormery, in the autumn. Take the last cinnamon twist. You have earned a stale pastry.' },
  { speaker: 'narrator', text: '—' },
  { speaker: 'narrator', text: 'ORI CALDER writes it up on the 04:20 connection, in pencil, under a bad lamp.' },
  { speaker: 'ori', emotion: 'neutral', text: 'Case fourteen. The Passenger Who Never Arrived.' },
  { speaker: 'ori', emotion: 'neutral', text: 'Note in the margin: not every disappearance is a crime. Some of them are just somebody going home.' },
];

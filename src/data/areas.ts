import type { AreaId, Difficulty, Effects, Line } from './types';

export interface Solid {
  x: number;
  y: number;
  w: number;
  h: number;
  kind: 'wall' | 'seat' | 'table' | 'counter' | 'crate' | 'bunk' | 'rack' | 'partition';
}

export interface WindowStrip {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Interactable {
  id: string;
  label: string;
  x: number;
  y: number;
  /** Radius in world pixels within which the prompt appears. */
  r?: number;
  icon?: 'search' | 'talk' | 'door';
  requiresFlags?: string[];
  /** Alternate lines shown when requirements are not met. */
  lockedLines?: Line[];
  lines: Line[];
  effects?: Effects;
  /** A second pass with different content once these flags are present. */
  followUp?: {
    requiresFlags: string[];
    lines: Line[];
    effects?: Effects;
  };
  /** Repeatable flavour once its effects have fired. */
  exhaustedLines?: Line[];
  /** Hide the amber sparkle on these difficulties. The item is still searchable. */
  hideGlintOn?: Difficulty[];
  /** Only placed on these difficulties. */
  onlyOn?: Difficulty[];
}

export interface Area {
  id: AreaId;
  name: string;
  subtitle: string;
  width: number;
  height: number;
  /** Ambient light tint multiplier for the carriage. */
  lamp: number;
  solids: Solid[];
  windows: WindowStrip[];
  interactables: Interactable[];
  /** Neighbouring areas reachable through the end doors. */
  leftDoor?: { to: AreaId; requiresFlags?: string[]; lockedText?: string };
  rightDoor?: { to: AreaId; requiresFlags?: string[]; lockedText?: string };
  /** Lamp positions for the warm amber pools on the floor. */
  lamps: number[];
}

const W = 720;
const H = 270;

/** Height of the drawn upper wall band; also the collision ceiling. */
export const WALL_TOP = 56;
/** Y coordinate where the lower wall band begins. */
export const WALL_BOTTOM = 222;

/** Outer hull shared by every carriage: top wall, bottom wall, end caps. */
function hull(): Solid[] {
  return [
    { x: 0, y: 0, w: W, h: WALL_TOP, kind: 'wall' },
    { x: 0, y: WALL_BOTTOM, w: W, h: H - WALL_BOTTOM, kind: 'wall' },
    { x: 0, y: 0, w: 14, h: H, kind: 'wall' },
    { x: W - 14, y: 0, w: 14, h: H, kind: 'wall' },
  ];
}

function windowRow(y: number, h: number, count: number): WindowStrip[] {
  const strips: WindowStrip[] = [];
  const span = (W - 80) / count;
  for (let i = 0; i < count; i++) {
    strips.push({ x: 40 + i * span + 6, y, w: span - 20, h });
  }
  return strips;
}

/* ================================================================== */
/* 1. PASSENGER CARRIAGE                                              */
/* ================================================================== */

const passenger: Area = {
  id: 'passenger',
  name: 'Passenger Carriage',
  subtitle: 'Coach B — seats 1 to 24',
  width: W,
  height: H,
  lamp: 1,
  lamps: [110, 260, 410, 560, 680],
  solids: [
    ...hull(),
    // Luggage racks hugging the upper wall.
    { x: 60, y: 56, w: 120, h: 8, kind: 'rack' },
    { x: 240, y: 56, w: 120, h: 8, kind: 'rack' },
    { x: 420, y: 56, w: 120, h: 8, kind: 'rack' },
    { x: 580, y: 56, w: 100, h: 8, kind: 'rack' },
    // Upper seat bays.
    { x: 70, y: 62, w: 60, h: 34, kind: 'seat' },
    { x: 190, y: 62, w: 60, h: 34, kind: 'seat' },
    { x: 310, y: 62, w: 60, h: 34, kind: 'seat' },
    { x: 430, y: 62, w: 60, h: 34, kind: 'seat' },
    { x: 550, y: 62, w: 60, h: 34, kind: 'seat' },
    // Lower seat bays.
    { x: 110, y: 186, w: 60, h: 34, kind: 'seat' },
    { x: 230, y: 186, w: 60, h: 34, kind: 'seat' },
    { x: 350, y: 186, w: 60, h: 34, kind: 'seat' },
    { x: 470, y: 186, w: 60, h: 34, kind: 'seat' },
    { x: 590, y: 186, w: 60, h: 34, kind: 'seat' },
  ],
  windows: [...windowRow(14, 26, 5), ...windowRow(232, 26, 5)],
  interactables: [
    {
      id: 'timetable',
      label: 'Timetable frame',
      x: 40,
      y: 60,
      lines: [
        { speaker: 'narrator', text: 'A brass frame beside the door. Six stops, and a notice stuck crooked at the bottom.' },
        { speaker: 'narrator', text: '"FERROW TUNNEL — NEUTRAL SECTION. Carriage lighting will be lost for 38–42 seconds. This is normal."' },
        { speaker: 'ori', emotion: 'neutral', text: 'Normal. Planned. Every single trip.' },
        { speaker: 'ori', emotion: 'neutral', text: '(Anyone who rides this line knows when the dark comes, and how long it lasts.)' },
      ],
      effects: { evidence: ['neutral_section'] },
      exhaustedLines: [{ speaker: 'narrator', text: 'Six stops. Forty seconds of dark between four and five.' }],
    },
    {
      id: 'seat12',
      label: 'Seat 12',
      x: 150,
      y: 200,
      requiresFlags: ['met_nadia'],
      lockedLines: [{ speaker: 'narrator', text: 'Someone is sitting here. It is rude to search before you say hello.' }],
      lines: [
        { speaker: 'narrator', text: 'A book bag, a folded blanket, and something white stuck behind the seat.' },
        { speaker: 'narrator', text: 'A ticket stub. Seat 12. Number 4416. Aldermere, window 2, 20:57.' },
        { speaker: 'ori', emotion: 'neutral', text: 'Window two. 20:57.' },
        { speaker: 'ori', emotion: 'neutral', text: '(I have seen that window and that time somewhere else tonight.)', punch: true },
      ],
      effects: { evidence: ['ticket_nadia'] },
      exhaustedLines: [{ speaker: 'narrator', text: 'Seat 12. A book that has not turned a page in an hour.' }],
    },
    {
      id: 'nadiabag',
      label: "Nadia's book bag",
      x: 180,
      y: 200,
      hideGlintOn: ['hard'],
      requiresFlags: ['know_costume'],
      lockedLines: [{ speaker: 'narrator', text: 'Her bag. Not without a reason, and not without asking.' }],
      lines: [
        { speaker: 'narrator', text: 'She lets you look. Inside: sheet music, a used rosin block, and a children\'s book.' },
        { speaker: 'narrator', text: '"The Wandering Ren." Inside the cover, in pencil: for Nadia, from Gran.' },
        { speaker: 'ori', emotion: 'neutral', text: '(Ren. He leaves every town before anyone can keep him.)', punch: true },
      ],
      effects: { evidence: ['book'] },
      exhaustedLines: [{ speaker: 'narrator', text: 'Rosin worn down. Somebody plays every single day.' }],
    },
    {
      id: 'dozers',
      label: 'Two dozing passengers',
      x: 500,
      y: 200,
      onlyOn: ['easy', 'normal'],
      requiresFlags: ['nadia_alibi'],
      lockedLines: [{ speaker: 'narrator', text: 'Two passengers asleep under one coat. Let them be, for now.' }],
      lines: [
        { speaker: 'narrator', text: 'They wake up slowly.' },
        { speaker: 'ori', emotion: 'neutral', text: 'Did you notice the girl in seat twelve tonight?' },
        { speaker: 'narrator', text: '"Reading. Same as always. She was there at five to twelve — I checked my watch and wished I was her."' },
        { speaker: 'ori', emotion: 'neutral', text: '(23:55. Seat twelve. Three people said this. They have no reason to lie.)' },
      ],
      effects: { flags: ['know_nadia_seen'] },
      exhaustedLines: [{ speaker: 'narrator', text: 'Asleep again already.' }],
    },
    {
      id: 'aisle_man',
      label: 'Man across the aisle',
      x: 500,
      y: 200,
      onlyOn: ['hard'],
      requiresFlags: ['nadia_alibi'],
      lockedLines: [{ speaker: 'narrator', text: 'He has his hat over his face. Ask the girl first.' }],
      lines: [
        { speaker: 'narrator', text: 'He lifts the hat a little. He does not like questions.' },
        { speaker: 'ori', emotion: 'neutral', text: 'The girl in seat twelve. After the lights.' },
        { speaker: 'narrator', text: '"Reading. Same book. I saw her at five to twelve. That is all I give you."' },
        { speaker: 'ori', emotion: 'neutral', text: '(23:55. Seat twelve. One witness who will not say more.)' },
      ],
      effects: { flags: ['know_nadia_seen'] },
      exhaustedLines: [{ speaker: 'narrator', text: 'The hat is back down.' }],
    },
    {
      id: 'rack',
      label: 'Luggage rack',
      x: 300,
      y: 60,
      hideGlintOn: ['normal', 'hard'],
      lines: [
        { speaker: 'narrator', text: 'Hat boxes, a cello case, a birdcage with a small bird that looks annoyed.' },
        { speaker: 'ori', emotion: 'neutral', text: 'No grey coat up here.' },
      ],
    },
    {
      id: 'window_p',
      label: 'Rain-streaked window',
      x: 620,
      y: 66,
      hideGlintOn: ['normal', 'hard'],
      lines: [
        { speaker: 'narrator', text: 'Rain runs sideways on the glass. Outside: dark fields and a few farm lights.' },
        { speaker: 'ori', emotion: 'neutral', text: 'Nobody stepped off this train. Not at seventy miles an hour, in the rain, with a cane.' },
      ],
    },
  ],
  rightDoor: { to: 'dining' },
};

/* ================================================================== */
/* 2. DINING CARRIAGE                                                 */
/* ================================================================== */

const dining: Area = {
  id: 'dining',
  name: 'Dining Carriage',
  subtitle: 'Coach C — service until midnight',
  width: W,
  height: H,
  lamp: 1.08,
  lamps: [120, 300, 480, 640],
  solids: [
    ...hull(),
    // Service counter along the upper wall.
    { x: 240, y: 56, w: 200, h: 34, kind: 'counter' },
    { x: 60, y: 56, w: 120, h: 12, kind: 'rack' },
    { x: 500, y: 56, w: 140, h: 12, kind: 'rack' },
    // Dining tables with benches.
    { x: 90, y: 110, w: 54, h: 30, kind: 'table' },
    { x: 210, y: 160, w: 54, h: 30, kind: 'table' },
    { x: 340, y: 160, w: 54, h: 30, kind: 'table' },
    { x: 470, y: 110, w: 54, h: 30, kind: 'table' },
    { x: 580, y: 160, w: 54, h: 30, kind: 'table' },
  ],
  windows: [...windowRow(14, 26, 5), ...windowRow(232, 26, 5)],
  interactables: [
    {
      id: 'counter',
      label: 'Behind the service counter',
      x: 300,
      y: 96,
      hideGlintOn: ['hard'],
      lines: [
        { speaker: 'narrator', text: 'Behind the counter, under a folded cloth: a tin heavy with coins.' },
        { speaker: 'narrator', text: 'On top of it, an opened letter. Cormery Cooking School. "...pleased to offer you a place..."' },
        { speaker: 'ori', emotion: 'neutral', text: '(Not train money. Her own. About eleven months of it, by the look of the tin.)' },
        { speaker: 'ori', emotion: 'neutral', text: '(This is a secret. It is almost certainly not the secret.)' },
      ],
      effects: { evidence: ['tin'] },
      exhaustedLines: [{ speaker: 'narrator', text: 'The tin is back under its cloth where it belongs.' }],
    },
    {
      id: 'spike',
      label: 'Receipt spike',
      x: 400,
      y: 96,
      hideGlintOn: ['normal', 'hard'],
      lines: [
        { speaker: 'narrator', text: 'A steel spike full of tonight\'s receipts. You look at the last few.' },
        { speaker: 'narrator', text: 'One hot chocolate. 23:47. Signed in a hurry: T.K.' },
        { speaker: 'ori', emotion: 'neutral', text: 'Five minutes before the tunnel, Mr. Kass was standing right here.' },
      ],
      effects: { evidence: ['receipt'] },
      exhaustedLines: [{ speaker: 'narrator', text: 'Cocoa. 23:47. T.K.' }],
    },
    {
      id: 'radio',
      label: 'Counter radio',
      x: 240,
      y: 96,
      hideGlintOn: ['normal', 'hard'],
      lines: [
        { speaker: 'narrator', text: 'An old radio with a cracked dial. The plug is lying loose on the shelf.' },
        { speaker: 'ori', emotion: 'neutral', text: 'Not plugged in. Not tonight, not for a long time.' },
      ],
      effects: { flags: ['know_radio_dead'] },
    },
    {
      id: 'floor_d',
      label: 'Floor by the counter',
      x: 340,
      y: 130,
      hideGlintOn: ['normal', 'hard'],
      lines: [
        { speaker: 'narrator', text: 'A smear of pale powder on the floor, the size of a thumbprint. It smells a little like pine.' },
        { speaker: 'ori', emotion: 'neutral', text: '(Somebody stood here. Somebody who carries rosin.)' },
      ],
      effects: { flags: ['know_dining_rosin'] },
    },
    {
      id: 'window_d',
      label: 'Window over the tables',
      x: 620,
      y: 90,
      hideGlintOn: ['normal', 'hard'],
      lines: [
        { speaker: 'narrator', text: 'The glass is fogged from the kitchen. Someone drew a music note in it and half rubbed it out.' },
      ],
    },
  ],
  leftDoor: { to: 'passenger' },
  rightDoor: { to: 'sleeper' },
};

/* ================================================================== */
/* 3. SLEEPER CARRIAGE                                                */
/* ================================================================== */

const sleeper: Area = {
  id: 'sleeper',
  name: 'Sleeper Carriage',
  subtitle: 'Coach D — compartments 1 to 8',
  width: W,
  height: H,
  lamp: 0.86,
  lamps: [90, 240, 400, 560, 680],
  solids: [
    ...hull(),
    // Compartment block along the upper wall, with a gap for Compartment 4.
    { x: 14, y: 56, w: 186, h: 60, kind: 'partition' },
    { x: 380, y: 56, w: 326, h: 60, kind: 'partition' },
    // Compartment 4 interior: bunk against the left wall, table on the right.
    { x: 204, y: 60, w: 30, h: 50, kind: 'bunk' },
    { x: 344, y: 60, w: 28, h: 22, kind: 'table' },
    // Vestibule linen hamper.
    { x: 40, y: 130, w: 34, h: 26, kind: 'crate' },
  ],
  windows: [{ x: 250, y: 14, w: 80, h: 26 }, ...windowRow(232, 26, 5)],
  interactables: [
    {
      id: 'comp4door',
      label: 'Room 4 door',
      x: 290,
      y: 126,
      r: 46,
      lines: [
        { speaker: 'narrator', text: 'The sliding door hangs open four centimetres and no more. Staff had to force it.' },
        { speaker: 'narrator', text: 'The bed ladder lies across the doorway. The top hook is bent sideways.' },
        { speaker: 'narrator', text: 'In the floor track there is a fresh bright scratch. You lay the hook against it. It fits like a key.' },
        { speaker: 'ori', emotion: 'neutral', text: 'The lock never turned. Somebody jammed this door from the inside and let it slam onto the ladder.', punch: true },
        { speaker: 'ori', emotion: 'neutral', text: '(A locked room that was never locked. Just held shut.)' },
      ],
      effects: { evidence: ['ladder'], flags: ['know_jam'] },
      exhaustedLines: [{ speaker: 'narrator', text: 'The scratch in the track still matches the bent hook exactly.' }],
    },
    {
      id: 'comp4table',
      label: 'Room table',
      x: 356,
      y: 88,
      r: 72,
      lines: [
        { speaker: 'narrator', text: 'A folding table with a water glass, unused, and a ticket stub lined up neat to the edge.' },
        { speaker: 'narrator', text: 'Room 4. A. Ren. Number 4417. Aldermere, window 2, 20:58.' },
        { speaker: 'ori', emotion: 'neutral', text: 'Paid in coins. Lined up on the table like a clue.' },
      ],
      effects: { evidence: ['ticket_ren'] },
      exhaustedLines: [{ speaker: 'narrator', text: 'Serial 4417. Window 2. 20:58.' }],
    },
    {
      id: 'comp4hook',
      hideGlintOn: ['hard'],
      label: 'Coat hook',
      x: 218,
      y: 68,
      r: 72,
      lines: [
        { speaker: 'narrator', text: 'A wide-brim hat hangs alone on the hook. You turn it over.' },
        { speaker: 'narrator', text: 'The inner band is stamped 54.' },
        { speaker: 'ori', emotion: 'neutral', text: 'Fifty-four. That is a small head. My head is fifty-three.', punch: true },
      ],
      effects: { evidence: ['hat'] },
      exhaustedLines: [{ speaker: 'narrator', text: 'Band size 54. It would sit on your ears.' }],
    },
    {
      id: 'comp4floor',
      hideGlintOn: ['hard'],
      label: 'Under the bunk',
      x: 214,
      y: 112,
      r: 72,
      lines: [
        { speaker: 'narrator', text: 'A walking cane lies under the bunk. Silver top, dark wood — and a cut joint under the shine.' },
        { speaker: 'narrator', text: 'It has been cut shorter by about fifteen centimetres. The rubber tip still looks brand new.' },
        { speaker: 'ori', emotion: 'neutral', text: 'Never leaned on. This cane has never met a floor.' },
      ],
      effects: { evidence: ['cane'] },
      exhaustedLines: [{ speaker: 'narrator', text: 'A shorter cane with a new tip.' }],
    },
    {
      id: 'comp4window',
      hideGlintOn: ['normal', 'hard'],
      label: 'Room window',
      x: 290,
      y: 62,
      r: 60,
      lines: [
        { speaker: 'narrator', text: 'The window catch is painted over — six coats of railway cream, unbroken.' },
        { speaker: 'ori', emotion: 'neutral', text: 'Nobody opened this. Nobody left this way.' },
      ],
      effects: { flags: ['know_window_sealed'] },
    },
    {
      id: 'corridorfloor',
      hideGlintOn: ['hard'],
      label: 'Corridor floor',
      x: 190,
      y: 170,
      lines: [
        { speaker: 'narrator', text: 'A mop bucket stands at the end of the hall with a card on the handle: WASHED 23:40 — MIND THE FLOOR.' },
        { speaker: 'narrator', text: 'You put the back of your hand on the floor. Still cold. Still a little wet.' },
        { speaker: 'narrator', text: 'Along the whole wet floor: one pair of footprints. Small. Narrow. Smooth shoes.' },
        { speaker: 'ori', emotion: 'neutral', text: 'One pair. Not one big boot print anywhere.', punch: true },
        { speaker: 'ori', emotion: 'neutral', text: '(Somebody who says he walked this hall did not walk this hall.)' },
      ],
      effects: { evidence: ['corridor'], flags: ['know_mop'] },
      exhaustedLines: [{ speaker: 'narrator', text: 'Still wet. Still one small pair of footprints.' }],
    },
    {
      id: 'hamper',
      hideGlintOn: ['normal', 'hard'],
      label: 'Laundry basket',
      x: 57,
      y: 162,
      lines: [
        { speaker: 'narrator', text: 'A wicker laundry basket at the end of the hall. Caught on the lid: three grey coat fibres.' },
        { speaker: 'narrator', text: 'You dig. Under two sheets and a pillowcase, folded fast and badly: a grey coat.' },
        { speaker: 'narrator', text: 'Both shoulders have been sewn smaller. The new thread is bright and the sewing is not neat.' },
        { speaker: 'ori', emotion: 'neutral', text: 'A big coat, made smaller for a small person. Six metres from Room 4.', punch: true },
      ],
      effects: { evidence: ['coat'], flags: ['know_hamper'] },
      followUp: {
        requiresFlags: ['ev_coat'],
        lines: [
          { speaker: 'narrator', text: 'You turn the collar out under the hall lamp. Pale powder is deep in the cloth.' },
          { speaker: 'narrator', text: 'You rub it between finger and thumb. Sticky. Sharp. Pine.' },
          { speaker: 'ori', emotion: 'neutral', text: 'Rosin. The stuff you rub on violin strings.', punch: true },
        ],
        effects: { evidence: ['rosin'] },
      },
      exhaustedLines: [{ speaker: 'narrator', text: 'Sheets, a pillowslip, and the ghost of pine.' }],
    },
    {
      id: 'roster',
      hideGlintOn: ['normal', 'hard'],
      label: 'Roster board',
      x: 100,
      y: 136,
      lines: [
        { speaker: 'narrator', text: 'A chalk work list screwed to the wall.' },
        { speaker: 'narrator', text: 'OYELARAN — TUE NIGHT. OYELARAN — WED NIGHT.' },
        { speaker: 'ori', emotion: 'neutral', text: 'Two nights in a row. That is a man who is worn out.' },
      ],
      effects: { flags: ['know_roster'] },
    },
  ],
  leftDoor: { to: 'dining' },
  rightDoor: {
    to: 'baggage',
    requiresFlags: ['baggage_unlocked'],
    lockedText: 'Locked. A staff key would open it — Conductor Oyelaran has one.',
  },
};

/* ================================================================== */
/* 4. BAGGAGE CARRIAGE                                                */
/* ================================================================== */

const baggage: Area = {
  id: 'baggage',
  name: 'Baggage Carriage',
  subtitle: 'Coach E — staff and stored luggage',
  width: W,
  height: H,
  lamp: 0.7,
  lamps: [140, 380, 620],
  solids: [
    ...hull(),
    { x: 60, y: 56, w: 90, h: 50, kind: 'crate' },
    { x: 170, y: 56, w: 60, h: 40, kind: 'crate' },
    { x: 270, y: 60, w: 110, h: 56, kind: 'crate' },
    { x: 420, y: 56, w: 70, h: 44, kind: 'crate' },
    { x: 100, y: 170, w: 120, h: 44, kind: 'crate' },
    { x: 300, y: 176, w: 80, h: 38, kind: 'crate' },
    { x: 470, y: 168, w: 60, h: 46, kind: 'crate' },
    // Staff nook.
    { x: 590, y: 56, w: 90, h: 34, kind: 'table' },
  ],
  windows: [{ x: 500, y: 232, w: 60, h: 26 }, { x: 120, y: 232, w: 60, h: 26 }],
  interactables: [
    {
      id: 'crate',
      hideGlintOn: ['hard'],
      label: 'Tour-company crate',
      x: 325,
      y: 124,
      lines: [
        { speaker: 'narrator', text: 'A slim wooden box marked KASS ARTIST MANAGEMENT — FRAGILE — INSTRUMENT.' },
        { speaker: 'narrator', text: 'The wax seal on the lid is cracked all the way through, then pressed back down. Crooked. Still soft enough to dent.' },
        { speaker: 'ori', emotion: 'neutral', text: 'Broken and sealed again within the hour. By somebody who owns the stamp.' },
      ],
      effects: { evidence: ['seal'] },
      exhaustedLines: [{ speaker: 'narrator', text: 'The seal sits crooked over its own crack.' }],
    },
    {
      id: 'behindcrate',
      hideGlintOn: ['normal', 'hard'],
      label: 'Gap behind the crate',
      x: 385,
      y: 100,
      lines: [
        { speaker: 'narrator', text: 'You reach down the back of the box and your fingers close on something cold.' },
        { speaker: 'narrator', text: 'A silver cufflink. It says: T.K.' },
        { speaker: 'ori', emotion: 'neutral', text: 'And a certain manager is holding his left sleeve together with a paperclip.', punch: true },
      ],
      effects: { evidence: ['cufflink'] },
      exhaustedLines: [{ speaker: 'narrator', text: 'Dust, a lost button, and the memory of a cufflink.' }],
    },
    {
      id: 'nook',
      hideGlintOn: ['hard'],
      label: 'Staff nook',
      x: 620,
      y: 100,
      lines: [
        { speaker: 'narrator', text: 'A folding stool, a hook, and a tin mug of tea with a cold skin on it.' },
        { speaker: 'narrator', text: 'A conductor\'s cap hangs on the hook. Size 60, stamped inside the band.' },
        { speaker: 'narrator', text: 'The stool cushion still holds the shape of somebody who sat in it a long, long time.' },
        { speaker: 'ori', emotion: 'neutral', text: 'Somebody spent most of tonight in this corner. Not walking a hall.' },
      ],
      effects: { flags: ['know_nook'] },
      exhaustedLines: [{ speaker: 'narrator', text: 'Cold tea. A size 60 cap. A very sat-in cushion.' }],
    },
    {
      id: 'notice',
      label: 'Framed regulations',
      x: 140,
      y: 130,
      lines: [
        { speaker: 'narrator', text: 'A framed sheet of railway regulations, fly-specked and yellow.' },
        { speaker: 'narrator', text: 'NOTICE 12(b): Where a passenger is reported missing in transit, the service shall hold at the next station. ALL PASSENGERS SHALL DISEMBARK TO THE PLATFORM FOR ROLL CALL.' },
        { speaker: 'ori', emotion: 'neutral', text: 'All passengers. Off the train. Onto the platform.' },
        { speaker: 'ori', emotion: 'neutral', text: '(If somebody wanted off this train and could not just walk off... that rule is a door.)', punch: true },
      ],
      effects: { flags: ['know_rule'] },
      exhaustedLines: [{ speaker: 'narrator', text: 'Notice 12(b). All passengers shall disembark to the platform.' }],
    },
    {
      id: 'hamperspare',
      label: 'Stored luggage',
      x: 160,
      y: 140,
      lines: [
        { speaker: 'narrator', text: 'Trunks, a bicycle, a box of live chickens that would rather you left them alone.' },
        { speaker: 'ori', emotion: 'neutral', text: 'Nowhere in here would hide a grown man for two hours. Or a small one.' },
      ],
    },
  ],
  leftDoor: { to: 'sleeper' },
};

export const AREAS: Record<AreaId, Area> = { passenger, dining, sleeper, baggage };

export const AREA_ORDER: AreaId[] = ['passenger', 'dining', 'sleeper', 'baggage'];

export const AREA_NAMES: Record<AreaId, string> = {
  passenger: 'Passenger Carriage',
  dining: 'Dining Carriage',
  sleeper: 'Sleeper Carriage',
  baggage: 'Baggage Carriage',
};

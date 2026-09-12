import type { Character } from './types';

/**
 * The four witnesses. Every claim here is deliberately consistent with
 * docs/CASE-DESIGN.md — including the lies.
 */
export const CHARACTERS: Character[] = [
  /* ---------------------------------------------------------------- */
  {
    id: 'bram',
    name: 'Bram Oyelaran',
    role: 'Night conductor',
    age: 54,
    profile: 'He has worked this night train for 31 years. He checks tickets and looks very tired.',
    profileReveals: [
      { flag: 'bram_tired', text: 'He rubs his eyes a lot. He says work hours are "not your business".' },
      { flag: 'bram_told_truth', text: 'He was asleep in the baggage room from 22:30 to 00:05. Second night of work. He retires in nine weeks.' },
    ],
    home: 'sleeper',
    x: 120,
    y: 168,
    palette: { skin: '#8a5a3b', hair: '#2a2a33', coat: '#26324f', coatDark: '#18213a', accent: '#d9a441' },
    face: { hairStyle: 'cap', height: 'tall' },
    greeting: [
      { speaker: 'bram', emotion: 'neutral', text: 'This hall is closed, kid. Staff only.' },
      { speaker: 'ori', emotion: 'neutral', text: "I'm Ori Calder. I look at things. That's my job." },
      { speaker: 'bram', emotion: 'neutral', text: '...You are thirteen.' },
      { speaker: 'ori', emotion: 'neutral', text: "I've been looking at things for a long time." },
    ],
    topics: [
      {
        id: 'bram.alibi',
        label: 'Where were you during the blackout?',
        once: true,
        lines: [
          { speaker: 'bram', emotion: 'neutral', text: 'Working. Where else?' },
          { speaker: 'bram', emotion: 'neutral', text: 'I was walking past the sleep rooms from 11:45. Right past that door.' },
          { speaker: 'bram', emotion: 'defensive', text: 'In the dark I heard Room 4 lock. That small click. I know that sound.' },
          { speaker: 'ori', emotion: 'neutral', text: '(He said that very fast. He did not look at me.)' },
        ],
        effects: {
          statements: ['bram_patrol'],
          flags: ['interviewed_bram', 'bram_alibi'],
          unlockTopics: ['bram.click', 'bram.key'],
        },
      },
      {
        id: 'bram.ren',
        label: 'What do you know about the missing passenger?',
        once: true,
        lines: [
          { speaker: 'bram', emotion: 'neutral', text: 'Room 4. Booked to A. Ren from Aldermere. He paid with coins.' },
          { speaker: 'ori', emotion: 'neutral', text: 'What did he look like?' },
          { speaker: 'bram', emotion: 'hesitant', text: 'Grey coat. Big hat. I took his ticket through a small gap. He never opened the door wide.' },
          { speaker: 'bram', emotion: 'neutral', text: 'His voice was quiet. He said "thank you" and that was all.' },
          { speaker: 'ori', emotion: 'neutral', text: '(Nobody on this train has seen that man\'s face. Not even the man who took his ticket.)' },
        ],
        effects: { flags: ['bram_ren', 'know_no_face'] },
      },
      {
        id: 'bram.click',
        label: 'You heard the lock click? In the dark?',
        requiresFlags: ['bram_alibi'],
        once: true,
        lines: [
          { speaker: 'bram', emotion: 'defensive', text: 'I know that sound. I have heard it for 31 years.' },
          { speaker: 'ori', emotion: 'neutral', text: 'How long were the lights off?' },
          { speaker: 'bram', emotion: 'hesitant', text: 'About 40 seconds. It happens every time at Ferrow Tunnel.' },
          { speaker: 'bram', emotion: 'hesitant', text: 'Look — I have a train to run. Can we finish this?' },
        ],
        effects: { flags: ['bram_click', 'know_blackout_length'], unlockTopics: ['bram.tired'] },
      },
      {
        id: 'bram.tired',
        label: 'You look like you have not slept.',
        requiresFlags: ['bram_click'],
        once: true,
        lines: [
          { speaker: 'bram', emotion: 'defensive', text: 'I look how I look.' },
          { speaker: 'ori', emotion: 'neutral', text: 'The work board has your name on Tuesday and Wednesday.' },
          { speaker: 'bram', emotion: 'defensive', text: 'The work board is not your business.' },
          { speaker: 'ori', emotion: 'neutral', text: '(He is hiding something. That does not mean he took the passenger.)' },
        ],
        effects: { flags: ['bram_tired'] },
      },
      {
        id: 'bram.key',
        label: 'Can you let me into the baggage carriage?',
        requiresFlags: ['bram_alibi', 'bram_ren'],
        once: true,
        lines: [
          { speaker: 'bram', emotion: 'neutral', text: 'No.' },
          { speaker: 'ori', emotion: 'neutral', text: 'A passenger is missing. Nobody has looked in the last car yet.' },
          { speaker: 'bram', emotion: 'hesitant', text: '...' },
          { speaker: 'bram', emotion: 'hesitant', text: 'Take the spare key. Do not touch anything. If anyone asks, you found it on the floor.' },
          { speaker: 'ori', emotion: 'neutral', text: '(He gave me the key very fast for a man who says no.)' },
        ],
        effects: { flags: ['baggage_unlocked'], objective: 'The baggage carriage is open. Search it.' },
      },
      {
        id: 'bram.revisit',
        label: 'What was wrong with that door?',
        requiresFlags: ['bram_told_truth'],
        revisit: true,
        once: true,
        lines: [
          { speaker: 'bram', emotion: 'relieved', text: 'It would not slide. It opened a little, then it stuck.' },
          { speaker: 'bram', emotion: 'neutral', text: 'We put a new spring on that door last month. It slams shut by itself.' },
          { speaker: 'ori', emotion: 'neutral', text: 'And the lock?' },
          { speaker: 'bram', emotion: 'neutral', text: 'Nobody turned it. I checked. The lock is clean.' },
          { speaker: 'ori', emotion: 'neutral', text: '(So it was not locked. Something was holding it.)' },
        ],
        effects: { flags: ['know_spring'] },
      },
    ],
    presents: [
      {
        evidenceId: 'corridor',
        breakthrough: true,
        lines: [{ speaker: 'ori', emotion: 'neutral', text: 'Mr. Oyelaran. Look at the floor.' }],
        effects: { contradiction: 'c1' },
      },
      {
        evidenceId: 'ladder',
        lines: [
          { speaker: 'bram', emotion: 'alarmed', text: 'That ladder is badly bent. That needs a repair report.' },
          { speaker: 'bram', emotion: 'neutral', text: 'And a scratch in the door track. Something was stuck in there.' },
        ],
      },
      {
        evidenceId: 'neutral_section',
        lines: [
          { speaker: 'bram', emotion: 'neutral', text: 'Yes. The dark stretch. Every trip for 11 years. Forty seconds of no lights.' },
        ],
      },
    ],
    presentMiss: [
      { speaker: 'bram', emotion: 'neutral', text: 'What do you want me to do with that?' },
    ],
  },

  /* ---------------------------------------------------------------- */
  {
    id: 'ilse',
    name: 'Ilse Perrot',
    role: 'Dining attendant',
    age: 33,
    profile: 'She runs the dining car alone. She smells like butter and spice.',
    profileReveals: [
      { flag: 'ilse_flustered', text: 'She changes the subject when you ask about the counter.' },
      { flag: 'ilse_told_truth', text: 'She sells her own cakes in secret to pay for cooking school. She was at the counter all night — and she saw someone.' },
    ],
    home: 'dining',
    x: 300,
    y: 150,
    palette: { skin: '#e8b98d', hair: '#7a3f2a', coat: '#b8623c', coatDark: '#8a4529', accent: '#f2e2c4' },
    face: { hairStyle: 'bun', height: 'medium' },
    greeting: [
      { speaker: 'ilse', emotion: 'warm', text: 'The kitchen is closed. There is one cinnamon roll left. It is getting hard.' },
      { speaker: 'ori', emotion: 'neutral', text: "I'm looking into Room 4." },
      { speaker: 'ilse', emotion: 'warm', text: 'Eat first. You think worse when you are hungry.' },
    ],
    topics: [
      {
        id: 'ilse.alibi',
        label: 'Where were you during the blackout?',
        once: true,
        lines: [
          { speaker: 'ilse', emotion: 'neutral', text: 'Here. Well — in the back kitchen.' },
          { speaker: 'ilse', emotion: 'avoidant', text: 'Door shut. Radio on. The car was empty. I saw no one until the lights came back.' },
          { speaker: 'ori', emotion: 'neutral', text: 'You were up front earlier, though.' },
          { speaker: 'ilse', emotion: 'neutral', text: 'I washed the sleep-car floor at 11:40. Someone walked cocoa all down it.' },
          { speaker: 'ori', emotion: 'neutral', text: '(A wet floor at 23:40. Wet floors keep footprints.)' },
        ],
        effects: {
          statements: ['ilse_galley'],
          flags: ['interviewed_ilse', 'ilse_alibi', 'know_mop'],
          unlockTopics: ['ilse.radio'],
        },
      },
      {
        id: 'ilse.ren',
        label: 'Did the missing passenger come in here?',
        once: true,
        lines: [
          { speaker: 'ilse', emotion: 'neutral', text: 'Never. Not once. People in the sleep rooms usually want tea.' },
          { speaker: 'ilse', emotion: 'neutral', text: 'I did serve the tall man. The manager. Hot chocolate, 11:50, in a hurry.' },
          { speaker: 'ori', emotion: 'neutral', text: 'Do you keep the receipts?' },
          { speaker: 'ilse', emotion: 'warm', text: 'On the spike. I keep everything.' },
        ],
        effects: { flags: ['ilse_ren', 'know_cocoa'] },
      },
      {
        id: 'ilse.radio',
        label: 'What was on the radio?',
        requiresFlags: ['ilse_alibi'],
        once: true,
        lines: [
          { speaker: 'ilse', emotion: 'avoidant', text: 'Music. The late show.' },
          { speaker: 'ori', emotion: 'neutral', text: 'The radio behind you is cracked. It is not plugged in.' },
          { speaker: 'ilse', emotion: 'alarmed', text: '...' },
          { speaker: 'ilse', emotion: 'avoidant', text: 'It is an old radio. I am tired. Anything else?' },
          { speaker: 'ori', emotion: 'neutral', text: '(She is hiding something. That does not mean she hid a person.)' },
        ],
        effects: { flags: ['ilse_flustered'], unlockTopics: ['ilse.counter'] },
      },
      {
        id: 'ilse.counter',
        label: 'You were at the counter, right?',
        requiresFlags: ['ilse_flustered'],
        once: true,
        lines: [
          { speaker: 'ilse', emotion: 'alarmed', text: 'Why would I stand at my own counter in the dark?' },
          { speaker: 'ori', emotion: 'neutral', text: "That's what I want to know." },
          { speaker: 'ilse', emotion: 'defensive', text: 'The back kitchen. I said the back kitchen. Please.' },
        ],
        effects: { flags: ['ilse_pressed'] },
      },
      {
        id: 'ilse.figure',
        label: 'Tell me about that person again.',
        requiresFlags: ['ilse_told_truth'],
        revisit: true,
        once: true,
        lines: [
          { speaker: 'ilse', emotion: 'relieved', text: 'Small. No taller than my shoulder. Breathing hard, like they had been running.' },
          { speaker: 'ori', emotion: 'neutral', text: 'And the smell?' },
          { speaker: 'ilse', emotion: 'neutral', text: 'Pine. Sharp pine. My uncle played cello. A violin case smells like that.' },
          { speaker: 'ilse', emotion: 'neutral', text: 'They stood for about ten seconds. When the lights came back, they went forward.' },
          { speaker: 'ori', emotion: 'neutral', text: '(Forward. Toward the passenger car.)' },
        ],
        effects: { flags: ['know_figure_details'] },
      },
    ],
    presents: [
      {
        evidenceId: 'tin',
        breakthrough: true,
        lines: [
          { speaker: 'ori', emotion: 'neutral', text: 'I found this behind the counter. I have not told anyone.' },
          { speaker: 'ilse', emotion: 'alarmed', text: 'That is mine. Please. That is not train money. I bake those myself—' },
          { speaker: 'ori', emotion: 'neutral', text: 'Cormery Cooking School. That is a good school.' },
          { speaker: 'ilse', emotion: 'sad', text: 'Eleven months of coins. If the company finds out, I lose this job before I get the school place.' },
          { speaker: 'ori', emotion: 'neutral', text: 'I am not here about cakes. I am here about a coat.' },
          { speaker: 'ilse', emotion: 'relieved', text: '...Then I was at the counter. Counting money. Not in the back kitchen.' },
          { speaker: 'ilse', emotion: 'hesitant', text: 'And someone stood at the counter with me in the dark. Small. Smelling like pine.' },
          { speaker: 'ori', emotion: 'neutral', text: '(Small. Nobody has said that about Mr. Ren.)', punch: true },
        ],
        effects: {
          statements: ['ilse_figure'],
          flags: ['ilse_told_truth'],
          unlockTopics: ['ilse.figure'],
          objective: 'A small person stood in the dining car when the lights were out. Find out how small "Mr. Ren" really was.',
        },
      },
      {
        evidenceId: 'receipt',
        lines: [
          { speaker: 'ilse', emotion: 'neutral', text: 'That is my writing. Hot chocolate, 11:50. He took it and went that way — toward the back.' },
          { speaker: 'ori', emotion: 'neutral', text: 'The back. Toward the baggage car.' },
        ],
        effects: { flags: ['know_kass_went_back'] },
      },
      {
        evidenceId: 'coat',
        lines: [
          { speaker: 'ilse', emotion: 'alarmed', text: 'That came out of my laundry basket?' },
          { speaker: 'ilse', emotion: 'neutral', text: 'I emptied that at 11:00. Whatever went in went in after that.' },
        ],
        effects: { flags: ['know_hamper_time'] },
      },
    ],
    presentMiss: [{ speaker: 'ilse', emotion: 'warm', text: 'I sell food, not answers. Try Bram.' }],
  },

  /* ---------------------------------------------------------------- */
  {
    id: 'kass',
    name: 'Teodor Kass',
    role: 'Tour manager',
    age: 46,
    profile: 'He travels with papers and a nice coat. He is taking Nadia Vell to Vaskaya.',
    profileReveals: [
      { flag: 'kass_pressed', text: 'He gets angry if you call him a guardian. He says he is a manager, not a babysitter.' },
      { flag: 'kass_told_truth', text: 'During the dark he was in the baggage car, opening the box with Nadia\'s grandmother\'s violin. He owes a lot of money.' },
    ],
    home: 'passenger',
    x: 380,
    y: 120,
    palette: { skin: '#dcae86', hair: '#1e1e26', coat: '#3a2b46', coatDark: '#261a30', accent: '#c9c2d8' },
    face: { hairStyle: 'slick', height: 'tall' },
    greeting: [
      { speaker: 'kass', emotion: 'neutral', text: 'If you are selling tickets, I have no coins and no time.' },
      { speaker: 'ori', emotion: 'neutral', text: "I'm asking about Room 4." },
      { speaker: 'kass', emotion: 'neutral', text: 'Ah. The missing man. Two minutes. Then I am done.' },
    ],
    topics: [
      {
        id: 'kass.alibi',
        label: 'Where were you during the blackout?',
        once: true,
        lines: [
          { speaker: 'kass', emotion: 'neutral', text: 'Outside Room 4. The whole time. Knocking.' },
          { speaker: 'ori', emotion: 'neutral', text: 'Knocking on a stranger\'s door at midnight?' },
          { speaker: 'kass', emotion: 'defensive', text: 'Ren is a talent scout. Another company. I know the type. They book a sleep room so nobody sees them work.' },
          { speaker: 'kass', emotion: 'neutral', text: 'He would not answer. They never do.' },
        ],
        effects: {
          statements: ['kass_knocking'],
          flags: ['interviewed_kass', 'kass_alibi'],
          unlockTopics: ['kass.rival'],
        },
      },
      {
        id: 'kass.ren',
        label: 'What do you know about Mr. Ren?',
        once: true,
        lines: [
          { speaker: 'kass', emotion: 'defensive', text: 'He booked the room next to my client. That is enough.' },
          { speaker: 'ori', emotion: 'neutral', text: 'Have you seen his face?' },
          { speaker: 'kass', emotion: 'neutral', text: 'A hat brim and a coat collar. That is how I would travel if I wanted to steal a young player.' },
        ],
        effects: { flags: ['kass_ren'] },
      },
      {
        id: 'kass.rival',
        label: 'A talent scout on a night train. Really?',
        requiresFlags: ['kass_alibi'],
        once: true,
        lines: [
          { speaker: 'kass', emotion: 'defensive', text: 'You do not know this job.' },
          { speaker: 'ori', emotion: 'neutral', text: 'Then why does your left sleeve have a paperclip where a cuff button should be?' },
          { speaker: 'kass', emotion: 'alarmed', text: '...' },
          { speaker: 'kass', emotion: 'defensive', text: 'Laundry. Next question.' },
        ],
        effects: { flags: ['kass_pressed', 'know_paperclip'], unlockTopics: ['kass.nadia'] },
      },
      {
        id: 'kass.nadia',
        label: 'Why are you traveling with Nadia Vell?',
        requiresFlags: ['kass_pressed'],
        once: true,
        lines: [
          { speaker: 'kass', emotion: 'neutral', text: 'She signs in Vaskaya. Five years. Forty cities. It will make her famous.' },
          { speaker: 'ori', emotion: 'neutral', text: 'Does she want that?' },
          { speaker: 'kass', emotion: 'defensive', text: 'She is 16. Wanting is not a plan.' },
          { speaker: 'kass', emotion: 'neutral', text: 'I keep her papers until the last stop. For her safety, of course.' },
          { speaker: 'ori', emotion: 'neutral', text: '(So she cannot get off the train by herself.)' },
        ],
        effects: { flags: ['know_papers', 'know_contract'] },
      },
      {
        id: 'kass.revisit',
        label: 'About the box.',
        requiresFlags: ['kass_told_truth'],
        revisit: true,
        once: true,
        lines: [
          { speaker: 'kass', emotion: 'sullen', text: 'A Perrot & Sons, 1897. Her grandmother\'s. Worth more than my flat.' },
          { speaker: 'ori', emotion: 'neutral', text: 'And you were taking a photo of the label to sell it.' },
          { speaker: 'kass', emotion: 'sullen', text: 'I did not leave that car until the lights came back. Then I heard shouting up front.' },
          { speaker: 'ori', emotion: 'neutral', text: '(So he was far from Room 4. He is hiding money trouble. He did not hide a passenger.)' },
        ],
        effects: { flags: ['know_violin'] },
      },
    ],
    presents: [
      {
        evidenceId: 'cufflink',
        breakthrough: true,
        lines: [{ speaker: 'ori', emotion: 'neutral', text: 'Mr. Kass. Hold out your left wrist.' }],
        effects: { contradiction: 'c2' },
      },
      {
        evidenceId: 'seal',
        lines: [
          { speaker: 'kass', emotion: 'alarmed', text: 'That is company wax. Where did you—' },
          { speaker: 'kass', emotion: 'defensive', text: 'Seals break. Trains shake. It means nothing.' },
        ],
      },
      {
        evidenceId: 'ticket_ren',
        lines: [{ speaker: 'kass', emotion: 'neutral', text: 'Paid with coins. That is a scout, for sure.' }],
      },
    ],
    presentMiss: [{ speaker: 'kass', emotion: 'defensive', text: 'Put that away. I am not here to look at things.' }],
  },

  /* ---------------------------------------------------------------- */
  {
    id: 'nadia',
    name: 'Nadia Vell',
    role: 'Violinist, 16',
    age: 16,
    profile: 'Seat 12. She holds a book but does not turn the pages. She is going to sign a five-year deal.',
    profileReveals: [
      { flag: 'nadia_vivid', text: 'She is the only person who can describe "Mr. Ren" in detail — after one look.' },
      { flag: 'know_gran', text: 'Her grandmother lives at Hollowmere, stop five. Her violin was made by Perrot & Sons.' },
      { flag: 'know_costume', text: 'About 1.55 m tall. She uses violin powder every day. She asked to talk again at Hollowmere.' },
    ],
    home: 'passenger',
    x: 150,
    y: 176,
    palette: { skin: '#f0c9a4', hair: '#3f2b52', coat: '#4c5f8a', coatDark: '#33416b', accent: '#e0d5f0' },
    face: { hairStyle: 'short', height: 'small' },
    greeting: [
      { speaker: 'nadia', emotion: 'warm', text: 'You are the one walking car to car with a notebook.' },
      { speaker: 'ori', emotion: 'neutral', text: 'Ori Calder. You noticed.' },
      { speaker: 'nadia', emotion: 'warm', text: 'I notice things too. Ask me anything.' },
      { speaker: 'ori', emotion: 'neutral', text: '(Nobody has ever said that to me before.)' },
    ],
    topics: [
      {
        id: 'nadia.alibi',
        label: 'Where were you during the blackout?',
        once: true,
        lines: [
          { speaker: 'nadia', emotion: 'warm', text: 'Seat 12. I have not moved since Kestrel Bridge.' },
          { speaker: 'nadia', emotion: 'neutral', text: 'I was reading. The dark did not bother me. It was only a moment.' },
          { speaker: 'ori', emotion: 'neutral', text: 'Forty seconds.' },
          { speaker: 'nadia', emotion: 'neutral', text: 'If you say so.' },
        ],
        effects: {
          statements: ['nadia_seat'],
          flags: ['interviewed_nadia', 'nadia_alibi', 'met_nadia'],
          unlockTopics: ['nadia.detail'],
        },
      },
      {
        id: 'nadia.ren',
        label: 'Did you see the missing passenger?',
        once: true,
        lines: [
          { speaker: 'nadia', emotion: 'warm', text: 'Once, when he got on at Aldermere.' },
          { speaker: 'nadia', emotion: 'neutral', text: 'Tall. Bent over, like his back hurt. Grey coat. Red scarf pulled up high.' },
          { speaker: 'nadia', emotion: 'neutral', text: 'A cane with a silver top in his right hand. He set it down softly, like it cost a lot.' },
          { speaker: 'ori', emotion: 'neutral', text: '(Bram only said "grey coat, big hat". She described a whole person.)', punch: true },
        ],
        effects: { flags: ['nadia_vivid', 'met_nadia'], unlockTopics: ['nadia.detail'] },
      },
      {
        id: 'nadia.detail',
        label: 'That is a lot of detail for one look.',
        requiresFlags: ['nadia_vivid'],
        once: true,
        lines: [
          { speaker: 'nadia', emotion: 'hesitant', text: 'Is remembering a crime now?' },
          { speaker: 'ori', emotion: 'neutral', text: 'It is, when nobody else can do it.' },
          { speaker: 'nadia', emotion: 'avoidant', text: 'Musicians remember things. That is the job.' },
          { speaker: 'ori', emotion: 'neutral', text: '(She is nervous. That is not proof. Come back later.)' },
        ],
        effects: { flags: ['nadia_pressed'], unlockTopics: ['nadia.music'] },
      },
      {
        id: 'nadia.music',
        label: 'Is the violin in the baggage carriage yours?',
        requiresFlags: ['nadia_pressed'],
        once: true,
        lines: [
          { speaker: 'nadia', emotion: 'sad', text: 'My grandmother\'s. Perrot & Sons. She taught me on it in her kitchen at Hollowmere.' },
          { speaker: 'ori', emotion: 'neutral', text: 'Hollowmere is stop five.' },
          { speaker: 'nadia', emotion: 'sad', text: 'I know which stop it is.' },
          { speaker: 'nadia', emotion: 'hesitant', text: 'Mr. Kass keeps the box closed. And my papers. And the plan. And most other things.' },
        ],
        effects: { flags: ['know_gran'] },
      },
      {
        id: 'nadia.revisit',
        label: 'About the man in the grey coat.',
        requiresFlags: ['know_costume'],
        revisit: true,
        once: true,
        lines: [
          { speaker: 'nadia', emotion: 'hesitant', text: 'You already know. I can see it on your face.' },
          { speaker: 'ori', emotion: 'neutral', text: 'I know the shape of it. I want the whole story, said out loud.' },
          { speaker: 'nadia', emotion: 'sad', text: 'Then build it. Properly. Every minute, in order.' },
          { speaker: 'nadia', emotion: 'sad', text: 'If you can do that, I will not lie to you again.' },
        ],
        effects: { objective: 'Nadia will confirm nothing until the night is reconstructed. Press R.' },
      },
    ],
    presents: [
      {
        evidenceId: 'hat',
        breakthrough: true,
        lines: [{ speaker: 'ori', emotion: 'neutral', text: 'The hat band is stamped 54.' }],
        effects: { contradiction: 'c3' },
      },
      {
        evidenceId: 'coat',
        lines: [
          { speaker: 'nadia', emotion: 'hesitant', text: 'That is his coat. Where was it?' },
          { speaker: 'ori', emotion: 'neutral', text: 'The laundry basket. Six metres from his door.' },
          { speaker: 'nadia', emotion: 'avoidant', text: 'How strange.' },
          { speaker: 'ori', emotion: 'neutral', text: '(She did not ask what happened to the man who wore it.)', punch: true },
        ],
        effects: { flags: ['nadia_slip'] },
      },
      {
        evidenceId: 'cane',
        lines: [
          { speaker: 'nadia', emotion: 'hesitant', text: 'He set it down so carefully. I remember that.' },
          { speaker: 'ori', emotion: 'neutral', text: 'The tip has never touched a floor. And it was cut short.' },
          { speaker: 'nadia', emotion: 'avoidant', text: 'People cut canes shorter. For... packing.' },
        ],
      },
      {
        evidenceId: 'ticket_nadia',
        lines: [
          { speaker: 'nadia', emotion: 'neutral', text: 'My ticket. Yes. Seat 12.' },
          { speaker: 'ori', emotion: 'neutral', text: 'Number 4416.' },
          { speaker: 'nadia', emotion: 'hesitant', text: 'Numbers are not proof of anything.' },
        ],
      },
      {
        evidenceId: 'book',
        lines: [
          { speaker: 'nadia', emotion: 'sad', text: 'Gran read me that until I was nine. The Wandering Ren.' },
          { speaker: 'nadia', emotion: 'sad', text: 'He leaves every town before anyone can keep him.' },
        ],
      },
    ],
    presentMiss: [{ speaker: 'nadia', emotion: 'warm', text: 'I do not know what that is. Honest.' }],
  },
];

export const CHARACTERS_BY_ID = Object.fromEntries(CHARACTERS.map((c) => [c.id, c])) as Record<
  string,
  Character
>;

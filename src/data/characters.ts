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
    profile: 'Thirty-one years on the Meridian line. Punches tickets like he is signing them.',
    profileReveals: [
      { flag: 'bram_tired', text: 'Rubs his eyes constantly. Says the roster is "a matter for the depot".' },
      { flag: 'bram_told_truth', text: 'Was asleep in the baggage nook from 22:30 to 00:05. Second shift running. Nine weeks from a pension.' },
    ],
    home: 'sleeper',
    x: 120,
    y: 168,
    palette: { skin: '#8a5a3b', hair: '#2a2a33', coat: '#26324f', coatDark: '#18213a', accent: '#d9a441' },
    face: { hairStyle: 'cap', height: 'tall' },
    greeting: [
      { speaker: 'bram', emotion: 'neutral', text: 'Corridor is closed, lad. Staff only past the tape.' },
      { speaker: 'ori', emotion: 'neutral', text: "I'm Ori Calder. I notice things for a living." },
      { speaker: 'bram', emotion: 'neutral', text: '...You are thirteen.' },
      { speaker: 'ori', emotion: 'neutral', text: "I've been noticing things for a while." },
    ],
    topics: [
      {
        id: 'bram.alibi',
        label: 'Where were you during the blackout?',
        once: true,
        lines: [
          { speaker: 'bram', emotion: 'neutral', text: 'Working. Where else.' },
          { speaker: 'bram', emotion: 'neutral', text: 'I was walking the sleeper corridor from a quarter to twelve. Right past that door.' },
          { speaker: 'bram', emotion: 'defensive', text: 'In the dark I heard Compartment 4 lock. That little brass click, plain as anything.' },
          { speaker: 'ori', emotion: 'neutral', text: '(He said that very fast, and he said it to my shoes.)' },
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
          { speaker: 'bram', emotion: 'neutral', text: 'Compartment 4. Booked to A. Ren out of Aldermere. Paid in coin.' },
          { speaker: 'ori', emotion: 'neutral', text: 'What did he look like?' },
          { speaker: 'bram', emotion: 'hesitant', text: 'Grey coat. Big hat. I punched his ticket through the door gap — he never opened it properly.' },
          { speaker: 'bram', emotion: 'neutral', text: 'Voice was muffled. Polite, though. Said "thank you, conductor" and that was that.' },
          { speaker: 'ori', emotion: 'neutral', text: "(Nobody on this train has seen that man's face. Including the man who took his ticket.)" },
        ],
        effects: { flags: ['bram_ren', 'know_no_face'] },
      },
      {
        id: 'bram.click',
        label: 'You heard the lock click — in total darkness?',
        requiresFlags: ['bram_alibi'],
        once: true,
        lines: [
          { speaker: 'bram', emotion: 'defensive', text: 'I know that sound. Thirty-one years of that sound.' },
          { speaker: 'ori', emotion: 'neutral', text: 'And the lights were out for how long?' },
          { speaker: 'bram', emotion: 'hesitant', text: 'Forty seconds. Give or take. It does that at Ferrow, every run.' },
          { speaker: 'bram', emotion: 'hesitant', text: "Look — is this going to take much longer? I've a train to run." },
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
          { speaker: 'ori', emotion: 'neutral', text: "Your roster board in the vestibule has your name on Tuesday and Wednesday." },
          { speaker: 'bram', emotion: 'defensive', text: 'The roster is a matter for the depot. Not for you.' },
          { speaker: 'ori', emotion: 'neutral', text: '(Defensive is not guilty. Write it down. Do not underline it.)' },
        ],
        effects: { flags: ['bram_tired'] },
      },
      {
        id: 'bram.key',
        label: 'Can you let me into the baggage carriage?',
        requiresFlags: ['bram_alibi', 'bram_ren'],
        once: true,
        lines: [
          { speaker: 'bram', emotion: 'neutral', text: 'Absolutely not.' },
          { speaker: 'ori', emotion: 'neutral', text: 'A passenger is missing and the last carriage has not been searched.' },
          { speaker: 'bram', emotion: 'hesitant', text: '...' },
          { speaker: 'bram', emotion: 'hesitant', text: 'Take the spare. Touch nothing. And if anyone asks, you found it on the floor.' },
          { speaker: 'ori', emotion: 'neutral', text: '(He handed that over awfully quickly for a man who guards a corridor.)' },
        ],
        effects: { flags: ['baggage_unlocked'], objective: 'The baggage carriage is open. Search it.' },
      },
      {
        id: 'bram.revisit',
        label: 'About that door — what was wrong with it?',
        requiresFlags: ['bram_told_truth'],
        revisit: true,
        once: true,
        lines: [
          { speaker: 'bram', emotion: 'relieved', text: 'Wouldn\'t slide. Opened four centimetres and stuck like it was nailed.' },
          { speaker: 'bram', emotion: 'neutral', text: 'We put a new closing spring on that door last month. Stiff as a mousetrap. Slams itself shut.' },
          { speaker: 'ori', emotion: 'neutral', text: 'And the lock?' },
          { speaker: 'bram', emotion: 'neutral', text: 'Never turned. I checked the cylinder myself after. Clean as the day it went in.' },
          { speaker: 'ori', emotion: 'neutral', text: '(So it was not locked. It was held.)' },
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
          { speaker: 'bram', emotion: 'alarmed', text: 'That ladder is bent to blazes. That is a maintenance report, that is.' },
          { speaker: 'bram', emotion: 'neutral', text: 'And a gouge in the track. Something was jammed in there.' },
        ],
      },
      {
        evidenceId: 'neutral_section',
        lines: [
          { speaker: 'bram', emotion: 'neutral', text: 'Aye, the neutral section. Every run for eleven years. Forty seconds of nothing.' },
        ],
      },
    ],
    presentMiss: [
      { speaker: 'bram', emotion: 'neutral', text: 'And what am I meant to do with that?' },
    ],
  },

  /* ---------------------------------------------------------------- */
  {
    id: 'ilse',
    name: 'Ilse Perrot',
    role: 'Dining attendant',
    age: 33,
    profile: 'Runs the dining carriage alone. Smells permanently of butter and cardamom.',
    profileReveals: [
      { flag: 'ilse_flustered', text: 'Changes the subject whenever the counter comes up.' },
      { flag: 'ilse_told_truth', text: 'Sells her own pastries off the books to pay for the Cormery Culinary School. Was at the counter all night — and saw someone.' },
    ],
    home: 'dining',
    x: 300,
    y: 150,
    palette: { skin: '#e8b98d', hair: '#7a3f2a', coat: '#b8623c', coatDark: '#8a4529', accent: '#f2e2c4' },
    face: { hairStyle: 'bun', height: 'medium' },
    greeting: [
      { speaker: 'ilse', emotion: 'warm', text: 'Kitchen is shut, but there is one cinnamon twist left and it is going stale alone.' },
      { speaker: 'ori', emotion: 'neutral', text: "I'm looking into Compartment 4." },
      { speaker: 'ilse', emotion: 'warm', text: 'Then eat first. Detectives think worse hungry.' },
    ],
    topics: [
      {
        id: 'ilse.alibi',
        label: 'Where were you during the blackout?',
        once: true,
        lines: [
          { speaker: 'ilse', emotion: 'neutral', text: 'Here. Well — through there. The galley.' },
          { speaker: 'ilse', emotion: 'avoidant', text: 'Door shut, radio on. The car was empty. I never saw a soul until the lights came back.' },
          { speaker: 'ori', emotion: 'neutral', text: 'You had been up front earlier, though.' },
          { speaker: 'ilse', emotion: 'neutral', text: 'Mopping the sleeper corridor at twenty to twelve. Somebody tracked cocoa the length of it.' },
          { speaker: 'ori', emotion: 'neutral', text: '(A wet floor at 23:40. That floor remembers things.)' },
        ],
        effects: {
          statements: ['ilse_galley'],
          flags: ['interviewed_ilse', 'ilse_alibi', 'know_mop'],
          unlockTopics: ['ilse.radio'],
        },
      },
      {
        id: 'ilse.ren',
        label: 'Did the missing passenger ever come in here?',
        once: true,
        lines: [
          { speaker: 'ilse', emotion: 'neutral', text: 'Never. Not once. Sleeper passengers usually want tea at least.' },
          { speaker: 'ilse', emotion: 'neutral', text: 'I did serve the tall one. The manager. Cocoa, ten to midnight, in a hurry.' },
          { speaker: 'ori', emotion: 'neutral', text: 'Do you keep the dockets?' },
          { speaker: 'ilse', emotion: 'warm', text: 'On the spike. I keep everything. Ask my landlord.' },
        ],
        effects: { flags: ['ilse_ren', 'know_cocoa'] },
      },
      {
        id: 'ilse.radio',
        label: 'What was on the radio?',
        requiresFlags: ['ilse_alibi'],
        once: true,
        lines: [
          { speaker: 'ilse', emotion: 'avoidant', text: 'Music. The... late programme.' },
          { speaker: 'ori', emotion: 'neutral', text: 'The set behind you has a cracked dial and no plug.' },
          { speaker: 'ilse', emotion: 'alarmed', text: '...' },
          { speaker: 'ilse', emotion: 'avoidant', text: 'It is a very old radio and I am a very tired woman. Was there anything else?' },
          { speaker: 'ori', emotion: 'neutral', text: '(Avoiding a subject is not the same as hiding a crime. But it is worth a second look.)' },
        ],
        effects: { flags: ['ilse_flustered'], unlockTopics: ['ilse.counter'] },
      },
      {
        id: 'ilse.counter',
        label: 'You were at the counter, were you not?',
        requiresFlags: ['ilse_flustered'],
        once: true,
        lines: [
          { speaker: 'ilse', emotion: 'alarmed', text: 'Why would I stand at my own counter in the pitch dark?' },
          { speaker: 'ori', emotion: 'neutral', text: "That's what I'd like to know." },
          { speaker: 'ilse', emotion: 'defensive', text: 'Galley. I said galley. Please.' },
        ],
        effects: { flags: ['ilse_pressed'] },
      },
      {
        id: 'ilse.figure',
        label: 'Tell me about the figure again.',
        requiresFlags: ['ilse_told_truth'],
        revisit: true,
        once: true,
        lines: [
          { speaker: 'ilse', emotion: 'relieved', text: 'Small. My shoulder, no taller. Breathing hard, like they had run.' },
          { speaker: 'ori', emotion: 'neutral', text: 'And the smell?' },
          { speaker: 'ilse', emotion: 'neutral', text: 'Pine. Sharp, sticky pine. My uncle played cello — a violin case smells exactly like that.' },
          { speaker: 'ilse', emotion: 'neutral', text: 'They stood ten seconds and went forward when the lights came up.' },
          { speaker: 'ori', emotion: 'neutral', text: '(Forward. Towards the passenger carriage.)' },
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
          { speaker: 'ilse', emotion: 'alarmed', text: 'That is mine. That is — please, that is not railway money, I bake those myself, on my own flour—' },
          { speaker: 'ori', emotion: 'neutral', text: 'Cormery Culinary School. That is a very good school.' },
          { speaker: 'ilse', emotion: 'sad', text: 'Eleven months of coins. If the company hears, I lose the job before I ever get the place.' },
          { speaker: 'ori', emotion: 'neutral', text: 'I am not here about pastries. I am here about a coat.' },
          { speaker: 'ilse', emotion: 'relieved', text: '...Then I was at the counter. Counting. Not the galley.' },
          { speaker: 'ilse', emotion: 'hesitant', text: 'And there was someone at the counter with me in the dark. Small. Smelling of pine.' },
          { speaker: 'ori', emotion: 'neutral', text: '(Small. Nobody has ever said that about Mr. Ren.)', punch: true },
        ],
        effects: {
          statements: ['ilse_figure'],
          flags: ['ilse_told_truth'],
          unlockTopics: ['ilse.figure'],
          objective: 'A small figure stood in the dining car during the blackout. Find out how small "Mr. Ren" really was.',
        },
      },
      {
        evidenceId: 'receipt',
        lines: [
          { speaker: 'ilse', emotion: 'neutral', text: 'That is my hand. Cocoa, ten to midnight. He took it and went that way — towards the back.' },
          { speaker: 'ori', emotion: 'neutral', text: 'The back. Towards the baggage carriage.' },
        ],
        effects: { flags: ['know_kass_went_back'] },
      },
      {
        evidenceId: 'coat',
        lines: [
          { speaker: 'ilse', emotion: 'alarmed', text: 'That came out of my linen hamper? My hamper?' },
          { speaker: 'ilse', emotion: 'neutral', text: 'I emptied that at eleven. Whatever went in went in after.' },
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
    profile: 'Travels with a contract folder and a very good coat. Escorting Nadia Vell to Vaskaya.',
    profileReveals: [
      { flag: 'kass_pressed', text: 'Bristles at the word "guardian". Says he is "a manager, not a nanny".' },
      { flag: 'kass_told_truth', text: 'Spent the blackout in the baggage carriage opening the crate that holds Nadia\'s grandmother\'s violin. Deeply in debt.' },
    ],
    home: 'passenger',
    x: 380,
    y: 120,
    palette: { skin: '#dcae86', hair: '#1e1e26', coat: '#3a2b46', coatDark: '#261a30', accent: '#c9c2d8' },
    face: { hairStyle: 'slick', height: 'tall' },
    greeting: [
      { speaker: 'kass', emotion: 'neutral', text: 'If you are selling raffle tickets, I have no small change and less patience.' },
      { speaker: 'ori', emotion: 'neutral', text: "I'm asking about Compartment 4." },
      { speaker: 'kass', emotion: 'neutral', text: 'Ah. The vanishing act. Two minutes, then.' },
    ],
    topics: [
      {
        id: 'kass.alibi',
        label: 'Where were you during the blackout?',
        once: true,
        lines: [
          { speaker: 'kass', emotion: 'neutral', text: 'Outside Compartment 4. The whole time. Knocking.' },
          { speaker: 'ori', emotion: 'neutral', text: 'Knocking on a stranger\'s door at midnight?' },
          { speaker: 'kass', emotion: 'defensive', text: 'Ren is a scout. Rival agency. I know the type — they book sleepers so nobody sees them working.' },
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
        label: 'What do you actually know about Mr. Ren?',
        once: true,
        lines: [
          { speaker: 'kass', emotion: 'defensive', text: 'That he booked the compartment beside my client. That is enough to know.' },
          { speaker: 'ori', emotion: 'neutral', text: 'Have you seen his face?' },
          { speaker: 'kass', emotion: 'neutral', text: 'A brim and a collar. Which, frankly, is how I would travel if I were poaching a prodigy.' },
        ],
        effects: { flags: ['kass_ren'] },
      },
      {
        id: 'kass.rival',
        label: 'A scout on a sleeper train. Really?',
        requiresFlags: ['kass_alibi'],
        once: true,
        lines: [
          { speaker: 'kass', emotion: 'defensive', text: 'You have no idea what this industry is.' },
          { speaker: 'ori', emotion: 'neutral', text: 'Then why does your left sleeve have a paperclip where a cufflink should be?' },
          { speaker: 'kass', emotion: 'alarmed', text: '...' },
          { speaker: 'kass', emotion: 'defensive', text: 'Laundry. Next question.' },
        ],
        effects: { flags: ['kass_pressed', 'know_paperclip'], unlockTopics: ['kass.nadia'] },
      },
      {
        id: 'kass.nadia',
        label: 'Why are you travelling with Nadia Vell?',
        requiresFlags: ['kass_pressed'],
        once: true,
        lines: [
          { speaker: 'kass', emotion: 'neutral', text: 'She signs at Vaskaya. Five years, forty cities. It is the making of her.' },
          { speaker: 'ori', emotion: 'neutral', text: 'Does she want to?' },
          { speaker: 'kass', emotion: 'defensive', text: 'She is sixteen. Wanting is not a business model.' },
          { speaker: 'kass', emotion: 'neutral', text: 'I hold her papers until the terminus. For her safety, obviously.' },
          { speaker: 'ori', emotion: 'neutral', text: '(So she cannot get off the train. Not on her own, anyway.)' },
        ],
        effects: { flags: ['know_papers', 'know_contract'] },
      },
      {
        id: 'kass.revisit',
        label: 'About the crate.',
        requiresFlags: ['kass_told_truth'],
        revisit: true,
        once: true,
        lines: [
          { speaker: 'kass', emotion: 'sullen', text: 'A Perrot & Sons, 1897. Her grandmother\'s. Worth more than my flat.' },
          { speaker: 'ori', emotion: 'neutral', text: 'And you were photographing the label for an appraiser.' },
          { speaker: 'kass', emotion: 'sullen', text: 'I never left that carriage until the lights came back and I heard shouting up front.' },
          { speaker: 'ori', emotion: 'neutral', text: '(Which means he was four carriage lengths from Compartment 4. He is a thief, but he is not my thief.)' },
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
          { speaker: 'kass', emotion: 'defensive', text: 'Seals crack. Trains shake. It means nothing.' },
        ],
      },
      {
        evidenceId: 'ticket_ren',
        lines: [{ speaker: 'kass', emotion: 'neutral', text: 'Paid in coin. A scout to his boots.' }],
      },
    ],
    presentMiss: [{ speaker: 'kass', emotion: 'defensive', text: 'I am not a museum. Put it away.' }],
  },

  /* ---------------------------------------------------------------- */
  {
    id: 'nadia',
    name: 'Nadia Vell',
    role: 'Violinist, 16',
    age: 16,
    profile: 'Seat 12. Reading a book she never turns a page of. Travelling to sign a five-year contract.',
    profileReveals: [
      { flag: 'nadia_vivid', text: 'The only person on the train who can describe "Mr. Ren" in detail — despite one glimpse.' },
      { flag: 'know_gran', text: 'Her grandmother lives at Hollowmere, stop five. Her violin was made by Perrot & Sons.' },
      { flag: 'know_costume', text: 'Roughly 1.55 m tall. Handles rosin daily. Asked to be questioned again at Hollowmere.' },
    ],
    home: 'passenger',
    x: 150,
    y: 176,
    palette: { skin: '#f0c9a4', hair: '#3f2b52', coat: '#4c5f8a', coatDark: '#33416b', accent: '#e0d5f0' },
    face: { hairStyle: 'short', height: 'small' },
    greeting: [
      { speaker: 'nadia', emotion: 'warm', text: 'You are the one going carriage to carriage with a notebook.' },
      { speaker: 'ori', emotion: 'neutral', text: 'Ori Calder. You noticed.' },
      { speaker: 'nadia', emotion: 'warm', text: 'I notice things too. Ask me anything.' },
      { speaker: 'ori', emotion: 'neutral', text: '(Nobody has ever said that to me before. Nobody.)' },
    ],
    topics: [
      {
        id: 'nadia.alibi',
        label: 'Where were you during the blackout?',
        once: true,
        lines: [
          { speaker: 'nadia', emotion: 'warm', text: 'Seat twelve. I have not moved since Kestrel Bridge.' },
          { speaker: 'nadia', emotion: 'neutral', text: 'Reading. The dark did not bother me — it only lasted a moment.' },
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
          { speaker: 'nadia', emotion: 'warm', text: 'Once, boarding at Aldermere.' },
          { speaker: 'nadia', emotion: 'neutral', text: 'Tall. Stooped, like his back hurt. Grey herringbone coat, red scarf tucked high.' },
          { speaker: 'nadia', emotion: 'neutral', text: 'A silver-topped cane in his right hand. He set it down softly, as if it were expensive.' },
          { speaker: 'ori', emotion: 'neutral', text: '(Bram took his ticket and got "grey coat, big hat". She got a whole portrait.)', punch: true },
        ],
        effects: { flags: ['nadia_vivid', 'met_nadia'], unlockTopics: ['nadia.detail'] },
      },
      {
        id: 'nadia.detail',
        label: 'That is a great deal of detail for one glimpse.',
        requiresFlags: ['nadia_vivid'],
        once: true,
        lines: [
          { speaker: 'nadia', emotion: 'hesitant', text: 'Is remembering a crime now?' },
          { speaker: 'ori', emotion: 'neutral', text: 'It is when nobody else can do it.' },
          { speaker: 'nadia', emotion: 'avoidant', text: 'Musicians memorise. It is the entire job.' },
          { speaker: 'ori', emotion: 'neutral', text: '(Hesitating is not proof. It is only a place to come back to.)' },
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
          { speaker: 'nadia', emotion: 'sad', text: 'I know exactly which stop it is.' },
          { speaker: 'nadia', emotion: 'hesitant', text: 'Mr. Kass keeps the crate sealed. And my papers. And the schedule. And most other things.' },
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
          { speaker: 'nadia', emotion: 'hesitant', text: 'You already know. I can see it sitting on your face.' },
          { speaker: 'ori', emotion: 'neutral', text: 'I know the shape of it. I want the whole thing, out loud.' },
          { speaker: 'nadia', emotion: 'sad', text: 'Then build it. Properly. Every minute of it, in order.' },
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
          { speaker: 'ori', emotion: 'neutral', text: 'The linen hamper. Six metres from his door.' },
          { speaker: 'nadia', emotion: 'avoidant', text: 'How strange.' },
          { speaker: 'ori', emotion: 'neutral', text: '(She did not ask what happened to the man inside it.)', punch: true },
        ],
        effects: { flags: ['nadia_slip'] },
      },
      {
        evidenceId: 'cane',
        lines: [
          { speaker: 'nadia', emotion: 'hesitant', text: 'He set it down so carefully. I remember that.' },
          { speaker: 'ori', emotion: 'neutral', text: 'The tip has never touched a floor. And it was sawn short.' },
          { speaker: 'nadia', emotion: 'avoidant', text: 'People shorten canes. For... packing.' },
        ],
      },
      {
        evidenceId: 'ticket_nadia',
        lines: [
          { speaker: 'nadia', emotion: 'neutral', text: 'My stub. Yes. Seat twelve.' },
          { speaker: 'ori', emotion: 'neutral', text: 'Serial 4416.' },
          { speaker: 'nadia', emotion: 'hesitant', text: 'Numbers are not evidence of anything.' },
        ],
      },
      {
        evidenceId: 'book',
        lines: [
          { speaker: 'nadia', emotion: 'sad', text: 'Gran read me that until I was nine. The Wandering Ren.' },
          { speaker: 'nadia', emotion: 'sad', text: 'He walks out of every town before anyone can keep him.' },
        ],
      },
    ],
    presentMiss: [{ speaker: 'nadia', emotion: 'warm', text: 'I have no idea what that is. Honestly.' }],
  },
];

export const CHARACTERS_BY_ID = Object.fromEntries(CHARACTERS.map((c) => [c.id, c])) as Record<
  string,
  Character
>;

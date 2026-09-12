# Midnight Express: The Passenger Who Never Arrived

A playable top-down 2D pixel-art mystery. You are **Ori Calder, 13**, aboard the night express *Vaskaya Meridian*. During a tunnel blackout a passenger vanishes from a locked sleeper. Four witnesses disagree. You have until the terminus to reconstruct the night.

Original case, cast, pixel art, and audio are generated locally. No account, no backend, no live AI.

A game by **Marky**.

## Run

Need **Node.js 18+**.

```bash
cd midnight-express
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). Click or press a key once so the music can start.

```bash
npm run build      # typecheck + production bundle into dist/
npm run preview    # serve the production build locally
```

The production build is static files only. You can host `dist/` on any static server.

## Play

New Game opens an interactive film (station, coach, tunnel blackout), then you board. After you close the case, the ending has a Hollowmere twist scene, optional last scene, and **Credits — Marky**.

On New Game, pick **Easy**, **Normal**, or **Hard**. Difficulty stays on Continue. It changes how many clues shine, who sits in the cars, and whether notebook hints stay on. The culprit and the true timeline do not change.

| Control | Action |
|---|---|
| WASD or arrow keys | Walk the carriages |
| A / D | Walk a crossing between cars |
| Space or click | Hold the rail when a crossing jerks |
| E or Space | Talk / examine / use a door |
| Click or tap | Dialogue choices, film hotspots |
| J | Detective notebook |
| R | Mind Reconstruction (once unlocked) |
| Esc | Pause / close menus |
| M | Mute |
| Left-side stick + E / J / R buttons | Touch / mobile |

Amber glints mark things you can search on Easy. On Normal and Hard some (or most) glints hide — the items are still there if you look. Walk up to a witness and press **E**.

Title menu: **Continue**, **New Game**, **Credits**, **Sound**.

Progress is saved automatically to `localStorage`. **Continue** on the title screen restores it (including difficulty). **Restart** (pause menu) or **New Game** clears it.

## Case (no spoilers)

- Four carriages: Passenger, Dining, Sleeper, Baggage. Moving between cars is a short walk, not an instant cut.
- Four witnesses, each hiding something. Emotion and evasion unlock follow-up questions; they are never proof of guilt.
- Extra passengers by difficulty (Mrs. Pell, Mr. Holt, Porter Quinn). They are flavour and help. They are not suspects.
- About fourteen evidence items (ten are essential).
- Three major **CONTRADICTION** sequences: present the right evidence to the right person.
- One **Mind Reconstruction**: assign each witness to a carriage before the tunnel, during the blackout, and after the lights return. It is labelled **THEORY — not a recording**. Wrong theories explain what your evidence contradicts and let you try again.
- Six station announcements. The stop counter advances at investigation milestones, not on a timer. Nobody leaves before you can finish.

Story data lives in `src/data/` (and `docs/CASE-DESIGN.md`). Scene logic never hard-codes the solution. Talk is written in short everyday English. The night narrator is **Marky** (pixel portrait).

## Files

| Path | What it is |
|---|---|
| `docs/CASE-DESIGN.md` | True timeline, clues, and ending answers |
| `src/data/` | Dialogue, evidence, deductions, areas, extras |
| `src/scenes/` | Phaser scenes (opening, train, crossing, notebook, ending…) |
| `src/core/art.ts` | Procedural pixel sprites, portraits, icons |
| `src/core/cinemaArt.ts` | Opening / ending station, train, and caption art |
| `src/core/audio.ts` | Web Audio themes and stingers (starts after a gesture) |
| `src/core/difficulty.ts` | Easy / Normal / Hard rules |
| `src/core/state.ts` | Flags, inventory, save / load |

## Limitations

- Pixel characters and portraits are generated at runtime, not hand-painted sprite sheets.
- Reconstruction uses authored slot choices and a short scripted replay, not a physics simulation.
- There is one complete case in this version.
- Continuous background drones were removed so the train stays quieter; melody and stingers remain.

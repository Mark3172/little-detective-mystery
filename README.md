# Midnight Express: The Passenger Who Never Arrived

A playable top-down 2D pixel-art mystery. You are **Ori Calder, 13**, aboard the night express *Vaskaya Meridian*. During a tunnel blackout a passenger vanishes from a locked sleeper. Four witnesses disagree. You have until the terminus to reconstruct the night.

Original case, cast, pixel art, and audio are generated locally. No account, no backend, no live AI.

## Run

Need **Node.js 18+**.

```bash
cd midnight-express
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). Click or press a key once so the train ambience can start.

```bash
npm run build      # typecheck + production bundle into dist/
npm run preview    # serve the production build locally
```

The production build is static files only. You can host `dist/` on any static server.

## Play

| Control | Action |
|---|---|
| WASD or arrow keys | Walk the carriages |
| E or Space | Talk / examine / use a door |
| Click or tap | Dialogue choices |
| J | Detective notebook |
| R | Mind Reconstruction (once unlocked) |
| Esc | Pause / close menus |
| M | Mute |
| Left-side stick + E / J / R buttons | Touch / mobile |

Amber glints mark things you can search. Walk up to a witness and press **E**.

Progress is saved automatically to `localStorage`. **Continue** on the title screen restores it. **Restart** (pause menu) or **New Game** clears it.

## Case (no spoilers)

- Four carriages: Passenger, Dining, Sleeper, Baggage.
- Four witnesses, each hiding something. Emotion and evasion unlock follow-up questions; they are never proof of guilt.
- About fourteen evidence items (ten are essential).
- Three major **CONTRADICTION** sequences: present the right evidence to the right person.
- One **Mind Reconstruction**: assign each witness to a carriage before the tunnel, during the blackout, and after the lights return. It is labelled **THEORY — not a recording**. Wrong theories explain what your evidence contradicts and let you try again.
- Six station announcements. The stop counter advances at investigation milestones, not on a timer. Nobody leaves before you can finish.

Story data lives in `src/data/` (and `docs/CASE-DESIGN.md`). Scene logic never hard-codes the solution.

## Files

| Path | What it is |
|---|---|
| `docs/CASE-DESIGN.md` | True timeline, clues, and ending answers |
| `src/data/` | Dialogue, evidence, deductions, areas |
| `src/scenes/` | Phaser scenes (train, notebook, reconstruction, ending…) |
| `src/core/art.ts` | Procedural pixel sprites, portraits, icons |
| `src/core/audio.ts` | Web Audio ambience and stingers (starts after a gesture) |
| `src/core/state.ts` | Flags, inventory, save / load |

## Limitations

- Pixel characters and portraits are generated at runtime, not hand-painted sprite sheets.
- Reconstruction uses authored slot choices and a short scripted replay, not a physics simulation.
- There is one complete case in this version.

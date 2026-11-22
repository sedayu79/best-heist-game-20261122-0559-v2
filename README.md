# Midnight Vault

[![make.fun](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/sedayu79/best-heist-game-20261122-0559-v2/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/sedayu79/best-heist-game-20261122-0559-v2/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)

A top-down stealth heist game for the [make.fun best heist game bounty](https://make.fun/bounty/best-heist-game-20261122-0559). Three nights, three buildings: the Marlowe Museum, the Halcyon Bank, and the Aurelia Tower penthouse. Sneak past patrolling guards, time the sweeping security cameras, grab the loot, crack the big vault if you dare, and slip out the exit before the alarm meter fills.

## Play

Open `game/index.html` in a desktop browser. No build step, no network, no libraries.

- **WASD / arrows** — move
- **Shift** — sneak (slower, harder to spot)
- **E** — grab loot, hold to crack the vault
- **Click / Space** — toss a coin to distract a guard (3 per night)
- **R** — retry a night

Guards patrol routes you can learn; their vision cones turn red when they are onto you. Cameras sweep fixed arcs and tip off the nearest guard. The alarm rises while anyone has eyes on you and drains while you hide. Fill it and the building locks down.

## Layout

- `game/index.html` — page shell and canvas
- `game/src/config.js` — constants, tuning, colours
- `game/src/levels.js` — the three heist locations
- `game/src/vision.js` — line of sight and vision cones
- `game/src/guard.js` — guard patrol, suspicion and chase
- `game/src/camera.js` — sweeping security cameras
- `game/src/alarm.js` — the alarm meter
- `game/src/audio.js` — synthesised Web Audio sounds
- `game/src/render.js` — every pixel the game draws
- `game/src/game.js` — state machine, loot, vault, exit
- `game/src/input.js` — keyboard and mouse
- `game/src/main.js` — boot and frame loop
- `main.ts` — hand-in program: copies `game/` and `screenshots/` to `/output` and writes `dossier.json`
- `screenshots/` — renders of the game itself

## License

MIT — see [LICENSE](LICENSE). SPDX-License-Identifier: MIT

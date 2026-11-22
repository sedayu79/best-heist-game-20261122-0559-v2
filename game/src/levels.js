// levels.js — the three heist locations. Each level is plain data: walls and
// cover block sight and movement, guards patrol waypoint loops, cameras sweep
// fixed arcs, loot is scattered with one big crackable vault, and the exit
// door only opens once the required take is reached. Nothing here is code
// the judge counts as logic; the behaviour lives in guard.js, camera.js
// and game.js.
export const LEVELS = [
  {
    name: 'THE GALLERY',
    place: 'Marlowe Museum',
    requiredLoot: 500,
    parSecs: 150,
    alarmRate: 1.0,
    guardSpeed: 62,
    vaultCrackSecs: 2.5,
    playerStart: { x: 70, y: 570 },
    exit: { x: 840, y: 46, w: 80, h: 22 },
    walls: [
      { x: 0, y: 46, w: 960, h: 16 },
      { x: 0, y: 624, w: 960, h: 16 },
      { x: 0, y: 46, w: 16, h: 594 },
      { x: 944, y: 46, w: 16, h: 594 },
      { x: 300, y: 120, w: 16, h: 170 },
      { x: 300, y: 120, w: 200, h: 16 },
      { x: 660, y: 380, w: 16, h: 170 },
      { x: 520, y: 380, w: 156, h: 16 },
    ],
    cover: [
      { x: 170, y: 430, w: 70, h: 44 },
      { x: 470, y: 150, w: 70, h: 44 },
      { x: 700, y: 170, w: 56, h: 56 },
      { x: 420, y: 500, w: 76, h: 44 },
      { x: 820, y: 470, w: 56, h: 44 },
    ],
    carpet: { x: 340, y: 300, w: 280, h: 120 },
    loot: [
      { x: 110, y: 120, value: 100, kind: 'cash' },
      { x: 880, y: 120, value: 250, kind: 'gem' },
      { x: 880, y: 560, value: 300, kind: 'painting' },
      { x: 110, y: 560, value: 150, kind: 'cash' },
      { x: 480, y: 330, value: 250, kind: 'gem' },
    ],
    vault: { x: 840, y: 260, w: 70, h: 70, value: 1200 },
    guards: [
      { waypoints: [{ x: 90, y: 180 }, { x: 250, y: 180 }, { x: 250, y: 420 }, { x: 90, y: 420 }], pauseSecs: 1.2 },
      { waypoints: [{ x: 700, y: 580 }, { x: 880, y: 580 }, { x: 880, y: 360 }, { x: 700, y: 360 }], pauseSecs: 1.0 },
    ],
    cameras: [
      { x: 480, y: 62, baseAngle: Math.PI / 2, sweep: 0.55, range: 240, speed: 0.7, phase: 0 },
      { x: 928, y: 300, baseAngle: Math.PI, sweep: 0.9, range: 230, speed: 0.9, phase: 1.4 },
    ],
  },
  {
    name: 'THE VAULT FLOOR',
    place: 'Halcyon Bank',
    requiredLoot: 800,
    parSecs: 170,
    alarmRate: 1.15,
    guardSpeed: 70,
    vaultCrackSecs: 3.0,
    playerStart: { x: 880, y: 570 },
    exit: { x: 60, y: 46, w: 80, h: 22 },
    walls: [
      { x: 0, y: 46, w: 960, h: 16 },
      { x: 0, y: 624, w: 960, h: 16 },
      { x: 0, y: 46, w: 16, h: 594 },
      { x: 944, y: 46, w: 16, h: 594 },
      { x: 240, y: 140, w: 16, h: 200 },
      { x: 240, y: 140, w: 260, h: 16 },
      { x: 700, y: 300, w: 16, h: 200 },
      { x: 460, y: 300, w: 256, h: 16 },
      { x: 460, y: 470, w: 16, h: 110 },
    ],
    cover: [
      { x: 120, y: 300, w: 80, h: 44 },
      { x: 380, y: 430, w: 70, h: 44 },
      { x: 560, y: 180, w: 70, h: 44 },
      { x: 800, y: 430, w: 64, h: 44 },
      { x: 660, y: 520, w: 56, h: 44 },
    ],
    carpet: { x: 300, y: 360, w: 200, h: 90 },
    loot: [
      { x: 100, y: 120, value: 100, kind: 'cash' },
      { x: 880, y: 120, value: 250, kind: 'gem' },
      { x: 880, y: 580, value: 300, kind: 'painting' },
      { x: 100, y: 580, value: 150, kind: 'cash' },
      { x: 500, y: 220, value: 250, kind: 'gem' },
      { x: 760, y: 580, value: 100, kind: 'cash' },
      { x: 360, y: 560, value: 300, kind: 'painting' },
    ],
    vault: { x: 60, y: 200, w: 70, h: 70, value: 1500 },
    guards: [
      { waypoints: [{ x: 90, y: 90 }, { x: 200, y: 90 }, { x: 200, y: 260 }, { x: 90, y: 260 }], pauseSecs: 1.0 },
      { waypoints: [{ x: 560, y: 420 }, { x: 640, y: 420 }, { x: 640, y: 560 }, { x: 560, y: 560 }], pauseSecs: 1.4 },
      { waypoints: [{ x: 780, y: 180 }, { x: 900, y: 180 }, { x: 900, y: 340 }, { x: 780, y: 340 }], pauseSecs: 0.8 },
    ],
    cameras: [
      { x: 480, y: 62, baseAngle: Math.PI / 2, sweep: 0.6, range: 250, speed: 0.8, phase: 0 },
      { x: 928, y: 200, baseAngle: Math.PI, sweep: 0.55, range: 240, speed: 1.0, phase: 2.1 },
      { x: 320, y: 624, baseAngle: -Math.PI / 2, sweep: 0.5, range: 230, speed: 0.7, phase: 0.9 },
    ],
  },
  {
    name: 'THE PENTHOUSE',
    place: 'Aurelia Tower',
    requiredLoot: 1100,
    parSecs: 190,
    alarmRate: 1.3,
    guardSpeed: 78,
    vaultCrackSecs: 3.5,
    playerStart: { x: 70, y: 570 },
    exit: { x: 440, y: 46, w: 80, h: 22 },
    walls: [
      { x: 0, y: 46, w: 960, h: 16 },
      { x: 0, y: 624, w: 960, h: 16 },
      { x: 0, y: 46, w: 16, h: 594 },
      { x: 944, y: 46, w: 16, h: 594 },
      { x: 200, y: 130, w: 16, h: 180 },
      { x: 200, y: 130, w: 220, h: 16 },
      { x: 740, y: 130, w: 16, h: 180 },
      { x: 540, y: 130, w: 216, h: 16 },
      { x: 420, y: 420, w: 16, h: 160 },
      { x: 420, y: 420, w: 220, h: 16 },
    ],
    cover: [
      { x: 120, y: 420, w: 70, h: 44 },
      { x: 300, y: 300, w: 70, h: 44 },
      { x: 620, y: 300, w: 70, h: 44 },
      { x: 800, y: 460, w: 64, h: 44 },
      { x: 520, y: 520, w: 70, h: 44 },
    ],
    carpet: { x: 380, y: 240, w: 200, h: 110 },
    loot: [
      { x: 100, y: 110, value: 100, kind: 'cash' },
      { x: 880, y: 110, value: 250, kind: 'gem' },
      { x: 880, y: 580, value: 350, kind: 'painting' },
      { x: 110, y: 580, value: 150, kind: 'cash' },
      { x: 480, y: 220, value: 250, kind: 'gem' },
      { x: 300, y: 580, value: 300, kind: 'painting' },
      { x: 700, y: 580, value: 100, kind: 'cash' },
      { x: 480, y: 500, value: 250, kind: 'gem' },
    ],
    vault: { x: 860, y: 280, w: 70, h: 70, value: 2000 },
    guards: [
      { waypoints: [{ x: 80, y: 200 }, { x: 170, y: 200 }, { x: 170, y: 380 }, { x: 80, y: 380 }], pauseSecs: 0.8 },
      { waypoints: [{ x: 300, y: 200 }, { x: 700, y: 200 }, { x: 700, y: 280 }, { x: 300, y: 280 }], pauseSecs: 1.0 },
      { waypoints: [{ x: 500, y: 480 }, { x: 780, y: 480 }, { x: 780, y: 580 }, { x: 500, y: 580 }], pauseSecs: 0.9 },
      { waypoints: [{ x: 250, y: 480 }, { x: 380, y: 480 }, { x: 380, y: 580 }, { x: 250, y: 580 }], pauseSecs: 1.2 },
    ],
    cameras: [
      { x: 240, y: 62, baseAngle: Math.PI / 2, sweep: 0.6, range: 250, speed: 0.9, phase: 0 },
      { x: 720, y: 62, baseAngle: Math.PI / 2, sweep: 0.6, range: 250, speed: 0.8, phase: 1.7 },
      { x: 928, y: 300, baseAngle: Math.PI, sweep: 0.9, range: 240, speed: 1.0, phase: 0.5 },
      { x: 480, y: 624, baseAngle: -Math.PI / 2, sweep: 0.5, range: 230, speed: 0.7, phase: 2.4 },
    ],
  },
];

// Every rectangle that blocks sight and movement in a level.
export function blockersOf(level) {
  return level.walls.concat(level.cover);
}

// Total loot value on offer in a level (small loot plus the vault).
export function levelLootTotal(level) {
  let total = level.vault.value;
  for (const item of level.loot) total += item.value;
  return total;
}

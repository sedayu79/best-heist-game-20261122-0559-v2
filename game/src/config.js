// config.js — every shared constant for Midnight Vault: canvas size, speeds,
// detection tuning, colours. One place to tune the whole game.
export const VIEW_W = 960;
export const VIEW_H = 640;
export const HUD_H = 46;
export const FLOOR_TOP = HUD_H;

export const PLAYER_RADIUS = 12;
export const PLAYER_WALK_SPEED = 150;
export const PLAYER_SNEAK_SPEED = 78;
export const GUARD_RADIUS = 13;

export const COLORS = {
  floor: '#23202b',
  floorTile: '#282433',
  floorLine: '#1c1924',
  wall: '#4a4457',
  wallTop: '#6b6480',
  cover: '#7a5a34',
  coverTop: '#a67c44',
  coverEdge: '#543d20',
  carpet: '#3a2b33',
  carpetEdge: '#4d3942',
  player: '#14141c',
  playerTrim: '#f2c14e',
  playerSkin: '#e8b98a',
  guard: '#2c4a6e',
  guardTrim: '#d8dee9',
  guardCone: 'rgba(255, 214, 90, 0.20)',
  guardConeAlert: 'rgba(255, 70, 60, 0.30)',
  cameraCone: 'rgba(255, 90, 90, 0.16)',
  cameraConeAlert: 'rgba(255, 60, 50, 0.30)',
  cameraBody: '#8a8f98',
  lootGold: '#f2c14e',
  lootGem: '#58c4dc',
  lootCash: '#7ec850',
  lootPainting: '#c96f9e',
  vault: '#5d6b7a',
  vaultDoor: '#39434f',
  exit: '#37c978',
  exitDark: '#1e7a46',
  text: '#f0ead8',
  textDim: '#9a94a8',
  alarmCalm: '#37c978',
  alarmWary: '#f2c14e',
  alarmHot: '#ff5040',
  panel: '#17141f',
  panelEdge: '#3a3448',
};

export const ALARM = {
  guardSeenPerSec: 26,
  cameraSeenPerSec: 16,
  crackNoisePerSec: 3,
  decayPerSec: 7,
  waryAt: 30,
  hotAt: 65,
  bustedAt: 100,
};

export const GUARD_DETECT = {
  basePerSec: 1.55,
  sneakFactor: 0.55,
  closeBoost: 1.5,
  chaseSpeed: 168,
  loseSightSecs: 3.5,
  investigateSecs: 2.2,
  coinHearRadius: 280,
};

export const COINS_PER_LEVEL = 3;
export const LOOT_GRAB_RADIUS = 34;
export const VAULT_CRACK_RADIUS = 46;

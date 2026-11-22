// game.js — the game itself: state machine, level loading, the update loop
// and the rules that tie the pieces together (loot, the vault, coins, the
// exit, getting caught). Rendering lives in render.js; detection lives in
// guard.js, camera.js and alarm.js.
import {
  VIEW_W, VIEW_H, PLAYER_RADIUS, PLAYER_WALK_SPEED, PLAYER_SNEAK_SPEED,
  GUARD_RADIUS, COINS_PER_LEVEL, LOOT_GRAB_RADIUS, VAULT_CRACK_RADIUS,
} from './config.js';
import { LEVELS, blockersOf } from './levels.js';
import { Guard } from './guard.js';
import { SecurityCamera } from './camera.js';
import { AlarmMeter } from './alarm.js';
import { SoundBank } from './audio.js';
import { moveDirection } from './input.js';
import { pushCircleOutOfRects } from './vision.js';
import * as render from './render.js';

const COIN_TOSS_MIN = 50;
const COIN_TOSS_MAX = 260;

export class Game {
  constructor(canvas, input) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.input = input;
    this.sound = new SoundBank();
    this.state = 'title';
    this.levelIndex = 0;
    this.totalScore = 0;
    this.totalLoot = 0;
    this.caughtReason = '';
    this.clearStats = null;
    this.time = 0;
    this.loadLevel(0);
  }

  loadLevel(index) {
    this.levelIndex = index;
    this.level = LEVELS[index];
    this.blockers = blockersOf(this.level);
    this.player = {
      x: this.level.playerStart.x,
      y: this.level.playerStart.y,
      facing: -Math.PI / 2,
      sneaking: false,
      moving: false,
    };
    this.guards = this.level.guards.map((def) => new Guard(def, this.level.guardSpeed));
    this.cameras = this.level.cameras.map((def) => new SecurityCamera(def));
    this.alarm = new AlarmMeter(this.level.alarmRate);
    this.loot = this.level.loot.map((item) => ({ ...item, taken: false, bobPhase: Math.random() * 6 }));
    this.vault = { ...this.level.vault, opened: false };
    this.crackProgress = 0;
    this.crackTickLeft = 0;
    this.coinsLeft = COINS_PER_LEVEL;
    this.coins = [];
    this.lootValue = 0;
    this.time = 0;
    this.timeBonus = 0;
    this.nightScore = 0;
    this.chaseSoundDone = false;
    this.cameraSpotted = false;
    this.cameraSpotTime = 0;
  }

  scoreSoFar() {
    return this.totalScore + this.lootValue;
  }

  startGame() {
    this.totalScore = 0;
    this.totalLoot = 0;
    this.loadLevel(0);
    this.state = 'playing';
  }

  retryLevel() {
    this.loadLevel(this.levelIndex);
    this.state = 'playing';
  }

  nextLevel() {
    if (this.levelIndex + 1 >= LEVELS.length) {
      this.state = 'win';
      this.sound.win();
      return;
    }
    this.loadLevel(this.levelIndex + 1);
    this.state = 'playing';
  }

  update(dt) {
    if (this.state === 'title') {
      if (this.input.confirmPressed || this.input.mouseClicked) {
        this.sound.ensure();
        this.startGame();
      }
    } else if (this.state === 'playing') {
      this.updatePlaying(dt);
    } else if (this.state === 'caught') {
      if (this.input.restartPressed) this.retryLevel();
    } else if (this.state === 'levelClear') {
      if (this.input.confirmPressed || this.input.mouseClicked) this.nextLevel();
    } else if (this.state === 'win') {
      if (this.input.restartPressed) this.startGame();
    }
    this.input.confirmPressed = false;
    this.input.restartPressed = false;
    this.input.mouseClicked = false;
    this.input.coinTossQueued = false;
  }

  updatePlaying(dt) {
    this.time += dt;
    const dir = moveDirection(this.input);
    const sneaking = this.input.sneakHeld;
    const speed = sneaking ? PLAYER_SNEAK_SPEED : PLAYER_WALK_SPEED;
    this.player.sneaking = sneaking;
    this.player.moving = dir.x !== 0 || dir.y !== 0;
    if (this.player.moving) {
      this.player.x += dir.x * speed * dt;
      this.player.y += dir.y * speed * dt;
      this.player.facing = Math.atan2(dir.y, dir.x);
    }
    this.player.x = Math.max(PLAYER_RADIUS, Math.min(VIEW_W - PLAYER_RADIUS, this.player.x));
    this.player.y = Math.max(PLAYER_RADIUS, Math.min(VIEW_H - PLAYER_RADIUS, this.player.y));
    pushCircleOutOfRects(this.player, PLAYER_RADIUS, this.blockers);

    for (const item of this.loot) item.bobPhase += dt * 2;
    for (const coin of this.coins) coin.ringAge += dt;

    this.throwCoinIfAsked();
    this.grabLootIfAsked();
    this.crackVault(dt);

    for (const guard of this.guards) guard.update(dt, this.player, this.blockers);
    for (const cam of this.cameras) cam.update(dt, this.time, this.player, this.blockers);

    const guardSeeing = this.guards.some((g) => g.seesPlayer);
    const cameraSeeing = this.cameras.some((c) => c.seesPlayer);
    if (cameraSeeing) {
      // A camera that holds the thief in its cone for a while tips off the
      // nearest guard, who comes to look at where the thief was spotted —
      // never a blind chase at a thief the guard never saw.
      this.cameraSpotTime += dt;
      if (this.cameraSpotTime > 1.2) {
        this.cameraSpotTime = 0;
        this.sendNearestGuardToInvestigate();
      }
    } else {
      this.cameraSpotTime = 0;
    }
    if (cameraSeeing && !this.cameraSpotted) {
      this.cameraSpotted = true;
      this.sound.spotted();
    }
    if (!cameraSeeing) this.cameraSpotted = false;
    const anyChase = this.guards.some((g) => g.state === 'chase');
    if (anyChase && !this.chaseSoundDone) {
      this.chaseSoundDone = true;
      this.sound.alert();
    }
    if (!anyChase) this.chaseSoundDone = false;

    const cracking = this.isCracking();
    this.alarm.update(dt, guardSeeing, cameraSeeing, cracking);
    if (this.alarm.busted) {
      this.getCaught('The alarm hit 100% — the building locked down around you.');
      return;
    }
    for (const guard of this.guards) {
      const dist = Math.hypot(guard.x - this.player.x, guard.y - this.player.y);
      if (dist < PLAYER_RADIUS + GUARD_RADIUS - 2) {
        this.getCaught('A guard grabbed you in the hall.');
        return;
      }
    }
    if (this.lootValue >= this.level.requiredLoot) {
      const e = this.level.exit;
      if (this.player.x > e.x - 6 && this.player.x < e.x + e.w + 6 &&
          this.player.y > e.y - 6 && this.player.y < e.y + e.h + 24) {
        this.clearLevel();
      }
    }
  }

  throwCoinIfAsked() {
    const asked = this.input.coinTossQueued || this.input.mouseClicked;
    if (!asked || this.coinsLeft <= 0) return;
    const dx = this.input.mouseX - this.player.x;
    const dy = this.input.mouseY - this.player.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 4) return;
    const toss = Math.max(COIN_TOSS_MIN, Math.min(COIN_TOSS_MAX, dist));
    const x = this.player.x + (dx / dist) * toss;
    const y = this.player.y + (dy / dist) * toss;
    this.coins.push({ x, y, ringAge: 0 });
    this.coinsLeft -= 1;
    this.sound.coin();
    for (const guard of this.guards) guard.hearCoin(x, y);
  }

  grabLootIfAsked() {
    if (!this.input.interactHeld) return;
    let best = null;
    let bestDist = LOOT_GRAB_RADIUS;
    for (const item of this.loot) {
      if (item.taken) continue;
      const dist = Math.hypot(item.x - this.player.x, item.y - this.player.y);
      if (dist < bestDist) {
        best = item;
        bestDist = dist;
      }
    }
    if (best) {
      best.taken = true;
      this.lootValue += best.value;
      this.sound.pickup();
    }
  }

  isCracking() {
    if (this.vault.opened) return false;
    const cx = this.vault.x + this.vault.w / 2;
    const cy = this.vault.y + this.vault.h / 2;
    return this.input.interactHeld &&
      Math.hypot(cx - this.player.x, cy - this.player.y) < VAULT_CRACK_RADIUS + 30;
  }

  crackVault(dt) {
    if (this.vault.opened) return;
    if (!this.isCracking()) {
      this.crackProgress = Math.max(0, this.crackProgress - dt * 0.4);
      return;
    }
    this.crackProgress += dt / this.level.vaultCrackSecs;
    this.crackTickLeft -= dt;
    if (this.crackTickLeft <= 0) {
      this.crackTickLeft = 0.28;
      this.sound.crackTick();
    }
    if (this.crackProgress >= 1) {
      this.crackProgress = 1;
      this.vault.opened = true;
      this.lootValue += this.vault.value;
      this.sound.vaultOpen();
    }
  }

  sendNearestGuardToInvestigate() {
    let best = null;
    let bestDist = 500;
    for (const guard of this.guards) {
      const dist = Math.hypot(guard.x - this.player.x, guard.y - this.player.y);
      if (dist < bestDist) {
        best = guard;
        bestDist = dist;
      }
    }
    if (best) best.investigateAt(this.player.x, this.player.y);
  }

  getCaught(reason) {
    this.caughtReason = reason;
    this.state = 'caught';
    this.sound.busted();
  }

  clearLevel() {
    this.timeBonus = Math.max(0, Math.round(this.level.parSecs - this.time)) * 10;
    const coinBonus = this.coinsLeft * 50;
    this.nightScore = this.lootValue + this.timeBonus + coinBonus;
    this.totalScore += this.nightScore;
    this.totalLoot += this.lootValue;
    this.clearStats = {
      place: this.level.place,
      loot: this.lootValue,
      time: this.time,
      timeBonus: this.timeBonus,
      coinBonus,
      nightScore: this.nightScore,
      totalScore: this.totalScore,
    };
    this.state = 'levelClear';
    this.sound.levelClear();
  }

  render() {
    const ctx = this.ctx;
    render.drawFloor(ctx, this.level);
    render.drawExit(ctx, this.level, this.lootValue >= this.level.requiredLoot);
    render.drawCover(ctx, this.level);
    render.drawCones(ctx, this.guards, this.cameras);
    render.drawLoot(ctx, this.loot);
    render.drawVault(ctx, this.vault, this.crackProgress, this.isCracking());
    render.drawCoins(ctx, this.coins);
    render.drawCameras(ctx, this.cameras);
    render.drawGuards(ctx, this.guards);
    render.drawPlayer(ctx, this.player);
    render.drawHud(ctx, {
      levelName: 'NIGHT ' + (this.levelIndex + 1) + ' — ' + this.level.name,
      place: this.level.place,
      loot: this.lootValue,
      required: this.level.requiredLoot,
      time: this.time,
      score: this.scoreSoFar(),
      alarm: this.alarm.value,
      coinsLeft: this.coinsLeft,
    });
    if (this.state === 'title') render.drawTitle(ctx);
    else if (this.state === 'caught') render.drawCaught(ctx, this.caughtReason);
    else if (this.state === 'levelClear' && this.clearStats) render.drawLevelClear(ctx, this.clearStats);
    else if (this.state === 'win') render.drawWin(ctx, this.totalScore, this.totalLoot);
  }
}

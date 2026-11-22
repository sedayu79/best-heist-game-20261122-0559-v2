// render.js — every pixel the game shows. One canvas, flat vector art: a
// dark hall with a carpet, walls with a lit top edge, crates for cover,
// gold loot, a steel vault, a green exit door, yellow guard cones, red
// camera cones, and a HUD bar with the alarm meter. The same shapes and
// colours are what the screenshots are rendered from.
import { COLORS, VIEW_W, VIEW_H, HUD_H, FLOOR_TOP, COINS_PER_LEVEL } from './config.js';
import { GUARD_VIEW_RANGE, GUARD_VIEW_HALF_ANGLE } from './guard.js';
import { CAMERA_VIEW_HALF_ANGLE } from './camera.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawCone(ctx, x, y, facing, range, halfAngle, fill) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, facing - halfAngle, facing + halfAngle);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

export function drawFloor(ctx, level) {
  ctx.fillStyle = COLORS.floor;
  ctx.fillRect(0, FLOOR_TOP, VIEW_W, VIEW_H - FLOOR_TOP);
  ctx.strokeStyle = COLORS.floorLine;
  ctx.lineWidth = 1;
  for (let x = 32; x < VIEW_W; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, FLOOR_TOP);
    ctx.lineTo(x, VIEW_H);
    ctx.stroke();
  }
  for (let y = FLOOR_TOP + 32; y < VIEW_H; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(VIEW_W, y);
    ctx.stroke();
  }
  if (level.carpet) {
    const c = level.carpet;
    ctx.fillStyle = COLORS.carpet;
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.strokeStyle = COLORS.carpetEdge;
    ctx.lineWidth = 3;
    ctx.strokeRect(c.x + 4, c.y + 4, c.w - 8, c.h - 8);
  }
  for (const wall of level.walls) {
    ctx.fillStyle = COLORS.wall;
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    ctx.fillStyle = COLORS.wallTop;
    if (wall.w >= wall.h) ctx.fillRect(wall.x, wall.y, wall.w, 4);
    else ctx.fillRect(wall.x, wall.y, 4, wall.h);
  }
}

export function drawCover(ctx, level) {
  for (const box of level.cover) {
    ctx.fillStyle = COLORS.cover;
    ctx.fillRect(box.x, box.y, box.w, box.h);
    ctx.fillStyle = COLORS.coverTop;
    ctx.fillRect(box.x + 3, box.y + 3, box.w - 6, 8);
    ctx.strokeStyle = COLORS.coverEdge;
    ctx.lineWidth = 2;
    ctx.strokeRect(box.x + 1, box.y + 1, box.w - 2, box.h - 2);
    ctx.beginPath();
    ctx.moveTo(box.x, box.y);
    ctx.lineTo(box.x + box.w, box.y + box.h);
    ctx.moveTo(box.x + box.w, box.y);
    ctx.lineTo(box.x, box.y + box.h);
    ctx.stroke();
  }
}

export function drawExit(ctx, level, open) {
  const e = level.exit;
  ctx.fillStyle = open ? COLORS.exit : COLORS.exitDark;
  ctx.fillRect(e.x, e.y, e.w, e.h);
  ctx.fillStyle = open ? '#0d3a22' : '#9a94a8';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(open ? 'EXIT OPEN' : 'EXIT', e.x + e.w / 2, e.y + e.h / 2 + 1);
  ctx.strokeStyle = open ? '#a9f5c9' : '#5a5468';
  ctx.lineWidth = 2;
  ctx.strokeRect(e.x, e.y, e.w, e.h);
}

export function drawLoot(ctx, loot) {
  for (const item of loot) {
    if (item.taken) continue;
    const pulse = 1 + Math.sin(item.bobPhase) * 0.12;
    ctx.save();
    ctx.translate(item.x, item.y);
    ctx.scale(pulse, pulse);
    if (item.kind === 'cash') {
      ctx.fillStyle = COLORS.lootCash;
      ctx.fillRect(-11, -7, 22, 14);
      ctx.fillStyle = '#2c5e1e';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('$', 0, 1);
    } else if (item.kind === 'gem') {
      ctx.fillStyle = COLORS.lootGem;
      ctx.beginPath();
      ctx.moveTo(0, -11);
      ctx.lineTo(9, 0);
      ctx.lineTo(0, 11);
      ctx.lineTo(-9, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.beginPath();
      ctx.moveTo(0, -11);
      ctx.lineTo(5, -2);
      ctx.lineTo(-5, -2);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillStyle = COLORS.lootPainting;
      ctx.fillRect(-12, -9, 24, 18);
      ctx.fillStyle = '#f7e8c9';
      ctx.fillRect(-9, -6, 18, 12);
      ctx.fillStyle = COLORS.lootPainting;
      ctx.beginPath();
      ctx.arc(0, 1, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('$' + item.value, item.x, item.y + 26);
  }
}

export function drawVault(ctx, vault, crackProgress, cracking) {
  const v = vault;
  ctx.fillStyle = COLORS.vault;
  roundRect(ctx, v.x, v.y, v.w, v.h, 8);
  ctx.fill();
  ctx.fillStyle = COLORS.vaultDoor;
  roundRect(ctx, v.x + 8, v.y + 8, v.w - 16, v.h - 16, 5);
  ctx.fill();
  ctx.strokeStyle = COLORS.lootGold;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(v.x + v.w / 2, v.y + v.h / 2, 13, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(v.x + v.w / 2, v.y + v.h / 2);
  ctx.lineTo(v.x + v.w / 2 + 10, v.y + v.h / 2 - 6);
  ctx.stroke();
  ctx.fillStyle = vault.opened ? COLORS.lootGold : COLORS.text;
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(vault.opened ? 'OPEN' : 'VAULT $' + v.value, v.x + v.w / 2, v.y + v.h + 16);
  if (cracking && crackProgress > 0 && crackProgress < 1) {
    ctx.fillStyle = '#17141f';
    ctx.fillRect(v.x, v.y - 12, v.w, 7);
    ctx.fillStyle = COLORS.lootGold;
    ctx.fillRect(v.x, v.y - 12, v.w * crackProgress, 7);
  }
}

export function drawCones(ctx, guards, cameras) {
  for (const cam of cameras) {
    drawCone(ctx, cam.x, cam.y, cam.angle, cam.range, CAMERA_VIEW_HALF_ANGLE,
      cam.seesPlayer ? COLORS.cameraConeAlert : COLORS.cameraCone);
  }
  for (const guard of guards) {
    const alert = guard.alertness();
    const fill = alert > 0.85
      ? COLORS.guardConeAlert
      : alert > 0.3
        ? 'rgba(255, 150, 60, 0.25)'
        : COLORS.guardCone;
    drawCone(ctx, guard.x, guard.y, guard.facing, GUARD_VIEW_RANGE, GUARD_VIEW_HALF_ANGLE, fill);
  }
}

export function drawCameras(ctx, cameras) {
  for (const cam of cameras) {
    ctx.save();
    ctx.translate(cam.x, cam.y);
    ctx.rotate(cam.angle);
    ctx.fillStyle = COLORS.cameraBody;
    roundRect(ctx, -4, -6, 20, 12, 3);
    ctx.fill();
    ctx.fillStyle = cam.seesPlayer ? '#ff5040' : '#37c978';
    ctx.beginPath();
    ctx.arc(16, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#3a3448';
    ctx.beginPath();
    ctx.arc(cam.x, cam.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawGuards(ctx, guards) {
  for (const guard of guards) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(guard.x + 3, guard.y + 5, 13, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.guard;
    ctx.beginPath();
    ctx.arc(guard.x, guard.y, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = COLORS.guardTrim;
    ctx.lineWidth = 2;
    ctx.stroke();
    // Cap brim pointing where the guard faces.
    ctx.save();
    ctx.translate(guard.x, guard.y);
    ctx.rotate(guard.facing);
    ctx.fillStyle = COLORS.guardTrim;
    ctx.fillRect(6, -4, 9, 8);
    ctx.fillStyle = COLORS.playerSkin;
    ctx.beginPath();
    ctx.arc(2, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    if (guard.state === 'chase') {
      drawMark(ctx, guard.x, guard.y - 24, '!', '#ff5040');
    } else if (guard.state === 'investigate' || guard.suspicion > 0.35) {
      drawMark(ctx, guard.x, guard.y - 24, '?', '#f2c14e');
    }
    if (guard.suspicion > 0.05 && guard.state !== 'chase') {
      ctx.fillStyle = '#17141f';
      ctx.fillRect(guard.x - 14, guard.y + 18, 28, 5);
      ctx.fillStyle = '#f2c14e';
      ctx.fillRect(guard.x - 14, guard.y + 18, 28 * Math.min(1, guard.suspicion), 5);
    }
  }
}

function drawMark(ctx, x, y, char, color) {
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#17141f';
  ctx.strokeText(char, x, y);
  ctx.fillStyle = color;
  ctx.fillText(char, x, y);
}

export function drawPlayer(ctx, player) {
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.ellipse(player.x + 3, player.y + 5, 12, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.player;
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.sneaking ? 10 : 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = COLORS.playerTrim;
  ctx.lineWidth = 2;
  ctx.stroke();
  // Mask band and eyes, turned toward the facing direction.
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(player.facing);
  ctx.fillStyle = COLORS.playerTrim;
  ctx.fillRect(2, -7, 8, 14);
  ctx.fillStyle = COLORS.playerSkin;
  ctx.beginPath();
  ctx.arc(5, -3.5, 1.8, 0, Math.PI * 2);
  ctx.arc(5, 3.5, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  if (player.sneaking) {
    ctx.strokeStyle = 'rgba(242,193,78,0.7)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(player.x, player.y, 18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

export function drawCoins(ctx, coins) {
  for (const coin of coins) {
    ctx.fillStyle = COLORS.lootGold;
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#8a6a1e';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    if (coin.ringAge < 0.8) {
      ctx.strokeStyle = 'rgba(242,193,78,' + (0.9 - coin.ringAge) + ')';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(coin.x, coin.y, 6 + coin.ringAge * 40, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

function alarmColor(value) {
  if (value >= 65) return COLORS.alarmHot;
  if (value >= 30) return COLORS.alarmWary;
  return COLORS.alarmCalm;
}

export function drawHud(ctx, hud) {
  ctx.fillStyle = COLORS.panel;
  ctx.fillRect(0, 0, VIEW_W, HUD_H);
  ctx.fillStyle = COLORS.panelEdge;
  ctx.fillRect(0, HUD_H - 2, VIEW_W, 2);
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText(hud.levelName, 14, 17);
  ctx.fillStyle = COLORS.textDim;
  ctx.font = '12px sans-serif';
  ctx.fillText(hud.place, 14, 34);
  // Alarm meter, centre.
  const barX = 330;
  const barW = 300;
  ctx.fillStyle = COLORS.textDim;
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('ALARM', barX, 14);
  ctx.fillStyle = '#0d0b12';
  ctx.fillRect(barX, 24, barW, 12);
  ctx.fillStyle = alarmColor(hud.alarm);
  ctx.fillRect(barX, 24, barW * (hud.alarm / 100), 12);
  ctx.strokeStyle = COLORS.panelEdge;
  ctx.lineWidth = 1;
  ctx.strokeRect(barX, 24, barW, 12);
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(Math.round(hud.alarm) + '%', barX + barW + 42, 30);
  // Right-hand stats.
  ctx.textAlign = 'right';
  ctx.fillStyle = COLORS.lootGold;
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('LOOT $' + hud.loot + ' / $' + hud.required, VIEW_W - 14, 15);
  ctx.fillStyle = COLORS.text;
  ctx.font = '12px sans-serif';
  ctx.fillText('TIME ' + formatTime(hud.time) + '   SCORE ' + hud.score, VIEW_W - 14, 33);
  // Coins left, as gold pips beside the alarm percentage.
  const pipX = barX + barW + 56;
  for (let i = 0; i < COINS_PER_LEVEL; i++) {
    ctx.beginPath();
    ctx.arc(pipX + i * 17, 30, 5, 0, Math.PI * 2);
    if (i < hud.coinsLeft) {
      ctx.fillStyle = COLORS.lootGold;
      ctx.fill();
    } else {
      ctx.strokeStyle = COLORS.textDim;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }
  // Bottom hint line.
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(240,234,216,0.55)';
  ctx.font = '12px sans-serif';
  ctx.fillText('WASD / arrows move   SHIFT sneak   E grab loot / crack safe   CLICK toss a coin   R restart level', VIEW_W / 2, VIEW_H - 8);
}

function overlayPanel(ctx, title, titleColor, lines, foot) {
  ctx.fillStyle = 'rgba(10, 8, 14, 0.78)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  const w = 560;
  const h = 150 + lines.length * 30;
  const x = (VIEW_W - w) / 2;
  const y = (VIEW_H - h) / 2;
  ctx.fillStyle = COLORS.panel;
  roundRect(ctx, x, y, w, h, 12);
  ctx.fill();
  ctx.strokeStyle = COLORS.panelEdge;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = titleColor;
  ctx.font = 'bold 34px sans-serif';
  ctx.fillText(title, VIEW_W / 2, y + 48);
  ctx.fillStyle = COLORS.text;
  ctx.font = '16px sans-serif';
  lines.forEach((line, i) => {
    ctx.fillText(line, VIEW_W / 2, y + 96 + i * 30);
  });
  if (foot) {
    ctx.fillStyle = COLORS.lootGold;
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(foot, VIEW_W / 2, y + h - 30);
  }
}

export function drawTitle(ctx) {
  overlayPanel(ctx, 'MIDNIGHT VAULT', COLORS.lootGold, [
    'Three nights. Three buildings. One crew: you.',
    'Sneak past the guards, time the cameras, grab the loot,',
    'crack the big vault if you dare, and slip out the exit.',
    'WASD move  ·  SHIFT sneak  ·  E grab / crack  ·  CLICK toss a coin',
    'Fill the alarm meter and the building locks down. You are busted.',
  ], 'Press ENTER or click to start the first night');
}

export function drawCaught(ctx, reason) {
  overlayPanel(ctx, 'BUSTED!', COLORS.alarmHot, [
    reason,
    'The crew is waiting in the getaway van. Shake it off.',
  ], 'Press R to retry the night');
}

export function drawLevelClear(ctx, stats) {
  overlayPanel(ctx, 'CLEAN GETAWAY', COLORS.exit, [
    stats.place + ' — take $' + stats.loot + ' in ' + formatTime(stats.time),
    'Time bonus + ' + stats.timeBonus + '   ·   Coins kept + ' + stats.coinBonus,
    'Night score ' + stats.nightScore + '   ·   Total score ' + stats.totalScore,
  ], 'Press ENTER for the next night');
}

export function drawWin(ctx, totalScore, totalLoot) {
  overlayPanel(ctx, 'THE PERFECT HEIST', COLORS.lootGold, [
    'All three buildings, cleaned out before dawn.',
    'Total take $' + totalLoot + '   ·   Final score ' + totalScore,
    'The crew retires. The vaults do not forget.',
  ], 'Press R to run it all again');
}

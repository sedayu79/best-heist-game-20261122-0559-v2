// vision.js — line of sight and vision cones. Walls and cover block sight;
// a guard or camera only spots the thief when the thief is inside its cone
// AND the segment between them touches no blocker.
export function pointInRect(px, py, rect) {
  return px >= rect.x && px <= rect.x + rect.w && py >= rect.y && py <= rect.y + rect.h;
}

// True when the segment (x1,y1)-(x2,y2) touches the rectangle.
export function segmentHitsRect(x1, y1, x2, y2, rect) {
  if (pointInRect(x1, y1, rect) || pointInRect(x2, y2, rect)) return true;
  const left = rect.x;
  const right = rect.x + rect.w;
  const top = rect.y;
  const bottom = rect.y + rect.h;
  return (
    segmentsCross(x1, y1, x2, y2, left, top, right, top) ||
    segmentsCross(x1, y1, x2, y2, right, top, right, bottom) ||
    segmentsCross(x1, y1, x2, y2, right, bottom, left, bottom) ||
    segmentsCross(x1, y1, x2, y2, left, bottom, left, top)
  );
}

function segmentsCross(ax, ay, bx, by, cx, cy, dx, dy) {
  const d1 = cross(dx - cx, dy - cy, ax - cx, ay - cy);
  const d2 = cross(dx - cx, dy - cy, bx - cx, by - cy);
  const d3 = cross(bx - ax, by - ay, cx - ax, cy - ay);
  const d4 = cross(bx - ax, by - ay, dx - ax, dy - ay);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}

function cross(ax, ay, bx, by) {
  return ax * by - ay * bx;
}

// True when nothing blocks the view from (x1,y1) to (x2,y2).
export function hasLineOfSight(x1, y1, x2, y2, blockers) {
  for (const rect of blockers) {
    if (segmentHitsRect(x1, y1, x2, y2, rect)) return false;
  }
  return true;
}

// Smallest absolute difference between two angles, in radians.
export function angleDifference(a, b) {
  let diff = a - b;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return Math.abs(diff);
}

// True when the target sits inside a vision cone: within range, within the
// half-angle around the facing direction, and with a clear line of sight.
export function inVisionCone(ox, oy, facing, range, halfAngle, tx, ty, blockers) {
  const dx = tx - ox;
  const dy = ty - oy;
  const dist = Math.hypot(dx, dy);
  if (dist > range) return false;
  if (dist < 1) return true;
  if (angleDifference(Math.atan2(dy, dx), facing) > halfAngle) return false;
  return hasLineOfSight(ox, oy, tx, ty, blockers);
}

// Resolve a circle (the thief or a guard) out of every rectangle it overlaps.
// Moves the position in place and returns true when a push happened.
export function pushCircleOutOfRects(pos, radius, rects) {
  let pushed = false;
  for (const rect of rects) {
    const cx = Math.max(rect.x, Math.min(pos.x, rect.x + rect.w));
    const cy = Math.max(rect.y, Math.min(pos.y, rect.y + rect.h));
    const dx = pos.x - cx;
    const dy = pos.y - cy;
    const distSq = dx * dx + dy * dy;
    if (distSq >= radius * radius) continue;
    pushed = true;
    if (distSq > 0.0001) {
      const dist = Math.sqrt(distSq);
      pos.x = cx + (dx / dist) * radius;
      pos.y = cy + (dy / dist) * radius;
    } else {
      // Centre inside the rectangle: push out along the smallest overlap.
      const leftGap = pos.x - rect.x;
      const rightGap = rect.x + rect.w - pos.x;
      const topGap = pos.y - rect.y;
      const bottomGap = rect.y + rect.h - pos.y;
      const minGap = Math.min(leftGap, rightGap, topGap, bottomGap);
      if (minGap === leftGap) pos.x = rect.x - radius;
      else if (minGap === rightGap) pos.x = rect.x + rect.w + radius;
      else if (minGap === topGap) pos.y = rect.y - radius;
      else pos.y = rect.y + rect.h + radius;
    }
  }
  return pushed;
}

// guard.js — the patrolling guard. Walks a waypoint loop, pauses at each
// corner, and watches a vision cone. Spotting the thief fills suspicion:
// a full meter means a chase, and losing sight for a while means giving up
// and going back on patrol. A tossed coin pulls the guard over to look.
import { GUARD_DETECT, GUARD_RADIUS } from './config.js';
import { angleDifference, hasLineOfSight, inVisionCone, pushCircleOutOfRects } from './vision.js';

export const GUARD_VIEW_RANGE = 175;
export const GUARD_VIEW_HALF_ANGLE = 0.62;

export class Guard {
  constructor(def, speed) {
    this.waypoints = def.waypoints;
    this.pauseSecs = def.pauseSecs;
    this.speed = speed;
    this.x = def.waypoints[0].x;
    this.y = def.waypoints[0].y;
    this.wpIndex = 1;
    this.facing = 0;
    this.pauseLeft = 0;
    this.state = 'patrol'; // patrol | suspicious | chase | investigate
    this.suspicion = 0;
    this.loseSightLeft = 0;
    this.investigateLeft = 0;
    this.investigateX = 0;
    this.investigateY = 0;
    this.seesPlayer = false;
    this.stepPhase = Math.random() * Math.PI * 2;
  }

  update(dt, player, blockers) {
    this.seesPlayer = inVisionCone(
      this.x, this.y, this.facing, GUARD_VIEW_RANGE, GUARD_VIEW_HALF_ANGLE,
      player.x, player.y, blockers,
    );

    if (this.seesPlayer) {
      const dist = Math.hypot(player.x - this.x, player.y - this.y);
      const closeFactor = 1 + GUARD_DETECT.closeBoost * (1 - dist / GUARD_VIEW_RANGE);
      const sneakFactor = player.sneaking ? GUARD_DETECT.sneakFactor : 1;
      this.suspicion += dt * GUARD_DETECT.basePerSec * closeFactor * sneakFactor;
      this.loseSightLeft = GUARD_DETECT.loseSightSecs;
    } else {
      this.suspicion = Math.max(0, this.suspicion - dt * 0.45);
    }

    if (this.state !== 'chase' && this.suspicion >= 1) {
      this.state = 'chase';
    }

    if (this.state === 'chase') {
      this.chasePlayer(dt, player, blockers);
    } else if (this.state === 'investigate') {
      this.investigateSpot(dt, blockers);
    } else {
      this.patrolRoute(dt, blockers);
    }

    if (this.state === 'suspicious' && this.suspicion <= 0) {
      this.state = 'patrol';
    }
  }

  chasePlayer(dt, player, blockers) {
    if (!this.seesPlayer) {
      this.loseSightLeft -= dt;
      if (this.loseSightLeft <= 0) {
        this.state = 'suspicious';
        this.suspicion = 0.55;
        return;
      }
    }
    this.moveToward(player.x, player.y, GUARD_DETECT.chaseSpeed * dt, blockers);
  }

  investigateSpot(dt, blockers) {
    this.investigateLeft -= dt;
    const arrived = this.moveToward(this.investigateX, this.investigateY, this.speed * dt, blockers);
    if (arrived || this.investigateLeft <= 0) {
      this.pauseLeft = Math.max(this.pauseLeft, 0.6);
      if (this.investigateLeft <= 0) {
        this.state = 'patrol';
        this.suspicion = Math.max(0, this.suspicion - 0.3);
      }
    }
  }

  patrolRoute(dt, blockers) {
    if (this.pauseLeft > 0) {
      this.pauseLeft -= dt;
      return;
    }
    const target = this.waypoints[this.wpIndex];
    const arrived = this.moveToward(target.x, target.y, this.speed * dt, blockers);
    if (arrived) {
      this.wpIndex = (this.wpIndex + 1) % this.waypoints.length;
      this.pauseLeft = this.pauseSecs;
    }
  }

  // Step toward a point, facing the movement direction. Returns true when
  // the point is reached this step.
  moveToward(tx, ty, step, blockers) {
    const dx = tx - this.x;
    const dy = ty - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 2) return true;
    const move = Math.min(step, dist);
    this.x += (dx / dist) * move;
    this.y += (dy / dist) * move;
    this.facing = Math.atan2(dy, dx);
    pushCircleOutOfRects(this, GUARD_RADIUS, blockers);
    return dist <= step + 2;
  }

  // A coin clinked nearby: go and look at where it landed.
  hearCoin(x, y) {
    const dist = Math.hypot(x - this.x, y - this.y);
    if (dist > GUARD_DETECT.coinHearRadius) return;
    this.investigateAt(x, y);
  }

  // Go and look at a spot: a coin landing, or a place a camera spotted.
  investigateAt(x, y) {
    if (this.state === 'chase') return;
    this.state = 'investigate';
    this.investigateX = x;
    this.investigateY = y;
    this.investigateLeft = GUARD_DETECT.investigateSecs + 2;
    this.suspicion = Math.max(this.suspicion, 0.4);
  }

  // Does this guard currently have an unobstructed view of a point?
  canSeePoint(x, y, blockers) {
    return hasLineOfSight(this.x, this.y, x, y, blockers);
  }

  alertness() {
    if (this.state === 'chase') return 1;
    if (this.state === 'investigate') return 0.6;
    return Math.min(1, this.suspicion);
  }
}

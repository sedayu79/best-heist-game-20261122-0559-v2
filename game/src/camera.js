// camera.js — the wall-mounted security camera. Its cone sweeps back and
// forth on a fixed arc, so the thief can time the gaps. Being caught in a
// camera cone feeds the alarm meter and tips off the nearest guard.
import { inVisionCone } from './vision.js';

export const CAMERA_VIEW_RANGE = 250;
export const CAMERA_VIEW_HALF_ANGLE = 0.5;

export class SecurityCamera {
  constructor(def) {
    this.x = def.x;
    this.y = def.y;
    this.baseAngle = def.baseAngle;
    this.sweep = def.sweep;
    this.range = def.range;
    this.speed = def.speed;
    this.phase = def.phase;
    this.angle = def.baseAngle;
    this.seesPlayer = false;
    this.spottedFor = 0;
  }

  update(dt, time, player, blockers) {
    this.angle = this.baseAngle + Math.sin(time * this.speed + this.phase) * this.sweep;
    this.seesPlayer = inVisionCone(
      this.x, this.y, this.angle, this.range, CAMERA_VIEW_HALF_ANGLE,
      player.x, player.y, blockers,
    );
    if (this.seesPlayer) {
      this.spottedFor += dt;
    } else {
      this.spottedFor = 0;
    }
  }
}

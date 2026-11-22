// alarm.js — the alarm meter. It climbs while any guard or camera has eyes
// on the thief (faster on later levels), and drains while the thief stays
// hidden, so a near miss is recoverable. At 100 the building locks down
// and the run is busted.
import { ALARM } from './config.js';

export class AlarmMeter {
  constructor(rateMultiplier) {
    this.rateMultiplier = rateMultiplier;
    this.value = 0;
    this.busted = false;
  }

  update(dt, guardSeeing, cameraSeeing, crackingSafe) {
    let rise = 0;
    if (guardSeeing) rise += ALARM.guardSeenPerSec;
    if (cameraSeeing) rise += ALARM.cameraSeenPerSec;
    if (crackingSafe) rise += ALARM.crackNoisePerSec;
    if (rise > 0) {
      this.value += rise * this.rateMultiplier * dt;
    } else {
      this.value -= ALARM.decayPerSec * dt;
    }
    if (this.value < 0) this.value = 0;
    if (this.value >= ALARM.bustedAt) {
      this.value = ALARM.bustedAt;
      this.busted = true;
    }
  }

  level() {
    if (this.value >= ALARM.hotAt) return 'hot';
    if (this.value >= ALARM.waryAt) return 'wary';
    return 'calm';
  }

  reset() {
    this.value = 0;
    this.busted = false;
  }
}

// audio.js — all sound is synthesised with the Web Audio API, so the game
// ships no audio files. Short blips for loot, a coin clink, a two-note
// alert sting, a low busted drone and a little win arpeggio.
export class SoundBank {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  ensure() {
    if (!this.ctx) {
      try {
        const Ctor = window.AudioContext || window.webkitAudioContext;
        this.ctx = new Ctor();
      } catch (err) {
        this.ctx = null;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  tone(freq, dur, type, volume, when = 0, slideTo = 0) {
    const ctx = this.ensure();
    if (!ctx || !this.enabled) return;
    const start = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (slideTo > 0) osc.frequency.exponentialRampToValueAtTime(slideTo, start + dur);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + dur + 0.05);
  }

  pickup() {
    this.tone(880, 0.09, 'sine', 0.16);
    this.tone(1318, 0.12, 'sine', 0.14, 0.07);
  }

  coin() {
    this.tone(1568, 0.07, 'triangle', 0.14);
    this.tone(2093, 0.1, 'triangle', 0.1, 0.05);
  }

  crackTick() {
    this.tone(320, 0.05, 'square', 0.06);
  }

  vaultOpen() {
    this.tone(523, 0.1, 'sine', 0.15);
    this.tone(659, 0.1, 'sine', 0.15, 0.09);
    this.tone(784, 0.16, 'sine', 0.15, 0.18);
  }

  alert() {
    this.tone(440, 0.12, 'sawtooth', 0.1);
    this.tone(587, 0.14, 'sawtooth', 0.1, 0.11);
  }

  spotted() {
    this.tone(980, 0.08, 'square', 0.07);
  }

  busted() {
    this.tone(220, 0.5, 'sawtooth', 0.14, 0, 110);
    this.tone(165, 0.6, 'sawtooth', 0.1, 0.15, 82);
  }

  levelClear() {
    this.tone(523, 0.12, 'sine', 0.15);
    this.tone(659, 0.12, 'sine', 0.15, 0.1);
    this.tone(784, 0.12, 'sine', 0.15, 0.2);
    this.tone(1046, 0.22, 'sine', 0.16, 0.3);
  }

  win() {
    const notes = [523, 659, 784, 1046, 784, 1046, 1318];
    notes.forEach((freq, i) => this.tone(freq, 0.16, 'sine', 0.14, i * 0.11));
  }
}

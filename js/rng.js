/**
 * Seeded PRNG - Mulberry32
 * Guarantees reproducibility for procedural generation and offline sim.
 */
export class RNG {
  constructor(seed = Date.now()) {
    this.seed = seed >>> 0;
    this.state = this.seed;
  }

  next() {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  int(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  float(min = 0, max = 1) {
    return this.next() * (max - min) + min;
  }

  pick(arr) {
    return arr[this.int(0, arr.length - 1)];
  }

  chance(p) {
    return this.next() < p;
  }

  shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  getState() {
    return this.state;
  }

  setState(s) {
    this.state = s >>> 0;
  }
}

// rng.js — Seedable pseudo-random number generator for Lucky Reels
// Pure ES module, no dependencies. Uses mulberry32 (fast, decent quality).

// Hash a string or number into a 32-bit seed (xmur3-ish).
export function hashSeed(input) {
  let str = String(input == null ? Date.now() + '' + Math.random() : input);
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^= h >>> 16) >>> 0;
}

// mulberry32 core generator.
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Create a seedable RNG instance.
// seed may be a number, string, or omitted (uses time-based random seed).
export function createRng(seed) {
  let state = hashSeed(seed);
  const rand = mulberry32(state);

  const api = {
    // Float in [0, 1)
    next() {
      return rand();
    },
    // Integer in [min, max] inclusive
    int(min, max) {
      return min + Math.floor(rand() * (max - min + 1));
    },
    // Pick a uniformly random element from an array
    pick(arr) {
      return arr[Math.floor(rand() * arr.length)];
    },
    // Weighted pick: items[] with parallel weights[] (positive numbers).
    // Returns the chosen item.
    weightedPick(items, weights) {
      let total = 0;
      for (let i = 0; i < weights.length; i++) total += weights[i];
      let r = rand() * total;
      for (let i = 0; i < items.length; i++) {
        r -= weights[i];
        if (r < 0) return items[i];
      }
      return items[items.length - 1];
    },
    // Weighted index variant (returns the index instead of the item)
    weightedIndex(weights) {
      let total = 0;
      for (let i = 0; i < weights.length; i++) total += weights[i];
      let r = rand() * total;
      for (let i = 0; i < weights.length; i++) {
        r -= weights[i];
        if (r < 0) return i;
      }
      return weights.length - 1;
    },
  };

  return api;
}

// Convenience default instance seeded from time.
export const defaultRng = createRng();

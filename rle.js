/**
 * rle.js — run-length encoding, pure functions.
 *
 * Exports:
 *   encode(s)     — string -> [char, count][]
 *   decode(pairs) — [char, count][] -> string
 */

export function encode(s) {
  const pairs = [];
  for (const ch of s) {
    const last = pairs[pairs.length - 1];
    if (last && last[0] === ch) last[1]++;
    else pairs.push([ch, 1]);
  }
  return pairs;
}

export function decode(pairs) {
  return pairs.map(([ch, count]) => ch.repeat(count)).join('');
}

export function clamp(n, lo, hi) {
  if (lo > hi) {
    throw new Error(`Invalid range: lo (${lo}) > hi (${hi})`);
  }
  if (n < lo) return lo;
  if (n > hi) return hi;
  return n;
}

export function chunk(arr, size) {
  if (size < 1) {
    throw new Error(`chunk: size must be >= 1, got ${size}`);
  }
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

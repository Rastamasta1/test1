/**
 * src/greet.js — greet and shout exports.
 *
 * Exports:
 *   greet(name) → string  'hello, ' + name
 *   shout(name) → string  greet(name).toUpperCase()
 */

export function greet(name) {
  return 'hello, ' + name;
}

export function shout(name) {
  return greet(name).toUpperCase();
}

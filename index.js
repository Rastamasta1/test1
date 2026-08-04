import { diffLines } from './src/diff.js';

console.log('diff module loaded successfully.');

const a = 'hello\nworld\nfoo';
const b = 'hello\nearth\nfoo\nbar';
const result = diffLines(a, b);
console.log('diffLines result:', result);

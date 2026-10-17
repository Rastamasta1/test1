// index.js - Entry point
import { add, list, remove, find, count } from './src/store.js';

console.log('Vinyl Record Store loaded successfully.');
console.log(`Total records in store: ${count()}`);

const allRecords = list();
console.log('Records:');
allRecords.forEach(r => console.log(` - [${r.id}] ${r.name}`));

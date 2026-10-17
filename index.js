// index.js
// Entry point: imports main modules to verify they load correctly

import * as store from './src/store.js';

const records = store.getAll ? store.getAll() : [];
console.log(`Store loaded successfully. Records available: ${records.length}`);

const sample = { id: 'idx-001', name: 'Sample Album', description: 'A sample record entry.', category: 'Sample' };
const validation = store.validate(sample);
console.log('Validation check:', validation);

console.log('App initialised successfully.');

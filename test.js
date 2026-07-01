// End-to-end smoke test for the guestbook flow.
// Run from the browser console after loading index.html:
//   import('./test.js').then(m => m.runSmokeTest());
// Uses the same data service the UI uses, so it exercises the real path.
import { addMessage, getMessages } from './messageService.js';

function assert(cond, label) {
  if (cond) {
    console.log('%cPASS%c ' + label, 'color:#16a34a;font-weight:bold', 'color:inherit');
  } else {
    console.error('FAIL ' + label);
  }
  return cond;
}

export async function runSmokeTest() {
  console.log('--- Guestbook E2E smoke test ---');
  const testName = 'SmokeTest';
  const testMessage = 'e2e-' + Date.now();

  // 1. Insert
  const insertRes = await addMessage(testName, testMessage);
  assert(!insertRes.error, 'insert returns no error');
  assert(Array.isArray(insertRes.data) && insertRes.data.length === 1, 'insert returns the created row');
  if (insertRes.data && insertRes.data[0]) {
    const row = insertRes.data[0];
    assert(row.name === testName, 'inserted name matches');
    assert(row.message === testMessage, 'inserted message matches');
    assert(!!row.created_at, 'created_at is populated by default');
  }

  // 2. Read back and confirm presence + ordering
  const listRes = await getMessages();
  assert(!listRes.error, 'select returns no error');
  assert(Array.isArray(listRes.data), 'select returns an array');
  const found = (listRes.data || []).find((m) => m.message === testMessage);
  assert(!!found, 'inserted message is found in the fetched list');

  if (listRes.data && listRes.data.length > 1) {
    const sortedDesc = listRes.data.every((m, i, arr) =>
      i === 0 || new Date(arr[i - 1].created_at) >= new Date(m.created_at)
    );
    assert(sortedDesc, 'messages are ordered newest-first');
  }

  console.log('--- smoke test complete ---');
  return { insertRes, listRes };
}

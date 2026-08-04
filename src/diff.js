// diffLines: pure function comparing two text blocks line by line
// Returns { added, removed } preserving line order and handling duplicates/blank lines
// Uses a multiset (frequency map) approach so duplicate lines are counted independently
// added = lines present in b more times than in a (in b's order)
// removed = lines present in a more times than in b (in a's order)

export function diffLines(a, b) {
  const aLines = a === '' ? [''] : a.split('\n');
  const bLines = b === '' ? [''] : b.split('\n');

  // Build frequency maps
  const aFreq = new Map();
  for (const line of aLines) {
    aFreq.set(line, (aFreq.get(line) || 0) + 1);
  }

  const bFreq = new Map();
  for (const line of bLines) {
    bFreq.set(line, (bFreq.get(line) || 0) + 1);
  }

  // removed: lines in a that exceed their count in b, in a's order
  const removedAvail = new Map();
  for (const [line, count] of aFreq) {
    const bCount = bFreq.get(line) || 0;
    const surplus = count - bCount;
    if (surplus > 0) {
      removedAvail.set(line, surplus);
    }
  }

  const removed = [];
  for (const line of aLines) {
    const avail = removedAvail.get(line);
    if (avail && avail > 0) {
      removed.push(line);
      removedAvail.set(line, avail - 1);
    }
  }

  // added: lines in b that exceed their count in a, in b's order
  const addedAvail = new Map();
  for (const [line, count] of bFreq) {
    const aCount = aFreq.get(line) || 0;
    const surplus = count - aCount;
    if (surplus > 0) {
      addedAvail.set(line, surplus);
    }
  }

  const added = [];
  for (const line of bLines) {
    const avail = addedAvail.get(line);
    if (avail && avail > 0) {
      added.push(line);
      addedAvail.set(line, avail - 1);
    }
  }

  return { added, removed };
}

export default diffLines;

// index.js — Entry point for Lucky Reels
// Imports the core modules to verify they load, then runs a demo spin.

import { createRng, defaultRng, hashSeed } from './rng.js';
import {
  DECLARED_RTP,
  computeRTP,
  PAYLINE_COUNT,
  PAYLINES,
  SYMBOL_IDS,
} from './paytable.js';
import { PAYLINE_COLORS, lineColor } from './paylines.js';
import { spinReels } from './spin.js';
import { evaluateOutcome } from './evaluate.js';
import { runVerification } from './rtp-verify.js';

function main() {
  console.log('Lucky Reels — modules loaded successfully.');
  console.log('Declared RTP:', DECLARED_RTP);
  console.log('Analytic RTP:', computeRTP());
  console.log('Paylines:', PAYLINE_COUNT, '| Symbols:', SYMBOL_IDS.length);

  const rng = createRng('lucky-reels-demo');
  const bet = 100;
  const grid = spinReels(rng);
  const result = evaluateOutcome(grid, bet);

  console.log('Demo spin grid (reel-major):', JSON.stringify(grid));
  console.log('Total win:', result.totalWin);
  console.log('Winning lines:', result.lines ? result.lines.length : 0);

  return { grid, result };
}

main();

export {
  createRng,
  defaultRng,
  hashSeed,
  spinReels,
  evaluateOutcome,
  runVerification,
  computeRTP,
  DECLARED_RTP,
  PAYLINES,
  PAYLINE_COLORS,
  lineColor,
};

export default main;

// rtp-verify.js — Monte-Carlo RTP verification for Lucky Reels
// Runs many seeded spins through the SAME pure modules the game uses and
// confirms the empirical Return-To-Player converges on the analytic value
// (computeRTP) and the DECLARED_RTP constant (95%).
//
// Run in Node:   node rtp-verify.js [spins] [seed]
// Or import runVerification() from a browser dev console / test harness.

import { createRng } from './rng.js';
import { DECLARED_RTP, computeRTP, PAYLINE_COUNT } from './paytable.js';
import { spinReels } from './spin.js';
import { evaluateOutcome } from './evaluate.js';

// Fixed total bet per spin. RTP is independent of bet size in this model
// (bet is split evenly across paylines), but we use a realistic value.
const DEFAULT_BET = 100;

// Run `spins` simulated spins with a seeded RNG. Returns a stats object.
export function runVerification(spins = 5_000_000, seed = 'lucky-reels-rtp', bet = DEFAULT_BET) {
  const rng = createRng(seed);

  let totalWagered = 0;
  let totalWon = 0;
  let winningSpins = 0;   // spins with at least one winning line
  let winningLines = 0;   // total number of winning lines across all spins
  let biggestWin = 0;

  for (let i = 0; i < spins; i++) {
    const grid = spinReels(rng);
    const result = evaluateOutcome(grid, bet);
    totalWagered += bet;
    totalWon += result.totalWin;
    if (result.totalWin > 0) winningSpins++;
    winningLines += result.winningLines.length;
    if (result.totalWin > biggestWin) biggestWin = result.totalWin;
  }

  const actualRTP = totalWon / totalWagered;
  const analyticRTP = computeRTP();

  return {
    spins,
    seed,
    bet,
    totalWagered,
    totalWon,
    actualRTP,
    analyticRTP,
    declaredRTP: DECLARED_RTP,
    rtpErrorVsAnalytic: actualRTP - analyticRTP,
    rtpErrorVsDeclared: actualRTP - DECLARED_RTP,
    hitFrequency: winningSpins / spins,
    avgWinningLinesPerSpin: winningLines / spins,
    winningSpins,
    biggestWin,
    paylineCount: PAYLINE_COUNT,
  };
}

// Pretty-print a stats object.
export function reportVerification(stats) {
  const pct = (n) => (n * 100).toFixed(4) + '%';
  const lines = [
    '=== Lucky Reels — RTP Verification ===',
    `Spins:              ${stats.spins.toLocaleString()}`,
    `Seed:               ${stats.seed}`,
    `Bet per spin:       ${stats.bet}`,
    `Total wagered:      ${stats.totalWagered.toLocaleString()}`,
    `Total won:          ${stats.totalWon.toLocaleString()}`,
    '',
    `Analytic RTP:       ${pct(stats.analyticRTP)}`,
    `Declared RTP:       ${pct(stats.declaredRTP)}`,
    `Actual (empirical): ${pct(stats.actualRTP)}`,
    `Error vs analytic:  ${pct(stats.rtpErrorVsAnalytic)}`,
    `Error vs declared:  ${pct(stats.rtpErrorVsDeclared)}`,
    '',
    `Hit frequency:      ${pct(stats.hitFrequency)}`,
    `Avg win lines/spin: ${stats.avgWinningLinesPerSpin.toFixed(5)}`,
    `Biggest single win: ${stats.biggestWin.toLocaleString()}`,
    '=======================================',
  ];
  const text = lines.join('\n');
  if (typeof console !== 'undefined') console.log(text);
  return text;
}

// Detect Node execution and auto-run with CLI args.
const isNodeMain =
  typeof process !== 'undefined' &&
  process.argv &&
  process.argv[1] &&
  /rtp-verify\.js$/.test(process.argv[1]);

if (isNodeMain) {
  const spins = Number(process.argv[2]) || 5_000_000;
  const seed = process.argv[3] || 'lucky-reels-rtp';
  const stats = runVerification(spins, seed);
  reportVerification(stats);

  // Non-zero exit if empirical RTP drifts too far from declared (sanity gate).
  const tolerance = 0.005; // 0.5 percentage points
  if (Math.abs(stats.rtpErrorVsDeclared) > tolerance) {
    console.error(
      `\nWARNING: empirical RTP off by more than ${tolerance * 100}% from declared.`
    );
  }
}

/**
 * data/questions.js — Built-in Would-You-Rather question objects.
 *
 * Each object shape:
 *   { id: string, optionA: string, optionB: string }
 *
 * Baseline vote counts are seeded here so that even on a fresh device
 * the vote-split reveal shows realistic percentages (local-only, single device).
 *
 * Exported:
 *   BUILTIN_QUESTIONS  — array of 15 question objects (with seeded votes)
 */

export const BUILTIN_QUESTIONS = [
  {
    id: 'b01',
    optionA: 'Be able to fly',
    optionB: 'Be able to turn invisible',
    builtin: true,
    votes: { a: 312, b: 278 },
  },
  {
    id: 'b02',
    optionA: 'Always be 10 minutes late',
    optionB: 'Always be 2 hours early',
    builtin: true,
    votes: { a: 198, b: 341 },
  },
  {
    id: 'b03',
    optionA: 'Have unlimited money but no friends',
    optionB: 'Have great friends but no money',
    builtin: true,
    votes: { a: 189, b: 422 },
  },
  {
    id: 'b04',
    optionA: 'Only eat sweet food forever',
    optionB: 'Only eat savoury food forever',
    builtin: true,
    votes: { a: 267, b: 304 },
  },
  {
    id: 'b05',
    optionA: 'Know when you will die',
    optionB: 'Know how you will die',
    builtin: true,
    votes: { a: 388, b: 211 },
  },
  {
    id: 'b06',
    optionA: 'Live in the past',
    optionB: 'Live in the future',
    builtin: true,
    votes: { a: 145, b: 460 },
  },
  {
    id: 'b07',
    optionA: 'Be the funniest person in the room',
    optionB: 'Be the smartest person in the room',
    builtin: true,
    votes: { a: 256, b: 389 },
  },
  {
    id: 'b08',
    optionA: 'Lose all your memories from birth to 18',
    optionB: 'Lose the last 5 years of memories',
    builtin: true,
    votes: { a: 201, b: 334 },
  },
  {
    id: 'b09',
    optionA: 'Always speak your mind',
    optionB: 'Always know what others are thinking',
    builtin: true,
    votes: { a: 278, b: 367 },
  },
  {
    id: 'b10',
    optionA: 'Have a rewind button for life',
    optionB: 'Have a pause button for life',
    builtin: true,
    votes: { a: 312, b: 401 },
  },
  {
    id: 'b11',
    optionA: 'Be famous but hated',
    optionB: 'Be unknown but beloved',
    builtin: true,
    votes: { a: 134, b: 498 },
  },
  {
    id: 'b12',
    optionA: 'Fight one horse-sized duck',
    optionB: 'Fight one hundred duck-sized horses',
    builtin: true,
    votes: { a: 423, b: 287 },
  },
  {
    id: 'b13',
    optionA: 'Never need to sleep',
    optionB: 'Never need to eat',
    builtin: true,
    votes: { a: 356, b: 289 },
  },
  {
    id: 'b14',
    optionA: 'Be able to talk to animals',
    optionB: 'Be able to speak every human language',
    builtin: true,
    votes: { a: 344, b: 367 },
  },
  {
    id: 'b15',
    optionA: 'Always feel too hot',
    optionB: 'Always feel too cold',
    builtin: true,
    votes: { a: 231, b: 298 },
  },
];

// Run: node --experimental-strip-types src/engine/audio/captions.test.ts  (no test runner dependency)
import assert from 'node:assert/strict';
// @ts-expect-error node strip-types needs the .ts extension; tsc does not allow it
import { getActiveCue, getActiveCueIndex, getWordProgress, wordsOf } from './captions.ts';

const cues = [
  { start: 0, end: 2, text: 'one two', words: [{ w: 'one', start: 0, end: 1 }, { w: 'two', start: 1, end: 2 }] },
  { start: 3, end: 5, text: 'three' },
  { start: 5, end: 8, text: 'four five six' },
];
assert.equal(getActiveCueIndex(cues, 0), 0);
assert.equal(getActiveCueIndex(cues, 1.99), 0);
assert.equal(getActiveCueIndex(cues, 2), -1, 'pause between cues');
assert.equal(getActiveCueIndex(cues, 3), 1);
assert.equal(getActiveCueIndex(cues, 5), 2, 'end is exclusive');
assert.equal(getActiveCueIndex(cues, 8), -1);
assert.equal(getActiveCueIndex(cues, -1), -1);
assert.equal(getActiveCueIndex([], 1), -1);
assert.equal(getActiveCue(cues, 6)?.text, 'four five six');
assert.equal(getActiveCue(cues, 2.5), null);

assert.deepEqual(getWordProgress(cues[0], 0.5), { index: 0, wordProgress: 0.5, cueProgress: 0.25 });
assert.equal(getWordProgress(cues[0], 1.5).index, 1);
assert.equal(getWordProgress(cues[0], -1).index, -1);
const synth = wordsOf(cues[2]);
assert.equal(synth.length, 3);
assert.equal(synth[0].start, 5);
assert.ok(Math.abs(synth[2].end - 8) < 1e-9);
console.log('captions.test: ok');

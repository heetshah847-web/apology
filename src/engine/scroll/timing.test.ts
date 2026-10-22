// Run: node --experimental-strip-types src/engine/scroll/timing.test.ts  (no test runner dependency)
import assert from 'node:assert/strict';
// @ts-expect-error node needs the .ts extension; tsconfig does not allow it
import { sectionLength, mediaSchedule, activeMediaAt, progressFromScroll, scrollFromProgress } from './timing.ts';

assert.equal(Math.round(sectionLength(22.99, 12)), 276);
assert.equal(Math.round(sectionLength(45.09, 12)), 541);
assert.equal(Math.round(sectionLength(43.31, 12)), 520);

const even = mediaSchedule(10, [{}, {}, {}, {}, {}]);
assert.equal(even.length, 5);
assert.equal(even[2].show, 4);
assert.equal(even[2].hide, 6);
assert.equal(even[2].crossfade, 0.5);
assert.equal(even[4].hide, 10);
assert.equal(activeMediaAt(even, 0), 0);
assert.equal(activeMediaAt(even, 5.99), 2);
assert.equal(activeMediaAt(even, 99), 4);

const anchored = mediaSchedule(10, [{ at: 1 }, {}, { at: 7 }]);
assert.equal(anchored[0].show, 1);
assert.equal(anchored[2].show, 7);

assert.deepEqual(mediaSchedule(10, []), []);
assert.equal(progressFromScroll(500, 100, 800), 0.5);
assert.equal(progressFromScroll(-5, 100, 800), 0);
assert.equal(progressFromScroll(5000, 100, 800), 1);
assert.equal(scrollFromProgress(0.25, 100, 800), 300);
assert.equal(progressFromScroll(scrollFromProgress(0.37, 120, 640), 120, 640), 0.37);
console.log('timing: all tests passed');

// Run: node scripts/align-script.test.mjs  (no test runner dependency)
import assert from 'node:assert/strict';
import { parseScript, parsePhrases, alignToWhisper, splitByPauses, buildCues, alignTrack, gapsOf } from './align-script.mjs';

// script parsing
const md = `# T\n---SCRIPT---\n[[chapter:a]]\nHello there, friend.\n[[photo:x.jpg]]\nSecond line here.\n[[chapter:b]]\n(paste the rest here)\n---END---`;
const sc = parseScript(md);
assert.equal(sc.words.length, 6);
assert.deepEqual(sc.chapterMarks, [{ id: 'a', wordIndex: 0 }, { id: 'b', wordIndex: 6 }]);
assert.deepEqual(sc.photoMarks, [{ file: 'x.jpg', wordIndex: 3 }]);
assert.equal(parseScript('---SCRIPT---\n[[chapter:a]]\n(paste here)\n---END---').isPlaceholder, true);

// phrases
const ph = parsePhrases('# c\n00:01.50-00:03.00 | Hi\n00:04.0 | There', 10);
assert.equal(ph[0].start, 1.5);
assert.equal(ph[1].end, 9.95);

// whisper alignment: extra + missing words
const sw = 'the moon envied her glow'.split(' ').map((t) => ({ text: t, norm: t }));
const wh = [{ w: 'Uh', start: 0, end: 0.1 }, { w: 'the', start: 0.2, end: 0.4 }, { w: 'moon', start: 0.4, end: 0.8 }, { w: 'her', start: 1.4, end: 1.6 }, { w: 'glow.', start: 1.6, end: 2 }];
const al = alignToWhisper(sw, wh);
assert.equal(al.matched, 4);
assert.equal(al.times[0].start, 0.2);
assert.ok(al.times[2].start >= 0.8 && al.times[2].end <= 1.4, 'missing word interpolated between neighbours');

// chapters at the longest pause nearest the ideal split
const gaps = gapsOf([{ start: 0, end: 16.52 }, { start: 17.33, end: 26.28 }, { start: 27.05, end: 45 }]);
const ranges = splitByPauses(['f', 'l'], [1, 1], 45.09, gaps);
assert.deepEqual(ranges, [{ id: 'f', start: 0, end: 27.05 }, { id: 'l', start: 27.05, end: 45.09 }]);

// cue splitting: sentence ends, pauses, 12-word cap
const mk = (n, t0, step) => Array.from({ length: n }, (_, i) => ({ w: `w${i}${i === n - 1 ? '.' : ''}`, start: t0 + i * step, end: t0 + (i + 1) * step - 0.01 }));
const long = buildCues(mk(30, 0, 0.2));
assert.ok(long.every((c) => c.words.length <= 12));
assert.equal(long.reduce((n, c) => n + c.words.length, 0), 30);
const paused = buildCues([...mk(3, 0, 0.3), ...mk(3, 3, 0.3)]);
assert.equal(paused.length, 2);

// end-to-end: queen-style script + phrases, no Whisper -> cues snapped to phrases
const phrasesTxt = '00:00.00-00:03.00 | One two three,\n00:04.00-00:07.00 | four five six.';
const out = alignTrack({ trackId: 't0', chapters: ['q'], duration: 8, scriptMd: '---SCRIPT---\n[[chapter:q]]\nOne two three, four five six.\n---END---', phrasesTxt });
assert.equal(out.cues.length, 2);
assert.deepEqual([out.cues[0].start, out.cues[0].end, out.cues[1].start, out.cues[1].end], [0, 3, 4, 7]);
assert.equal(out.cues[1].text, 'four five six.');
assert.equal(out.needsReview, false);

// two chapters via markers; photo anchor
const two = alignTrack({
  trackId: 't1', chapters: ['a', 'b'], duration: 8,
  scriptMd: '---SCRIPT---\n[[chapter:a]]\nOne two three,\n[[chapter:b]]\n[[photo:p.jpg]]\nfour five six.\n---END---',
  phrasesTxt,
});
assert.deepEqual(two.chapters.map((c) => [c.id, c.start, c.end]), [['a', 0, 4], ['b', 4, 8]]);
assert.equal(two.photoAnchors['p.jpg'], 4);

// placeholder script, no Whisper: empty flagged cues, still timed from the phrase file
const none = alignTrack({ trackId: 't2', chapters: ['a', 'b'], duration: 8, scriptMd: '---SCRIPT---\n(paste)\n---END---', phrasesTxt: '00:00.0-00:03.0\n00:04.0-00:07.0' });
assert.equal(none.needsReview, true);
assert.equal(none.cues.length, 2);
assert.ok(none.cues.every((c) => c.needsReview));
console.log('align-script.test: ok');

import type { AudioDirector, TrackId } from '@/contracts';
import { getTrack } from '../storyData.stub';

type Evt = 'time' | 'ended' | 'play' | 'pause';
type Cb = (trackId: TrackId, t: number) => void;

/** Silent clock built on performance.now(): same interface as the real director, no sound. */
function createStub(): AudioDirector {
  const listeners: Record<Evt, Set<Cb>> = { time: new Set(), ended: new Set(), play: new Set(), pause: new Set() };
  let track: TrackId | null = null;
  let playing = false;
  let base = 0;
  let startedAt = 0;
  let raf = 0;

  const dur = (id: TrackId) => getTrack(id).audio.durationSec;
  const now = () => (playing ? base + (performance.now() - startedAt) / 1000 : base);
  const emit = (e: Evt) => track && listeners[e].forEach((cb) => cb(track!, Math.min(now(), dur(track!))));

  const tick = () => {
    if (!playing || !track) return;
    if (now() >= dur(track)) {
      base = dur(track);
      playing = false;
      emit('time');
      emit('ended');
      return;
    }
    emit('time');
    raf = requestAnimationFrame(tick);
  };

  return {
    async unlock() {},
    load(id) { track = id; base = 0; playing = false; },
    async play(id, fromSec) {
      if (track !== id) { track = id; base = 0; }
      if (fromSec !== undefined) base = fromSec;
      startedAt = performance.now();
      playing = true;
      emit('play');
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    },
    pause() { base = now(); playing = false; cancelAnimationFrame(raf); emit('pause'); },
    seek(sec) { base = sec; startedAt = performance.now(); emit('time'); },
    currentTime: () => (track ? Math.min(now(), dur(track)) : 0),
    duration: (id) => dur(id),
    setMuted() {},
    music: { play() {}, duck() {}, stop() {} },
    sfx() {},
    on(evt, cb) { listeners[evt].add(cb); return () => { listeners[evt].delete(cb); }; },
  };
}

export const audioDirector: AudioDirector = createStub();

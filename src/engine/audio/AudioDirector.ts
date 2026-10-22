import type { AudioDirector, TrackId } from '@/contracts';
import { getTrack, story } from '../storyData.stub';

type Evt = 'time' | 'ended' | 'play' | 'pause';
type Cb = (trackId: TrackId, t: number) => void;
type MusicName = 'bed' | 'yes' | 'planner';
type SfxName = 'unfold' | 'pin' | 'chime' | 'pop';

const DUCK_LEVEL = 0.2;
const DUCK_MS = 400;
const SFX_POOL = 3;
const READY_TIMEOUT_MS = 2500;
const noop = () => {};

interface Voice {
  el: HTMLAudioElement;
  /** 'element' = the file drives time; 'clock' = silent performance.now() fallback (blocked autoplay, missing file). */
  mode: 'element' | 'clock';
  base: number;
  startedAt: number;
  playing: boolean;
  ended: boolean;
}

function create(): AudioDirector {
  const listeners: Record<Evt, Set<Cb>> = { time: new Set(), ended: new Set(), play: new Set(), pause: new Set() };
  const voices = new Map<TrackId, Voice>();
  let current: TrackId | null = null;
  let muted = false;
  let raf = 0;

  const dur = (id: TrackId) => getTrack(id).audio.durationSec;
  const emit = (e: Evt, id: TrackId, t: number) => listeners[e].forEach((cb) => cb(id, t));

  // ───── voice ─────
  const voice = (id: TrackId): Voice => {
    let v = voices.get(id);
    if (!v) {
      const el = new Audio();
      el.preload = 'metadata';
      el.src = getTrack(id).audio.src;
      el.muted = muted;
      v = { el, mode: 'element', base: 0, startedAt: 0, playing: false, ended: false };
      const owner = v;
      el.addEventListener('ended', () => finish(id));
      el.addEventListener('error', () => { owner.mode = 'clock'; });
      voices.set(id, v);
    }
    return v;
  };

  const timeOf = (id: TrackId): number => {
    const v = voices.get(id);
    if (!v) return 0;
    const t = v.mode === 'element' ? v.el.currentTime : v.base + (v.playing ? (performance.now() - v.startedAt) / 1000 : 0);
    return Math.min(Math.max(t, 0), dur(id));
  };

  const finish = (id: TrackId) => {
    const v = voices.get(id);
    if (!v || v.ended) return;
    v.ended = true;
    v.playing = false;
    v.base = dur(id);
    cancelAnimationFrame(raf);
    emit('time', id, dur(id));
    duck(false);
    emit('ended', id, dur(id));
  };

  const tick = () => {
    if (!current) return;
    const v = voices.get(current);
    if (!v?.playing) return;
    const t = timeOf(current);
    emit('time', current, t);
    if (t >= dur(current) - 0.005 && (v.mode === 'clock' || v.el.ended || t >= dur(current))) { finish(current); return; }
    raf = requestAnimationFrame(tick);
  };

  const whenReady = (el: HTMLAudioElement) =>
    new Promise<boolean>((resolve) => {
      if (el.readyState >= 1) return resolve(true);
      const done = (ok: boolean) => { clearTimeout(timer); el.removeEventListener('loadedmetadata', onOk); el.removeEventListener('error', onErr); resolve(ok); };
      const onOk = () => done(true);
      const onErr = () => done(false);
      const timer = setTimeout(() => done(false), READY_TIMEOUT_MS);
      el.addEventListener('loadedmetadata', onOk);
      el.addEventListener('error', onErr);
      el.load();
    });

  const startClock = (v: Voice, at: number) => { v.mode = 'clock'; v.base = at; v.startedAt = performance.now(); v.playing = true; };

  // ───── music bed (Web Audio gain so ducking also works on iOS, where element.volume is read-only) ─────
  let ctx: AudioContext | null = null;
  interface Bed { name: MusicName; el: HTMLAudioElement; gain: GainNode | null; fade: number }
  let bed: Bed | null = null;
  let ducked = false;
  let musicWanted: MusicName | null = null;

  const level = () => (ducked ? DUCK_LEVEL : 1);
  const ramp = (b: Bed, to: number, ms: number, done?: () => void) => {
    cancelAnimationFrame(b.fade);
    if (b.gain && ctx) {
      const now = ctx.currentTime;
      b.gain.gain.cancelScheduledValues(now);
      b.gain.gain.setValueAtTime(b.gain.gain.value, now);
      b.gain.gain.linearRampToValueAtTime(to, now + ms / 1000);
      if (done) setTimeout(done, ms);
      return;
    }
    const from = b.el.volume, t0 = performance.now();
    const step = () => {
      const k = Math.min(1, (performance.now() - t0) / ms);
      b.el.volume = from + (to - from) * k;
      if (k < 1) b.fade = requestAnimationFrame(step); else done?.();
    };
    step();
  };

  function duck(on: boolean) {
    ducked = on;
    if (bed) ramp(bed, level(), DUCK_MS);
  }

  const stopBed = (b: Bed, ms: number) => ramp(b, 0, ms, () => { b.el.pause(); b.gain?.disconnect(); });

  function playMusic(name: MusicName) {
    musicWanted = name;
    if (bed?.name === name && !bed.el.paused) return;
    if (bed) stopBed(bed, 500);
    const el = new Audio(`/media/music/${name}.mp3`);
    el.loop = name !== 'yes';
    el.muted = muted;
    let gain: GainNode | null = null;
    try {
      if (ctx) {
        gain = ctx.createGain();
        ctx.createMediaElementSource(el).connect(gain);
        gain.connect(ctx.destination);
        gain.gain.value = 0;
      } else el.volume = 0;
    } catch { gain = null; el.volume = 0; }
    const b: Bed = { name, el, gain, fade: 0 };
    bed = b;
    el.addEventListener('error', () => { if (bed === b) bed = null; }); // file not provided yet: stay silent
    el.play().then(() => { if (bed === b) ramp(b, level(), 800); }).catch(noop);
  }

  // ───── sfx ─────
  const sfxPool = new Map<SfxName, { els: HTMLAudioElement[]; i: number }>();
  const playSfx = (name: SfxName) => {
    if (muted) return;
    let p = sfxPool.get(name);
    if (!p) {
      p = { els: Array.from({ length: SFX_POOL }, () => { const a = new Audio(`/media/sfx/${name}.mp3`); a.preload = 'auto'; return a; }), i: 0 };
      sfxPool.set(name, p);
    }
    const el = p.els[p.i++ % p.els.length];
    try { el.currentTime = 0; } catch { /* not loaded yet */ }
    el.play().catch(noop);
  };

  // ───── tab visibility ─────
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) api.pause();
      if (bed) { if (document.hidden) bed.el.pause(); else if (musicWanted && !muted) bed.el.play().catch(noop); }
    });
  }

  const api: AudioDirector = {
    async unlock() {
      try {
        const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (AC && !ctx) ctx = new AC();
        await ctx?.resume();
      } catch { ctx = null; }
      // iOS: every element that will ever play must have been started inside a gesture once.
      await Promise.all(story.tracks.map(async (t) => {
        const v = voice(t.id);
        if (v.playing) return;
        const was = v.el.muted;
        v.el.muted = true;
        try { await v.el.play(); v.el.pause(); v.el.currentTime = 0; } catch { /* blocked or missing: clock fallback will take over */ }
        v.el.muted = was;
      }));
    },
    load(id) { voice(id).el.preload = 'auto'; },
    async play(id, fromSec) {
      if (current && current !== id) api.pause();
      current = id;
      const v = voice(id);
      const at = fromSec ?? (v.ended || timeOf(id) >= dur(id) - 0.05 ? 0 : timeOf(id));
      v.ended = false;
      if (v.mode === 'element') {
        v.el.preload = 'auto';
        v.el.muted = muted;
        const ok = await whenReady(v.el);
        if (ok) {
          try { v.el.currentTime = at; await v.el.play(); v.playing = true; } catch { startClock(v, at); }
        } else startClock(v, at);
      } else startClock(v, at);
      duck(true);
      emit('play', id, at);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    },
    pause() {
      if (!current) return;
      const v = voices.get(current);
      if (!v || !v.playing) return;
      const t = timeOf(current);
      v.base = t;
      v.playing = false;
      v.el.pause();
      cancelAnimationFrame(raf);
      duck(false);
      emit('pause', current, t);
    },
    seek(sec) {
      if (!current) return;
      const v = voice(current);
      const t = Math.min(Math.max(sec, 0), dur(current));
      v.ended = false;
      v.base = t;
      v.startedAt = performance.now();
      if (v.mode === 'element') { try { v.el.currentTime = t; } catch { /* metadata not loaded yet */ } }
      emit('time', current, t);
    },
    currentTime: () => (current ? timeOf(current) : 0),
    duration: (id) => dur(id),
    setMuted(m) {
      muted = m;
      voices.forEach((v) => { v.el.muted = m; });
      if (bed) bed.el.muted = m;
    },
    music: { play: playMusic, duck, stop() { musicWanted = null; if (bed) { stopBed(bed, 500); bed = null; } } },
    sfx: playSfx,
    on(evt, cb) { listeners[evt].add(cb); return () => { listeners[evt].delete(cb); }; },
  };
  return api;
}

export const audioDirector: AudioDirector = create();

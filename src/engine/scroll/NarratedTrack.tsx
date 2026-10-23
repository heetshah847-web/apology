import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMotionValue, useReducedMotion } from 'motion/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { SCROLL_TO_DURATION, SCROLL_VH_PER_SEC, type CaptionCue, type NarratedTrackProps, type NarrationMode, type PhaseData } from '@/contracts';
import { audioDirector } from '@/engine';
import { useStoryStore } from '@/state/storyStore';
import { getPhasesOfTrack, getTrack, story } from '../storyData.stub';
import { TrackContext, type TrackContextValue } from './context';
import { useSmoothScroll } from './SmoothScroll';
import { activeMediaAt, mediaSchedule, progressFromScroll, scrollFromProgress, sectionLength } from './timing';
import { CueStepper, DebugOverlay, MiniMap, ResumeVoice, SkipControl } from './TrackUI';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const THEME_VARS = ['--stage', '--stage-deep', '--glow', '--accent'] as const;
const HANDOFF_SEC = 1.2;
/** After the last voice ends, the screen holds in silence this long before gliding on to The Question. */
const END_HOLD_SEC = 1.5;
/** A scroll position this far from where guided mode put it means she dragged the scrollbar. */
const USER_SCROLL_PX = 40;
const SCROLL_KEYS = new Set(['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' ', 'Spacebar']);

/** Tweens the stage colours to the next chapter's theme over the hand-off. */
function tweenTheme(el: HTMLElement, theme: string, duration: number) {
  const from = getComputedStyle(el);
  const frozen = THEME_VARS.map((v) => from.getPropertyValue(v));
  THEME_VARS.forEach((v, i) => el.style.setProperty(v, frozen[i]));
  const probe = document.createElement('div');
  probe.setAttribute('data-theme', theme);
  el.appendChild(probe);
  const to = getComputedStyle(probe);
  const target: Record<string, string> = {};
  THEME_VARS.forEach((v) => { target[v] = to.getPropertyValue(v); });
  probe.remove();
  el.setAttribute('data-theme', theme); // non-colour tokens (photo filter) switch at once
  gsap.to(el, { ...target, duration, ease: 'sine.inOut', overwrite: true });
}

function chapterAt(phases: PhaseData[], t: number): PhaseData | null {
  return phases.find((p) => t >= p.start && t < p.end) ?? (t >= (phases.at(-1)?.end ?? Infinity) ? phases.at(-1)! : null);
}

/**
 * One pinned section for a whole voice track. Chapter components inside are mounted together and
 * show themselves by time range via useChapter(). The voice is the clock (guided); any user input
 * hands control to her scroll (free); scrolling or narration to the end marks the track done.
 */
export function NarratedTrack({ trackId, children }: NarratedTrackProps) {
  const root = useRef<HTMLElement>(null);
  const reduced = !!useReducedMotion();
  const smooth = useSmoothScroll();
  const smoothRef = useRef(smooth);
  smoothRef.current = smooth;

  const duration = getTrack(trackId).audio.durationSec;
  const phases = useMemo(() => getPhasesOfTrack(trackId), [trackId]);
  const cues = useMemo(() => phases.flatMap((p) => p.captions).sort((a, b) => a.start - b.start), [phases]);
  const debug = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1';

  const time = useMotionValue(0);
  const progress = useMotionValue(0);
  const scrollProgress = useMotionValue(0);
  const drift = useMotionValue(0);

  const [mode, setModeState] = useState<NarrationMode>('idle');
  const modeRef = useRef<NarrationMode>('idle');
  const [activeCue, setActiveCue] = useState<CaptionCue | null>(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [activePhase, setActivePhase] = useState<PhaseData | null>(phases[0] ?? null);
  const cueIndex = useRef(0);

  const finishRef = useRef<() => void>(() => {});
  const resumeRef = useRef<() => void>(() => {});

  const setMode = useCallback((m: NarrationMode) => {
    modeRef.current = m;
    setModeState(m);
    useStoryStore.getState().setNarration({ trackId, mode: m });
  }, [trackId]);

  // Derive chapter, caption and photo from track time (one subscription for the whole track).
  useEffect(() => {
    let lastPhase: string | null = null;
    let lastStore = -1;
    const apply = (t: number) => {
      const phase = chapterAt(phases, t);
      const cue = phase?.captions.find((c) => t >= c.start && t < c.end) ?? null;
      setActiveCue((prev) => (prev === cue ? prev : cue));
      if (phase) {
        const dur = phase.end - phase.start;
        const sched = mediaSchedule(dur, phase.media.map((m) => ({ at: m.at === undefined ? undefined : m.at - phase.start })));
        const idx = activeMediaAt(sched, Math.min(dur, Math.max(0, t - phase.start)));
        setActiveMediaIndex((prev) => (prev === idx ? prev : idx));
      }
      if (phase && phase.id !== lastPhase) {
        const first = lastPhase === null;
        lastPhase = phase.id;
        setActivePhase(phase);
        useStoryStore.getState().setCurrentPhase(phase.id);
        if (root.current) tweenTheme(root.current, phase.theme, first || reduced ? 0 : HANDOFF_SEC);
      }
      if (Math.abs(t - lastStore) >= 0.25) {
        lastStore = t;
        useStoryStore.getState().setNarration({ trackId, phaseId: phase?.id ?? null, time: t, progress: t / duration });
      }
    };
    apply(time.get());
    return time.on('change', apply);
  }, [phases, trackId, duration, reduced, time]);

  useGSAP(() => {
    const el = root.current;
    if (!el || reduced) return;

    const lengthPx = () => (sectionLength(duration, SCROLL_VH_PER_SEC) / 100) * window.innerHeight;
    let lastDrivenY = 0;

    const setClock = (t: number) => {
      time.set(t);
      progress.set(t / duration);
    };

    // Guided mode starts the first time the pin is entered, if sound has been unlocked.
    function startGuided(y: number) {
      if (modeRef.current !== 'idle' || !useStoryStore.getState().unlocked) return;
      lastDrivenY = y;
      audioDirector.load(trackId);
      void audioDirector.play(trackId, 0);
      setMode('guided');
    }

    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: () => `+=${lengthPx()}`,
      pin: true,
      invalidateOnRefresh: true,
      onEnter: (self) => startGuided(self.scroll()),
      onEnterBack: () => {
        if (modeRef.current === 'done') setMode('free');
      },
      onUpdate: (self) => {
        scrollProgress.set(self.progress);
        if (modeRef.current === 'guided') {
          drift.set(Math.abs(self.progress - progress.get()));
          if (Math.abs(self.scroll() - lastDrivenY) > USER_SCROLL_PX) toFree();
          return;
        }
        if (modeRef.current === 'idle' && self.progress > 0) {
          startGuided(self.scroll());
          if (modeRef.current === 'idle') setMode('free');
        }
        if (modeRef.current === 'idle' || modeRef.current === 'free' || modeRef.current === 'done') {
          // Free mode: time comes from scroll (docs/04-TIMING-MATH.md §3).
          setClock(progressFromScroll(self.scroll(), self.start, self.end - self.start) * duration);
          if (self.progress >= 1 && modeRef.current === 'free') setMode('done');
          else if (self.progress < 1 && modeRef.current === 'done') setMode('free');
        }
      },
    });

    function toFree() {
      if (modeRef.current !== 'guided') return;
      audioDirector.pause();
      setMode('free');
    }

    // The silence hold only follows a natural end of the final track; Skip and any user input glide at once or cancel it.
    let holdTimer = 0;
    const cancelHold = () => { window.clearTimeout(holdTimer); holdTimer = 0; };
    const finish = (holdSec = 0) => {
      audioDirector.pause();
      setClock(duration);
      setMode('done');
      // After a hold the screen rises onto the next section (The Question); otherwise the old 1px nudge past the pin.
      const glide = () => { holdTimer = 0; smoothRef.current.scrollTo(st.end + (holdSec > 0 ? window.innerHeight : 1), { duration: SCROLL_TO_DURATION }); };
      if (holdSec > 0) holdTimer = window.setTimeout(glide, holdSec * 1000);
      else glide();
    };
    finishRef.current = () => {
      cancelHold();
      audioDirector.seek(duration);
      finish();
    };
    resumeRef.current = () => {
      const t = time.get();
      audioDirector.seek(t);
      void audioDirector.play(trackId, t);
      setMode('guided');
    };

    const offTime = audioDirector.on('time', (id, t) => {
      if (id !== trackId || modeRef.current !== 'guided') return;
      setClock(t);
      const y = scrollFromProgress(t / duration, st.start, st.end - st.start);
      lastDrivenY = y;
      smoothRef.current.scrollTo(y, { immediate: true });
    });
    const offEnded = audioDirector.on('ended', (id) => {
      if (id === trackId && modeRef.current === 'guided') finish(trackId === story.tracks.at(-1)?.id ? END_HOLD_SEC : 0);
    });

    const onInput = () => { cancelHold(); toFree(); };
    const onKey = (e: KeyboardEvent) => { if (SCROLL_KEYS.has(e.key)) { cancelHold(); toFree(); } };
    const onVisibility = () => { if (document.hidden) toFree(); };
    window.addEventListener('wheel', onInput, { passive: true });
    window.addEventListener('touchstart', onInput, { passive: true });
    window.addEventListener('keydown', onKey);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelHold();
      offTime();
      offEnded();
      window.removeEventListener('wheel', onInput);
      window.removeEventListener('touchstart', onInput);
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('visibilitychange', onVisibility);
      st.kill();
      if (modeRef.current === 'guided') audioDirector.pause();
    };
  }, { scope: root, dependencies: [trackId, reduced, duration] });

  // Reduced motion: no pin, no scrub; Next / Prev step through the captions.
  const goCue = (i: number) => {
    if (!cues.length) return;
    cueIndex.current = Math.min(cues.length - 1, Math.max(0, i));
    const t = cues[cueIndex.current].start + 0.001;
    time.set(t);
    progress.set(t / duration);
    setMode(cueIndex.current === cues.length - 1 ? 'done' : 'free');
  };

  const ctx: TrackContextValue = {
    trackId, duration, phases, time, progress, scrollProgress, drift, mode, activeCue, activeMediaIndex,
  };

  const chromeStyle: React.CSSProperties = { position: 'absolute', zIndex: 20, display: 'flex', gap: 10, alignItems: 'center' };

  return (
    <section
      ref={root}
      data-track={trackId}
      data-mode={mode}
      data-theme={phases[0]?.theme}
      aria-label={activePhase?.title}
      style={{
        position: 'relative',
        height: '100svh',
        overflow: 'hidden',
        color: 'var(--ink)',
        background: 'radial-gradient(120% 90% at 50% 20%, var(--stage), var(--stage-deep))',
      }}
    >
      <TrackContext.Provider value={ctx}>
        {children}
        {debug && <DebugOverlay mode={mode} />}
      </TrackContext.Provider>

      <div style={{ ...chromeStyle, top: 'max(16px, env(safe-area-inset-top))', left: 16, right: 176, height: 32, alignItems: 'center', justifyContent: 'flex-end' }}>
        <MiniMap phases={phases} activeId={activePhase?.id ?? null} />
      </div>
      <div style={{ ...chromeStyle, bottom: 'max(16px, env(safe-area-inset-bottom))', right: 16 }}>
        {reduced ? (
          <CueStepper onPrev={() => goCue(cueIndex.current - 1)} onNext={() => goCue(cueIndex.current + 1)} />
        ) : (
          <>
            {mode === 'free' && <ResumeVoice onClick={() => resumeRef.current()} />}
            {(mode === 'guided' || mode === 'free') && <SkipControl onClick={() => finishRef.current()} />}
          </>
        )}
      </div>
    </section>
  );
}

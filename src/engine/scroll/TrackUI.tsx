import { useEffect, useState } from 'react';
import { useMotionValueEvent } from 'motion/react';
import type { NarrationMode, PhaseData } from '@/contracts';
import { useTrack } from './context';

// Minimal local controls. LANE-02's design-system versions replace these when they land.
const btn: React.CSSProperties = {
  font: '500 14px/1.2 var(--font-ui, system-ui)',
  letterSpacing: '0.04em',
  color: 'var(--ink, #f4efe6)',
  background: 'color-mix(in oklab, var(--stage-deep, #17122c) 70%, transparent)',
  border: '1px solid var(--ink-faint, rgba(244,239,230,.38))',
  borderRadius: 999,
  padding: '10px 18px',
  minHeight: 44,
  cursor: 'pointer',
  backdropFilter: 'blur(8px)',
};

export function ResumeVoice({ onClick }: { onClick: () => void }) {
  return <button type="button" style={btn} onClick={onClick}>Resume voice</button>;
}

export function SkipControl({ onClick }: { onClick: () => void }) {
  return <button type="button" style={{ ...btn, opacity: 0.8 }} onClick={onClick}>Skip</button>;
}

export function CueStepper({ onPrev, onNext }: { onPrev: () => void; onNext: () => void }) {
  return (
    <>
      <button type="button" style={btn} onClick={onPrev}>Previous</button>
      <button type="button" style={btn} onClick={onNext}>Next</button>
    </>
  );
}

/** Small corner indicator: which territory of the atlas the story is in. */
export function MiniMap({ phases, activeId }: { phases: PhaseData[]; activeId: string | null }) {
  return (
    <ol aria-label="Atlas position" style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', gap: 10, font: '500 12px/1 var(--font-ui, system-ui)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
      {phases.map((p) => (
        <li key={p.id} aria-current={p.id === activeId ? 'step' : undefined} style={{ color: p.id === activeId ? 'var(--accent, #d9b76e)' : 'var(--ink-faint, rgba(244,239,230,.38))', transition: 'color .6s' }}>
          {p.mapTerritory}
        </li>
      ))}
    </ol>
  );
}

/** ?debug=1 overlay: t, p, scroll p, drift, mode. */
export function DebugOverlay({ mode }: { mode: NarrationMode }) {
  const { time, progress, scrollProgress, drift, duration } = useTrack();
  const [v, setV] = useState({ t: 0, p: 0, sp: 0, d: 0 });
  const refresh = () => setV({ t: time.get(), p: progress.get(), sp: scrollProgress.get(), d: drift.get() });
  useMotionValueEvent(time, 'change', refresh);
  useMotionValueEvent(scrollProgress, 'change', refresh);
  useEffect(refresh, []); // eslint-disable-line react-hooks/exhaustive-deps
  const bad = mode === 'guided' && v.d >= 0.02;
  return (
    <pre data-testid="debug-overlay" data-drift={v.d.toFixed(4)} data-mode={mode} style={{ position: 'fixed', left: 8, bottom: 8, zIndex: 9999, margin: 0, padding: '6px 10px', font: '12px/1.4 ui-monospace, monospace', color: bad ? '#ff8080' : '#9fe3a5', background: 'rgba(0,0,0,.7)', borderRadius: 6, pointerEvents: 'none' }}>
      {`t ${v.t.toFixed(2)}/${duration.toFixed(2)}s\np ${v.p.toFixed(4)}\nscroll p ${v.sp.toFixed(4)}\ndrift ${v.d.toFixed(4)}\nmode ${mode}`}
    </pre>
  );
}

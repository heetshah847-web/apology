import type { PhaseId } from '@/contracts';
import { useChapter } from '@/engine';

/** Shared stub view for every chapter: title, current placeholder photo, active caption, progress bar. */
export function ChapterStub({ phaseId }: { phaseId: PhaseId }) {
  const c = useChapter(phaseId);
  const opacity = c.isActive ? Math.min(c.enter, 1 - c.exit) : 0;
  const photo = c.phase.media[c.activeMediaIndex];
  return (
    <div data-chapter={phaseId} className="absolute inset-0 flex items-center justify-center bg-neutral-950 text-stone-100" style={{ opacity, pointerEvents: c.isActive ? 'auto' : 'none' }}>
      {photo && <img src={photo.src} alt={photo.alt} className="absolute inset-0 h-full w-full object-cover opacity-40" />}
      <div className="relative z-10 px-6 text-center">
        <p className="text-xs uppercase tracking-[0.3em] opacity-60">{c.phase.mapTerritory} · stub</p>
        <h2 className="mt-3 text-5xl font-semibold">{c.phase.title}</h2>
        {c.phase.subtitle && <p className="mt-2 opacity-70">{c.phase.subtitle}</p>}
        <p className="mt-8 min-h-[3rem] text-lg">{c.activeCue?.text}</p>
        <p className="mt-2 text-xs opacity-50">photo {c.activeMediaIndex + 1}/{c.phase.media.length} · {c.phase.start}s–{c.phase.end}s</p>
      </div>
    </div>
  );
}

import { audioDirector } from '@/engine';
import { useStoryStore } from '@/state/storyStore';

/** Stub: a "Tap to unfold" button that unlocks audio (the real one animates the map). */
export function MapOpening() {
  const setSoundOn = useStoryStore((s) => s.setSoundOn);
  const setUnlocked = useStoryStore((s) => s.setUnlocked);
  return (
    <section className="flex h-[100svh] flex-col items-center justify-center gap-4 bg-stone-900 text-stone-100">
      <p className="text-xs uppercase tracking-[0.3em] opacity-60">Inside the story of · stub</p>
      <h1 className="text-5xl font-semibold">Heet &amp; Tanisha</h1>
      <button
        className="rounded-full border border-stone-100/40 px-6 py-3"
        onClick={async () => { await audioDirector.unlock(); setSoundOn(true); setUnlocked(true); }}
      >
        Tap to unfold — sound on
      </button>
      <p className="text-sm opacity-50">Scroll to step inside</p>
    </section>
  );
}

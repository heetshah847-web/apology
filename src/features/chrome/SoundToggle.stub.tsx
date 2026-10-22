import { audioDirector } from '@/engine';
import { useStoryStore } from '@/state/storyStore';

/** Stub of the quiet header toggle (LANE-02 designs it, LANE-04 wires it). */
export function SoundToggle() {
  const soundOn = useStoryStore((s) => s.soundOn);
  const setSoundOn = useStoryStore((s) => s.setSoundOn);
  return (
    <button
      className="fixed right-4 top-4 z-50 rounded-full bg-black/50 px-4 py-2 text-xs uppercase tracking-widest text-white backdrop-blur"
      onClick={() => { audioDirector.setMuted(soundOn); setSoundOn(!soundOn); }}
    >
      {soundOn ? 'Sound on' : 'Tap for sound'}
    </button>
  );
}

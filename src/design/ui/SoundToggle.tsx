import { useStoryStore } from '@/state/storyStore';

export interface SoundToggleProps { onChange?: (soundOn: boolean) => void }

/** UI only: flips the store flag; LANE-04 reacts to it. Labels per spec: "Sound off" / "Tap for sound". */
export function SoundToggle({ onChange }: SoundToggleProps) {
  const soundOn = useStoryStore((s) => s.soundOn);
  const setSoundOn = useStoryStore((s) => s.setSoundOn);
  return (
    <button
      type="button"
      aria-pressed={soundOn}
      onClick={() => { setSoundOn(!soundOn); onChange?.(!soundOn); }}
      className="inline-flex items-center gap-2 rounded-full border px-3 py-[7px] text-[length:var(--text-ui)] font-semibold"
      style={{ borderColor: 'var(--line)', background: 'color-mix(in oklab, var(--stage-deep) 70%, transparent)', color: 'var(--ink)', backdropFilter: 'blur(8px)' }}
    >
      <span aria-hidden className={`eq ${soundOn ? 'eq-on' : ''}`}><i /><i /><i /></span>
      {soundOn ? 'Sound on' : 'Tap for sound'}
    </button>
  );
}

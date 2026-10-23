import { AnimatePresence, motion } from 'motion/react';
import { useStoryStore } from '@/state/storyStore';
import { Button } from './Button';

/** Shown while she is scrolling herself (mode "free"). `visible` overrides the store (for the /design page). */
export function ResumeVoice({ onResume, visible }: { onResume: () => void; visible?: boolean }) {
  const free = useStoryStore((s) => s.narration.mode === 'free');
  const show = visible ?? free;
  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} className="fixed bottom-6 right-[var(--gutter)] z-40">
          <Button variant="ghost" onClick={onResume} style={{ background: 'rgba(255,255,255,.9)', backdropFilter: 'blur(8px)' }}>Resume voice</Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

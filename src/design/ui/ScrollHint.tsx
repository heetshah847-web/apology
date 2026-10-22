import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

/** "Scroll to step inside" — gone after the first scroll. */
export function ScrollHint({ label = 'Scroll to step inside' }: { label?: string }) {
  const [shown, setShown] = useState(true);
  useEffect(() => {
    const on = () => { if (window.scrollY > 8) setShown(false); };
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return (
    <AnimatePresence>
      {shown && (
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none fixed inset-x-0 bottom-8 z-30 flex flex-col items-center gap-2 text-[length:var(--text-ui)] font-medium"
          style={{ color: 'var(--ink-soft)' }}
        >
          {label}
          <span aria-hidden className="hint-line" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

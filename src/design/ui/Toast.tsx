import { useEffect, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';

export function Toast({ open, onClose, duration = 3200, children }: { open: boolean; onClose: () => void; duration?: number; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [open, duration, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="status" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-3 text-[length:var(--text-ui)] font-medium"
          style={{ background: 'var(--moon-pearl)', color: 'var(--night-ink)', boxShadow: 'var(--shadow-lift)' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

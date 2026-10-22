import { useEffect, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';

export interface SheetProps { open: boolean; onClose: () => void; title?: string; children: ReactNode }

/** Bottom sheet (dialog). Esc / backdrop closes. */
export function Sheet({ open, onClose, title, children }: SheetProps) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <motion.div className="absolute inset-0" style={{ background: 'rgb(8 6 15 / .6)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            role="dialog" aria-modal="true" aria-label={title}
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-xl rounded-t-[28px] p-6 pb-10"
            style={{ background: 'var(--stage-deep)', color: 'var(--ink)', boxShadow: 'var(--shadow-lift)', borderTop: '1px solid var(--line)' }}
          >
            <div aria-hidden className="mx-auto mb-4 h-1 w-10 rounded-full" style={{ background: 'var(--line)' }} />
            {title && <h3 className="m-0 mb-3" style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}>{title}</h3>}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

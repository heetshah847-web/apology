import { motion, useReducedMotion, useTransform, type MotionValue } from 'motion/react';
import type { ElementType } from 'react';
import { clsx } from 'clsx';
import { useProgress } from './useProgress';

export interface StatementTextProps {
  /** Use "\n" for line breaks. */
  text: string;
  /** 0..1 — from scroll or voice. A plain number is allowed. */
  progress: MotionValue<number> | number;
  /** Reveal word by word (default) or line by line. */
  mode?: 'words' | 'lines';
  size?: 'hero' | 'statement' | 'small';
  as?: ElementType;
  className?: string;
}

const SIZE = { hero: 'var(--text-hero)', statement: 'var(--text-statement)', small: 'var(--text-statement-sm)' } as const;

function Unit({ children, i, n, progress }: { children: string; i: number; n: number; progress: MotionValue<number> }) {
  const a = i / n, b = Math.max(a + 0.001, (i + 1) / n);
  const opacity = useTransform(progress, [a, b], [0.12, 1]);
  const y = useTransform(progress, [a, b], ['0.22em', '0em']);
  return <motion.span style={{ opacity, y, display: 'inline-block', willChange: 'transform, opacity' }}>{children}</motion.span>;
}

/** The main caption display: huge statement typography revealed from a 0..1 value. */
export function StatementText({ text, progress, mode = 'words', size = 'statement', as: Tag = 'p', className }: StatementTextProps) {
  const reduce = useReducedMotion();
  const mv = useProgress(progress);
  const lines = text.split('\n');
  const units = mode === 'lines'
    ? lines.map((l) => [l])
    : lines.map((l) => l.split(/\s+/).filter(Boolean));
  const total = units.reduce((a, u) => a + u.length, 0);
  let k = 0;
  return (
    <Tag
      aria-label={text.replace(/\n/g, ' ')}
      className={clsx('m-0 text-balance text-center', className)}
      style={{ fontFamily: 'var(--font-display)', fontSize: SIZE[size], lineHeight: 'var(--leading-statement)', letterSpacing: 'var(--tracking-statement)', fontWeight: 500 }}
    >
      {units.map((line, li) => (
        <span key={li} aria-hidden="true" style={{ display: 'block' }}>
          {line.map((u, ui) => {
            const idx = k++;
            const content = mode === 'words' && ui < line.length - 1 ? `${u} ` : u;
            return reduce
              ? <span key={idx} style={{ display: 'inline-block' }}>{content}</span>
              : <Unit key={idx} i={idx} n={total} progress={mv}>{content}</Unit>;
          })}
        </span>
      ))}
    </Tag>
  );
}

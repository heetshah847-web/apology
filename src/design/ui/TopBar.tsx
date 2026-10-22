import { useState } from 'react';
import { motion, useMotionValueEvent, useScroll } from 'motion/react';
import type { ReactNode } from 'react';
import { SoundToggle } from './SoundToggle';

export interface TopBarProps {
  names?: string;
  links?: { label: string; href: string }[];
  right?: ReactNode;
}

const DEFAULT_LINKS = [{ label: 'Our story', href: '#story' }, { label: 'The question', href: '#question' }, { label: 'The date', href: '#date' }];

/** Quiet header: names left, chapter links centre, sound toggle right. Hides scrolling down, shows scrolling up. */
export function TopBar({ names = 'Heet & Tanisha', links = DEFAULT_LINKS, right }: TopBarProps) {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    if (y > prev && y > 120) setHidden(true); else if (y < prev) setHidden(false);
  });
  return (
    <motion.header
      animate={{ y: hidden ? '-110%' : 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-40 grid grid-cols-[1fr_auto_1fr] items-center px-[var(--gutter)]"
      style={{ height: 'var(--header-h)', color: 'var(--ink)' }}
    >
      <a href="#top" className="justify-self-start whitespace-nowrap font-semibold" style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem' }}>{names}</a>
      <nav aria-label="Chapters" className="hidden gap-6 text-[length:var(--text-ui)] font-medium sm:flex">
        {links.map((l) => <a key={l.href} href={l.href} className="opacity-80 hover:opacity-100">{l.label}</a>)}
      </nav>
      <div className="justify-self-end">{right ?? <SoundToggle />}</div>
    </motion.header>
  );
}

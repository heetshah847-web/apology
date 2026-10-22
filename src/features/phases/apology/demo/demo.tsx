import { createRoot } from 'react-dom/client';
import '@/index.css';
import { NarratedTrack, SmoothScroll } from '@/engine';
import { ApologyChapter } from '..';

/** Lane 11 harness: scroll through track t2 (apology is its second chapter, from ~15.2s). */
createRoot(document.getElementById('root')!).render(
  <SmoothScroll>
    <NarratedTrack trackId="t2"><div data-theme="dawn" className="absolute inset-0" style={{ background: 'var(--stage)' }}><ApologyChapter /></div></NarratedTrack>
  </SmoothScroll>,
);

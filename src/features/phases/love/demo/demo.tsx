import { createRoot } from 'react-dom/client';
import '@/index.css';
import { NarratedTrack, SmoothScroll } from '@/engine';
import { LoveChapter } from '..';

/** Lane 09 harness: /src/features/phases/love/demo/index.html (scroll through track t1; love is its second chapter). */
document.documentElement.setAttribute('data-theme', 'rose'); // the real NarratedTrack tweens this per chapter
createRoot(document.getElementById('root')!).render(
  <SmoothScroll>
    <NarratedTrack trackId="t1"><LoveChapter /></NarratedTrack>
  </SmoothScroll>,
);

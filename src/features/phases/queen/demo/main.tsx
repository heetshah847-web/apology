import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/index.css';
import { NarratedTrack, SmoothScroll } from '@/engine';
import { QueenChapter } from '../QueenChapter';

// Standalone harness for lane 07: dev URL /src/features/phases/queen/demo/queen-demo.html
// Uses the engine barrel, so it runs on the stub NarratedTrack (scroll-driven) until LANE-15 swaps in the real one.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SmoothScroll>
      <NarratedTrack trackId="t0">
        <QueenChapter />
      </NarratedTrack>
    </SmoothScroll>
  </StrictMode>,
);

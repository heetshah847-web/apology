import { createRoot } from 'react-dom/client';
import '@/index.css';
import { NarratedTrack, SmoothScroll } from '@/engine';
import { FriendshipChapter } from '..';

/** Lane 08 harness: /src/features/phases/friendship/demo/index.html (scroll through track t1; friendship is its first chapter). */
createRoot(document.getElementById('root')!).render(
  <SmoothScroll>
    <NarratedTrack trackId="t1"><FriendshipChapter /></NarratedTrack>
  </SmoothScroll>,
);

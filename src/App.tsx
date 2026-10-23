import { Suspense, lazy, useEffect } from 'react';
import { SmoothScroll, NarratedTrack } from '@/engine';
import {
  PasscodeGate, MapOpening, AtlasInterlude, QueenChapter, FriendshipChapter, LoveChapter,
  DistanceChapter, ApologyChapter, TheQuestion, SoundToggle,
} from '@/features';
import { useStoryStore } from '@/state/storyStore';

// The planner and the receipt only appear after "Yes", so they stay out of the first-load bundle.
const loadPlanner = () => import('@/features/planner/DatePlanner').then((m) => ({ default: m.DatePlanner }));
const loadOrder = () => import('@/features/order/OrderConfirmed').then((m) => ({ default: m.OrderConfirmed }));
const DatePlanner = lazy(loadPlanner);
const OrderConfirmed = lazy(loadOrder);

/** Page composition (docs/03-ARCHITECTURE.md). LANE-15 does the final wiring. */
export default function App() {
  const answeredYes = useStoryStore((s) => s.answeredYes);
  const orderPlaced = useStoryStore((s) => s.orderPlaced);
  // Warm both chunks once the first screen is idle, so Yes never waits on the network.
  useEffect(() => {
    const warm = () => { void loadPlanner(); void loadOrder(); };
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(warm, { timeout: 6000 });
    else setTimeout(warm, 4000);
  }, []);
  return (
    <SmoothScroll>
      <PasscodeGate>
        <main id="story">
          <MapOpening />
          <AtlasInterlude to="queen" />
          <NarratedTrack trackId="t0">
            <QueenChapter />
          </NarratedTrack>
          <AtlasInterlude to="friendship" />
          <NarratedTrack trackId="t1">
            <FriendshipChapter />
            <LoveChapter />
          </NarratedTrack>
          <AtlasInterlude to="distance" />
          <NarratedTrack trackId="t2">
            <DistanceChapter />
            <ApologyChapter />
          </NarratedTrack>
          <TheQuestion />
          <Suspense fallback={null}>
            {answeredYes && <DatePlanner />}
            {orderPlaced && <OrderConfirmed />}
          </Suspense>
        </main>
      </PasscodeGate>
      <SoundToggle />
    </SmoothScroll>
  );
}

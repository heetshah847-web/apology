import { SmoothScroll, NarratedTrack } from '@/engine';
import {
  PasscodeGate, MapOpening, AtlasInterlude, QueenChapter, FriendshipChapter, LoveChapter,
  DistanceChapter, ApologyChapter, TheQuestion, DatePlanner, OrderConfirmed, SoundToggle,
} from '@/features';
import { useStoryStore } from '@/state/storyStore';

/** Page composition (docs/03-ARCHITECTURE.md). LANE-15 does the final wiring. */
export default function App() {
  const answeredYes = useStoryStore((s) => s.answeredYes);
  const orderPlaced = useStoryStore((s) => s.orderPlaced);
  return (
    <SmoothScroll>
      <PasscodeGate>
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
        {answeredYes && <DatePlanner />}
        {orderPlaced && <OrderConfirmed />}
      </PasscodeGate>
      <SoundToggle />
    </SmoothScroll>
  );
}

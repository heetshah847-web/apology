import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { NarrationState, PhaseId } from '@/contracts';

interface StoryState {
  unlocked: boolean;
  soundOn: boolean;
  currentPhase: PhaseId | null;
  narration: NarrationState;
  answeredYes: boolean;
  noAttempts: number;
  orderPlaced: boolean;
  setUnlocked: (v: boolean) => void;
  setSoundOn: (v: boolean) => void;
  setCurrentPhase: (p: PhaseId | null) => void;
  setNarration: (n: Partial<NarrationState>) => void;
  setAnsweredYes: (v: boolean) => void;
  incNoAttempts: () => void;
  setOrderPlaced: (v: boolean) => void;
  reset: () => void;
}

const initialNarration: NarrationState = { trackId: null, phaseId: null, mode: 'idle', time: 0, progress: 0 };

export const useStoryStore = create<StoryState>()(
  persist(
    (set) => ({
      unlocked: false,
      soundOn: false,
      currentPhase: null,
      narration: initialNarration,
      answeredYes: false,
      noAttempts: 0,
      orderPlaced: false,
      setUnlocked: (unlocked) => set({ unlocked }),
      setSoundOn: (soundOn) => set({ soundOn }),
      setCurrentPhase: (currentPhase) => set({ currentPhase }),
      setNarration: (n) => set((s) => ({ narration: { ...s.narration, ...n } })),
      setAnsweredYes: (answeredYes) => set({ answeredYes }),
      incNoAttempts: () => set((s) => ({ noAttempts: s.noAttempts + 1 })),
      setOrderPlaced: (orderPlaced) => set({ orderPlaced }),
      reset: () => set({ unlocked: false, soundOn: false, currentPhase: null, narration: initialNarration, answeredYes: false, noAttempts: 0, orderPlaced: false }),
    }),
    {
      name: 'atlas-story-v1',
      partialize: (s) => ({ unlocked: s.unlocked, answeredYes: s.answeredYes, noAttempts: s.noAttempts, orderPlaced: s.orderPlaced }),
    },
  ),
);

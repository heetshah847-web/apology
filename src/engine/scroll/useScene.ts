import { useRef } from 'react';
import { useMotionValue, type MotionValue } from 'motion/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export interface SceneOptions { lengthVh: number }
export interface Scene<T extends HTMLElement> { ref: React.RefObject<T>; progress: MotionValue<number> }

/**
 * Pins the element for `lengthVh` of scroll and returns a 0..1 scrub value (scrolling back replays in reverse).
 * For scenes OUTSIDE a NarratedTrack (question, planner, interludes); a track is already pinned itself.
 * Reduced motion: no pin, progress rests at 1 so the final state is visible.
 */
export function useScene<T extends HTMLElement = HTMLDivElement>({ lengthVh }: SceneOptions): Scene<T> {
  const ref = useRef<T>(null);
  const progress = useMotionValue(0);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      progress.set(1);
      return;
    }
    ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: () => `+=${(lengthVh / 100) * window.innerHeight}`,
      pin: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => progress.set(self.progress),
    });
  }, { dependencies: [lengthVh] });

  return { ref, progress };
}

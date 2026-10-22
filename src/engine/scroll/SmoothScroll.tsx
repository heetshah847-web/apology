import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LENIS_OPTIONS, SCROLL_TO_DURATION } from '@/contracts';

gsap.registerPlugin(ScrollTrigger);

export interface ScrollToOptions { immediate?: boolean; duration?: number }
export interface SmoothScrollApi {
  lenis: Lenis | null;
  scrollTo: (y: number, opts?: ScrollToOptions) => void;
  stop: () => void;
  start: () => void;
}

const fallback: SmoothScrollApi = {
  lenis: null,
  scrollTo: (y, o) => window.scrollTo({ top: y, behavior: o?.immediate ? 'auto' : 'smooth' }),
  stop: () => {},
  start: () => {},
};

const SmoothScrollContext = createContext<SmoothScrollApi>(fallback);
export const useSmoothScroll = () => useContext(SmoothScrollContext);

/** Lenis with the measured feel (LENIS_OPTIONS), driven by the GSAP ticker so ScrollTrigger stays in sync. */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const instance = new Lenis({ ...LENIS_OPTIONS, smoothWheel: reduced ? false : LENIS_OPTIONS.smoothWheel });
    instance.on('scroll', ScrollTrigger.update);
    const tick = (t: number) => instance.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setLenis(instance);
    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  const api = useMemo<SmoothScrollApi>(() => {
    if (!lenis) return fallback;
    return {
      lenis,
      // Programmatic glides use the same Lenis easing as her own scrolling.
      scrollTo: (y, o) => lenis.scrollTo(y, o?.immediate ? { immediate: true, force: true } : { duration: o?.duration ?? SCROLL_TO_DURATION }),
      stop: () => lenis.stop(),
      start: () => lenis.start(),
    };
  }, [lenis]);

  return <SmoothScrollContext.Provider value={api}>{children}</SmoothScrollContext.Provider>;
}

import { useEffect, useState } from 'react';
import type { Orientation } from './mapData';

const QUERY = '(max-aspect-ratio: 1/1)';

/** Portrait screens get their own viewBox (tall map) so the atlas always fits the phone. */
export function useOrientation(): Orientation {
  const get = (): Orientation => (typeof window !== 'undefined' && window.matchMedia(QUERY).matches ? 'portrait' : 'landscape');
  const [o, setO] = useState<Orientation>(get);
  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const on = () => setO(mq.matches ? 'portrait' : 'landscape');
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return o;
}

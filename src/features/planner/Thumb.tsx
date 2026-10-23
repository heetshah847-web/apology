import type { ReactNode } from 'react';
import { planner, type PlannerOptionX } from './types';

/** Resolve an option's photo to a URL. Only real site paths (/media/...) resolve; placeholder ids (heetu-versions/…) fall back to emoji. */
export function optionImage(o?: Pick<PlannerOptionX, 'image'>): string | undefined {
  const p = o?.image;
  if (!p || !p.startsWith('/')) return undefined;
  return `${import.meta.env.BASE_URL.replace(/\/$/, '')}${p}`;
}

export function optionFor(stepId: string, optionId: string): PlannerOptionX | undefined {
  return planner.steps[stepId as keyof typeof planner.steps]?.options?.find((o) => o.id === optionId);
}

/** Square tile: the dish photo when there is one, else the emoji. */
export function Thumb({ option, fallback, children }: { option?: PlannerOptionX; fallback?: string; children?: ReactNode }) {
  const src = optionImage(option);
  return (
    <>
      {src ? <img src={src} alt="" loading="lazy" decoding="async" draggable={false} /> : <span aria-hidden>{option?.emoji ?? fallback ?? '♥'}</span>}
      {children}
    </>
  );
}

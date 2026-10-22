import type { PlannerOption, PlannerStepId, Venue } from '@/contracts';
import raw from '@/data/planner.json';

export interface PlannerOptionX extends PlannerOption { specs?: string[] }
export interface StepConfig { title: string; options?: PlannerOptionX[]; [k: string]: unknown }
export interface PlannerConfig {
  steps: {
    activity: StepConfig & { mode: 'all' | 'landOn'; cycleMs: number; toast: string; options: PlannerOptionX[]; bonus: { id: string; label: string; note?: string; emoji?: string } };
    suggestions: StepConfig & { placeholder: string; chips: string[] };
    delivery: StepConfig & { minDaysFromToday: number; maxDaysFromToday: number; slots: string[]; confirmLabel: string };
  } & Record<PlannerStepId, StepConfig>;
}
export type VenueRec = Venue & { forOptions?: string[] };

export const planner = raw as unknown as PlannerConfig;

export const STEP_LABEL: Record<PlannerStepId, string> = {
  activity: 'Vibe', cuisine: 'Cuisine', dessert: 'Dessert', heetu: 'Heetu', flowers: 'Flowers', punish: 'Punishment', suggestions: 'Wishes', review: 'Cart', delivery: 'Delivery',
};

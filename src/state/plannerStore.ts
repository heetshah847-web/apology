import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Order, PlannerStepId } from '@/contracts';
import { useStoryStore } from './storyStore';

export const STEP_ORDER: PlannerStepId[] = ['activity', 'cuisine', 'dessert', 'heetu', 'flowers', 'suggestions', 'review', 'delivery'];

interface PlannerState {
  currentStep: PlannerStepId;
  cart: CartItem[];
  suggestions: string;
  delivery: { date: string; slot: string };
  order: Order | null;
  add: (item: CartItem) => void;
  /** Replace every item of the step with the given items. */
  replace: (stepId: PlannerStepId, items: CartItem | CartItem[]) => void;
  remove: (stepId: PlannerStepId, optionId: string) => void;
  clearStep: (stepId: PlannerStepId) => void;
  setVenue: (stepId: PlannerStepId, optionId: string, venueId?: string) => void;
  setSuggestions: (text: string) => void;
  setDelivery: (d: Partial<{ date: string; slot: string }>) => void;
  goTo: (step: PlannerStepId) => void;
  next: () => void;
  prev: () => void;
  confirm: () => Order | null;
  reset: () => void;
}

const same = (a: CartItem, stepId: PlannerStepId, optionId: string) => a.stepId === stepId && a.optionId === optionId;
const initial = { currentStep: 'activity' as PlannerStepId, cart: [] as CartItem[], suggestions: '', delivery: { date: '', slot: '' }, order: null as Order | null };

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set, get) => ({
      ...initial,
      add: (item) => set((s) => (s.cart.some((c) => same(c, item.stepId, item.optionId)) ? s : { cart: [...s.cart, item] })),
      replace: (stepId, items) =>
        set((s) => ({ cart: [...s.cart.filter((c) => c.stepId !== stepId), ...(Array.isArray(items) ? items : [items])] })),
      remove: (stepId, optionId) => set((s) => ({ cart: s.cart.filter((c) => !same(c, stepId, optionId)) })),
      clearStep: (stepId) => set((s) => ({ cart: s.cart.filter((c) => c.stepId !== stepId) })),
      setVenue: (stepId, optionId, venueId) =>
        set((s) => ({ cart: s.cart.map((c) => (same(c, stepId, optionId) ? { ...c, venueId } : c)) })),
      setSuggestions: (suggestions) => set({ suggestions }),
      setDelivery: (d) => set((s) => ({ delivery: { ...s.delivery, ...d } })),
      goTo: (currentStep) => set({ currentStep }),
      next: () => set((s) => ({ currentStep: STEP_ORDER[Math.min(STEP_ORDER.indexOf(s.currentStep) + 1, STEP_ORDER.length - 1)] })),
      prev: () => set((s) => ({ currentStep: STEP_ORDER[Math.max(STEP_ORDER.indexOf(s.currentStep) - 1, 0)] })),
      confirm: () => {
        const { cart, suggestions, delivery } = get();
        if (!cart.length || !delivery.date || !delivery.slot) return null;
        const order: Order = { items: cart, suggestions: suggestions.trim(), delivery: { ...delivery }, createdAt: new Date().toISOString() };
        set({ order });
        useStoryStore.getState().setOrderPlaced(true);
        return order;
      },
      reset: () => set({ ...initial }),
    }),
    {
      name: 'atlas-planner-v1',
      partialize: (s) => ({ currentStep: s.currentStep, cart: s.cart, suggestions: s.suggestions, delivery: s.delivery, order: s.order }),
    },
  ),
);

import { createRoot } from 'react-dom/client';
import '../../index.css';
import type { Order } from '@/contracts';
import { usePlannerStore } from '@/state/plannerStore';
import { useStoryStore } from '@/state/storyStore';
import { OrderConfirmed } from './OrderConfirmed';

/** Dev/test harness (LANE-14): mounts the receipt with a sample order. Use ?long=1 for a worst-case wish. */
const long = new URLSearchParams(location.search).has('long');
const order: Order = {
  items: [
    { stepId: 'activity', optionId: 'shopping', label: 'Shopping' },
    { stepId: 'activity', optionId: 'pickleball', label: 'Pickleball' },
    { stepId: 'activity', optionId: 'bowling', label: 'Bowling' },
    { stepId: 'activity', optionId: 'smash-karts', label: 'Smash Karts battle (Heetu vs Tanisha)', note: 'Loser buys dessert', bonus: true },
    { stepId: 'cuisine', optionId: 'pasta', label: 'Pasta', venueId: 'mocha-bodakdev' },
    { stepId: 'dessert', optionId: 'tiramisu', label: 'Tiramisu' },
    { stepId: 'heetu', optionId: 'current', label: 'Current Heetu' },
    { stepId: 'flowers', optionId: 'red-roses', label: 'Red roses' },
  ],
  suggestions: long ? 'A long drive, then sunset, and no phones. '.repeat(60) : 'A long drive, then sunset. And no phones, Heetu.',
  delivery: { date: '2026-11-14', slot: 'Sunset' },
  createdAt: '2026-10-23T10:00:00.000Z',
};
usePlannerStore.setState({ order });
useStoryStore.getState().setOrderPlaced(true);

createRoot(document.getElementById('root')!).render(<OrderConfirmed />);

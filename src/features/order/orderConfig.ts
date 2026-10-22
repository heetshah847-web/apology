import type { CartItem, Order, PlannerStepId } from '@/contracts';
import planner from '@/data/planner.json';
import venues from '@/data/venues.json';
import story from '../../../content/config/story.config.json';

export interface OrderCopy {
  orderPrefix: string; headline: string; body: string; signature: string;
  sendLabel: string; saveLabel: string; editLabel: string;
}

export const copy = (planner as unknown as { confirmation: OrderCopy }).confirmation;
export const whatsappNumber = String((planner as { whatsappNumber?: string }).whatsappNumber ?? '');
export const web3formsAccessKey = String((planner as { web3formsAccessKey?: string }).web3formsAccessKey ?? '');
export const closingLine = String((story as { closingLine?: string }).closingLine ?? '');
export const herTitle = (story as { meta: { herTitle: string } }).meta.herTitle;

export const STORAGE_KEY = 'atlas-order-v1';
export const PLATE = { region: 'GJ', code: '01 · FOREVER' } as const;

/** Receipt order: the cart groups in the order she walked the planner. */
export const GROUPS: { id: PlannerStepId; title: string; emoji: string }[] = [
  { id: 'activity', title: 'The plan', emoji: '🎟️' },
  { id: 'cuisine', title: 'Dinner', emoji: '🍽️' },
  { id: 'dessert', title: 'Something sweet', emoji: '🍰' },
  { id: 'heetu', title: 'Your Heetu', emoji: '🤍' },
  { id: 'flowers', title: 'Flowers', emoji: '💐' },
];

type VenueLite = { id: string; name: string; area?: string };
export const venueName = (id?: string): string | undefined => {
  const v = (venues as unknown as VenueLite[]).find((x) => x.id === id);
  return v ? `${v.name}${v.area ? `, ${v.area}` : ''}` : undefined;
};

export interface Group { id: PlannerStepId; title: string; emoji: string; items: (CartItem & { venue?: string })[] }

export function groupItems(items: CartItem[]): Group[] {
  return GROUPS.map((g) => ({
    ...g,
    items: items.filter((i) => i.stepId === g.id).map((i) => ({ ...i, venue: venueName(i.venueId) })),
  })).filter((g) => g.items.length);
}

/** Stable 3-digit number derived from the order timestamp (same order gives the same number, no storage needed). */
export function orderNumber(order: Order, prefix = copy.orderPrefix): string {
  let h = 7;
  for (const ch of order.createdAt) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return `${prefix}${String(h + 1).padStart(3, '0')}`;
}

export function formatDelivery(d: Order['delivery']): string {
  const date = new Date(`${d.date}T12:00:00`);
  const pretty = Number.isNaN(date.getTime())
    ? d.date
    : date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return `${pretty} · ${d.slot}`;
}

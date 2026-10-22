import type { Order } from '@/contracts';
import { copy, formatDelivery, groupItems, orderNumber } from './orderConfig';

const MAX = 1400; // margin under the 1500-char acceptance limit

/** Plain-text order for WhatsApp / email. Always under 1500 chars: her wishes are trimmed first. */
export function buildSummary(order: Order): string {
  const head = `👑 *${orderNumber(order)}*\n${copy.headline}`;
  const body = groupItems(order.items)
    .map((g) => `${g.emoji} *${g.title}*\n${g.items.map((i) => `• ${i.label}${i.bonus ? ' (free bonus)' : ''}${i.venue ? ` — ${i.venue}` : ''}`).join('\n')}`)
    .join('\n\n');
  const when = `📅 *Delivery*\n${formatDelivery(order.delivery)}`;
  const tail = `${copy.signature} 💌`;
  const build = (wish: string) =>
    [head, body, wish && `💬 *Her wish*\n${wish}`, when, tail].filter(Boolean).join('\n\n');

  let wish = order.suggestions;
  let text = build(wish);
  if (text.length > MAX && wish) {
    const room = wish.length - (text.length - MAX) - 1;
    wish = room > 0 ? `${wish.slice(0, room).trimEnd()}…` : '';
    text = build(wish);
  }
  return text.length > MAX ? `${text.slice(0, MAX - 1)}…` : text;
}

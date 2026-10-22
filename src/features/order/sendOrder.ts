import type { Order } from '@/contracts';
import { STORAGE_KEY, orderNumber, web3formsAccessKey, whatsappNumber } from './orderConfig';
import { buildSummary } from './summary';

export interface SavedOrder { order: Order; number: string; sentAt?: string; emailed?: boolean }

export function readSaved(): SavedOrder | null {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as SavedOrder | null; } catch { return null; }
}

export function saveOrder(order: Order, patch: Partial<SavedOrder> = {}): void {
  try {
    const prev = readSaved();
    const keep = prev && prev.order.createdAt === order.createdAt ? prev : undefined;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...keep, order, number: orderNumber(order), ...patch }));
  } catch { /* private mode: the receipt still works */ }
}

export const whatsappUrl = (order: Order): string =>
  `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(buildSummary(order))}`;

/** Optional email via Web3Forms; only when an access key is configured. Never throws. */
async function emailOrder(order: Order): Promise<boolean> {
  if (!web3formsAccessKey) return false;
  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: web3formsAccessKey,
        subject: `Order ${orderNumber(order)} from Tanisha`,
        from_name: 'The Atlas of Us',
        message: buildSummary(order),
      }),
    });
    return res.ok;
  } catch { return false; }
}

/** Opens WhatsApp (call from the click handler), mirrors by email if configured, remembers it. */
export async function sendOrder(order: Order): Promise<{ emailed: boolean }> {
  saveOrder(order);
  window.open(whatsappUrl(order), '_blank', 'noopener');
  const emailed = await emailOrder(order);
  saveOrder(order, { sentAt: new Date().toISOString(), emailed });
  return { emailed };
}

// Run: npx tsx or via vite-node; see lane file. Checks the WhatsApp text stays readable and under 1500 chars.
import { buildSummary } from './summary';
import type { Order } from '@/contracts';

const base: Order = {
  items: [
    { stepId: 'activity', optionId: 'shopping', label: 'Shopping' },
    { stepId: 'cuisine', optionId: 'pasta', label: 'Pasta' },
    { stepId: 'flowers', optionId: 'red-roses', label: 'Red roses' },
  ],
  suggestions: 'Sunset drive',
  delivery: { date: '2026-11-14', slot: 'Sunset' },
  createdAt: '2026-10-23T10:00:00.000Z',
};

const short = buildSummary(base);
const long = buildSummary({ ...base, suggestions: 'x'.repeat(5000) });
const ok = short.includes('\n') && short.length < 1500 && long.length <= 1500 && long.includes('Her wish');
console.log(short, '\n---\nlong length:', long.length);
if (!ok) throw new Error('summary test failed');

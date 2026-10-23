import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import type { Order } from '@/contracts';
import { Button } from '@/design';
import { audioDirector } from '@/engine';
import { usePlannerStore } from '@/state/plannerStore';
import { useStoryStore } from '@/state/storyStore';
import { ClosingScreen } from './ClosingScreen';
import { Receipt } from './Receipt';
import { copy, orderNumber } from './orderConfig';
import { readSaved, saveOrder, sendOrder } from './sendOrder';
import { saveReceipt } from './saveReceipt';
import './order.css';

const HEART = confetti.shapeFromPath({
  path: 'M23.6 0c-3.4 0-6.4 1.8-8.1 4.4C13.8 1.8 10.8 0 7.4 0 3.3 0 0 3.3 0 7.4c0 8.7 15.5 16.9 15.5 16.9S31 16.1 31 7.4C31 3.3 27.7 0 23.6 0z',
});

function heartBurst() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const base = { shapes: [HEART], colors: ['#f1c9cf', '#e7a6b8', '#f8e2e4', '#b5677a'], scalar: 1.6, ticks: 220, disableForReducedMotion: true };
  confetti({ ...base, particleCount: 60, spread: 80, startVelocity: 48, origin: { x: 0.5, y: 0.55 } });
  setTimeout(() => confetti({ ...base, particleCount: 30, angle: 60, spread: 60, origin: { x: 0, y: 0.7 } }), 250);
  setTimeout(() => confetti({ ...base, particleCount: 30, angle: 120, spread: 60, origin: { x: 1, y: 0.7 } }), 250);
}

type Status = 'idle' | 'sending' | 'sent' | 'saving' | 'saved' | 'error';

export function OrderConfirmed() {
  const placed = useStoryStore((s) => s.orderPlaced);
  // Planner store is the source; the saved copy only restores a placed order after a reload.
  const order: Order | null = usePlannerStore((s) => s.order) ?? (placed ? readSaved()?.order ?? null : null);
  const receipt = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>('idle');
  const stamp = order?.createdAt;

  // Remember the order and celebrate once per order (the seal lands first, then the chime and hearts).
  useEffect(() => {
    if (!order) return;
    saveOrder(order);
    const key = `atlas-celebrated-${order.createdAt}`;
    let done = false;
    try { done = sessionStorage.getItem(key) === '1'; sessionStorage.setItem(key, '1'); } catch { /* fine */ }
    if (done) return;
    const t = setTimeout(() => { audioDirector.sfx('chime'); heartBurst(); }, 650);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stamp]);

  if (!order) return null;

  const send = async () => {
    setStatus('sending');
    try { await sendOrder(order); setStatus('sent'); } catch { setStatus('error'); }
  };
  const save = async () => {
    if (!receipt.current) return;
    setStatus('saving');
    try { await saveReceipt(receipt.current, orderNumber(order).replace('#', '')); setStatus('saved'); } catch { setStatus('error'); }
  };
  const edit = () => {
    usePlannerStore.getState().goTo('review');
    usePlannerStore.setState({ order: null });
    useStoryStore.getState().setOrderPlaced(false);
    requestAnimationFrame(() => document.getElementById('planner')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };
  const replay = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const note: Record<Status, string> = {
    idle: '', sending: 'Opening WhatsApp…', sent: 'Sent. Heetu has your order.', saving: 'Painting your receipt…',
    saved: 'Receipt saved.', error: 'Something hiccuped. Try again, Your Majesty.',
  };

  return (
    <>
      <section id="order" data-theme="rose" className="order-stage" aria-label="Order confirmed">
        <Receipt ref={receipt} order={order} />
        <div className="order-actions" data-no-capture>
          <Button variant="primary" size="lg" onClick={send} disabled={status === 'sending'}>{copy.sendLabel}</Button>
          <Button variant="ghost" onClick={save} disabled={status === 'saving'}>{copy.saveLabel}</Button>
          <Button variant="ghost" onClick={edit}>{copy.editLabel}</Button>
        </div>
        <p className="order-status" role="status" aria-live="polite">{note[status]}</p>
      </section>
      <ClosingScreen onReplay={replay} />
    </>
  );
}

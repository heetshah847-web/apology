import { forwardRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import type { Order } from '@/contracts';
import { PlateCard } from '@/design';
import { PLATE, copy, formatDelivery, groupItems, herTitle, orderNumber } from './orderConfig';

/** Gold wax-style seal; stamps down on mount. */
function Seal({ delay }: { delay: number }) {
  const reduce = useReducedMotion();
  const points = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2;
    const r = i % 2 ? 44 : 50;
    return `${(50 + Math.cos(a) * r).toFixed(1)},${(50 + Math.sin(a) * r).toFixed(1)}`;
  }).join(' ');
  return (
    <motion.svg
      viewBox="0 0 100 100" width="92" height="92" aria-hidden
      className="order-seal"
      initial={reduce ? false : { scale: 2.4, rotate: -24, opacity: 0 }}
      animate={{ scale: 1, rotate: -8, opacity: 1 }}
      transition={{ delay, type: 'spring', stiffness: 380, damping: 17, mass: 0.9 }}
    >
      <defs>
        <radialGradient id="seal-g" cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#f0dca8" /><stop offset="0.55" stopColor="#c8a45d" /><stop offset="1" stopColor="#8f6c2c" />
        </radialGradient>
      </defs>
      <polygon points={points} fill="url(#seal-g)" />
      <circle cx="50" cy="50" r="32" fill="none" stroke="#6f5220" strokeOpacity=".55" strokeWidth="1.5" />
      <path d="M50 66 C 30 52 32 36 44 36 C 48 36 50 39 50 42 C 50 39 52 36 56 36 C 68 36 70 52 50 66 Z" fill="#6f5220" fillOpacity=".8" />
    </motion.svg>
  );
}

export interface ReceiptProps { order: Order }

/** The royal decree. A plain forwardRef node so html-to-image can snapshot it. */
export const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(function Receipt({ order }, ref) {
  const groups = groupItems(order.items);
  return (
    <div ref={ref} className="order-paper" aria-label="Order receipt">
      <header className="order-head">
        <p className="order-eyebrow">A royal decree for {herTitle}</p>
        <h2 className="order-title">{copy.headline}</h2>
        <p className="order-number">{orderNumber(order)}</p>
      </header>

      <div className="order-rule" />

      <div className="order-groups">
        {groups.map((g) => (
          <section key={g.id} className="order-group">
            <h3><span aria-hidden>{g.emoji}</span> {g.title}</h3>
            <ul>
              {g.items.map((i) => (
                <li key={`${i.stepId}-${i.optionId}`}>
                  <span>{i.label}{i.bonus && <em className="order-bonus"> free</em>}</span>
                  {i.venue && <small>{i.venue}</small>}
                  {i.note && <small>{i.note}</small>}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {order.suggestions && (
        <section className="order-group order-wish">
          <h3><span aria-hidden>💬</span> Your wish, my command</h3>
          <p>{order.suggestions}</p>
        </section>
      )}

      <div className="order-rule" />

      <section className="order-when">
        <h3>Delivery</h3>
        <p>{formatDelivery(order.delivery)}</p>
      </section>

      <p className="order-body">{copy.body}</p>

      <footer className="order-foot">
        <PlateCard region={PLATE.region} code={PLATE.code} caption="Reserved for you, always" />
        <div className="order-sign">
          <Seal delay={0.35} />
          <span>{copy.signature}</span>
        </div>
      </footer>
    </div>
  );
});

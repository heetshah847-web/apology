import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/design';
import { getMedia } from '@/engine/media';
import { closingLine } from './orderConfig';

const TILTS = [-4, 3, -2, 5, -3, 2];

/** Final screen: her closing line, a small collage from the Love chapter, and a replay button. */
export function ClosingScreen({ onReplay }: { onReplay: () => void }) {
  const [broken, setBroken] = useState<Set<string>>(new Set());
  // Photos that fail to load (assets not dropped yet) are skipped instead of showing empty frames.
  const photos = getMedia('love').filter((m) => m.kind === 'image' && !broken.has(m.id)).slice(0, 6);
  return (
    <section className="order-closing" aria-label="Closing">
      {photos.length > 0 && (
        <div className="order-collage" aria-hidden={photos.every((p) => !p.alt)}>
          {photos.map((p, i) => (
            <motion.img
              key={p.id}
              src={p.src}
              srcSet={p.srcSet}
              sizes="(min-width: 900px) 200px, 40vw"
              alt={p.alt}
              onError={() => setBroken((s) => new Set(s).add(p.id))}
              loading="lazy"
              decoding="async"
              width={p.width}
              height={p.height}
              style={{ rotate: TILTS[i % TILTS.length], objectPosition: p.focal ? `${p.focal[0] * 100}% ${p.focal[1] * 100}%` : undefined }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ delay: i * 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            />
          ))}
        </div>
      )}
      <motion.p
        className="order-closing-line"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        {closingLine}
      </motion.p>
      <Button variant="ghost" onClick={onReplay}>Watch our story again</Button>
    </section>
  );
}

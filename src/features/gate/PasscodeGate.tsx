import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from 'motion/react';
import { storyConfig } from '../map/storyConfig';

const SESSION_KEY = 'atlas-gate-v1';

/** Same normalisation as scripts/hash-answer.mjs: trim, lowercase, collapse spaces. */
const normalise = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
}

const read = () => { try { return sessionStorage.getItem(SESSION_KEY) === '1'; } catch { return false; } };
const remember = () => { try { sessionStorage.setItem(SESSION_KEY, '1'); } catch { /* private mode: she just types it again */ } };

/**
 * SOFT gate. The expected hash ships in the JS bundle, so this only keeps casual visitors and link previews out;
 * it is not security. Privacy for the real content rests on noindex + an unlisted URL (CLAUDE.md rule 9).
 * Children are not mounted until the gate is passed.
 */
export function PasscodeGate({ children }: { children: ReactNode }) {
  const { passcode } = storyConfig;
  const hashConfigured = /^[0-9a-f]{64}$/i.test(passcode.answerSha256);
  const canHash = typeof crypto !== 'undefined' && !!crypto.subtle;
  const bypass = !passcode.enabled || !hashConfigured || !canHash;

  const [passed, setPassed] = useState<boolean>(() => bypass || read());
  const [value, setValue] = useState('');
  const [wrong, setWrong] = useState(0);
  const [busy, setBusy] = useState(false);
  const reduced = !!useReducedMotion();
  const shake = useAnimationControls();
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (passcode.enabled && !hashConfigured) console.warn('[gate] passcode.answerSha256 is not a SHA-256 hash yet: gate disabled. Run: node scripts/hash-answer.mjs "answer"');
    if (passcode.enabled && hashConfigured && !canHash) console.warn('[gate] crypto.subtle needs https or localhost: gate disabled on this origin.');
  }, [passcode.enabled, hashConfigured, canHash]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy || !value.trim()) return;
    setBusy(true);
    const ok = (await sha256Hex(normalise(value))) === passcode.answerSha256.toLowerCase();
    setBusy(false);
    if (ok) { remember(); setPassed(true); return; }
    setWrong((n) => n + 1);
    if (!reduced) void shake.start({ x: [0, -10, 9, -6, 4, 0], transition: { duration: 0.45 } });
    input.current?.focus();
    input.current?.select();
  };

  if (passed) return <>{children}</>;

  const hint = wrong > 0 ? passcode.hints[Math.min(wrong, passcode.hints.length) - 1] : null;
  return (
    <main
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-[var(--gutter,1rem)]"
      style={{ background: 'radial-gradient(120% 90% at 50% 20%, #2f2a5c 0%, var(--night-ink,#1e1a3a) 55%, #120f26 100%)', color: 'var(--ink,#eee8f4)' }}
    >
      <form onSubmit={submit} className="relative z-10 w-full max-w-md text-center" aria-describedby="gate-hint">
        <svg viewBox="-40 -30 80 60" className="mx-auto mb-6 w-14" fill="var(--royal-gold,#c8a45d)" aria-hidden>
          <path d="M-30 14L-34 -16L-16 -2L0 -24L16 -2L34 -16L30 14ZM-30 20H30" />
        </svg>
        <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--ink-soft)', fontSize: '1.05rem' }}>
          {storyConfig.meta.herTitle}, one small question first
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.7rem, 1.1rem + 2.6vw, 2.8rem)', lineHeight: 1.1, margin: '.5rem 0 1.5rem' }}>
          {passcode.question}
        </h1>

        <motion.div animate={shake}>
          <label htmlFor="gate-answer" className="sr-only">Your answer</label>
          <input
            ref={input}
            id="gate-answer"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} enterKeyHint="go"
            aria-invalid={wrong > 0}
            className="w-full rounded-full px-5 py-3 text-center outline-none"
            style={{ background: 'color-mix(in oklab, var(--moon-pearl,#eee8f4) 8%, transparent)', border: `1px solid ${wrong > 0 ? 'var(--rose-quartz,#e7a6b8)' : 'var(--line)'}`, color: 'var(--ink)', fontSize: '1.125rem', fontFamily: 'var(--font-body)' }}
          />
        </motion.div>

        <button
          type="submit"
          disabled={busy}
          className="mt-4 rounded-full px-7 py-3"
          style={{ background: 'var(--royal-gold,#c8a45d)', color: '#1e1a3a', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 'var(--text-ui,.875rem)', opacity: busy ? 0.6 : 1 }}
        >
          Open the atlas
        </button>

        <div id="gate-hint" aria-live="polite" style={{ minHeight: '4.5rem', marginTop: '1.25rem' }}>
          <AnimatePresence mode="wait">
            {wrong > 0 && (
              <motion.div key={wrong} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.35 }}>
                <p style={{ color: 'var(--rose-quartz,#e7a6b8)', fontFamily: 'var(--font-body)' }}>Not quite, my queen. Try once more.</p>
                {hint && <p style={{ color: 'var(--ink-soft)', fontFamily: 'var(--font-display)', fontStyle: 'italic', marginTop: '.35rem' }}>{hint}</p>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>
    </main>
  );
}

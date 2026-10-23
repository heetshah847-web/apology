import { useState, type ReactNode } from 'react';
import {
  Button, Caption, Chip, FrameOutline, PhotoFrame, PlateCard, Polaroid, ResumeVoice, ScrollHint, Sheet,
  SkipControl, SoundToggle, StatementText, Toast, TopBar,
} from './index';

const THEMES = ['gold', 'amber', 'rose', 'fog', 'dawn'] as const;
const SWATCHES = [
  ['night-ink', '#1e1a3a'], ['dusk-violet', '#545388'], ['moon-pearl', '#eee8f4'],
  ['royal-gold', '#c8a45d'], ['rose-quartz', '#e7a6b8'], ['sea-fog', '#7fa3b8'],
] as const;
const PHOTO = '/media/placeholders/queen/01-placeholder.jpg';

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="py-12">
      <h2 className="m-0 mb-6 text-[length:var(--text-ui)] font-semibold" style={{ color: 'var(--ink-soft)' }}>{title}</h2>
      {children}
    </section>
  );
}

/** Dev-only showcase of every token and component (open /design.html). */
export default function DesignPage() {
  const [theme, setTheme] = useState<(typeof THEMES)[number]>('gold');
  const [progress, setProgress] = useState(0.6);
  const [sheet, setSheet] = useState(false);
  const [toast, setToast] = useState(false);
  const [chip, setChip] = useState('pasta');

  return (
    <div id="top" data-theme={theme} className="stage tex-grain min-h-screen rounded-none" style={{ borderRadius: 0 }}>
      <div className="tex-stars absolute inset-0 -z-0 opacity-70" aria-hidden />
      <TopBar />
      <ScrollHint />
      <ResumeVoice visible onResume={() => setToast(true)} />

      <main className="relative z-10 mx-auto max-w-5xl px-[var(--gutter)] pb-40 pt-[calc(var(--header-h)+2rem)]">
        <p className="m-0" style={{ fontFamily: 'var(--font-script)', fontSize: '2.2rem', color: 'var(--accent)' }}>Dreamlit Atlas</p>
        <h1 className="m-0 mt-2" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-hero)', lineHeight: 0.9, letterSpacing: '-0.02em', fontWeight: 500 }}>Design system</h1>
        <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Phase theme">
          {THEMES.map((t) => <Chip key={t} selected={t === theme} onClick={() => setTheme(t)}>{t}</Chip>)}
        </div>

        <Block title="Palette">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {SWATCHES.map(([n, hex]) => (
              <div key={n}>
                <div className="h-20 rounded-[var(--radius-md)]" style={{ background: hex, border: '1px solid var(--line)' }} />
                <p className="m-0 mt-2 text-[length:var(--text-label)]">{n}<br /><span style={{ color: 'var(--ink-soft)' }}>{hex}</span></p>
              </div>
            ))}
          </div>
        </Block>

        <Block title="Typography — Bodoni Moda / Figtree / Pinyon Script">
          <p className="m-0" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-statement-sm)', lineHeight: 1 }}>She walked in and the room remembered how to glow.</p>
          <p className="mt-4 max-w-[32ch]" style={{ fontSize: 'var(--text-caption)', lineHeight: 1.3 }}>Figtree caption at 18–30px, max 32 characters per line, two lines at most.</p>
          <p className="m-0 mt-2" style={{ fontFamily: 'var(--font-script)', fontSize: '2.4rem', color: 'var(--accent)' }}>Valley of Friendship</p>
        </Block>

        <Block title="StatementText — drag to scrub (0..1)">
          <input aria-label="Progress" type="range" min={0} max={1} step={0.005} value={progress} onChange={(e) => setProgress(+e.target.value)} className="mb-8 w-full" />
          <StatementText progress={progress} text={'I don’t believe\nin forgetting\nthe good days.'} />
          <p className="mt-3 text-center text-[length:var(--text-label)]" style={{ color: 'var(--ink-soft)' }}>progress {progress.toFixed(2)}</p>
        </Block>

        <Block title="FrameOutline + PhotoFrame + Polaroid">
          <div className="grid gap-14 pt-8 sm:grid-cols-2">
            <FrameOutline label="Queen / Portrait 03">
              <PhotoFrame src={PHOTO} alt="Placeholder portrait" kenBurns duration={6} className="aspect-[4/5] w-full" />
            </FrameOutline>
            <div className="flex items-center justify-center"><Polaroid src={PHOTO} alt="Placeholder polaroid" caption="our first selfie" tilt={-3} /></div>
          </div>
        </Block>

        <Block title="Caption (reduced-motion fallback) over a photo with scrim">
          <div className="relative aspect-[16/9] overflow-hidden rounded-[var(--radius-md)]">
            <PhotoFrame src={PHOTO} alt="" className="h-full w-full" />
            <Caption text="Over a bright photo this still reads, thanks to the scrim." />
          </div>
        </Block>

        <Block title="Buttons, chips, controls">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button><Button variant="ghost">Ghost</Button><Button variant="royal" size="lg">Add to the royal cart</Button>
            <SoundToggle /><SkipControl onSkip={() => setToast(true)} />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {['pasta', 'sushi', 'thali', 'tacos'].map((c) => <Chip key={c} selected={chip === c} onClick={() => setChip(c)}>{c}</Chip>)}
          </div>
          <div className="mt-5 flex gap-3"><Button variant="ghost" onClick={() => setSheet(true)}>Open sheet</Button><Button variant="ghost" onClick={() => setToast(true)}>Show toast</Button></div>
        </Block>

        <Block title="PlateCard">
          <PlateCard region="GJ" code="01 · FOREVER" caption="Registered to Queen Tanisha" />
        </Block>
      </main>

      <Sheet open={sheet} onClose={() => setSheet(false)} title="Choose your Heetu">
        <p className="m-0" style={{ color: 'var(--ink-soft)' }}>A bottom sheet. Esc or tap outside closes it.</p>
      </Sheet>
      <Toast open={toast} onClose={() => setToast(false)}>Added to the royal cart</Toast>
    </div>
  );
}

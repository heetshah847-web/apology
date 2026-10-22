import { Chip } from '@/design';
import { usePlannerStore } from '@/state/plannerStore';
import { StepTitle } from './StepTitle';
import { planner } from './types';

const cfg = planner.steps.suggestions;

export function SuggestionsStep() {
  const text = usePlannerStore((s) => s.suggestions);
  const set = usePlannerStore.getState().setSuggestions;
  const has = (c: string) => text.toLowerCase().includes(c.toLowerCase());
  const toggle = (c: string) => {
    if (!has(c)) return set(text.trim() ? `${text.trim()}\n${c}` : c);
    set(text.split('\n').filter((l) => l.trim().toLowerCase() !== c.toLowerCase()).join('\n'));
  };
  return (
    <div>
      <StepTitle>{cfg.title}</StepTitle>
      <label className="sr-only" htmlFor="planner-wishes">Your wishes</label>
      <textarea
        id="planner-wishes" value={text} onChange={(e) => set(e.target.value)} placeholder={cfg.placeholder} rows={6} maxLength={800}
        className="mt-4 w-full resize-y rounded-[14px] p-4 text-base"
        style={{ background: 'var(--stage-deep)', color: 'var(--ink)', border: '1px solid var(--line)', fontFamily: 'var(--font-body)' }}
      />
      <div className="mt-4 flex flex-wrap gap-2">
        {cfg.chips.map((c) => <Chip key={c} selected={has(c)} onClick={() => toggle(c)}>{c}</Chip>)}
      </div>
    </div>
  );
}

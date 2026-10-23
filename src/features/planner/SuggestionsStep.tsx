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
      <p className="pl-label mb-3">Add a note</p>
      <label className="sr-only" htmlFor="planner-wishes">Your wishes</label>
      <textarea id="planner-wishes" value={text} onChange={(e) => set(e.target.value)} placeholder={cfg.placeholder} rows={6} maxLength={800} className="pl-field" />
      <div className="pl-chips">
        {cfg.chips.map((c) => <button key={c} type="button" aria-pressed={has(c)} className="pl-chip" onClick={() => toggle(c)}>{c}</button>)}
      </div>
    </div>
  );
}

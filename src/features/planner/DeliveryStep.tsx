import { addDays, format, parseISO, startOfDay } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import './planner.css';
import { Button, Chip } from '@/design';
import { audioDirector } from '@/engine';
import { usePlannerStore } from '@/state/plannerStore';
import { StepTitle } from './StepTitle';
import { planner } from './types';

const cfg = planner.steps.delivery;

export function DeliveryStep() {
  const { date, slot } = usePlannerStore((s) => s.delivery);
  const cartCount = usePlannerStore((s) => s.cart.length);
  const order = usePlannerStore((s) => s.order);
  const today = startOfDay(new Date());
  const from = addDays(today, cfg.minDaysFromToday);
  const to = addDays(today, cfg.maxDaysFromToday);
  const selected = date ? parseISO(date) : undefined;
  const missing = !cartCount ? 'Add something to your royal cart first' : !date ? 'Pick a date' : !slot ? 'Pick a time slot' : '';

  return (
    <div>
      <StepTitle>{cfg.title}</StepTitle>
      <div className="planner-day mt-4 flex justify-center rounded-[14px] p-3" style={{ background: 'var(--stage-deep)', border: '1px solid var(--line)' }}>
        <DayPicker
          mode="single" selected={selected} defaultMonth={selected ?? from} startMonth={from} endMonth={to}
          disabled={[{ before: from }, { after: to }]}
          onSelect={(d) => d && usePlannerStore.getState().setDelivery({ date: format(d, 'yyyy-MM-dd') })}
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Time slot">
        {cfg.slots.map((s) => <Chip key={s} selected={slot === s} onClick={() => usePlannerStore.getState().setDelivery({ slot: s })}>{s}</Chip>)}
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Button
          variant="royal" size="lg" disabled={!!missing}
          onClick={() => { if (usePlannerStore.getState().confirm()) audioDirector.sfx('chime'); }}
        >
          {order ? 'Order confirmed ✓' : cfg.confirmLabel}
        </Button>
        {missing && <span className="text-[length:var(--text-ui)]" style={{ color: 'var(--ink-soft)' }}>{missing}</span>}
      </div>
    </div>
  );
}

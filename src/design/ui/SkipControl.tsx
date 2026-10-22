export function SkipControl({ onSkip, label = 'Skip chapter' }: { onSkip: () => void; label?: string }) {
  return (
    <button type="button" onClick={onSkip} className="rounded-full px-3 py-[6px] text-[length:var(--text-label)] font-medium opacity-60 transition-opacity hover:opacity-100" style={{ border: '1px solid var(--line)', color: 'var(--ink)' }}>
      {label}
    </button>
  );
}

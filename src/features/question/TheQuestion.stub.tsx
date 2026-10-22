import { useStoryStore } from '@/state/storyStore';

export function TheQuestion() {
  const answeredYes = useStoryStore((s) => s.answeredYes);
  const setAnsweredYes = useStoryStore((s) => s.setAnsweredYes);
  const incNo = useStoryStore((s) => s.incNoAttempts);
  return (
    <section className="flex h-[100svh] flex-col items-center justify-center gap-6 bg-rose-950 text-rose-50">
      <h2 className="text-5xl font-semibold">Will you be mine again?</h2>
      <div className="flex gap-4">
        <button className="rounded-full bg-rose-400 px-8 py-3 text-rose-950" onClick={() => setAnsweredYes(true)}>Yes{answeredYes ? ' ✓' : ''}</button>
        <button className="rounded-full border border-rose-200/40 px-8 py-3" onClick={incNo}>No</button>
      </div>
    </section>
  );
}

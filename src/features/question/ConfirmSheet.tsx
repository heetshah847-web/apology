import { Button, Sheet } from '@/design';

interface Props { open: boolean; prompt: string; confirmLabel: string; onConfirm: () => void; onClose: () => void }

/** "Promise?" then the confirm button. */
export function ConfirmSheet({ open, prompt, confirmLabel, onConfirm, onClose }: Props) {
  return (
    <Sheet open={open} onClose={onClose} title={prompt}>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="royal" size="lg" onClick={onConfirm} autoFocus>{confirmLabel}</Button>
        <Button variant="ghost" onClick={onClose}>Wait, go back</Button>
      </div>
    </Sheet>
  );
}

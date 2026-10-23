import { getFontEmbedCSS, toPng } from 'html-to-image';

/** Receipt to PNG. Fonts are embedded explicitly; the first render is a warm-up because iOS Safari drops images/fonts on the first pass. */
export async function receiptPng(node: HTMLElement): Promise<string> {
  await document.fonts?.ready;
  const fontEmbedCSS = await getFontEmbedCSS(node).catch(() => undefined);
  const opts = {
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor: '#ffffff',
    fontEmbedCSS,
    filter: (n: Node) => !(n instanceof HTMLElement && n.dataset.noCapture !== undefined),
  };
  await toPng(node, opts).catch(() => undefined);
  return toPng(node, opts);
}

export async function saveReceipt(node: HTMLElement, name: string): Promise<void> {
  const dataUrl = await receiptPng(node);
  const file = new File([await (await fetch(dataUrl)).blob()], `${name}.png`, { type: 'image/png' });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.canShare?.({ files: [file] })) {
    try { await nav.share({ files: [file], title: name }); return; } catch (e) { if ((e as Error).name === 'AbortError') return; }
  }
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `${name}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

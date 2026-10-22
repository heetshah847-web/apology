// Demo-only shim: the barrel still exports stubs until LANE-15 swaps it, so point useChapter at the real engine.
export * from '../../../../engine/index';
export { useChapter } from '../../../../engine/scroll/useChapter';

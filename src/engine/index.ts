// Barrel wired by LANE-15: every line re-exports the real module.
export { audioDirector } from './audio/AudioDirector';
export { SmoothScroll, useSmoothScroll } from './scroll/SmoothScroll';
export { NarratedTrack } from './scroll/NarratedTrack';
export { useChapter } from './scroll/useChapter';
export { useScene } from './scroll/useScene';
export { StepInside } from './scroll/StepInside';
export { story, getTrack, getPhase, getPhasesOfTrack } from './storyData.stub';

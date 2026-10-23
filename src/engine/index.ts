// Barrel: each line re-exports the real module (when its lane lands) or the stub.
// Lanes must NOT edit this file; LANE-15 swaps the export lines.
export { audioDirector } from './audio/AudioDirector';
export { SmoothScroll } from './scroll/SmoothScroll';
export { NarratedTrack } from './scroll/NarratedTrack';
export { useChapter } from './scroll/useChapter';
export { story, getTrack, getPhase, getPhasesOfTrack } from './storyData.stub';

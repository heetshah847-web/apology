// Barrel: each line re-exports the real module (when its lane lands) or the stub.
// Lanes must NOT edit this file; LANE-15 swaps the export lines.
export { audioDirector } from './audio/AudioDirector.stub';
export { SmoothScroll } from './scroll/SmoothScroll.stub';
export { NarratedTrack } from './scroll/NarratedTrack.stub';
export { useChapter } from './scroll/useChapter.stub';
export { story, getTrack, getPhase, getPhasesOfTrack } from './storyData.stub';

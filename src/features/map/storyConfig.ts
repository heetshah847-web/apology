import config from '../../../content/config/story.config.json';

/** Typed slice of content/config/story.config.json used by the gate and the map (copy stays in content/). */
export interface GateHeroConfig {
  meta: { siteTitle: string; herTitle: string; hisName: string; herName: string };
  passcode: { enabled: boolean; question: string; answerSha256: string; hints: string[] };
  hero: { kicker: string; names: string; line: string; readout: string; scrollHint: string };
  mapIntro: { tapLabel: string; afterUnfold: string };
}

export const storyConfig = config as unknown as GateHeroConfig;

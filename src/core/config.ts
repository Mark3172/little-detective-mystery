/** Canvas is 960x540; the world camera runs at zoom 2, so 480x270 world units are visible. */
export const GAME_W = 960;
export const GAME_H = 540;
export const WORLD_ZOOM = 2;
export const VIEW_W = GAME_W / WORLD_ZOOM;
export const VIEW_H = GAME_H / WORLD_ZOOM;

export const PLAYER_SPEED = 78;

export const FONT = 'Consolas, "Courier New", monospace';

export const SAVE_KEY = 'midnight-express-save-v1';
export const SETTINGS_KEY = 'midnight-express-settings-v1';

export const SCENE = {
  boot: 'Boot',
  title: 'Title',
  opening: 'Opening',
  train: 'Train',
  hud: 'Hud',
  dialogue: 'Dialogue',
  notebook: 'Notebook',
  contradiction: 'Contradiction',
  reconstruction: 'Reconstruction',
  accusation: 'Accusation',
  ending: 'Ending',
  pause: 'Pause',
  crossing: 'Crossing',
} as const;

export type MusicTheme = 'explore' | 'cinematic' | 'finale' | 'credits';

import type Phaser from 'phaser';
import { SCENE } from './config';

const GAMEPLAY = [
  SCENE.train,
  SCENE.hud,
  SCENE.dialogue,
  SCENE.notebook,
  SCENE.contradiction,
  SCENE.reconstruction,
  SCENE.accusation,
  SCENE.ending,
  SCENE.pause,
] as const;

/** Stop every running story scene so title / new-game / ending never stack. */
export function stopGameplay(from: Phaser.Scene, except?: string): void {
  const self = from.sys.settings.key;
  for (const key of GAMEPLAY) {
    if (key === except || key === self) continue;
    const mgr = from.scene;
    if (mgr.isActive(key) || mgr.isPaused(key) || mgr.isSleeping(key)) {
      mgr.stop(key);
    }
  }
}

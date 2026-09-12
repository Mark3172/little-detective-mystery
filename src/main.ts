import Phaser from 'phaser';
import './style.css';
import { GAME_H, GAME_W } from './core/config';
import { BootScene } from './scenes/BootScene';
import { TitleScene } from './scenes/TitleScene';
import { OpeningScene } from './scenes/OpeningScene';
import { TrainScene } from './scenes/TrainScene';
import { HudScene } from './scenes/HudScene';
import { DialogueScene } from './scenes/DialogueScene';
import { NotebookScene } from './scenes/NotebookScene';
import { ContradictionScene } from './scenes/ContradictionScene';
import { ReconstructionScene } from './scenes/ReconstructionScene';
import { AccusationScene } from './scenes/AccusationScene';
import { EndingScene } from './scenes/EndingScene';
import { PauseScene } from './scenes/PauseScene';
import { CrossingScene } from './scenes/CrossingScene';
import { Audio } from './core/audio';
import { attachDebug } from './core/debug';

attachDebug();

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_W,
  height: GAME_H,
  backgroundColor: '#05070f',
  pixelArt: true,
  roundPixels: true,
  antialias: false,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { x: 0, y: 0 }, debug: false },
  },
  scene: [
    BootScene,
    TitleScene,
    OpeningScene,
    TrainScene,
    HudScene,
    DialogueScene,
    NotebookScene,
    ContradictionScene,
    ReconstructionScene,
    AccusationScene,
    EndingScene,
    PauseScene,
    CrossingScene,
  ],
});

if (import.meta.env.DEV) {
  (window as unknown as { __game: Phaser.Game }).__game = game;
}

// Audio may only start after a genuine user gesture.
const unlock = () => Audio.unlock();
window.addEventListener('pointerdown', unlock, { once: false });
window.addEventListener('keydown', unlock, { once: false });
window.addEventListener('touchstart', unlock, { once: false });

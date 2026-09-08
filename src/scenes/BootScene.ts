import Phaser from 'phaser';
import { SCENE } from '../core/config';
import { buildAllArt } from '../core/art';
import { GameState } from '../core/state';

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENE.boot);
  }

  create(): void {
    GameState.loadSettings();
    buildAllArt(this);
    this.scene.start(SCENE.title);
  }
}

import Phaser from 'phaser';
import { PLAYER_SPEED, SCENE, VIEW_H, VIEW_W, WORLD_ZOOM } from '../core/config';
import { P, toInt } from '../core/palette';
import { charTexture, frameFor } from '../core/art';
import { GameState } from '../core/state';
import { Audio } from '../core/audio';
import { AREAS, WALL_BOTTOM, WALL_TOP, type Area, type Interactable, type Solid } from '../data/areas';
import { CHARACTERS } from '../data/characters';
import { PROLOGUE } from '../data/story';
import type { AreaId, Line } from '../data/types';

type Target =
  | { kind: 'interact'; item: Interactable; x: number; y: number; label: string }
  | { kind: 'talk'; charId: string; x: number; y: number; label: string }
  | { kind: 'door'; to: AreaId; side: 'left' | 'right'; x: number; y: number; label: string; locked?: string }
  | { kind: 'furniture'; x: number; y: number; label: string; lines: Line[] };

const TABLE_LOOK: Line[] = [
  {
    speaker: 'narrator',
    text: 'A table set for a meal that never arrived. Sugar bowl, two cups, a napkin folded into a hat.',
  },
  { speaker: 'ori', emotion: 'neutral', text: '(Nothing squared to the edge. Nobody left a name here.)' },
];

export class TrainScene extends Phaser.Scene {
  private area!: Area;
  private player!: Phaser.Physics.Arcade.Sprite;
  private solids!: Phaser.Physics.Arcade.StaticGroup;
  private npcs: { id: string; sprite: Phaser.GameObjects.Sprite }[] = [];
  private worldLayer!: Phaser.GameObjects.Container;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys: Record<string, Phaser.Input.Keyboard.Key> = {};
  private target: Target | null = null;
  private marker!: Phaser.GameObjects.Image;
  private overlayOpen = false;
  private tunnelOverlay!: Phaser.GameObjects.Rectangle;
  private scenerySprites: Phaser.GameObjects.TileSprite[] = [];
  private rainSprites: Phaser.GameObjects.TileSprite[] = [];
  private shakeT = 0;
  private stepT = 0;
  private tunnelTimer = 0;
  private inTunnel = false;
  private facing: 0 | 1 | 2 | 3 = 0;
  private touchVec = new Phaser.Math.Vector2(0, 0);
  private pendingPrologue = false;
  private saveT = 0;
  private crossing = false;

  constructor() {
    super(SCENE.train);
  }

  init(data: { prologue?: boolean }): void {
    this.pendingPrologue = !!data?.prologue;
  }

  create(): void {
    this.npcs = [];
    this.scenerySprites = [];
    this.rainSprites = [];
    this.overlayOpen = false;

    this.cameras.main.setZoom(WORLD_ZOOM);
    this.cameras.main.setRoundPixels(true);
    this.cameras.main.setBackgroundColor(P.night0);

    this.buildAnimations();
    this.buildArea(GameState.area);

    if (!this.scene.isActive(SCENE.hud)) this.scene.launch(SCENE.hud);

    this.game.canvas.setAttribute('tabindex', '0');
    this.game.canvas.focus();

    this.cursors = this.input.keyboard?.createCursorKeys();
    this.keys = (this.input.keyboard?.addKeys('W,A,S,D,E,J,R,ESC,SPACE,M') ?? {}) as Record<
      string,
      Phaser.Input.Keyboard.Key
    >;
    this.input.keyboard?.addCapture(['E', 'SPACE', 'J', 'R', 'W', 'A', 'S', 'D']);

    this.keys.J?.on('down', () => this.openNotebook());
    this.keys.R?.on('down', () => this.openReconstruction());
    this.keys.ESC?.on('down', () => this.openPause());
    this.keys.M?.on('down', () => Audio.setMuted(!Audio.muted));

    this.input.on('pointerdown', () => {
      Audio.unlock();
      this.game.canvas.focus();
    });
    this.input.keyboard?.on('keydown', () => Audio.unlock());

    // Touch / HUD button bridge.
    this.game.events.on('hud-move', this.onHudMove, this);
    this.game.events.on('hud-interact', this.tryInteract, this);
    this.game.events.on('hud-notebook', this.openNotebook, this);
    this.game.events.on('hud-recon', this.openReconstruction, this);
    this.game.events.on('hud-pause', this.openPause, this);
    this.game.events.on('overlay-closed', this.onOverlayClosed, this);

    this.events.once('shutdown', () => {
      this.game.events.off('hud-move', this.onHudMove, this);
      this.game.events.off('hud-interact', this.tryInteract, this);
      this.game.events.off('hud-notebook', this.openNotebook, this);
      this.game.events.off('hud-recon', this.openReconstruction, this);
      this.game.events.off('hud-pause', this.openPause, this);
      this.game.events.off('overlay-closed', this.onOverlayClosed, this);
    });

    if (this.pendingPrologue) {
      this.pendingPrologue = false;
      this.time.delayedCall(300, () => this.runLines(PROLOGUE));
    }
  }

  /* ---------------------------------------------------------------- */
  /* Construction                                                      */
  /* ---------------------------------------------------------------- */

  private buildAnimations(): void {
    const ids = ['ori', ...CHARACTERS.map((c) => c.id)];
    const dirs = ['down', 'left', 'right', 'up'];
    for (const id of ids) {
      for (let d = 0; d < 4; d++) {
        const key = `${id}_walk_${dirs[d]}`;
        if (this.anims.exists(key)) continue;
        this.anims.create({
          key,
          frames: [
            { key: charTexture(id), frame: frameFor(d as 0 | 1 | 2 | 3, 1) },
            { key: charTexture(id), frame: frameFor(d as 0 | 1 | 2 | 3, 0) },
            { key: charTexture(id), frame: frameFor(d as 0 | 1 | 2 | 3, 2) },
            { key: charTexture(id), frame: frameFor(d as 0 | 1 | 2 | 3, 0) },
          ],
          frameRate: 7,
          repeat: -1,
        });
      }
    }
  }

  private buildArea(id: AreaId, opts?: { fadeIn?: boolean; announce?: boolean }): void {
    this.area = AREAS[id];
    GameState.area = id;
    const { width, height } = this.area;

    this.children.removeAll(true);
    this.npcs = [];
    this.scenerySprites = [];
    this.rainSprites = [];

    this.worldLayer = this.add.container(0, 0);

    // Floor.
    const floor = this.add.tileSprite(0, WALL_TOP, width, WALL_BOTTOM - WALL_TOP, `floor_${id}`).setOrigin(0, 0);
    floor.setDepth(-20);
    this.worldLayer.add(floor);

    // Warm lamp pools on the floor.
    for (const lx of this.area.lamps) {
      const glow = this.add.image(lx, 148, 'lampglow').setDepth(-15).setScale(1.5, 1.1);
      glow.setAlpha(0.55 * this.area.lamp);
      glow.setBlendMode(Phaser.BlendModes.ADD);
      this.worldLayer.add(glow);
      const bulb = this.add.rectangle(lx, WALL_TOP - 3, 10, 4, toInt(P.amber4), 0.9).setDepth(-14);
      this.worldLayer.add(bulb);
      this.tweens.add({
        targets: [glow, bulb],
        alpha: { from: glow.alpha, to: glow.alpha * 0.82 },
        duration: 1700 + Math.random() * 900,
        yoyo: true,
        repeat: -1,
      });
    }

    // Wall bands.
    const topWall = this.add.tileSprite(0, 0, width, WALL_TOP, 'wall_panel').setOrigin(0, 0).setDepth(40);
    const botWall = this.add
      .tileSprite(0, WALL_BOTTOM, width, height - WALL_BOTTOM, 'wall_panel')
      .setOrigin(0, 0)
      .setDepth(268);
    this.worldLayer.add([topWall, botWall]);
    // Skirting highlights.
    const skirtTop = this.add.rectangle(0, WALL_TOP - 3, width, 3, toInt(P.amber1), 0.55).setOrigin(0, 0).setDepth(41);
    const skirtBot = this.add.rectangle(0, WALL_BOTTOM, width, 3, toInt(P.wood0)).setOrigin(0, 0).setDepth(269);
    this.worldLayer.add([skirtTop, skirtBot]);

    // Windows with moving scenery and rain.
    for (const win of this.area.windows) {
      const depth = win.y < WALL_TOP ? 42 : 270;
      const frame = this.add
        .rectangle(win.x - 2, win.y - 2, win.w + 4, win.h + 4, toInt(P.wood0))
        .setOrigin(0, 0)
        .setDepth(depth);
      const sky = this.add.rectangle(win.x, win.y, win.w, win.h, toInt(P.night1)).setOrigin(0, 0).setDepth(depth);
      const scenery = this.add
        .tileSprite(win.x, win.y, win.w, win.h, 'scenery')
        .setOrigin(0, 0)
        .setDepth(depth)
        .setAlpha(0.95);
      const rain = this.add
        .tileSprite(win.x, win.y, win.w, win.h, 'rain')
        .setOrigin(0, 0)
        .setDepth(depth)
        .setAlpha(0.75);
      const streak = this.add
        .tileSprite(win.x, win.y, win.w, win.h, 'streak')
        .setOrigin(0, 0)
        .setDepth(depth)
        .setAlpha(0.5);
      const sheen = this.add
        .rectangle(win.x, win.y, win.w, Math.max(2, Math.floor(win.h / 5)), toInt(P.glass), 0.3)
        .setOrigin(0, 0)
        .setDepth(depth);
      this.scenerySprites.push(scenery);
      this.rainSprites.push(rain, streak);
      this.worldLayer.add([frame, sky, scenery, rain, streak, sheen]);
    }

    // Solids: physics bodies plus their pixel artwork.
    this.solids = this.physics.add.staticGroup();
    for (const s of this.area.solids) {
      const body = this.add.rectangle(s.x + s.w / 2, s.y + s.h / 2, s.w, s.h);
      this.physics.add.existing(body, true);
      this.solids.add(body);
      body.setVisible(false);
      if (s.kind !== 'wall') this.drawSolid(s);
    }

    // Search sparkles sit on the walkable side of furniture so they are not
    // trapped inside a collider the player cannot step onto.
    for (const item of this.area.interactables) {
      const done = GameState.interactPass(item.id) > 0;
      const at = this.reachPoint(item.x, item.y);
      const dot = this.add.image(at.x, at.y, 'glint').setDepth(at.y + 2);
      if (done) dot.setTint(toInt(P.slate3)).setAlpha(0.55);
      dot.setInteractive({ useHandCursor: true, pixelPerfect: false });
      dot.on('pointerdown', () => {
        this.game.canvas.focus();
        if (this.overlayOpen) return;
        const d = this.interactDistance(this.player.x, this.player.y - 6, item.x, item.y);
        if (d > (item.r ?? 56) + 10) return;
        this.target = { kind: 'interact', item, x: at.x, y: at.y, label: item.label };
        this.tryInteract();
      });
      this.tweens.add({
        targets: dot,
        alpha: { from: done ? 0.55 : 1, to: done ? 0.2 : 0.35 },
        duration: 900,
        yoyo: true,
        repeat: -1,
      });
    }

    // Witnesses.
    for (const c of CHARACTERS) {
      if (c.home !== id) continue;
      const spr = this.add.sprite(c.x, c.y, charTexture(c.id), frameFor(0, 0)).setOrigin(0.5, 1);
      spr.setDepth(c.y);
      this.worldLayer.add(spr);
      this.npcs.push({ id: c.id, sprite: spr });
      this.tweens.add({ targets: spr, y: c.y - 1, duration: 1400 + Math.random() * 500, yoyo: true, repeat: -1 });
    }

    // Doors.
    this.drawDoor('left', !!this.area.leftDoor);
    this.drawDoor('right', !!this.area.rightDoor);

    // Player.
    this.player = this.physics.add.sprite(GameState.x, GameState.y, charTexture('ori'), frameFor(0, 0));
    this.player.setOrigin(0.5, 1);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setSize(10, 8);
    body.setOffset(3, 16);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(GameState.y);
    this.worldLayer.add(this.player);
    this.physics.add.collider(this.player, this.solids);
    this.physics.world.setBounds(0, 0, width, height);

    // Interaction marker — pixel sprite, kept off the world container so camera
    // zoom cannot leave a canvas-text ghost on the floor.
    this.marker = this.add.image(0, 0, 'prompt_e').setOrigin(0.5, 1).setDepth(9000).setVisible(false);

    // Tunnel darkness plate.
    this.tunnelOverlay = this.add
      .rectangle(0, 0, width, height, toInt(P.night0), 0)
      .setOrigin(0, 0)
      .setDepth(8000);
    this.worldLayer.add(this.tunnelOverlay);

    this.cameras.main.setBounds(0, 0, width, height);
    this.cameras.main.startFollow(this.player, true, 0.14, 0.14);
    this.cameras.main.setDeadzone(60, 40);
    if (opts?.fadeIn !== false) this.cameras.main.fadeIn(320, 5, 7, 15);
    if (opts?.announce !== false) this.game.events.emit('area-changed', this.area);
  }

  private drawSolid(s: Solid): void {
    const g = this.add.graphics();
    g.setDepth(s.y + s.h);
    const paint = (fill: string, top: string, bottom: string) => {
      g.fillStyle(toInt(bottom), 1);
      g.fillRect(s.x, s.y + 2, s.w, s.h);
      g.fillStyle(toInt(fill), 1);
      g.fillRect(s.x, s.y, s.w, s.h - 2);
      g.fillStyle(toInt(top), 1);
      g.fillRect(s.x, s.y, s.w, 2);
    };
    switch (s.kind) {
      case 'seat':
        paint(P.velvet1, P.velvet2, P.velvet0);
        g.fillStyle(toInt(P.velvet0), 1);
        for (let x = s.x + 4; x < s.x + s.w - 2; x += 10) g.fillRect(x, s.y + 4, 1, s.h - 8);
        g.fillStyle(toInt(P.amber2), 0.5);
        g.fillRect(s.x + 2, s.y + s.h - 6, s.w - 4, 1);
        break;
      case 'table': {
        paint(P.wood2, '#8a5d3d', P.wood0);
        g.fillStyle(toInt(P.paper), 0.85);
        g.fillRect(s.x + 3, s.y + 3, s.w - 6, s.h - 8);
        const cx = s.x + Math.floor(s.w / 2);
        const cy = s.y + Math.floor(s.h / 2) - 1;
        g.fillStyle(toInt(P.paperDim), 1);
        g.fillRect(cx - 6, cy - 3, 11, 8);
        g.fillStyle(toInt(P.wood2), 0.55);
        g.fillRect(cx - 4, cy - 1, 7, 4);
        g.fillStyle(toInt(P.slate2), 1);
        g.fillRect(cx + 7, cy - 2, 4, 5);
        g.fillStyle(toInt(P.amber1), 1);
        g.fillRect(cx + 8, cy - 1, 2, 2);
        break;
      }
      case 'counter':
        paint(P.wood1, P.amber2, P.wood0);
        g.fillStyle(toInt(P.amber3), 0.9);
        g.fillRect(s.x, s.y + s.h - 4, s.w, 2);
        g.fillStyle(toInt(P.slate2), 1);
        for (let x = s.x + 8; x < s.x + s.w - 8; x += 22) g.fillRect(x, s.y + 6, 6, 8);
        break;
      case 'crate':
        paint('#6a5638', '#8a7048', '#3d3122');
        g.fillStyle(toInt('#3d3122'), 1);
        g.fillRect(s.x + 2, s.y + 4, s.w - 4, 1);
        g.fillRect(s.x + 2, s.y + s.h - 8, s.w - 4, 1);
        g.fillStyle(toInt(P.paper), 0.7);
        g.fillRect(s.x + 5, s.y + 7, Math.max(6, s.w / 3), 3);
        break;
      case 'bunk':
        paint(P.slate1, P.slate2, P.ink);
        g.fillStyle(toInt(P.paper), 0.8);
        g.fillRect(s.x + 3, s.y + 4, s.w - 6, s.h - 14);
        g.fillStyle(toInt(P.velvet1), 1);
        g.fillRect(s.x + 3, s.y + s.h - 12, s.w - 6, 6);
        break;
      case 'rack':
        g.fillStyle(toInt(P.slate2), 1);
        g.fillRect(s.x, s.y, s.w, 2);
        g.fillStyle(toInt(P.wood1), 1);
        for (let x = s.x + 6; x < s.x + s.w - 8; x += 26) g.fillRect(x, s.y + 2, 18, s.h - 2);
        break;
      case 'partition':
        paint(P.wood1, P.wood2, P.wood0);
        g.fillStyle(toInt(P.wood0), 1);
        for (let x = s.x + 20; x < s.x + s.w; x += 46) g.fillRect(x, s.y, 2, s.h);
        g.fillStyle(toInt(P.amber3), 0.55);
        for (let x = s.x + 34; x < s.x + s.w; x += 46) g.fillRect(x, s.y + s.h - 16, 8, 10);
        break;
      default:
        paint(P.wood1, P.wood2, P.wood0);
    }
    this.worldLayer.add(g);
  }

  private drawDoor(side: 'left' | 'right', open: boolean): void {
    const x = side === 'left' ? 0 : this.area.width - 14;
    const g = this.add.graphics().setDepth(150);
    g.fillStyle(toInt(open ? P.wood2 : P.slate1), 1);
    g.fillRect(x, 120, 14, 78);
    g.fillStyle(toInt(open ? P.amber3 : P.red), 0.9);
    g.fillRect(x + (side === 'left' ? 10 : 2), 152, 3, 8);
    g.fillStyle(toInt(P.night0), 1);
    g.fillRect(x + 3, 126, 8, 20);
    g.fillStyle(toInt(open ? P.amber1 : P.slate0), 0.7);
    g.fillRect(x + 4, 127, 6, 18);
    this.worldLayer.add(g);
  }

  private pointInSolid(x: number, y: number): Solid | null {
    for (const s of this.area.solids) {
      if (s.kind === 'wall') continue;
      if (x >= s.x && x < s.x + s.w && y >= s.y && y < s.y + s.h) return s;
    }
    return null;
  }

  private reachPoint(x: number, y: number): { x: number; y: number } {
    const s = this.pointInSolid(x, y);
    if (!s) return { x, y };
    const aisle = (WALL_TOP + WALL_BOTTOM) / 2;
    const ny = s.y + s.h / 2 < aisle ? s.y + s.h + 6 : s.y - 6;
    const px = Phaser.Math.Clamp(x, s.x + 4, s.x + s.w - 4);
    if (!this.pointInSolid(px, ny)) return { x: Math.round(px), y: Math.round(ny) };
    const left = s.x - 8;
    const right = s.x + s.w + 8;
    return Math.abs(x - left) < Math.abs(x - right)
      ? { x: Math.round(left), y: Math.round(y) }
      : { x: Math.round(right), y: Math.round(y) };
  }

  private interactDistance(px: number, py: number, ix: number, iy: number): number {
    const s = this.pointInSolid(ix, iy);
    if (!s) return Phaser.Math.Distance.Between(px, py, ix, iy);
    const cx = Phaser.Math.Clamp(px, s.x, s.x + s.w);
    const cy = Phaser.Math.Clamp(py, s.y, s.y + s.h);
    return Math.hypot(px - cx, py - cy);
  }

  private adjacentTable(px: number, py: number): Solid | null {
    let best: Solid | null = null;
    let bestD = 10;
    for (const s of this.area.solids) {
      if (s.kind !== 'table') continue;
      const cx = Phaser.Math.Clamp(px, s.x, s.x + s.w);
      const cy = Phaser.Math.Clamp(py, s.y, s.y + s.h);
      const d = Math.hypot(px - cx, py - cy);
      if (d < bestD) {
        bestD = d;
        best = s;
      }
    }
    return best;
  }

  /* ---------------------------------------------------------------- */
  /* Interaction                                                       */
  /* ---------------------------------------------------------------- */

  private findTarget(): Target | null {
    const px = this.player.x;
    const py = this.player.y - 6;
    let best: Target | null = null;
    let bestD = Infinity;

    for (const item of this.area.interactables) {
      const at = this.reachPoint(item.x, item.y);
      const d = this.interactDistance(px, py, item.x, item.y);
      const r = item.r ?? 52;
      if (d < r && d < bestD) {
        bestD = d;
        best = { kind: 'interact', item, x: at.x, y: at.y, label: item.label };
      }
    }

    for (const npc of this.npcs) {
      const d = Phaser.Math.Distance.Between(px, py, npc.sprite.x, npc.sprite.y - 10);
      if (d < 36 && d < bestD) {
        const c = CHARACTERS.find((ch) => ch.id === npc.id)!;
        bestD = d;
        best = { kind: 'talk', charId: npc.id, x: npc.sprite.x, y: npc.sprite.y - 26, label: `Talk to ${c.name}` };
      }
    }

    const doorY = 160;
    if (this.area.leftDoor && px < 42 && Math.abs(py - doorY) < 60) {
      const d = px;
      if (d < bestD) {
        const locked = !GameState.hasAll(this.area.leftDoor.requiresFlags)
          ? this.area.leftDoor.lockedText
          : undefined;
        best = {
          kind: 'door',
          to: this.area.leftDoor.to,
          side: 'left',
          x: 14,
          y: 130,
          label: locked ? 'Locked door' : `Go to ${AREAS[this.area.leftDoor.to].name}`,
          locked,
        };
        bestD = d;
      }
    }
    if (this.area.rightDoor && px > this.area.width - 42 && Math.abs(py - doorY) < 60) {
      const d = this.area.width - px;
      if (d < bestD) {
        const locked = !GameState.hasAll(this.area.rightDoor.requiresFlags)
          ? this.area.rightDoor.lockedText
          : undefined;
        best = {
          kind: 'door',
          to: this.area.rightDoor.to,
          side: 'right',
          x: this.area.width - 14,
          y: 130,
          label: locked ? 'Locked door' : `Go to ${AREAS[this.area.rightDoor.to].name}`,
          locked,
        };
      }
    }

    if (!best) {
      const table = this.adjacentTable(px, py);
      if (table) {
        best = {
          kind: 'furniture',
          x: table.x + table.w / 2,
          y: table.y + 4,
          label: 'Look over the table',
          lines: TABLE_LOOK,
        };
      }
    }

    return best;
  }

  private tryInteract(): void {
    if (this.overlayOpen || !this.target) return;
    const t = this.target;
    if (t.kind === 'door') {
      if (t.locked) {
        this.runLines([{ speaker: 'narrator', text: t.locked }]);
        return;
      }
      this.changeArea(t.to, t.side);
      return;
    }
    if (t.kind === 'talk') {
      this.openDialogue(t.charId);
      return;
    }
    if (t.kind === 'furniture') {
      this.runLines(t.lines);
      return;
    }
    this.examine(t.item);
  }

  private examine(item: Interactable): void {
    if (!GameState.hasAll(item.requiresFlags)) {
      this.runLines(item.lockedLines ?? [{ speaker: 'narrator', text: 'Nothing to do here yet.' }]);
      return;
    }
    const pass = GameState.interactPass(item.id);
    if (pass === 0) {
      GameState.bumpInteract(item.id);
      this.runLines(item.lines, item.effects);
      return;
    }
    if (item.followUp && pass === 1 && GameState.hasAll(item.followUp.requiresFlags)) {
      GameState.bumpInteract(item.id);
      this.runLines(item.followUp.lines, item.followUp.effects);
      return;
    }
    this.runLines(item.exhaustedLines ?? item.lines);
  }

  private changeArea(to: AreaId, side: 'left' | 'right'): void {
    if (this.crossing) return;
    this.crossing = true;
    Audio.door();
    Audio.crossing();
    Audio.duckMusic(0.4);
    this.overlayOpen = true;
    this.player.setVelocity(0, 0);
    this.marker.setVisible(false);
    this.game.events.emit('prompt', null);
    const dest = AREAS[to];
    this.game.events.emit('crossing', { from: this.area.name, to: dest.name, side });
    this.game.events.emit('overlay-open');
    this.cameras.main.fadeOut(520, 5, 7, 15);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.time.delayedCall(2800, () => {
        GameState.x = side === 'right' ? 40 : dest.width - 40;
        GameState.y = 160;
        GameState.save();
        this.buildArea(to, { fadeIn: false, announce: false });
        this.game.events.emit('crossing-done');
        Audio.duckMusic(1);
        this.cameras.main.fadeIn(780, 5, 7, 15);
        this.cameras.main.once('camerafadeincomplete', () => {
          this.game.events.emit('area-changed', this.area);
          this.overlayOpen = false;
          this.crossing = false;
          this.game.events.emit('overlay-closed');
        });
      });
    });
  }

  /* ---------------------------------------------------------------- */
  /* Overlays                                                          */
  /* ---------------------------------------------------------------- */

  private openOverlay(key: string, data?: object): void {
    if (this.overlayOpen) return;
    this.overlayOpen = true;
    this.marker?.setVisible(false);
    this.persist();
    this.game.events.emit('overlay-open');
    this.scene.pause();
    this.scene.launch(key, data);
  }

  private onOverlayClosed(): void {
    this.overlayOpen = false;
    this.touchVec.set(0, 0);
  }

  runLines(lines: Line[], effects?: import('../data/types').Effects): void {
    this.openOverlay(SCENE.dialogue, { mode: 'lines', lines, effects });
  }

  private openDialogue(charId: string): void {
    this.openOverlay(SCENE.dialogue, { mode: 'interview', charId });
  }

  private openNotebook(): void {
    this.openOverlay(SCENE.notebook, {});
  }

  private openReconstruction(): void {
    if (this.overlayOpen) return;
    if (!GameState.has('ready_for_reconstruction')) {
      this.runLines([
        { speaker: 'ori', emotion: 'neutral', text: '(Not yet. I can picture pieces of tonight, but not the shape of it.)' },
        { speaker: 'ori', emotion: 'neutral', text: '(Three contradictions first. Then I can rebuild the whole forty seconds.)' },
      ]);
      return;
    }
    this.openOverlay(SCENE.reconstruction, {});
  }

  private openPause(): void {
    this.openOverlay(SCENE.pause, {});
  }

  private persist(): void {
    GameState.x = this.player.x;
    GameState.y = this.player.y;
    GameState.save();
  }

  /* ---------------------------------------------------------------- */
  /* Loop                                                              */
  /* ---------------------------------------------------------------- */

  private onHudMove(v: { x: number; y: number }): void {
    this.touchVec.set(v.x, v.y);
  }

  update(_time: number, delta: number): void {
    const dt = delta / 1000;
    GameState.playedMs += delta;
    this.saveT += delta;
    if (this.saveT > 8000) {
      this.saveT = 0;
      this.persist();
    }

    // Movement.
    let vx = 0;
    let vy = 0;
    if (this.cursors?.left.isDown || this.keys.A?.isDown) vx -= 1;
    if (this.cursors?.right.isDown || this.keys.D?.isDown) vx += 1;
    if (this.cursors?.up.isDown || this.keys.W?.isDown) vy -= 1;
    if (this.cursors?.down.isDown || this.keys.S?.isDown) vy += 1;
    vx += this.touchVec.x;
    vy += this.touchVec.y;

    const len = Math.hypot(vx, vy);
    if (len > 0) {
      vx = (vx / len) * PLAYER_SPEED;
      vy = (vy / len) * PLAYER_SPEED;
      if (Math.abs(vx) > Math.abs(vy)) this.facing = vx < 0 ? 1 : 2;
      else this.facing = vy < 0 ? 3 : 0;
      const dirName = ['down', 'left', 'right', 'up'][this.facing];
      this.player.anims.play(`ori_walk_${dirName}`, true);
      this.stepT += delta;
      if (this.stepT > 280) {
        this.stepT = 0;
        Audio.step();
      }
    } else {
      this.player.anims.stop();
      this.player.setFrame(frameFor(this.facing, 0));
    }
    this.player.setVelocity(vx, vy);
    this.player.setDepth(this.player.y);

    // Nearest interaction target.
    const t = this.overlayOpen ? null : this.findTarget();
    if (t) {
      const bob = Math.sin(this.shakeT * 8) * 1.2;
      this.marker.setVisible(true);
      this.marker.setPosition(Math.round(t.x), Math.round(t.y - 8 + bob));
    } else {
      this.marker.setVisible(false);
    }
    if (t?.label !== this.target?.label) {
      this.game.events.emit('prompt', t ? t.label : null);
    }
    this.target = t;

    const pressE = this.keys.E ? Phaser.Input.Keyboard.JustDown(this.keys.E) : false;
    const pressSpace = this.keys.SPACE ? Phaser.Input.Keyboard.JustDown(this.keys.SPACE) : false;
    if (pressE || pressSpace) this.tryInteract();

    // Scenery and rain scroll.
    for (const s of this.scenerySprites) s.tilePositionX += delta * 0.24;
    for (let i = 0; i < this.rainSprites.length; i++) {
      const r = this.rainSprites[i];
      r.tilePositionX += delta * (i % 2 === 0 ? 0.5 : 0.06);
      r.tilePositionY += delta * (i % 2 === 0 ? 0.9 : 0.35);
    }

    // Gentle carriage vibration.
    this.shakeT += dt;
    const sway = Math.sin(this.shakeT * 7.3) * 0.5 + Math.sin(this.shakeT * 2.1) * 0.35;
    this.cameras.main.setFollowOffset(0, sway);

    // Occasional tunnel.
    this.tunnelTimer += delta;
    if (!this.inTunnel && this.tunnelTimer > 42000) {
      this.tunnelTimer = 0;
      this.runTunnel();
    }
  }

  private runTunnel(): void {
    this.inTunnel = true;
    this.game.events.emit('tunnel', true);
    this.tweens.add({
      targets: this.tunnelOverlay,
      alpha: 0.9,
      duration: 500,
      yoyo: true,
      hold: 2200,
      onYoyo: () => {
        // Flicker as the lights come back.
        this.tweens.add({ targets: this.tunnelOverlay, alpha: 0.55, duration: 70, yoyo: true, repeat: 2 });
      },
      onComplete: () => {
        this.inTunnel = false;
        this.game.events.emit('tunnel', false);
      },
    });
  }
}

export const VIEW = { W: VIEW_W, H: VIEW_H };

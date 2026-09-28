import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE, MAP_COLS, MAP_ROWS } from '../../config';
import { Player } from '../entities/Player';
import { useGameStore } from '../../stores/gameStore';

// 0=grass 1=dirt 2=path
const BASE_MAP: number[][] = (() => {
  const m: number[][] = [];
  for (let y = 0; y < MAP_ROWS; y++) {
    m[y] = [];
    for (let x = 0; x < MAP_COLS; x++) {
      m[y][x] = 0;
    }
  }
  // Horizontal path
  for (let x = 0; x < MAP_COLS; x++) {
    m[9][x] = 2;
    m[10][x] = 2;
  }
  // Vertical path
  for (let y = 0; y < MAP_ROWS; y++) {
    m[y][14] = 2;
    m[y][15] = 2;
  }
  // Dirt near shop area
  for (let dy = -1; dy <= 2; dy++) {
    for (let dx = -1; dx <= 3; dx++) {
      const ty = 5 + dy;
      const tx = 22 + dx;
      if (ty >= 0 && ty < MAP_ROWS && tx >= 0 && tx < MAP_COLS && m[ty][tx] === 0) {
        m[ty][tx] = 1;
      }
    }
  }
  // Dirt near well
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const ty = 4 + dy;
      const tx = 5 + dx;
      if (ty >= 0 && ty < MAP_ROWS && tx >= 0 && tx < MAP_COLS && m[ty][tx] === 0) {
        m[ty][tx] = 1;
      }
    }
  }
  return m;
})();

const TILE_KEYS: Record<number, string> = {
  0: 'tile_grass',
  1: 'tile_dirt',
  2: 'tile_path',
};

const WELL_POS = { x: 5, y: 4 };
const SHOP_POS = { x: 22, y: 5 };

export class MainScene extends Phaser.Scene {
  private player!: Player;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private lastTileX = -1;
  private lastTileY = -1;
  private lastFacing: 'up' | 'down' | 'left' | 'right' = 'down';

  constructor() {
    super({ key: 'MainScene' });
  }

  create(): void {
    // World bounds
    this.physics.world.setBounds(0, 0, MAP_COLS * TILE_SIZE, MAP_ROWS * TILE_SIZE);

    // Tilemap
    this.renderMap();

    // Well
    this.add.image(WELL_POS.x * TILE_SIZE, WELL_POS.y * TILE_SIZE, 'well')
      .setOrigin(0, 0)
      .setDepth(1);

    // Shop
    this.add.image(SHOP_POS.x * TILE_SIZE, SHOP_POS.y * TILE_SIZE, 'shop')
      .setOrigin(0, 0)
      .setDepth(1);

    // Crops from store
    this.renderCrops();

    // Player at center of map on the path
    this.player = new Player(this, 15 * TILE_SIZE, 9 * TILE_SIZE);

    // Camera
    const cam = this.cameras.main;
    cam.setBounds(0, 0, MAP_COLS * TILE_SIZE, MAP_ROWS * TILE_SIZE);
    cam.startFollow(this.player, true, 0.1, 0.1);
    cam.setZoom(GAME_WIDTH / (MAP_COLS * TILE_SIZE) > GAME_HEIGHT / (MAP_ROWS * TILE_SIZE)
      ? GAME_WIDTH / (MAP_COLS * TILE_SIZE)
      : GAME_HEIGHT / (MAP_ROWS * TILE_SIZE));
    cam.setBackgroundColor(0x000000);

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as unknown as Record<string, Phaser.Input.Keyboard.Key>;

    // Set initial game state
    useGameStore.getState().setGameState('playing');
  }

  update(): void {
    this.player.handleMovement(this.cursors, this.wasd);

    // Sync player position to store on change
    const pos = this.player.getTilePosition();
    if (pos.tile_x !== this.lastTileX || pos.tile_y !== this.lastTileY || this.player.facing !== this.lastFacing) {
      this.lastTileX = pos.tile_x;
      this.lastTileY = pos.tile_y;
      this.lastFacing = this.player.facing;
      useGameStore.getState().setPlayerPosition({
        tile_x: pos.tile_x,
        tile_y: pos.tile_y,
        facing: this.player.facing,
      });
    }
  }

  private renderMap(): void {
    const tileGroup = this.add.group();
    for (let y = 0; y < MAP_ROWS; y++) {
      for (let x = 0; x < MAP_COLS; x++) {
        const tileId = BASE_MAP[y][x];
        const key = TILE_KEYS[tileId] ?? 'tile_grass';
        tileGroup.add(
          this.add.image(x * TILE_SIZE, y * TILE_SIZE, key)
            .setOrigin(0, 0)
        );
      }
    }
    tileGroup.setDepth(0);
  }

  private renderCrops(): void {
    const crops = useGameStore.getState().crops;
    for (const crop of crops) {
      this.add.image(
        crop.position.x * TILE_SIZE,
        crop.position.y * TILE_SIZE,
        'crop'
      )
        .setOrigin(0, 0)
        .setDepth(1);
    }
  }
}

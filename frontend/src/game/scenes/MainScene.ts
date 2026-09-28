import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE, MAP_COLS, MAP_ROWS } from '../../config';
import { Player } from '../entities/Player';
import { useGameStore } from '../../stores/gameStore';
import { useUiStore } from '../../stores/uiStore';
import gameApi from '../../api/game';

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
  private interactKey!: Phaser.Input.Keyboard.Key;
  private lastTileX = -1;
  private lastTileY = -1;
  private lastFacing: 'up' | 'down' | 'left' | 'right' = 'down';
  private tilledTileSprites: Map<string, Phaser.GameObjects.Image> = new Map();
  private cropSprites: Map<string, Phaser.GameObjects.Image> = new Map();
  private waterMeterSprites: Map<string, Phaser.GameObjects.Graphics> = new Map();

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

    // Tilled tiles from store
    this.renderTilledTiles();

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
    this.interactKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // Set initial game state
    useGameStore.getState().setGameState('playing');

    // Subscribe to tilled tiles changes
    useGameStore.subscribe((state) => {
      this.onTilledTilesChanged(state.tilledTiles);
    });

    // Subscribe to crops changes
    useGameStore.subscribe((state) => {
      this.onCropsChanged(state.crops);
    });

    // Load initial data from API
    this.loadTilledTiles();
    this.loadCrops();
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

    // Handle E key interaction
    if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      this.handleInteract();
    }
  }

  private handleInteract(): void {
    const pos = this.player.getTilePosition();
    const facing = this.player.facing;

    // Calculate tile in front of player
    let targetX = pos.tile_x;
    let targetY = pos.tile_y;

    switch (facing) {
      case 'up': targetY--; break;
      case 'down': targetY++; break;
      case 'left': targetX--; break;
      case 'right': targetX++; break;
    }

    // Check if target is shop
    if (targetX === SHOP_POS.x && targetY === SHOP_POS.y) {
      useUiStore.getState().toggleShop();
      return;
    }

    // Check if target is well → refill water
    if (targetX === WELL_POS.x && targetY === WELL_POS.y) {
      this.refillWater();
      return;
    }

    // Check if tile is tilled
    const tilledTiles = useGameStore.getState().tilledTiles;
    const isTilled = tilledTiles.some((t) => t.tile_x === targetX && t.tile_y === targetY);

    if (!isTilled) {
      // Try to till the soil
      this.tillTile(targetX, targetY);
      return;
    }

    // Check if tile has a crop
    const crops = useGameStore.getState().crops;
    const crop = crops.find((c) => c.position.x === targetX && c.position.y === targetY);

    if (crop) {
      // Check if crop is ready → harvest
      if (crop.growthStage >= 3) {
        this.harvestCrop(targetX, targetY);
        return;
      }

      // Check if player has watering_can active
      const inventory = useGameStore.getState().inventory;
      const activeSlot = useGameStore.getState().activeHotbarSlot;
      const activeItem = inventory[activeSlot];

      if (activeItem?.item_code === 'watering_can') {
        // Water the crop
        this.waterCrop(targetX, targetY);
      } else {
        useUiStore.getState().addNotification('Gunakan ember air untuk menyiram', 'info');
      }
      return;
    }

    // No crop → check if player has seed in active hotbar
    const inventory = useGameStore.getState().inventory;
    const activeSlot = useGameStore.getState().activeHotbarSlot;
    const activeItem = inventory[activeSlot];

    if (activeItem && activeItem.type === 'seed' && activeItem.quantity > 0) {
      // Plant directly with hotbar seed
      this.plantSeed(targetX, targetY, activeItem.item_code);
    } else {
      // Open seed menu
      useUiStore.getState().setSeedMenuTile({ x: targetX, y: targetY });
      useUiStore.getState().setSeedMenuOpen(true);
    }
  }

  private async refillWater(): Promise<void> {
    try {
      const response = await gameApi.refillWater();
      const data = response.data;

      if (data.success) {
        useGameStore.getState().setWaterCapacity(data.data.water_capacity);
        useUiStore.getState().addNotification(data.message, 'success');
      } else {
        useUiStore.getState().addNotification(data.message || 'Gagal mengisi air', 'error');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Gagal mengisi air';
      useUiStore.getState().addNotification(message, 'error');
    }
  }

  private async waterCrop(tileX: number, tileY: number): Promise<void> {
    try {
      const response = await gameApi.water(tileX, tileY);
      const data = response.data;

      if (data.success) {
        // Update water capacity
        useGameStore.getState().setWaterCapacity(data.data.water_capacity);

        // Update crop in store
        const crops = useGameStore.getState().crops;
        const updatedCrops = crops.map((c) => {
          if (c.position.x === tileX && c.position.y === tileY) {
            return { ...c, waterLevel: data.data.water_level };
          }
          return c;
        });
        useGameStore.getState().setCrops(updatedCrops);

        useUiStore.getState().addNotification(data.message, 'success');
      } else {
        useUiStore.getState().addNotification(data.message || 'Gagal menyiram', 'error');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Gagal menyiram tanaman';
      useUiStore.getState().addNotification(message, 'error');
    }
  }

  private async harvestCrop(tileX: number, tileY: number): Promise<void> {
    try {
      const response = await gameApi.harvest(tileX, tileY);
      const data = response.data;

      if (data.success) {
        // Remove crop from store
        const crops = useGameStore.getState().crops;
        const updatedCrops = crops.filter(
          (c) => !(c.position.x === tileX && c.position.y === tileY)
        );
        useGameStore.getState().setCrops(updatedCrops);

        // Add harvested item to inventory
        const inventory = useGameStore.getState().inventory;
        const existingItem = inventory.find((i) => i.item_code === data.data.product_code);

        if (existingItem) {
          useGameStore.getState().setInventory(
            inventory.map((i) =>
              i.item_code === data.data.product_code
                ? { ...i, quantity: i.quantity + 1 }
                : i
            )
          );
        } else {
          useGameStore.getState().setInventory([
            ...inventory,
            {
              id: String(Date.now()),
              item_code: data.data.product_code,
              name: data.data.product_name,
              quantity: 1,
              type: 'crop',
            },
          ]);
        }

        useUiStore.getState().addNotification(data.message, 'success');
      } else {
        useUiStore.getState().addNotification(data.message || 'Gagal panen', 'error');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Gagal panen';
      useUiStore.getState().addNotification(message, 'error');
    }
  }

  private async tillTile(tileX: number, tileY: number): Promise<void> {
    try {
      const response = await gameApi.till(tileX, tileY);
      const data = response.data;

      if (data.success) {
        // Add tilled tile to store
        useGameStore.getState().addTilledTile({
          tile_x: tileX,
          tile_y: tileY,
          tilled_at: data.data.tilled_at,
        });

        useUiStore.getState().addNotification('Berhasil mencangkul tanah', 'success');
      } else {
        useUiStore.getState().addNotification(data.message || 'Gagal mencangkul', 'error');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Gagal mencangkul tanah';
      useUiStore.getState().addNotification(message, 'error');
    }
  }

  async plantSeed(tileX: number, tileY: number, seedCode: string): Promise<void> {
    try {
      const response = await gameApi.plant(tileX, tileY, seedCode);
      const data = response.data;

      if (data.success) {
        // Add crop to store
        useGameStore.getState().setCrops([
          ...useGameStore.getState().crops,
          {
            id: String(data.data.crop_id),
            type: data.data.item_code,
            position: { x: tileX, y: tileY },
            growthStage: 0,
            plantedAt: new Date(data.data.planted_at),
          },
        ]);

        // Update inventory (decrease seed)
        const inventory = useGameStore.getState().inventory;
        const updatedInventory = inventory.map((item) => {
          if (item.item_code === seedCode) {
            return { ...item, quantity: item.quantity - 1 };
          }
          return item;
        }).filter((item) => item.quantity > 0);
        useGameStore.getState().setInventory(updatedInventory);

        useUiStore.getState().addNotification(data.message, 'success');
      } else {
        useUiStore.getState().addNotification(data.message || 'Gagal menanam', 'error');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Gagal menanam bibit';
      useUiStore.getState().addNotification(message, 'error');
    }
  }

  private async loadTilledTiles(): Promise<void> {
    try {
      const response = await gameApi.getTilledTiles();
      if (response.data.success) {
        useGameStore.getState().setTilledTiles(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load tilled tiles:', error);
    }
  }

  private async loadCrops(): Promise<void> {
    try {
      const response = await gameApi.getState();
      if (response.data.success && response.data.data.crops) {
        useGameStore.getState().setCrops(response.data.data.crops);
      }
    } catch (error) {
      console.error('Failed to load crops:', error);
    }
  }

  private onTilledTilesChanged(tilledTiles: { tile_x: number; tile_y: number; tilled_at: string }[]): void {
    // Clear old sprites
    this.tilledTileSprites.forEach((sprite) => sprite.destroy());
    this.tilledTileSprites.clear();

    // Render new tilled tiles
    for (const tile of tilledTiles) {
      const key = `tilled_${tile.tile_x}_${tile.tile_y}`;
      const sprite = this.add.image(
        tile.tile_x * TILE_SIZE,
        tile.tile_y * TILE_SIZE,
        'tile_tilled'
      )
        .setOrigin(0, 0)
        .setDepth(0);

      this.tilledTileSprites.set(key, sprite);
    }
  }

  private onCropsChanged(crops: { id: string; type: string; position: { x: number; y: number }; growthStage: number; waterLevel?: number }[]): void {
    // Clear old sprites
    this.cropSprites.forEach((sprite) => sprite.destroy());
    this.cropSprites.clear();
    this.waterMeterSprites.forEach((graphics) => graphics.destroy());
    this.waterMeterSprites.clear();

    // Render crops based on stage
    for (const crop of crops) {
      let textureKey = 'crop_seed';
      if (crop.growthStage >= 3) textureKey = 'crop_ready';
      else if (crop.growthStage >= 2) textureKey = 'crop_growing';
      else if (crop.growthStage >= 1) textureKey = 'crop_sprout';

      const sprite = this.add.image(
        crop.position.x * TILE_SIZE,
        crop.position.y * TILE_SIZE,
        textureKey
      )
        .setOrigin(0, 0)
        .setDepth(1);

      this.cropSprites.set(`crop_${crop.position.x}_${crop.position.y}`, sprite);

      // Draw water meter if water level < 100
      if (crop.waterLevel !== undefined && crop.waterLevel < 100) {
        const meterGraphics = this.add.graphics();
        meterGraphics.setDepth(2);

        // Background (gray)
        meterGraphics.fillStyle(0x333333);
        meterGraphics.fillRect(
          crop.position.x * TILE_SIZE + 2,
          crop.position.y * TILE_SIZE - 3,
          12,
          2
        );

        // Fill (blue)
        const fillWidth = Math.max(0, (crop.waterLevel / 100) * 12);
        meterGraphics.fillStyle(0x3388cc);
        meterGraphics.fillRect(
          crop.position.x * TILE_SIZE + 2,
          crop.position.y * TILE_SIZE - 3,
          fillWidth,
          2
        );

        this.waterMeterSprites.set(`water_${crop.position.x}_${crop.position.y}`, meterGraphics);
      }
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
      let textureKey = 'crop_seed';
      if (crop.growthStage >= 3) textureKey = 'crop_ready';
      else if (crop.growthStage >= 2) textureKey = 'crop_growing';
      else if (crop.growthStage >= 1) textureKey = 'crop_sprout';

      const sprite = this.add.image(
        crop.position.x * TILE_SIZE,
        crop.position.y * TILE_SIZE,
        textureKey
      )
        .setOrigin(0, 0)
        .setDepth(1);

      this.cropSprites.set(`crop_${crop.position.x}_${crop.position.y}`, sprite);
    }
  }

  private renderTilledTiles(): void {
    const tilledTiles = useGameStore.getState().tilledTiles;
    for (const tile of tilledTiles) {
      const key = `tilled_${tile.tile_x}_${tile.tile_y}`;
      const sprite = this.add.image(
        tile.tile_x * TILE_SIZE,
        tile.tile_y * TILE_SIZE,
        'tile_tilled'
      )
        .setOrigin(0, 0)
        .setDepth(0);

      this.tilledTileSprites.set(key, sprite);
    }
  }
}

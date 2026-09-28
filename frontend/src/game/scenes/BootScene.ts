import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // All textures generated in create() via Phaser Graphics
  }

  create(): void {
    this.generateTileTextures();
    this.generateObjectTextures();
    this.generatePlayerTexture();
    this.scene.start('MainScene');
  }

  private generateTileTextures(): void {
    const g = this.add.graphics({ x: 0, y: 0 });

    // Grass tile
    g.clear();
    g.fillStyle(0x4a8c3f);
    g.fillRect(0, 0, 16, 16);
    g.fillStyle(0x5a9c4f);
    g.fillRect(2, 2, 2, 2);
    g.fillRect(10, 6, 2, 2);
    g.fillRect(6, 12, 2, 2);
    g.generateTexture('tile_grass', 16, 16);

    // Dirt tile
    g.clear();
    g.fillStyle(0x8b6914);
    g.fillRect(0, 0, 16, 16);
    g.fillStyle(0x7b5914);
    g.fillRect(3, 3, 2, 2);
    g.fillRect(11, 9, 2, 2);
    g.generateTexture('tile_dirt', 16, 16);

    // Path tile
    g.clear();
    g.fillStyle(0xc4a862);
    g.fillRect(0, 0, 16, 16);
    g.fillStyle(0xb49852);
    g.fillRect(1, 1, 3, 3);
    g.fillRect(9, 11, 3, 3);
    g.generateTexture('tile_path', 16, 16);

    g.destroy();
  }

  private generateObjectTextures(): void {
    const g = this.add.graphics({ x: 0, y: 0 });

    // Well (blue water + stone rim)
    g.clear();
    // Stone rim
    g.fillStyle(0x888888);
    g.fillRect(0, 0, 16, 16);
    // Inner water
    g.fillStyle(0x3388cc);
    g.fillRect(2, 2, 12, 12);
    g.fillStyle(0x55aaee);
    g.fillRect(4, 4, 4, 3);
    g.generateTexture('well', 16, 16);

    // Shop (brown building)
    g.clear();
    g.fillStyle(0x6b4226);
    g.fillRect(0, 0, 16, 16);
    g.fillStyle(0x8b5a2b);
    g.fillRect(2, 2, 12, 10);
    // Door
    g.fillStyle(0x4a2a10);
    g.fillRect(6, 6, 4, 6);
    // Roof accent
    g.fillStyle(0xcc4444);
    g.fillRect(0, 0, 16, 3);
    g.generateTexture('shop', 16, 16);

    // Crop placeholder (small green sprout)
    g.clear();
    g.fillStyle(0x000000, 0);
    g.fillRect(0, 0, 16, 16);
    g.fillStyle(0x66bb33);
    g.fillRect(7, 4, 2, 8);
    g.fillRect(5, 3, 2, 3);
    g.fillRect(9, 5, 2, 3);
    g.generateTexture('crop', 16, 16);

    g.destroy();
  }

  private generatePlayerTexture(): void {
    const g = this.add.graphics({ x: 0, y: 0 });

    // Player character (16x16)
    g.clear();
    // Head (skin)
    g.fillStyle(0xffcc99);
    g.fillRect(4, 0, 8, 6);
    // Hair
    g.fillStyle(0x4a2a0a);
    g.fillRect(4, 0, 8, 2);
    // Body (shirt)
    g.fillStyle(0x3366cc);
    g.fillRect(3, 6, 10, 6);
    // Belt
    g.fillStyle(0x886633);
    g.fillRect(3, 10, 10, 2);
    // Legs
    g.fillStyle(0x554488);
    g.fillRect(4, 12, 3, 4);
    g.fillRect(9, 12, 3, 4);
    // Eyes
    g.fillStyle(0x000000);
    g.fillRect(5, 3, 2, 2);
    g.fillRect(9, 3, 2, 2);
    g.generateTexture('player', 16, 16);

    g.destroy();
  }
}

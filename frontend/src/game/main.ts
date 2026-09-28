import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  preload(): void {
    // Load game assets here
  }

  create(): void {
    this.add.text(200, 200, 'Game Loading...', {
      fontSize: '32px',
      color: '#ffffff',
    });
  }

  update(): void {
    // Game loop logic
  }
}

export function createGame(parent: string | HTMLElement): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent,
    width: 800,
    height: 600,
    backgroundColor: '#2d2d2d',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scene: [GameScene],
  };

  return new Phaser.Game(config);
}

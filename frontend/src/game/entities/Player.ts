import Phaser from 'phaser';
import type { FacingDirection } from '../../stores/gameStore';
import { PLAYER_SPEED, TILE_SIZE } from '../../config';

export class Player extends Phaser.Physics.Arcade.Sprite {
  facing: FacingDirection = 'down';
  private moving = false;
  private bobTween: Phaser.Tweens.Tween | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0, 0);
    (this.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
    this.setDepth(10);
  }

  handleMovement(cursors: Phaser.Types.Input.Keyboard.CursorKeys, wasd: Record<string, Phaser.Input.Keyboard.Key>): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    let vx = 0;
    let vy = 0;

    if (cursors.left.isDown || wasd['A']?.isDown) {
      vx = -PLAYER_SPEED;
      this.facing = 'left';
    } else if (cursors.right.isDown || wasd['D']?.isDown) {
      vx = PLAYER_SPEED;
      this.facing = 'right';
    }

    if (cursors.up.isDown || wasd['W']?.isDown) {
      vy = -PLAYER_SPEED;
      this.facing = 'up';
    } else if (cursors.down.isDown || wasd['S']?.isDown) {
      vy = PLAYER_SPEED;
      this.facing = 'down';
    }

    body.setVelocity(vx, vy);
    this.moving = vx !== 0 || vy !== 0;
    this.updateBob();
  }

  getTilePosition(): { tile_x: number; tile_y: number } {
    return {
      tile_x: Math.floor((this.x + 8) / TILE_SIZE),
      tile_y: Math.floor((this.y + 8) / TILE_SIZE),
    };
  }

  private updateBob(): void {
    if (this.moving && !this.bobTween) {
      this.bobTween = this.scene.tweens.add({
        targets: this,
        scaleY: 0.92,
        duration: 120,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    } else if (!this.moving && this.bobTween) {
      this.bobTween.stop();
      this.bobTween = null;
      this.scaleY = 1;
    }
  }

  destroy(fromScene?: boolean): void {
    if (this.bobTween) {
      this.bobTween.destroy();
      this.bobTween = null;
    }
    super.destroy(fromScene);
  }
}

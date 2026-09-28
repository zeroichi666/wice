export interface Vector2 {
  x: number;
  y: number;
}

export type GameState = 'menu' | 'playing' | 'paused' | 'loading';

export interface Player {
  id: string;
  name: string;
  position: Vector2;
  level: number;
  experience: number;
}

export interface Crop {
  id: string;
  type: string;
  position: Vector2;
  growthStage: number;
  plantedAt: Date;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  type: 'seed' | 'tool' | 'crop' | 'currency';
}

import { create } from 'zustand';
import type { GameState, Crop, InventoryItem } from '../types';

export type FacingDirection = 'up' | 'down' | 'left' | 'right';

export interface PlayerPosition {
  tile_x: number;
  tile_y: number;
  facing: FacingDirection;
}

interface GameStore {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  playerPosition: PlayerPosition;
  setPlayerPosition: (pos: PlayerPosition) => void;
  crops: Crop[];
  setCrops: (crops: Crop[]) => void;

  // Player data
  username: string;
  setUsername: (name: string) => void;
  coins: number;
  setCoins: (coins: number) => void;
  level: number;
  setLevel: (level: number) => void;
  waterCapacity: number;
  setWaterCapacity: (capacity: number) => void;

  // Inventory & tools
  inventory: InventoryItem[];
  setInventory: (items: InventoryItem[]) => void;
  tools: string[];
  setTools: (tools: string[]) => void;
  activeHotbarSlot: number;
  setActiveHotbarSlot: (slot: number) => void;

  // Tilled tiles
  tilledTiles: { tile_x: number; tile_y: number; tilled_at: string }[];
  setTilledTiles: (tiles: { tile_x: number; tile_y: number; tilled_at: string }[]) => void;
  addTilledTile: (tile: { tile_x: number; tile_y: number; tilled_at: string }) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  gameState: 'menu',
  isLoading: false,
  error: null,
  setGameState: (state) => set({ gameState: state }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  playerPosition: { tile_x: 0, tile_y: 0, facing: 'down' },
  setPlayerPosition: (pos) => set({ playerPosition: pos }),
  crops: [],
  setCrops: (crops) => set({ crops }),

  // Player data
  username: 'Farmer',
  setUsername: (name) => set({ username: name }),
  coins: 100,
  setCoins: (coins) => set({ coins }),
  level: 1,
  setLevel: (level) => set({ level }),
  waterCapacity: 0,
  setWaterCapacity: (capacity) => set({ waterCapacity: capacity }),

  // Inventory & tools
  inventory: [],
  setInventory: (items) => set({ inventory: items }),
  tools: ['hoe', 'watering_can'],
  setTools: (tools) => set({ tools }),
  activeHotbarSlot: 0,
  setActiveHotbarSlot: (slot) => set({ activeHotbarSlot: slot }),

  // Tilled tiles
  tilledTiles: [],
  setTilledTiles: (tiles) => set({ tilledTiles: tiles }),
  addTilledTile: (tile) => set((s) => ({ tilledTiles: [...s.tilledTiles, tile] })),
}));

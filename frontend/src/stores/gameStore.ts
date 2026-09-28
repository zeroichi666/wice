import { create } from 'zustand';
import type { GameState, Crop } from '../types';

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
}));

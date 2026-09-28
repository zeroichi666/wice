import apiClient from './client';

export const gameApi = {
  // Get full game state
  getState: () => apiClient.get('/game/state'),

  // Get world data
  getWorld: () => apiClient.get('/game/world'),

  // Till a tile
  till: (tile_x: number, tile_y: number) =>
    apiClient.post('/game/till', { tile_x, tile_y }),

  // Get tilled tiles
  getTilledTiles: () => apiClient.get('/game/tilled'),

  // Plant a seed
  plant: (tile_x: number, tile_y: number, seed_code: string) =>
    apiClient.post('/game/plant', { tile_x, tile_y, seed_code }),

  // Water
  refillWater: () => apiClient.post('/game/refill-water'),
  water: (tile_x: number, tile_y: number) =>
    apiClient.post('/game/water', { tile_x, tile_y }),
};

export default gameApi;

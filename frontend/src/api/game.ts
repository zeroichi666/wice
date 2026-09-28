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
};

export default gameApi;

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

  // Harvest
  harvest: (tile_x: number, tile_y: number) =>
    apiClient.post('/game/harvest', { tile_x, tile_y }),

  // Shop
  getShopItems: () => apiClient.get('/shop/items'),
  buyItem: (item_code: string, quantity: number) =>
    apiClient.post('/shop/buy', { item_code, quantity }),
  sellItem: (item_code: string, quantity: number) =>
    apiClient.post('/shop/sell', { item_code, quantity }),
};

export default gameApi;

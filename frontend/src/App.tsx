import { useCallback } from 'react';
import GameCanvas from './game/GameCanvas';
import { HUD, Hotbar, InventoryPanel, ShopPanel, SeedMenu, ToastNotifications } from './ui';
import { useUiStore } from './stores/uiStore';
import { useGameStore } from './stores/gameStore';
import gameApi from './api/game';

function App() {
  const isSeedMenuOpen = useUiStore((s) => s.isSeedMenuOpen);
  const seedMenuTile = useUiStore((s) => s.seedMenuTile);
  const setSeedMenuOpen = useUiStore((s) => s.setSeedMenuOpen);
  const setSeedMenuTile = useUiStore((s) => s.setSeedMenuTile);
  const addNotification = useUiStore((s) => s.addNotification);

  const handleSeedSelect = useCallback(async (seedCode: string) => {
    if (!seedMenuTile) return;

    try {
      const response = await gameApi.plant(seedMenuTile.x, seedMenuTile.y, seedCode);
      const data = response.data;

      if (data.success) {
        // Add crop to store
        const crops = useGameStore.getState().crops;
        useGameStore.getState().setCrops([
          ...crops,
          {
            id: String(data.data.crop_id),
            type: data.data.item_code,
            position: { x: seedMenuTile.x, y: seedMenuTile.y },
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

        addNotification(data.message, 'success');
      } else {
        addNotification(data.message || 'Gagal menanam', 'error');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Gagal menanam bibit';
      addNotification(message, 'error');
    }

    setSeedMenuOpen(false);
    setSeedMenuTile(null);
  }, [seedMenuTile, setSeedMenuOpen, setSeedMenuTile, addNotification]);

  const handleSeedCancel = useCallback(() => {
    setSeedMenuOpen(false);
    setSeedMenuTile(null);
  }, [setSeedMenuOpen, setSeedMenuTile]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-900 relative">
      <GameCanvas />
      <HUD />
      <Hotbar />
      <InventoryPanel />
      <ShopPanel />
      {isSeedMenuOpen && (
        <SeedMenu onSelect={handleSeedSelect} onCancel={handleSeedCancel} />
      )}
      <ToastNotifications />
    </div>
  );
}

export default App;

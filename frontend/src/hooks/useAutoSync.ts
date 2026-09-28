import { useEffect, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';
import gameApi from '../api/game';

const SYNC_INTERVAL = 10000; // 10 seconds

export function useAutoSync() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gameState = useGameStore((s) => s.gameState);

  const syncState = async () => {
    try {
      const response = await gameApi.getState();
      if (response.data.success) {
        const data = response.data.data;
        
        if (data.user) {
          useGameStore.getState().setCoins(data.user.coins || 0);
          useGameStore.getState().setLevel(data.user.level || 1);
          useGameStore.getState().setWaterCapacity(data.user.water_capacity || 0);
        }

        if (data.inventory) {
          useGameStore.getState().setInventory(data.inventory);
        }

        if (data.crops) {
          useGameStore.getState().setCrops(data.crops);
        }
      }
    } catch (error) {
      console.error('Auto-sync failed:', error);
    }
  };

  useEffect(() => {
    // Only sync when game is playing
    if (gameState !== 'playing') {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initial sync
    syncState();

    // Set up interval
    intervalRef.current = setInterval(syncState, SYNC_INTERVAL);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [gameState]);

  // Refetch on window focus
  useEffect(() => {
    const handleFocus = () => {
      if (gameState === 'playing') {
        syncState();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [gameState]);

  return { syncState };
}

export default useAutoSync;

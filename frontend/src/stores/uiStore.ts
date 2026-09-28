import { create } from 'zustand';
import type { Notification } from '../types';

interface UiStore {
  isInventoryOpen: boolean;
  toggleInventory: () => void;
  setInventoryOpen: (open: boolean) => void;

  isShopOpen: boolean;
  toggleShop: () => void;
  setShopOpen: (open: boolean) => void;

  shopTab: 'buy' | 'sell';
  setShopTab: (tab: 'buy' | 'sell') => void;

  notifications: Notification[];
  addNotification: (message: string, type: Notification['type']) => void;
  removeNotification: (id: string) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  isInventoryOpen: false,
  toggleInventory: () => set((s) => ({ isInventoryOpen: !s.isInventoryOpen, isShopOpen: false })),
  setInventoryOpen: (open) => set({ isInventoryOpen: open }),

  isShopOpen: false,
  toggleShop: () => set((s) => ({ isShopOpen: !s.isShopOpen, isInventoryOpen: false })),
  setShopOpen: (open) => set({ isShopOpen: open }),

  shopTab: 'buy',
  setShopTab: (tab) => set({ shopTab: tab }),

  notifications: [],
  addNotification: (message, type) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    const notification: Notification = { id, message, type, timestamp: Date.now() };
    set((s) => ({ notifications: [...s.notifications, notification] }));
    // Auto dismiss after 3 seconds
    setTimeout(() => {
      set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) }));
    }, 3000);
  },
  removeNotification: (id) => set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),
}));

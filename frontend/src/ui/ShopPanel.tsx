import { useEffect, useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { useUiStore } from '../stores/uiStore';
import type { InventoryItem } from '../types';

const shopItems: { item_code: string; name: string; type: 'seed' | 'crop'; buy_price: number; sell_price: number; icon: string }[] = [
  { item_code: 'carrot_seed', name: 'Carrot Seed', type: 'seed', buy_price: 10, sell_price: 5, icon: '🥕' },
  { item_code: 'potato_seed', name: 'Potato Seed', type: 'seed', buy_price: 15, sell_price: 8, icon: '🥔' },
  { item_code: 'tomato_seed', name: 'Tomato Seed', type: 'seed', buy_price: 20, sell_price: 10, icon: '🍅' },
  { item_code: 'wheat_seed', name: 'Wheat Seed', type: 'seed', buy_price: 5, sell_price: 3, icon: '🌾' },
  { item_code: 'corn_seed', name: 'Corn Seed', type: 'seed', buy_price: 25, sell_price: 12, icon: '🌽' },
];

export default function ShopPanel() {
  const isShopOpen = useUiStore((s) => s.isShopOpen);
  const toggleShop = useUiStore((s) => s.toggleShop);
  const shopTab = useUiStore((s) => s.shopTab);
  const setShopTab = useUiStore((s) => s.setShopTab);
  const addNotification = useUiStore((s) => s.addNotification);
  const coins = useGameStore((s) => s.coins);
  const setCoins = useGameStore((s) => s.setCoins);
  const inventory = useGameStore((s) => s.inventory);
  const setInventory = useGameStore((s) => s.setInventory);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isShopOpen) {
        toggleShop();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isShopOpen, toggleShop]);

  if (!isShopOpen) return null;

  const handleBuy = (item: typeof shopItems[0]) => {
    const qty = quantities[item.item_code] || 1;
    const totalCost = item.buy_price * qty;

    if (coins < totalCost) {
      addNotification('Koin tidak cukup!', 'error');
      return;
    }

    setCoins(coins - totalCost);

    // Update inventory
    const existing = inventory.find((i) => i.item_code === item.item_code);
    if (existing) {
      setInventory(
        inventory.map((i) =>
          i.item_code === item.item_code ? { ...i, quantity: i.quantity + qty } : i
        )
      );
    } else {
      const newItem: InventoryItem = {
        id: Date.now().toString(),
        item_code: item.item_code,
        name: item.name,
        quantity: qty,
        type: item.type,
        buy_price: item.buy_price,
        sell_price: item.sell_price,
      };
      setInventory([...inventory, newItem]);
    }

    addNotification(`Membeli ${qty}x ${item.name}`, 'success');
    setQuantities({ ...quantities, [item.item_code]: 1 });
  };

  const handleSell = (item: InventoryItem) => {
    const qty = quantities[item.item_code] || 1;
    if (item.quantity < qty) {
      addNotification('Tidak cukup!', 'error');
      return;
    }

    const sellPrice = shopItems.find((s) => s.item_code === item.item_code)?.sell_price || 0;
    const total = sellPrice * qty;

    setCoins(coins + total);

    if (item.quantity <= qty) {
      setInventory(inventory.filter((i) => i.item_code !== item.item_code));
    } else {
      setInventory(
        inventory.map((i) =>
          i.item_code === item.item_code ? { ...i, quantity: i.quantity - qty } : i
        )
      );
    }

    addNotification(`Menjual ${qty}x ${item.name} seharga 💰${total}`, 'success');
    setQuantities({ ...quantities, [item.item_code]: 1 });
  };

  const handleSellAll = () => {
    const harvestItems = inventory.filter((i) => i.type === 'crop');
    if (harvestItems.length === 0) {
      addNotification('Tidak ada hasil panen untuk dijual!', 'error');
      return;
    }

    let totalEarned = 0;
    const newInventory = [...inventory];

    harvestItems.forEach((item) => {
      const sellPrice = shopItems.find((s) => s.item_code === item.item_code)?.sell_price || 0;
      totalEarned += sellPrice * item.quantity;
    });

    setCoins(coins + totalEarned);
    setInventory(newInventory.filter((i) => i.type !== 'crop'));
    addNotification(`Menjual semua panen seharga 💰${totalEarned}`, 'success');
  };

  const harvestItems = inventory.filter((i) => i.type === 'crop');

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/40 font-pixel select-none z-50">
      <div className="bg-gray-900 border-4 border-pixel-brown rounded-lg p-4 w-[420px] max-h-[380px]">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-white text-xs">🏪 Toko</h2>
          <div className="flex items-center gap-2">
            <span className="text-[8px] text-yellow-400">💰 {coins.toLocaleString()}</span>
            <button
              onClick={toggleShop}
              className="text-red-400 text-[8px] hover:text-red-300"
            >
              [ESC]
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-3">
          <button
            onClick={() => setShopTab('buy')}
            className={`flex-1 text-[8px] py-1 border-2 rounded ${
              shopTab === 'buy'
                ? 'border-pixel-green bg-green-900/50 text-white'
                : 'border-gray-600 text-gray-400'
            }`}
          >
            🛒 Beli
          </button>
          <button
            onClick={() => setShopTab('sell')}
            className={`flex-1 text-[8px] py-1 border-2 rounded ${
              shopTab === 'sell'
                ? 'border-pixel-green bg-green-900/50 text-white'
                : 'border-gray-600 text-gray-400'
            }`}
          >
            💰 Jual
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[250px] overflow-y-auto">
          {shopTab === 'buy' ? (
            <div className="flex flex-col gap-1">
              {shopItems.map((item) => {
                const qty = quantities[item.item_code] || 1;
                return (
                  <div
                    key={item.item_code}
                    className="flex items-center gap-2 bg-black/50 border border-gray-700 rounded p-2"
                  >
                    <span className="text-lg">{item.icon}</span>
                    <div className="flex-1">
                      <div className="text-[8px] text-white">{item.name}</div>
                      <div className="text-[7px] text-yellow-400">💰 {item.buy_price}/pcs</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setQuantities({ ...quantities, [item.item_code]: Math.max(1, qty - 1) })}
                        className="w-5 h-5 bg-gray-700 hover:bg-gray-600 rounded text-[8px] text-white"
                      >
                        -
                      </button>
                      <span className="text-[8px] text-white w-4 text-center">{qty}</span>
                      <button
                        onClick={() => setQuantities({ ...quantities, [item.item_code]: qty + 1 })}
                        className="w-5 h-5 bg-gray-700 hover:bg-gray-600 rounded text-[8px] text-white"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => handleBuy(item)}
                      className="bg-green-700 hover:bg-green-600 text-white text-[7px] px-2 py-1 rounded"
                    >
                      Beli
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div>
              {harvestItems.length === 0 ? (
                <div className="text-center text-gray-500 text-[8px] py-8">
                  Tidak ada hasil panen
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {harvestItems.map((item) => {
                    const qty = quantities[item.item_code] || 1;
                    const sellPrice = shopItems.find((s) => s.item_code === item.item_code)?.sell_price || 0;
                    return (
                      <div
                        key={item.item_code}
                        className="flex items-center gap-2 bg-black/50 border border-gray-700 rounded p-2"
                      >
                        <span className="text-lg">
                          {shopItems.find((s) => s.item_code === item.item_code)?.icon || '📦'}
                        </span>
                        <div className="flex-1">
                          <div className="text-[8px] text-white">{item.name}</div>
                          <div className="text-[7px] text-yellow-400">
                            💰 {sellPrice}/pcs (Qty: {item.quantity})
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setQuantities({ ...quantities, [item.item_code]: Math.max(1, qty - 1) })}
                            className="w-5 h-5 bg-gray-700 hover:bg-gray-600 rounded text-[8px] text-white"
                          >
                            -
                          </button>
                          <span className="text-[8px] text-white w-4 text-center">{qty}</span>
                          <button
                            onClick={() => setQuantities({ ...quantities, [item.item_code]: Math.min(item.quantity, qty + 1) })}
                            className="w-5 h-5 bg-gray-700 hover:bg-gray-600 rounded text-[8px] text-white"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => handleSell(item)}
                          className="bg-yellow-700 hover:bg-yellow-600 text-white text-[7px] px-2 py-1 rounded"
                        >
                          Jual
                        </button>
                      </div>
                    );
                  })}
                  <button
                    onClick={handleSellAll}
                    className="mt-2 w-full bg-red-700 hover:bg-red-600 text-white text-[8px] py-2 rounded"
                  >
                    💰 Jual Semua
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { useUiStore } from '../stores/uiStore';
import type { InventoryItem } from '../types';

const slotIcons: Record<string, string> = {
  hoe: '🪓',
  watering_can: '💧',
  carrot_seed: '🥕',
  potato_seed: '🥔',
  tomato_seed: '🍅',
  wheat_seed: '🌾',
  corn_seed: '🌽',
  carrot: '🥕',
  potato: '🥔',
  tomato: '🍅',
  wheat: '🌾',
  corn: '🌽',
};

export default function InventoryPanel() {
  const isInventoryOpen = useUiStore((s) => s.isInventoryOpen);
  const toggleInventory = useUiStore((s) => s.toggleInventory);
  const addNotification = useUiStore((s) => s.addNotification);
  const inventory = useGameStore((s) => s.inventory);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'i' || e.key === 'I' || e.key === 'Escape') {
        if (isInventoryOpen) toggleInventory();
        else if (e.key !== 'Escape') toggleInventory();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isInventoryOpen, toggleInventory]);

  if (!isInventoryOpen) return null;

  const handleUse = (item: InventoryItem) => {
    if (item.type === 'seed') {
      addNotification(`Menanam ${item.name}...`, 'success');
    } else if (item.type === 'tool') {
      addNotification(`Menggunakan ${item.name}`, 'info');
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/40 font-pixel select-none z-50">
      <div className="bg-gray-900 border-4 border-pixel-brown rounded-lg p-4 w-[400px] max-h-[350px]">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-white text-xs">📦 Inventory</h2>
          <button
            onClick={toggleInventory}
            className="text-red-400 text-[8px] hover:text-red-300"
          >
            [ESC]
          </button>
        </div>

        <div className="flex gap-3">
          {/* Item Grid */}
          <div className="grid grid-cols-5 gap-1 flex-1">
            {Array(20).fill(null).map((_, i) => {
              const item = inventory[i];
              const isSelected = selectedItem?.id === item?.id;
              return (
                <button
                  key={i}
                  onClick={() => item && setSelectedItem(item)}
                  className={`
                    w-12 h-12 border-2 rounded flex flex-col items-center justify-center
                    ${isSelected ? 'border-pixel-green bg-green-900/50' : 'border-gray-700 bg-black/50'}
                    ${item ? 'hover:border-pixel-brown' : ''}
                  `}
                >
                  {item ? (
                    <>
                      <span className="text-lg leading-none">
                        {slotIcons[item.item_code] || '📦'}
                      </span>
                      <span className="text-[6px] text-gray-400">{item.quantity}</span>
                    </>
                  ) : (
                    <span className="text-gray-700 text-xs">·</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Detail Panel */}
          {selectedItem && (
            <div className="w-32 bg-black/50 border-2 border-gray-700 rounded p-2 flex flex-col gap-1">
              <div className="text-lg text-center">
                {slotIcons[selectedItem.item_code] || '📦'}
              </div>
              <div className="text-[8px] text-white text-center font-bold">
                {selectedItem.name}
              </div>
              <div className="text-[7px] text-gray-400 text-center">
                {selectedItem.type}
              </div>
              <div className="text-[7px] text-gray-400 text-center">
                Qty: {selectedItem.quantity}
              </div>
              {selectedItem.buy_price && (
                <div className="text-[7px] text-yellow-400 text-center">
                  Harga: 💰{selectedItem.buy_price}
                </div>
              )}

              {/* Actions */}
              <div className="mt-auto flex flex-col gap-1">
                {selectedItem.type === 'seed' && (
                  <button
                    onClick={() => handleUse(selectedItem)}
                    className="bg-green-700 hover:bg-green-600 text-white text-[7px] py-1 rounded"
                  >
                    🌱 Tanam
                  </button>
                )}
                {selectedItem.type === 'tool' && (
                  <button
                    onClick={() => handleUse(selectedItem)}
                    className="bg-blue-700 hover:bg-blue-600 text-white text-[7px] py-1 rounded"
                  >
                    ✋ Pakai
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

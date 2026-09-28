import { useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import type { InventoryItem } from '../types';

const slotIcons: Record<string, string> = {
  hoe: '🪓',
  watering_can: '💧',
  axe: '🪓',
  pickaxe: '⛏️',
  fishing_rod: '🎣',
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

export default function Hotbar() {
  const inventory = useGameStore((s) => s.inventory);
  const activeHotbarSlot = useGameStore((s) => s.activeHotbarSlot);
  const setActiveHotbarSlot = useGameStore((s) => s.setActiveHotbarSlot);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const num = parseInt(e.key);
      if (num >= 1 && num <= 9) {
        setActiveHotbarSlot(num - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveHotbarSlot]);

  const slots: (InventoryItem | null)[] = Array(9).fill(null);
  inventory.slice(0, 9).forEach((item, i) => {
    slots[i] = item;
  });

  return (
    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 font-pixel select-none">
      <div className="flex gap-1">
        {slots.map((item, i) => (
          <button
            key={i}
            onClick={() => setActiveHotbarSlot(i)}
            className={`
              w-10 h-10 border-2 rounded flex flex-col items-center justify-center
              ${i === activeHotbarSlot
                ? 'border-pixel-green bg-green-900/80 scale-110'
                : 'border-gray-600 bg-black/70'
              }
              hover:border-pixel-brown transition-transform
            `}
          >
            {item ? (
              <>
                <span className="text-lg leading-none">
                  {slotIcons[item.item_code] || '📦'}
                </span>
                {item.quantity > 1 && (
                  <span className="text-[6px] text-white absolute bottom-0.5 right-0.5">
                    {item.quantity}
                  </span>
                )}
              </>
            ) : (
              <span className="text-gray-600 text-[6px]">{i + 1}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

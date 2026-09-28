import { useGameStore } from '../stores/gameStore';

const seedIcons: Record<string, string> = {
  carrot_seed: '🥕',
  potato_seed: '🥔',
  tomato_seed: '🍅',
  wheat_seed: '🌾',
  corn_seed: '🌽',
};

interface SeedMenuProps {
  onSelect: (seedCode: string) => void;
  onCancel: () => void;
}

export default function SeedMenu({ onSelect, onCancel }: SeedMenuProps) {
  const inventory = useGameStore((s) => s.inventory);
  const seeds = inventory.filter((item) => item.type === 'seed' && item.quantity > 0);

  if (seeds.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/40 font-pixel select-none z-50">
        <div className="bg-gray-900 border-4 border-pixel-brown rounded-lg p-4 w-[250px]">
          <div className="text-white text-[8px] text-center mb-3">Tidak ada bibit</div>
          <button
            onClick={onCancel}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white text-[8px] py-2 rounded"
          >
            [ESC] Tutup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/40 font-pixel select-none z-50">
      <div className="bg-gray-900 border-4 border-pixel-brown rounded-lg p-4 w-[300px]">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-white text-[10px]">🌱 Pilih Bibit</h3>
          <button
            onClick={onCancel}
            className="text-red-400 text-[8px] hover:text-red-300"
          >
            [ESC]
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {seeds.map((seed) => (
            <button
              key={seed.item_code}
              onClick={() => onSelect(seed.item_code)}
              className="flex flex-col items-center gap-1 bg-black/50 border-2 border-gray-700 hover:border-pixel-green rounded p-2 transition-colors"
            >
              <span className="text-xl">{seedIcons[seed.item_code] || '🌱'}</span>
              <span className="text-[7px] text-white">{seed.name}</span>
              <span className="text-[6px] text-gray-400">x{seed.quantity}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

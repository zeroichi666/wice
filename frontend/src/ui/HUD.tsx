import { useGameStore } from '../stores/gameStore';

const toolIcons: Record<string, string> = {
  hoe: '🪓',
  watering_can: '💧',
  axe: '🪓',
  pickaxe: '⛏️',
  fishing_rod: '🎣',
};

export default function HUD() {
  const username = useGameStore((s) => s.username);
  const coins = useGameStore((s) => s.coins);
  const level = useGameStore((s) => s.level);
  const waterCapacity = useGameStore((s) => s.waterCapacity);
  const tools = useGameStore((s) => s.tools);
  const activeHotbarSlot = useGameStore((s) => s.activeHotbarSlot);
  const inventory = useGameStore((s) => s.inventory);

  const activeItem = inventory[activeHotbarSlot];
  const activeTool = activeItem?.type === 'tool' ? activeItem.name.toLowerCase().replace(/\s+/g, '_') : tools[0];
  const toolIcon = toolIcons[activeTool] || '🔨';

  return (
    <div className="absolute top-2 left-2 font-pixel text-[8px] text-white select-none pointer-events-none">
      {/* Username & Level */}
      <div className="bg-black/60 border-2 border-pixel-brown rounded px-2 py-1 mb-1">
        <span className="text-pixel-green">{username}</span>
        <span className="text-gray-400 ml-2">Lv.{level}</span>
      </div>

      {/* Coins */}
      <div className="bg-black/60 border-2 border-pixel-brown rounded px-2 py-1 mb-1 flex items-center gap-1">
        <span>💰</span>
        <span className="text-yellow-400">{coins.toLocaleString()}</span>
      </div>

      {/* Active Tool */}
      <div className="bg-black/60 border-2 border-pixel-brown rounded px-2 py-1 mb-1 flex items-center gap-1">
        <span>{toolIcon}</span>
        <span className="text-gray-300">{activeTool?.replace(/_/g, ' ')}</span>
      </div>

      {/* Water Capacity (only when watering_can is active) */}
      {activeTool === 'watering_can' && (
        <div className="bg-black/60 border-2 border-blue-500 rounded px-2 py-1 flex items-center gap-1">
          <span>💧</span>
          <span className="text-blue-400">{waterCapacity}/5</span>
        </div>
      )}
    </div>
  );
}

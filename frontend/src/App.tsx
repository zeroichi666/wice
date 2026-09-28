import GameCanvas from './game/GameCanvas';
import { HUD, Hotbar, InventoryPanel, ShopPanel, ToastNotifications } from './ui';

function App() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-900 relative">
      <GameCanvas />
      <HUD />
      <Hotbar />
      <InventoryPanel />
      <ShopPanel />
      <ToastNotifications />
    </div>
  );
}

export default App;

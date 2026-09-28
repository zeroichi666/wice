import { useEffect, useState } from 'react';
import { useUiStore } from '../stores/uiStore';
import { useGameStore } from '../stores/gameStore';

export default function SettingsPanel() {
  const isSettingsOpen = useUiStore((s) => s.isSettingsOpen);
  const setSettingsOpen = useUiStore((s) => s.setSettingsOpen);
  const addNotification = useUiStore((s) => s.addNotification);
  
  const [bgmVolume, setBgmVolume] = useState(() => {
    return parseInt(localStorage.getItem('bgmVolume') || '70');
  });
  const [sfxVolume, setSfxVolume] = useState(() => {
    return parseInt(localStorage.getItem('sfxVolume') || '80');
  });
  const [showHints, setShowHints] = useState(() => {
    return localStorage.getItem('showHints') !== 'false';
  });

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSettingsOpen) {
        setSettingsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isSettingsOpen, setSettingsOpen]);

  if (!isSettingsOpen) return null;

  const handleSave = () => {
    localStorage.setItem('bgmVolume', String(bgmVolume));
    localStorage.setItem('sfxVolume', String(sfxVolume));
    localStorage.setItem('showHints', String(showHints));
    addNotification('Pengaturan tersimpan', 'success');
    setSettingsOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    useGameStore.getState().setGameState('menu');
    addNotification('Logout berhasil', 'info');
    setSettingsOpen(false);
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 font-pixel select-none z-50">
      <div className="bg-gray-900 border-4 border-pixel-brown rounded-lg p-5 w-[300px]">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-[10px]">⚙️ Pengaturan</h2>
          <button
            onClick={() => setSettingsOpen(false)}
            className="text-red-400 text-[8px] hover:text-red-300"
          >
            [ESC]
          </button>
        </div>

        {/* Settings */}
        <div className="flex flex-col gap-4">
          {/* BGM Volume */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[8px] text-gray-300">🎵 Volume BGM</span>
              <span className="text-[8px] text-yellow-400">{bgmVolume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={bgmVolume}
              onChange={(e) => setBgmVolume(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pixel-green"
            />
          </div>

          {/* SFX Volume */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[8px] text-gray-300">🔊 Volume SFX</span>
              <span className="text-[8px] text-yellow-400">{sfxVolume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sfxVolume}
              onChange={(e) => setSfxVolume(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pixel-green"
            />
          </div>

          {/* Show Hints */}
          <div className="flex justify-between items-center">
            <span className="text-[8px] text-gray-300">💡 Tampilkan Hint</span>
            <button
              onClick={() => setShowHints(!showHints)}
              className={`w-10 h-5 rounded-full transition-colors ${
                showHints ? 'bg-pixel-green' : 'bg-gray-600'
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transform transition-transform ${
                  showHints ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-700" />

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full bg-red-700 hover:bg-red-600 text-white text-[8px] py-2 rounded"
          >
            🚪 Logout
          </button>

          {/* Save */}
          <button
            onClick={handleSave}
            className="w-full bg-pixel-green hover:bg-green-400 text-gray-900 text-[8px] py-2 rounded font-bold"
          >
            💾 Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

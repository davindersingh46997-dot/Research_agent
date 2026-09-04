import React, { useState } from 'react';
import { Menu, Settings, Volume2, VolumeX, Info } from 'lucide-react';

interface HeaderProps {
  onMenuToggle: () => void;
  voiceEnabled: boolean;
  onVoiceToggle: () => void;
  sessionTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onMenuToggle,
  voiceEnabled,
  onVoiceToggle,
  sessionTitle = 'Research Agent',
}) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <header className="bg-dark-800 border-b border-dark-700 px-4 py-3">
      <div className="flex items-center justify-between max-w-full mx-auto">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="p-2 hover:bg-dark-700 rounded-lg transition-colors text-dark-200"
            title="Toggle sidebar"
          >
            <Menu size={20} />
          </button>
          <div className="hidden md:block">
            <h1 className="text-lg font-semibold text-dark-100">
              {sessionTitle}
            </h1>
            <p className="text-xs text-dark-400">Powered by AI</p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Info Button */}
          <div className="relative">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-2 hover:bg-dark-700 rounded-lg transition-colors text-dark-300 hover:text-dark-100"
              title="Information"
            >
              <Info size={20} />
            </button>
            {showInfo && (
              <div className="absolute right-0 mt-2 w-64 bg-dark-800 rounded-lg shadow-xl border border-dark-700 p-4 z-50 text-sm text-dark-300">
                <h3 className="font-semibold text-dark-100 mb-2">About Research Agent</h3>
                <ul className="space-y-2 text-xs">
                  <li><span className="text-primary-400">🎯</span> Ask any research question</li>
                  <li><span className="text-primary-400">🎤</span> Use voice for hands-free input</li>
                  <li><span className="text-primary-400">📚</span> Enable RAG to reference documents</li>
                  <li><span className="text-primary-400">💾</span> Chat history is auto-saved locally</li>
                </ul>
              </div>
            )}
          </div>

          {/* Voice Toggle */}
          <button
            onClick={onVoiceToggle}
            className={`p-2 rounded-lg transition-colors ${
              voiceEnabled
                ? 'bg-primary-900/30 text-primary-400 hover:bg-primary-900/50'
                : 'hover:bg-dark-700 text-dark-400 hover:text-dark-300'
            }`}
            title={voiceEnabled ? 'Voice enabled' : 'Voice disabled'}
          >
            {voiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>

          {/* Settings */}
          <button
            className="p-2 hover:bg-dark-700 rounded-lg transition-colors text-dark-400 hover:text-dark-100"
            title="Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

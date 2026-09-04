import React, { useState } from 'react';
import { RAGConfig } from '@/types/index';
import { ChevronDown, BookOpen, Globe, Settings } from 'lucide-react';

interface RAGOptionsProps {
  ragConfig: RAGConfig;
  onConfigChange: (config: RAGConfig) => void;
}

export const RAGOptions: React.FC<RAGOptionsProps> = ({ ragConfig, onConfigChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleRAG = () => {
    onConfigChange({ ...ragConfig, enabled: !ragConfig.enabled });
  };

  const handleSourceTypeChange = (sourceType: 'documents' | 'web' | 'both') => {
    onConfigChange({ ...ragConfig, sourceType });
  };

  const handleMaxSourcesChange = (maxSources: number) => {
    onConfigChange({ ...ragConfig, maxSources });
  };

  const handleThresholdChange = (threshold: number) => {
    onConfigChange({ ...ragConfig, relevanceThreshold: threshold });
  };

  return (
    <div className="border-b border-dark-700 bg-dark-800/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-dark-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BookOpen size={18} className={ragConfig.enabled ? 'text-blue-400' : 'text-dark-500'} />
          <span className="text-sm font-medium text-dark-200">
            RAG Options
            {ragConfig.enabled && <span className="ml-2 text-xs text-blue-400">(Active)</span>}
          </span>
        </div>
        <ChevronDown
          size={18}
          className={`transition-transform text-dark-400 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="px-4 py-4 space-y-4 bg-dark-800">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-dark-300">Enable RAG</span>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={ragConfig.enabled}
                onChange={handleToggleRAG}
                className="sr-only"
              />
              <div className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                ragConfig.enabled ? 'bg-blue-600' : 'bg-dark-600'
              }`}>
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform mt-1 ${
                    ragConfig.enabled ? 'translate-x-6 ml-1' : 'translate-x-1'
                  }`}
                />
              </div>
            </label>
          </div>

          {ragConfig.enabled && (
            <>
              {/* Source Type */}
              <div>
                <label className="block text-sm text-dark-300 mb-2 flex items-center gap-1">
                  <Globe size={14} />
                  Source Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['documents', 'web', 'both'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => handleSourceTypeChange(type)}
                      className={`px-3 py-2 rounded text-sm transition-colors capitalize ${
                        ragConfig.sourceType === type
                          ? 'bg-blue-600 text-white'
                          : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Sources */}
              <div>
                <label className="block text-sm text-dark-300 mb-2">
                  Max Sources: <span className="text-primary-400 font-semibold">{ragConfig.maxSources}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={ragConfig.maxSources}
                  onChange={(e) => handleMaxSourcesChange(parseInt(e.target.value))}
                  className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
                <div className="flex justify-between text-xs text-dark-500 mt-1">
                  <span>1</span>
                  <span>10</span>
                </div>
              </div>

              {/* Relevance Threshold */}
              <div>
                <label className="block text-sm text-dark-300 mb-2">
                  Relevance Threshold: <span className="text-primary-400 font-semibold">{(ragConfig.relevanceThreshold * 100).toFixed(0)}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={ragConfig.relevanceThreshold * 100}
                  onChange={(e) => handleThresholdChange(parseInt(e.target.value) / 100)}
                  className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
                <div className="flex justify-between text-xs text-dark-500 mt-1">
                  <span>Low (0%)</span>
                  <span>High (100%)</span>
                </div>
              </div>

              {/* Additional Settings */}
              <div className="pt-2 border-t border-dark-700">
                <button className="flex items-center gap-2 text-sm text-dark-300 hover:text-primary-400 transition-colors">
                  <Settings size={14} />
                  Advanced Settings
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
